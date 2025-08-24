# Fashion Store - Website Shop Quần Áo Thời Trang

## Mô tả
Website shop quần áo thời trang với thiết kế đơn giản, tinh tế và đẹp mắt sử dụng màu trắng đen. Website được xây dựng với HTML, CSS và JavaScript thuần, tích hợp chatbot AI thông minh sử dụng OpenAI API và lưu trữ dữ liệu trên Supabase.

## Tính năng chính

### 🎨 Thiết kế
- **Màu sắc**: Trắng đen tinh tế, hiện đại
- **Typography**: Font Inter cho giao diện sạch sẽ
- **Responsive**: Tương thích mọi thiết bị (desktop, tablet, mobile)
- **Animation**: Hiệu ứng mượt mà, chuyên nghiệp

### 🛍️ Chức năng mua sắm
- **Hiển thị sản phẩm**: Grid layout đẹp mắt
- **Thêm vào giỏ hàng**: Chức năng tương tác
- **Yêu thích**: Thêm/xóa sản phẩm yêu thích
- **Xem chi tiết**: Modal popup với thông tin đầy đủ
- **Chọn size**: S, M, L, XL
- **Chọn số lượng**: Tăng/giảm số lượng sản phẩm

### 🤖 Chatbot AI thông minh
- **Tích hợp OpenAI**: Sử dụng GPT-3.5-turbo
- **Tư vấn thời trang**: Trả lời thông minh về sản phẩm
- **Lưu trữ cuộc trò chuyện**: Supabase database
- **Session management**: Quản lý phiên trò chuyện
- **Giao diện đẹp**: Thiết kế phù hợp với website
- **Responsive**: Hoạt động tốt trên mọi thiết bị

### 🔍 Tìm kiếm
- **Tìm kiếm nhanh**: Modal popup tìm kiếm
- **Gợi ý tìm kiếm**: Tags phổ biến
- **Tìm kiếm theo từ khóa**: Nhập tên sản phẩm

### 📱 Navigation
- **Menu responsive**: Hamburger menu cho mobile
- **Smooth scrolling**: Cuộn mượt đến các section
- **Fixed navbar**: Thanh điều hướng cố định
- **Icons**: Tìm kiếm, giỏ hàng, tài khoản

### 📞 Liên hệ
- **Form liên hệ**: Gửi tin nhắn trực tiếp
- **Thông tin liên hệ**: Địa chỉ, điện thoại, email
- **Validation**: Kiểm tra thông tin bắt buộc

## Cấu trúc thư mục
```
webstie/
├── index.html          # Trang chủ
├── styles.css          # File CSS chính
├── script.js           # File JavaScript frontend
├── server.js           # Node.js backend server
├── package.json        # Dependencies và scripts
├── .env.example        # File mẫu cho environment variables
└── README.md           # Hướng dẫn sử dụng
```

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (version 14.0.0 trở lên)
- npm hoặc yarn
- OpenAI API key
- Supabase account và project

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Thiết lập Supabase

