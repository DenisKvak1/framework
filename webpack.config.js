const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PROJECT_NAME = "Framework";

module.exports = {
    entry: path.resolve(__dirname, "src"),

    output: {
        filename: `${PROJECT_NAME}.js`,
        path: path.resolve(path.join(__dirname, `./builds/${PROJECT_NAME}`))
    },
    devServer: {
        static: path.resolve(__dirname, `./`),
        port: 8080
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            inject: "body"
            // scriptLoading: 'blocking'
        })
    ]
};