# Kế hoạch tích hợp thanh toán (Stripe & các kênh)

Tài liệu này bám theo UI **Bước 3** trên trang `/?page=cart` (họ tên, ngày sinh, chọn phương thức). Hiện tại dữ liệu lưu **localStorage**; bước tiếp theo là backend + cổng thanh toán.

---

## 1. Nguyên tắc thực tế (quan trọng)

| Phương thức trên UI | Stripe có làm thay được không? | Hướng tích hợp thực tế |
|---------------------|-------------------------------|-------------------------|
| **Visa / Mastercard** | **Có** | **Stripe Checkout** hoặc **Payment Element** — đây là luồng chính cho thẻ. |
| **PayPal** | **Không** (Stripe không thay PayPal trong hầu hết case) | **PayPal Commerce Platform** (REST + JS SDK) hoặc **Braintree** (nếu gom nhiều cổng). |
| **Wise** | **Không** như “nút Wise” sẵn | **Hướng dẫn chuyển khoán**: IBAN / email Wise Business + **mã đơn**; hoặc email hóa đơn. |
| **Binance** | **Không** (Stripe không xử lý crypto cho mục tiêu này) | **Binance Pay API** (merchant) hoặc **hướng dẫn USDT** + xác nhận thủ công / webhook Binance nếu có. |
| **Remitly** | **Không** có checkout merchant chuẩn như Stripe | Khách chuyển qua app Remitly theo **hướng dẫn + reference**; bạn **xác nhận tay** hoặc qua thông báo ngân hàng. |
| **Revolut** | **Một phần** | Thẻ Revolut thường **chạy như thẻ Visa/MC** → **đã nằm trong Stripe**. **Revolut Business** có API riêng nếu bạn mở merchant Revolut. |

**Kết luận:** Một **Stripe** không đủ để “gói” PayPal, Wise, Binance, Remitly, Revolut như một API duy nhất. Kế hoạch hợp lý là **Stripe làm trục thẻ** + **từng kênh bổ sung** (PayPal SDK, hướng dẫn chuyển khoản, Binance Pay, v.v.).

---

## 2. Kiến trúc đề xuất

```
[Trình duyệt — trang cart]
        │
        ▼
[Backend của bạn — Node / Edge Functions]
  • Tạo đơn (orders) trong DB (Supabase hoặc khác)
  • Tạo PaymentIntent / Session (Stripe) HOẶC order PayPal
  • Lưu: userId, cart line items, email liên hệ, họ tên, ngày sinh, payment_method đã chọn
        │
        ├─► Stripe ──► thẻ Visa/MC, Apple Pay, Google Pay (tuỳ bật)
        ├─► PayPal API ──► redirect / popup PayPal
        ├─► “Manual rails” ──► trả về hướng dẫn Wise / Remitly + mã đơn; trạng thái pending
        └─► Binance Pay ──► tạo yêu cầu thanh toán / QR (nếu dùng API)
```

**Webhook:** Stripe `checkout.session.completed` / `payment_intent.succeeded`, PayPal `CAPTURE.COMPLETED`, v.v. → cập nhật `orders.status` → cho phép giao account game.

**PCI:** Không lưu số thẻ trên server của bạn; chỉ dùng token/session từ Stripe (và tương đương PayPal).

---

## 3. Stripe — các bước triển khai

1. Tạo tài khoản [Stripe](https://stripe.com), bật **test mode**.
2. Backend tạo **Checkout Session** hoặc **PaymentIntent** với `metadata`: `order_id`, `member_id`, `payment_method_choice=stripe_card`.
3. Frontend: redirect tới `session.url` hoặc mount **Payment Element** (SPA).
4. **Webhook** bảo mật (verify signature): đánh dấu đơn **paid**.
5. Go-live: chuyển secret key production, cấu hình domain, email khách hàng Stripe.

**Visa/Mastercard:** mặc định qua Stripe; không cần tích hợp riêng từng loại thẻ.

---

## 4. PayPal

1. Đăng ký **PayPal Business** + tạo app REST (client id / secret).
2. Luồng **Create Order → Approve → Capture** (Orders API v2).
3. Trên UI Bước 3: nếu `payment_method === paypal` → nút “Thanh toán PayPal” gọi backend tạo order PayPal, redirect hoặc JS SDK.
4. Webhook PayPal để đồng bộ trạng thái (tránh chỉ tin client).

---

## 5. Wise, Remitly (chuyển tiền / remittance)

- Coi là **thanh toán ngoài cổng**: tạo đơn trạng thái `awaiting_bank_transfer`.
- Hiển thị: số tài khoản / IBAN / tag Wise, **mã đơn bắt buộc trong nội dung chuyển khoản**.
- Nhân viên hoặc quy trình **xác nhận** khi tiền về (hoặc tích hợp thông báo ngân hàng nếu có).

Remitly: không kỳ vọng API checkout giống Stripe; chủ yếu **quy trình + reference**.

---

## 6. Binance

- **Binance Pay (merchant):** đăng ký merchant, dùng API tạo order thanh toán; webhook xác nhận.
- **Đơn giản hơn:** hiển thị địa chỉ ví + số tiền + memo; rủi ro và KYC cần cân nhắc; thường kết hợp xác nhận thủ công giai đoạn đầu.

---

## 7. Revolut

- **Khách trả bằng thẻ Revolut:** xử lý qua **Stripe** (coi như thẻ quốc tế).
- **Revolut Business:** nếu bạn nhận tiền qua Revolut Merchant, tích hợp theo tài liệu Revolut (song song với Stripe, không thay thế hoàn toàn).

---

## 8. Thứ tự nên làm (ưu tiên)

1. **Backend + bảng `orders`** (khóa với user đăng nhập, snapshot giỏ, email, họ tên, ngày sinh, `payment_method`).
2. **Stripe** (thẻ) — luồng end-to-end + webhook.
3. **PayPal** — nếu tỷ lệ khách dùng cao.
4. **Wise / Remitly** — màn “chờ chuyển khoản” + quy trình xác nhận.
5. **Binance** — sau khi có quy trình pháp lý / rủi ro rõ.

---

## 9. Tuân thủ & vận hành

- **GDPR / bảo vệ dữ liệu:** họ tên, ngày sinh, email là dữ liệu cá nhân — chính sách privacy, thời gian lưu, quyền xóa.
- **Độ tuổi:** có thể thêm kiểm tra từ `birthDate` (ví dụ ≥ 18) trước khi cho thanh toán.
- **Tranh chấp:** digital goods — cần log thời điểm thanh toán, email xác nhận, ID listing.

---

## 10. Liên kết với code hiện tại

- `src/shopCartStore.ts` — `CheckoutBuyerProfile`, `CheckoutPaymentMethod` (đồng bộ với radio Bước 3).
- Bước tiếp theo code: nút **“Thanh toán”** gọi API `POST /api/checkout` với body `{ cart, email, profile, paymentMethod }` → backend phân nhánh Stripe / PayPal / pending.

---

*Tài liệu có thể chỉnh lại theo quốc gia đăng ký doanh nghiệp, loại hình game account, và chính sách Stripe/PayPal tại thời điểm triển khai.*
