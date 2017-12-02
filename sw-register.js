/*
* @Author: Administrator
* @Date:   2017-12-02 14:23:07
* @Last Modified by:   Administrator
* @Last Modified time: 2017-12-02 14:24:19
*/
window.onload = function () {
  if (navigator.serviceWorker != null) {
    navigator.serviceWorker.register('./sw.js').then(function (registeration) {
      console.log('registeration events at scope', registeration.scope)
    })
  }

  function registerBroadcastReceiver() {
    navigator.serviceWorker.onmessage = function(event) {
      const data = event.data;
      if (data.command === 'swUpdate') {
        console.log(`swUpdate message from the ServiceWorker : ${data.message}`);
      }
    };
  }

  registerBroadcastReceiver()
}