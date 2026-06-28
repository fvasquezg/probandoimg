export default defineEventHandler(async () => {
  return await prisma.imagen.findMany({
    orderBy: { id: 'desc' }
  })
})    