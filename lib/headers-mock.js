// Este archivo es un mock para next/headers para evitar errores en el directorio pages/
export const cookies = () => {
  throw new Error("cookies() from next/headers is not available in the pages/ directory")
}

export const headers = () => {
  throw new Error("headers() from next/headers is not available in the pages/ directory")
}
