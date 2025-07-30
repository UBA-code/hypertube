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
import { join } from 'path';
import * as fs from 'fs';
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
    const filePath = join(process.cwd(), 'torrents', decodeURIComponent(path));
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.status(416).send('Range header is required');
      return;
    } else {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).send('Requested range not satisfiable');
        return;
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'application/octet-stream',
      });
      const file = fs.createReadStream(filePath, { start, end });
      file.pipe(res);
    }
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
