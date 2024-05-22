import fs from 'fs';

export const Build = async () => {
  const inputDir = './node_modules/benbun-react-router/hydrate.tsx';
  const outputDir = './public/js';

  // Check all directories and files exist as Bun.Build does not validate these things
  const dirExist = fs.existsSync(outputDir)
  if (!dirExist) {
    fs.mkdir(outputDir, err => {
      if (err) throw err;
    });
  }

  const entrypointExist = await Bun.file(inputDir).exists();
  if (!entrypointExist) {
    throw new Error(`Cannot find entrypoint file at ${inputDir}`);
  }

  try {
    await Bun.build({
      entrypoints: [inputDir],
      outdir: outputDir,
      target: 'browser',
      splitting: true,
      minify: {
        identifiers: true,
        syntax: true,
        whitespace: true,
      },
    });
  } catch (err) {
    throw err;
  }
};
