export interface FeedPostAuthor {
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarInitial: string;
}

export interface FeedPost {
  id: string;
  author: FeedPostAuthor;
  content: string;
  imageUrls?: string[];
  postedAt: string;
  likes: number;
  replies: number;
  reposts: number;
}
