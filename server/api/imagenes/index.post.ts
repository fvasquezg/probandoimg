import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  // Extraemos los datos comunes del body como siempre (gracias a Base64)
  const { nombre, nombreArchivo, archivoBase64 } = await readBody(event)

  // 1. Limpiamos el prefijo que le pone el navegador al Base64 (ej: data:image/jpeg;base64,)
  const base64Limpio = archivoBase64.split(';base64,').pop()

  // 2. Definimos el nombre único para la carpeta public/img
  const nombreUnico = `${Date.now()}-${nombreArchivo}`
  const rutaFisica = `./public/img/${nombreUnico}`

  // 3. Guardamos el archivo en el disco usando fs de Node de forma síncrona (fácil y directo)
  fs.writeFileSync(rutaFisica, base64Limpio, { encoding: 'base64' })

  // 4. Guardamos la ruta que usará la etiqueta <img> en la Base de Datos
  const rutaWeb = `/img/${nombreUnico}`

  const nuevaImagen = await prisma.imagen.create({
    data: {
      nombre: nombre,
      img: rutaWeb
    }
  })

  return { ok: true, nuevaImagen }
})