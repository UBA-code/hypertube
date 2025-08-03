import { ApiProperty } from '@nestjs/swagger';

export default class streamResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  streamUrl?: string;

  @ApiProperty()
  message?: string;
}
