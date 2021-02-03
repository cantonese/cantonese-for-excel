/* eslint-env node */
const devCerts = require("office-addin-dev-certs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const version = require('./package').version;

const urlDev="https://localhost:3000/";
const urlProd="https://cantonese.github.io/cantonese-for-excel/dist/";

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const buildType = dev ? "dev" : "prod";
  const config = {
    devtool: "source-map",
    entry: {
      functions: "./src/functions/functions.ts",
      polyfill: "@babel/polyfill",
      taskpane: "./src/taskpane/taskpane.ts",
      commands: "./src/commands/commands.ts"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "babel-loader"
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: "ts-loader"
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader"
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          loader: "file-loader",
          options: {
            name: '[path][name].[ext]',
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: dev ? [] : ["**/*"]
      }),
      new CustomFunctionsMetadataPlugin({
        output: "functions.json",
        input: "./src/functions/functions.ts"
      }),
      new HtmlWebpackPlugin({
        filename: "functions.html",
        template: "./src/functions/functions.html",
        chunks: ["polyfill", "functions"]
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"]
      }),
      new CopyWebpackPlugin([
        {
          to: "taskpane.css",
          from: "./src/taskpane/taskpane.css"
        },
        {
          to: "[name]." + buildType + ".[ext]",
          from: "manifest*.xml",
          transform(content) {
            content = content.toString().replace("<Version>0.0.0</Version>", `<Version>${version}.0</Version>`)
            if (dev) {
              return content;
            } else {
              return content.replace(new RegExp(urlDev, "g"), urlProd);
            }
          }
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"]
      })
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      https: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions(),
      port: process.env.npm_package_config_dev_server_port || 3000
    }
  };

  return config;
};
