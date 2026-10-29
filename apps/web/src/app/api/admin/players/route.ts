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

    const backendResponse = await fetch(`${API_BASE_URL}/api/players`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = (await backendResponse.json().catch(() => [])) as unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Unable to load players." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load players." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required to create a player." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      role?: string;
      basePrice?: number;
      matchesPlayed?: number;
      totalRuns?: number;
      totalWickets?: number;
      teamId?: string;
      profileImageUrl?: string;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.role) {
      return NextResponse.json(
        { success: false, message: "Name, email, and role are required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        role: body.role,
        basePrice: Number(body.basePrice ?? 0),
        matchesPlayed: Number(body.matchesPlayed ?? 0),
        totalRuns: Number(body.totalRuns ?? 0),
        totalWickets: Number(body.totalWickets ?? 0),
        teamId: body.teamId?.trim() || undefined,
        profileImageUrl: body.profileImageUrl?.trim() || "/images/default-player.svg",
      }),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to create player." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Player created successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to create player." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required to update a player." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      basePrice?: number;
      matchesPlayed?: number;
      totalRuns?: number;
      totalWickets?: number;
      teamId?: string;
      profileImageUrl?: string;
    };

    const playerId = body.id?.trim();

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Player id is required." },
        { status: 400 },
      );
    }

    const payload: Record<string, unknown> = {};

    if (body.name?.trim()) payload.name = body.name.trim();
    if (body.role) payload.role = body.role;
    if (body.basePrice !== undefined) payload.basePrice = Number(body.basePrice);
    if (body.matchesPlayed !== undefined) payload.matchesPlayed = Number(body.matchesPlayed);
    if (body.totalRuns !== undefined) payload.totalRuns = Number(body.totalRuns);
    if (body.totalWickets !== undefined) payload.totalWickets = Number(body.totalWickets);
    if (body.teamId !== undefined) payload.teamId = body.teamId?.trim() || null;
    if (body.email?.trim()) payload.email = body.email.trim().toLowerCase();
    if (body.profileImageUrl !== undefined) payload.profileImageUrl = body.profileImageUrl?.trim() || "/images/default-player.svg";

    const backendResponse = await fetch(`${API_BASE_URL}/api/players/${playerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to update player." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Player updated successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to update player." },
      { status: 500 },
    );
  }
}
