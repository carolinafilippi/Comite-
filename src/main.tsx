import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { content } from './content'

/**
 * Los textos se leen de contenido.json (junto a index.html) cada vez que se abre la página.
 * Así se pueden editar desde GitHub sin recompilar. Si el archivo falta o tiene un error,
 * se usan los textos incluidos en la compilación.
 */
async function cargarContenido() {
  try {
    const r = await fetch(`./contenido.json?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return
    const nuevo = await r.json()
    if (nuevo && Array.isArray(nuevo.slides) && Array.isArray(nuevo.cases)) Object.assign(content, nuevo)
  } catch { /* se usa el contenido incluido */ }
}

cargarContenido().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
