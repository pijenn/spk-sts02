import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, registerUserAccount } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ detail: "Payload JSON tidak valid." }, { status: 400 });
  }

  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (username.length < 3 || username.length > 50) {
    return NextResponse.json(
      { detail: "Username harus terdiri dari 3 hingga 50 karakter." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { detail: "Kata sandi minimal terdiri dari 6 karakter." },
      { status: 400 }
    );
  }

  try {
    const created = await registerUserAccount(username, password);
    const token = createSessionToken(created.user_id, created.username);
    return NextResponse.json(
      {
        user_id: created.user_id,
        username: created.username,
        token,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "USERNAME_TAKEN") {
      return NextResponse.json(
        { detail: "Username sudah terdaftar. Silakan pilih username lain." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Gagal mendaftarkan akun." },
      { status: 500 }
    );
  }
}
