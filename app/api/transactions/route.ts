import * as prismaModule from '@/lib/prisma'
const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule

export async function GET() {
  try {
    const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true, account: true, user: true } })
    return new Response(JSON.stringify(txs), { headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    console.debug('PUT /api/transactions body:', body)
    const updated = await prisma.transaction.update({ where: { id: Number(id) }, data })
    console.debug('PUT /api/transactions updated:', updated)
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('PUT /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return new Response(JSON.stringify({ error: 'Thiếu id' }), { status: 400, headers: { 'content-type': 'application/json' } })
    console.debug('DELETE /api/transactions id:', id)
    await prisma.transaction.delete({ where: { id: Number(id) } })
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('DELETE /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.debug('POST /api/transactions body:', body)

    // Accept multiple payload shapes from UI/mocks
    const {
      amount: rawAmount,
      type: rawType,
      description,
      categoryId,
      categoryName,
      accountId,
      accountName,
      userEmail,
      performedBy,
      date
    } = body as any

    const amount = Number(rawAmount ?? 0)
    // normalize type: accept 'thu'|'chi' or 'INCOME'|'EXPENSE'
    const type = (rawType === 'thu' || rawType === 'INCOME') ? 'INCOME' : (rawType === 'chi' || rawType === 'EXPENSE') ? 'EXPENSE' : 'EXPENSE'

    // find or create user: prefer email, fall back to performedBy (name)
    let user = null
    if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) user = await prisma.user.create({ data: { email: String(userEmail), password: 'changeme', name: performedBy || null } })
    } else if (performedBy) {
      user = await prisma.user.findFirst({ where: { name: String(performedBy) } })
      if (!user) {
        // synthesize an email for created user
        const safe = String(performedBy).replace(/\s+/g, '_').toLowerCase()
        const email = `${safe}@local.invalid`
        user = await prisma.user.create({ data: { email, password: 'changeme', name: performedBy } })
      }
    } else {
      // fallback: use or create an anonymous user
      user = await prisma.user.findFirst()
      if (!user) user = await prisma.user.create({ data: { email: `user_${Date.now()}@local.invalid`, password: 'changeme' } })
    }

    // account: accept accountId (number) or accountName
    let account = null
    if (accountId != null) {
      account = await prisma.account.findUnique({ where: { id: Number(accountId) } })
    }
    if (!account) {
      const name = accountName || 'Default'
      account = await prisma.account.upsert({ where: { name }, update: {}, create: { name, initialBalance: 0, currentBalance: 0 } })
    }

    // category: accept numeric id or name
    let category = null
    if (categoryId != null) {
      // try numeric id
      const maybeId = Number(categoryId)
      if (!Number.isNaN(maybeId)) category = await prisma.category.findUnique({ where: { id: maybeId } })
    }
    if (!category) {
      const cname = categoryName || 'Uncategorized'
      category = await prisma.category.findFirst({ where: { name: cname } })
      if (!category) category = await prisma.category.create({ data: { name: cname, type: type === 'INCOME' ? 'INCOME' : 'EXPENSE' } })
    }

    const tx = await prisma.transaction.create({
      data: {
        amount,
        type: type as any,
        description: description || null,
        date: date ? new Date(date) : undefined,
        categoryId: category.id,
        accountId: account.id,
        userId: user.id
      }
    })
    console.debug('POST /api/transactions created:', tx)
    return new Response(JSON.stringify(tx), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('POST /api/transactions error:', err)
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
