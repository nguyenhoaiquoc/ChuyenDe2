// src/product/dto/create-product.dto.ts

import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  Min,
  IsBoolean,
} from 'class-validator';

/**
 * Hàm trợ giúp an toàn để biến đổi chuỗi thành số hoặc null.
 * Đây là mấu chốt để giải quyết lỗi 'NaN'.
 */
const transformToNumberOrNull = ({ value }: { value: any }): number | null => {
  // 1. Thử phân tích cú pháp giá trị (ví dụ: "1", "abc", undefined, "null")
  const parsedValue = parseInt(value, 10);

  // 2. Nếu kết quả là NaN (ví dụ: parseInt("abc") hoặc parseInt(undefined))
  //    thì trả về null.
  if (isNaN(parsedValue)) {
    return null;
  }

  // 3. Nếu không, trả về giá trị số đã phân tích
  return parsedValue;
};

export class CreateProductDto {
  // ===== CÁC TRƯỜNG VĂN BẢN BẮT BUỘC =====

  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;

  /**
   * Giá (price) được gửi lên dưới dạng chuỗi (string)
   * (ví dụ: "10000" hoặc "0" nếu là trao đổi/tặng).
   * Service sẽ xử lý việc chuyển đổi nó thành số.
   */
  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address_json: string; // Đây là JSON đã được stringify

  // ===== CÁC TRƯỜNG ID SỐ BẮT BUỘC =====
  // @Type(() => Number) sẽ tự động chuyển chuỗi "1" -> 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  post_type_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  deal_type_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sub_category_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  condition_id: number; // Entity của bạn có 'condition'

  // ===== CÁC TRƯỜNG TÙY CHỌN (có thể là null) =====

  /**
   * 💡 Đây là trường gây ra lỗi 'NaN' của bạn.
   * Chúng ta dùng @Transform để xử lý nó một cách an toàn.
   */
  @IsOptional()
  @Transform(transformToNumberOrNull) // Dùng hàm trợ giúp
  product_type_id: number | null;

  @IsOptional()
  @Transform(transformToNumberOrNull) // Dùng hàm trợ giúp
  origin_id: number | null;

  @IsOptional()
  @Transform(transformToNumberOrNull) // Dùng hàm trợ giúp
  material_id: number | null;

  @IsOptional()
  @Transform(transformToNumberOrNull) // Dùng hàm trợ giúp
  size_id: number | null;

  @IsOptional()
  @Transform(transformToNumberOrNull)
  category_change_id: number | null;

  @IsOptional()
  @Transform(transformToNumberOrNull)
  sub_category_change_id: number | null;

  @IsOptional()
  @IsString()
  author: string | null;

  @IsOptional()
  @Transform(transformToNumberOrNull) // 'year' cũng có thể bị thiếu
  year: number | null;

  /**
   * Các trường này client gửi lên là chuỗi "true"/"false"
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_approved: boolean;
}
