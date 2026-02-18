import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getSession();
    
    // Cek apakah benar Superadmin
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [total, logs] = await prisma.$transaction([
      prisma.audit_logs.count(),
      prisma.audit_logs.findMany({
        take: limit,
        skip: skip,
        orderBy: { created_at: 'desc' },
        // Jika kamu ingin join ke tabel user untuk ambil nama aslinya
        // include: { user: { select: { nama: true } } } 
      })
    ]);

    return NextResponse.json({
      data: logs,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat log' }, { status: 500 });
  }
}