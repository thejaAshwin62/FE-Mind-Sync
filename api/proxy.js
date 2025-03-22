
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  let target = 'https://emb-service.onrender.com';
  
  // Create proxy
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1': '/api/v1',
    },
    onProxyRes: function(proxyRes, req, res) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    }
  })(req, res);
};