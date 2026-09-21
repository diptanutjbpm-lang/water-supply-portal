import {
  defineConfig,
  loadEnv,
} from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig(
  ({ mode }) => {

    const env =
      loadEnv(
        mode,
        process.cwd(),
        '',
      )

    const appsScriptUrl =
      String(
        env.VITE_APPS_SCRIPT_URL || ''
      ).trim()

    let proxy = undefined

    if (appsScriptUrl) {

      const targetUrl =
        new URL(
          appsScriptUrl
        )

      proxy = {
        '/tjb-api': {

          target:
            targetUrl.origin,

          changeOrigin:
            true,

          secure:
            true,

          followRedirects:
            true,

          rewrite: () =>
            targetUrl.pathname,
        },
      }
    }

    return {

      plugins: [
        react(),
      ],

      /*
       * IMPORTANT
       *
       * Repository must be named:
       * water-supply-portal
       */
      base:
        '/water-supply-portal/',

      server:
        proxy
          ? { proxy }
          : undefined,

      preview:
        proxy
          ? { proxy }
          : undefined,
    }
  },
)