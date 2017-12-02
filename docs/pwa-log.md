# pwa-log

pwa 本地开发启用https 方法 安装 ngrok-stable， 执行命令 ngrok http 8080， 端口可以根据项目的需要进行修改。执行时候将会生成代理地址，可通过代理地址访问本地项目
###注意事项： 
1、Service Worker 没有访问 DOM 的权限

### 目前已知注册失败的原因
1、不是https环境，不是locahost 或 127.0.0.1。
2、service worker 文件地址没写对， 需要相对于origin(origin：相对于service-worker.js 文件目录的同级及以下，不支持跨目录操作)

### 更新问题
1、service-worker.js 文件可能会因为浏览器缓存问题，当文件发生了变化时，浏览器文件还是旧的。会导致更新得不到相应。 如果遇到这种情况可以尝试在web server（web 服务器设置过滤规则，不缓存此文件或设置较短的有效期）

ps: service worker 除了有浏览器触发更新之外，还应用了特殊的缓存策略： 如果该文件已24小时没有更新，当Update 触发时会强制更新， 在最坏的情况下 service worker 会每天更新一次

不管是更新sw.js还是注销，第一次访问依然是使用老的缓存，只有第二次进入才会更新缓存。
目前解决这个问题的方案可以在检测到sw更新之后，通过postMessage消息到页面，页面监听postMessage过来的消息，1、主动刷新浏览器 2、发送提示，让用户主动刷新；
当然如果你的产品使用频率较高也可以直接忽视这个问题。
（对于新技术的使用还是需要根据产品的具体场景进行分析）

更多查阅： 
https://zhuanlan.zhihu.com/p/28161855

https://developers.google.cn/web/fundamentals/primers/service-workers/lifecycle?hl=zh-cn

https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-lifecycle

### 消息推送
1、发起消息推送需要service worker 处于启动状态
 
### 注册多个service worker
有些项目比较大，而且是使用一个域名，然后通过路径来区分项目的。这种项目不适合在跟域下注册一个service worker。
可以根据实际项目的path注册每一个子项目的service worker，在注册的时候指定注册作用域 scope 的如：

navigator.serviceWorker.register('sw.js', {scope: '/project-path/'}).then(function (registeration) {
    console.log('registeration events at scope', registeration.scope)
})

需要严格要求子项目管理好自己的service worker 和 scope。

### 添加到主屏幕
pwa 可以快速的添加一个图标到主屏幕中，点击图标就可以快速全屏的访问，类似app。
添加到主屏幕是浏览器内置的功能，对开发者来说是非常友好的。但是有时候并不需要添加到主屏幕中。那么可以通过以下方法来取消这个功能：
```
window.addEventListener('beforeinstallprompt', function(e) {
  // 取消默认事件
  e.preventDefault();
  return false;
});
```
## PWA-Book-CN
https://github.com/SangKa/PWA-Book-CN/tree/90680ec462b28e4258efcd9432037fd7ed4a2027