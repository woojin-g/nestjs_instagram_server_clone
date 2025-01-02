import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationRequestDto, CursorPaginationResponseDto, PagePaginationResponseDto } from './dto/base-pagination.dto';
import { BaseModel } from './entity/base.entity';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ENV_PROTOCOL_KEY } from './const/env-keys.const';
import { ENV_HOST_KEY } from './const/env-keys.const';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from './const/error.const';

@Injectable()
export class CommonService {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  async paginate<T extends BaseModel>(
    dto: BasePaginationRequestDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path?: string,
  ): Promise<PagePaginationResponseDto<T> | CursorPaginationResponseDto<T>> {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }
    return this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationRequestDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ): Promise<PagePaginationResponseDto<T>> {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, total] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total,
    }
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationRequestDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ): Promise<CursorPaginationResponseDto<T>> {
    const findOptions = this.composeFindOptions<T>(dto);

    const data = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const count = data.length;
    const lastItem = data.length > 0 && data.length === dto.take ? data[data.length - 1] : null;

    const nextUrl = lastItem && new URL(`${this.configService.get(ENV_PROTOCOL_KEY)}://${this.configService.get(ENV_HOST_KEY)}/${path}`);
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key] && key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }

      let key = null;
      if (dto.order__createdAt == 'ASC') {
        key = 'where__id__more_than';
      } else if (dto.order__createdAt == 'DESC') {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    const cursor = {
      nextPostId: lastItem?.id ?? null,
    };

    return {
      data,
      count,
      cursor,
      nextUrl: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationRequestDto,
  ) {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseFilter(key, value),
        }
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseFilter(key, value),
        }
      }
    }
    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseFilter<T extends BaseModel>(key: string, value: any):
    FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * 예를들어 where__id__more_than
     * __를 기준으로 나눴을때
     * 
     * ['where', 'id', 'more_than']으로 나눌 수 있다.
     */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`,
        ErrorCode.BAD_REQUEST,
      )
    }

    /**
     * 길이가 2일경우는
     * where__id = 3
     * 
     * FindOptionsWhere로 풀어보면
     * 아래와 같다
     * 
     * {
     *  where:{
     *      id: 3,
     *  }
     * }
     */
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;

      /**
       * field -> 'id'
       * value -> 3
       * 
       * {
       *      id: 3,
       * }
       */
      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우에는 Typeorm 유틸리티 적용이 필요한 경우다.
       * 
       * where__id__more_than의 경우
       * where는 버려도 되고 두번째 값은 필터할 키값이 되고
       * 세번째 값은 typeorm 유틸리티가 된다.
       * 
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후
       * 값에 적용 해준다.
       */

      // ['where', 'id', 'more_than']
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',')

      // field -> id
      // operator -> more_than
      // FILTER_MAPPER[operator] -> MoreThan
      if (operator === 'between') {
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      } else if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`)
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
