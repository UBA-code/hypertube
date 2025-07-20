import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { userInfoDto } from 'src/users/dto/user-info.dto';

export class EmailPayload {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
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
