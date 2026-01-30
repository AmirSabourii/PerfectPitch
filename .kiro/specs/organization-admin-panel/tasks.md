# Implementation Plan: Organization Admin Panel

## Overview

This implementation plan breaks down the Organization Admin Panel feature into discrete, incremental coding tasks. The approach follows a bottom-up strategy: starting with data models and Firebase configuration, then building services, API endpoints, and finally UI components. Each task builds on previous work, ensuring no orphaned code.

The implementation prioritizes core functionality first (organization management, invitations, basic analytics) before adding advanced features (notifications, exports, search). Testing tasks are marked as optional to enable faster MVP delivery while maintaining the option for comprehensive test coverage.

## Tasks

- [ ] 1. Set up Firebase infrastructure and data models
  - Create Firestore collection schemas for organizations, programs, invitations, and memberships
  - Define TypeScript interfaces for all data models (Organization, Program, Invitation, OrganizationMembership, enhanced PitchSubmission)
  - Configure Firestore indexes for efficient queries (organizationId, userId, composite indexes)
  - Set up Firebase security rules for organization-level access control
  - Create utility functions for custom claims management (setting orgAdminIds, orgIds)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 12.2, 12.3, 12.4_

- [ ]* 1.1 Write property test for organization data model
  - **Property 1: Organization Creation Completeness**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ]* 1.2 Write property test for Firestore security rules
  - **Property 35: Firestore Security Rule Enforcement**
  - **Validates: Requirements 12.3**

- [ ] 2. Implement OrganizationService
  - [ ] 2.1 Create OrganizationService class with CRUD operations
    - Implement createOrganization, getOrganization, updateOrganization methods
    - Add admin management methods (addAdmin, removeAdmin, listAdmins)
    - Add membership query methods (getUserOrganizations, isUserAdmin, isUserParticipant)
    - Include validation logic for organization data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3_
  
  - [ ]* 2.2 Write property test for admin removal protection
    - **Property 27: Admin Removal with Last Admin Protection**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ] 2.3 Implement organization status enforcement
    - Add method to check organization status before allowing operations
    - Integrate status checks into pitch submission flow
    - _Requirements: 1.5_
  
  - [ ]* 2.4 Write property test for organization status enforcement
    - **Property 2: Organization Status Enforcement**
    - **Validates: Requirements 1.5**

- [ ] 3. Implement InvitationService
  - [ ] 3.1 Create InvitationService class with invitation lifecycle methods
    - Implement createInvitation with duplicate checking
    - Implement acceptInvitation with membership creation
    - Implement revokeInvitation and resendInvitation
    - Add invitation validation and token generation
    - Add methods for listing and querying invitations
    - _Requirements: 2.1, 2.4, 2.5, 2.7_
  
  - [ ]* 3.2 Write property test for invitation uniqueness
    - **Property 3: Invitation Creation and Uniqueness**
    - **Validates: Requirements 2.1, 2.5**
  
  - [ ]* 3.3 Write property test for invitation acceptance
    - **Property 4: Invitation Acceptance Association**
    - **Validates: Requirements 2.4**
  
  - [ ] 3.4 Implement invitation expiration logic
    - Create Cloud Function or scheduled task to mark expired invitations
    - Add expiration checking in invitation validation
    - _Requirements: 2.6_
  
  - [ ]* 3.5 Write property test for invitation expiration
    - **Property 5: Invitation Expiration**
    - **Validates: Requirements 2.6**
  
  - [ ] 3.6 Implement email sending for invitations
    - Create email template for invitations
    - Integrate with email service (SendGrid, Firebase Extensions, or similar)
    - Add invitation link generation with secure tokens
    - _Requirements: 2.2_

- [ ] 4. Implement ProgramService
  - [ ] 4.1 Create ProgramService class with program management
    - Implement createProgram, getProgram, updateProgram, deleteProgram
    - Implement listPrograms with filtering options
    - Add participant management (addParticipantToProgram, removeParticipantFromProgram)
    - Add method to list program participants
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for program creation and association
    - **Property 7: Program Creation and Association**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 4.3 Write property test for participant management
    - **Property 8: Program Participant Management**
    - **Validates: Requirements 3.3, 3.4**
  
  - [ ] 4.4 Enhance pitch submission to support program tagging
    - Modify existing pitch submission API to accept optional organizationId and programId
    - Update PitchSubmission model to include visibility field
    - Add validation to ensure program belongs to organization
    - _Requirements: 3.5, 10.3, 10.4, 10.5_
  
  - [ ]* 4.5 Write property test for pitch program tagging
    - **Property 9: Pitch Program Tagging**
    - **Validates: Requirements 3.5**
  
  - [ ]* 4.6 Write property test for pitch visibility control
    - **Property 31: Pitch Visibility Control**
    - **Validates: Requirements 10.3, 10.4, 10.5**

