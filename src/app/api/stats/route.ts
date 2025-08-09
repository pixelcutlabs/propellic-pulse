import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { computeENPS } from '@/lib/enps';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cycleParam = searchParams.get('cycle');

    let whereClause = {};

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
      }
    }

    // Get responses for the specified cycle(s)
    const responses = await prisma.response.findMany({
      where: whereClause,
      include: {
        cycle: true,
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate eNPS
    const scores = responses.map(r => r.enpsScore);
    const enpsData = computeENPS(scores);

    // Get trend data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const trendData = await prisma.cycle.findMany({
      where: {
        startsAt: {
          gte: twelveMonthsAgo,
        },
      },
      include: {
        responses: true,
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    const trend = trendData.map(cycle => {
      const cycleScores = cycle.responses.map(r => r.enpsScore);
      const cycleEnps = computeENPS(cycleScores);
      
      return {
        month: `${cycle.year}-${String(cycle.month).padStart(2, '0')}`,
        enpsScore: cycleEnps.enps,
        responseCount: cycle.responses.length,
      };
    });

    // Get department breakdown
    const departmentStats = await prisma.department.findMany({
      include: {
        responses: {
          where: whereClause,
        },
      },
    });

    const departments = departmentStats.map(dept => {
      const deptScores = dept.responses.map(r => r.enpsScore);
      const deptEnps = computeENPS(deptScores);
      
      return {
        id: dept.id,
        name: dept.name,
        responseCount: dept.responses.length,
        enpsScore: deptEnps.enps,
        ...deptEnps,
      };
    }).filter(dept => dept.responseCount > 0);

    // Collect all text responses for word analysis
    const textResponses = responses.flatMap(response => [
      response.q1,
      response.q2,
      response.q3,
    ]).filter(Boolean) as string[];

    return NextResponse.json({
      summary: {
        totalResponses: responses.length,
        ...enpsData,
      },
      trend,
      distribution: {
        promoters: enpsData.promoters,
        passives: enpsData.passives,
        detractors: enpsData.detractors,
      },
      departments,
      textResponses,
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
