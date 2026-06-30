Nếu có xung đột giữa prompt ngắn của user và AGENTS.md, ưu tiên AGENTS.md cho style, ngôn ngữ, convention của dự án.

## Ngôn ngữ & nội dung

- Tất cả text hiển thị cho user phải dùng tiếng Việt có dấu.
- Không viết tiếng Việt không dấu trong UI, toast, placeholder, button, validation message.
- Code, tên biến, tên file dùng English theo convention.
- Không tự ý đổi nội dung sang giọng máy móc, sáo rỗng.

## UI style

- UI phải tự nhiên, hiện đại, sạch, giống sản phẩm thật, không giống template AI.
- Tránh gradient lòe loẹt, màu tím/xanh neon quá nhiều, shadow nặng, card bo góc quá mức.
- Ưu tiên neutral colors, spacing thoáng, typography rõ, trạng thái hover/focus nhẹ.
- Mỗi màn hình phải có hierarchy rõ: title, mô tả ngắn, action chính, action phụ.
- Không tự thêm emoji vào UI trừ khi được yêu cầu.

## Frontend conventions

- Dùng React + TypeScript + Tailwind.
- Component phải nhỏ, dễ đọc, tránh nhồi logic vào JSX.
- Dùng reusable components nếu pattern lặp lại.
- Loading, empty state, error state phải được xử lý tử tế.
- Form phải có validation message tiếng Việt có dấu.

## Trước khi code

- Đọc cấu trúc project trước.
- Không rewrite toàn bộ nếu chỉ cần sửa một phần.
- Trước khi tạo component mới, kiểm tra đã có component tương tự chưa.

## Design Theme

### Brand Colors

Primary:

- #00B14F (Bright Green / Main CTA)

Primary Dark:

- #0A4B3E (Deep Emerald)

Secondary:

- #009643 (Green)

Accent:

- #1DB954 (Success / Positive Actions)

### Visual Direction

- Giao diện mang cảm giác chuyên nghiệp, hiện đại và đáng tin cậy.
- Ưu tiên phong cách sản phẩm thực tế (production-ready) thay vì landing page hoặc template demo.
- Màu xanh lá là màu nhận diện chính của hệ thống.
- Tổng thể giao diện nên sạch, sáng, dễ nhìn, không quá nặng màu.
- Button chính nên nổi bật bằng màu xanh sáng, tạo cảm giác rõ ràng và dễ bấm.
- Các khu vực nền lớn như header/sidebar có thể dùng xanh đậm để tạo độ tin cậy và chiều sâu.
- Tạo cảm giác "enterprise software" hơn là "startup flashy UI".

### Color Usage

Primary (#00B14F) dùng cho:

- Nút hành động chính
- CTA quan trọng
- Trạng thái active nổi bật
- Điểm nhấn cần thu hút sự chú ý

Primary Dark (#0A4B3E) dùng cho:

- Header
- Sidebar
- Footer
- Tiêu đề quan trọng
- Text hoặc nền cần cảm giác chắc chắn, chuyên nghiệp

Secondary (#009643) dùng cho:

- Hover state
- Link
- Active menu
- Border hoặc icon nhấn nhẹ
- Các thành phần tương tác phụ

Accent (#1DB954) dùng hạn chế cho:

- Thành công
- Hoàn thành
- Xác nhận
- Badge trạng thái tích cực

### Button Rules

- Button chính ưu tiên dùng #00B14F.
- Button hover chuyển sang màu tối hơn như #009643.
- Button pressed/active có thể dùng #0A4B3E.
- Text trên button chính nên là màu trắng.
- Không dùng gradient cho button nếu không được yêu cầu.
- Không dùng shadow quá đậm cho button.
- Button phải có trạng thái hover, active, disabled rõ ràng.
- Disabled button nên dùng nền xám nhạt, không dùng xanh mờ gây nhầm lẫn.

### Avoid

- Không sử dụng gradient nhiều màu.
- Không sử dụng tím neon, xanh cyan neon hoặc các màu cyberpunk.
- Không lạm dụng hiệu ứng glassmorphism.
- Không sử dụng shadow quá đậm.
- Không bo góc quá lớn (tránh phong cách AI-generated).
- Không sử dụng quá 2 màu nhấn trên cùng một màn hình.

### Component Style

- Border radius: 8px - 12px.
- Shadow nhẹ, ưu tiên border hơn shadow.
- Card đơn giản, sạch.
- Hover tinh tế.
- Transition ngắn và tự nhiên.
- Button nên có cảm giác rõ ràng, dễ bấm, không quá mềm hoặc quá "game hóa".

### Inspiration

Ưu tiên cảm giác tương tự:

- Stripe Dashboard
- Linear
- Notion
- Vercel Dashboard
- Jira Cloud
- Các hệ thống SaaS quản trị doanh nghiệp hiện đại

Không mô phỏng:

- Template AI phổ biến trên Dribbble.
- Landing page marketing nhiều hiệu ứng.
- Dashboard cyberpunk hoặc neon.
