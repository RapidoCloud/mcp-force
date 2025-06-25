const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    mcpServer: './src/mcpServer.js',
    listTools: './src/listTools.js',
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
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: '22',
                  },
                  modules: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules', 'src'],
  },
  plugins: [
    // Add shebang to the mcpServer output and make it executable
    {
      apply: (compiler) => {
        compiler.hooks.emit.tap('AddShebang', (compilation) => {
          const mcpServerAsset = compilation.assets['mcpServer.js'];
          if (mcpServerAsset) {
            const source = mcpServerAsset.source();
            const withShebang = `#!/usr/bin/env node\n${source}`;
            compilation.assets['mcpServer.js'] = {
              source: () => withShebang,
              size: () => withShebang.length,
            };
          }
        });

        // Make the mcpServer.js executable after writing
        compiler.hooks.afterEmit.tap('MakeExecutable', () => {
          const fs = require('fs');
          const path = require('path');
          const filePath = path.resolve(__dirname, 'dist', 'mcpServer.js');
          try {
            fs.chmodSync(filePath, 0o755);
          } catch (error) {
            console.warn('Could not make mcpServer.js executable:', error.message);
          }
        });
      },
    },
  ],
};
