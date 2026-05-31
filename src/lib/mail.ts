// src/lib/mail.ts
import { Resend } from 'resend'

// Khởi tạo client Resend nếu có API Key
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

/**
 * Gửi email OTP xác nhận đăng ký tài khoản qua Resend
 * @param email Địa chỉ email người nhận
 * @param code Mã OTP 6 chữ số
 * @returns boolean trạng thái gửi thành công
 */
export async function sendOTPEmail(email: string, code: string): Promise<boolean> {
  if (!resend) {
    console.warn(`[MAIL SERVICE] RESEND_API_KEY không được thiết lập. Không thể gửi email thật. (Mã OTP cho ${email}: ${code})`)
    return false
  }

  // Email gửi đi mặc định từ Resend test nếu bạn chưa cấu hình Domain riêng
  // Khi đã cấu hình Domain riêng, hãy thay đổi thành 'otp@hanziflow.com' hoặc địa chỉ tương ứng của bạn.
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  try {
    const { data, error } = await resend.emails.send({
      from: `HanziFlow <${fromAddress}>`,
      to: [email],
      subject: `[HanziFlow] Mã OTP xác nhận đăng ký tài khoản của bạn`,
      html: `
        <div style="font-family: 'Be Vietnam Pro', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 10px 20px; background-color: #E63946; color: #ffffff; font-weight: 800; font-size: 20px; border-radius: 6px; letter-spacing: 0.5px;">
              HanziFlow
            </div>
          </div>
          
          <!-- Title -->
          <h2 style="color: #1f2937; text-align: center; font-size: 20px; font-weight: 700; margin: 0 0 15px 0;">
            Xác thực tài khoản của bạn
          </h2>
          
          <p style="font-size: 13.5px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Xin chào,
          </p>
          <p style="font-size: 13.5px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Cảm ơn bạn đã lựa chọn đồng hành cùng **HanziFlow** trên lộ trình chinh phục Hán ngữ. Để hoàn tất quy trình đăng ký tài khoản mới, vui lòng sử dụng mã OTP dưới đây:
          </p>
          
          <!-- OTP Code Display -->
          <div style="background-color: #fafafa; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 18px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #111827; font-family: Courier New, Courier, monospace;">${code}</span>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
            * Lưu ý: Mã xác thực có hiệu lực trong vòng 10 phút. Không chia sẻ mã này cho bất kỳ ai.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 25px 0;" />
          
          <!-- Footer -->
          <p style="font-size: 11px; text-align: center; color: #9ca3af; line-height: 1.5; margin: 0;">
            Nếu bạn không thực hiện yêu cầu đăng ký này, bạn có thể yên tâm bỏ qua email này.<br />
            HanziFlow © 2026 - Học Hán tự mô phỏng thực tế.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[MAIL SERVICE] Lỗi khi gửi mail qua Resend API:', error)
      return false
    }

    console.log(`[MAIL SERVICE] Đã gửi email OTP thành công đến ${email} (ID: ${data?.id})`)
    return true
  } catch (err) {
    console.error('[MAIL SERVICE] Gặp ngoại lệ khi kết nối gửi mail:', err)
    return false
  }
}
