import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";

ffmpeg.setFfmpegPath(ffmpegStatic);

export async function compressVideo(inputPath) {
  const outputPath = join(tmpdir(), `${randomUUID()}.mp4`);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoBitrate("300k") // bitrate düşür
      .size("1280x720") // 720p’ye düşür (isteğe bağlı)
      .outputOptions("-crf 28") // kalite oranı
      .outputOptions("-preset veryfast")
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

  const buffer = await fs.readFile(outputPath);
  await fs.unlink(outputPath);
  return buffer;
}
