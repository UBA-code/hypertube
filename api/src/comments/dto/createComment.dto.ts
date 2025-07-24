import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export default class CreateCommentDto {
  @ApiProperty({ example: 'tt1234567' })
  @IsNotEmpty()
  movieImdbId: string;
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  content: string;
}
