import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MaxLength(100, { message: 'Tên nhóm không được vượt quá 100 ký tự' })
  name: string;


  @IsBoolean({ message: 'Trạng thái công khai phải là true hoặc false' })
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái công khai cho nhóm' })
  isPublic: boolean;
}