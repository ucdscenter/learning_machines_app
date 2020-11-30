const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// assets.js
const Assets = require('./assets');

module.exports = {
    entry: {
        app: "./learningmachines/searcher/static/searcher/index.js",
    },
    output: {
        path: __dirname + "/learningmachines/searcher/static/searcher/",
        filename: "[name].bundle.js"
    },
    plugins: [
      new CopyWebpackPlugin(
        Assets.js.map(asset => {
          return {
            from: path.resolve(__dirname, `./node_modules/${asset}`),
            to: path.resolve(__dirname, './learningmachines/searcher/static/searcher/js')
          };
        })
      ),
        new CopyWebpackPlugin(
        Assets.css.map(asset => {
          return {
            from: path.resolve(__dirname, `./node_modules/${asset}`),
            to: path.resolve(__dirname, './learningmachines/searcher/static/searcher/css')
          };
        })
      )
    ]
};