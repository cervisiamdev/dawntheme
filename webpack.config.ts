import { Configuration as WebpackConfiguration  } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import * as webpackDevServer from 'webpack-dev-server';
import { resolve } from "path";
import * as path from "path";

interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

export default function(): Configuration {
    return{
        entry: {
            booking: { import: '/components/booking-main', filename: '[name].bundle.js' },
            samples: { import: '/components/samples-main', filename: '[name].bundle.js' },
            giftcard: { import: '/components/giftcard', filename: '[name].bundle.js' },
        },
        mode: process.env.NODE_ENV === "production" ? "production" : "development",
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".css"]
        },
        output: {
            filename: "[name].bundle.js",
            path: resolve(__dirname, "dist"),
            publicPath: "dist/",
            chunkFilename: '[id].[chunkhash].js'
        },
        watch: true,
        optimization: {
            usedExports: true,
            splitChunks: {
                cacheGroups: {
                  vendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                  }
                }
              }
/*             splitChunks: {
                // include all types of chunks
                chunks: 'all',
                maxSize: 2000,
                minSize: 200
              }, */
        },
        devServer: {
            static: [
                {
                    directory: path.join(__dirname, 'dist'),
                },
                {
                    directory: path.join(__dirname, 'components'),
                },
            ],
            historyApiFallback: true,
            open: true,
            port: 8989,
        },
        module: {
            rules: [
                {
                    test: /\.(.jsx?|tsx?)$/,
                    loader: "ts-loader",
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
            ]
        },
    }

}
