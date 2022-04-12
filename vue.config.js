const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
  	host: "127.0.0.1",
  	port: 3000,
  	proxy: {
          '/api': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            ws:false,
            rewrite: (pathStr)=>pathStr.replace('/api', '/api'),
            timeout:5000,
          },
          '/upload': {
             target: 'http://127.0.0.1:8000/',
             changeOrigin: true,
             ws: false,
             rewrite: (pathStr) => pathStr.replace('/api', ''),
             timeout: 5000,
          },
    },
  }
})
