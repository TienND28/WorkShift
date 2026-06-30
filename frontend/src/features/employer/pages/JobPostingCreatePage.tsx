import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Copy,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { EmployerSidebar } from "@/components/layout/EmployerSidebar";
import {
  catalogApi,
  type CatalogItem,
  type PositionItem,
} from "@/lib/api/catalog.api";
import { employerApi } from "@/lib/api/employer.api";
import { organizationApi, type Organization } from "@/lib/api/organization.api";
import {
  jobPostingApi,
  type CreateJobPostingPayload,
  type GenderRequirement,
} from "@/lib/api/job-posting.api";

type DemandCell = {
  any: number;
  male: number;
  female: number;
};

type TemplateRow = {
  id: string;
  positionId: string;
  startTime: string;
  endTime: string;
  salary: number;
  cells: Record<string, DemandCell>;
};

type PostingForm = {
  title: string;
  description: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  requirements: string;
  benefits: string;
};

const emptyCell = (): DemandCell => ({ any: 0, male: 0, female: 0 });

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const formatDateHeader = (dateKey: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateKey}T00:00:00`));

const weekdayOf = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00Z`).getUTCDay();

const cellTotal = (cell: DemandCell) => cell.any + cell.male + cell.female;

const demandParts = [
  { key: "any", label: "Chung", shortLabel: "T" },
  { key: "male", label: "Nam", shortLabel: "Nam" },
  { key: "female", label: "Nữ", shortLabel: "Nữ" },
] as const;

const rowColors = ["bg-white", "bg-slate-50", "bg-zinc-50"];

function createInitialRows(todayKey: string): TemplateRow[] {
  return [
    {
      id: makeId(),
      positionId: "",
      startTime: "08:00",
      endTime: "16:00",
      salary: 300000,
      cells: { [todayKey]: emptyCell() },
    },
  ];
}

