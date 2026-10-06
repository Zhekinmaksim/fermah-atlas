import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const videos = [
  {id: 'Week22', file: 'spotlight-week-22.mp4', frames: 786, scenes: 12},
  {id: 'Stats20', file: 'atlas-stats-20s.mp4', frames: 589, scenes: 9},
];
const run = (tool, args, binary = false) => {
  const result = spawnSync(tool, args, {
    encoding: binary ? undefined : 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(String(result.stderr || result.error));
  return result;
};
const bar = (n) => Math.round(n * 65.4545);
const reports = [];

for (const expected of videos) {
  const path = resolve(root, 'out', expected.file);
  const probe = JSON.parse(run('ffprobe', [
    '-v', 'error', '-count_frames', '-show_format', '-show_streams', '-of', 'json', path,
  ]).stdout);
  const video = probe.streams.find((stream) => stream.codec_type === 'video');
  const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
  assert(video && audio, `${expected.id}: expected video and audio streams`);
  assert.equal(video.codec_name, 'h264');
  assert.equal(video.width, 1920);
  assert.equal(video.height, 1080);
  assert.equal(video.r_frame_rate, '30/1');
  assert(['yuv420p', 'yuvj420p'].includes(video.pix_fmt), 'Expected 8-bit 4:2:0 video');
  assert.equal(Number(video.nb_read_frames), expected.frames);
  // AAC encoder padding can extend the container by less than two video frames.
  assert(Math.abs(Number(probe.format.duration) - expected.frames / 30) < 2 / 30);
  assert(Math.abs(Number(audio.duration) - Number(video.duration)) < 2 / 30);
  assert.equal(audio.codec_name, 'aac');
  assert.equal(audio.channels, 2);

  run('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-i', path, '-f', 'null', '-']);
  const levels = run('ffmpeg', [
    '-hide_banner', '-i', path, '-vn', '-af', 'volumedetect', '-f', 'null', '-',
  ]).stderr;
  const meanDb = Number(levels.match(/mean_volume: ([\d.-]+) dB/)?.[1]);
  const maxDb = Number(levels.match(/max_volume: ([\d.-]+) dB/)?.[1]);
  assert(Number.isFinite(meanDb) && meanDb > -50, `${expected.id}: silent audio`);

  const dir = resolve(root, 'out', 'encoded-frames', expected.id);
  await mkdir(dir, {recursive: true});
  const samples = [];
  for (let scene = 0; scene < expected.scenes; scene++) {
    const frame = bar(scene) + 55;
    const time = frame / 30;
    const index = String(scene).padStart(2, '0');
    const image = resolve(dir, `frame-${index}.png`);
    run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-ss', String(time),
      '-i', path, '-frames:v', '1', image]);
    const pixels = run('ffmpeg', ['-hide_banner', '-v', 'error', '-i', image,
      '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], true).stdout;
    let sum = 0;
    let squares = 0;
    let brightPixels = 0;
    for (let offset = 0; offset < pixels.length; offset += 3) {
      const luma = 0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2];
      sum += luma;
      squares += luma * luma;
      if (luma > 100) brightPixels++;
    }
    const count = pixels.length / 3;
    const mean = sum / count;
    const deviation = Math.sqrt(squares / count - mean * mean);
    assert(deviation > 5 && brightPixels > 5, `${expected.id}: blank scene ${scene + 1}`);
    run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-i', image,
      '-vf', 'scale=480:270', '-frames:v', '1', resolve(dir, `thumb-${index}.png`)]);
    samples.push({scene: scene + 1, frame, time, deviation, brightPixels, image});
  }
  const sheet = resolve(root, 'out', 'encoded-frames', `${expected.id}-contact.png`);
  run('ffmpeg', ['-hide_banner', '-v', 'error', '-y', '-framerate', '1',
    '-i', resolve(dir, 'thumb-%02d.png'), '-vf',
    `tile=3x${Math.ceil(expected.scenes / 3)}:padding=8:margin=8:color=black`, '-frames:v', '1', sheet]);
  reports.push({id: expected.id, path, probe, fullDecode: 'passed', audio: {meanDb, maxDb}, samples, sheet});
  console.log(`${expected.id}: ${video.width}x${video.height}, ${expected.frames} frames, ` +
    `${probe.format.duration}s, H.264/AAC; decode and all ${samples.length} scenes passed; ` +
    `audio mean ${meanDb} dB, peak ${maxDb} dB`);
}
const report = resolve(root, 'out', 'media-verification.json');
await writeFile(report, JSON.stringify(reports, null, 2) + '\n');
console.log(`Verification report: ${report}`);
