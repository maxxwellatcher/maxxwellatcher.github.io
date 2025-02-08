import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  // { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  // { text: '标签', link: '/blog/tags/' },
  // { text: '归档', link: '/blog/archives/' },
  {text: '站点导航', link: '/notes/siteNav.md'},
  {text: 'PDF参考', link: '/notes/pdfNav.md'},
  {
    text: '笔记',
    items: [{ text: '更多', link: '/notes/notesNav.md' }]
  },
])
