import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER || 'baohad987@gmail.com',
        pass: process.env.MAIL_PASS || 'lios zrli flvz zvvq', // dùng app password
      },
    });
  }

  async sendOTP(to: string, otp: string) {
    // ✅ kiểm tra domain email
    if (!to.endsWith('@fit.tdc.edu.vn')) {
      throw new InternalServerErrorException(
        'Email không hợp lệ, chỉ chấp nhận @fit.tdc.edu.vn',
      );
    }

    try {
      await this.transporter.sendMail({
        from: `"AppDoCu" <${process.env.MAIL_USER || 'baohad987@gmail.com'}>`,
        to,
        subject: 'Mã OTP xác nhận đăng ký',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h3>Mã OTP của bạn</h3>
            <p>Mã OTP của bạn là: <b>${otp}</b></p>
            <p>Mã này chỉ có hiệu lực trong 5 phút. 
            Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
          </div>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('Gửi email thất bại');
    }
  }
}
