# Wall Decor Visualizer - Specification Structure

## Complete File Organization

### Root Level Specification Files

```
.kiro/specs/wall-decor-visualizer/
├── architecture.md                    # DDD architecture with naming conventions
├── design.md                          # Technical design document
├── requirements.md                    # Feature requirements with acceptance criteria
├── setup.md                           # Project setup and configuration guide
├── setup_keys.md                      # API keys and credentials setup
├── tasks.md                           # Implementation task list
├── testing-strategy.md                # Testing strategy and approach
├── test-execution-schedule.md         # Automated test execution schedule
├── user-prompts.md                    # All user prompts and decisions logged
├── ui_design.md                       # UI design specifications
├── ui_mockup_final.html               # Interactive UI mockup preview
├── color_palette_final.md             # Final color palette specifications
├── color_palette_simplified.md        # Simplified color palette reference
├── validation-specification.md        # Comprehensive validation rules
└── SPEC_STRUCTURE.md                  # This file
```

### Validation & Testing Subfolder

```
validation-testing/
├── login-page-test-plan.ts            # 80+ test cases in TypeScript
└── login-page-validation-plan.ts      # Comprehensive validation rules in TypeScript
```

---

## File Descriptions

### Core Specification Files

#### 1. **architecture.md**
- DDD (Domain-Driven Design) architecture pattern
- Folder structure with kebab-case and snake_case conventions
- Data-service and page-service separation
- Domain and application layer organization
- No generic helper/manager files rule

#### 2. **design.md**
- Technical design document
- System components and interactions
- Data models and schemas
- API endpoint specifications
- Integration points

#### 3. **requirements.md**
- Feature requirements with user stories
- Acceptance criteria for each requirement
- Requirement 0: Phone Number + OTP Authentication
- Requirement 0.5: Session Persistence
- Requirement 1-23: Full feature set

#### 4. **setup.md**
- Project setup instructions
- Environment configuration
- Dependency installation
- Database setup
- API configuration

#### 5. **setup_keys.md**
- MongoDB connection string
- GCP Project ID and credentials
- Gemini API key
- Cloud Storage bucket configuration
- Environment variable setup

#### 6. **tasks.md**
- Implementation task list
- 12 phases with 100+ tasks
- Task dependencies and prerequisites
- Estimated effort and timeline

#### 7. **testing-strategy.md**
- Test-Driven Development (TDD) approach
- Testing pyramid: Unit (70%), Integration (25%), E2E (5%)
- Root cause analysis process
- Test maintenance and coverage targets
- CI/CD pipeline configuration

#### 8. **test-execution-schedule.md**
- Automated test runs every 6 hours
- Pre-commit hook tests
- Pre-deployment tests
- GitHub Actions workflow

#### 9. **user-prompts.md**
- All user prompts logged with timestamps
- Sequential numbering (Prompt 1-27+)
- Key decisions and changes documented
- Session history and context

#### 10. **ui_design.md**
- UI design specifications
- Component specifications
- Typography and spacing
- Animation and transition rules
- Responsive design breakpoints

#### 11. **ui_mockup_final.html**
- Interactive HTML mockup
- Login page preview
- Upload page preview
- Color palette demonstration
- Premium animation showcase

#### 12. **color_palette_final.md**
- Final 6-color palette
- Primary accent: #97B3AE (Muted Teal)
- Secondary accents and backgrounds
- Text colors and borders
- Usage guidelines

#### 13. **validation-specification.md**
- Phone number validation rules
- OTP validation rules
- Rate limiting specifications
- Brute force protection
- Network error handling
- Session token validation
- CSRF protection
- Input sanitization
- Error response format

---

## Validation & Testing Subfolder

### login-page-test-plan.ts
**80+ Test Cases organized by category:**

1. **UI Rendering Tests (4 tests)**
   - Initial page load
   - Form styling and colors
   - Responsive design
   - Animation on load

2. **Phone Number Entry Tests (8 tests)**
   - Valid phone number entry
   - Invalid phone (too short, too long, non-numeric)
   - Empty phone number
   - Phone with spaces
   - Input focus/blur states

3. **Send OTP Tests (7 tests)**
   - Successful OTP send
   - Network error handling
   - Server error handling
   - Rate limiting
   - Button loading/hover/active states

4. **OTP Verification Tests (18 tests)**
   - Valid OTP entry
   - Invalid OTP (wrong code, too short, non-numeric)
   - Empty OTP field
   - OTP expiration
   - Input focus/auto-focus/auto-submit
   - **OTP Lockout Scenarios (8 tests):**
     - 1st failed attempt (2 attempts remaining)
     - 2nd failed attempt (1 attempt remaining)
     - 3rd failed attempt (lock for 1 minute)
     - Countdown timer functionality
     - Automatic unlock after 1 minute
     - 4th attempt after unlock
     - 5th attempt (permanent invalidation)
     - Back button during lockout

