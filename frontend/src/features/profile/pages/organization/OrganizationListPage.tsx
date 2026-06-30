import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProfileLayout } from "@/components/layout/ProfileLayout";
import { organizationApi, type Organization } from "@/lib/api/organization.api";
import { mediaUrl } from "@/lib/media";

export function OrganizationListPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    organizationApi
      .listMine()
      .then(setOrgs)
      .catch(() => setError("Không tải được danh sách tổ chức"));
  }, []);

  return (
    <ProfileLayout title="Tổ chức của tôi">
      {error ? <p className="text-error">{error}</p> : null}
      <ul className="space-y-3">
        {orgs.map((org) => (
          <li key={org.id}>
            <Link
              to={`/profile/organization/${org.id}/edit`}
              className="onboarding-card flex items-center gap-4 transition hover:border-accent"
            >
              {mediaUrl(org.logo) ? (
                <img
                  src={mediaUrl(org.logo)!}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 font-bold text-neutral-500">
                  {org.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-primary truncate">{org.name}</p>
                <p className="text-sm text-on-surface-variant truncate">{org.address}</p>
                {org.myRole ? (
                  <p className="mt-1 text-xs font-medium text-accent">{org.myRole}</p>
                ) : null}
              </div>
              <span className="text-neutral-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
      {orgs.length === 0 && !error ? (
        <p className="py-8 text-center text-on-surface-variant">
          Chưa có tổ chức. Hoàn tất onboarding nhà tuyển dụng trước.
        </p>
      ) : null}
    </ProfileLayout>
  );
}
