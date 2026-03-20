import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'force-utf8-charset',
            configureServer(server) {
                server.middlewares.use((_, res, next) => {
                    const originalSetHeader = res.setHeader.bind(res)
                    res.setHeader = (name, value) => {
                        const headerName = String(name).toLowerCase()
                        if (headerName === 'content-type' && typeof value === 'string' && !/charset=/i.test(value)) {
                            if (
                                value.indexOf('text/') === 0 ||
                                value.indexOf('javascript') >= 0 ||
                                value.indexOf('json') >= 0
                            ) {
                                return originalSetHeader(name, `${value}; charset=utf-8`)
                            }
                        }

                        return originalSetHeader(name, value as string)
                    }

                    next()
                })
            },
        },
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:7210', // since you're running backend on 7210
                changeOrigin: true,
                secure: false, // dev cert
            },
        },
    },
})