// ! 테스트용 시크릿 키
// ! 실제 서비스에서는 환경변수로 관리
export const JWT_SECRET = 'blueofficial0119';
export const HASH_ROUNDS = 10;

export enum TokenPrefix {
  BEARER = 'Bearer',
  BASIC = 'Basic',
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
