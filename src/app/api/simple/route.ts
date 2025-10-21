import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'simple API works',
    timestamp: new Date().toISOString()
  });
}