const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const webpackCommon = require('./webpack-common')
const NodemonPlugin = require('nodemon-webpack-plugin')

const mode = process.env.NODE_ENV || 'development'

module.exports = function(dirname, extend = {}) {
   return {
        target: 'node',
        node: {
            __dirname: false
        },
        externals: [nodeExternals({
            //allowlist: ['@rpgjs/default-gui', '@rpgjs/starter-kit-server', '@rpgjs/starter-kit-client']
            allowlist: [/^@rpgjs/, 'lance-gg']
        })],
        mode,
        entry: `./src/server/main.ts`,
        output: {
            path: path.join(dirname, 'dist/server'),
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [{
                    test: /\.ts$/,
                    use: [{
                        loader: require.resolve('ts-loader'),
                        options: {
                            onlyCompileBundledFiles: true
                        }
                    }],
                    exclude: [/node_modules/]
                },
                ...webpackCommon(dirname)
            ]
        },
        optimization: {
            minimize: false
        },
        plugins: [
            new CleanWebpackPlugin(),
            new NodemonPlugin({
                script: './dist/server/index.js',
                watch: path.resolve('./dist/server')
            })
        ],
        ...extend
    }
}