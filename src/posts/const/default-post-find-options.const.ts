import { FindManyOptions } from "typeorm";
import { PostModel } from "../entity/posts.entity";

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostModel> = {
  relations: {
    author: true,
    images: true,
    comments: { author: true },
  },
  select: {
    comments: {
      id: true,
      content: true,
      likeCount: true,
      createdAt: true,
      updatedAt: true,
      author: { id: true, nickname: true },
    },
  },
};