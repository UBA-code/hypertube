import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { userInfoDto } from 'src/users/dto/user-info.dto';

export class EmailPayload {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordPayload {
  @ApiProperty()
  @IsNotEmpty()
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
