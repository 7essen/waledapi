import { signIn } from "@/lib/firebase-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    await signIn(email, password);

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}