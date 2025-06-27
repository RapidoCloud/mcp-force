const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    server: './dist/server.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'module',
    },
    environment: {
      module: true,
    },
    clean: true,
  },
  target: 'node',
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: false,
    splitChunks: false,
    usedExports: false,
  },
  module: {
    rules: [
      // TypeScript is already compiled to modern JavaScript
      // No additional processing needed
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules', 'dist'],
  },
  plugins: [
    // Copy resources directory to dist
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/server/resources',
          to: 'server/resources',
          noErrorOnMissing: false,
        },
      ],
    }),
    // Add shebang to the mcpServer output and make it executable
    {
      apply: (compiler) => {
        compiler.hooks.emit.tap('AddShebang', (compilation) => {
          const mcpServerAsset = compilation.assets['server.js'];
          if (mcpServerAsset) {
            const source = mcpServerAsset.source();
            const withShebang = `#!/usr/bin/env node\n${source}`;
            compilation.assets['server.js'] = {
              source: () => withShebang,
              size: () => withShebang.length,
            };
          }
        });

        // Make the mcpServer.js executable after writing
        compiler.hooks.afterEmit.tap('MakeExecutable', () => {
          const fs = require('fs');
          const path = require('path');
          const filePath = path.resolve(__dirname, 'dist', 'server.js');
          try {
            fs.chmodSync(filePath, 0o755);
          } catch (error) {
            console.warn('Could not make server.js executable:', error.message);
          }
        });
      },
    },
  ],
};
