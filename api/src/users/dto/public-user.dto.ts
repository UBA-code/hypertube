import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserPublicDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  userName: string;

  @ApiProperty({ example: 'john' })
  firstName: string;

  @ApiProperty({ example: 'doe' })
  lastName: string;

  @ApiProperty()
  profilePicture: string;

  @Exclude()
  authType: string;
  @Exclude()
  email: string;
  @Exclude()
  password: string;
}
