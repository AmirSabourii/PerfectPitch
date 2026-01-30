import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, isAdminInitialized } from '@/lib/admin';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as admin from 'firebase-admin';

// POST: Save a pitch submission
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!isAdminInitialized() || !adminAuth) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await request.json();
    
    const {
      transcript,
      analysis,
      organizationId,
      programId,
      audioUrl,
      documentContext
    } = body;

    // Extract scores from PerfectPitch analysis
    let scores = null;
    if (analysis?.stage2?.scorecard) {
      const scorecard = analysis.stage2.scorecard;
      scores = {
        overall: analysis.stage3?.final_readiness_scoring?.overall_readiness || 
                 analysis.stage3?.final_readiness_scoring?.score_0_to_100 || 0,
        market: scorecard.marketSizeAccessibility?.score || 0,
        team: scorecard.businessModelClarity?.score || 0,
        innovation: scorecard.solutionFitDifferentiation?.score || 0,
      };
    }

    // Extract domain categories from analysis
    const domainCategories: string[] = [];
    if (analysis?.stage1?.startupReconstruction?.market) {
      domainCategories.push(analysis.stage1.startupReconstruction.market);
    }

    const pitchSubmission = {
      userId: uid,
      transcript: transcript || '',
      audioUrl: audioUrl || null,
      documentContext: documentContext || null,
      analysis: analysis,
      createdAt: Timestamp.now(),
      organizationId: organizationId || null,
      programId: programId || null,
      visibility: organizationId ? 'organization' : 'private',
      domainCategories: domainCategories,
      scores: scores,
    };

    const docRef = await addDoc(collection(db, 'pitchSubmissions'), pitchSubmission);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      organizationLinked: !!organizationId 
    });
  } catch (error: any) {
    console.error('Error saving pitch submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save pitch submission' },
      { status: 500 }
    );
  }
}

// GET: Retrieve pitch submissions (for user or organization)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!isAdminInitialized() || !adminAuth) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    let q;
    if (organizationId) {
      // Get all pitches for organization (admin view)
      q = query(
        collection(db, 'pitchSubmissions'),
        where('organizationId', '==', organizationId)
      );
    } else {
      // Get user's own pitches
      q = query(
        collection(db, 'pitchSubmissions'),
        where('userId', '==', uid)
      );
    }

    const snapshot = await getDocs(q);
    const pitches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(pitches);
  } catch (error: any) {
    console.error('Error fetching pitch submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pitch submissions' },
      { status: 500 }
    );
  }
}
