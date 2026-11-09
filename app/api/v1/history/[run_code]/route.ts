import { NextRequest, NextResponse } from "next/server";
import { getRunHistoryByCode } from "@/lib/server-store";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ run_code: string }> }
) {
  const { run_code } = await ctx.params;
  const record = await getRunHistoryByCode(run_code);
  if (!record) {
    return NextResponse.json(
      { detail: `Kode sesi "${run_code.toUpperCase()}" tidak terdaftar.` },
      { status: 404 }
    );
  }
  return NextResponse.json(record, { status: 200 });
}
