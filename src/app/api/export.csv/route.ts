import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateCSV, generateFilename } from '@/lib/csv';
import { exportQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cycleParam = searchParams.get('cycle');

    // Validate query parameters
    const validation = exportQuerySchema.safeParse({ cycle: cycleParam });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    let whereClause = {};
    let cycleName = 'all';

    if (cycleParam && cycleParam !== 'all') {
      // Parse cycle parameter (format: YYYY-MM)
      const [year, month] = cycleParam.split('-').map(Number);
      if (year && month) {
        whereClause = {
          cycle: {
            year,
            month,
          },
        };
        cycleName = cycleParam;
      }
    }

    // Fetch responses with related data
    const responses = await prisma.response.findMany({
      where: whereClause,
      include: {
        department: true,
        cycle: true,
      },
      orderBy: [
        { cycle: { year: 'desc' } },
        { cycle: { month: 'desc' } },
        { createdAt: 'desc' },
      ],
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for the specified criteria' },
        { status: 404 }
      );
    }

    // Generate CSV content
    const csvContent = generateCSV(responses);
    const filename = generateFilename(undefined, cycleName);

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
