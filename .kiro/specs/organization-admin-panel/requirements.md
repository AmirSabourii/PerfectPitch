# Requirements Document: Organization Admin Panel

## Introduction

This document specifies the requirements for a B2B Organization Admin Panel feature that enables organizations (science parks, innovation centers, accelerators, bootcamps) to manage participants, track pitch analyses, and organize users into different programs. The system extends the existing pitch analysis platform with multi-tenant organizational capabilities while maintaining individual user functionality.

## Glossary

- **Organization**: A B2B entity (science park, accelerator, bootcamp, innovation center) that purchases access to manage multiple participants
- **Organization_Admin**: A user with administrative privileges within an Organization who can invite participants and view analytics
- **Participant**: An individual user who has been invited by an Organization_Admin to submit pitches under the Organization's account
- **Program**: A logical grouping within an Organization (e.g., a specific bootcamp cohort, accelerator batch, or innovation program)
- **Pitch_Submission**: A recorded or uploaded pitch from a Participant that has been analyzed by the system
- **Analysis_Record**: The complete analysis result generated for a Pitch_Submission, including scores and insights
- **Score_Threshold**: A numeric value used to filter Pitch_Submissions based on their analysis scores
- **Domain_Category**: A classification tag for pitches (e.g., FinTech, HealthTech, EdTech, CleanTech)
- **Invitation**: An email-based request sent by an Organization_Admin to a Participant to join the Organization
- **Usage_Metrics**: Quantitative data showing the number of Pitch_Submissions and Analysis_Records per Participant
- **Shared_History**: The collection of all Analysis_Records for a specific Participant accessible to Organization_Admins
- **Firebase_Auth**: The authentication system managing user identities and permissions
- **Firebase_Firestore**: The database storing Organizations, Participants, Programs, and Analysis_Records

## Requirements

### Requirement 1: Organization Management

**User Story:** As a platform administrator, I want to create and manage organization accounts, so that B2B customers can access the admin panel features.

#### Acceptance Criteria

1. THE System SHALL create Organization records with unique identifiers, name, and contact information
2. WHEN an Organization is created, THE System SHALL assign at least one Organization_Admin user
3. THE System SHALL associate each Organization with a subscription plan that defines usage limits
4. THE System SHALL maintain Organization status (active, suspended, expired)
5. WHEN an Organization status changes to suspended or expired, THE System SHALL prevent new Pitch_Submissions from associated Participants

### Requirement 2: Participant Invitation System

**User Story:** As an Organization_Admin, I want to invite participants via email, so that they can submit pitches under our organization's account.

#### Acceptance Criteria

1. WHEN an Organization_Admin provides a valid email address, THE System SHALL create an Invitation record
2. THE System SHALL send an email notification to the invited email address containing an invitation link
3. WHEN a recipient clicks the invitation link, THE System SHALL authenticate or register the user via Firebase_Auth
4. WHEN authentication completes, THE System SHALL associate the Participant with the Organization
5. THE System SHALL prevent duplicate Invitations to the same email address within an Organization
6. WHEN an Invitation is pending for more than 30 days, THE System SHALL mark it as expired
7. THE System SHALL allow Organization_Admins to resend expired or pending Invitations

### Requirement 3: Program Organization

**User Story:** As an Organization_Admin, I want to create and manage multiple programs within my organization, so that I can organize participants into different cohorts or bootcamp batches.

#### Acceptance Criteria

1. THE System SHALL allow Organization_Admins to create Program records with name, description, and start/end dates
2. WHEN a Program is created, THE System SHALL associate it with the Organization
3. THE System SHALL allow Organization_Admins to assign Participants to one or more Programs
4. THE System SHALL allow Organization_Admins to remove Participants from Programs
5. WHEN a Participant submits a pitch, THE System SHALL allow tagging the Pitch_Submission with a Program identifier
6. THE System SHALL maintain Program status (active, completed, archived)

### Requirement 4: Pitch Filtering by Score

**User Story:** As an Organization_Admin, I want to filter pitches by score thresholds, so that I can identify high-potential or low-performing submissions.

