import * as path from "node:path"

const toString = Object.prototype.toString

const isObject = (data) => toString.call(data) === '[object Object]'

const isNull = (data) => toString.call(data) === '[object Null]'

const isRegExp = (data) => toString.call(data) === '[object RegExp]'

const isString = (data) => toString.call(data) === '[object String]'

export const output = {
    entryFileNames: 'js/app-[hash].js',
    hashCharacters: 'hex',
    experimentalMinChunkSize: 20 * 1024,
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

export const createSplitChunks = (config = {}) => {

    if(!isObject(config)) return null

    const list = []
    Object.keys(config).forEach((key) => {
        const test = config[`${key}`].test

        if(!(isRegExp(test) || isString(test))) {
            throw new Error('[createSplitChunks] test must be a regexp or a string')
        }

        if (isString(test) && !path['isAbsolute'](test)) {
            throw new Error(`[createSplitChunks] test must be an absolute path, got: ${test}`)
        }

        if (isRegExp(test) && test.global) {
            throw new Error('[createSplitChunks] RegExp test must not use /g flag')
        }

        list.push({
            ...config[key],
            chunk_name: `${key.startsWith('vendor') ? key : `vendor-${key}`}`,
            type: isRegExp(test) ? 'regexp' : 'string'
        })
    })
    list.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    return (disk_path, { getModuleInfo }) => {
        const moduleInfo = getModuleInfo(disk_path)

        const target = list.find(item=> {
            if(item['minChunks'] && moduleInfo){
                const static_count = moduleInfo['importers'] ? moduleInfo['importers'].length : 0
                const dynamic_count = moduleInfo['dynamicImporters'] ? moduleInfo['dynamicImporters'].length : 0
                const total = static_count + dynamic_count
                if (total < item['minChunks']) return false
            }
            if(item.type === 'regexp') return item.test.test(disk_path)
            return disk_path.startsWith(item.test)
        })

        if(target && isNull(target.name)) return null

        if(target) return target.name || target.chunk_name

        return null
    }
}
