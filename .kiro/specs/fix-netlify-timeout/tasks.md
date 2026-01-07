# Implementation Plan: Fix Netlify Timeout

## Overview

This plan fixes the 504 timeout errors caused by an invalid `timeout` parameter in the OpenAI SDK constructor. The fix involves removing the invalid parameter and implementing proper request-level timeouts using AbortController.

## Tasks

- [x] 1. Fix OpenAI SDK initialization
  - [x] 1.1 Remove invalid timeout parameter from OpenAI constructor in `lib/aiAnalyzer.ts`
    - Remove `timeout: TIMEOUTS.OPENAI_ANALYSIS` from the OpenAI client constructor
    - The OpenAI SDK doesn't accept a `timeout` parameter in the constructor
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Implement request-level timeout using AbortController
    - Create AbortController before OpenAI API call
    - Set timeout to abort after TIMEOUTS.OPENAI_ANALYSIS milliseconds
    - Pass signal to openai.chat.completions.create() options
    - Clear timeout on success or error
    - _Requirements: 1.3, 1.4_

  - [ ]* 1.3 Write unit test for OpenAI client initialization
    - Verify client is created without errors
    - Verify API calls don't return "unrecognized argument" errors
    - _Requirements: 1.1, 1.2_

- [ ] 2. Checkpoint - Verify fix resolves the immediate error
  - Deploy to Netlify and test the analyze-pitch endpoint
  - Verify no more "Unrecognized request argument supplied: timeout" errors
  - Ensure all tests pass, ask the user if questions arise

- [ ] 3. Improve timeout error handling
  - [ ] 3.1 Update error handling for AbortError in `lib/aiAnalyzer.ts`
    - Catch AbortError from AbortController
    - Transform to descriptive timeout error with operation context
    - Include elapsed time and timeout value in error details
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 3.2 Write property test for timeout error messages
    - **Property 3: Timeout Errors Are Descriptive**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 4. Verify content truncation
  - [ ] 4.1 Review and verify content truncation logic in `lib/aiAnalyzer.ts`
    - Ensure transcript is truncated to MAX_TRANSCRIPT_LENGTH before API call
    - Ensure slides content is truncated to MAX_SLIDES_LENGTH before API call
    - _Requirements: 6.3_

  - [ ]* 4.2 Write property test for content truncation
    - **Property 4: Content Truncation Before API Calls**
    - **Validates: Requirements 6.3**

- [ ] 5. Final checkpoint - Ensure all tests pass
  - Run all tests to verify the fix
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The critical fix is in Task 1.1 - removing the invalid timeout parameter
- Task 1.2 ensures proper timeout behavior is maintained
- Property tests validate the fix works correctly across all inputs
