const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  // Create or find a user
  let user = await prisma.user.findUnique({ where: { email: 'seed+tx@example.com' } });
  if (!user) {
    user = await prisma.user.create({ data: { email: 'seed+tx@example.com', password: 'password', name: 'Seed User' } });
  }

  // Create or find a category (name is not unique in schema, so use findFirst)
  let category = await prisma.category.findFirst({ where: { name: 'Seed Category' } });
  if (!category) {
    category = await prisma.category.create({ data: { name: 'Seed Category', type: 'EXPENSE' } });
  }

  // Create or upsert an account (name is unique)
  const account = await prisma.account.upsert({
    where: { name: 'Seed Account' },
    update: {},
    create: { name: 'Seed Account', initialBalance: 1000, currentBalance: 1000 }
  });

  // Create a transaction linked to the above records
  const tx = await prisma.transaction.create({
    data: {
      amount: 50.00,
      type: 'EXPENSE',
      description: 'Seed transaction created by script',
      categoryId: category.id,
      accountId: account.id,
      userId: user.id
    }
  });

  console.log('Created transaction:', tx);

  const total = await prisma.transaction.count();
  console.log('Total transactions:', total);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
