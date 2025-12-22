const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function main(){
  try{
    const body = {
      amount: 333.33,
      type: 'INCOME',
      description: 'Direct test POST',
      categoryName: 'DirectCat',
      accountName: 'DirectAcc',
      userEmail: 'direct@example.com'
    }

    let user = await prisma.user.findUnique({ where: { email: body.userEmail } });
    if(!user) user = await prisma.user.create({ data: { email: body.userEmail, password: 'pwd' } });

    const account = await prisma.account.upsert({ where: { name: body.accountName }, update: {}, create: { name: body.accountName, initialBalance: 0, currentBalance: 0 } });

    let category = await prisma.category.findFirst({ where: { name: body.categoryName } });
    if(!category) category = await prisma.category.create({ data: { name: body.categoryName, type: body.type === 'INCOME' ? 'INCOME' : 'EXPENSE' } });

    const tx = await prisma.transaction.create({ data: { amount: body.amount, type: body.type, description: body.description, categoryId: category.id, accountId: account.id, userId: user.id } });
    console.log('Direct create tx:', tx);
  }catch(e){
    console.error('Direct post error:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
