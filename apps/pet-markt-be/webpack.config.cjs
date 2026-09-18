import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin';
import { join } from 'node:path';

export default {
  output: {
    path: join(process.cwd(), 'dist'),
    clean: true,
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};