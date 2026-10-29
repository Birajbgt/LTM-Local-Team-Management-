import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await backendResponse.json()) as {
      accessToken?: string;
      message?: string;
      user?: { id?: string; email?: string; name?: string; role?: string };
    };

    if (!backendResponse.ok || !data.accessToken) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Invalid email or password." },
        { status: backendResponse.status || 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      redirect: "/dashboard",
    });

    response.cookies.set("token", data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to sign in." },
      { status: 500 },
    );
  }
}
