# Organization Data Flow - Complete Implementation

## Overview
This document explains how pitch submissions are automatically linked to organizations when users are members, and how organization admins can access all participant data.

## Architecture

### 1. User Authentication & Organization Context
**File**: `contexts/AuthContext.tsx`

When a user logs in:
1. User profile is loaded from Firestore
2. System checks for active organization memberships
3. If user is a member, organization details are loaded
4. Context provides: `organizationContext: { membership, organization }`

```typescript
interface UserOrganizationContext {
  membership: OrganizationMembership | null;
  organization: Organization | null;
}
```

### 2. Automatic Organization Linking
**File**: `hooks/usePitchAnalysis.ts`

When a user submits a pitch:
1. System checks if user has `organizationContext`
2. If yes, automatically includes:
   - `organizationId`: From membership
   - `programId`: First program from membership (if multiple)
3. These are sent to analysis API and saved with the pitch

```typescript
const payload = {
  transcript: text,
  file_context: documentContext,
  organizationId: organizationContext?.membership?.organizationId,
  programId: organizationContext?.membership?.programIds?.[0],
  ...contextData
}
```

### 3. Pitch Storage
**File**: `app/api/pitch-submissions/route.ts`

Two collections store pitch data:

#### A. `pitchSubmissions` Collection (Organization View)
- Stores all pitches with organization linkage
- Used by organization admins to view participant activity
- Fields:
  - `userId`: Who submitted
  - `organizationId`: Which organization
  - `programId`: Which program
  - `transcript`: Full pitch text
  - `analysis`: Complete PerfectPitch analysis
  - `scores`: Extracted scores
  - `visibility`: 'organization' or 'private'
  - `createdAt`: Timestamp

#### B. `users/{uid}/sessions` Collection (User History)
- Personal history for each user
- Same data as pitchSubmissions
- Used for user's own history view

### 4. Organization Admin Access
**File**: `app/api/organizations/[orgId]/pitches/route.ts`

Organization admins can query:
```typescript
GET /api/organizations/{orgId}/pitches
```

This returns all pitches where `organizationId === orgId`, giving admins complete visibility into:
- All participant pitches
- Full transcripts
- Complete analysis results
- Scores and metrics
- Timestamps

### 5. UI Indicators
**File**: `components/dashboard/DashboardContent.tsx`

When user is part of an organization:
- Header shows organization badge with name
- Green dot indicator shows active membership
- Badge displays: `🟢 {Organization Name}`

```tsx
{organizationContext?.organization && (
  <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5">
    <div className="w-2 h-2 rounded-full bg-emerald-500" />
    <span className="text-xs">{organizationContext.organization.name}</span>
  </div>
)}
```

## Data Flow Diagram

```
User Login
    ↓
Load Organization Membership
    ↓
User Submits Pitch
    ↓
[Auto-attach organizationId + programId]
    ↓
Save to pitchSubmissions (with org data)
    ↓
Save to users/{uid}/sessions (personal history)
    ↓
Organization Admin Queries
    ↓
GET /api/organizations/{orgId}/pitches
    ↓
Returns ALL participant pitches
```

## Privacy & Access Control

### Participant View
- Can see their own pitches in history
- Can see organization badge in header
- Cannot see other participants' pitches

### Organization Admin View
- Can see ALL participant pitches
- Can filter by program, score, date, etc.
- Has full access to transcripts and analysis
- Can view analytics and metrics

### Data Isolation
- Pitches without `organizationId` remain private
- Only pitches with `organizationId` are visible to admins
- Users who are not organization members have completely private pitches

## API Endpoints

### For Participants
```typescript
// Submit pitch (auto-links to organization)
POST /api/analyze-pitch
Body: { transcript, file_context, stage, industry, targetAudience }
// organizationId/programId added automatically from context

// Get own pitches
GET /api/pitch-submissions
Returns: User's own pitches only
```

### For Organization Admins
```typescript
// Get all organization pitches
GET /api/organizations/{orgId}/pitches
Query params: programId, scoreThreshold, categories, dateRange

// Get organization analytics
GET /api/organizations/{orgId}/analytics
Query params: programId

// Get participant list with metrics
GET /api/organizations/{orgId}/participants
Query params: programId
```

## Implementation Checklist

✅ AuthContext loads organization membership
✅ Organization context available throughout app
✅ Pitch submissions auto-link to organization
✅ pitchSubmissions collection stores org data
✅ Organization badge shows in header
✅ Admin can query all participant pitches
✅ Analytics service filters by organization
✅ Privacy maintained for non-org users

## Testing

### Test Scenario 1: Organization Member
1. User accepts invitation to organization
2. User logs in
3. Header shows organization badge
4. User submits pitch
5. Admin can see pitch in organization panel

### Test Scenario 2: Non-Member
1. User logs in (no organization)
2. No organization badge in header
3. User submits pitch
4. Pitch remains private (no organizationId)
5. Admin cannot see pitch

### Test Scenario 3: Admin View
1. Admin logs into organization panel
2. Views "Pitches" tab
3. Sees all participant pitches
4. Can filter by program, score, date
5. Can view full analysis for each pitch

## Future Enhancements

- [ ] Multi-organization support (user in multiple orgs)
- [ ] Program selector in UI (if user in multiple programs)
- [ ] Opt-out option for participants
- [ ] Anonymized view for admins (hide participant identity)
- [ ] Export functionality for admins
- [ ] Real-time notifications for new pitches
