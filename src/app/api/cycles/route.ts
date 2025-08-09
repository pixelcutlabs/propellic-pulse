import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCycleSchema } from '@/lib/validations';

export async function GET() {
  try {
    const cycles = await prisma.cycle.findMany({
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('Get cycles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = createCycleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { year, month, startsAt, endsAt, questions } = validation.data;

    // Check if cycle already exists for this year/month
    const existingCycle = await prisma.cycle.findUnique({
      where: {
        year_month: { year, month },
      },
    });

    if (existingCycle) {
      return NextResponse.json(
        { error: 'Cycle already exists for this month' },
        { status: 409 }
      );
    }

    // Create cycle with questions in a transaction
    const cycle = await prisma.$transaction(async (tx) => {
      // Create the cycle
      const newCycle = await tx.cycle.create({
        data: {
          year,
          month,
          startsAt,
          endsAt,
          isActive: true,
        },
      });

      // Create questions
      await tx.question.createMany({
        data: questions.map(q => ({
          cycleId: newCycle.id,
          order: q.order,
          text: q.text,
        })),
      });

      return newCycle;
    });

    // Fetch the created cycle with questions
    const createdCycle = await prisma.cycle.findUnique({
      where: { id: cycle.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      cycle: createdCycle,
    });

  } catch (error) {
    console.error('Create cycle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
