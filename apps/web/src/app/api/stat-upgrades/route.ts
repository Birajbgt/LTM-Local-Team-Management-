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

    const backendResponse = await fetch(`${API_BASE_URL}/api/stat-upgrades`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = (await backendResponse.json().catch(() => [])) as unknown;

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Unable to load tickets." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load tickets." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      fieldName?: string;
      currentValue?: string;
      requestedValue?: string;
      reason?: string;
    };

    if (!body.fieldName?.trim() || !body.reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "Field name and reason are required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/stat-upgrades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fieldName: body.fieldName.trim(),
        currentValue: String(body.currentValue ?? "0"),
        requestedValue: String(body.requestedValue ?? "0"),
        reason: body.reason.trim(),
      }),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to create ticket." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Ticket created successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to create ticket." },
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

    const body = (await request.json()) as { id?: string; status?: string };
    const id = body.id?.trim();
    const status = body.status?.trim();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Ticket id and status are required." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${API_BASE_URL}/api/stat-upgrades/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = (await backendResponse.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Unable to update ticket." },
        { status: backendResponse.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Ticket updated successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to update ticket." },
      { status: 500 },
    );
  }
}
