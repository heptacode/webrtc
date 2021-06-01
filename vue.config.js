const MangleCssClassPlugin = require("mangle-css-class-webpack-plugin");

module.exports = {
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
