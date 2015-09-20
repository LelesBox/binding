## 基于Observe.JS的viewmodel模块

能完成对前台的双向绑定

###安装
安装webpack 然后在当前目录执行webpack命令，完成js打包后直接打开index.html能看到demo，使用方法在index.js文件中

### 9.20
添加 _repeat,和 _bind 类似于Angular的ng-repeat 和 ng-bind

<del>虽然在使用bundle和loader中，目前来看bundle的体验更佳，因为loader有个硬伤就是刷新一个页面后js全都要重新加载，比如requirejs，有没有什么办法 让
浏览器内置loader方法，达到按需加载js的效果。</del>
