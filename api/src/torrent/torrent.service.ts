import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { extname, join } from 'path';
import Movie from 'src/movies/entities/movie.entity';
import { MoviesService } from 'src/movies/movies.service';
import * as torrentStream from 'torrent-stream';
import streamResponseDto from './dto/stream-response.dto';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { scrapTorrentLinks } from './helpers/scrapTorrentLinks';
import * as ffmpeg from 'fluent-ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import Torrent from 'src/movies/entities/torrent.entity';
import { Repository } from 'typeorm';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as pump from 'pump';
@Injectable()
export class TorrentService {
  private readonly logger = new Logger(TorrentService.name);
  private readonly engines: Map<string, torrentStream.Engine> = new Map();
  constructor(
    private moviesService: MoviesService,
    @InjectRepository(Torrent) private torrentRepository: Repository<Torrent>,
  ) {}

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
    const torrent = movie.torrents.find(
      (torrent) => torrent.quality === quality,
    );
    const magnetUrl = torrent?.magnetLink;
    if (!magnetUrl) {
      console.error(`No magnet link found for movie: ${movie.title}`);
      return {
        success: false,
        message: 'No magnet link found for this movie.',
        streamUrl: null,
      };
    }
    if (torrent.downloadStatus === 'completed') {
      console.log('Torrent already downloaded:', torrent.path);
      return {
        success: true,
        message: 'Torrent already downloaded.',
        streamUrl: torrent.path,
      };
    }
    return new Promise(async (resolve, reject) => {
      let res;
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
        this.engines.set(desiredFile.path, engine);
        desiredFile.select();
        desiredFile.createReadStream();
        torrent.downloadStatus = 'downloading';
        torrent.path = desiredFile.path;
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
          torrent.downloadStatus = 'completed';
          this.engines.delete(torrent.path);
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
        this.engines.delete(torrent.path);
        console.error(`Error in torrent engine: ${err.message}`);
        reject({
          success: false,
          message: 'Error in torrent engine.',
        });
      });
    });
  }

  async startStreaming(path: string, req: Request, res: Response) {
    try {
      const torrent = await this.torrentRepository.findOne({
        where: { path: decodeURIComponent(path) },
        relations: ['movie'],
      });
      if (!torrent) {
        return { status: 404, message: 'torrent not found' };
      }
      if (torrent.downloadStatus === 'completed') {
        return await this.streamCompletedTorrent(path, req, res);
      }
    } catch (error) {
      console.error(`Error starting stream: ${error.message}`);
      return { status: 500, message: 'Error starting stream.' };
    }
  }

  async streamCompletedTorrent(path: string, req: Request, res: Response) {
    const torrentFile = join(
      process.cwd(),
      'torrents',
      decodeURIComponent(path),
    );
    const stat = await fs.promises.stat(torrentFile);
    const fileSize = stat.size;
    const range = req.headers.range;
    const start = parseInt(range.replace(/bytes=/, '').split('-')[0], 10);
    const end = Math.min(
      parseInt(range.replace(/bytes=/, '').split('-')[1], 10) || fileSize,
      fileSize - 1,
    );
    let headersIsSent = false;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(416).send('Requested range not satisfiable');
      return;
    }

    if (!range) {
      res.status(416).send('Range header is required');
      return;
    }
    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(416).send('Requested range not satisfiable');
      return;
    } else {
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'application/octet-stream',
        'content-disposition':
          'inline; filename=' + torrentFile.replace('.mkv', '.mp4'),
      });
      headersIsSent = true;
      //* Streaming the file
      const fileExt = extname(torrentFile).replace('.', '');
      console.log(`the file ext is ${fileExt}`);

      if (fileExt === 'mp4' || fileExt === 'webm') {
        const stream = fs.createReadStream(torrentFile, {
          start: start,
          end: end,
        });
        pump(stream, res);
        console.log(`streaming file: ${torrentFile}`);
      } else if (fileExt === 'mkv') {
        // console.log(`convert and stream file: ${torrentFile}`);
        // const command = ffmpeg(fs.createReadStream(torrentFile))
        //   .videoCodec('libvpx')
        //   .audioCodec('libvorbis')
        //   .format('webm')
        //   .audioBitrate(128)
        //   .videoBitrate(8000)
        //   .outputOptions([
        //     `-threads 5`,
        //     '-deadline realtime',
        //     '-error-resilient 1',
        //   ])
        //   .on('error', (err) => {});
      }
    }
  }

  async progressiveStream(path: string, req: Request, res: Response) {}

  async getEngine(path: string): Promise<torrentStream.Engine | null> {
    return this.engines.get(path) || null;
  }

  async getAvailableRanges(
    path: string,
  ): Promise<{ start: number; end: number }[]> {
    try {
      console.log(`Getting available ranges for : ${path}`);
      const engine = await this.getEngine(path);
      if (!engine) {
        throw new NotFoundException(
          'Torrent engine not found for the given path',
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

    if (!movie) {
      throw new NotFoundException('Movie not found');
    } else if (!movie.torrents || !movie.torrents.length) {
      movie.torrents = await scrapTorrentLinks(movie.title, movie.year);

      if (movie.title.length) await this.moviesService.save(movie);
    }

    return movie.torrents
      .map((torrent) => torrent.quality)
      .sort(
        (first, second) =>
          parseInt(second.replace('p', '')) - parseInt(first.replace('p', '')),
      )
      .reverse();
  }
}
