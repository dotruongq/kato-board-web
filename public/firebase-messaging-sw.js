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
