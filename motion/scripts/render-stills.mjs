import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'out', 'stills');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const bar = (n) => Math.round(n * 65.4545);
const scenes = {Week22: 12, Stats20: 9};
const requested = process.argv.slice(2);
const ids = requested.length ? requested : Object.keys(scenes);
for (const id of ids) {
  if (!(id in scenes)) throw new Error(`Unknown composition: ${id}`);
}
if (!existsSync(browserExecutable)) {
  throw new Error('Set REMOTION_BROWSER_EXECUTABLE to a local Chrome executable.');
}

const ffmpeg = (args) => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || String(result.error));
};

await mkdir(output, {recursive: true});
const serveUrl = await bundle({
  entryPoint: resolve(root, 'src/index.ts'),
  outDir: resolve(root, 'out', 'qa-bundle'),
  rootDir: root,
  enableCaching: false,
  gitSource: null,
});
const browser = await openBrowser('chrome', {
  browserExecutable,
  chromiumOptions: {gl: 'angle'},
});

try {
  for (const id of ids) {
    const dir = resolve(output, id);
    await mkdir(dir, {recursive: true});
    const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
    const samples = [];
    for (let scene = 0; scene < scenes[id]; scene++) {
      for (const offset of [24, 55]) {
        const frame = bar(scene) + offset;
        const index = String(samples.length).padStart(2, '0');
        const path = resolve(dir, `frame-${index}.png`);
        await renderStill({
          serveUrl, composition, frame, output: path, imageFormat: 'png',
          puppeteerInstance: browser, overwrite: true,
        });
        ffmpeg(['-i', path, '-vf', 'scale=480:270',
          '-frames:v', '1', resolve(dir, `thumb-${index}.png`)]);
        samples.push({scene: scene + 1, frame, time: frame / composition.fps, path});
        console.log(`${id}: scene ${scene + 1}, frame ${frame}`);
      }
    }
    const sheet = resolve(output, `${id}-contact.png`);
    ffmpeg(['-framerate', '1', '-i', resolve(dir, 'thumb-%02d.png'), '-vf',
      `tile=4x${Math.ceil(samples.length / 4)}:padding=8:margin=8:color=black`,
      '-frames:v', '1', sheet]);
    await writeFile(resolve(dir, 'manifest.json'), JSON.stringify({
      id, width: composition.width, height: composition.height,
      fps: composition.fps, durationInFrames: composition.durationInFrames, samples, sheet,
    }, null, 2) + '\n');
    console.log(`Contact sheet: ${sheet}`);
  }
} finally {
  await browser.close({silent: true});
}
