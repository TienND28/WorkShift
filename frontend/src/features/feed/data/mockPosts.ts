import type { FeedPost } from "@/features/feed/types/post.types";

export const mockPosts: FeedPost[] = [
  {
    id: "1",
    author: {
      username: "highlands_q1",
      displayName: "Highlands Coffee · Quận 1",
      avatarInitial: "H",
    },
    content:
      "Tuyển 3 nhân viên pha chế ca tối 18:00-22:00, T2-T6. Lương 45k/giờ + thưởng. Ưu tiên sinh viên có kinh nghiệm pha chế.",
    postedAt: "2 giờ",
    likes: 24,
    replies: 8,
    reposts: 3,
  },
  {
    id: "2",
    author: {
      username: "winmart_thuduc",
      displayName: "WinMart+ Thủ Đức",
      avatarInitial: "W",
    },
    content:
      "Cần 5 nhân viên bán hàng ca sáng 6h-14h cuối tuần. Được đào tạo trực tiếp, nhận lương theo tuần.",
    imageUrls: [
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    ],
    postedAt: "5 giờ",
    likes: 41,
    replies: 12,
    reposts: 6,
  },
  {
    id: "3",
    author: {
      username: "grab_kitchen_hcm",
      displayName: "GrabKitchen HCM",
      avatarInitial: "G",
    },
    content:
      "Tuyển gấp 2 phụ bếp ca trưa 10h-15h. Bao ăn, có xe đưa đón gần ga Bến Thành.",
    postedAt: "8 giờ",
    likes: 18,
    replies: 5,
    reposts: 2,
  },
  {
    id: "4",
    author: {
      username: "uniqlo_vincom",
      displayName: "Uniqlo Vincom Đồng Khởi",
      avatarInitial: "U",
    },
    content:
      "Ca bán thời gian 4h/ngày, linh hoạt lịch học. Phụ cấp đi lại và thưởng doanh số theo tháng.",
    imageUrls: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=280&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=280&fit=crop",
    ],
    postedAt: "19 giờ",
    likes: 67,
    replies: 21,
    reposts: 9,
  },
  {
    id: "5",
    author: {
      username: "starbucks_landmark",
      displayName: "Starbucks Landmark 81",
      avatarInitial: "S",
    },
    content:
      "Mở đơn ứng tuyển ca cuối tuần - ưu tiên ứng viên đã hoàn thành hồ sơ WorkShift.",
    postedAt: "1 ngày",
    likes: 92,
    replies: 34,
    reposts: 15,
  },
];
