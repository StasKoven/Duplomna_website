import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TechStore — Інтернет-магазин електроніки',
    short_name: 'TechStore',
    description:
      'Купуйте смартфони, ноутбуки, планшети та аксесуари за найкращими цінами з офіційною гарантією.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['shopping', 'electronics'],
    lang: 'uk',
    icons: [],
  }
}
