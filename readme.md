### 主要功能

允许你编写类似webpack的分包策略，目前createSplitChunks(config)中，config支持的参数有四个

```
test: 匹配器，可以是正则，也可以是磁盘的绝对路径。匹配器最多只会命中一次，如果没有命中匹配器，会默认调用rollup的默认分包策略
name: chunk的名称
priority: 匹配优先级，值越大，匹配优先级越高
minChunks:  复用次数(静态导入次数+动态导入次数)，当大于等于复用次数次数时才会单独分包
```



#### 示例

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createSplitChunks, output } from "soul-rollup-build"
import * as path from "node:path"

const resolve = (dir) => path.join(__dirname, dir)

export default defineConfig({
    plugins: [
      react()
  ],
  build: {
        rollupOptions: {
            output: {
                ...output,
                manualChunks: createSplitChunks({
                    app:{
                        test: /[\\/]node_modules[\\/](react|react-dom)([\\/]|$)/,
                        name:  null, // 当name的值为null时，会调用rollup的分包策略
                        priority: 200
                    },
                    codemirror:{
                        test: /[\\/]node_modules[\\/]codemirror([\\/]|$)/,
                        name: 'vendor-codemirror',
                        priority: 100
                    },
                    common:{
                        test: resolve('src/components'),
                        name: 'vendor-common',
                        minChunks: 3, // 当引用次数(动态导入次数+静态导入次数)大于3时才单独分包
                        priority: 100
                    }
                })
            }
        }
    }
})
```



```
output的主要配置是:
export const output = {
    entryFileNames: 'js/app-[hash].js',
    hashCharacters: 'hex',
    experimentalMinChunkSize: 20 * 1024, //20kb,代码拆分阶段强制合并体积小于指定阈值的chunk，避免产生过多碎片化的JS请求
    chunkFileNames: (chunkInfo) => {
        if(chunkInfo.name && chunkInfo.name.startsWith('vendor-')){
            return 'js/[name]-[hash].js'
        }
        return 'js/chunk-[hash].js'
    },
    assetFileNames: (info) => {
        const ext = info.name?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
        if (!ext) return 'other/chunk.[hash].[ext]'
        if (ext === 'css') return 'css/chunk.[hash].[ext]'
        if (ext === 'wasm') return 'wasm/chunk.[hash].[ext]'
        if (['json', 'map'].includes(ext)) return 'data/chunk.[hash].[ext]'
        if (['txt', 'xml', 'pdf'].includes(ext)) return 'docs/chunk.[hash].[ext]'
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'tif', 'tiff'].includes(ext)) return 'img/chunk.[hash].[ext]'
        if (['mp3', 'm4a', 'ogg', 'opus', 'flac', 'mp4', 'webm', 'wav', 'aac', 'mov', 'avi'].includes(ext)) return 'media/chunk.[hash].[ext]'
        if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(ext)) return 'fonts/chunk.[hash].[ext]'
        return 'other/chunk.[hash].[ext]'
    }
}
```

