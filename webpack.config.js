const path = require('path');

module.exports = {
  entry: './static/admin/index.js',
  output: {
    path: path.resolve(__dirname, 'static/admin/dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      fs: false,
      os: false
    }
  }
};