import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCycleSchema } from '@/lib/validations';

export async function GET() {
  try {
    // If this is a fresh environment, bootstrap a default active cycle and departments
    const existingCycleCount = await prisma.cycle.count();
    if (existingCycleCount === 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 1-12

      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

      await prisma.$transaction(async (tx) => {
        const created = await tx.cycle.create({
          data: {
            year,
            month,
            startsAt: startOfMonth,
            endsAt: endOfMonth,
            isActive: true,
          },
        });

        await tx.question.createMany({
          data: [
            { cycleId: created.id, order: 1, text: "What went well for you at Propellic this month?" },
            { cycleId: created.id, order: 2, text: "What could we improve next month?" },
          ],
        });

        const deptCount = await tx.department.count();
        if (deptCount === 0) {
          await tx.department.createMany({
            data: [
              { name: "Operations" },
              { name: "Marketing" },
              { name: "Sales" },
              { name: "Engineering" },
            ],
          });
        }
      });
    }

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
