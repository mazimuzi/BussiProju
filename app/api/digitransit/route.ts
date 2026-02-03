import { NextRequest, NextResponse } from "next/server";

const DIGITRANSIT_API_URL = "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1";
const API_KEY = process.env.NEXT_PUBLIC_DIGITRANSIT_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["digitransit-subscription-key"] = API_KEY;
    }

    const response = await fetch(DIGITRANSIT_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // Lue vastaus tekstinä ensin
    const responseText = await response.text();
    
    console.log("Digitransit status:", response.status);
    console.log("Digitransit response:", responseText.substring(0, 500));

    if (!response.ok) {
      return NextResponse.json(
        { error: `Digitransit API error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    // Parsi JSON vasta kun tiedämme että vastaus on ok
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from Digitransit", details: responseText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}