#### Acceptance Criteria

1. WHEN an Organization_Admin specifies a Score_Threshold value, THE System SHALL return only Pitch_Submissions with scores greater than or equal to the threshold
2. THE System SHALL support filtering by multiple score dimensions (overall score, market potential, team strength, innovation score)
3. WHEN no Score_Threshold is specified, THE System SHALL return all Pitch_Submissions
4. THE System SHALL apply filters only to Pitch_Submissions associated with the Organization_Admin's Organization

### Requirement 5: Pitch Filtering by Domain Category

**User Story:** As an Organization_Admin, I want to filter pitches by domain categories, so that I can analyze submissions within specific industry sectors.

#### Acceptance Criteria

1. WHEN a Pitch_Submission is analyzed, THE System SHALL assign at least one Domain_Category based on the pitch content
2. WHEN an Organization_Admin selects one or more Domain_Categories, THE System SHALL return only matching Pitch_Submissions
3. THE System SHALL support multi-select filtering across Domain_Categories
4. THE System SHALL display the count of Pitch_Submissions per Domain_Category

### Requirement 6: Usage Tracking per Participant

**User Story:** As an Organization_Admin, I want to view usage metrics for each invited participant, so that I can monitor engagement and activity levels.

#### Acceptance Criteria

1. THE System SHALL calculate and display the total number of Pitch_Submissions per Participant
2. THE System SHALL calculate and display the total number of Analysis_Records per Participant
3. THE System SHALL display the date of the most recent Pitch_Submission for each Participant
4. THE System SHALL display the date when each Participant accepted their Invitation
5. WHEN viewing Usage_Metrics, THE System SHALL allow filtering by Program
6. THE System SHALL update Usage_Metrics in real-time when new Pitch_Submissions are created

### Requirement 7: Shared Analysis History Access

**User Story:** As an Organization_Admin, I want to access detailed analysis history for each participant, so that I can review their progress and provide feedback.

#### Acceptance Criteria

1. THE System SHALL display all Analysis_Records for any Participant within the Organization
2. WHEN an Organization_Admin selects a Participant, THE System SHALL show the complete Shared_History including pitch transcripts, scores, and insights
3. THE System SHALL display Analysis_Records in reverse chronological order (newest first)
4. THE System SHALL allow Organization_Admins to filter Shared_History by date range
5. THE System SHALL allow Organization_Admins to filter Shared_History by Program
6. THE System SHALL preserve Participant privacy by restricting Shared_History access only to Organization_Admins of the associated Organization

### Requirement 8: Aggregated Analytics Dashboard

**User Story:** As an Organization_Admin, I want to view aggregated analytics across all participants and programs, so that I can assess overall program performance.

#### Acceptance Criteria

1. THE System SHALL display total number of active Participants across the Organization
2. THE System SHALL display total number of Pitch_Submissions across the Organization
3. THE System SHALL display average scores across all Pitch_Submissions
4. THE System SHALL display score distribution visualizations (e.g., histogram of scores)
5. THE System SHALL display Domain_Category distribution across all Pitch_Submissions
6. WHEN an Organization_Admin filters by Program, THE System SHALL update all analytics to reflect only that Program's data
7. THE System SHALL display trend data showing Pitch_Submission volume over time
8. THE System SHALL display engagement metrics showing percentage of active vs inactive Participants

### Requirement 9: Multi-Admin Support

**User Story:** As an Organization_Admin, I want to add additional administrators to my organization, so that multiple team members can manage participants and view analytics.

#### Acceptance Criteria

1. THE System SHALL allow existing Organization_Admins to invite new Organization_Admins via email
2. WHEN a new Organization_Admin is added, THE System SHALL grant them full access to all Organization data
3. THE System SHALL allow Organization_Admins to remove other Organization_Admins
4. THE System SHALL prevent removal of the last Organization_Admin from an Organization
5. THE System SHALL maintain an audit log of Organization_Admin additions and removals

### Requirement 10: Participant Access Control

