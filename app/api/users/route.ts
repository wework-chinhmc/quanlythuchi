import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: "Thiếu email hoặc mật khẩu" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        role: "ACCOUNTANT",
      },
    });

    return Response.json(user);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return new Response(
      JSON.stringify({ error: "Lỗi máy chủ nội bộ" }),
      { status: 500 }
    );
  }
}
