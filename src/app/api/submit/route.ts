import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSubmissionHash } from '@/lib/hash';
import { surveySubmissionSchema } from '@/lib/validations';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = surveySubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { cycleId, enpsScore, answers, name, departmentId, honeypot } = validation.data;

    // Check honeypot (spam detection)
    if (honeypot && honeypot.trim() !== '') {
      // Bot detected, return success but don't save
      return NextResponse.json({ success: true });
    }

    // Verify cycle exists and is active
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle || !cycle.isActive) {
      return NextResponse.json(
        { error: 'Survey cycle not found or not active' },
        { status: 404 }
      );
    }

    // Check if cycle is within date range
    const now = new Date();
    if (now < cycle.startsAt || now > cycle.endsAt) {
      return NextResponse.json(
        { error: 'Survey cycle is not currently open' },
        { status: 400 }
      );
    }

    // Generate submission hash to prevent duplicates
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const submissionHash = generateSubmissionHash(ip, userAgent, cycleId);

    // Check for duplicate submission
    const existingResponse = await prisma.response.findUnique({
      where: { submissionHash },
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: 'You have already submitted a response for this survey cycle' },
        { status: 409 }
      );
    }

    // Create response
    const response = await prisma.response.create({
      data: {
        cycleId,
        enpsScore,
        q1: answers[0] || null,
        q2: answers[1] || null,
        q3: answers[2] || null,
        name: name || null,
        departmentId: departmentId || null,
        submissionHash,
      },
    });

    return NextResponse.json({
      success: true,
      responseId: response.id,
    });

  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
