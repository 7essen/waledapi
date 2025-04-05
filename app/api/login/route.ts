import { NextResponse } from "next/server";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (
    (email === process.env.LOGIN_USERNAME || email === process.env.LOGIN_USERNAME + "@example.com") &&
    password === process.env.PASSWORD
  ) {
    try {
      // Sign in with Firebase using the provided credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
  } else {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
}