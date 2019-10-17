const HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserJSPlugin = require('terser-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
  isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: './src',
  output: {
    path: `${__dirname}/build`,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hot: isDevelopment
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: true,
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]'
              },
              localsConvention: 'camelCaseOnly',
              sourceMap: isDevelopment
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: !isDevelopment,
      hash: !isDevelopment
    }),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
    })
  ],
  optimization: {
    minimizer: isDevelopment ? [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})] : []
  }
}
