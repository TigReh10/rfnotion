import { NextResponse, type NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
