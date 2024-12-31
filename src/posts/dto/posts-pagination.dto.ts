import { IsNumber, IsOptional } from "class-validator";
import { BasePaginationRequestDto } from "src/common/dto/base-pagination.dto";

export class PostsPaginationRequestDto extends BasePaginationRequestDto {
  @IsNumber()
  @IsOptional()
  where__likeCount__more_than: number;

  @IsNumber()
  @IsOptional()
  where__title__i_like: number;
}
