import { IsIn, IsNumber, IsOptional } from "class-validator";
import { numberValidationMessage } from "src/common/validation-message/validation-message";

export class BasePaginationDto {
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