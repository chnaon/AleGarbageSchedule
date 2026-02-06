import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://edp.ale.se/FutureWeb/SimpleWastePickup/GetWastePickupSchedule?address=${encodeURIComponent(address)}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch schedule" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
