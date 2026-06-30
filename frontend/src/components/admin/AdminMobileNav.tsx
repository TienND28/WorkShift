import { NavLink } from "react-router-dom";
import { adminIndustryLabelShort } from "@/lib/catalog-labels";

function tabClass({ isActive }: { isActive: boolean }) {
  return `flex-1 py-3 text-center text-xs font-semibold ${
    isActive ? "text-teal-700 border-t-2 border-teal-600" : "text-neutral-500"
  }`;
}

export function AdminMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex border-t border-neutral-200 bg-white">
      <NavLink to="/admin" end className={tabClass}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/industries" className={tabClass}>
        {adminIndustryLabelShort}
      </NavLink>
      <NavLink to="/admin/positions" className={tabClass}>
        Vị trí
      </NavLink>
    </nav>
  );
}
