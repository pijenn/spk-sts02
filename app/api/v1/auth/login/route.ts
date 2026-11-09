import { NextRequest, NextResponse } from "next/server";
import { authenticateUserAccount, createSessionToken } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ detail: "Payload JSON tidak valid." }, { status: 400 });
  }

  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!username || !password) {
    return NextResponse.json(
      { detail: "Username dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }

  const user = await authenticateUserAccount(username, password);
  if (!user) {
    return NextResponse.json(
      { detail: "Username atau kata sandi salah." },
      { status: 401 }
    );
  }

  const token = createSessionToken(user.user_id, user.username);
  return NextResponse.json(
    {
      user_id: user.user_id,
      username: user.username,
      token,
    },
    { status: 200 }
  );
}
