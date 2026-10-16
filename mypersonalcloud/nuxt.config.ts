// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  components: [
    {
      path: "~/components/fundamentals",
      pathPrefix: false
    },
    {
      path: "~/components/home",
      pathPrefix: false
    },
    {
      path: "~/components/parameters",
      pathPrefix: false
    },
    {
      path: "~/components/recents",
      pathPrefix: false
    },    
    "~/components/"
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
