import { NextResponse } from "next/server";

import { getMailMode } from "@/lib/runtime-config";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mailMode: getMailMode(process.env.MAIL_PROVIDER),
  });
}