5. **Back Button Tests (4 tests)**
   - Back button display
   - Back button functionality
   - Back button hover/active states

6. **Integration Tests (4 tests)**
   - Full login flow (happy path)
   - Invalid phone number flow
   - Invalid OTP flow
   - Back button in full flow

**Test Summary:**
- Total: 80+ test cases
- Estimated execution time: 15-20 minutes
- Coverage target: 95%+

### login-page-validation-plan.ts
**Comprehensive Validation Rules:**

1. **Phone Number Validation**
   - Frontend: Length, format, required, whitespace, leading zeros
   - Backend: Server-side checks, account status

2. **OTP Validation**
   - Frontend: Length, format, required, auto-submit, whitespace
   - Backend: Format check, existence, expiration, correctness, attempt tracking

3. **OTP Lockout Validation (3 Failed Attempts = 1 Minute Lock)**
   - Frontend: Progressive lockout, countdown timer, automatic unlock
   - Backend: Lockout after 3 attempts, invalidation after 5 attempts

4. **Rate Limiting**
   - Send OTP: 3 per phone per 10 min, 10 per IP per hour
   - Verify OTP: 5 per phone per 10 min, 20 per IP per hour

5. **Brute Force Protection**
   - OTP brute force: Progressive lockout, logging, alerting
   - Phone enumeration: Consistent response times, generic messages

6. **Network Error Handling**
   - Frontend: Timeout, connection error, server error, CORS, offline
   - Backend: External API timeout, database connection error

7. **OTP Expiration**
   - 10-minute validity period
   - Expiration notification
   - Automatic cleanup
   - Reuse prevention

8. **Session Token Validation**
   - Token generation (JWT, RS256)
   - Token validation and refresh
   - Token revocation

9. **CSRF Protection**
   - Token generation and validation
   - Token rotation

10. **Input Sanitization**
    - Phone number and OTP sanitization
    - SQL injection prevention
    - XSS prevention

11. **Error Response Format**
    - Standard error structure
    - 14 error codes with HTTP status and actions

12. **Security Best Practices**
    - No sensitive data logging
    - HTTPS only
    - Secure token storage
    - Constant-time comparison
    - Rate limiting
    - Monitoring and alerting

---

## Key Features

### ✅ Complete Specification
- All requirements documented with acceptance criteria
- Architecture patterns clearly defined
- Design specifications with animations and colors
- Comprehensive validation rules

### ✅ Test Coverage
- 80+ test cases covering all scenarios
- OTP lockout mechanism (3 failed attempts = 1 minute lock)
- Error handling and edge cases
- Security and performance tests

### ✅ Validation Rules
- Frontend and backend validation
- Rate limiting and brute force protection
- Network error handling
- Session management

### ✅ Security
- CSRF protection
- Input sanitization
- Constant-time comparison
- Secure token storage
- Monitoring and alerting

### ✅ User Experience
- Premium animations and transitions
- Responsive design
- Clear error messages
- Countdown timers for lockouts
- Auto-submit on 4-digit OTP

---

## Implementation Status

### Completed
- ✅ Architecture specification
- ✅ Design document
- ✅ Requirements document
- ✅ UI design and mockups
- ✅ Color palette
- ✅ Validation specification
- ✅ Test plan (80+ tests)
- ✅ Validation plan (comprehensive rules)
- ✅ Frontend login form component (with OTP lockout)
- ✅ Backend auth schema and API (with validation)

### In Progress
- 🔄 Backend implementation (database operations)
- 🔄 Rate limiting implementation
- 🔄 SMS provider integration

### Planned
- ⏳ Test execution and automation
- ⏳ Performance optimization
- ⏳ Security audit
- ⏳ Production deployment

---

## File Statistics

| Category | Count |
|----------|-------|
| Root specification files | 16 |
| Validation-testing files | 2 |
| Total specification files | 18 |
| Test cases | 80+ |
| Validation rules | 100+ |
| Error codes | 14 |
| Color palette colors | 6 |

---

## Usage Guide

### For Developers
1. Read `requirements.md` for feature requirements
2. Read `architecture.md` for code structure
3. Read `design.md` for technical design
4. Check `validation-testing/login-page-validation-plan.ts` for validation rules
5. Implement according to specifications

### For QA/Testers
1. Read `validation-testing/login-page-test-plan.ts` for test cases
2. Read `validation-testing/login-page-validation-plan.ts` for validation rules
3. Execute tests according to test plan
4. Report issues with error codes from `validation-specification.md`

### For Project Managers
1. Read `requirements.md` for feature overview
2. Check `tasks.md` for implementation phases
3. Monitor `test-execution-schedule.md` for test runs
4. Review `user-prompts.md` for decision history

---

## Notes

- All files are consolidated and organized for easy reference
- TypeScript files (.ts) provide type safety and IDE support
- Markdown files (.md) provide human-readable documentation
- HTML mockup provides visual reference
- All validation rules are documented with examples
- Security best practices are included throughout

