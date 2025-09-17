import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { userInfoDto } from 'src/users/dto/user-info.dto';

export class EmailPayload {
  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class ResetPasswordPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be have at least 8 characters, including 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.',
    },
  )
  @MaxLength(254)
  newPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

export class AuthResponse {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
  @ApiProperty()
  user?: userInfoDto;
}
