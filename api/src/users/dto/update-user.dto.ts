import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'john' })
  @IsNotEmpty()
  @IsOptional()
  firstName: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'doe' })
  lastName: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  profilePicture: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'english' })
  preferredLanguage: string;
}
