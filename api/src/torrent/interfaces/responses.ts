import { ApiProperty } from '@nestjs/swagger';

export default class createStreamResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  hlsUrl?: string;

  @ApiProperty()
  movieId: string;
}
