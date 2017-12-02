/*
* @Author: Administrator
* @Date:   2017-11-29 10:04:53
* @Last Modified by:   Administrator
* @Last Modified time: 2017-12-02 15:14:52
*/
// 缓存 key
let cacheStorageKey = 'tomato-pwa-v12'

var firstRegister = 1; // 默认1是首次安装SW， 0是SW更新
/*
  注销 service worker
  接口返回数据
  {
    "switch": true, // true 启用service worker; false: 注销service worker
    "version": 2
  }
 */
fetch("http://localhost:8888/sw-config", { mode: "cors" })
.then(function (ret) {
  return ret.json()
})
.then(function (ret) {
  !ret.switch && self.registration.unregister()
})
.catch(function () {
  self.registration.unregister()
})

self.addEventListener('install', event => {
  event.waitUntil(caches.keys().then(cache => {
    if (cache && cache.length > 0) {
      firstRegister = 0; // SW更新
    }
  }).then(() => {
    // 安装成功 进入激活状态 
    self.skipWaiting()
  }))
  console.log('tomato sw installing')
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => {
    Promise.all(
      keys.map(key => {
        // 如果缓存更新则删除旧的缓存 
        if (key != cacheStorageKey) {
          return caches.delete(key)
        }
        // 控制页面
        self.clients && self.clients.claim && self.clients.claim()
      })
    )
  }).then(() => {
    // 如果是首次安装 SW 时, 不发送更新消息（
    // 如果不是首次安装，则是内容有更新，需要通知页面重载更新
    if (!firstRegister) {
      // 通知所有打开的 clients
      return self.clients.matchAll()
        .then(function(clients) {
          if (clients && clients.length) {
            clients.forEach(function(client) {
              // 向页面发送更新消息，需要页面注册 onmessage 事件，以便获取消息
              client.postMessage({
                command: 'swUpdate',
                message: 'service worker update'
              })
            })
          }
        })
    }
  }))
})
// 不缓存文件
let noCacheList = ['sw.js', 'sw-register.js']

self.addEventListener('fetch', event => {
  var url = new URL(event.request.url)
  var pathNames = url.pathname.split('/')
  var fileName = pathNames[pathNames.length -1].lastIndexOf('.') > -1 ? pathNames[pathNames.length -1]: ''
  // 只缓存同源文件，service worker 是支持缓存 cnd 文件的， 如果需要缓存的是 cdn 地址，需要修改此判断逻辑
  if (event.request.url.startsWith(self.location.origin) && !noCacheList.includes(fileName)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response
        } else {
          // request 是通过流的方式传递的，一旦消耗不可逆，需要拷贝一份
          let ret = event.request.clone()

          // 如果项目中使用的是 cdn， 而cdn使用的都是强缓存，fetch 请求获取的资源依然会返回304，可以添加时间戳绕过 cdn 缓存
          // ret.request.url = `${ret.request.url}?${new Date().getTime()}`

          return fetch(ret).then(response => {
            let res = response
            // 1. 响应状态码为200；避免缓存304、404、50x等常见的结果
            // 2. 响应类型为basic或者cors；即只缓存同源、或者正确地跨域请求结果；避免缓存错误的响应（error）和不正确的跨域请求响应（opaque）
            if (res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
              caches.open(cacheStorageKey).then(cache => cache.add(ret))
            } else {
              console.wran('[SW]: URL [' + ret.url + '] wrong response: [' + res.status + '] ' + res.type);
            }
            return res
          })
        }
      }).catch(err => {
        return fetch(event.request)
        console.wran(err)
      })
    )
  }
})