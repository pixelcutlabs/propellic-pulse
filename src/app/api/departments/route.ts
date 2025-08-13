import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createDepartmentSchema } from '@/lib/validations';

export async function GET() {
  try {
    // Bootstrap default departments on first run
    const count = await prisma.department.count();
    if (count === 0) {
      await prisma.department.createMany({
        data: [
          { name: 'Operations' },
          { name: 'Marketing' },
          { name: 'Sales' },
          { name: 'Engineering' },
        ],
      });
    }

    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = createDepartmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Check if department already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 409 }
      );
    }

    // Create department
    const department = await prisma.department.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      department,
    });

  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
