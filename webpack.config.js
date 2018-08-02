const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/public/index.html',
    filename: 'index.html',
    inject: false
});

module.exports = {
    entry: __dirname + '/src/client',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'env', 'stage-1'],
                    plugins: [
                        ['babel-plugin-root-import']
                    ]
                }
            }
        ]
    },
    output: {
        filename: 'client.min.js',
        path: __dirname + '/public',
        publicPath: '/'
    },
    plugins: [HTMLWebpackPluginConfig],
    devServer: {
        contentBase: path.join(__dirname, '/public'),
        historyApiFallback: true
    }
};