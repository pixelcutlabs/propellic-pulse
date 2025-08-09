import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateCycleSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      where: { id: params.id },
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

  } catch (error) {
    console.error('Update cycle error:', error);
    
    if (error.code === 'P2025') {
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
