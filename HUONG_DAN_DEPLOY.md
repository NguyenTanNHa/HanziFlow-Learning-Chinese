# Hướng Dẫn Triển Khai (Deploy) Dự Án HanziFlow 🌊

Tài liệu này hướng dẫn chi tiết từng bước cách cấu hình và triển khai dự án **HanziFlow** từ môi trường phát triển cục bộ lên production sử dụng **Supabase (PostgreSQL)**, **Gemini AI**, **Resend (Email)** và **Vercel**.

---

## 📋 Yêu cầu chuẩn bị (Prerequisites)

Trước khi bắt đầu, người mua cần chuẩn bị sẵn các tài khoản sau (tất cả đều có gói miễn phí):
1. **GitHub Account:** Để lưu trữ mã nguồn riêng tư.
2. **Supabase Account:** Nền tảng cơ sở dữ liệu PostgreSQL.
3. **Google AI Studio Account:** Để lấy khóa API của Gemini AI (sử dụng cho tính năng AI Chat & AI Writing Evaluator).
4. **Resend Account:** Dịch vụ gửi email (sử dụng để gửi mã xác thực OTP khi người dùng đăng ký).
5. **Vercel Account:** Nền tảng tối ưu nhất để deploy ứng dụng Next.js.

---

## 🛠️ Các bước triển khai chi tiết

### Bước 1: Tạo dự án và cấu hình Database trên Supabase

1. Truy cập [Supabase](https://supabase.com/) và đăng nhập.
2. Tạo một **New Project** (chọn khu vực gần người dùng của bạn, ví dụ: Singapore `ap-southeast-1`).
3. Đặt mật khẩu database và lưu lại mật khẩu này.
4. Sau khi dự án tạo xong, vào **Project Settings (hình bánh răng)** -> **Database**.
5. Kéo xuống phần **Connection string**, chọn tab **URI** và sao chép:
   * **Pooled Connection (Cổng 6543):** Dùng cho biến `DATABASE_URL`. Nhớ thêm hậu tố `?pgbouncer=true&connection_limit=1` vào cuối chuỗi.
     * *Ví dụ:* `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
   * **Direct Connection (Cổng 5432):** Dùng cho biến `DIRECT_URL` (dùng khi chạy migrations và seed dữ liệu).
     * *Ví dụ:* `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

*(Lưu ý: Thay thế `[password]` bằng mật khẩu database thực tế bạn đã tạo ở trên).*

---

### Bước 2: Thiết lập khóa API cho các dịch vụ khác

1. **Google Gemini API Key:**
   * Truy cập [Google AI Studio](https://aistudio.google.com/).
   * Nhấn **Get API Key** và tạo một khóa mới.
2. **Resend API Key:**
   * Truy cập [Resend](https://resend.com/).
   * Vào phần **API Keys** -> **Create API Key**.
   * Để gửi email từ tên miền riêng (ví dụ: `no-reply@yourdomain.com`), bạn cần vào mục **Domains** trên Resend để cấu hình DNS xác thực tên miền của mình. Nếu chạy thử nghiệm, bạn có thể dùng địa chỉ mặc định do Resend cung cấp.
3. **JWT Secret:**
   * Đây là khóa bảo mật để mã hóa phiên đăng nhập của người dùng.
   * Bạn có thể tự tạo một chuỗi ngẫu nhiên dài hơn 32 ký tự bằng cách chạy lệnh này trong terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

---

### Bước 3: Cấu hình biến môi trường (Environment Variables)

Tạo file `.env.local` ở thư mục gốc của dự án (hoặc cấu hình trực tiếp trên Vercel Dashboard) với các biến sau:

```env
# ──────────────────────────────────────────────────────────────
# DATABASE CONNECTION (Supabase PostgreSQL)
# ──────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres.[ref_id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@db.[ref_id].supabase.co:5432/postgres"

# ──────────────────────────────────────────────────────────────
# AUTHENTICATION
# ──────────────────────────────────────────────────────────────
JWT_SECRET="chuoi_jwt_secret_ngau_nhien_sieu_bao_mat_cua_ban"

# ──────────────────────────────────────────────────────────────
# EMAIL SERVICES (Resend)
# ──────────────────────────────────────────────────────────────
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
EMAIL_FROM="HanziFlow <no-reply@yourdomain.com>"

# ──────────────────────────────────────────────────────────────
# AI ENGINE (Google Gemini)
# ──────────────────────────────────────────────────────────────
GEMINI_API_KEY="AIzaSy_your_gemini_api_key"

# ──────────────────────────────────────────────────────────────
# APP GENERAL CONFIGURATION
# ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://yourdomain.vercel.app" # Link trang web của bạn
```

---

### Bước 4: Đẩy cấu trúc bảng và dữ liệu mẫu lên Database

Dự án sử dụng **Prisma ORM** để tương tác với cơ sở dữ liệu. Bạn cần đẩy cấu trúc bảng và chạy tập lệnh nạp dữ liệu mẫu (seed) gồm các danh mục từ vựng HSK, câu hỏi Placement Test, cấu trúc bài học:

1. Mở terminal tại thư mục dự án và chạy lệnh đẩy cấu trúc bảng lên Supabase:
   ```bash
   npx prisma db push
   ```
2. Chạy lệnh nạp dữ liệu mẫu ban đầu:
   ```bash
   npx prisma db seed
   ```

*Sau khi chạy xong, database của bạn đã có đầy đủ dữ liệu từ vựng HSK, ngữ pháp, các bài kiểm tra đầu vào và hai tài khoản kiểm thử mặc định:*
* **Tài khoản Học viên:** `student@hanziflow.com` / Mật khẩu: `password123`
* **Tài khoản Admin:** `admin@hanziflow.com` / Mật khẩu: `password123`

---

### Bước 5: Deploy lên Vercel

1. Đẩy mã nguồn dự án lên một **Private Repository** trên GitHub. (Đảm bảo không push file `.env` hoặc `.env.local` lên GitHub).
2. Truy cập [Vercel](https://vercel.com/) và đăng nhập bằng tài khoản GitHub của bạn.
3. Nhấn **Add New...** -> **Project** -> Chọn repository **HanziFlow** vừa tạo.
4. Tại phần **Environment Variables**, điền đầy đủ các biến môi trường đã chuẩn bị ở **Bước 3**.
5. Nhấn nút **Deploy**. Vercel sẽ tự động build ứng dụng Next.js của bạn.
6. Sau khoảng 2-3 phút, trang web của bạn sẽ hoạt động trực tuyến. Hãy truy cập vào URL được Vercel cung cấp để kiểm tra ứng dụng.

---

### 🛡️ Lưu ý về bảo mật trước khi bàn giao
* **Thu hồi hoặc Reset khóa API cá nhân:** Trước khi gửi thư mục dự án dạng ZIP cho khách hàng hoặc mời họ vào repo, hãy chắc chắn rằng bạn đã xóa hoàn toàn file `.env.local` hoặc thay thế các giá trị bên trong bằng chuỗi trống/placeholders dạng `your_api_key_here`.
* **Database test:** Đảm bảo không chứa dữ liệu khách hàng cũ hoặc dữ liệu cá nhân của bạn trong cơ sở dữ liệu Supabase được bàn giao. Dữ liệu mẫu (seed) được thiết lập tự động là đủ cho khách hàng bắt đầu chạy thử.
