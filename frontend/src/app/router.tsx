import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { OnboardingRoute } from "@/app/OnboardingRoute";
import { OnboardingGuard } from "@/app/OnboardingGuard";
import { AdminRoute } from "@/app/AdminRoute";
import { FeedLayout } from "@/components/layout/FeedLayout";
import { AuthPromptProvider } from "@/features/auth/context/AuthPromptContext";
import { HomeFeedLayout } from "@/features/home/components/HomeFeedLayout";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const LongTermJobsPage = lazy(() =>
  import("@/pages/LongTermJobsPage").then((m) => ({
    default: m.LongTermJobsPage,
  })),
);
const RoleSelectPage = lazy(() =>
  import("@/features/onboarding/pages/RoleSelectPage").then((m) => ({
    default: m.RoleSelectPage,
  })),
);
const WorkerPersonalPage = lazy(() =>
  import("@/features/onboarding/pages/worker/WorkerPersonalPage").then((m) => ({
    default: m.WorkerPersonalPage,
  })),
);
const WorkerPositionsPage = lazy(() =>
  import("@/features/onboarding/pages/worker/WorkerPositionsPage").then((m) => ({
    default: m.WorkerPositionsPage,
  })),
);
const WorkerLocationsPage = lazy(() =>
  import("@/features/onboarding/pages/worker/WorkerLocationsPage").then((m) => ({
    default: m.WorkerLocationsPage,
  })),
);
const WorkerAvailabilityPage = lazy(() =>
  import("@/features/onboarding/pages/worker/WorkerAvailabilityPage").then((m) => ({
    default: m.WorkerAvailabilityPage,
  })),
);
const EmployerSetupPage = lazy(() =>
  import("@/features/onboarding/pages/employer/EmployerSetupPage").then((m) => ({
    default: m.EmployerSetupPage,
  })),
);
const EmployerDashboardPage = lazy(() =>
  import("@/features/employer/pages/EmployerDashboardPage").then((m) => ({
    default: m.EmployerDashboardPage,
  })),
);
const JobPostingCreatePage = lazy(() =>
  import("@/features/employer/pages/JobPostingCreatePage").then((m) => ({
    default: m.JobPostingCreatePage,
  })),
);
const EmployerJobPostingsPage = lazy(() =>
  import("@/features/employer/pages/EmployerJobPostingsPage").then((m) => ({
    default: m.EmployerJobPostingsPage,
  })),
);
const EmployerProfilePage = lazy(() =>
  import("@/features/profile/pages/employer/EmployerProfilePage").then((m) => ({
    default: m.EmployerProfilePage,
  })),
);
const ProfileHubPage = lazy(() =>
  import("@/features/profile/pages/ProfileHubPage").then((m) => ({
    default: m.ProfileHubPage,
  })),
);
const WorkerProfilePage = lazy(() =>
  import("@/features/profile/pages/worker/WorkerProfilePage").then((m) => ({
    default: m.WorkerProfilePage,
  })),
);
const WorkerProfileEditPage = lazy(() =>
  import("@/features/profile/pages/worker/WorkerProfileEditPage").then((m) => ({
    default: m.WorkerProfileEditPage,
  })),
);
const OrganizationEditPage = lazy(() =>
  import("@/features/profile/pages/organization/OrganizationEditPage").then(
    (m) => ({ default: m.OrganizationEditPage }),
  ),
);
const OrganizationProfilePage = lazy(() =>
  import("@/features/profile/pages/organization/OrganizationProfilePage").then(
    (m) => ({ default: m.OrganizationProfilePage }),
  ),
);
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const IndustriesPage = lazy(() =>
  import("@/features/admin/pages/IndustriesPage").then((m) => ({
    default: m.IndustriesPage,
  })),
);
const PositionsPage = lazy(() =>
  import("@/features/admin/pages/PositionsPage").then((m) => ({
    default: m.PositionsPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthPromptProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<FeedLayout />}>
              <Route index element={<Navigate to="/jobs/casual" replace />} />
              <Route
                path="jobs"
                element={
                  <OnboardingGuard>
                    <HomeFeedLayout />
                  </OnboardingGuard>
                }
              >
                <Route index element={<Navigate to="/jobs/casual" replace />} />
                <Route path="casual" element={<HomePage />} />
                <Route path="long-term" element={<LongTermJobsPage />} />
              </Route>
            </Route>

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <RoleSelectPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/worker/personal"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <WorkerPersonalPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/worker/positions"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <WorkerPositionsPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/worker/locations"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <WorkerLocationsPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/worker/availability"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <WorkerAvailabilityPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/employer/setup"
              element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <EmployerSetupPage />
                  </OnboardingRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/employer/scale"
              element={<Navigate to="/onboarding/employer/setup" replace />}
            />
            <Route
              path="/onboarding/employer/organization"
              element={<Navigate to="/onboarding/employer/setup" replace />}
            />

            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute>
                  <EmployerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/job-postings/new"
              element={
                <ProtectedRoute>
                  <JobPostingCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/job-postings"
              element={
                <ProtectedRoute>
                  <EmployerJobPostingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/worker"
              element={
                <ProtectedRoute>
                  <WorkerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/worker/edit"
              element={
                <ProtectedRoute>
                  <WorkerProfileEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/employer"
              element={
                <ProtectedRoute>
                  <EmployerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/employer/edit"
              element={
                <ProtectedRoute>
                  <EmployerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/organization"
              element={
                <ProtectedRoute>
                  <OrganizationProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/organization/:organizationId/edit"
              element={
                <ProtectedRoute>
                  <OrganizationEditPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/industries"
              element={
                <AdminRoute>
                  <IndustriesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/positions"
              element={
                <AdminRoute>
                  <PositionsPage />
                </AdminRoute>
              }
            />

            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthPromptProvider>
    </BrowserRouter>
  );
}
