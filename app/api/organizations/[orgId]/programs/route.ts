import { NextRequest, NextResponse } from 'next/server';
import { programService } from '@/lib/services/programService';
import { CreateProgramInput } from '@/lib/organizationTypes';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const programs = await programService.listPrograms(params.orgId);
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const body: CreateProgramInput & { createdBy: string } = await request.json();
    
    if (!body.name || !body.startDate || !body.endDate || !body.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const program = await programService.createProgram(
      params.orgId,
      {
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
      body.createdBy
    );
    
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
