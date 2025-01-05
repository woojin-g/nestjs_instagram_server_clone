import { IsIn, IsNumber, IsOptional } from "class-validator";
import { numberValidationMessage } from "src/common/validation-pipe/validation-pipe-message";
import { BaseModel } from "../entity/base.entity";

export class BasePaginationRequestDto {
  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  page?: number;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  where__id__less_than?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt?: 'ASC' | 'DESC' = 'ASC';

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  take: number = 20;
}

export class BasePaginationResponseDto<T extends BaseModel> {
  data: T[];
}

export class PagePaginationResponseDto<T extends BaseModel> extends BasePaginationResponseDto<T> {
  total: number;
}

export class CursorPaginationResponseDto<T extends BaseModel> extends BasePaginationResponseDto<T> {
  count: number;
  cursor: {
    nextPostId?: number;
  };
  nextUrl: string;
}