- [ ] 5. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement AccessControlService
  - [ ] 6.1 Create AccessControlService with permission checking
    - Implement canAccessOrganization, canAccessProgram, canAccessPitch
    - Implement canManageParticipants
    - Implement getUserRole to determine admin/participant/individual status
    - Add filterPitchesByAccess for data filtering
    - Integrate with Firebase Auth custom claims
    - _Requirements: 7.6, 10.4, 10.5, 12.4_
  
  - [ ]* 6.2 Write property test for organization data isolation
    - **Property 25: Organization Data Isolation**
    - **Validates: Requirements 4.4, 7.6, 11.4, 14.5**
  
  - [ ]* 6.3 Write property test for role determination
    - **Property 36: Role Determination from Custom Claims**
    - **Validates: Requirements 12.4**

- [ ] 7. Implement AnalyticsService
  - [ ] 7.1 Create AnalyticsService with aggregation methods
    - Implement getOrganizationAnalytics with caching
    - Implement getProgramAnalytics
    - Implement getParticipantUsageMetrics
    - Implement listParticipantsWithMetrics
    - Add efficient Firestore queries with proper indexing
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.8_
  
  - [ ]* 7.2 Write property test for usage metrics accuracy
    - **Property 14: Usage Metrics Accuracy**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [ ]* 7.3 Write property test for aggregated analytics accuracy
    - **Property 17: Aggregated Analytics Accuracy**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
  
  - [ ] 7.2 Implement pitch filtering methods
    - Implement listOrganizationPitches with comprehensive filters (score threshold, categories, date range, program)
    - Implement getPitchHistory for participant history
    - Add support for multi-dimension score filtering
    - _Requirements: 4.1, 4.2, 4.3, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 7.5 Write property test for score threshold filtering
    - **Property 10: Score Threshold Filtering**
    - **Validates: Requirements 4.1, 4.4**
  
  - [ ]* 7.6 Write property test for category filtering
    - **Property 12: Category Assignment and Filtering**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 7.7 Write property test for program-filtered analytics
    - **Property 18: Program-Filtered Analytics**
    - **Validates: Requirements 8.6**
  
  - [ ] 7.8 Implement real-time metrics updates
    - Add Firestore triggers or client-side logic to update usage metrics on pitch creation
    - Implement cache invalidation for analytics
    - _Requirements: 6.6_
  
  - [ ]* 7.9 Write property test for real-time metrics update
    - **Property 15: Real-time Metrics Update**
    - **Validates: Requirements 6.6**

- [ ] 8. Implement API routes for organization management
  - [ ] 8.1 Create organization API endpoints
    - POST /api/organizations - Create organization
    - GET /api/organizations/:orgId - Get organization details
    - PATCH /api/organizations/:orgId - Update organization
    - POST /api/organizations/:orgId/admins - Add admin
    - DELETE /api/organizations/:orgId/admins/:userId - Remove admin
    - Add authentication and authorization middleware
    - Add input validation and error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 8.2 Write unit tests for organization API endpoints
    - Test authentication requirements
    - Test authorization (admin-only operations)
    - Test error cases (not found, forbidden, validation errors)

- [ ] 9. Implement API routes for program management
  - [ ] 9.1 Create program API endpoints
    - POST /api/organizations/:orgId/programs - Create program
    - GET /api/organizations/:orgId/programs - List programs
    - GET /api/programs/:programId - Get program details
    - PATCH /api/programs/:programId - Update program
    - DELETE /api/programs/:programId - Delete program
    - POST /api/programs/:programId/participants - Add participant
    - DELETE /api/programs/:programId/participants/:userId - Remove participant
    - Add authentication, authorization, and validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [ ]* 9.2 Write unit tests for program API endpoints
    - Test CRUD operations
    - Test participant management
    - Test access control

- [ ] 10. Implement API routes for invitation management
  - [ ] 10.1 Create invitation API endpoints
    - POST /api/organizations/:orgId/invitations - Create invitation
    - GET /api/organizations/:orgId/invitations - List invitations
    - POST /api/invitations/:invitationId/resend - Resend invitation
    - DELETE /api/invitations/:invitationId - Revoke invitation
    - POST /api/invitations/accept - Accept invitation (public endpoint)
    - GET /api/invitations/validate/:token - Validate invitation token
    - Add authentication and validation
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 10.2 Write unit tests for invitation API endpoints
    - Test invitation creation and duplicate prevention
    - Test acceptance flow
    - Test token validation

