// Usage: NODE_PATH=<directory containing sharp> node .site-tools/pikmade-assets.cjs <Pikmade checkout>
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const source = path.resolve(process.argv[2]);
const output = path.resolve(__dirname, '../assets/pikmade');
const base = path.join(source, 'assets/template-sample-base/2026-10-09');
const samples = path.join(source, 'assets/template-samples/2026-10-09');
const styles = { paper: 'papercraft', figure: '3d-figure', crayon: 'crayon-drawing', minimal: 'minimalist-illustration', caricature: 'caricature', doodle: 'minimalist-japanese-indie-portrait', pet: 'retro-pet-magazine-cover', couple: 'hand-drawn-couple-wallpaper', kids: 'ivory-fabric-kids-line-drawing' };
async function restoreAssets() {
  const restore = path.join(source, 'assets/restore-examples/2026-10-11');
  const files = { 'family-original': 'family-1960s.png', 'family-color': 'family-1960s-color.jpg', 'family-clean': 'family-1960s-clean.jpg', 'woman-original': 'woman-1970s.png', 'woman-clean': 'woman-1970s-clean.jpg' };
  for (const [name, file] of Object.entries(files)) {
    await sharp(path.join(restore, file)).resize({ width: 720 }).webp({ quality: 88 }).toFile(path.join(output, `restore-${name}.webp`));
  }
}
(async () => {
  await fs.mkdir(output, { recursive: true });
  if (process.argv.includes('--restore-only')) {
    await restoreAssets();
    console.log('Restoration examples prepared. Source files unchanged.');
    return;
  }
  await fs.copyFile(path.join(source, 'assets/brand/pikmade-wordmark.svg'), path.join(output, 'wordmark.svg'));
  await sharp(path.join(source, 'assets/store/icon/app-store/app-icon-1024.png')).resize(192).png().toFile(path.join(output, 'icon.png'));
  for (const [name, model] of Object.entries({ original: 'adult-woman', 'original-figure': 'adult-man', 'original-crayon': 'family' })) {
    await sharp(path.join(base, `${model}.png`)).resize(900, 900, { fit: 'contain', background: '#eeece7' }).webp({ quality: 86 }).toFile(path.join(output, `${name}.webp`));
  }
  for (const [name, id] of Object.entries(styles)) {
    await sharp(path.join(samples, `${id}.png`)).resize(900, 900, { fit: 'contain', background: '#faf9f6' }).webp({ quality: 86 }).toFile(path.join(output, `${name}.webp`));
  }
  await restoreAssets();
  for (const lang of ['ko', 'en']) {
    for (const [name, file] of Object.entries({ explore: '02-explore.png', photo: '04-photo.png', result: '06-result.png' })) {
      await sharp(path.join(source, 'assets/store/candidates/2026-10-09/.source/iphone', lang, file))
        .resize({ width: 660 }).webp({ quality: 83 }).toFile(path.join(output, `${lang}-${name}.webp`));
    }
  }
  console.log('Pikmade web assets prepared. Original assets unchanged.');
})();
