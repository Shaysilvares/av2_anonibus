import axios from 'axios';

const api = axios.create({
  baseURL: 'https://us-central1-anonibus-531aa.cloudfunctions.net',
});

export default api;
