# 🚀 Khóa Học Lập Trình (Full-Stack Platform)

Một nền tảng học lập trình trực tuyến toàn diện, bao gồm hệ thống trang chủ (Landing Page & Student Portal), trang quản trị (Admin Dashboard), và API Backend mạnh mẽ. Hệ thống giúp học viên dễ dàng truy cập khóa học, làm bài trắc nghiệm (Quizzes), trong khi quản trị viên có thể quản lý sinh viên, khóa học, doanh thu và nội dung một cách trực quan.

## 🌟 Các Tính Năng Nổi Bật

- **🌐 Front-end (Học viên):**
  - Giao diện người dùng hiện đại, tối ưu UX/UI với chế độ Sáng/Tối (Dark Mode).
  - Hỗ trợ đa ngôn ngữ (Tiếng Anh / Tiếng Việt).
  - Đăng ký, đăng nhập an toàn với JWT.
  - Học bài, theo dõi tiến độ (Progress Tracking) và làm bài Quizzes.

- **🛡 Admin Dashboard (Quản trị viên):**
  - Quản lý Khóa học, Bài học, và Bài kiểm tra (Quizzes).
  - Thống kê doanh thu, số lượng học viên, khóa học phổ biến.
  - Giao diện trực quan với Ant Design và Vite siêu tốc.
  
- **⚙️ Back-end (API Server):**
  - Xây dựng bằng Node.js, Express, và TypeScript.
  - Bảo mật cao cấp: Helmet, CORS, Rate Limiting, NoSQL Injection Protection.
  - Gửi email tự động (Nodemailer) khi học viên đăng ký hoặc quên mật khẩu.

---

## 🏗 Kiến Trúc Kỹ Thuật
- **Frontend:** React 18, Tailwind CSS, Webpack
- **Admin Dashboard:** React 18, Ant Design, Vite
- **Backend:** Node.js, Express.js, TypeScript, Mongoose
- **Cơ sở dữ liệu:** MongoDB

---

## 🚀 Hướng Dẫn Triển Khai (Deployment Guide)

Dự án này đã được tinh chỉnh để **tự động deploy miễn phí** lên các nền tảng đám mây phổ biến là **Render.com** (cho Backend) và **Vercel.com** (cho Frontend/Admin).

### 1. Chuẩn Bị Cơ Sở Dữ Liệu (MongoDB Atlas)
1. Đăng ký tài khoản miễn phí tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Tạo một Cluster miễn phí (M0).
3. Trong mục **Network Access**, thêm IP `0.0.0.0/0` để cho phép server truy cập.
4. Lấy chuỗi kết nối (Connection String) `MONGO_URL`, ví dụ: 
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/highsky?retryWrites=true&w=majority`

### 2. Triển Khai Back-end (Lên Render.com)
Dự án đã có sẵn file `render.yaml` giúp Render nhận diện và tự cấu hình.
1. Đăng nhập [Render.com](https://render.com/) bằng tài khoản GitHub.
2. Chọn **New > Blueprint** và kết nối với repository GitHub của bạn.
3. Render sẽ tự động nhận diện Web Service `highsky-backend`.
4. Trong Render Dashboard của Web Service, vào thẻ **Environment**, điền các biến môi trường sau:
   - `PORT`: `5001`
   - `MONGO_URL`: *<Chuỗi kết nối MongoDB Atlas của bạn>*
   - `JWT_SECRET`: *<Một chuỗi bí mật bất kỳ>*
   - `JWT_ADMIN_SECRET`: *<Một chuỗi bí mật bất kỳ>*
   - `CLIENT_URL`: *<Link Frontend sau khi deploy>* (Ví dụ: `https://frontend.vercel.app`)
   - `FRONTEND_URL`: *<Link Admin sau khi deploy>*
   - `EMAIL_USER`: *<Email dùng gửi thư>*
   - `EMAIL_PASS`: *<Mật khẩu ứng dụng của Email>*

### 3. Triển Khai Front-end & Admin (Lên Vercel.com)
Dự án có sẵn `vercel.json` giúp Vercel xử lý bộ định tuyến React (React Router).
1. Đăng nhập [Vercel.com](https://vercel.com/) bằng tài khoản GitHub.
2. Chọn **Add New > Project** và chọn repository GitHub của dự án.
3. **Deploy Front-end:**
   - Trong ô **Root Directory**, ấn Edit và chọn thư mục `Front-end`.
   - Framework Preset: Chọn `Other`.
   - Mở mục **Environment Variables** thêm:
     - `API_URL`: *<Link Render Backend>* (Ví dụ: `https://highsky-backend.onrender.com`)
   - Bấm **Deploy**.
4. **Deploy Admin-dashboard:**
   - Quay lại trang chủ Vercel, chọn **Add New > Project** (chọn lại repo y như bước 3).
   - Trong ô **Root Directory**, ấn Edit và chọn thư mục `Admin-dashboard`.
   - Framework Preset: Chọn `Vite`.
   - Mở mục **Environment Variables** thêm:
     - `VITE_API_URL`: *<Link Render Backend>* (Ví dụ: `https://highsky-backend.onrender.com`)
   - Bấm **Deploy**.

🎉 **Hoàn Tất!** Bây giờ ứng dụng của bạn đã có mặt trực tuyến và sẵn sàng phục vụ học viên trên toàn thế giới. 🚀
