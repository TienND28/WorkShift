import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconBell,
  IconCalendar,
  IconCreate,
  IconDashboard,
  IconHome,
  IconLogout,
  IconMessage,
  IconSearch,
  IconUser,
} from "@/components/icons/FeedIcons";
import { useAuth } from "@/hooks/useAuth";
import { useAuthPrompt } from "@/features/auth/context/AuthPromptContext";

interface NavItemConfig {
  icon: ReactNode;
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
}

const authMessage =
  "Tham gia WorkShift để tìm việc làm, ca làm và kết nối với doanh nghiệp.";

function SidebarNavItem({
  icon,
  label,
  active,
  expanded,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-12 w-full items-center rounded-lg transition-colors ${
        active
          ? "bg-[#E8F8EF] font-semibold text-[#0A4B3E]"
          : "font-normal text-neutral-800 hover:bg-slate-100 hover:text-[#0A4B3E]"
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span
        className={`overflow-hidden whitespace-nowrap text-[15px] transition-all duration-200 ${
          expanded ? "w-auto opacity-100" : "w-0 opacity-0"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const [expanded, setExpanded] = useState(false);

  const isEmployer = Boolean(user?.profileTypes.includes("EMPLOYER"));
  const profilePath = isEmployer ? "/profile/employer" : "/profile";

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      openAuthPrompt({ message: authMessage });
      return;
    }
    action();
  };

  const guestItems: NavItemConfig[] = [
    {
      icon: <IconHome />,
      label: "Trang chủ",
      path: "/jobs/casual",
      active:
        location.pathname === "/" || location.pathname.startsWith("/jobs/casual"),
    },
    {
      icon: <IconSearch />,
      label: "Tìm kiếm",
      onClick: () => requireAuth(() => navigate("/jobs/casual")),
    },
    {
      icon: <IconCreate />,
      label: "Tạo",
      onClick: () => requireAuth(() => navigate("/create")),
    },
  ];

  const authItems: NavItemConfig[] = [
    {
      icon: <IconHome />,
      label: "Trang chủ",
      path: "/jobs/casual",
      active:
        location.pathname === "/" || location.pathname.startsWith("/jobs/casual"),
    },
    ...(isEmployer
      ? [
          {
            icon: <IconDashboard />,
            label: "Tổng quan",
            path: "/employer/dashboard",
            active: location.pathname.startsWith("/employer/dashboard"),
          },
        ]
      : []),
    {
      icon: <IconMessage />,
      label: "Tin nhắn",
      path: "/messages",
      active: location.pathname.startsWith("/messages"),
    },
    {
      icon: <IconBell />,
      label: "Thông báo",
      path: "/notifications",
      active: location.pathname.startsWith("/notifications"),
    },
    {
      icon: <IconCalendar />,
      label: "Lịch làm việc",
      path: "/schedule",
      active: location.pathname.startsWith("/schedule"),
    },
    {
      icon: <IconSearch />,
      label: "Tìm kiếm",
      path: "/jobs/casual",
      active: false,
    },
    {
      icon: <IconCreate />,
      label: "Tạo",
      path: "/create",
      active: location.pathname.startsWith("/create"),
    },
    {
      icon: user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="h-7 w-7 rounded-full object-cover ring-1 ring-neutral-200"
          referrerPolicy="no-referrer"
        />
      ) : (
        <IconUser />
      ),
      label: "Trang cá nhân",
      path: profilePath,
      active: location.pathname.startsWith(profilePath),
    },
  ];

  const items = isAuthenticated ? authItems : guestItems;

  const handleItemClick = (item: NavItemConfig) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="sidebar-nav sticky top-16 hidden h-[calc(100dvh-4rem)] w-[72px] shrink-0 sm:block">
      <div
        className={`flex h-full flex-col bg-white transition-[width,box-shadow] duration-200 ease-out ${
          expanded
            ? "absolute left-0 top-0 z-40 w-[244px] shadow-[4px_0_24px_rgba(15,23,42,0.08)]"
            : "relative w-full"
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <nav className="flex flex-1 flex-col justify-center gap-0.5 px-3">
          {items.map((item) => (
            <SidebarNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              expanded={expanded}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </nav>

        {isAuthenticated ? (
          <div className="mt-auto border-t border-neutral-100 px-3 py-3">
            <SidebarNavItem
              icon={<IconLogout />}
              label="Đăng xuất"
              expanded={expanded}
              onClick={() => logout()}
            />
          </div>
        ) : (
          <div className="mt-auto pb-3" aria-hidden />
        )}
      </div>
    </aside>
  );
}
