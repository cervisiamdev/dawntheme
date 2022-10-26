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
            filename: "js/bundle.min.js",
            path: resolve(__dirname, "dist"),
            publicPath: "dist/",
        },
        watch: true,
        optimization: {
            usedExports: true
        },
        devServer: {
            static: [
                {
                    directory: path.join(__dirname, 'dist/js'),
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
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
            ]
        },
    }

}
