# Login Page - Test Plan (Plain English)

## Overview

This document outlines all test cases for the login page feature in plain English. The login page implements a two-step authentication flow: Phone Number Entry → OTP Verification.

---

## Test Categories

### 1. UI Rendering Tests

**Test 1.1: Initial Page Load**
- When the user navigates to the login page
- Then the page should display the login form with white background
- And the form should have the title "Wall Decor Visualizer"
- And the subtitle should say "Sign in to your account"
- And there should be a phone number input field with placeholder "Enter your 10-digit phone number"
- And there should be a "Send OTP" button
- And the button should be enabled and ready to click

**Test 1.2: Form Styling and Colors**
- When the login form is rendered
- Then the title should be colored with the muted teal accent (#97B3AE)
- And the input fields should have a light border (#D6CBBF)
- And the button should have the muted teal background (#97B3AE)
- And the button should have white text
- And the form should have subtle floating background elements with minimal opacity

**Test 1.3: Responsive Design**
- When the page is viewed on a mobile device (max-width: 640px)
- Then the form should be centered and take full width with padding
- And the form should remain readable and usable
- When the page is viewed on a desktop (width > 640px)
- Then the form should be centered with max-width of 400px

**Test 1.4: Animation on Load**
- When the login page loads
- Then the form should fade in smoothly from bottom to top
- And the animation should take approximately 0.6 seconds
- And the form header should animate with a slight delay (0.1s)
- And the form fields should animate with staggered delays (0.2s, 0.3s)

---

### 2. Phone Number Entry Tests

**Test 2.1: Valid Phone Number Entry**
- When the user enters a valid 10-digit phone number (e.g., "9876543210")
- Then the input field should accept the value
- And the "Send OTP" button should remain enabled
- And no error message should be displayed

**Test 2.2: Invalid Phone Number - Too Short**
- When the user enters a phone number with fewer than 10 digits (e.g., "987654321")
- And clicks the "Send OTP" button
- Then an error message should appear saying "Phone number must be 10 digits"
- And the form should not submit
- And the input field should be highlighted with a red border

**Test 2.3: Invalid Phone Number - Too Long**
- When the user enters a phone number with more than 10 digits (e.g., "98765432101")
- And clicks the "Send OTP" button
- Then an error message should appear saying "Phone number must be 10 digits"
- And the form should not submit

**Test 2.4: Invalid Phone Number - Non-Numeric Characters**
- When the user enters a phone number with letters or special characters (e.g., "987654321a")
- And clicks the "Send OTP" button
- Then an error message should appear saying "Phone number must contain only digits"
- And the form should not submit

**Test 2.5: Empty Phone Number**
- When the user leaves the phone number field empty
- And clicks the "Send OTP" button
- Then an error message should appear saying "Phone number is required"
- And the form should not submit

**Test 2.6: Phone Number with Spaces**
- When the user enters a phone number with spaces (e.g., "9876 543 210")
- And clicks the "Send OTP" button
- Then the system should strip the spaces and treat it as "9876543210"
- And the OTP should be sent successfully

**Test 2.7: Phone Number Input Focus State**
- When the user clicks on the phone number input field
- Then the field should have a focus state with:
  - Border color changed to muted teal (#97B3AE)
  - A soft glow effect around the field
  - The background should remain white

**Test 2.8: Phone Number Input Blur State**
- When the user enters a valid phone number and clicks away
- Then the field should lose focus
- And the border should return to the default color (#D6CBBF)
- And the glow effect should disappear

---

### 3. Send OTP Tests

**Test 3.1: Successful OTP Send**
- When the user enters a valid phone number (e.g., "9876543210")
- And clicks the "Send OTP" button
- Then the button should show a loading state (spinner or disabled)
- And the system should send a request to the backend /api/auth/send-otp endpoint
- And the backend should return a success response
- And the form should transition to the OTP verification step
- And the phone number field should be replaced with an OTP input field
- And a message should appear saying "OTP sent to your phone"

**Test 3.2: OTP Send - Network Error**
- When the user enters a valid phone number
- And clicks the "Send OTP" button
- And the network request fails (no internet connection)
- Then an error message should appear saying "Network error. Please check your connection and try again"
- And the form should remain on the phone number entry step
- And the user should be able to retry

**Test 3.3: OTP Send - Server Error**
- When the user enters a valid phone number
- And clicks the "Send OTP" button
- And the backend returns a 500 error
- Then an error message should appear saying "Server error. Please try again later"
- And the form should remain on the phone number entry step
- And the user should be able to retry

**Test 3.4: OTP Send - Rate Limiting**
- When the user clicks "Send OTP" multiple times in quick succession (e.g., 5 times in 10 seconds)
- Then after the 3rd attempt, an error message should appear saying "Too many attempts. Please wait 5 minutes before trying again"
- And the "Send OTP" button should be disabled for 5 minutes
- And a countdown timer should display the remaining wait time

**Test 3.5: Button Loading State**
- When the user clicks the "Send OTP" button
- Then the button should:
  - Show a loading spinner
  - Display "Sending..." text
  - Be disabled to prevent multiple clicks
  - Maintain its size and position

**Test 3.6: Button Hover State**
- When the user hovers over the "Send OTP" button
- Then the button should:
  - Slightly lift up (translateY -3px)
  - Scale up slightly (1.02x)
  - Show a shadow effect
  - Maintain the muted teal color

**Test 3.7: Button Active State**
- When the user clicks the "Send OTP" button
- Then the button should:
  - Slightly press down (translateY -1px)
  - Scale down slightly (0.98x)
  - Maintain responsiveness

---

### 4. OTP Verification Tests

**Test 4.1: OTP Entry Field Display**
- When the OTP verification step is displayed
- Then the form should show:
  - A label "Enter OTP"
  - An input field with placeholder "Enter 4-digit OTP"
  - A "Verify OTP" button
  - A "Back" button to return to phone number entry
  - A message saying "OTP sent to your phone. Valid for 10 minutes"

**Test 4.2: Valid OTP Entry**
- When the user enters the correct OTP (2213)
- And clicks the "Verify OTP" button
- Then the system should send a request to /api/auth/verify-otp endpoint
- And the backend should return a success response with a session token
- And the session token should be stored in local storage and/or secure HTTP-only cookies
- And the user should be redirected to the dashboard/main application
- And a success message should briefly appear saying "Login successful"

**Test 4.3: Invalid OTP - Wrong Code**
- When the user enters an incorrect OTP (e.g., "1234")
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Invalid OTP. Please try again"
- And the form should remain on the OTP verification step
- And the OTP input field should be cleared
- And the user should be able to retry

**Test 4.4: Invalid OTP - Too Short**
- When the user enters an OTP with fewer than 4 digits (e.g., "123")
- And clicks the "Verify OTP" button
- Then an error message should appear saying "OTP must be 4 digits"
- And the form should not submit

**Test 4.5: Invalid OTP - Non-Numeric Characters**
- When the user enters an OTP with letters or special characters (e.g., "12a4")
- And clicks the "Verify OTP" button
- Then an error message should appear saying "OTP must contain only digits"
- And the form should not submit

**Test 4.6: Empty OTP Field**
- When the user leaves the OTP field empty
- And clicks the "Verify OTP" button
- Then an error message should appear saying "OTP is required"
- And the form should not submit

**Test 4.7: OTP Expiration**
- When the user waits for more than 10 minutes after the OTP was sent
- And then enters the correct OTP and clicks "Verify OTP"
- Then an error message should appear saying "OTP has expired. Please request a new OTP"
- And a "Send OTP" button should appear to request a new OTP
- And the form should transition back to the phone number entry step

**Test 4.8: OTP Input Focus State**
- When the user clicks on the OTP input field
- Then the field should have a focus state with:
  - Border color changed to muted teal (#97B3AE)
  - A soft glow effect around the field
  - The background should remain white

**Test 4.9: OTP Input Auto-Focus**
- When the OTP verification step is displayed
- Then the OTP input field should automatically receive focus
- And the user should be able to start typing immediately without clicking

**Test 4.10: OTP Input - Auto-Submit on 4 Digits**
- When the user enters exactly 4 digits in the OTP field
- Then the form should automatically submit
- And the "Verify OTP" button should not need to be clicked
- And the OTP should be verified immediately

---

### 5. Back Button Tests

**Test 5.1: Back Button Display**
- When the OTP verification step is displayed
- Then a "Back" button should be visible below the "Verify OTP" button
- And the button should have a light gray background (#f3f4f6)
- And the button should have dark text (#2d3748)

**Test 5.2: Back Button Functionality**
- When the user clicks the "Back" button during OTP verification
- Then the form should transition back to the phone number entry step
- And the phone number field should be cleared
- And the OTP field should be removed
- And the "Send OTP" button should be displayed again
- And the user should be able to enter a different phone number

**Test 5.3: Back Button Hover State**
- When the user hovers over the "Back" button
- Then the button should:
  - Change background color to a slightly darker gray (#e7e5e4)
  - Slightly lift up (translateY -2px)
  - Maintain the dark text color

**Test 5.4: Back Button Active State**
- When the user clicks the "Back" button
- Then the button should:
  - Slightly press down (translateY -1px)
  - Maintain responsiveness

---

### 6. Error Handling Tests

**Test 6.1: Error Message Display**
- When an error occurs (e.g., invalid phone number)
- Then an error alert should appear at the top of the form
- And the alert should have:
  - A light red background (#fce7e6)
  - A red border (#f8b4b0)
  - Red text (#c5192d)
  - A clear error message
  - Rounded corners (12px)

**Test 6.2: Error Message Dismissal**
- When an error message is displayed
- And the user corrects the input and tries again
- Then the error message should disappear
- And a new attempt should be made

**Test 6.3: Multiple Error Messages**
- When multiple errors occur in sequence (e.g., invalid phone number, then network error)
- Then each error message should replace the previous one
- And only one error message should be displayed at a time

**Test 6.4: Error Message Animation**
- When an error message appears
- Then it should fade in smoothly from top to bottom
- And the animation should take approximately 0.4 seconds

---

### 7. Session and Persistence Tests

**Test 7.1: Session Token Storage**
- When the user successfully logs in with a valid OTP
- Then the session token should be stored in:
  - Local storage (for client-side access)
  - Secure HTTP-only cookies (for server-side validation)
- And the token should have an expiration time

**Test 7.2: Session Persistence on Page Reload**
- When the user logs in successfully
- And then refreshes the page
- Then the user should remain logged in
- And the dashboard should be displayed
- And no login page should be shown

**Test 7.3: Session Persistence on Browser Close**
- When the user logs in successfully
- And then closes the browser
- And then reopens the browser and navigates to the application
- Then the user should remain logged in (if session token is still valid)
- And the dashboard should be displayed

**Test 7.4: Session Expiration**
- When the user's session token expires (e.g., after 30 days)
- And the user tries to access a protected page
- Then the user should be redirected to the login page
- And a message should appear saying "Your session has expired. Please log in again"

**Test 7.5: Token Refresh**
- When the user's session token is about to expire (e.g., within 5 minutes)
- Then the system should automatically refresh the token in the background
- And the user should not be interrupted
- And the new token should be stored

---

### 8. Security Tests

**Test 8.1: Password Not Stored in Local Storage**
- When the user logs in
- Then the phone number should NOT be stored in local storage
- And the OTP should NOT be stored in local storage
- And only the session token should be stored

**Test 8.2: HTTPS Only**
- When the login page is accessed
- Then the connection should be HTTPS (not HTTP)
- And all API requests should use HTTPS

**Test 8.3: CSRF Protection**
- When the user submits the login form
- Then the request should include a CSRF token
- And the backend should validate the CSRF token

**Test 8.4: Rate Limiting**
- When a user attempts to send OTP multiple times in quick succession
- Then the system should rate limit the requests
- And after 3 attempts in 10 minutes, the user should be blocked for 5 minutes

**Test 8.5: OTP Brute Force Protection**
- When a user attempts to verify OTP with incorrect codes multiple times
- Then after 5 failed attempts, the OTP should be invalidated
- And the user should be required to request a new OTP

---

### 9. Accessibility Tests

**Test 9.1: Keyboard Navigation**
- When the user navigates using the Tab key
- Then the focus should move through all interactive elements in order:
  - Phone number input
  - Send OTP button
  - (After OTP step) OTP input
  - (After OTP step) Verify OTP button
  - (After OTP step) Back button

**Test 9.2: Enter Key Submission**
- When the user enters a phone number and presses Enter
- Then the form should submit (same as clicking "Send OTP")
- When the user enters an OTP and presses Enter
- Then the form should submit (same as clicking "Verify OTP")

**Test 9.3: Screen Reader Labels**
- When a screen reader reads the login form
- Then it should announce:
  - "Wall Decor Visualizer, Sign in to your account"
  - "Phone Number, Enter your 10-digit phone number"
  - "Send OTP button"
  - (After OTP step) "Enter OTP, Enter 4-digit OTP"
  - (After OTP step) "Verify OTP button"
  - (After OTP step) "Back button"

**Test 9.4: Color Contrast**
- When the login form is displayed
- Then all text should have sufficient color contrast:
  - Title (#97B3AE on white) - WCAG AA compliant
  - Labels (#2d3748 on white) - WCAG AAA compliant
  - Button text (white on #97B3AE) - WCAG AA compliant
  - Error text (#c5192d on #fce7e6) - WCAG AA compliant

**Test 9.5: Focus Indicators**
- When the user navigates using Tab key
- Then each focused element should have a visible focus indicator:
  - Input fields: border color change + glow effect
  - Buttons: outline or shadow change

---

### 10. Performance Tests

**Test 10.1: Page Load Time**
- When the login page is loaded
- Then the page should be fully interactive within 2 seconds
- And all CSS animations should be smooth (60 FPS)

**Test 10.2: Form Submission Response Time**
- When the user submits the phone number form
- Then the backend should respond within 2 seconds
- And the UI should show a loading state during this time

**Test 10.3: OTP Verification Response Time**
- When the user submits the OTP verification form
- Then the backend should respond within 2 seconds
- And the UI should show a loading state during this time

**Test 10.4: Animation Performance**
- When the form animates on load
- Then the animation should be smooth without jank
- And the frame rate should remain at 60 FPS

---

### 11. Integration Tests

**Test 11.1: Full Login Flow - Happy Path**
- When the user navigates to the login page
- And enters a valid phone number (9876543210)
- And clicks "Send OTP"
- And receives the OTP (2213)
- And enters the OTP
- And clicks "Verify OTP"
- Then the user should be logged in
- And redirected to the dashboard
- And the session should be persisted

**Test 11.2: Full Login Flow - Invalid Phone Number**
- When the user navigates to the login page
- And enters an invalid phone number (123)
- And clicks "Send OTP"
- Then an error message should appear
- And the form should remain on the phone number entry step
- And the user should be able to correct and retry

**Test 11.3: Full Login Flow - Invalid OTP**
- When the user navigates to the login page
- And enters a valid phone number
- And clicks "Send OTP"
- And enters an invalid OTP (1234)
- And clicks "Verify OTP"
- Then an error message should appear
- And the form should remain on the OTP verification step
- And the user should be able to retry

**Test 11.4: Full Login Flow - Back Button**
- When the user navigates to the login page
- And enters a valid phone number
- And clicks "Send OTP"
- And then clicks "Back"
- Then the form should return to the phone number entry step
- And the phone number field should be cleared
- And the user should be able to enter a different phone number

---

### 12. Edge Cases and Boundary Tests

**Test 12.1: Phone Number with Leading Zeros**
- When the user enters a phone number starting with 0 (e.g., "0123456789")
- Then the system should accept it as a valid 10-digit number

**Test 12.2: Phone Number Exactly 10 Digits**
- When the user enters exactly 10 digits
- Then the system should accept it as valid

**Test 12.3: OTP Exactly 4 Digits**
- When the user enters exactly 4 digits for OTP
- Then the system should accept it as valid
- And should auto-submit if configured

**Test 12.4: Rapid Form Submission**
- When the user clicks "Send OTP" multiple times rapidly
- Then the system should only process the first request
- And subsequent requests should be ignored or queued

**Test 12.5: Form Submission with Autofill**
- When the browser's autofill feature fills the phone number
- And the user clicks "Send OTP"
- Then the form should work correctly with autofilled data

---

## Test Execution Summary

**Total Test Cases**: 80+

**Test Distribution**:
- UI Rendering: 4 tests
- Phone Number Entry: 8 tests
- Send OTP: 7 tests
- OTP Verification: 10 tests
- Back Button: 4 tests
- Error Handling: 4 tests
- Session and Persistence: 5 tests
- Security: 5 tests
- Accessibility: 5 tests
- Performance: 4 tests
- Integration: 4 tests
- Edge Cases: 5 tests

**Estimated Test Execution Time**: 15-20 minutes (all tests)

**Coverage Target**: 95%+ for login page functionality

---

## Test Execution Order

1. **Phase 1 - UI Tests** (Tests 1.1-1.4)
   - Verify form renders correctly
   - Verify styling and colors
   - Verify responsive design
   - Verify animations

2. **Phase 2 - Phone Number Entry** (Tests 2.1-2.8)
   - Verify input validation
   - Verify error messages
   - Verify focus states

3. **Phase 3 - Send OTP** (Tests 3.1-3.7)
   - Verify successful OTP send
   - Verify error handling
   - Verify button states

4. **Phase 4 - OTP Verification** (Tests 4.1-4.10)
   - Verify OTP entry
   - Verify OTP validation
   - Verify expiration

5. **Phase 5 - Back Button** (Tests 5.1-5.4)
   - Verify back button functionality

6. **Phase 6 - Error Handling** (Tests 6.1-6.4)
   - Verify error display and dismissal

7. **Phase 7 - Session Management** (Tests 7.1-7.5)
   - Verify token storage
   - Verify persistence

8. **Phase 8 - Security** (Tests 8.1-8.5)
   - Verify security measures

9. **Phase 9 - Accessibility** (Tests 9.1-9.5)
   - Verify keyboard navigation
   - Verify screen reader support

10. **Phase 10 - Performance** (Tests 10.1-10.4)
    - Verify load times
    - Verify animation performance

11. **Phase 11 - Integration** (Tests 11.1-11.4)
    - Verify full login flows

12. **Phase 12 - Edge Cases** (Tests 12.1-12.5)
    - Verify boundary conditions



---

## Additional Test Cases - OTP Lockout (3 Failed Attempts = 1 Minute Lockout)

**Test 4.10: OTP Lockout - 1st Failed Attempt**
- When the user enters an incorrect OTP (e.g., "1234")
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Invalid OTP. 2 attempts remaining"
- And the OTP input field should be cleared
- And the user should be able to retry

**Test 4.11: OTP Lockout - 2nd Failed Attempt**
- When the user has already failed once
- And enters another incorrect OTP
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Invalid OTP. 1 attempt remaining"
- And the OTP input field should be cleared
- And the user should be able to retry

**Test 4.12: OTP Lockout - 3rd Failed Attempt (Lock for 1 Minute)**
- When the user has already failed twice
- And enters a third incorrect OTP
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Too many failed attempts. Please try again in 60 seconds"
- And the OTP input field should be disabled
- And the "Verify OTP" button should be disabled
- And a countdown timer should display showing remaining wait time (e.g., "59 seconds")
- And the "Back" button should be available to request a new OTP

**Test 4.13: OTP Lockout - Countdown Timer**
- When the OTP is locked after 3 failed attempts
- Then a countdown timer should display the remaining wait time
- And the timer should decrement every second
- And the timer should show "Please try again in 59 seconds", "Please try again in 58 seconds", etc.
- And when the timer reaches 0, the OTP input field should be automatically unlocked
- And the user should be able to retry

**Test 4.14: OTP Lockout - Automatic Unlock After 1 Minute**
- When the OTP is locked after 3 failed attempts
- And the user waits for 60 seconds
- Then the OTP input field should be automatically unlocked
- And the "Verify OTP" button should be automatically enabled
- And the countdown timer should disappear
- And the user should be able to retry with a new OTP attempt

**Test 4.15: OTP Lockout - 4th Failed Attempt (After Unlock)**
- When the OTP is locked and then unlocked after 1 minute
- And the user enters another incorrect OTP
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Invalid OTP. Please try again"
- And the failed attempts counter should continue (now 4 total)
- And the user should be able to retry

**Test 4.16: OTP Lockout - 5th Failed Attempt (Permanent Invalidation)**
- When the user has failed 4 times
- And enters a fifth incorrect OTP
- And clicks the "Verify OTP" button
- Then an error message should appear saying "Too many failed attempts. Please request a new OTP"
- And the OTP should be permanently invalidated
- And the user should NOT be able to retry with the same OTP
- And the user should be forced to go back and request a new OTP

**Test 4.17: OTP Lockout - Back Button During Lockout**
- When the OTP is locked after 3 failed attempts
- And the user clicks the "Back" button
- Then the form should transition back to the phone number entry step
- And the user should be able to request a new OTP
- And the lockout should be cleared

**Test 4.18: OTP Lockout - Lockout Persists Across Page Refresh**
- When the OTP is locked after 3 failed attempts
- And the user refreshes the page
- Then the lockout should persist (stored on backend)
- And the OTP input field should still be disabled
- And the countdown timer should continue from where it left off

