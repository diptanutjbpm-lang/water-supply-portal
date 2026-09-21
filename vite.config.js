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

    /*
     * ========================================================
     * LOCAL DEVELOPMENT PROXY
     * ========================================================
     *
     * This is used only while running:
     *
     * npm run dev
     * npm run preview
     *
     * It lets the local Vite app communicate with
     * Google Apps Script without browser CORS problems.
     *
     * Cloudflare Pages production does NOT use this proxy.
     * ========================================================
     */
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
       * ======================================================
       * IMPORTANT FOR CLOUDFLARE PAGES
       * ======================================================
       *
       * Production URL:
       *
       * https://water-supply-portal.pages.dev/
       *
       * Therefore assets must load from:
       *
       * /assets/...
       *
       * NOT:
       *
       * /water-supply-portal/assets/...
       *
       * ======================================================
       */
      base: '/',

      server:
        proxy
          ? {
              proxy,
            }
          : undefined,

      preview:
        proxy
          ? {
              proxy,
            }
          : undefined,
    }
  },
)