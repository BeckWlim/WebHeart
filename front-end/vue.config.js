const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  chainWebpack: config => {
    config.resolve.alias
        .set("model", resolve("public/model"))
        .set("@", resolve("src"))
    config.plugin('html')
        .tap(args => {
          args[0].title = "给超级无敌漂亮可爱的老婆";
          return args;
        })
  },
}
