import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 'john_doe' })
  userName: string;

  @ApiProperty({ example: 'john' })
  firstName: string;

  @ApiProperty({ example: 'doe' })
  lastName: string;

  @ApiProperty()
  avatar: string;

  @Exclude()
  email: string;
  @Exclude()
  password: string;
}
