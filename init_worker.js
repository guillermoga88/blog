if (navigator.serviceWorker) {
    console.log("ServiceWorkers are supported");

    navigator.serviceWorker.register('https://auth0.com/blog/sw.js')
        .then(function(reg) {
            console.log("ServiceWorker registered", reg);
        })
        .catch(function(error) {
            console.log("Failed to register ServiceWorker", error);
        });
}

window.requestNotificationPermission = function () {

    if (Notification.requestPermission) {
        Notification.requestPermission(function(result) {
            console.log("Notification permission : ", result);
            if(result == 'granted'){
                registerForPush();
            }
        });
    } else {
        console.log("Notifications not supported by this browser.");
    }
}


function registerForPush() {
    //if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true
                })
                .then(function(subscription) {
                    fetch("https://auth0-marketing.run.webtask.io/blog-push-subscriptions?webtask_no_cache=1",
                    {
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({"registration_id": subscription.endpoint.substr(subscription.endpoint.lastIndexOf('/') + 1)})
                    })
                    .then(function(res){ console.log('registered') })
                    .catch(function(err){ console.err(err); return });
                    console.log("DEVICE_REGISTRATION_ID: ", subscription.endpoint.substr(subscription.endpoint.lastIndexOf('/') + 1));
                })
                .catch(function(error) {
                    console.log("Subscription for Push failed", error);
                });
        });
    //} else {
      // console.log("No active ServiceWorker");
    //}
}

window.unsubscribePushNotification = function() {
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {

    serviceWorkerRegistration.pushManager.getSubscription().then(
      function(pushSubscription) {
        // Check we have a subscription to unsubscribe
        if (!pushSubscription) {
            console.warn('Unsubscribed Notification')
            return;
        }

        var subscriptionId = pushSubscription.endpoint.substr(pushSubscription.endpoint.lastIndexOf('/') + 1);
        // request to wt to remove subscription of db
        pushSubscription.unsubscribe().then(function(successful) {
            fetch("https://auth0-marketing.run.webtask.io/blog-push-subscriptions/"+subscriptionId,
            {
                method: "DELETE"
            })
            .then(function(res){ console.log('unsubscribe') })
            .catch(function(err){ console.err(err); return });
        }).catch(function(e) {
          console.log('Unsubscription error: ', e);
        });
      }).catch(function(e) {
        console.error('Error thrown while unsubscribing from push messaging.', e);
      });
  });
}

(function doesBrowserSupportNotifications() {

    var supported = true;
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications aren\'t supported in Service Workers.');
        supported = false;
    }

    if (!Notification.requestPermission) {
        console.warn("Notifications are not supported by the browser");
        supported = false;
    }

    if (Notification.permission !== 'granted') {
        console.warn('The user has blocked notifications.');
        supported = false;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        supported = false;
    }

    if (supported) {
        console.log("Everthing is fine you can continue")
    }
})();
