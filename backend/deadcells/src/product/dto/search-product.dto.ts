import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsArray,
  ValidateIf,
} from "class-validator";

export class SearchProductDto {
  @ApiPropertyOptional({
    description: "Tìm theo tên sản phẩm (>= 2 ký tự)",
    example: "iPhone",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Tìm theo mô tả sản phẩm",
    example: "chính hãng",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Giá tối thiểu",
    example: 1000000,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    description: "Giá tối đa",
    example: 20000000,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Tìm theo category hoặc subCategory",
    example: "Điện thoại",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "Trạng thái sản phẩm (1 hoặc nhiều)",
    isArray: true,
    example: ["Mới 100%", "Cũ"],
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.split(",") : value
  )
  @IsArray()
  @IsString({ each: true })
  condition?: string[];

  @ApiPropertyOptional({
    description: "Sắp xếp theo trường",
    example: "price",
    enum: ["created_at", "price"],
    default: "created_at",
  })
  @IsOptional()
  @IsIn(["created_at", "price"])
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Thứ tự sắp xếp",
    example: "desc",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sort?: string;

  @ApiPropertyOptional({
    description: "Trang hiện tại",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: "Số item mỗi trang",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit?: number;
  @ApiPropertyOptional({
  description: "Loại bài đăng (1 hoặc nhiều), ví dụ: 'Đăng bán', 'Đăng mua'",
  isArray: true,
  example: ["Đăng bán"],
})
@IsOptional()
@Transform(({ value }) =>
  typeof value === "string" ? value.split(",") : value
)
@IsArray()
@IsString({ each: true })
postType?: string[];

@ApiPropertyOptional({
  description: "Hình thức giao dịch (1 hoặc nhiều), ví dụ: 'Có giá', 'Miễn phí', 'Trao đổi'",
  isArray: true,
  example: ["Có giá", "Miễn phí"],
})
@IsOptional()
@Transform(({ value }) =>
  typeof value === "string" ? value.split(",") : value
)
@IsArray()
@IsString({ each: true })
dealType?: string[];

}
