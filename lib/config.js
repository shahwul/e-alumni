// lib/config.js
export const DAPODIK_CONFIG = {
  baseUrl: process.env.DAPODIK_BASE_URL,
  authUrl: process.env.DAPODIK_AUTH_URL,
  apiKey: process.env.DAPODIK_API_KEY,
  endpoints: {
    sekolah: process.env.DAPODIK_ENDPOINT_SEKOLAH,
    ptkBySekolah: process.env.DAPODIK_ENDPOINT_PTK_BY_SEKOLAH,
    ptkDetail: process.env.DAPODIK_ENDPOINT_PTK_DETAIL,
  }
};