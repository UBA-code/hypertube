import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { TorrentService } from './torrent.service';
import streamResponseDto from './dto/stream-response.dto';
import { Response } from 'express';

@Controller('torrent')
export class TorrentController {
  constructor(private readonly torrentService: TorrentService) {}

  @Get('stream/:imdbId')
  async getTorrentStream(
    @Param('imdbId') imdbId: string,
    @Query('quality') quality: string,
  ): Promise<streamResponseDto> {
    console.log(
      `Fetching torrent stream for IMDB ID: ${imdbId}, Quality: ${quality}`,
    );
    if (!imdbId || !quality) {
      throw new BadRequestException('IMDB ID and quality are required');
    }
    return await this.torrentService.createStream(imdbId, quality);
  }

  @Get('getStreamPlaylist/:imdbId/:quality')
  async getStreamPlaylist(
    @Param('imdbId') imdbId: string,
    @Param('quality') quality: string,
    @Res() res: Response,
  ) {
    if (!imdbId || !quality || imdbId.length === 0 || quality.length === 0) {
      throw new BadRequestException('IMDB ID and quality are required');
    }
    return await this.torrentService.getStreamPlaylist(imdbId, quality, res);
  }

  @Get('getSegment/:imdbId/:quality/:segment')
  @Header('Content-Type', 'video/MP2T')
  @Header('Accept-Ranges', 'bytes')
  async serveSegment(
    @Param('imdbId') imdbId: string,
    @Param('quality') quality: string,
    @Param('segment') segment: string,
    @Res() res: Response,
  ) {
    if (
      !imdbId ||
      !quality ||
      !segment ||
      imdbId.length === 0 ||
      quality.length === 0 ||
      segment.length === 0
    ) {
      throw new BadRequestException(
        'IMDB ID, quality, and segment are required',
      );
    }
    return await this.torrentService.getSegment(imdbId, quality, segment, res);
  }

  @Get('availableQualities/:imdbId')
  async getAvailableQualities(
    @Param('imdbId') imdbId: string,
  ): Promise<string[]> {
    if (!imdbId || imdbId.length === 0) {
      throw new BadRequestException('IMDB ID is required');
    }
    return await this.torrentService.getAvailableQualities(imdbId);
  }
}
