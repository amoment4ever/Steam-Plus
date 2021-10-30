const webpack = require('webpack')
const path = require('path')
const fileSystem = require('fs-extra')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const env = require('./utils/env')

const ASSET_PATH = process.env.ASSET_PATH || '/'

const alias = {
  'react-dom': '@hot-loader/react-dom',
  '@core': path.join(__dirname, './src/core'),
  '@assets': path.join(__dirname, './src/assets'),
  '@features': path.join(__dirname, './src/features'),
  '@shared': path.join(__dirname, './src/shared'),
  '@pages': path.join(__dirname, './src/pages'),
  '@store': path.join(__dirname, './src/store'),
}

// load the secrets
const secretsPath = path.join(__dirname, `secrets.${env.NODE_ENV}.js`)

const fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'ttf',
  'woff',
  'woff2',
]

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath
}

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.js'),
    background: path.join(__dirname, 'src', 'pages', 'Background', 'index.js'),
    inventoryScript: path.join(
      __dirname,
      'src',
      'pages',
      'Inventory',
      'index.js'
    ),
    tradeOffersScript: path.join(
      __dirname,
      'src',
      'pages',
      'Tradeoffers',
      'index.js'
    ),
    marketScript: path.join(__dirname, 'src', 'pages', 'Market', 'index.js'),
    friendRequestsScript: path.join(
      __dirname,
      'src',
      'pages',
      'FriendRequests',
      'FriendRequests.js'
    ),
    profileScript: path.join(__dirname, 'src', 'pages', 'Profile', 'index.js'),
    tradeofferScript: path.join(
      __dirname,
      'src',
      'pages',
      'Tradeoffer',
      'index.js'
    ),
    marketListingScript: path.join(
      __dirname,
      'src',
      'pages',
      'MarketListing',
      'index.js'
    ),
    bridge: path.join(__dirname, 'src', 'features', 'bridge', 'bridge.js'),
  },
  chromeExtensionBoilerplate: {
    notHotReload: [
      'inventoryScript',
      'bridge',
      'marketScript',
      'marketListingScript',
      'profileScript',
      'tradeofferScript',
      'tradeOffersScript',
      'friendRequestsScript',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      { test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /inline\.svg$/,
        type: 'asset/source',
      },
      {
        test: /component\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  resolve: {
    alias,
    extensions: fileExtensions
      .map((extension) => `.${extension}`)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new Dotenv({
      path:
        process.env.NODE_ENV === 'development' || process.env.STAGING === 'true'
          ? './development.env'
          : './production.env',
    }),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform(content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            )
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets/css/content.styles.css',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets/img/128.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: path.join(__dirname, 'build/assets'),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map'
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  }
}

module.exports = options
