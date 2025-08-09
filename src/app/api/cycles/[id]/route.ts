import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateCycleSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validation = updateCycleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Update the cycle
    const updatedCycle = await prisma.cycle.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      cycle: updatedCycle,
    });

  } catch (error: unknown) {
    console.error('Update cycle error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cycle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
