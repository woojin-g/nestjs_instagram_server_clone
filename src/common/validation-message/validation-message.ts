import { ValidationArguments } from "class-validator";

export const booleanValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 boolean 타입이어야 합니다.`;
};

export const numberValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 number 타입이어야 합니다.`;
};

export const stringValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 string 타입이어야 합니다.`;
};

export const emailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 이메일 형식이어야 합니다.`;
};

export const notEmptyValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 비어있을 수 없습니다.`;
};

export const lengthValidationMessage = (args: ValidationArguments) => {
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}자 이상 ${args.constraints[1]}자 이하로 입력해주세요.`;
  }
  if (args.constraints.length === 1) {
    return `${args.property}은 ${args.constraints[0]}자 이상 입력해주세요.`;
  }
  return `${args.property}을 입력해주세요.`;
};