**User Story:** As a Participant, I want my pitch data to be accessible to my organization's admins while maintaining my individual account, so that I can receive feedback while preserving my personal workspace.

#### Acceptance Criteria

1. WHEN a Participant is associated with an Organization, THE System SHALL maintain their individual user account and personal pitch history
2. THE System SHALL allow Participants to view which Organizations they are associated with
3. THE System SHALL allow Participants to submit pitches tagged to specific Programs or as personal submissions
4. WHEN a Participant submits a pitch tagged to a Program, THE System SHALL make it visible to Organization_Admins
5. WHEN a Participant submits a personal pitch, THE System SHALL keep it private from Organization_Admins
6. THE System SHALL allow Participants to leave an Organization while retaining their personal account

### Requirement 11: Data Export and Reporting

**User Story:** As an Organization_Admin, I want to export participant data and analytics, so that I can create reports and share insights with stakeholders.

#### Acceptance Criteria

1. THE System SHALL allow Organization_Admins to export Participant lists with Usage_Metrics as CSV files
2. THE System SHALL allow Organization_Admins to export Analysis_Records for selected Participants as PDF reports
3. THE System SHALL allow Organization_Admins to export aggregated analytics as CSV files
4. WHEN exporting data, THE System SHALL include only data associated with the Organization_Admin's Organization
5. THE System SHALL generate exports within 30 seconds for datasets containing up to 1000 records

### Requirement 12: Firebase Integration

**User Story:** As a system architect, I want to leverage Firebase services for authentication and data storage, so that the feature integrates seamlessly with the existing platform infrastructure.

#### Acceptance Criteria

1. THE System SHALL use Firebase_Auth for authenticating Organization_Admins and Participants
2. THE System SHALL store Organization, Program, Invitation, and Usage_Metrics data in Firebase_Firestore
3. THE System SHALL use Firebase_Firestore security rules to enforce Organization-level data access control
4. WHEN a user authenticates, THE System SHALL determine their role (Organization_Admin, Participant, or individual user) from Firebase_Auth custom claims
5. THE System SHALL use Firebase_Firestore queries to retrieve filtered and aggregated data efficiently

### Requirement 13: Notification System

**User Story:** As an Organization_Admin, I want to receive notifications about participant activity, so that I can stay informed about program engagement.

#### Acceptance Criteria

1. WHEN a Participant accepts an Invitation, THE System SHALL notify the inviting Organization_Admin via email
2. WHEN a Participant submits their first Pitch_Submission, THE System SHALL notify Organization_Admins via email
3. THE System SHALL allow Organization_Admins to configure notification preferences (email frequency, event types)
4. THE System SHALL send weekly digest emails summarizing new Pitch_Submissions and Usage_Metrics
5. WHEN a Program end date approaches, THE System SHALL send reminder notifications to Organization_Admins

### Requirement 14: Search and Discovery

**User Story:** As an Organization_Admin, I want to search for participants and pitches, so that I can quickly find specific submissions or users.

#### Acceptance Criteria

1. THE System SHALL allow Organization_Admins to search Participants by name or email address
2. THE System SHALL allow Organization_Admins to search Pitch_Submissions by keywords in transcripts or titles
3. WHEN a search query is entered, THE System SHALL return results within 2 seconds
4. THE System SHALL highlight matching keywords in search results
5. THE System SHALL apply Organization-level access control to all search results

### Requirement 15: Billing and Subscription Management

**User Story:** As an Organization_Admin, I want to manage my organization's subscription and billing, so that I can control costs and access levels.

#### Acceptance Criteria

1. THE System SHALL display current subscription plan details including participant limits and feature access
2. THE System SHALL display current usage against subscription limits (number of Participants, Pitch_Submissions per month)
3. WHEN usage approaches subscription limits (90% threshold), THE System SHALL notify Organization_Admins
4. WHEN usage exceeds subscription limits, THE System SHALL prevent new Participant Invitations until limits are increased
5. THE System SHALL allow Organization_Admins to upgrade or downgrade subscription plans
6. THE System SHALL integrate with existing payment processing for subscription billing
