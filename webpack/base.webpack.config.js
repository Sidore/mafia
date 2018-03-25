const path = require('path')
const webpack = require('webpack')

module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'),
        chunkFilename: '[id].bundle.js',
        publicPath: '/dist/',
        filename: '[name].js'
      },
      module: {
        // noParse: /es6-promise\.js$/, // avoid webpack shimming process
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            // options: vueConfig
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          },
          {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: '[name].[ext]?[hash]'
            }
          },
        //   {
        //     test: /\.css$/,
        //     use: isProd
        //       ? ExtractTextPlugin.extract({
        //           use: 'css-loader?minimize',
        //           fallback: 'vue-style-loader'
        //         })
        //       : ['vue-style-loader', 'css-loader']
        //   }
        ]
      }
}