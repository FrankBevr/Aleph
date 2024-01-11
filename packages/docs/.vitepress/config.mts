import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Deploy Cash",
  description: "CTRL+Hack+ZK",
  themeConfig: {
    nav: [
      { text: 'Intro', link: '../01-Intro/01-Summary' },
      { text: 'Main', link: '../02-Main/00-Overview' },
      { text: 'Outro', link: '../03-Outro/01-Summary' },
    ],

    sidebar: [
      {
        text: 'Intro',
        items: [
          { text: 'Summary', link: '/01-Intro/01-Summary.md' },
        ]
      },
      {
        text: 'Main',
        items: [
          { text: 'Overview', link: '/02-Main/00-Overview' },
          { text: 'Milestone 1', link: '/02-Main/01-Milestone/01-Journal' },
        ]
      },
      {
        text: 'Outro',
        items: [
          { text: 'Summary', link: '/03-Outro/01-Summary' },
        ]
      },
      {
        text: 'Notes',
        items: [
          { text: 'Opening Ceremony', link: '/04-Notes/01-openingCeremony' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/frankbevr/DeployCash' }
    ]
  }
})
