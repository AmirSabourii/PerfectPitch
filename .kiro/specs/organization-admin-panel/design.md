# Design Document: Organization Admin Panel

## Overview

The Organization Admin Panel extends the existing pitch analysis platform with B2B multi-tenant capabilities. The design introduces a hierarchical organization structure where Organizations contain Programs, which contain Participants. Organization Admins can invite participants, track their pitch submissions, filter and analyze data, and manage multiple programs within a single organization.

The system maintains backward compatibility with existing individual user accounts while adding organizational context. Participants retain their personal accounts and can submit both personal pitches and organization-tagged pitches. The design leverages Firebase Authentication for identity management and Firestore for data storage, with security rules enforcing organization-level access control.

Key design principles:
- **Multi-tenancy**: Complete data isolation between organizations
- **Flexible hierarchy**: Organizations → Programs → Participants
- **Privacy preservation**: Participants control which pitches are shared with organizations
- **Scalable analytics**: Efficient aggregation queries for large datasets
- **Seamless integration**: Extends existing platform without breaking changes

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin UI   │  │ Participant  │  │  Individual  │      │
│  │  Components  │  │     UI       │  │   User UI    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │  /api/organizations/*                                 │  │
│  │  /api/programs/*                                      │  │
│  │  /api/invitations/*                                   │  │
│  │  /api/analytics/*                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Business Logic Layer                        │  │
│  │  - OrganizationService                                │  │
│  │  - InvitationService                                  │  │
│  │  - AnalyticsService                                   │  │
│  │  - AccessControlService                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │   Firestore  │  │   Firebase   │      │
│  │     Auth     │  │   Database   │  │   Functions  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow**:
   - User authenticates via Firebase Auth
   - Custom claims determine role (admin, participant, individual)
   - Access control middleware validates permissions for each request

2. **Invitation Flow**:
   - Admin creates invitation → Firestore record created
   - Email sent via Firebase Functions or API route
   - Recipient clicks link → Auth/registration → Association created

3. **Pitch Submission Flow**:
   - Participant submits pitch (existing flow)
   - Optional: Tag with organization/program
   - Analysis generated (existing flow)
   - If tagged: Visible to org admins; If not: Private

4. **Analytics Flow**:
   - Admin requests analytics → API validates org membership
   - Firestore queries with organization filter
   - Aggregation performed (client-side or Cloud Functions)
   - Results returned with caching

## Components and Interfaces

### Data Models

#### Organization Model
```typescript
interface Organization {
  id: string;                    // Unique identifier
  name: string;                  // Organization name
  type: 'science_park' | 'accelerator' | 'bootcamp' | 'innovation_center';
  status: 'active' | 'suspended' | 'expired';
  contactEmail: string;
  contactName: string;
  subscriptionPlan: {
    planId: string;
    participantLimit: number;
    pitchesPerMonth: number;
    features: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminIds: string[];            // Array of user IDs with admin access
}
```

#### Program Model
```typescript
interface Program {
  id: string;
  organizationId: string;        // Foreign key to Organization
  name: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'completed' | 'archived';
  participantIds: string[];      // Array of user IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // Admin user ID
}
```

#### Invitation Model
```typescript
interface Invitation {
  id: string;
  organizationId: string;
  programId?: string;            // Optional: Invite to specific program
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: string;             // Admin user ID
  invitedAt: Timestamp;
  acceptedAt?: Timestamp;
  expiresAt: Timestamp;
  token: string;                 // Secure token for invitation link
}
```

#### OrganizationMembership Model
```typescript
interface OrganizationMembership {
  id: string;
  userId: string;                // Participant user ID
  organizationId: string;
  role: 'admin' | 'participant';
  programIds: string[];          // Programs this user belongs to
  joinedAt: Timestamp;
  invitationId: string;          // Reference to original invitation
  status: 'active' | 'inactive';
}
```

#### Enhanced Pitch Submission Model
```typescript
interface PitchSubmission {
  // Existing fields...
  id: string;
  userId: string;
  transcript: string;
  audioUrl?: string;
  createdAt: Timestamp;
  
  // New organizational fields
  organizationId?: string;       // If submitted under organization
  programId?: string;            // If tagged to specific program
  visibility: 'private' | 'organization'; // Privacy control
  domainCategories: string[];    // AI-assigned categories
}
```

#### Analytics Aggregation Model
```typescript
interface OrganizationAnalytics {
  organizationId: string;
  programId?: string;            // Optional: Program-specific analytics
  
  // Participant metrics
  totalParticipants: number;
  activeParticipants: number;    // Submitted at least one pitch
  inactiveParticipants: number;
  
  // Pitch metrics
  totalPitches: number;
  pitchesThisMonth: number;
  averageScore: number;
  scoreDistribution: {
    range: string;               // e.g., "0-20", "20-40"
    count: number;
  }[];
  
  // Category distribution
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  
  // Trend data
  pitchTrend: {
    date: string;                // ISO date
    count: number;
  }[];
  
  // Computed at
  computedAt: Timestamp;
  cacheExpiry: Timestamp;
}
```

### Service Interfaces

#### OrganizationService
```typescript
interface OrganizationService {
  // Organization management
  createOrganization(data: CreateOrganizationInput): Promise<Organization>;
  getOrganization(orgId: string): Promise<Organization>;
  updateOrganization(orgId: string, updates: Partial<Organization>): Promise<Organization>;
  
  // Admin management
  addAdmin(orgId: string, userId: string): Promise<void>;
  removeAdmin(orgId: string, userId: string): Promise<void>;
  listAdmins(orgId: string): Promise<User[]>;
  
  // Membership queries
  getUserOrganizations(userId: string): Promise<Organization[]>;
  isUserAdmin(userId: string, orgId: string): Promise<boolean>;
  isUserParticipant(userId: string, orgId: string): Promise<boolean>;
}
```

#### ProgramService
```typescript
interface ProgramService {
  // Program CRUD
  createProgram(orgId: string, data: CreateProgramInput): Promise<Program>;
  getProgram(programId: string): Promise<Program>;
  updateProgram(programId: string, updates: Partial<Program>): Promise<Program>;
  deleteProgram(programId: string): Promise<void>;
  listPrograms(orgId: string, filters?: ProgramFilters): Promise<Program[]>;
  
  // Participant management
  addParticipantToProgram(programId: string, userId: string): Promise<void>;
  removeParticipantFromProgram(programId: string, userId: string): Promise<void>;
  listProgramParticipants(programId: string): Promise<User[]>;
}
```

#### InvitationService
```typescript
interface InvitationService {
  // Invitation lifecycle
  createInvitation(orgId: string, email: string, programId?: string): Promise<Invitation>;
  sendInvitationEmail(invitation: Invitation): Promise<void>;
  acceptInvitation(token: string, userId: string): Promise<OrganizationMembership>;
  revokeInvitation(invitationId: string): Promise<void>;
  resendInvitation(invitationId: string): Promise<void>;
  
  // Invitation queries
  listInvitations(orgId: string, filters?: InvitationFilters): Promise<Invitation[]>;
  getInvitationByToken(token: string): Promise<Invitation>;
  
  // Validation
  validateInvitation(token: string): Promise<boolean>;
  checkDuplicateInvitation(orgId: string, email: string): Promise<boolean>;
}
```

#### AnalyticsService
```typescript
interface AnalyticsService {
  // Aggregated analytics
  getOrganizationAnalytics(orgId: string, options?: AnalyticsOptions): Promise<OrganizationAnalytics>;
  getProgramAnalytics(programId: string, options?: AnalyticsOptions): Promise<OrganizationAnalytics>;
  
  // Participant-specific analytics
  getParticipantUsageMetrics(userId: string, orgId: string): Promise<UsageMetrics>;
  listParticipantsWithMetrics(orgId: string, programId?: string): Promise<ParticipantMetrics[]>;
  
  // Pitch queries with filters
  listOrganizationPitches(orgId: string, filters: PitchFilters): Promise<PitchSubmission[]>;
  getPitchHistory(userId: string, orgId: string): Promise<PitchSubmission[]>;
  
  // Export functionality
  exportParticipantData(orgId: string, format: 'csv' | 'json'): Promise<ExportResult>;
  exportAnalyticsReport(orgId: string, programId?: string): Promise<PDFBuffer>;
}

interface PitchFilters {
  programId?: string;
  scoreThreshold?: number;
  scoreField?: 'overall' | 'market' | 'team' | 'innovation';
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  participantIds?: string[];
}

interface UsageMetrics {
  userId: string;
  totalPitches: number;
  totalAnalyses: number;
  lastPitchDate?: Timestamp;
  joinedDate: Timestamp;
  programIds: string[];
}
```

#### AccessControlService
```typescript
interface AccessControlService {
  // Permission checks
  canAccessOrganization(userId: string, orgId: string): Promise<boolean>;
  canAccessProgram(userId: string, programId: string): Promise<boolean>;
  canAccessPitch(userId: string, pitchId: string): Promise<boolean>;
  canManageParticipants(userId: string, orgId: string): Promise<boolean>;
  
  // Role checks
  getUserRole(userId: string, orgId: string): Promise<'admin' | 'participant' | null>;
  
  // Data filtering
  filterPitchesByAccess(userId: string, pitches: PitchSubmission[]): Promise<PitchSubmission[]>;
}
```

### API Endpoints

#### Organization Management
- `POST /api/organizations` - Create organization (platform admin only)
- `GET /api/organizations/:orgId` - Get organization details
- `PATCH /api/organizations/:orgId` - Update organization
- `POST /api/organizations/:orgId/admins` - Add admin
- `DELETE /api/organizations/:orgId/admins/:userId` - Remove admin

#### Program Management
- `POST /api/organizations/:orgId/programs` - Create program
- `GET /api/organizations/:orgId/programs` - List programs
- `GET /api/programs/:programId` - Get program details
- `PATCH /api/programs/:programId` - Update program
- `DELETE /api/programs/:programId` - Delete program
- `POST /api/programs/:programId/participants` - Add participant
- `DELETE /api/programs/:programId/participants/:userId` - Remove participant

#### Invitation Management
- `POST /api/organizations/:orgId/invitations` - Create invitation
- `GET /api/organizations/:orgId/invitations` - List invitations
- `POST /api/invitations/:invitationId/resend` - Resend invitation
- `DELETE /api/invitations/:invitationId` - Revoke invitation
- `POST /api/invitations/accept` - Accept invitation (public endpoint)
- `GET /api/invitations/validate/:token` - Validate invitation token

#### Analytics and Reporting
- `GET /api/organizations/:orgId/analytics` - Get organization analytics
- `GET /api/programs/:programId/analytics` - Get program analytics
- `GET /api/organizations/:orgId/participants/metrics` - List participants with usage metrics
- `GET /api/organizations/:orgId/pitches` - List pitches with filters
- `GET /api/participants/:userId/history` - Get participant pitch history
- `POST /api/organizations/:orgId/export/participants` - Export participant data
- `POST /api/organizations/:orgId/export/analytics` - Export analytics report

## Data Models

### Firestore Collection Structure

```
/organizations/{orgId}
  - Organization document

/programs/{programId}
  - Program document
  - organizationId (indexed)

/invitations/{invitationId}
  - Invitation document
  - organizationId (indexed)
  - email (indexed)
  - token (indexed)

/organizationMemberships/{membershipId}
  - OrganizationMembership document
  - userId (indexed)
  - organizationId (indexed)
  - Composite index: (organizationId, userId)

/pitchSubmissions/{pitchId}
  - Enhanced with organizationId, programId, visibility
  - Composite indexes:
    - (organizationId, createdAt)
    - (organizationId, programId, createdAt)
    - (userId, organizationId, createdAt)
    - (organizationId, domainCategories)

/analyticsCache/{cacheKey}
  - Cached OrganizationAnalytics
  - TTL: 1 hour
  - Key format: "org:{orgId}:program:{programId}:date:{date}"

/users/{userId}
  - Existing user document
  - Enhanced with organizationIds array for quick lookup
```

### Firebase Security Rules

```javascript
// Organizations - Only admins can read/write
match /organizations/{orgId} {
  allow read: if isOrgAdmin(orgId);
  allow write: if isPlatformAdmin();
}

// Programs - Admins can manage, participants can read
match /programs/{programId} {
  allow read: if isOrgMember(getOrgId(programId));
  allow write: if isOrgAdmin(getOrgId(programId));
}

// Invitations - Admins can manage
match /invitations/{invitationId} {
  allow read: if isOrgAdmin(getInvitationOrgId(invitationId));
  allow create: if isOrgAdmin(request.resource.data.organizationId);
  allow update, delete: if isOrgAdmin(resource.data.organizationId);
}

// Organization Memberships - Users can read their own, admins can read all
match /organizationMemberships/{membershipId} {
  allow read: if request.auth.uid == resource.data.userId 
              || isOrgAdmin(resource.data.organizationId);
  allow write: if isOrgAdmin(resource.data.organizationId);
}

// Pitch Submissions - Enhanced access control
match /pitchSubmissions/{pitchId} {
  allow read: if request.auth.uid == resource.data.userId
              || (resource.data.visibility == 'organization' 
                  && isOrgMember(resource.data.organizationId));
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update: if request.auth.uid == resource.data.userId;
}

// Helper functions
function isOrgAdmin(orgId) {
  return request.auth.token.orgAdminIds.hasAny([orgId]);
}

function isOrgMember(orgId) {
  return request.auth.token.orgIds.hasAny([orgId]);
}

function isPlatformAdmin() {
  return request.auth.token.platformAdmin == true;
}
```

### Custom Claims Structure

Firebase Auth custom claims will be enhanced to include:

```typescript
interface CustomClaims {
  platformAdmin?: boolean;       // Platform-level admin
  orgAdminIds?: string[];        // Organizations where user is admin
  orgIds?: string[];             // Organizations where user is member
}
```

These claims are set when:
- User is added as organization admin
- User accepts invitation as participant
- User leaves organization (claims updated)

## Error Handling

### Error Types

```typescript
enum OrganizationErrorCode {
  // Organization errors
  ORG_NOT_FOUND = 'organization/not-found',
  ORG_ACCESS_DENIED = 'organization/access-denied',
  ORG_LIMIT_REACHED = 'organization/limit-reached',
  ORG_SUSPENDED = 'organization/suspended',
  
  // Program errors
  PROGRAM_NOT_FOUND = 'program/not-found',
  PROGRAM_ACCESS_DENIED = 'program/access-denied',
  PROGRAM_FULL = 'program/participant-limit-reached',
  
  // Invitation errors
  INVITATION_NOT_FOUND = 'invitation/not-found',
  INVITATION_EXPIRED = 'invitation/expired',
  INVITATION_ALREADY_ACCEPTED = 'invitation/already-accepted',
  INVITATION_DUPLICATE = 'invitation/duplicate-email',
  INVITATION_INVALID_TOKEN = 'invitation/invalid-token',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS = 'auth/insufficient-permissions',
  NOT_ORG_ADMIN = 'auth/not-organization-admin',
  NOT_ORG_MEMBER = 'auth/not-organization-member',
  
  // Data errors
  INVALID_INPUT = 'data/invalid-input',
  VALIDATION_FAILED = 'data/validation-failed',
}

class OrganizationError extends Error {
  constructor(
    public code: OrganizationErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OrganizationError';
  }
}
```

### Error Handling Strategy

1. **API Layer**: Catch all errors, map to appropriate HTTP status codes
   - 400: Invalid input, validation errors
   - 401: Authentication required
   - 403: Insufficient permissions
   - 404: Resource not found
   - 409: Conflict (duplicate invitation)
   - 429: Rate limit exceeded
   - 500: Internal server error

2. **Service Layer**: Throw typed errors with context
   ```typescript
   if (!isAdmin) {
     throw new OrganizationError(
       OrganizationErrorCode.NOT_ORG_ADMIN,
       'User is not an admin of this organization',
       { userId, orgId }
     );
   }
   ```

3. **Client Layer**: Display user-friendly messages
   - Map error codes to localized messages
   - Show actionable guidance (e.g., "Contact your admin")
   - Log detailed errors for debugging

4. **Validation**: Input validation at multiple layers
   - Client-side: Immediate feedback
   - API layer: Security validation
   - Service layer: Business logic validation
   - Database: Schema validation via Firestore rules

### Critical Error Scenarios

1. **Invitation Token Tampering**:
   - Validate token signature
   - Check expiration
   - Verify organization status
   - Return generic error to prevent enumeration

2. **Concurrent Admin Removal**:
   - Use Firestore transactions
   - Check admin count before removal
   - Prevent last admin removal

3. **Subscription Limit Exceeded**:
   - Check limits before creating invitations
   - Soft limit warnings at 90%
   - Hard limit enforcement at 100%
   - Clear error messages with upgrade path

4. **Data Access Violations**:
   - Enforce access control at API and database layers
   - Log suspicious access attempts
   - Return 404 instead of 403 to prevent enumeration

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage of the Organization Admin Panel feature.

### Unit Testing Approach

Unit tests will focus on:
- **Specific examples**: Testing concrete scenarios with known inputs and outputs
- **Edge cases**: Boundary conditions, empty states, maximum limits
- **Error conditions**: Invalid inputs, permission denials, resource not found
- **Integration points**: API endpoint contracts, service interactions, Firebase operations

Unit tests should be targeted and avoid excessive duplication with property tests. They are most valuable for:
- Testing specific business rules (e.g., "cannot remove last admin")
- Verifying error messages and codes
- Testing UI component rendering with specific data
- Mocking external dependencies (Firebase, email service)

### Property-Based Testing Approach

Property-based tests will verify universal correctness properties across randomized inputs. Each property test will:
- Run minimum 100 iterations with generated test data
- Reference the corresponding design property
- Use tag format: `Feature: organization-admin-panel, Property {N}: {property text}`

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property-Based Testing**: fast-check (TypeScript property testing library)
- **E2E Testing**: Playwright for critical user flows
- **Firebase Testing**: Firebase Emulator Suite for local testing

### Test Data Generation

For property-based tests, we'll create generators for:
- Organizations (random names, types, statuses)
- Programs (random dates, participant counts)
- Users (random emails, roles)
- Pitch submissions (random scores, categories, timestamps)
- Invitations (random tokens, expiration dates)

### Test Organization

```
tests/
  unit/
    services/
      organizationService.test.ts
      invitationService.test.ts
      analyticsService.test.ts
    api/
      organizations.test.ts
      programs.test.ts
      invitations.test.ts
    components/
      AdminDashboard.test.tsx
      ParticipantList.test.tsx
  
  properties/
    organizationProperties.test.ts
    invitationProperties.test.ts
    analyticsProperties.test.ts
    accessControlProperties.test.ts
  
  e2e/
    invitationFlow.spec.ts
    adminDashboard.spec.ts
    participantJourney.spec.ts
```

### Critical Test Scenarios

1. **Invitation Flow**: End-to-end from creation to acceptance
2. **Access Control**: Verify organization-level data isolation
3. **Analytics Accuracy**: Verify aggregation calculations
4. **Concurrent Operations**: Multiple admins modifying same data
5. **Subscription Limits**: Enforcement of participant and pitch limits
6. **Data Export**: Verify exported data completeness and format


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified and consolidated:
- Multiple counting properties (6.1, 6.2, 8.1, 8.2) can be unified into a general "aggregation accuracy" property
- Filtering properties (4.1, 4.2, 5.2, 5.3) share common filtering logic that can be tested comprehensively
- Access control properties (4.4, 7.6, 11.4, 14.5) all verify organization-level data isolation
- Multiple properties about data structure validation (1.1, 1.4, 3.1, 3.6) can be combined

The following properties represent the unique, non-redundant correctness guarantees:

### Core Data Integrity Properties

**Property 1: Organization Creation Completeness**
*For any* organization creation request with valid input data, the created organization record should contain all required fields (id, name, type, status, contactEmail, contactName, subscriptionPlan, adminIds) with valid values, and should have at least one admin assigned.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

**Property 2: Organization Status Enforcement**
*For any* organization with status 'suspended' or 'expired', attempting to create a new pitch submission for any participant associated with that organization should be rejected.
**Validates: Requirements 1.5**

### Invitation System Properties

**Property 3: Invitation Creation and Uniqueness**
*For any* valid email address and organization, creating an invitation should succeed and generate a unique invitation record, but attempting to create a duplicate invitation for the same email within the same organization should be rejected.
**Validates: Requirements 2.1, 2.5**

**Property 4: Invitation Acceptance Association**
*For any* valid invitation token, when a user accepts the invitation, the system should create an organization membership record associating that user with the invitation's organization.
**Validates: Requirements 2.4**

**Property 5: Invitation Expiration**
*For any* invitation with a creation timestamp more than 30 days in the past, the invitation status should be marked as 'expired'.
**Validates: Requirements 2.6**

**Property 6: Invitation Resend Capability**
*For any* invitation with status 'expired' or 'pending', the resend operation should succeed and update the invitation timestamp.
**Validates: Requirements 2.7**

### Program Management Properties

**Property 7: Program Creation and Association**
*For any* program creation request with valid data (name, description, dates), the created program should contain all required fields and should be associated with the requesting admin's organization.
**Validates: Requirements 3.1, 3.2**

**Property 8: Program Participant Management**
*For any* program and participant, adding the participant to the program should make them appear in the program's participant list, and subsequently removing them should remove them from the list.
**Validates: Requirements 3.3, 3.4**

**Property 9: Pitch Program Tagging**
*For any* pitch submission, the system should allow creating it with or without a program identifier, and when a program ID is provided, it should be stored with the pitch record.
**Validates: Requirements 3.5**

### Filtering and Search Properties

**Property 10: Score Threshold Filtering**
*For any* collection of pitch submissions and any score threshold value, filtering by that threshold should return only pitches with scores greater than or equal to the threshold, and all returned pitches should belong to the requesting admin's organization.
**Validates: Requirements 4.1, 4.4**

**Property 11: Multi-Dimension Score Filtering**
*For any* collection of pitch submissions and any score dimension (overall, market, team, innovation), filtering by a threshold on that dimension should correctly filter based on that specific score field.
**Validates: Requirements 4.2**

**Property 12: Category Assignment and Filtering**
*For any* analyzed pitch submission, it should have at least one domain category assigned, and filtering by selected categories should return only pitches that have at least one of the selected categories.
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 13: Category Count Accuracy**
*For any* organization's pitch submissions, the count displayed for each domain category should equal the actual number of pitches tagged with that category.
**Validates: Requirements 5.4**

### Analytics and Aggregation Properties

**Property 14: Usage Metrics Accuracy**
*For any* participant in an organization, the displayed usage metrics (total pitches, total analyses, most recent pitch date) should match the actual count and dates from that participant's pitch submission records.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Property 15: Real-time Metrics Update**
*For any* participant, when a new pitch submission is created, querying their usage metrics immediately afterward should reflect the new submission in the counts.
**Validates: Requirements 6.6**

**Property 16: Program-Filtered Metrics**
*For any* organization with multiple programs, filtering usage metrics by a specific program should return only metrics for participants and pitches associated with that program.
**Validates: Requirements 6.5**

**Property 17: Aggregated Analytics Accuracy**
*For any* organization, the aggregated analytics (total participants, total pitches, average scores, score distribution, category distribution) should match the actual computed values from the organization's data.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

**Property 18: Program-Filtered Analytics**
*For any* organization with multiple programs, when filtering analytics by a specific program, all displayed metrics (counts, averages, distributions) should reflect only that program's data.
**Validates: Requirements 8.6**

**Property 19: Trend Data Accuracy**
*For any* organization and time period, the pitch submission trend data should show accurate counts per time bucket (day/week/month) matching the actual submission timestamps.
**Validates: Requirements 8.7**

**Property 20: Engagement Percentage Calculation**
*For any* organization, the engagement percentage (active vs inactive participants) should equal (active participants / total participants) * 100, where active means at least one pitch submission.
**Validates: Requirements 8.8**

### Shared History and Access Control Properties

**Property 21: Shared History Completeness**
*For any* participant in an organization, when an admin from that organization requests the participant's history, all analysis records for pitches tagged to the organization should be returned with complete data (transcript, scores, insights).
**Validates: Requirements 7.1, 7.2**

**Property 22: History Chronological Ordering**
*For any* participant's shared history, the analysis records should be ordered by creation timestamp in descending order (newest first).
**Validates: Requirements 7.3**

**Property 23: History Date Range Filtering**
*For any* participant's shared history and any date range, filtering should return only analysis records with timestamps within that range (inclusive).
**Validates: Requirements 7.4**

**Property 24: History Program Filtering**
*For any* participant's shared history and any program, filtering by that program should return only analysis records for pitches tagged to that program.
**Validates: Requirements 7.5**

**Property 25: Organization Data Isolation**
*For any* organization admin and any data query (pitches, analytics, history, search results, exports), the returned data should contain only records associated with that admin's organization and should never include data from other organizations.
**Validates: Requirements 4.4, 7.6, 11.4, 14.5**

### Multi-Admin Management Properties

**Property 26: Admin Invitation and Access**
*For any* organization, when an existing admin invites a new admin via email and they accept, the new admin should have full access to all organization data (participants, programs, pitches, analytics).
**Validates: Requirements 9.1, 9.2**

**Property 27: Admin Removal with Last Admin Protection**
*For any* organization with multiple admins, removing an admin should succeed and revoke their access, but attempting to remove the last remaining admin should be rejected.
**Validates: Requirements 9.3, 9.4**

**Property 28: Admin Audit Logging**
*For any* admin addition or removal operation, an audit log entry should be created with timestamp, action type, and involved user IDs.
**Validates: Requirements 9.5**

### Participant Privacy Properties

**Property 29: Personal Account Preservation**
*For any* participant, when they join an organization, their individual user account and all personal pitch history (pitches not tagged to any organization) should remain intact and accessible only to them.
**Validates: Requirements 10.1**

**Property 30: Organization Visibility**
*For any* participant, querying their organization memberships should return all organizations they are associated with.
**Validates: Requirements 10.2**

**Property 31: Pitch Visibility Control**
*For any* pitch submission, if it is tagged to a program/organization, it should be visible to admins of that organization; if it is not tagged (personal pitch), it should be visible only to the participant who created it.
**Validates: Requirements 10.3, 10.4, 10.5**

**Property 32: Organization Leave with Account Retention**
*For any* participant, when they leave an organization, their organization membership should be removed, but their personal user account and personal pitch history should remain intact.
**Validates: Requirements 10.6**

### Search Properties

**Property 33: Participant Search Accuracy**
*For any* search query and organization, searching participants by name or email should return all participants in that organization whose name or email contains the query string (case-insensitive).
**Validates: Requirements 14.1**

**Property 34: Pitch Keyword Search Accuracy**
*For any* search query and organization, searching pitches by keywords should return all pitches in that organization whose transcript or title contains the query keywords.
**Validates: Requirements 14.2**

### Firebase Integration Properties

**Property 35: Firestore Security Rule Enforcement**
*For any* Firestore query, the security rules should enforce that users can only read/write data they have permission to access based on their organization membership and role.
**Validates: Requirements 12.3**

**Property 36: Role Determination from Custom Claims**
*For any* authenticated user, their role (admin, participant, or individual) for a given organization should be correctly determined from their Firebase Auth custom claims (orgAdminIds, orgIds).
**Validates: Requirements 12.4**

### Notification Properties

**Property 37: Notification Preference Respect**
*For any* organization admin with configured notification preferences, notifications should only be sent for event types they have enabled, respecting their frequency settings.
**Validates: Requirements 13.3**

### Subscription Limit Properties

**Property 38: Usage Limit Display Accuracy**
*For any* organization, the displayed current usage (participant count, monthly pitch count) should match the actual counts, and should be shown as a percentage of the subscription limits.
**Validates: Requirements 15.2**

**Property 39: Limit Warning Threshold**
*For any* organization, when current usage reaches 90% of any subscription limit (participants or monthly pitches), a notification should be sent to all admins.
**Validates: Requirements 15.3**

**Property 40: Limit Enforcement**
*For any* organization that has reached or exceeded their subscription participant limit, attempting to create a new invitation should be rejected until the limit is increased.
**Validates: Requirements 15.4**
