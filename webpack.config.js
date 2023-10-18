const path = require('path')
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: './app.js',
  output: {
    filename: 'artifact.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
}