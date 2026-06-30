import type { ReactNode } from "react";
import {
  IconComment,
  IconHeart,
  IconRepost,
  IconShare,
} from "@/components/icons/FeedIcons";

interface PostActionsProps {
  likes: number;
  replies: number;
  reposts: number;
  canInteract: boolean;
  onRequireLogin: () => void;
}

function ActionButton({
  icon,
  count,
  canInteract,
  onRequireLogin,
}: {
  icon: ReactNode;
  count?: number;
  canInteract: boolean;
  onRequireLogin: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!canInteract}
      onClick={() => {
        if (!canInteract) onRequireLogin();
      }}
      className={`flex items-center gap-1.5 rounded-lg px-1 py-0.5 transition ${
        canInteract
          ? "text-slate-500 hover:bg-slate-100 hover:text-[#0A4B3E]"
          : "text-neutral-400 cursor-default"
      }`}
      title={canInteract ? undefined : "Đăng nhập để tương tác"}
    >
      {icon}
      {count !== undefined && count > 0 ? (
        <span className="text-[13px] tabular-nums">{count}</span>
      ) : null}
    </button>
  );
}

export function PostActions({
  likes,
  replies,
  reposts,
  canInteract,
  onRequireLogin,
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-1 -ml-1 mt-3">
      <ActionButton
        icon={<IconHeart />}
        count={likes}
        canInteract={canInteract}
        onRequireLogin={onRequireLogin}
      />
      <ActionButton
        icon={<IconComment />}
        count={replies}
        canInteract={canInteract}
        onRequireLogin={onRequireLogin}
      />
      <ActionButton
        icon={<IconRepost />}
        count={reposts}
        canInteract={canInteract}
        onRequireLogin={onRequireLogin}
      />
      <ActionButton
        icon={<IconShare />}
        canInteract={canInteract}
        onRequireLogin={onRequireLogin}
      />
    </div>
  );
}
