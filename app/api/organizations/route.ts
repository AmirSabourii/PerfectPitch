import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/services/organizationService';
import { CreateOrganizationInput } from '@/lib/organizationTypes';

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrganizationInput = await request.json();
    
    // Validate required fields
    if (!body.name || !body.contactEmail || !body.contactName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organization = await organizationService.createOrganization(body);
    
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
