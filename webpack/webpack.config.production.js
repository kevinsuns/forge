var htmlMinifier = require('html-minifier').minify
var clean = require('clean-webpack-plugin')
var html = require('html-webpack-plugin')
var webpack = require('webpack')
var path = require('path')

module.exports = {

  entry: {
    bundle: './src/client/index.js'
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: "[name].min.js"
  },

  plugins: [

    new clean(['dist'], {
      root: __dirname + '/..',
      verbose: true,
      dry: false
    }),

    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),

    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 51200
    }),

    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        warnings: false
      },
      minimize: true,
      mangle: true
    }),

    new webpack.DefinePlugin({
      //'process.env.NODE_ENV': '"production"'
      'process.env.NODE_ENV': '"heroku"'
    }),

    new webpack.ProvidePlugin({
      _ : "underscore",
      jQuery: "jquery",
      $: "jquery"
    }),

    new html({
      //viewerCSS: 'https://developer-stg.api.autodesk.com/viewingservice/v1/viewers/style.min.css',
      //viewer3D: 'https://developer-stg.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js',
      viewerCSS: 'https://autodeskviewer.com/viewers/2.8/style.min.css',
      viewer3D: 'https://autodeskviewer.com/viewers/2.8/viewer3D.min.js',
      template: './layout/index.ejs',
      bundle: 'bundle.min.js',
      title: 'Autodesk Forge',
      filename: 'index.html',
      minify: htmlMinifier,
      inject: false
    })
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    root: [
      path.resolve('./src/client'),
      path.resolve('./src/client/utils'),
      path.resolve('./src/client/Components'),
      path.resolve('./src/client/Components/Viewer/extensions')
    ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-0']
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};