#### 2.1. Tạo Supabase Project
1. Truy cập [Supabase](https://supabase.com) và tạo tài khoản
2. Tạo project mới
3. Đợi project được thiết lập hoàn tất

#### 2.2. Tạo bảng conversations
Trong Supabase Dashboard, vào SQL Editor và chạy lệnh SQL sau:

```sql
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  conversation_id TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb
);

-- Tạo index để tối ưu hiệu suất
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
```

#### 2.3. Lấy Supabase Credentials
1. Vào Settings → API trong Supabase Dashboard
2. Copy "Project URL" và "anon public" key
3. Lưu lại để sử dụng trong file .env

### Bước 3: Cấu hình Environment Variables
1. Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```

2. Chỉnh sửa file `.env` và thêm các thông tin cần thiết:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3000
```

**Lưu ý quan trọng:**
- Thay `your_actual_openai_api_key_here` bằng OpenAI API key thật của bạn
- Thay `your_supabase_project_url_here` bằng Supabase Project URL
- Thay `your_supabase_anon_key_here` bằng Supabase anon/public key
- Lấy API keys từ [OpenAI Platform](https://platform.openai.com/api-keys)
- Không bao giờ commit file `.env` vào git

### Bước 4: Chạy server
```bash
# Chế độ development (với auto-restart)
npm run dev

# Chế độ production
npm start
```

### Bước 5: Truy cập website
Mở trình duyệt và truy cập: `http://localhost:3000`

## API Endpoints

### Chat API
- `POST /api/chat` - Gửi tin nhắn và nhận phản hồi từ AI
- `GET /api/conversation/:sessionId` - Lấy lịch sử cuộc trò chuyện
- `DELETE /api/conversation/:sessionId` - Xóa cuộc trò chuyện

### Utility API
- `GET /api/health` - Kiểm tra trạng thái server và database
- `GET /api/sessions` - Lấy danh sách các session đang hoạt động

## Database Schema

### Bảng conversations
```sql
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  conversation_id TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb
);
```

**Cấu trúc messages JSONB:**
```json
[
  {
    "role": "user",
    "content": "Xin chào",
    "timestamp": "2024-01-01T10:00:00.000Z"
  },
  {
    "role": "assistant", 
    "content": "Xin chào! Tôi là trợ lý AI của Fashion Store...",
    "timestamp": "2024-01-01T10:00:01.000Z"
  }
]
```

## Cách sử dụng

### 1. Mở website
- Truy cập `http://localhost:3000` sau khi chạy server
- Website sẽ hiển thị đầy đủ với chatbot ở góc phải

### 2. Sử dụng chatbot
- **Mở chatbot**: Click nút chat tròn ở góc phải màn hình
- **Gửi tin nhắn**: Nhập tin nhắn và nhấn Enter hoặc click nút gửi
- **Thu nhỏ**: Click nút minimize để thu gọn chatbot
- **Đóng**: Click nút X để đóng hoàn toàn

### 3. Tính năng chatbot
Chatbot có thể trả lời về:
- **Thông tin sản phẩm**: Mô tả, giá cả, chất liệu
- **Tư vấn thời trang**: Gợi ý phối đồ, chọn size
- **Chính sách mua hàng**: Giao hàng, đổi trả, bảo hành
- **Hỗ trợ khách hàng**: Liên hệ, hướng dẫn mua hàng

### 4. Điều hướng website
- **Trang chủ**: Hero section với thông tin chính
- **Sản phẩm**: Xem danh sách sản phẩm nổi bật
- **Về chúng tôi**: Thông tin thương hiệu
- **Liên hệ**: Form liên hệ và thông tin

## Tính năng responsive

### Desktop (> 768px)
- Layout 2 cột cho hero section
- Grid 4 cột cho categories
- Grid 3 cột cho products
- Side-by-side layout cho about và contact
- Chatbot 350px width

### Tablet (768px - 480px)
- Layout 1 cột cho hero section
- Grid 2 cột cho categories và products
- Stacked layout cho about và contact
- Chatbot 90% width

### Mobile (< 480px)
- Layout 1 cột cho tất cả sections
- Hamburger menu
- Full-width buttons
- Optimized spacing
- Chatbot 95% width, 60vh height

## Hiệu ứng và Animation

### Loading
- Fade in animation khi trang load
- Smooth transitions cho tất cả elements

### Hover Effects
- Scale animation cho buttons
- Color transitions cho links
- Shadow effects cho cards

### Scroll Animations
- Intersection Observer cho fade-in effects
- Navbar background change on scroll
- Smooth scrolling to sections

### Modal Animations
- Fade in/out cho modals
- Slide up/down animations
- Backdrop blur effects

### Chatbot Animations
- Typing indicator với dots animation
- Message fade-in effects
- Smooth transitions cho open/close

## Thông báo hệ thống

### Success Notifications
- Thêm vào giỏ hàng thành công
- Gửi tin nhắn thành công
- Thêm vào yêu thích
- Xóa cuộc trò chuyện thành công

### Error Notifications
- Chưa chọn size sản phẩm
- Form chưa điền đầy đủ thông tin
- Lỗi kết nối với server
- Lỗi khi xử lý tin nhắn
- Lỗi kết nối database

### Info Notifications
- Đang tìm kiếm sản phẩm
- Chuyển đến trang thanh toán
- Server health status

## Tùy chỉnh

### Màu sắc
```css
/* Primary colors */
--primary-black: #000;
--primary-white: #fff;
--gray-light: #f8f9fa;
--gray-medium: #666;
--gray-dark: #333;
```

### Font
```css
/* Typography */
font-family: 'Inter', sans-serif;
```

### Spacing
```css
/* Container */
max-width: 1200px;
padding: 0 20px;
```

### OpenAI Configuration
```javascript
// Trong server.js
const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Có thể đổi thành gpt-4
    messages: messages,
    max_tokens: 500,        // Điều chỉnh độ dài phản hồi
    temperature: 0.7,       // Điều chỉnh tính sáng tạo
});
```

### Supabase Configuration
```javascript
// Trong server.js
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
```

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance
- Optimized CSS animations
- Efficient JavaScript event handling
- Minimal dependencies
- Fast loading times
- Database-backed conversation storage
- Automatic conversation management

## Troubleshooting

### Lỗi thường gặp

1. **"Failed to process message" error**
   - Kiểm tra OpenAI API key có đúng không
   - Đảm bảo có đủ credits trong tài khoản OpenAI
   - Kiểm tra kết nối internet

2. **"Supabase connection failed" error**
   - Kiểm tra SUPABASE_URL và SUPABASE_KEY trong file .env
   - Đảm bảo Supabase project đang hoạt động
   - Kiểm tra bảng conversations đã được tạo chưa

3. **"CORS errors"**
   - Backend đã được cấu hình CORS cho frontend
   - Nếu chạy trên port khác, cập nhật cấu hình CORS

4. **"Port already in use"**
   - Thay đổi PORT trong file `.env`
   - Hoặc kill process đang sử dụng port đó

5. **"Database table not found"**
   - Chạy lại lệnh SQL tạo bảng conversations
   - Kiểm tra quyền truy cập database

6. **Chatbot không hoạt động**
   - Kiểm tra server có đang chạy không
   - Kiểm tra console browser có lỗi gì không
   - Kiểm tra network tab trong DevTools

### Debugging
- Kiểm tra console browser cho lỗi frontend
- Kiểm tra console server cho lỗi backend
- Sử dụng endpoint `/api/health` để kiểm tra trạng thái server và database
- Sử dụng endpoint `/api/sessions` để xem các session đang hoạt động
- Kiểm tra Supabase Dashboard để xem dữ liệu conversations

## Security Notes
- Không bao giờ commit file `.env` vào version control
- API keys phải được bảo mật và không chia sẻ
- File `.env` đã được thêm vào `.gitignore`
- Supabase Row Level Security (RLS) có thể được bật để bảo mật dữ liệu
- Conversations được lưu trong database với timestamp

## Database Management

### Backup Conversations
```sql
-- Export conversations
SELECT * FROM conversations WHERE created_at > NOW() - INTERVAL '30 days';
```

### Cleanup Old Conversations
```sql
-- Xóa conversations cũ hơn 30 ngày
DELETE FROM conversations WHERE created_at < NOW() - INTERVAL '30 days';
```

### Monitor Database Usage
- Sử dụng Supabase Dashboard để theo dõi usage
- Kiểm tra storage và bandwidth usage
- Monitor query performance

## Tương lai phát triển
- [ ] User authentication với Supabase Auth
- [ ] Shopping cart functionality
- [ ] Payment gateway integration
- [ ] Product database
- [ ] Admin panel
- [ ] Multi-language support
- [ ] SEO optimization
- [ ] Analytics và tracking
- [ ] Voice input/output cho chatbot
- [ ] Image recognition cho sản phẩm
- [ ] Real-time notifications
- [ ] Advanced conversation analytics

## License
MIT License - feel free to use this project for your own applications!

## Liên hệ
Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ qua form trên website hoặc email: info@fashionstore.com

---
**Fashion Store** - Thời trang đẳng cấp cho mọi người với AI chatbot thông minh và Supabase database 🤖🗄️✨
