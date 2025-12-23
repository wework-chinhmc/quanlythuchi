const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });
const prisma = new PrismaClient();
(async () => {
  try {
    const c = await prisma.transaction.count();
    console.log('transaction_count:', c);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
