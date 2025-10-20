import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',       // máy chủ Gmail
      port: 587,                    // cổng TLS
      secure: false,
      auth: {
        user: 'baohad987@gmail.com', // email bạn dùng để gửi OTP
        pass: 'lios zrli flvz zvvq', // app password Gmail (không dùng mật khẩu bình thường)
      },
    });
  }

  async sendOTP(to: string, otp: string) {
    // kiểm tra email có đuôi @fit.tdc.edu.vn
    if (!to.endsWith('@fit.tdc.edu.vn')) {
      throw new Error('Email không hợp lệ, chỉ chấp nhận @fit.tdc.edu.vn');
    }

    await this.transporter.sendMail({
      from: '"AppDoCu" <baohad987@gmail.com>', // tên hiển thị + email gửi
      to,                                       // email người nhận (sinh viên)
      subject: 'Mã OTP xác nhận đăng ký',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`,
    });
  }
}
