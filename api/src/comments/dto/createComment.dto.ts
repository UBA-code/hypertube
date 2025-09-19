import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

export default class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @MaxLength(500)
  content: string;
}

export class RestFullCreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @MaxLength(500)
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  movie_id: string;
}
