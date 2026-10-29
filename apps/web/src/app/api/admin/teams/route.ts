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

    const backendResponse = await fetch(`${API_BASE_URL}/api/teams`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = (await backendResponse.json().catch(() => [])) as unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Unable to load teams." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load teams." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required to create a team." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { name?: string; logoUrl?: string };
    const name = body.name?.trim();
    const logoUrl = body.logoUrl?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Team name is required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        logoUrl: logoUrl || "/logo/ltm.jpg",
      }),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to create team." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Team created successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to create team." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required to update a team." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { id?: string; name?: string; logoUrl?: string };
    const teamId = body.id?.trim();
    const name = body.name?.trim();
    const logoUrl = body.logoUrl?.trim();

    if (!teamId) {
      return NextResponse.json(
        { success: false, message: "Team id is required." },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Team name is required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        logoUrl: logoUrl || "/logo/ltm.jpg",
      }),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to update team." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Team updated successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to update team." },
      { status: 500 },
    );
  }
}
