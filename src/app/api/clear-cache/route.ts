import { NextResponse } from "next/server";
import { clearServerCache } from "../../../lib/serverCache";

export async function POST() {
  try {
    clearServerCache();
    return NextResponse.json({ message: "Server cache cleared successfully." });
  } catch (error) {
    console.error("Error clearing server cache:", error);
    return NextResponse.json({ error: "Failed to clear server cache." }, { status: 500 });
  }
}
