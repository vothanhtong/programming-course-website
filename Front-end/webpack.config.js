const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProd = argv && argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      path: path.resolve(__dirname, '../firebase/public'),
      publicPath: '/',
      clean: true,
    },
    module: {
      rules: [
        // TypeScript + JSX via Babel
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        },
        // CSS + Tailwind
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        // Images + fonts
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: { filename: '[name][ext]' },
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({ template: './index.html', minify: false }),
      ...(isProd ? [new MiniCssExtractPlugin({ filename: 'style.[contenthash].css' })] : []),
      new Dotenv({ safe: false, silent: true }),
    ],
    devtool: isProd ? 'source-map' : 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      port: 8080,
      hot: true,
      // Serve static files (logo.png, favicon...) từ thư mục gốc
      static: [
        { directory: path.resolve(__dirname), publicPath: '/' },
      ],
      proxy: [
        { context: ['/apis'], target: 'http://localhost:5001', changeOrigin: true },
        { context: ['/uploads'], target: 'http://localhost:5001', changeOrigin: true },
      ],
    },
    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@components': path.resolve(__dirname, 'src/components'),
      },
    },
    optimization: isProd ? {
      splitChunks: {
        cacheGroups: {
          vendor: { test: /[\\/]node_modules[\\/]/, name: 'vendors', chunks: 'all' },
        },
      },
    } : {},
  };
};
