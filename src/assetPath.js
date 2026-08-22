/* Resolves public/ assets against Vite's base path, so images work whether
   the app is served from the domain root (dev) or a subpath like
   /anvil/ (GitHub Pages project sites). */
export const asset = name => import.meta.env.BASE_URL + name.replace(/^\//, '');
