import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import Movie from 'src/movies/entities/movie.entity';
import { MoviesService } from 'src/movies/movies.service';
import * as torrentStream from 'torrent-stream';
import streamResponseDto from './dto/stream-response.dto';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { scrapTorrentLinks } from './helpers/scrapTorrentLinks';
@Injectable()
export class TorrentService {
  private readonly engines: Map<string, torrentStream.Engine> = new Map();
  constructor(private moviesService: MoviesService) {}

  async getTorrentStream(
    imdbId: string,
    quality: string,
  ): Promise<streamResponseDto> {
    const movie = await this.moviesService.findMovieBy({
      where: { imdbId },
      relations: ['torrents'],
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    } else if (!movie.torrents || !movie.torrents.length) {
      movie.torrents = await scrapTorrentLinks(movie.title, movie.year);
      if (movie.title.length) await this.moviesService.save(movie);
    }

    return await this.downloadTorrent(movie, quality);
  }

  async downloadTorrent(
    movie: Movie,
    quality: string,
  ): Promise<streamResponseDto> {
    if (movie.downloadStatus === 'completed') {
      return {
        success: true,
        message: 'Torrent already downloaded.',
        streamUrl: movie.streamUrl,
      };
    }
    return new Promise(async (resolve, reject) => {
      let res;
      const magnetUrl = movie.torrents.find(
        (torrent) => torrent.quality === quality,
      )?.magnetLink;
      try {
        res = await fetch(magnetUrl);
      } catch {
        console.log(`Failed to download torrent from: ${magnetUrl}`);
        return reject({
          success: false,
          message: 'Failed to download torrent file.',
        });
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`Downloading torrent from: ${magnetUrl}`);

      const engine = torrentStream(buffer, {
        path: join(process.cwd(), 'torrents'),
      });

      engine.on('ready', async () => {
        this.engines.set(movie.imdbId, engine);
        engine.files.forEach((file) => file.deselect());
        const desiredFile = engine.files.find((file) =>
          /\.(mp4|mkv|avi|mov|wmv|flv|webm|mpg|mpeg|m4v|3gp|3g2|ts|vob|ogv|rm|rmvb|asf|f4v)$/i.test(
            file.name,
          ),
        );
        if (!desiredFile) {
          console.error('No suitable video file found in torrent.');
          reject({
            success: false,
            message: 'No suitable video file found in torrent.',
          });
        }
        desiredFile.select();
        desiredFile.createReadStream();
        movie.downloadStatus = 'downloading';
        movie.streamUrl = desiredFile.path;
        await this.moviesService.save(movie);
        console.log(
          `video found with name ${desiredFile.name} will be saved to ${desiredFile.path}`,
        );

        engine.on('download', (piece) => {
          console.log(
            `Downloading piece ${piece} of movie ${desiredFile.name}`,
          );
        });
        engine.on('finish', () => {
          movie.downloadStatus = 'completed';
          movie.streamUrl = desiredFile.path;
          console.log(`${desiredFile.name} downloaded!`);
        });
        resolve({
          success: true,
          message: 'Torrent download started successfully.',
          streamUrl: desiredFile.path,
        });
      });
      engine.on('error', (err) => {
        this.engines.delete(movie.imdbId);
        console.error(`Error in torrent engine: ${err.message}`);
        reject({
          success: false,
          message: 'Error in torrent engine.',
        });
      });
    });
  }

  async getStreamByPath(
    path: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const filePath = join(process.cwd(), 'torrents', decodeURIComponent(path));
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const availableRanges = await this.getAvailableRanges(path);

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
      } else if (
        availableRanges.some((r) => start >= r.start && end <= r.end)
      ) {
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': 'application/octet-stream',
        });
        const file = fs.createReadStream(filePath, { start, end });
        file.pipe(res);
      } else {
        res.status(416).send('Requested range not available');
      }
    }
  }

  async getEngine(imdbId: string): Promise<torrentStream.Engine | null> {
    return this.engines.get(imdbId) || null;
  }

  async getAvailableRanges(
    imdbId: string,
  ): Promise<{ start: number; end: number }[]> {
    const engine = await this.getEngine(imdbId);
    if (!engine) {
      throw new BadRequestException(
        'Torrent engine not found for the given IMDB ID',
      );
    }
    const file = engine.files[0];
    const pieceLength = engine.torrent.pieceLength;
    const startPiece = (file.offset / pieceLength) | 0;
    const endPiece = ((file.offset + file.length - 1) / pieceLength) | 0;
    const availableRanges = [];
    let start = null;

    for (let i = startPiece; i <= endPiece; i++) {
      if (engine.bitfield.get(i)) {
        if (start === null) start = i * pieceLength; //? if start not found yet, set it
      } else if (start !== null) {
        //? if start is found and current piece is not available, set the end
        availableRanges.push({
          start: start,
          end: i * pieceLength - 1,
        });
        start = null;
      }
    }

    if (start !== null) {
      availableRanges.push({
        start: start,
        end: Math.min((endPiece + 1) * pieceLength, file.length) - 1,
      });
    }

    console.log('Available ranges:', availableRanges);
    return availableRanges;
  }

  async getAvailableQualities(imdbId: string): Promise<string[]> {
    const movie = await this.moviesService.findMovieBy({
      where: { imdbId },
      relations: ['torrents'],
    });

    if (!movie || !movie.torrents || !movie.torrents.length) {
      throw new NotFoundException('No torrents found for the given IMDB ID');
    }

    return movie.torrents.map((torrent) => torrent.quality);
  }
}
