import terser from '@rollup/plugin-terser'
import Obfuscator from 'javascript-obfuscator'

const options = {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    unicodeEscapeSequence: true,
    stringArray: true,
    stringArrayThreshold: 0.75,
};

const obfuscatorPlugin = () => {
    return {
        name: 'custom-javascript-obfuscator',
        renderChunk(code, chunk) {
            if (chunk.fileName.endsWith('.js')) {
                const obfuscationResult = Obfuscator.obfuscate(code, options)
                return {
                    code: obfuscationResult.getObfuscatedCode(),
                    map: null
                }
            }
            return null
        }
    }
}


export default {
    input: 'src/index.js',
    output: {
        format: 'es',
        file: 'index.js',
        sourcemap: false
    },
    external: ['node:path'],
    plugins: [
        terser({
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2,
            },
            mangle: {
                toplevel: true,
            },
            sourceMap: false,
        }),
        obfuscatorPlugin()
    ]
}
