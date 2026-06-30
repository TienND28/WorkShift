import { mockPosts } from "@/features/feed/data/mockPosts";
import { PostCard } from "@/features/feed/components/PostCard";
import { useAuthPrompt } from "@/features/auth/context/AuthPromptContext";

interface FeedListProps {
  canInteract: boolean;
}

export function FeedList({ canInteract }: FeedListProps) {
  const { openAuthPrompt } = useAuthPrompt();

  const handleRequireLogin = () => {
    openAuthPrompt({
      message: "Đăng nhập bằng Google để thích, bình luận và ứng tuyển ca làm.",
    });
  };

  return (
    <div>
      {mockPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canInteract={canInteract}
          onRequireLogin={handleRequireLogin}
        />
      ))}
    </div>
  );
}
