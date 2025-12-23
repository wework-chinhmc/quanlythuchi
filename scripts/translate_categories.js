const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const map = {
    'FinalCat': 'Danh mục cuối',
    'ErrCat': 'Danh mục lỗi',
    'DirectCat': 'Danh mục trực tiếp',
    'Seed Category': 'Danh mục mẫu'
  }

  for (const [from, to] of Object.entries(map)) {
    const res = await prisma.category.updateMany({ where: { name: from }, data: { name: to } })
    console.log(`Updated ${res.count} row(s): ${from} -> ${to}`)
  }

  const cats = await prisma.category.findMany({ orderBy: { id: 'asc' } })
  console.log('Current categories:')
  cats.forEach((c) => console.log(c.id, c.name, c.type))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
