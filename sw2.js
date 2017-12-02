/*
* @Author: Administrator
* @Date:   2017-11-29 10:04:53
* @Last Modified by:   Administrator
* @Last Modified time: 2017-12-01 14:35:57
*/

let cacheStorageKey = 'tomato-pwa-v30'

self.addEventListener('install', event => {
  self.skipWaiting()
  console.log('tomato sw installing')
})

self.addEventListener('activate', event => {
  self.clients && self.clients.claim && self.clients.claim()
  event.waitUntil(caches.keys().then(keys => {
    Promise.all(
      keys.map(key => {
        if (key != cacheStorageKey) {
          return caches.delete(key)
        }
      })
    )
  }))
})
self.importScripts("https://cdnjs.cat.net/ajax/libs/sw-toolbox/3.6.1/sw-toolbox.js");
self.toolbox.options.debug = false;
self.toolbox.options.networkTimeoutSeconds = 3;
self.toolbox.options.cache.name = cacheStorageKey
self.toolbox.router.get("/sw.js", self.toolbox.networkOnly);
self.toolbox.router.get("/sw-config.json", self.toolbox.networkOnly);
fetch("http://localhost:8888/sw-config", { mode: "cors" })
.then(function (ret) {
  console.log(ret)
  return ret.json()
})
.then(function (ret) {
  console.log(ret)
  // !ret.switch && self.registration.unregister()
})
.catch(function () {
  // self.registration.unregister()
})
console.dir(toolbox)
toolbox.router.get("/*", toolbox.cacheFirst, {"origin": self.location.origin});

// self.addEventListener('fetch', event => {
//   if (event.request.url.startsWith(self.location.origin) && event.request.url.indexOf('sw-config.js') === -1 && event.request.url.indexOf('sw.js') === -1) {
//     event.respondWith(
//       caches.match(event.request).then(response => {
//         if (response) {
//           console.log(2)
//           return response
//         } else {
//           console.log(1)
//           let assets = fetch(event.request)
//           caches.open(cacheStorageKey).then(cache => cache.add(event.request))
//           return assets
//         }
//       }).catch(err => {
//         console.log(err)
//       })
//     )
//   }
// })