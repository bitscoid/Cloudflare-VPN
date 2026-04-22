export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  modules: ["@nuxt/eslint"],
  future: {
    compatibilityVersion: 4,
  },
});