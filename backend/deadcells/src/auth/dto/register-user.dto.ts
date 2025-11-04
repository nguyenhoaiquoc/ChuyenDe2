<<<<<<< HEAD
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, Matches, MinLength } from 'class-validator';
=======
// register-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Matches(/@fit\.tdc\.edu\.vn$/, { message: 'Chỉ chấp nhận email sinh viên @fit.tdc.edu.vn' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @Matches(/(?=.*[A-Z])/, { message: 'Mật khẩu phải có ít nhất 1 chữ hoa' })
  @Matches(/(?=.*[a-z])/, { message: 'Mật khẩu phải có ít nhất 1 chữ thường' })
  @Matches(/(?=.*\d)/, { message: 'Mật khẩu phải có ít nhất 1 chữ số' })
  password: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

<<<<<<< HEAD
@IsOptional()
@IsNotEmpty({ message: 'Số điện thoại không được để trống nếu có nhập' })
@Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải gồm đúng 10 chữ số' })
phone?: string;


  @IsOptional()
  @IsNumber({}, { message: 'RoleId phải là số' })
  roleId?: number; // <-- thêm trường RoleId
=======
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải gồm đúng 10 chữ số' })
  phone?: string;
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
}
