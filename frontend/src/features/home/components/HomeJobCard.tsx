import { Bookmark, Clock, MapPin } from "lucide-react";

export interface HomeJob {
  id: string;
  title: string;
  company: string;
  logo: string;
  tags: string[];
  description?: string;
  imageUrl?: string;
  location: string;
  postedAt: string;
  pay: string;
  payUnit: string;
  saved?: boolean;
}

interface HomeJobCardProps {
  job: HomeJob;
}

export function HomeJobCard({ job }: HomeJobCardProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm transition hover:border-slate-400">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
          <img src={job.logo} alt={job.company} className="h-7 w-7 object-contain" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold leading-6 text-slate-950">
                {job.title}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-slate-600">{job.company}</p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 hover:text-[#0A4B3E]"
              aria-label="Lưu công việc"
            >
              <Bookmark
                className="h-5 w-5"
                fill={job.saved ? "#009643" : "none"}
                stroke={job.saved ? "#009643" : "currentColor"}
              />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {job.imageUrl ? (
            <img
              src={job.imageUrl}
              alt=""
              className="mt-4 aspect-[16/5] w-full rounded-md border border-slate-200 object-cover"
              loading="lazy"
            />
          ) : null}

          {job.description ? (
            <p className="mt-4 text-sm leading-6 text-slate-700">{job.description}</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {job.postedAt}
              </span>
            </div>

            <p className="text-right text-lg font-extrabold text-[#009643]">
              {job.pay}
              <span className="ml-1 text-xs font-semibold text-slate-600">{job.payUnit}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
