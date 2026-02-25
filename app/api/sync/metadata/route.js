import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const data = await prisma.system_metadata.findUnique({
    where: { key: 'LAST_GLOBAL_SYNC' }
  });
  return NextResponse.json(data || { value: null });
}