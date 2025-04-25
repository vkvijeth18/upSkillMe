// src/utils/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE;
console.log("Base URL:", baseURL);
const api = axios.create({
  baseURL,
  withCredentials: true, // optional: if you're using cookies
});

export default api;
