import { Outlet } from "react-router-dom";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomeRightSidebar } from "@/features/home/components/HomeRightSidebar";

export function HomeFeedLayout() {
  return (
    <div className="space-y-5">
      <HomeHero />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Outlet />
        </div>

        <div className="hidden lg:sticky lg:top-20 lg:block">
          <HomeRightSidebar />
        </div>
      </div>
    </div>
  );
}
