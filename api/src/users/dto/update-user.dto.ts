import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'john' })
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'doe' })
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  profilePicture: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'english' })
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  preferredLanguage: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'name@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(254)
  email: string;
}
