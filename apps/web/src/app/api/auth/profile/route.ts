import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = (await backendResponse.json().catch(() => ({}))) as { message?: string };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to load profile." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const payload = {
      ...(body.email?.trim() ? { email: body.email.trim().toLowerCase() } : {}),
      ...(body.password?.trim() ? { password: body.password.trim() } : {}),
    };

    if (!Object.keys(payload).length) {
      return NextResponse.json(
        { success: false, message: "Provide an email or password update." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as {
      accessToken?: string;
      message?: string;
      user?: { id?: string; email?: string; name?: string; role?: string };
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to update profile." },
        { status: backendResponse.status || 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      message: "Profile updated successfully.",
    });

    if (data.accessToken) {
      response.cookies.set("token", data.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to update profile." },
      { status: 500 },
    );
  }
}
