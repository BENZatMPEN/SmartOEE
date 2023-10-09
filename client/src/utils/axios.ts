import axios from 'axios';
import { HOST_API } from '../config';

const axiosInstance = axios.create({
  baseURL: `${HOST_API}/api`,
  validateStatus: function (status) {
    return status < 400;
  },
});

axiosInstance.interceptors.response.use((response) => {
  handleDates(response.data);
  return response;
});

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

function isIsoDateString(value: any): boolean {
  return value && typeof value === 'string' && dateFormat.test(value);
}

export function handleDates(body: any) {
  if (body === null || body === undefined || typeof body !== 'object') return body;

  for (const key of Object.keys(body)) {
    const value = body[key];
    if (isIsoDateString(value)) body[key] = new Date(value);
    else if (typeof value === 'object') handleDates(value);
  }
}

export default axiosInstance;
