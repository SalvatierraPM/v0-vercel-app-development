const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Directorios
const pagesDir = path.join(process.cwd(), "pages")
const appDir = path.join(process.cwd(), "app")

// Verificar si el directorio pages existe
if (!fs.existsSync(pagesDir)) {
  console.log("El directorio pages/ no existe. No hay nada que migrar.")
  process.exit(0)
}

// Crear directorio app si no existe
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir)
  console.log("Creado directorio app/")
}

// Función para convertir un archivo de pages a app
function convertPageToApp(pagePath, relativePath) {
  const content = fs.readFileSync(pagePath, "utf8")

  // Convertir a componente de cliente si no lo es ya
  let newContent = content
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    newContent = "'use client';\n\n" + content
  }

  // Determinar la nueva ruta en app/
  let newRelativePath = relativePath

  // Manejar rutas dinámicas: [id].js -> [id]/page.js
  if (path.basename(relativePath).startsWith("[") && path.basename(relativePath).endsWith("]")) {
    const dir = path.dirname(relativePath)
    const basename = path.basename(relativePath, path.extname(relativePath))
    newRelativePath = path.join(dir, basename, "page" + path.extname(relativePath))
  }
  // Manejar index.js -> page.js
  else if (path.basename(relativePath) === "index.js" || path.basename(relativePath) === "index.tsx") {
    const dir = path.dirname(relativePath)
    newRelativePath = path.join(dir, "page" + path.extname(relativePath))
  }
  // Otros archivos: file.js -> file/page.js
  else {
    const dir = path.dirname(relativePath)
    const basename = path.basename(relativePath, path.extname(relativePath))
    newRelativePath = path.join(dir, basename, "page" + path.extname(relativePath))
  }

  // Crear directorios necesarios
  const newDir = path.dirname(path.join(appDir, newRelativePath))
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true })
  }

  // Escribir el nuevo archivo
  fs.writeFileSync(path.join(appDir, newRelativePath), newContent)
  console.log(`Migrado: ${relativePath} -> app/${newRelativePath}`)
}

// Función para manejar API routes
function convertApiToApp(apiPath, relativePath) {
  const content = fs.readFileSync(apiPath, "utf8")

  // Determinar la nueva ruta en app/api/
  let newRelativePath = relativePath.replace(/^api\//, "")

  // Manejar rutas dinámicas: [id].js -> [id]/route.js
  if (path.basename(newRelativePath).startsWith("[") && path.basename(newRelativePath).endsWith("]")) {
    const dir = path.dirname(newRelativePath)
    const basename = path.basename(newRelativePath, path.extname(newRelativePath))
    newRelativePath = path.join(dir, basename, "route" + path.extname(newRelativePath))
  }
  // Manejar index.js -> route.js
  else if (path.basename(newRelativePath) === "index.js" || path.basename(newRelativePath) === "index.tsx") {
    const dir = path.dirname(newRelativePath)
    newRelativePath = path.join(dir, "route" + path.extname(newRelativePath))
  }
  // Otros archivos: file.js -> file/route.js
  else {
    const dir = path.dirname(newRelativePath)
    const basename = path.basename(newRelativePath, path.extname(newRelativePath))
    newRelativePath = path.join(dir, basename, "route" + path.extname(newRelativePath))
  }

  // Crear directorios necesarios
  const newDir = path.dirname(path.join(appDir, "api", newRelativePath))
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true })
  }

  // Convertir el contenido para el App Router
  let newContent = content

  // Reemplazar exports.handler por export async function GET/POST/etc.
  if (newContent.includes("export default function handler")) {
    newContent = newContent.replace(
      /export default function handler\s*$$\s*req\s*,\s*res\s*$$\s*{/g,
      "export async function GET(request) {\n  const { searchParams } = new URL(request.url);\n",
    )

    // Reemplazar res.status().json() por return Response.json()
    newContent = newContent.replace(/res\.status$$(\d+)$$\.json$$(.*)$$/g, "return Response.json($2, { status: $1 })")

    // Reemplazar res.json() por return Response.json()
    newContent = newContent.replace(/res\.json$$(.*)$$/g, "return Response.json($1)")
  }

  // Escribir el nuevo archivo
  fs.writeFileSync(path.join(appDir, "api", newRelativePath), newContent)
  console.log(`Migrado API: ${relativePath} -> app/api/${newRelativePath}`)
}

// Función recursiva para procesar todos los archivos en pages/
function processDirectory(directory, baseDir = "") {
  const entries = fs.readdirSync(directory)

  for (const entry of entries) {
    const fullPath = path.join(directory, entry)
    const relativePath = path.join(baseDir, entry)

    if (fs.statSync(fullPath).isDirectory()) {
      // Es un directorio, procesarlo recursivamente
      processDirectory(fullPath, relativePath)
    } else if (entry.endsWith(".js") || entry.endsWith(".jsx") || entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      // Es un archivo JavaScript/TypeScript
      if (relativePath.startsWith("api/")) {
        // Es una API route
        convertApiToApp(fullPath, relativePath)
      } else {
        // Es una página normal
        convertPageToApp(fullPath, relativePath)
      }
    }
  }
}

// Iniciar la migración
console.log("Iniciando migración de pages/ a app/...")
processDirectory(pagesDir)

// Crear un archivo layout.js básico si no existe
const layoutPath = path.join(appDir, "layout.tsx")
if (!fs.existsSync(layoutPath)) {
  const layoutContent = `export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
`
  fs.writeFileSync(layoutPath, layoutContent)
  console.log("Creado archivo app/layout.tsx básico")
}

console.log("Migración completada. Revisa los archivos en app/ para asegurarte de que todo funciona correctamente.")
console.log("Recuerda que puedes eliminar el directorio pages/ una vez que hayas verificado que todo funciona en app/.")
