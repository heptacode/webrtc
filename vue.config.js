const MangleCssClassPlugin = require("mangle-css-class-webpack-plugin");

module.exports = {
  // outputDir: "docs",
  // publicPath: process.env.NODE_ENV === "production" ? "/live/" : "/",
  // devServer: {
  //   https: true,
  //   hotOnly: false,
  // },
  configureWebpack: {
    plugins: [
      new MangleCssClassPlugin({
        classNameRegExp: "app-[a-z][a-zA-Z0-9_]*",
        log: true,
      }),
    ],
  },
};
