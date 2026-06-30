import { PostActions } from "@/features/feed/components/PostActions";
import type { FeedPost } from "@/features/feed/types/post.types";

interface PostCardProps {
  post: FeedPost;
  canInteract: boolean;
  onRequireLogin: () => void;
}

function AuthorAvatar({ initial }: { initial: string }) {
  return (
    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0A4B3E]">
      {initial}
    </div>
  );
}

export function PostCard({ post, canInteract, onRequireLogin }: PostCardProps) {
  return (
    <article className="border-b border-slate-200 px-6 py-5 transition hover:bg-slate-50">
      <div className="flex gap-3">
        {post.author.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <AuthorAvatar initial={post.author.avatarInitial} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[15px]">
            <span className="font-semibold text-slate-950 truncate">
              {post.author.displayName}
            </span>
            <span className="text-slate-500 shrink-0">· {post.postedAt}</span>
          </div>

          <p className="mt-1 text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {post.imageUrls && post.imageUrls.length > 0 ? (
            <div
              className={`mt-3 grid gap-1 rounded-lg overflow-hidden border border-slate-200 ${
                post.imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {post.imageUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="w-full object-cover max-h-80 bg-slate-100"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          <PostActions
            likes={post.likes}
            replies={post.replies}
            reposts={post.reposts}
            canInteract={canInteract}
            onRequireLogin={onRequireLogin}
          />
        </div>
      </div>
    </article>
  );
}
