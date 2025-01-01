import { PickType } from "@nestjs/mapped-types";
import { UserModel } from "src/users/entity/users.entity";

export class RegisterUserDto extends PickType(UserModel, ['nickname', 'email', 'password']) { }