- [ ] 11. Implement API routes for analytics and reporting
  - [ ] 11.1 Create analytics API endpoints
    - GET /api/organizations/:orgId/analytics - Get organization analytics
    - GET /api/programs/:programId/analytics - Get program analytics
    - GET /api/organizations/:orgId/participants/metrics - List participants with metrics
    - GET /api/organizations/:orgId/pitches - List pitches with filters
    - GET /api/participants/:userId/history - Get participant pitch history
    - Add query parameter support for filters (score, category, date range, program)
    - Add authentication and authorization
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ]* 11.2 Write unit tests for analytics API endpoints
    - Test filtering logic
    - Test access control
    - Test query parameter parsing

- [ ] 12. Checkpoint - API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement admin dashboard UI components
  - [ ] 13.1 Create OrganizationDashboard component
    - Display organization overview (name, status, subscription plan)
    - Show key metrics (total participants, total pitches, average scores)
    - Display subscription usage with progress bars
    - Add navigation to programs, participants, and analytics sections
    - _Requirements: 8.1, 8.2, 8.3, 15.1, 15.2_
  
  - [ ] 13.2 Create ParticipantList component
    - Display table of participants with usage metrics
    - Add sorting by name, email, pitch count, last activity
    - Add filtering by program
    - Add search functionality
    - Add actions (view history, remove from program)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 14.1_
  
  - [ ] 13.3 Create InvitationManager component
    - Display form to invite new participants
    - Show list of pending, accepted, and expired invitations
    - Add actions (resend, revoke)
    - Display invitation status and dates
    - _Requirements: 2.1, 2.5, 2.6, 2.7_
  
  - [ ] 13.4 Create ProgramManager component
    - Display list of programs with status
    - Add form to create new programs
    - Add actions (edit, delete, view participants)
    - Show program details (dates, participant count)
    - _Requirements: 3.1, 3.2, 3.6_

- [ ] 14. Implement analytics and filtering UI components
  - [ ] 14.1 Create AnalyticsDashboard component
    - Display aggregated analytics (charts for score distribution, category distribution, trends)
    - Add program filter dropdown
    - Show engagement metrics (active vs inactive participants)
    - Use charting library (recharts or similar) for visualizations
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 14.2 Create PitchFilterPanel component
    - Add score threshold slider/input
    - Add score dimension selector (overall, market, team, innovation)
    - Add category multi-select
    - Add date range picker
    - Add program filter
    - Apply filters to pitch list
    - _Requirements: 4.1, 4.2, 4.3, 5.2, 5.3_
  
  - [ ] 14.3 Create PitchList component
    - Display filtered pitch submissions
    - Show pitch details (title, participant, score, categories, date)
    - Add sorting options
    - Add pagination for large datasets
    - Add action to view full analysis
    - _Requirements: 4.1, 4.2, 4.4, 5.2, 5.3, 7.1_
  
  - [ ] 14.4 Create ParticipantHistory component
    - Display detailed pitch history for selected participant
    - Show full analysis records (transcript, scores, insights)
    - Add date range and program filters
    - Display in reverse chronological order
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Implement participant-facing UI components
  - [ ] 15.1 Create OrganizationMembershipView component
    - Display list of organizations the user belongs to
    - Show role (admin or participant) for each organization
    - Add option to leave organization
    - _Requirements: 10.2, 10.6_
  
  - [ ] 15.2 Enhance pitch submission form with organization tagging
    - Add optional dropdown to select organization/program
    - Add visibility toggle (personal vs organization)
    - Show which organizations user can tag pitches to
    - _Requirements: 3.5, 10.3, 10.4, 10.5_
  
  - [ ]* 15.3 Write property test for personal account preservation
    - **Property 29: Personal Account Preservation**
    - **Validates: Requirements 10.1**

- [ ] 16. Implement search functionality
  - [ ] 16.1 Create SearchService with search methods
    - Implement participant search by name/email
    - Implement pitch search by keywords
    - Add organization-level access control to search
    - Optimize queries for performance
    - _Requirements: 14.1, 14.2, 14.5_
  
  - [ ] 16.2 Create SearchBar component
    - Add search input with debouncing
    - Display search results with highlighting
    - Add search type selector (participants vs pitches)
    - Show "no results" state
    - _Requirements: 14.1, 14.2, 14.4_
  
  - [ ]* 16.3 Write property test for search accuracy
    - **Property 33: Participant Search Accuracy**
    - **Property 34: Pitch Keyword Search Accuracy**
    - **Validates: Requirements 14.1, 14.2**

