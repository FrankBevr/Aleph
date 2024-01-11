import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Aleph",
  description: "CTRL+Hack+ZK",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Deploy Coin', link: '/01-DeployCoin/01-Summary' },
      { text: 'Dogo', link: '/02-Dogo/01-Summary' },
      { text: 'Incento', link: '/03-Incento/01-Summary' }
    ],

    sidebar: [
      {
        text: 'Deploy Coin',
        items: [
          { text: 'Summary', link: '/01-DeployCoin/01-Summary' },
          { text: "Milestone 1", link: '/05-M1-Journal/01-Journal' },
        ]
      },
      {
        text: 'Dogo',
        items: [
          { text: 'Summary', link: '/02-Dogo/01-Summary' },
        ]
      },
      {
        text: 'Incento',
        items: [
          { text: 'Summary', link: '/03-Incento/01-Summary' },
        ]
      },
      {
        text: 'Milestone 1',
        items: [
          { text: 'Journal', link: '/05-M1-Journal/01-Journal' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/frankbevr/Aleph' }
    ]
  }
})
