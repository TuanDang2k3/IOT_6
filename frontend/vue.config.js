module.exports = {
  devServer: {
    allowedHosts: ['all'],
    port: 8001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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