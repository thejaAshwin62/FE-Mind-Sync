import axios from "axios";

const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://emb-service.onrender.com/api/v1";

const customFetch = axios.create({
  baseURL: isLocalDev ? "/api/v1" : apiBaseUrl,
});

export default customFetch;
