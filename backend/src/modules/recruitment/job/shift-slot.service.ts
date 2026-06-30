import mongoose, { type ClientSession } from "mongoose";
import { ShiftDateStatus } from "../../../common/enums/shiftDateStatus.enum.js";
import { ShiftSlotStatus } from "../../../common/enums/shiftSlotStatus.enum.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../utils/errors.js";
import { JobShiftDate } from "./model/jobShiftDate.model.js";
import { JobShiftSlot } from "./model/jobShiftSlot.model.js";

const ACTIVE_SLOT_STATUSES = [
  ShiftSlotStatus.AVAILABLE,
  ShiftSlotStatus.RESERVED,
  ShiftSlotStatus.ASSIGNED,
];

export async function syncShiftDateCapacity(
  shiftDateId: mongoose.Types.ObjectId,
  session?: ClientSession,
) {
  let assignedQuery = JobShiftSlot.countDocuments({
    shiftDateId,
    status: ShiftSlotStatus.ASSIGNED,
  });
  let reservedQuery = JobShiftSlot.countDocuments({
    shiftDateId,
    status: ShiftSlotStatus.RESERVED,
  });
  let dateQuery = JobShiftDate.findById(shiftDateId);
  if (session) {
    assignedQuery = assignedQuery.session(session);
    reservedQuery = reservedQuery.session(session);
    dateQuery = dateQuery.session(session);
  }

  const [assignedCount, reservedCount, date] = await Promise.all([
    assignedQuery,
    reservedQuery,
    dateQuery,
  ]);

  if (!date) {
    throw new NotFoundError("Shift date not found");
  }

  const filled =
    assignedCount + reservedCount >= date.totalSlots &&
    date.isOpen &&
    date.status !== ShiftDateStatus.CLOSED;

  const updateOpts = session ? { session } : {};
  await JobShiftDate.updateOne(
    { _id: shiftDateId },
    {
      $set: {
        assignedCount,
        reservedCount,
        status: filled
          ? ShiftDateStatus.FULL
          : date.isOpen
            ? ShiftDateStatus.OPEN
            : date.status,
      },
    },
    updateOpts,
  );

  return { assignedCount, reservedCount, totalSlots: date.totalSlots };
}

/**
 * Tạo slot AVAILABLE cho đến đủ totalSlots (không overbook).
 */
export async function generateSlotsForShiftDate(shiftDateId: string) {
  const date = await JobShiftDate.findById(shiftDateId);
  if (!date) {
    throw new NotFoundError("Shift date not found");
  }

  if (date.status === ShiftDateStatus.CANCELLED) {
    throw new BadRequestError("Cannot generate slots for cancelled shift");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const activeCount = await JobShiftSlot.countDocuments({
      shiftDateId: date._id,
      status: { $in: ACTIVE_SLOT_STATUSES },
    }).session(session);

    if (activeCount > date.totalSlots) {
      throw new ConflictError(
        `Active slots (${activeCount}) exceed totalSlots (${date.totalSlots}). Adjust totalSlots first.`,
      );
    }

    const toCreate = date.totalSlots - activeCount;
    if (toCreate <= 0) {
      await syncShiftDateCapacity(date._id, session);
      await session.commitTransaction();
      return { created: 0, totalSlots: date.totalSlots };
    }

    const last = await JobShiftSlot.findOne({ shiftDateId: date._id })
      .sort({ slotNumber: -1 })
      .session(session);
    let nextNumber = last?.slotNumber ?? 0;

    const docs = [];
    for (let i = 0; i < toCreate; i++) {
      nextNumber += 1;
      docs.push({
        shiftDateId: date._id,
        jobId: date.jobId,
        jobPostingId: date.jobPostingId,
        slotNumber: nextNumber,
        status: ShiftSlotStatus.AVAILABLE,
        version: 0,
      });
    }

    await JobShiftSlot.insertMany(docs, { session });
    await syncShiftDateCapacity(date._id, session);
    await session.commitTransaction();

    return { created: toCreate, totalSlots: date.totalSlots };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * Gán worker vào slot — atomic, chống overbook & race condition.
 * Dùng findOneAndUpdate với điều kiện status AVAILABLE (+ optional version).
 */
export async function assignWorkerToSlot(params: {
  slotId: string;
  workerId: string;
  assignedBy: string;
  expectedVersion?: number;
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const filter: Record<string, unknown> = {
      _id: params.slotId,
      status: ShiftSlotStatus.AVAILABLE,
    };
    if (params.expectedVersion !== undefined) {
      filter.version = params.expectedVersion;
    }

    const slot = await JobShiftSlot.findOneAndUpdate(
      filter,
      {
        $set: {
          status: ShiftSlotStatus.ASSIGNED,
          workerId: params.workerId,
          assignedBy: params.assignedBy,
          assignedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { new: true, session },
    );

    if (!slot) {
      throw new ConflictError(
        "Slot is no longer available (another request may have taken it)",
      );
    }

    const duplicate = await JobShiftSlot.findOne({
      shiftDateId: slot.shiftDateId,
      workerId: params.workerId,
      status: { $in: [ShiftSlotStatus.ASSIGNED, ShiftSlotStatus.RESERVED] },
      _id: { $ne: slot._id },
    }).session(session);

    if (duplicate) {
      throw new ConflictError("Worker already has a slot on this shift date");
    }

    const date = await JobShiftDate.findById(slot.shiftDateId).session(session);
    if (!date) {
      throw new NotFoundError("Shift date not found");
    }

    if (!date.isOpen || date.status === ShiftDateStatus.CLOSED) {
      throw new BadRequestError("Shift date is not open for assignment");
    }

    const assignedCount = await JobShiftSlot.countDocuments({
      shiftDateId: date._id,
      status: ShiftSlotStatus.ASSIGNED,
    }).session(session);

    if (assignedCount > date.totalSlots) {
      throw new ConflictError("Overbook prevented: exceeds totalSlots");
    }

    await syncShiftDateCapacity(date._id, session);
    await session.commitTransaction();

    return slot;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * Worker apply — reserve slot (PENDING application flow).
 * Cùng atomic pattern với assign; sau này có thể gắn Application document.
 */
export async function reserveSlotForWorker(params: {
  slotId: string;
  workerId: string;
  expectedVersion?: number;
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const filter: Record<string, unknown> = {
      _id: params.slotId,
      status: ShiftSlotStatus.AVAILABLE,
    };
    if (params.expectedVersion !== undefined) {
      filter.version = params.expectedVersion;
    }

    const slot = await JobShiftSlot.findOneAndUpdate(
      filter,
      {
        $set: {
          status: ShiftSlotStatus.RESERVED,
          workerId: params.workerId,
        },
        $inc: { version: 1 },
      },
      { new: true, session },
    );

    if (!slot) {
      throw new ConflictError(
        "Slot is no longer available. Try another slot.",
      );
    }

    const date = await JobShiftDate.findById(slot.shiftDateId).session(session);
    if (!date?.isOpen) {
      throw new BadRequestError("Shift is closed");
    }

    const activeCount = await JobShiftSlot.countDocuments({
      shiftDateId: date._id,
      status: { $in: ACTIVE_SLOT_STATUSES },
    }).session(session);

    if (activeCount > date.totalSlots) {
      throw new ConflictError("Overbook prevented");
    }

    await syncShiftDateCapacity(date._id, session);
    await session.commitTransaction();

    return slot;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
