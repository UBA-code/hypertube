import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export default class AuthLoginInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(20)
  userName: string;
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(254)
  password: string;
}
