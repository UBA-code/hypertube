import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { TorrentService } from './torrent.service';
import { Request, Response } from 'express';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import createStreamResponseDto from './interfaces/responses';

@Controller('torrent')
export class TorrentController {
  constructor(private readonly torrentService: TorrentService) {}

  @Get('stream/:imdbId')
  async getTorrentStream(
    @Param('imdbId') imdbId: string,
    @Query('quality') quality: string,
    @Req() req: Request,
  ): Promise<createStreamResponseDto> {
    console.log(
      `Fetching torrent stream for IMDB ID: ${imdbId}, Quality: ${quality}`,
    );
    if (!imdbId || !quality) {
      throw new BadRequestException('IMDB ID and quality are required');
    }
    return await this.torrentService.createStream(
      imdbId,
      quality,
      req.user['id'],
    );
  }

  //! for debugging with hls.js demo website
  // @SkipAuth()
  @Get('getStreamPlaylist/:imdbId/:quality')
  async getStreamPlaylist(
    @Param('imdbId') imdbId: string,
    @Param('quality') quality: string,
    @Res() res: Response,
  ) {
    //! for debugging with hls.js demo website
    // if (quality.startsWith('segment')) {
    //   return await this.serveSegment(imdbId, '1080p', quality, res);
    // }
    if (!imdbId || !quality || imdbId.length === 0 || quality.length === 0) {
      throw new BadRequestException('IMDB ID and quality are required');
    }
    return await this.torrentService.getStreamPlaylist(imdbId, quality, res);
  }

  //! for debugging with hls.js demo website
  // @SkipAuth()
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
