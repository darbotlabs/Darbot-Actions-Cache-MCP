import wasm from 'vite-plugin-wasm'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-20',
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/content', '@nuxt/ui', '@nuxt/fonts', '@nuxthq/studio'],
  hooks: {
    // Define `@nuxt/ui` components as global to use them in `.md` (feel free to add those you need)
    'components:extend': (components) => {
      const globals = components.filter((c) =>
        ['UButton', 'UIcon', 'UAlert'].includes(c.pascalName),
      )

      for (const c of globals) {
        c.global = true
      }
    },
  },
  vite: {
    plugins: [wasm()],
    build: {
      rollupOptions: {
        external: ['shiki/onig.wasm'],
      },
    },
  },
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/rocket.svg',
        },
      ],
    },
  },
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  ui: {},
  content: {
    highlight: {
      langs: [
        'js',
        'jsx',
        'json',
        'ts',
        'tsx',
        'vue',
        'css',
        'html',
        'vue',
        'bash',
        'md',
        'mdc',
        'yml',
        'yaml',
        'dockerfile',
        'csharp',
      ],
    },
  },
  routeRules: {
    '/api/search.json': { prerender: true },
  },
  devtools: {
    enabled: true,
  },
})
