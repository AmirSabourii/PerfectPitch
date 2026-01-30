import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analyticsService';
import { PitchFilters } from '@/lib/organizationTypes';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: PitchFilters = {};
    
    if (searchParams.get('programId')) {
      filters.programId = searchParams.get('programId')!;
    }
    
    if (searchParams.get('scoreThreshold')) {
      filters.scoreThreshold = parseFloat(searchParams.get('scoreThreshold')!);
      filters.scoreField = (searchParams.get('scoreField') as any) || 'overall';
    }
    
    if (searchParams.get('categories')) {
      filters.categories = searchParams.get('categories')!.split(',');
    }
    
    const pitches = await analyticsService.listOrganizationPitches(
      params.orgId,
      filters
    );
    
    return NextResponse.json(pitches);
  } catch (error) {
    console.error('Error fetching pitches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pitches' },
      { status: 500 }
    );
  }
}
