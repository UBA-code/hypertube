import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { extname, join } from 'path';
import Movie from 'src/movies/entities/movie.entity';
import { MoviesService } from 'src/movies/movies.service';
import * as torrentStream from 'torrent-stream';
import { Response } from 'express';
import * as fs from 'fs';
import { scrapTorrentLinks } from './helpers/scrapTorrentLinks';
import * as ffmpeg from 'fluent-ffmpeg';
import { InjectRepository } from '@nestjs/typeorm';
import Torrent from 'src/movies/entities/torrent.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import * as pump from 'pump';
import createStreamResponseDto from './interfaces/responses';
import { UsersService } from 'src/users/users.service';
import { Cron } from '@nestjs/schedule';
import { rm } from 'fs/promises';

@Injectable()
export class TorrentService {
  private readonly logger = new Logger(TorrentService.name);

  constructor(
    private moviesService: MoviesService,
    private usersService: UsersService,
    @InjectRepository(Torrent) private torrentRepository: Repository<Torrent>,
  ) {}

  /**
   * create a torrent engine and start the hls conversion
   * @param imdbId imdb ID of the movie
   * @param quality quality of the torrent
   * @returns a response object containing success status, movie ID, HLS URL, and message
   */
  async createStream(
    imdbId: string,
    quality: string,
    userId: number,
  ): Promise<createStreamResponseDto> {
    try {
      const movie = await this.moviesService.findMovieBy({
        where: { imdbId },
        relations: ['torrents'],
      });
      const user = await this.usersService.findOne({
        where: { id: userId },
        relations: ['watchedMovies'],
      });

      user.watchedMovies.push(movie);
      await this.usersService.saveUser(user);

      if (!movie) {
        throw new NotFoundException('Movie not found');
      } else if (!movie.torrents || !movie.torrents.length) {
        movie.torrents = await scrapTorrentLinks(movie.title, movie.year);

        if (movie.title.length) await this.moviesService.save(movie);
      }

      const { torrentFile, torrent } = await this.createTorrentEngine(
        movie,
        quality,
      );

      if (torrent.downloadStatus === 'completed') {
        this.logger.log(
          `Torrent already downloaded: ${torrent.hlsPlaylistPath}`,
        );
        torrent.lastWatched = new Date();
        await this.moviesService.save(movie);
        return {
          success: true,
          movieId: movie.imdbId,
          hlsUrl: torrent.hlsPlaylistPath,
          message: 'Stream already available',
        };
      }

      const hlsDir = join('hls', movie.imdbId, quality);

      const playlistPath = await this.startHlsConversion(
        torrentFile,
        hlsDir,
        movie.imdbId,
      );

      torrent.hlsPlaylistPath = playlistPath;
      torrent.lastWatched = new Date();
      await this.moviesService.save(movie);

      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          try {
            await fs.promises.access(
              join(process.cwd(), playlistPath),
              fs.constants.F_OK,
            );
            this.logger.log(
              `HLS playlist ready for IMDB ID: ${imdbId}, Quality: ${quality}`,
            );
            clearInterval(interval);
            resolve(true);
          } catch {
            this.logger.warn(
              `HLS playlist not ready yet for IMDB ID: ${imdbId}, Quality: ${quality}`,
            );
            return;
          }
        }, 1000);
      });

      return {
        success: true,
        movieId: movie.imdbId,
        hlsUrl: playlistPath,
        message: 'Stream started successfully',
      };
    } catch (error) {
      this.logger.log(
        `Error fetching torrent stream for IMDB ID: ${imdbId}, Quality: ${quality}`,
        error,
      );
      return {
        success: false,
        message: 'Failed to fetch torrent stream.',
        movieId: imdbId,
        hlsUrl: null,
      };
    }
  }

  async createTorrentEngine(
    movie: Movie,
    quality: string,
  ): Promise<{
    engine: TorrentStream.TorrentEngine;
    torrentFile: TorrentStream.TorrentFile;
    torrent: Torrent;
  } | null> {
    const torrent = movie.torrents.find(
      (torrent) => torrent.quality === quality,
    );
    const magnetUrl = torrent?.magnetLink;
    if (!magnetUrl) {
      this.logger.error(`No magnet link found for movie: ${movie.title}`);
      throw new NotFoundException(
        `No magnet link found for movie: ${movie.title}`,
      );
    }
    if (torrent.downloadStatus === 'completed') {
      this.logger.log(`Torrent already downloaded: ${torrent.hlsPlaylistPath}`);
      return {
        torrentFile: null,
        engine: null,
        torrent,
      };
    }

    return new Promise(async (resolve) => {
      let res;
      const isMagnet = magnetUrl.startsWith('magnet:');

      if (!isMagnet) {
        try {
          res = await fetch(magnetUrl);
        } catch {
          this.logger.log(`Failed to download torrent from: ${magnetUrl}`);
          throw new Error(
            'Failed to download torrent file. Please check the magnet link.',
          );
        }
      }

      const arrayBuffer = !isMagnet && (await res.arrayBuffer());
      const buffer = !isMagnet && Buffer.from(arrayBuffer);
      this.logger.log(
        `Downloading torrent from: ${isMagnet ? magnetUrl : 'buffer'}`,
      );
      const engine = torrentStream(isMagnet ? magnetUrl : buffer, {
        path: join('/tmp/torrents', movie.imdbId, quality),
      });

      engine.on('ready', async () => {
        engine.files.forEach((file) => file.deselect());
        const desiredFile = engine.files.find((file) =>
          /\.(mp4|mkv|avi|mov|wmv|flv|webm|mpg|mpeg|m4v|3gp|3g2|ts|vob|ogv|rm|rmvb|asf|f4v)$/i.test(
            file.name,
          ),
        );
        if (!desiredFile) {
          this.logger.error('No suitable video file found in torrent.');
          throw new NotFoundException(
            'No suitable video file found in torrent.',
          );
        }
        this.logger.log(`Found video file: ${desiredFile.name}`);
        desiredFile.select();
        desiredFile.createReadStream();
        torrent.downloadStatus = 'downloading';

        this.logger.log(
          `Starting download for movie: ${movie.title}, Quality: ${quality}`,
        );

        engine.on('download', (piece) => {
          this.logger.log(
            `Downloading piece ${piece} of movie ${desiredFile.name}`,
          );
        });
        engine.on('idle', async () => {
          torrent.downloadStatus = 'completed';
          await this.moviesService.save(movie);
          this.logger.log(`${desiredFile.name} downloaded!`);
        });
        resolve({ engine, torrentFile: desiredFile, torrent });
      });
      engine.on('error', (err) => {
        this.logger.error(`Error in torrent engine: ${err.message}`);
        throw new Error('Error in torrent engine.');
      });
    });
  }

  async startHlsConversion(videoFile: any, hlsDir: string, movieId: string) {
    return new Promise<string>(async (resolve) => {
      const hlsFullDir = join(process.cwd(), hlsDir);
      try {
        await fs.promises.mkdir(hlsFullDir, { recursive: true });
      } catch (err) {
        this.logger.warn(`Failed to create HLS directory: ${hlsFullDir}`, err);
        throw err;
      }
      const playlistPath = join(hlsFullDir, 'playlist.m3u8');
      const segmentPattern = join(hlsFullDir, 'segment_%03d.ts');

      this.logger.log(`Starting HLS conversion for movie: ${movieId}`);

      // Create readable stream from the torrent file
      const videoStream = videoFile.createReadStream();
      const fileExtension = extname(videoFile.name);
      let ffmpegCommand: ffmpeg.FfmpegCommand;
      // Check if we can copy streams without transcoding
      // const canCopyStreams = await this.canCopyStreamsForHls(videoFile);

      if (fileExtension === '.mp4') {
        this.logger.debug(
          `Using stream copy for ${fileExtension} file - no transcoding needed`,
        );
        ffmpegCommand = ffmpeg(videoStream)
          .addOptions([
            '-c copy', // Copy streams without re-encoding
            '-f hls',
            '-hls_time 4',
            '-hls_list_size 0',
            '-hls_flags independent_segments',
            '-hls_segment_filename',
            segmentPattern,
          ])
          .output(playlistPath);
      }
      // else if (['.mp4', '.webm'].includes(fileExtension)) {
      //   this.logger.log(`Transcoding ${fileExtension} file to HLS format`);
      //   ffmpegCommand = ffmpeg(videoStream)
      //     .addOptions([
      //       '-sn',
      //       '-c:v libx264',
      //       '-c:a aac',
      //       '-preset veryfast',
      //       '-f hls',
      //       '-hls_time 4',
      //       '-hls_list_size 0',
      //       '-hls_flags independent_segments',
      //       '-hls_segment_filename',
      //       segmentPattern,
      //     ])
      //     .output(playlistPath);
      // }
      // else if (['.mkv'].includes(fileExtension)) {
      else {
        this.logger.log(`Transcoding  ${fileExtension} file to HLS format`);
        // Setup FFmpeg conversion
        ffmpegCommand = this.getFFmpegMkvConversionCommand(
          videoStream,
          segmentPattern,
          playlistPath,
        );
      }
      // else {
      //   this.logger.error(
      //     `Unsupported file type: ${fileExtension}. Only .mp4, .mkv, and .webm files are supported.`,
      //   );
      //   throw new BadRequestException(
      //     `Unsupported file type: ${fileExtension}. Only .mp4, .mkv, and .webm files are supported.`,
      //   );
      // }

      // Handle FFmpeg events
      ffmpegCommand.on('start', (commandLine) => {
        this.logger.log(`FFmpeg started: ${commandLine}`);
      });

      ffmpegCommand.on('progress', (progress) => {
        resolve(join(hlsDir, 'playlist.m3u8'));
        if (progress.percent) {
          this.logger.log(
            `Conversion progress: ${Math.round(progress.percent)}%`,
          );
        }
      });

      ffmpegCommand.on('end', () => {
        this.logger.log(`HLS conversion completed for movie: ${movieId}`);
      });

      // Fallback to re-encoding if copy fails
      ffmpegCommand.on('error', () => {
        throw new Error('HLS conversion failed.');
      });

      // Start the conversion
      ffmpegCommand.run();
    });
  }

  async getStreamPlaylist(imdbId: string, quality: string, res: Response) {
    let playlistPath: string;
    try {
      const torrent = await this.torrentRepository.findOne({
        where: { movie: { imdbId }, quality },
        relations: ['movie'],
      });
      if (!torrent) {
        throw new NotFoundException(
          'Torrent not found for the given IMDB ID and quality',
        );
      }
      await fs.promises.access(
        join(process.cwd(), torrent.hlsPlaylistPath),
        fs.constants.F_OK,
      );
      playlistPath = join(
        process.cwd(),
        'hls',
        imdbId,
        quality,
        'playlist.m3u8',
      );
      console.log(`M3U8 file found at: ${playlistPath}`);
    } catch {
      console.error(`M3U8 file not found for IMDB ID: ${imdbId}`);
      throw new NotFoundException('M3U8 file not found');
    }

    pump(fs.createReadStream(playlistPath), res);
  }

  getFFmpegMkvConversionCommand(
    videoStream: fs.ReadStream,
    segmentPattern: string,
    playlistPath: string,
  ) {
    return ffmpeg(videoStream)
      .addOptions([
        '-sn', // Skip subtitle streams
        '-map 0:v:0', // Map first video stream
        '-map 0:a:0', // Map first audio stream

        // Video settings - force 8-bit and baseline profile
        '-c:v libx264',
        '-profile:v baseline', // Force baseline profile (not High)
        '-level 3.0',
        '-pix_fmt yuv420p', // Force 8-bit (not yuv420p10le)
        '-preset veryfast',

        // Audio settings - handle 6-channel properly
        '-c:a aac',
        '-ac 2', // Downmix 6 channels to stereo
        '-ar 48000', // Keep sample rate
        '-b:a 128k', // Set audio bitrate

        // Fix timing issues
        '-avoid_negative_ts make_zero',
        '-fflags +genpts',

        // HLS settings
        '-f hls',
        '-hls_time 4',
        '-hls_list_size 0',
        '-hls_flags independent_segments+split_by_time',
        '-hls_segment_type mpegts',
        '-hls_segment_filename',
        segmentPattern,

        // Additional compatibility fixes
        '-force_key_frames expr:gte(t,n_forced*4)', // Force keyframes every 4 seconds
        '-x264opts keyint=96:min-keyint=96:scenecut=-1', // GOP settings for 24fps
      ])
      .output(playlistPath);
  }

  async getSegment(
    imdbId: string,
    quality: string,
    segment: string,
    res: Response,
  ) {
    try {
      const torrent = await this.torrentRepository.findOne({
        where: { movie: { imdbId }, quality },
        relations: ['movie'],
      });
      if (!torrent) {
        this.logger.error(
          `Torrent not found for IMDB ID: ${imdbId}, Quality: ${quality}`,
        );
        throw new NotFoundException(
          'Torrent not found for the given IMDB ID and quality',
        );
      }

      // Validate segment filename
      if (!segment.match(/^segment_\d+\.ts$/)) {
        return res.status(400).json({
          error: 'Invalid segment format',
        });
      }

      const segmentPath = join(
        process.cwd(),
        torrent.hlsPlaylistPath,
        '../',
        segment,
      );

      try {
        // Check if segment exists
        await fs.promises.access(segmentPath, fs.constants.F_OK);
        console.log(`Segment file found at: ${segmentPath}`);
      } catch (error) {
        console.error(`Segment file not found: ${segmentPath}`, error);
        return res.status(404).json({
          error: 'Segment file not found',
          message: `Segment ${segment} for movie ${imdbId} not found in quality ${quality}`,
        });
      }

      // Get file size for headers
      const stats = await fs.promises.stat(segmentPath);

      // Set headers
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Last-Modified', stats.mtime.toUTCString());

      // Create and pipe file stream
      const fileStream = fs.createReadStream(segmentPath);

      fileStream.on('error', (error) => {
        res.status(500).json({
          error: 'Failed to stream segment',
          message: error.message,
        });
      });

      pump(fileStream, res);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to serve segment',
        message: error.message,
      });
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
      .reverse()
      .filter((quality, index, self) => self.indexOf(quality) === index);
  }

  async canCopyStreamsForHls(videoFile: any): Promise<boolean> {
    return await new Promise((resolve) => {
      const videoStream = videoFile.createReadStream();

      ffmpeg.ffprobe(videoStream, (err, metadata) => {
        if (err) {
          this.logger.warn(`Failed to probe video file: ${err.message}`);
          resolve(false);
          return;
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video',
        );
        const audioStream = metadata.streams.find(
          (s) => s.codec_type === 'audio',
        );

        // Check if video codec is H.264 and audio codec is AAC
        const isVideoCompatible = videoStream?.codec_name === 'h264';
        const isAudioCompatible = audioStream?.codec_name === 'aac';

        // Check if video is baseline profile (most compatible)
        const profileValue =
          typeof videoStream?.profile === 'string'
            ? videoStream?.profile
            : String(videoStream?.profile);

        const isBaselineProfile =
          profileValue === 'Baseline' ||
          profileValue === 'Constrained Baseline';

        const isCompatible =
          isVideoCompatible && isAudioCompatible && isBaselineProfile;

        this.logger.log(
          `Video compatibility check: Video=${isVideoCompatible}, Audio=${isAudioCompatible}, Profile=${isBaselineProfile}`,
        );

        resolve(isCompatible);
      });
    });
  }

  @Cron('0 0 * * *')
  async deleteUnwantedTorrents() {
    this.logger.log('cron called');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oldTorrents = await this.torrentRepository.find({
      where: {
        lastWatched: LessThanOrEqual(oneMonthAgo),
      },
      relations: ['movie'],
    });
    await Promise.all(
      oldTorrents.map(async (torrent) => {
        try {
          const dirToDelete = torrent.hlsPlaylistPath
            .split('/')
            .slice(0, -1)
            .join('/');

          this.logger.log(`Deleting torrent movie ${dirToDelete}`);
          await rm(dirToDelete, { recursive: true, force: true });
          await rm(
            join('/tmp/torrents', torrent.movie.imdbId, torrent.quality),
            { recursive: true, force: true },
          );
          torrent.downloadStatus = 'not_started';
          torrent.lastWatched = null;
          torrent.hlsPlaylistPath = null;
          this.logger.log(`Deleted torrent ${torrent.id} successfully`);
        } catch (err) {
          this.logger.error(`Failed to delete torrent ${torrent.id}`);
          this.logger.error(err);
        }
      }),
    );
    await this.torrentRepository.save(oldTorrents);
  }
}
