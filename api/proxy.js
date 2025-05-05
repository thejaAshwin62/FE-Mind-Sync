import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config(); // Load env variables from .env

const apiProxy = createProxyMiddleware({
  target: process.env.VITE_API_BASE_URL || "http://localhost:5000", // Fallback if not defined
  changeOrigin: true,
  pathRewrite: { "^/api/v1": "/api/v1" },
  onProxyRes: function (proxyRes) {
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    proxyRes.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS, PATCH";
    proxyRes.headers["Access-Control-Allow-Headers"] =
      "X-Requested-With, Content-Type, Accept, Authorization";
    proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
  },
});

export default (req, res) => apiProxy(req, res);
