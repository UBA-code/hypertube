import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class userInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profilePicture: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;
}
