import axios from 'axios';
import Subtitle from '../entities/subtitles.entity';
import * as cheerio from 'cheerio';
import SubtitleDto from '../dto/subtitles.dto';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import { extname, join } from 'path';
import { v4 } from 'uuid';

async function getSpecificSubtitleLink(
  sub: SubtitleDto,
): Promise<SubtitleDto | null> {
  try {
    const response = await axios.get(sub.url);
    const html = response.data;
    const $ = cheerio.load(html);
    const downloadLink = $('a.download-subtitle').attr('href');

    if (downloadLink) {
      return {
        ...sub,
        url: `https://yifysubtitles.ch${downloadLink}`,
      };
    } else {
      console.warn(`No download link found for ${sub.language}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching subtitle link for ${sub.language}:`, error);
    return null;
  }
}

export async function scrapSubtitles(movieId: string): Promise<SubtitleDto[]> {
  try {
    const response = await axios.get(
      `https://yifysubtitles.ch/movie-imdb/${movieId}`,
    );
    const html = response.data;
    const $ = cheerio.load(html);
    const subs = $('tr[data-id]')
      .map((_, element): { rate: number; language: string; url: string } => ({
        rate: parseInt($(element).find('td.rating-cell > span').text()),
        language: $(element).find('span.sub-lang').text(),
        url: `https://yifysubtitles.ch${$(element).find('td:not(.uploader-cell) > a').attr('href')}`,
      }))
      .get()
      .sort((a, b) => b.rate - a.rate);
    const unDuplicatedSubs = subs.filter(
      (sub, index, self) =>
        index === self.findIndex((s) => s.language === sub.language),
    );
    const subtitlesWithDirectLinks = await Promise.all(
      unDuplicatedSubs.map(async (sub) => await getSpecificSubtitleLink(sub)),
    );

    return subtitlesWithDirectLinks.filter(Boolean);
  } catch (error) {
    console.error(`Error scraping subtitles for movie ID ${movieId}:`, error);
    return [];
  }
}

export async function scrapAndSaveSubtitles(movieId: string) {
  const subtitles = await scrapSubtitles(movieId);
  const readySubtitles: Subtitle[] = await Promise.all(
    subtitles.map(async (sub) => {
      const subtitle = new Subtitle();
      subtitle.language = sub.language;
      subtitle.url = await fetchAndExtractSrt(sub.url);
      if (!subtitle.url) {
        console.warn(`Failed to extract SRT for ${sub.language}`);
        return null;
      }
      return subtitle;
    }),
  );

  return readySubtitles.filter(Boolean);
}

export async function fetchAndExtractSrt(url: string): Promise<string | null> {
  try {
    // 1) Fetch the ZIP as an ArrayBuffer
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2) Open & scan for .srt entries
    const directory = await unzipper.Open.buffer(buffer);
    const entry = directory.files.find(
      (f) => extname(f.path).toLowerCase() === '.srt',
    );
    if (!entry) {
      console.log('No .srt file found in the ZIP');
      return null;
    }

    // 3) Prepare target folder & path
    const targetDir = join(process.cwd(), 'subtitles');
    try {
      await fs.promises.mkdir(targetDir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create subtitles directory: ${targetDir}`, err);
      throw Error();
    }
    const filename = `${v4()}${extname(entry.path)}`;
    const outPath = join(targetDir, filename);

    // 4) Extract the stream into a file
    await new Promise<void>((resolve, reject) => {
      entry
        .stream()
        .pipe(fs.createWriteStream(outPath))
        .on('finish', () => resolve())
        .on('error', (err) => reject(err));
    });

    return `subtitles/${filename}`;
  } catch (err) {
    console.log(`Error extracting SRT from ${url}:`, err);
    return null;
  }
}
