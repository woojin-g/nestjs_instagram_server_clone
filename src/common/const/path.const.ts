import { join } from "path";

// 프로젝트 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 저장할 폴더
export const PUBLIC_FOLDER_NAME = 'public';
// 포스트 이미지 파일 업로드 폴더
export const POSTS_FOLDER_NAME = 'posts';
// 임시 폴더 이름
export const TEMP_FOLDER_NAME = 'temp';

// public 폴더의 절대경로
// {projectRoot}/public
export const PUBLIC_FOLDER_ABSOLUTE_PATH = join(
  PROJECT_ROOT_PATH,
  PUBLIC_FOLDER_NAME,
);

// posts 폴더의 절대경로
// {projectRoot}/public/posts
export const POSTS_FOLDER_ABSOLUTE_PATH = join(
  PUBLIC_FOLDER_ABSOLUTE_PATH,
  POSTS_FOLDER_NAME,
);

// posts 폴더의 상대경로
// /public/posts
export const POSTS_FOLDER_RELATIVE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
);

// temp 폴더의 절대경로
// {projectRoot}/public/temp
export const TEMP_FOLDER_ABSOLUTE_PATH = join(
  PUBLIC_FOLDER_ABSOLUTE_PATH,
  TEMP_FOLDER_NAME,
);
