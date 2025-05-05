import { createProxyMiddleware } from "http-proxy-middleware";

const apiProxy = createProxyMiddleware({
  target: "https://emb-service.onrender.com",
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