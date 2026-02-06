import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchText } = await request.json();

    if (!searchText || searchText.length < 2) {
      return NextResponse.json({ Succeeded: true, Buildings: [] });
    }

    const response = await fetch(
      "https://edp.ale.se/FutureWeb/SimpleWastePickup/SearchAdress",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { Succeeded: false, Buildings: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { Succeeded: false, Buildings: [] },
      { status: 500 }
    );
  }
}
