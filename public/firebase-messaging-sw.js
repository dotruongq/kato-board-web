/* Receives pond alerts while Kato Board is closed and shows them as notifications.
 * Firebase config arrives in this script's URL (see firebaseConfigQuery), so nothing is
 * hard-coded here. The notification itself (title, body, icon, click link) is built by the API.
 */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

const params = new URL(self.location.href).searchParams
firebase.initializeApp(Object.fromEntries(params.entries()))
// Messages with a `notification` payload are displayed automatically; clicking one opens
// the `link` the API set (the affected pond, or the dashboard).
firebase.messaging()

// Notifications the open app shows itself (see showSystemNotification) carry `katoUrl`:
// focus Kato Board and go there, or open it if it's closed.
self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data && event.notification.data.katoUrl
  if (!url) return // Firebase's own notifications are handled by Firebase
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const target = new URL(url, self.location.origin).href
      for (const w of windows) {
        if (new URL(w.url).origin === self.location.origin) {
          return w.focus().then(() => w.navigate(target))
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
