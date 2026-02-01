import mongoose, { Schema, Document } from 'mongoose';

export enum RelationshipType {
    FAVORITE = 'FAVORITE',     // Ưu tiên: Nhân viên ruột, làm tốt, thái độ ngoan
    NORMAL = 'NORMAL',         // Mặc định
    RESTRICTED = 'RESTRICTED', // "Dự bị": Làm kém, hay đi muộn -> Chỉ hiển thị khi bí người
    BLOCKED = 'BLOCKED'        // "Cấm cửa": Ăn cắp, phá hoại -> Chặn không cho nộp đơn
}

export interface IWorkerRelationship extends Document {
    organizationId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId; 

    type: RelationshipType;

    notes?: string; // Ghi chú nội bộ của Employer (VD: "Hay xin về sớm đón con, nhưng làm việc nhanh")

    tags?: string[]; // Tag nhanh (VD: #punctual, #lazy, #skilled)

    createdBy: mongoose.Types.ObjectId; 
}

const WorkerRelationshipSchema = new Schema<IWorkerRelationship>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        type: {
            type: String,
            enum: Object.values(RelationshipType),
            default: RelationshipType.NORMAL,
            required: true
        },

        notes: { type: String, trim: true },
        tags: [{ type: String, trim: true }],

        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true
    }
);

WorkerRelationshipSchema.index({ organizationId: 1, workerId: 1 }, { unique: true });
WorkerRelationshipSchema.index({ organizationId: 1, type: 1 });

export const WorkerRelationship = mongoose.model<IWorkerRelationship>('WorkerRelationship', WorkerRelationshipSchema);
