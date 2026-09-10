/**
 * Debug utility for Firebase Cloud Messaging
 * Run this in browser console to diagnose notification issues
 */

export async function debugFCM() {
    // console.log('=== FCM DEBUGGING START ===\n');

    // 1. Check if notifications are supported
    if (!("Notification" in window)) {
        // console.error('Notifications NOT supported in this browser');
        return;
    }
    // console.log('Notifications supported');

    // 2. Check notification permission
    // console.log(`Notification Permission: ${Notification.permission}`);
    if (Notification.permission === "denied") {
        console.warn('Notifications are DENIED. User must reset browser permissions.');
        return;
    }

    // 3. Check service worker
    if (!("serviceWorker" in navigator)) {
        console.error('Service Workers NOT supported');
        return;
    }
    // console.log('Service Workers supported');

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        // console.log(`Found ${registrations.length} service worker(s)`);

        registrations.forEach((reg, index) => {
            // console.log(`[${index}] Scope: ${reg.scope}`);
            // console.log(`Active: ${reg.active ? 'Yes' : 'No'}`);
            // console.log(`Installing: ${reg.installing ? 'Yes' : 'No'}`);
            // console.log(`Waiting: ${reg.waiting ? 'Yes' : 'No'}`);
        });
    } catch (error) {
        console.error('Error getting service workers:', error);
        return;
    }

    // 4. Check Firebase messaging
    try {
        const { messaging } = await import('../firebase/firebase.js');
        // console.log('Firebase messaging module imported');
        // console.log('messaging:', messaging);

        if (!messaging) {
            console.error('messaging is null/undefined');
            return;
        }

        // Try to get token
        // console.log('\nAttempting to get FCM token...');
        const { getToken } = await import('firebase/messaging');

        try {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (token) {
                // console.log('FCM Token obtained:');
                // console.log(`${token}`);
                // console.log(`Length: ${token.length}`);

                // Check if token is in localStorage
                const storedToken = localStorage.getItem("fcmToken");
                if (storedToken === token) {
                    // console.log('Token matches stored token');
                } else {
                    console.warn('Token does NOT match stored token');
                }
            } else {
                console.error('Token is null/undefined');
                console.warn('This usually means notification permission not granted');
            }
        } catch (tokenError) {
            console.error('Error getting token:', tokenError.message);
            console.error('Code:', tokenError.code);
            console.error('Name:', tokenError.name);
        }

    } catch (error) {
        console.error('Error importing messaging:', error);
    }

    // 5. Check API token saving
    // console.log('\nChecking if token was sent to backend...');
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        // console.log('Access token found in localStorage');
        // console.log(`Length: ${accessToken.length}`);
    } else {
        console.warn('No access token found');
    }

    // console.log('\n=== FCM DEBUGGING END ===\n');
}

export function testNotification() {
    // console.log('Sending test notification...');

    if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
            body: 'This is a test notification to verify your browser can show notifications',
            icon: '/vite.svg',
            tag: 'test-notification'
        });
        // console.log('Test notification sent');
    } else {
        console.error('Notification permission not granted');
    }
}

// Export for easy console access
window.debugFCM = debugFCM;
window.testNotification = testNotification;
