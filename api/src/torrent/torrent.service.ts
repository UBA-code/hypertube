import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import Movie from 'src/movies/entities/movie.entity';
import { MoviesService } from 'src/movies/movies.service';
import * as torrentStream from 'torrent-stream';
import streamResponseDto from './dto/stream-response.dto';

@Injectable()
export class TorrentService {
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
        console.error(`Error in torrent engine: ${err.message}`);
        reject({
          success: false,
          message: 'Error in torrent engine.',
        });
      });
    });
  }
}
