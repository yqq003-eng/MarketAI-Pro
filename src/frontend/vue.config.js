const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,
  outputDir: '../../dist',
  publicPath: './',
  
  devServer: {
    port: 8080,
    host: 'localhost',
    https: false,
    hot: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      },
      '/ws': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },

  chainWebpack: (config) => {
    // 优化打包
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vue: {
          name: 'chunk-vue',
          priority: 10,
          test: /[\\/]node_modules[\\/]_?vue(.*)/
        },
        elementPlus: {
          name: 'chunk-element-plus',
          priority: 20,
          test: /[\\/]node_modules[\\/]_?element-plus(.*)/
        }
      }
    })
  }
})
