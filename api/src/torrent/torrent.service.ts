import { Injectable, NotFoundException } from '@nestjs/common';
import { extname, join } from 'path';
import Movie from 'src/movies/entities/movie.entity';
import { MoviesService } from 'src/movies/movies.service';
import * as torrentStream from 'torrent-stream';
import streamResponseDto from './dto/stream-response.dto';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { scrapTorrentLinks } from './helpers/scrapTorrentLinks';
import * as ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

@Injectable()
export class TorrentService {
  private readonly engines: Map<string, torrentStream.Engine> = new Map();
  constructor(private moviesService: MoviesService) {}

  async getTorrentStream(
    imdbId: string,
    quality: string,
  ): Promise<streamResponseDto> {
    try {
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
    } catch (error) {
      console.log(
        `Error fetching torrent stream for IMDB ID: ${imdbId}, Quality: ${quality}`,
        error,
      );
      return {
        success: false,
        message: 'Failed to fetch torrent stream.',
        streamUrl: null,
      };
    }
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
      const isMagnet = magnetUrl.startsWith('magnet:');

      if (!isMagnet) {
        try {
          res = await fetch(magnetUrl);
        } catch {
          console.log(`Failed to download torrent from: ${magnetUrl}`);
          return reject({
            success: false,
            message: 'Failed to download torrent file.',
          });
        }
      }

      const arrayBuffer = !isMagnet && (await res.arrayBuffer());
      const buffer = !isMagnet && Buffer.from(arrayBuffer);
      console.log(`Downloading torrent from: ${magnetUrl}`);

      const engine = torrentStream(isMagnet ? magnetUrl : buffer, {
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
        engine.on('idle', async () => {
          movie.downloadStatus = 'completed';
          movie.streamUrl = desiredFile.path;
          await this.moviesService.save(movie);
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
    try {
      const filePath = join(
        process.cwd(),
        'torrents',
        decodeURIComponent(path),
      );
      const stat = await fs.promises.stat(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      const movie = await this.moviesService.findMovieBy({
        where: { streamUrl: path },
      });
      const availableRanges = await this.getAvailableRanges(movie.imdbId);

      if (!range) {
        res.status(416).send('Range header is required');
        return;
      } else {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : start + 1024 * 1024; // if end not provided, set it 1mb
        if (
          availableRanges.some((r) => start >= r.start && end <= r.end) ||
          movie.downloadStatus === 'completed'
        ) {
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': 'application/octet-stream',
          });
          if (extname(filePath) === '.mp4') {
            const file = fs.createReadStream(filePath, { start, end });
            file.pipe(res);
          } else {
            console.log('----');

            console.log(ffmpegInstaller);
            ffmpeg.setFfmpegPath(ffmpegInstaller.path);
            ffmpeg(filePath)
              .format('mp4') // Convert to MP4 format
              .videoCodec('libx264') // Use H.264 codec for video
              .audioCodec('aac') // Use AAC codec for audio
              .on('error', (err) => {
                console.error('Error during video conversion:', err.message);
                res.status(500).send('Error during video conversion');
              })
              .on('end', () => {
                console.log('Video streaming completed');
              })
              .pipe(res, { end: true });
          }
        } else {
          res.status(444).send('Requested range not available');
        }
      }
    } catch (error) {
      console.log(`Error streaming file: ${error.message}`);
      res.status(200).send({
        success: false,
        message: 'Error streaming file.',
        error: error.message,
      });
    }
  }

  async getEngine(imdbId: string): Promise<torrentStream.Engine | null> {
    return this.engines.get(imdbId) || null;
  }

  async getAvailableRanges(
    imdbId: string,
  ): Promise<{ start: number; end: number }[]> {
    try {
      console.log(`Getting available ranges for IMDB ID: ${imdbId}`);
      const engine = await this.getEngine(imdbId);
      if (!engine) {
        throw new NotFoundException(
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
    } catch (error) {
      console.error(`Error getting available ranges: ${error.message}`);
      return [];
    }
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
