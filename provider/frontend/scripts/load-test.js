import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 200 }, // Stress test: Ramp up to 200 users
    { duration: '1m', target: 0 },   // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your_test_token_here';

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Fetch Profile
  const profileRes = http.get(`${BASE_URL}/v1/provider/profile`, params);
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Fetch Unread Notifications Count
  const unreadRes = http.get(`${BASE_URL}/v1/provider/notifications/unread-count`, params);
  check(unreadRes, {
    'unread count status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Fetch Bookings
  const bookingsRes = http.get(`${BASE_URL}/v1/provider/bookings`, params);
  check(bookingsRes, {
    'bookings status is 200': (r) => r.status === 200,
  });

  sleep(2);
}
