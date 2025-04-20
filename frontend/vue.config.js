module.exports = {
  devServer: {
    allowedHosts: ['all'],
    port: 8001,
    proxy: {
      '/api': {
        target: 'http://64.176.84.25:5000',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    performance: {
      hints: false
    }
  },
  transpileDependencies: [],
  lintOnSave: false // This disables ESLint during development
}