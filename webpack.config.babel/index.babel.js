const path = require('path');

import { getPageEntries } from './page-entries';
import { plugins, externalCSS, internalCSS } from './plugins';

export default exports = (env) => {
  const hash = env.production ? '.[hash]' : '';
  const externalCSSPlugin = externalCSS(env);
  const internalCSSPlugin = internalCSS();

  let modulePlugins = plugins(env);

  modulePlugins.unshift(internalCSSPlugin);
  modulePlugins.unshift(externalCSSPlugin);

  let config = {
    context: path.resolve(__dirname, '../src'),

    entry: {
      ...getPageEntries(),
      common: './js/commons'
    },

    output: {
      path: path.resolve(__dirname, '../build'),
      publicPath: '/',
      filename: `js/[name]${hash}.bundle.js`
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /\/node_modules\//,
          loader: 'eslint',
          options: {
            emitWarning: true,
          }
        },
        {
          test: /\.js$/,
          exclude: /\/node_modules\//,
          include: path.resolve(__dirname, 'src'),
          loader: 'babel'
        },
        {
          test: /\.scss$/,
          exclude: /critical.scss$/,
          use: ['css-hot-loader'].concat(externalCSSPlugin.extract({
            fallback: 'style',
            use: [
              {
                loader: 'css',
                options: {
                  minimize: env.production ? true : false
                }
              },
              {
                loader: 'postcss',
                options: {
                  config: {
                    path: path.resolve(__dirname, 'postcss.config.js')
                  }
                }
              },
              'sass'
            ]
          }))
        },
        {
          test: /critical.scss$/,
          use: ['css-hot-loader'].concat(internalCSSPlugin.extract({
            fallback: 'style',
            use: [
              {
                loader: 'css',
                options: {
                  minimize: env.production ? true : false
                }
              },
              {
                loader: 'postcss',
                options: {
                  config: {
                    path: path.resolve(__dirname, 'postcss.config.js')
                  }
                }
              },
              'sass'
            ]
          }))
        },
        {
          test: /\.html$/,
          use: [ {
            loader: 'html',
            options: {
              attrs: ['img:src', 'link:href'],
              interpolate: true,
              minimize: env.production ? true : false,
              removeComments: env.production ? true : false,
              collapseWhitespace: env.production ? true : false
            }
          }],
        },
        {
          test: /\.(jpg|png|gif|ico)/,
          use: [
            {
              loader: 'file',
              options: {
                name: `[path][name]${hash}.[ext]`,
              }
            }
          ]
        }
      ]
    },

    stats: {
      colors: true
    },

    devtool: env.production ? 'source-map' : false,

    watch: !env.production,

    watchOptions: {
      aggregateTimeout: 100
    },

    plugins: modulePlugins,

    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.json', '.scss']
    },

    resolveLoader: {
      modules: ['node_modules'],
      extensions: ['.js', '.json'],
      mainFields: ['loader', 'main'],
      moduleExtensions: [ '-loader' ]
    },

    devServer: {
      open: true,
      host: 'localhost',
      port: 8080,
      historyApiFallback: true,
      stats: env.production ? 'verbose' : { children: false }
    }
  };

  return config;
};
