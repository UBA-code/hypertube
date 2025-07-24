import { ApiProperty } from '@nestjs/swagger';

export default class SubtitleDto {
  @ApiProperty()
  language: string;

  @ApiProperty()
  url: string;
}