- [ ] 17. Implement data export functionality
  - [ ] 17.1 Create ExportService with export methods
    - Implement exportParticipantData (CSV format)
    - Implement exportAnalyticsReport (PDF format)
    - Add organization-level access control
    - Optimize for datasets up to 1000 records
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 17.2 Create export API endpoints
    - POST /api/organizations/:orgId/export/participants - Export participant data
    - POST /api/organizations/:orgId/export/analytics - Export analytics report
    - Add authentication and authorization
    - Return file download response
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 17.3 Add export buttons to UI
    - Add "Export CSV" button to participant list
    - Add "Export Report" button to analytics dashboard
    - Show loading state during export generation
    - Trigger file download on completion
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 18. Implement notification system
  - [ ] 18.1 Create NotificationService
    - Implement sendInvitationAcceptedNotification
    - Implement sendFirstPitchNotification
    - Implement sendWeeklyDigest
    - Implement sendProgramEndingReminder
    - Integrate with email service
    - _Requirements: 13.1, 13.2, 13.4, 13.5_
  
  - [ ] 18.2 Create notification preference management
    - Add NotificationPreferences model
    - Create API endpoints for preference CRUD
    - Create UI component for preference settings
    - _Requirements: 13.3_
  
  - [ ]* 18.3 Write property test for notification preferences
    - **Property 37: Notification Preference Respect**
    - **Validates: Requirements 13.3**
  
  - [ ] 18.4 Set up notification triggers
    - Add Firestore triggers or Cloud Functions for invitation acceptance
    - Add trigger for first pitch submission
    - Set up scheduled function for weekly digests
    - Set up scheduled function for program ending reminders
    - _Requirements: 13.1, 13.2, 13.4, 13.5_

- [ ] 19. Implement subscription limit enforcement
  - [ ] 19.1 Create SubscriptionService
    - Implement checkParticipantLimit
    - Implement checkMonthlyPitchLimit
    - Implement getCurrentUsage
    - Add limit warning notifications at 90% threshold
    - _Requirements: 15.2, 15.3, 15.4_
  
  - [ ]* 19.2 Write property test for limit enforcement
    - **Property 40: Limit Enforcement**
    - **Validates: Requirements 15.4**
  
  - [ ] 19.3 Integrate limit checks into invitation and pitch flows
    - Add limit check before creating invitations
    - Add limit check before accepting pitch submissions
    - Return clear error messages when limits exceeded
    - _Requirements: 15.4_
  
  - [ ] 19.4 Create subscription management UI
    - Display current plan details
    - Show usage vs limits with progress bars
    - Add upgrade/downgrade buttons
    - Show limit warning when approaching 90%
    - _Requirements: 15.1, 15.2, 15.3, 15.5_

- [ ] 20. Implement audit logging
  - [ ] 20.1 Create AuditLogService
    - Implement logAdminAddition
    - Implement logAdminRemoval
    - Implement logOrganizationChange
    - Store logs in Firestore with timestamps and user IDs
    - _Requirements: 9.5_
  
  - [ ] 20.2 Integrate audit logging into admin operations
    - Add logging to addAdmin and removeAdmin methods
    - Add logging to organization update operations
    - _Requirements: 9.5_
  
  - [ ]* 20.3 Write property test for audit logging
    - **Property 28: Admin Audit Logging**
    - **Validates: Requirements 9.5**

- [ ] 21. Implement domain category assignment
  - [ ] 21.1 Enhance pitch analysis to assign categories
    - Modify existing AI analysis to extract domain categories
    - Add category assignment to analysis results
    - Store categories in PitchSubmission records
    - _Requirements: 5.1_
  
  - [ ]* 21.2 Write property test for category assignment
    - **Property 12: Category Assignment and Filtering** (category assignment part)
    - **Validates: Requirements 5.1**

- [ ] 22. Final integration and polish
  - [ ] 22.1 Add loading states and error handling to all UI components
    - Add skeleton loaders for data fetching
    - Add error boundaries for component errors
    - Display user-friendly error messages
    - Add retry mechanisms for failed requests
  
  - [ ] 22.2 Add responsive design for mobile devices
    - Ensure all components work on mobile screens
    - Add mobile-friendly navigation
    - Test on various screen sizes
  
  - [ ] 22.3 Add accessibility features
    - Add ARIA labels to interactive elements
    - Ensure keyboard navigation works
    - Add screen reader support
    - Test with accessibility tools
  
  - [ ] 22.4 Optimize performance
    - Add pagination to large lists
    - Implement virtual scrolling for long lists
    - Add caching for analytics queries
    - Optimize Firestore queries with proper indexes
  
  - [ ] 22.5 Add comprehensive error logging
    - Integrate error tracking service (Sentry or similar)
    - Log all API errors with context
    - Log client-side errors
    - Set up error alerting for critical issues

- [ ] 23. Final checkpoint - Complete feature
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: data models → services → API → UI
- Firebase Emulator Suite should be used for local development and testing
- All API endpoints require authentication and organization-level authorization
- Analytics queries should be optimized with proper Firestore indexes
- Notification system can be implemented with Firebase Cloud Functions or API routes with scheduled jobs
