// reset-password.dto.ts
<<<<<<< HEAD
import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
=======
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Token không được để trống' })
  // nếu token là UUID v4 như service phát hành:
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, {
    message: 'Token không hợp lệ',
  })
  token: string;

>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @Matches(/(?=.*[A-Z])/, { message: 'Mật khẩu phải có ít nhất 1 chữ hoa' })
  @Matches(/(?=.*[a-z])/, { message: 'Mật khẩu phải có ít nhất 1 chữ thường' })
  @Matches(/(?=.*\d)/, { message: 'Mật khẩu phải có ít nhất 1 chữ số' })
  newPassword: string;
<<<<<<< HEAD

  @IsNotEmpty({ message: 'Token không được để trống' })
  token: string;
=======
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
}
