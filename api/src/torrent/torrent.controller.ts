import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { TorrentService } from './torrent.service';
import streamResponseDto from './dto/stream-response.dto';
import { Request, Response } from 'express';

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
    return await this.torrentService.getTorrentStream(imdbId, quality);
  }

  @Get('/stream')
  async getStreamByPath(
    @Query('path') path: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    console.log(`Fetching stream for path: ${path}`);
    return await this.torrentService.getStreamByPath(path, req, res);
  }

  @Get('availableQualities/:imdbId')
  async getAvailableQualities(
    @Param('imdbId') imdbId: string,
  ): Promise<string[]> {
    if (!imdbId) {
      throw new BadRequestException('IMDB ID is required');
    }
    return await this.torrentService.getAvailableQualities(imdbId);
  }

  @Get('availableRange')
  async getAvailableRanges(
    @Query('path') path: string,
    @Query('imdbId') imdbId: string,
  ): Promise<{ start: number; end: number }[]> {
    if (!path || !imdbId || path.trim() === '' || imdbId.trim() === '') {
      throw new BadRequestException('Path and IMDB ID are required');
    }
    return await this.torrentService.getAvailableRanges(imdbId);
  }
}