function formatMoney(value: number) {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function numberOrZero(value: string) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function makePostingPayload(form: PostingForm): CreateJobPostingPayload {
  return {
    title: form.title.trim(),
    ...(form.description.trim()
      ? { description: form.description.trim() }
      : {}),
    ...(form.address.trim() ||
    form.provinceId ||
    form.districtId ||
    form.wardId
      ? {
          location: {
            ...(form.address.trim() ? { address: form.address.trim() } : {}),
            ...(form.provinceId ? { provinceId: form.provinceId } : {}),
            ...(form.districtId ? { districtId: form.districtId } : {}),
            ...(form.wardId ? { wardId: form.wardId } : {}),
          },
        }
      : {}),
    ...(form.requirements.trim()
      ? { requirements: form.requirements.trim() }
      : {}),
    ...(form.benefits.trim() ? { benefits: form.benefits.trim() } : {}),
  };
}

export function JobPostingCreatePage() {
  const navigate = useNavigate();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const [dates, setDates] = useState<string[]>([todayKey]);
  const [rows, setRows] = useState<TemplateRow[]>(() =>
    createInitialRows(todayKey),
  );
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [districts, setDistricts] = useState<CatalogItem[]>([]);
  const [wards, setWards] = useState<CatalogItem[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<PostingForm>({
    title: "",
    description: "",
    address: "",
    provinceId: "",
    districtId: "",
    wardId: "",
    requirements: "",
    benefits: "",
  });

  const positionById = useMemo(
    () => new Map(positions.map((position) => [position.id, position])),
    [positions],
  );

  useEffect(() => {
    let mounted = true;

    Promise.all([
      catalogApi.getPositions(),
      organizationApi.listMine(),
      catalogApi.getProvinces(),
      employerApi.getProfile().catch(() => null),
    ])
      .then(([positionItems, orgItems, provinceItems, profile]) => {
        if (!mounted) return;
        setPositions(positionItems);
        setOrganizations(orgItems);
        setProvinces(provinceItems);
        const defaultOrg =
          profile?.defaultOrganizationId ?? orgItems[0]?.id ?? "";
        setOrganizationId(defaultOrg);
        const defaultOrganization = orgItems.find(
          (org) => org.id === defaultOrg,
        );
        if (defaultOrganization?.address) {
          setForm((current) => ({
            ...current,
            address: current.address || defaultOrganization.address,
            provinceId: defaultOrganization.provinceId,
            districtId: defaultOrganization.districtId,
            wardId: defaultOrganization.wardId,
          }));
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Không tải được dữ liệu.",
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    catalogApi.getDistricts(form.provinceId).then(setDistricts);
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      return;
    }

    catalogApi.getWards(form.districtId).then(setWards);
  }, [form.districtId]);

  const updateForm = (field: keyof PostingForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleOrganizationChange = (nextOrganizationId: string) => {
    setOrganizationId(nextOrganizationId);
    const nextOrganization = organizations.find(
      (organization) => organization.id === nextOrganizationId,
    );
    if (!nextOrganization) return;
    setForm((current) => ({
      ...current,
      address: nextOrganization.address,
      provinceId: nextOrganization.provinceId,
      districtId: nextOrganization.districtId,
      wardId: nextOrganization.wardId,
    }));
  };

  const updateRow = <K extends keyof TemplateRow>(
    rowId: string,
    field: K,
    value: TemplateRow[K],
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const updateCell = (
    rowId: string,
    dateKey: string,
    field: keyof DemandCell,
    value: number,
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const currentCell = row.cells[dateKey] ?? emptyCell();
        return {
          ...row,
          cells: {
            ...row.cells,
            [dateKey]: { ...currentCell, [field]: value },
          },
        };
      }),
    );
  };

  const addDate = () => {
    const nextDate = addDays(dates.at(-1) ?? todayKey, 1);
    setDates((current) => [...current, nextDate]);
    setRows((current) =>
      current.map((row) => ({
        ...row,
        cells: { ...row.cells, [nextDate]: emptyCell() },
      })),
    );
  };

  const removeDate = (dateKey: string) => {
    if (dates.length === 1) return;
    setDates((current) => current.filter((date) => date !== dateKey));
    setRows((current) =>
      current.map((row) => {
        const nextCells = { ...row.cells };
        delete nextCells[dateKey];
        return { ...row, cells: nextCells };
      }),
    );
  };

  const addRow = () => {
    const nextRow: TemplateRow = {
      id: makeId(),
      positionId: positions[0]?.id ?? "",
      startTime: "08:00",
      endTime: "16:00",
      salary: rows.at(-1)?.salary ?? 250000,
      cells: Object.fromEntries(dates.map((date) => [date, emptyCell()])),
    };
    setRows((current) => [...current, nextRow]);
  };

  const duplicateRow = (row: TemplateRow) => {
    setRows((current) => [
      ...current,
      {
        ...row,
        id: makeId(),
        cells: Object.fromEntries(
          dates.map((date) => [date, { ...(row.cells[date] ?? emptyCell()) }]),
        ),
      },
    ]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length === 1) return;
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const fillWeek = () => {
    const start = dates[0] ?? todayKey;
    const nextDates = Array.from({ length: 7 }, (_, index) =>
      addDays(start, index),
    );
    setDates(nextDates);
    setRows((current) =>
      current.map((row) => ({
        ...row,
        cells: Object.fromEntries(
          nextDates.map((date) => [date, row.cells[date] ?? emptyCell()]),
        ),
      })),
    );
  };

  const validate = () => {
    if (!organizationId) return "Cần chọn tổ chức để đăng tuyển.";
    if (form.title.trim().length < 3) return "Tiêu đề cần ít nhất 3 ký tự.";
    const validRows = rows.filter((row) => row.positionId);
    if (!validRows.length) return "Cần thêm ít nhất một bộ phận.";
    if (
      !validRows.some((row) =>
        dates.some((date) => cellTotal(row.cells[date] ?? emptyCell()) > 0),
      )
    ) {
      return "Cần nhập ít nhất một ô số lượng.";
    }
    if (
      validRows.some(
        (row) => !row.startTime || !row.endTime || row.startTime >= row.endTime,
      )
    ) {
      return "Khung giờ cần hợp lệ và giờ bắt đầu phải trước giờ kết thúc.";
    }
    if (validRows.some((row) => row.salary < 0))
      return "Mức lương không hợp lệ.";
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const posting = await jobPostingApi.create(
        organizationId,
        makePostingPayload(form),
      );

      const selectedPositionIds = Array.from(
        new Set(rows.map((row) => row.positionId).filter(Boolean)),
      );
      const createdJobs = await jobPostingApi.addJobs(
        organizationId,
        posting.id,
        {
          jobs: selectedPositionIds.map((positionId, index) => {
            const position = positionById.get(positionId);
            return {
              positionId,
              title: position?.name ?? "Bộ phận",
              sortOrder: index,
            };
          }),
        },
      );
      const jobByPosition = new Map(
        createdJobs.map((job) => [job.positionId, job]),
      );

      for (const row of rows) {
        const job = jobByPosition.get(row.positionId);
        if (!job) continue;

        for (const date of dates) {
          const cell = row.cells[date] ?? emptyCell();
          const entries: Array<[GenderRequirement, number, string]> = [
            ["ANY", cell.any, "Chung"],
            ["MALE", cell.male, "Nam"],
            ["FEMALE", cell.female, "Nữ"],
          ];

          for (const [genderRequirement, quantity, label] of entries) {
            if (quantity <= 0) continue;
            const template = await jobPostingApi.createShiftTemplate(
              organizationId,
              posting.id,
              job.id,
              {
                name: `${job.title} ${row.startTime}-${row.endTime} ${formatDateHeader(date)} ${label}`,
                weekdays: [weekdayOf(date)],
                startTime: row.startTime,
                endTime: row.endTime,
                salary: row.salary,
                slotsPerShift: quantity,
                genderRequirement,
                effectiveFrom: date,
                effectiveTo: date,
              },
            );
            await jobPostingApi.generateShiftDates(
              organizationId,
              posting.id,
              job.id,
              template.id,
              true,
            );
          }
        }
      }

      if (publishNow) {
        await jobPostingApi.publish(organizationId, posting.id);
      }

      setSuccess(
        publishNow
          ? "Đã tạo và xuất bản bài đăng."
          : "Đã lưu bài đăng ở trạng thái nháp.",
      );
      navigate("/employer/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không tạo được bài đăng.");
    } finally {
      setSaving(false);
    }
  };

  const totalDemand = rows.reduce(
    (sum, row) =>
      sum +
      dates.reduce(
        (dateSum, date) => dateSum + cellTotal(row.cells[date] ?? emptyCell()),
        0,
      ),
    0,
  );

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <div className="flex">
        <EmployerSidebar />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-[1380px] items-center gap-4 px-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0A4B3E]">
                  Bài đăng tuyển dụng casual
                </p>
                <h1 className="truncate text-base font-bold text-slate-900">
                  Lịch nhu cầu theo bộ phận, ngày và khung giờ
                </h1>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/employer/dashboard"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Quay lại</span>
                </Link>
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving || loading}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643] disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {publishNow ? "Đăng tuyển" : "Lưu nháp"}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1380px] space-y-5 px-4 py-5 sm:px-6">
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Tiêu đề bài đăng
                    </span>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      placeholder="VD: Sheraton Grand Danang tuyển nhân sự casual buồng phòng tháng 06/2026"
                      className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Tổ chức
                    </span>
                    <select
                      value={organizationId}
                      onChange={(event) =>
                        handleOrganizationChange(event.target.value)
                      }
                      className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Chọn tổ chức</option>
                      {organizations.map((organization) => (
                        <option key={organization.id} value={organization.id}>
                          {organization.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-4 md:col-span-2">
                    <h2 className="text-base font-bold text-slate-950">
                      Địa điểm doanh nghiệp
                    </h2>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        Địa chỉ chi tiết
                      </span>
                      <input
                        value={form.address}
                        onChange={(event) =>
                          updateForm("address", event.target.value)
                        }
                        placeholder="VD: 35 Trường Sa"
                        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Tỉnh/Thành phố
                        </span>
                        <select
                          value={form.provinceId}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              provinceId: event.target.value,
                              districtId: "",
                              wardId: "",
                            }))
                          }
                          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map((province) => (
                            <option key={province.id} value={province.id}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Quận/Huyện
                        </span>
                        <select
                          value={form.districtId}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              districtId: event.target.value,
                              wardId: "",
                            }))
                          }
                          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="">Chọn quận/huyện</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          Phường/Xã
                        </span>
                        <select
                          value={form.wardId}
                          onChange={(event) =>
                            updateForm("wardId", event.target.value)
                          }
                          className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="">Chọn phường/xã</option>
                          {wards.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md bg-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500">Ngày</p>
                    <p className="mt-1 text-2xl font-bold">{dates.length}</p>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-500">Dòng ca</p>
                    <p className="mt-1 text-2xl font-bold">{rows.length}</p>
                  </div>
                  <div className="rounded-md bg-zinc-100 p-3">
                    <p className="text-xs font-bold text-zinc-600">Nhu cầu</p>
                    <p className="mt-1 text-2xl font-bold">{totalDemand}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={addDate}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <CalendarPlus size={15} />
                    Thêm ngày
                  </button>
                  <button
                    type="button"
                    onClick={fillWeek}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Check size={15} />
                    Lập 7 ngày
                  </button>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-[#00B14F] px-3 text-xs font-bold text-white hover:bg-[#009643]"
                  >
                    <Plus size={15} />
                    Thêm bộ phận/ca
                  </button>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={publishNow}
                    onChange={(event) => setPublishNow(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#0A4B3E]"
                  />
                  Xuất bản ngay sau khi tạo chỗ làm
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="text-base font-bold">Mẫu ca làm</h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-slate-50 ring-1 ring-slate-200" />
                    Bộ phận
                  </span>
                  <span>T = chung</span>
                  <span>N = nam</span>
                  <span>Nữ = nữ</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1080px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="sticky left-0 z-20 w-[230px] border border-slate-500 px-3 py-2 text-left">
                        Bộ phận
                      </th>
                      <th className="sticky left-[230px] z-20 w-[170px] border border-slate-500 px-3 py-2 text-left">
                        Ca
                      </th>
                      {dates.map((date) => (
                        <th
                          key={date}
                          className="w-[126px] border border-slate-500 px-2 py-2"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{formatDateHeader(date)}</span>
                            <button
                              type="button"
                              onClick={() => removeDate(date)}
                              disabled={dates.length === 1}
                              className="rounded p-1 text-white/70 hover:bg-white/15 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                              title="Xóa ngày"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="sticky right-[72px] z-20 w-[132px] border border-slate-500 px-3 py-2">
                        Mức lương
                      </th>
                      <th className="sticky right-0 z-20 w-[72px] border border-slate-500 px-2 py-2">
                        Sửa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => {
                      const rowColor = rowColors[rowIndex % rowColors.length];
                      return (
                        <tr
                          key={row.id}
                          className={`${rowColor} text-slate-900`}
                        >
                          <td
                            className={`sticky left-0 z-10 border border-slate-300 p-2 ${rowColor}`}
                          >
                            <select
                              value={row.positionId}
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "positionId",
                                  event.target.value,
                                )
                              }
                              className="h-10 w-full rounded border border-slate-300 bg-white px-2 text-sm font-bold outline-none focus:border-[#009643]"
                            >
                              <option value="">Chọn bộ phận</option>
                              {positions.map((position) => (
                                <option key={position.id} value={position.id}>
                                  {position.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className={`sticky left-[230px] z-10 border border-slate-300 p-2 ${rowColor}`}
                          >
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                              <input
                                type="time"
                                value={row.startTime}
                                onChange={(event) =>
                                  updateRow(
                                    row.id,
                                    "startTime",
                                    event.target.value,
                                  )
                                }
                                className="h-9 rounded border border-slate-300 bg-white px-1 text-xs font-semibold outline-none focus:border-[#009643]"
                              />
                              <span className="text-xs font-bold">-</span>
                              <input
                                type="time"
                                value={row.endTime}
                                onChange={(event) =>
                                  updateRow(
                                    row.id,
                                    "endTime",
                                    event.target.value,
                                  )
                                }
                                className="h-9 rounded border border-slate-300 bg-white px-1 text-xs font-semibold outline-none focus:border-[#009643]"
                              />
                            </div>
                          </td>
                          {dates.map((date) => {
                            const cell = row.cells[date] ?? emptyCell();
                            return (
                              <td
                                key={date}
                                className="border border-slate-300 p-1 align-middle"
                              >
                                <div className="grid grid-cols-3 gap-1">
                                  {demandParts.map((part) => (
                                    <label
                                      key={part.key}
                                      className="min-w-0 rounded bg-white px-1 py-1 ring-1 ring-slate-200"
                                      title={part.label}
                                    >
                                      <span className="block text-center text-[10px] font-bold text-slate-500">
                                        {part.shortLabel}
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        value={cell[part.key] || ""}
                                        onChange={(event) =>
                                          updateCell(
                                            row.id,
                                            date,
                                            part.key,
                                            numberOrZero(event.target.value),
                                          )
                                        }
                                        className="h-7 w-full rounded border border-slate-200 bg-white text-center text-xs font-bold outline-none focus:border-[#009643]"
                                      />
                                    </label>
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                          <td
                            className={`sticky right-[72px] z-10 border border-slate-300 p-2 ${rowColor}`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                value={row.salary || ""}
                                onChange={(event) =>
                                  updateRow(
                                    row.id,
                                    "salary",
                                    numberOrZero(event.target.value),
                                  )
                                }
                                className="h-9 min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 text-right text-xs font-bold outline-none focus:border-[#009643]"
                              />
                              <span className="text-xs font-bold">/ca</span>
                            </div>
                            <p className="mt-1 text-right text-[11px] font-semibold text-slate-500">
                              {formatMoney(row.salary)}
                            </p>
                          </td>
                          <td
                            className={`sticky right-0 z-10 border border-slate-300 p-2 ${rowColor}`}
                          >
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateRow(row)}
                                className="flex h-8 w-8 items-center justify-center rounded bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                                title="Nhân bản dòng"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                disabled={rows.length === 1}
                                className="flex h-8 w-8 items-center justify-center rounded bg-white text-red-600 ring-1 ring-slate-200 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40"
                                title="Xóa dòng"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <label className="space-y-1.5 lg:col-span-1">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Mô tả
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  rows={5}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1.5 lg:col-span-1">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Yêu cầu
                </span>
                <textarea
                  value={form.requirements}
                  onChange={(event) =>
                    updateForm("requirements", event.target.value)
                  }
                  rows={5}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1.5 lg:col-span-1">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Quyền lợi
                </span>
                <textarea
                  value={form.benefits}
                  onChange={(event) =>
                    updateForm("benefits", event.target.value)
                  }
                  rows={5}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </section>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
