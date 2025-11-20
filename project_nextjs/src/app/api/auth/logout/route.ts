import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Clear session cookie
    response.cookies.delete('session-token')

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}