import { IsNumber, IsOptional } from "class-validator";

export class OpenRoomDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  productId?: number;
}
