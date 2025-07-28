import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { TorrentService } from './torrent.service';
import streamResponseDto from './dto/stream-response.dto';

@Controller('torrent')
export class TorrentController {
  constructor(private readonly torrentService: TorrentService) {}

  @Get(':imdbId')
  async getTorrentStream(
    @Param('imdbId') imdbId: string,
    @Body('quality') quality: string,
  ): Promise<streamResponseDto> {
    if (!imdbId || !quality) {
      throw new BadRequestException('IMDB ID and quality are required');
    }
    return await this.torrentService.getTorrentStream(imdbId, quality);
  }
}
