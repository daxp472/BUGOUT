import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Base path: on GitHub Actions the repository name becomes the Pages subpath
// (e.g. /BUGOUT/); locally and on root-domain hosts this stays '/'.
const computeBase = (): string => {
  const repo = process.env.GITHUB_REPOSITORY
  if (repo && repo.includes('/')) {
    return `/${repo.split('/')[1]}/`
  }
  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: computeBase(),
})
