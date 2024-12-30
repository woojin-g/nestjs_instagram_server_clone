import { Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { BaseModel } from './entity/base.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class CommonService {
  async paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path?: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }
    return this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
  }
}
