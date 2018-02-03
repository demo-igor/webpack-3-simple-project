import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import StyleExtHtmlWebpackPlugin from 'style-ext-html-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { getPageEntries } from './page-entries';

const pathsToClean = [
  'build'
];

const cleanOptions = {
  root:     path.resolve(__dirname, '..'),
  verbose:  true,
  dry:      false
};

export const externalCSS = (env) => {
  const hash = env.production ? '.[hash]' : '';

  return new ExtractTextPlugin({
    filename: `css/[name]${hash}.bundle.css`
  });
};

export const internalCSS = () => new ExtractTextPlugin({
  filename: 'css/critical.css'
});

export const commonsChunkPlugin = (env) => {
  const hash = env.production ? '.[hash]' : '';

  return new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: `js/commons${hash}.js`,
    minChunks: 2
  });
};

export const definePlugin = (env) => {
  const NODE_ENV = env.production ? 'production' : 'development';

  return new webpack.DefinePlugin({
    'NODE_ENV': JSON.stringify(NODE_ENV)
  });
};

export const htmlWebpackPlugin = (entry) => {
  return   new HtmlWebpackPlugin({
    filename: `${entry}.html`,
    template: `assets/${entry}.html`,
    chunks: [entry, 'common']
  });
};

export const config = [
  new webpack.NoEmitOnErrorsPlugin(),
  new CleanWebpackPlugin(pathsToClean, cleanOptions),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
  })
];

export const plugins = (env) => {
  const entries = getPageEntries();

  for(const entry in entries) {
    config.unshift(htmlWebpackPlugin(entry));
  }

  config.unshift(commonsChunkPlugin(env));

  if(env.production) {
    config.push(new AssetsPlugin({
      filename: 'assets.json',
      path: path.resolve(__dirname, '../build')
    }));
    config.push(new StyleExtHtmlWebpackPlugin('css/critical.css'));
    config.push(new UglifyJsPlugin());
  }

  config.push(definePlugin(env));

  return config;
};
