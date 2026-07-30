import axios from "axios"

const defaultBaseUrl = import.meta.env.PROD
  ? "https://enterprise-ai-platform-0o51.onrender.com"
  : "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl
})

export default api