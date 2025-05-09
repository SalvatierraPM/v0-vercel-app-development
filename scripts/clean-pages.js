const fs = require("fs")
const path = require("path")

// Función para eliminar un directorio de forma recursiva
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursivamente eliminar subdirectorios
        deleteFolderRecursive(curPath)
      } else {
        // Eliminar archivos
        fs.unlinkSync(curPath)
      }
    })
    // Eliminar el directorio vacío
    fs.rmdirSync(folderPath)
    console.log(`Deleted directory: ${folderPath}`)
  }
}

// Eliminar el directorio pages/
const pagesDir = path.join(__dirname, "..", "pages")
console.log(`Attempting to delete: ${pagesDir}`)
deleteFolderRecursive(pagesDir)

console.log("Cleanup completed successfully.")
