import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Clear session cookie
    response.cookies.delete('session-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}