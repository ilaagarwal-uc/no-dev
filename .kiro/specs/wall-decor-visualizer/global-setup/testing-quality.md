# Test Execution Schedule & Monitoring

This document tracks all test executions, schedules, and monitoring for the Wall Decor Visualizer project.

---

## Automated Test Schedule

### Every 6 Hours (Scheduled)

**Time:** 00:00, 06:00, 12:00, 18:00 UTC

**Command:**
```bash
npm run test:full
```

**Includes:**
- ✅ All unit tests (backend + frontend)
- ✅ All integration tests
- ✅ Coverage report generation
- ✅ Performance benchmarks
- ✅ Email notification on failure

**Expected Duration:** 10-15 minutes

**Notification:**
- Slack: #test-results channel
- Email: dev-team@example.com
- Dashboard: https://tests.example.com

---

### On Every Commit (Pre-commit Hook)

**Trigger:** Git pre-commit hook

**Command:**
```bash
npm run test:pre-commit
```

**Includes:**
- ✅ Unit tests for changed files only
- ✅ Lint checks
- ✅ Type checking
- ✅ Quick validation

**Expected Duration:** 2-5 minutes

**Failure Action:** Blocks commit

---

### On Every Push (CI Pipeline)

**Trigger:** Push to any branch

**Command:**
```bash
npm run test:ci
```

**Includes:**
- ✅ All unit tests
- ✅ All integration tests
- ✅ Coverage report
- ✅ Code quality checks

**Expected Duration:** 15-20 minutes

**Failure Action:** Blocks merge to main

---

### Before Deployment (Pre-deployment)

**Trigger:** Manual or automated deployment

**Command:**
```bash
npm run test:deploy
```

**Includes:**
- ✅ Full test suite
- ✅ E2E tests
- ✅ Performance tests
- ✅ Security tests
- ✅ Smoke tests

**Expected Duration:** 30-45 minutes

**Failure Action:** Blocks deployment

---

### On Demand (Manual)

**Commands:**
```bash
# Run all tests
npm run test

# Run specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test -- auth.test.ts

# Run tests matching pattern
npm run test -- --grep "login"
```

---

## Test Execution Log

### Format

```markdown
## Test Run: [Date] [Time]

**Status:** ✅ PASSED / ❌ FAILED / ⚠️ FLAKY

**Duration:** [X minutes]

**Results:**
- Unit Tests: [X/Y passed]
- Integration Tests: [X/Y passed]
- E2E Tests: [X/Y passed]
- Coverage: [X%]

**Failures:**
- [Test name]: [Error message]

**Performance:**
- Slowest test: [Test name] ([X seconds])
- Average test time: [X seconds]

**Notes:**
- [Any observations]
```

### Recent Executions

#### 2024-01-15 18:00 UTC

**Status:** ✅ PASSED

**Duration:** 12 minutes

**Results:**
- Unit Tests: 145/145 passed
- Integration Tests: 32/32 passed
- E2E Tests: 8/8 passed
- Coverage: 78%

**Performance:**
- Slowest test: Image upload integration (2.3s)
- Average test time: 0.8s

**Notes:**
- All tests passing
- Coverage improved by 2%

---

#### 2024-01-15 12:00 UTC

**Status:** ✅ PASSED

**Duration:** 11 minutes

**Results:**
- Unit Tests: 145/145 passed
- Integration Tests: 32/32 passed
- E2E Tests: 8/8 passed
- Coverage: 76%

**Performance:**
- Slowest test: Blender execution (3.1s)
- Average test time: 0.8s

**Notes:**
- All tests passing
- Blender test slightly slower than usual

---

#### 2024-01-15 06:00 UTC

**Status:** ⚠️ FLAKY

**Duration:** 13 minutes

**Results:**
- Unit Tests: 145/145 passed
- Integration Tests: 31/32 passed (1 flaky)
- E2E Tests: 8/8 passed
- Coverage: 76%

**Failures:**
- `tests/integration/gemini.test.ts`: Timeout waiting for Gemini API response

**Performance:**
- Slowest test: Gemini API call (5.2s)
- Average test time: 0.8s

**Notes:**
- Flaky test: Gemini API timeout (network issue)
- Rerun passed successfully
- Added retry logic to Gemini tests

---

## Test Failure Analysis Log

### Format

```markdown
## Test Failure: [Test Name]

**Date:** [Date] [Time]
**Status:** [FAILED / FLAKY]
**Environment:** [dev/staging/prod]

### Error Details
- Error Message: [Full error]
- Stack Trace: [Relevant stack trace]
- Test Output: [Console output]

### Root Cause Analysis
- **Root Cause:** [What caused the failure]
- **Why It Happened:** [Explanation]
- **Why Tests Missed It:** [Test gap analysis]

### Impact
- **Severity:** [Critical / High / Medium / Low]
- **Affected Features:** [List features]
- **User Impact:** [Potential user impact]

### Resolution
- **Fix Applied:** [What was fixed]
- **Test Improvement:** [How tests were improved]
- **Prevention:** [How to prevent in future]

### Follow-up
- [ ] Bug fixed
- [ ] Test added
- [ ] Documentation updated
- [ ] Team notified
- [ ] Lesson documented
```

### Recent Failures

#### Flaky Test: Gemini API Timeout

**Date:** 2024-01-15 06:00 UTC
**Status:** FLAKY
**Environment:** CI Pipeline

**Error Details:**
```
Error: Timeout waiting for Gemini API response
  at tests/integration/gemini.test.ts:45
  Timeout: 5000ms exceeded
```

**Root Cause Analysis:**
- **Root Cause:** Network latency spike in Gemini API
- **Why It Happened:** External API occasionally slow
- **Why Tests Missed It:** No retry logic in tests

**Impact:**
- **Severity:** Low (intermittent)
- **Affected Features:** Blender script generation
- **User Impact:** Occasional timeout on script generation

**Resolution:**
- **Fix Applied:** Added exponential backoff retry logic
- **Test Improvement:** Added retry mechanism to Gemini tests
- **Prevention:** Increased timeout threshold, added monitoring

**Follow-up:**
- [x] Bug fixed
- [x] Test added
- [x] Documentation updated
- [x] Team notified
- [x] Lesson documented

---

#### Test Failure: Image Upload Validation

**Date:** 2024-01-14 18:00 UTC
**Status:** FAILED
**Environment:** CI Pipeline

**Error Details:**
```
AssertionError: Expected file size validation to reject 51MB file
  Expected: false
  Received: true
  at tests/unit/services/imageService.test.ts:78
```

**Root Cause Analysis:**
- **Root Cause:** File size limit was 51MB instead of 50MB
- **Why It Happened:** Off-by-one error in validation logic
- **Why Tests Missed It:** Test used 50.5MB file, not 51MB

**Impact:**
- **Severity:** Medium (security/compliance)
- **Affected Features:** Image upload
- **User Impact:** Users could upload files exceeding limit

**Resolution:**
- **Fix Applied:** Changed limit to exactly 50MB (52,428,800 bytes)
- **Test Improvement:** Added boundary tests (49.9MB, 50MB, 50.1MB)
- **Prevention:** Added property-based tests for file size validation

**Follow-up:**
- [x] Bug fixed
- [x] Test added
- [x] Documentation updated
- [x] Team notified
- [x] Lesson documented

---

## Test Coverage Tracking

### Coverage by Module

| Module | Target | Current | Trend |
|--------|--------|---------|-------|
| Auth Service | 85% | 88% | ↑ |
| Image Service | 80% | 76% | ↓ |
| Gemini Service | 80% | 72% | ↓ |
| Blender Service | 75% | 68% | ↓ |
| Auth Controller | 85% | 90% | ↑ |
| Image Controller | 80% | 74% | ↓ |
| LoginForm Component | 85% | 82% | ↓ |
| ImageUpload Component | 80% | 78% | ↓ |
| useAuth Hook | 85% | 86% | ↑ |
| **Overall** | **80%** | **78%** | ↓ |

### Coverage Trend

```
Coverage %
100 |
 90 |     ╱╲
 80 |    ╱  ╲    ╱╲
 70 |   ╱    ╲  ╱  ╲
 60 |  ╱      ╲╱    ╲
 50 |_╱________________
    Jan 1  Jan 8  Jan 15
```

---

## Performance Metrics

### Test Execution Time

| Test Suite | Target | Current | Trend |
|-----------|--------|---------|-------|
| Unit Tests | < 5 min | 4.2 min | ✅ |
| Integration Tests | < 8 min | 7.8 min | ✅ |
| E2E Tests | < 15 min | 12.3 min | ✅ |
| **Total** | **< 15 min** | **12.1 min** | ✅ |

### Slowest Tests

| Test | Duration | Module |
|------|----------|--------|
| Blender execution | 3.1s | Integration |
| Gemini API call | 2.8s | Integration |
| Image upload | 2.3s | Integration |
| Auth flow | 1.8s | Integration |
| Model viewer render | 1.5s | E2E |

---

## Flaky Test Tracking

### Current Flaky Tests

| Test | Flakiness | Last Occurrence | Status |
|------|-----------|-----------------|--------|
| Gemini API timeout | 5% | 2024-01-15 | 🔧 Fixed |
| Database connection | 2% | 2024-01-14 | 🔍 Investigating |
| Camera permission | 3% | 2024-01-13 | ⏳ Pending |

### Flaky Test Resolution Process

1. **Identify:** Monitor test results for failures
2. **Isolate:** Run test multiple times to confirm flakiness
3. **Analyze:** Determine root cause (timing, external service, etc.)
4. **Fix:** Apply fix (retry logic, timeout adjustment, etc.)
5. **Verify:** Run test 10+ times to confirm fix
6. **Document:** Record lesson learned

---

## Bug Escape Rate

### Metrics

| Period | Bugs Found in Prod | Total Bugs | Escape Rate |
|--------|-------------------|-----------|------------|
| Jan 1-7 | 2 | 45 | 4.4% |
| Jan 8-14 | 1 | 52 | 1.9% |
| Jan 15-21 | 0 | 38 | 0% |

### Target: < 1% escape rate

---

## Test Health Dashboard

### Current Status

```
┌─────────────────────────────────────┐
│ Test Execution Health               │
├─────────────────────────────────────┤
│ Last Run: 2024-01-15 18:00 UTC      │
│ Status: ✅ PASSED                   │
│ Duration: 12 minutes                │
│ Coverage: 78%                       │
│ Flaky Tests: 0                      │
│ Bug Escape Rate: 0%                 │
└─────────────────────────────────────┘
```

### Alerts

- ⚠️ Image Service coverage below target (76% vs 80%)
- ⚠️ Gemini Service coverage below target (72% vs 80%)
- ✅ All other metrics on track

---

## Maintenance Tasks

### Weekly (Every Monday)

- [ ] Review test execution reports
- [ ] Identify flaky tests
- [ ] Update test data
- [ ] Remove obsolete tests
- [ ] Optimize slow tests

### Monthly (First Monday)

- [ ] Coverage analysis
- [ ] Performance review
- [ ] Flaky test assessment
- [ ] Team training needs
- [ ] Update test strategy

### Quarterly (First Monday of Quarter)

- [ ] Comprehensive coverage audit
- [ ] Test effectiveness review
- [ ] Performance benchmarking
- [ ] Strategy refinement
- [ ] Tool evaluation

---

## Contact & Escalation

**Test Failures:**
- Slack: #test-failures
- Email: qa-team@example.com
- On-call: [On-call engineer]

**Coverage Issues:**
- Slack: #code-quality
- Email: tech-lead@example.com

**Performance Issues:**
- Slack: #performance
- Email: devops@example.com

---

## Resources

- [Testing Strategy](./testing-strategy.md)
- [Architecture Guide](./architecture.md)
- [Setup Guide](./setup.md)
- [CI/CD Pipeline](../configs/ci-cd.config.json)


# Wall Decor Visualizer - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Wall Decor Visualizer project. We follow Test-Driven Development (TDD) principles with heavy emphasis on use case coverage, continuous testing, and root cause analysis for all failures.

---

## Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**
   - Write tests before implementation
   - All use cases must be covered by tests
   - Tests drive design decisions

2. **Comprehensive Coverage**
   - Unit tests for all functions and methods
   - Integration tests for service interactions
   - End-to-end tests for user workflows
   - Property-based tests for edge cases

3. **Continuous Testing**
   - Run tests every 6 hours automatically
   - Run tests on every commit
   - Run tests before deployment
   - Monitor test health continuously

4. **Root Cause Analysis**
   - Every test failure triggers investigation
   - Every bug report triggers deep analysis
   - Improve tests to prevent similar bugs
   - Document lessons learned

5. **Isolated Test Environments**
   - **NEVER connect to real databases in tests**
   - Use in-memory databases (MongoDB Memory Server for MongoDB)
   - Use mocks for external services
   - Each test should be completely isolated
   - Tests must not depend on external state

---

## Database Testing Rules

### CRITICAL: Use In-Memory Databases for Tests

**MongoDB Tests MUST use MongoDB Memory Server**

```typescript
// ✅ CORRECT - Use MongoDB Memory Server
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // Clear any existing models to ensure clean state
  if (mongoose.connection.models) {
    Object.keys(mongoose.connection.models).forEach(key => {
      delete mongoose.connection.models[key];
    });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up data between tests
  await Model.deleteMany({});
});
```

**❌ INCORRECT - Never connect to real MongoDB**
```typescript
// ❌ WRONG - Connecting to real database
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test-db');
});
```

### Why In-Memory Databases?

1. **Speed**: In-memory databases are 10-100x faster than real databases
2. **Isolation**: Each test run gets a fresh database
3. **No Side Effects**: Tests don't affect production or development data
4. **Parallel Execution**: Multiple test suites can run simultaneously
5. **CI/CD Friendly**: No need to set up database infrastructure
6. **Deterministic**: Same results every time, no flaky tests

### Setup Requirements

**Install MongoDB Memory Server:**
```bash
npm install --save-dev mongodb-memory-server
```

**For Other Databases:**
- **PostgreSQL**: Use `pg-mem` for in-memory PostgreSQL
- **Redis**: Use `redis-mock` or `ioredis-mock`
- **SQLite**: Use `:memory:` database

---

## Testing Pyramid

```
        ╱╲
       ╱  ╲         E2E Tests (5%)
      ╱────╲        - Full user workflows
     ╱      ╲       - Critical paths only
    ╱────────╲
   ╱          ╲     Integration Tests (25%)
  ╱────────────╲    - Service interactions
 ╱              ╲   - API contracts
╱────────────────╲  - Database operations
                    
Unit Tests (70%)
- Functions
- Methods
- Utilities
- Domain logic
```

### Test Distribution

- **Unit Tests**: 70% (Fast, isolated, comprehensive)
- **Integration Tests**: 25% (Medium speed, service interactions)
- **E2E Tests**: 5% (Slow, critical user paths only)

---

## Backend Testing Strategy

### Unit Tests

**Coverage Target**: 80%+

**Test Structure:**
```typescript
// tests/unit/services/authService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '@services/authService';
import { mockUserRepository } from '@fixtures/mockData';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    // Cleanup
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      const credentials = { email: 'invalid@example.com', password: 'password123' };
      
      await expect(authService.login(credentials)).rejects.toThrow('User not found');
    });

    it('should throw error for incorrect password', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      
      await expect(authService.login(credentials)).rejects.toThrow('Invalid password');
    });

    it('should hash password before comparison', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const hashSpy = vi.spyOn(authService, 'hashPassword');
      
      await authService.login(credentials);
      
      expect(hashSpy).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', () => {
      const validToken = 'valid.jwt.token';
      const result = authService.validateToken(validToken);

      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const expiredToken = 'expired.jwt.token';
      const result = authService.validateToken(expiredToken);

      expect(result).toBe(false);
    });

    it('should return false for malformed token', () => {
      const malformedToken = 'not.a.token';
      const result = authService.validateToken(malformedToken);

      expect(result).toBe(false);
    });
  });
});
```

**What to Test:**
- Happy path scenarios
- Error conditions
- Edge cases
- Input validation
- Output validation
- Side effects

### Integration Tests

**Coverage Target**: 60%+

**Test Structure:**
```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@server';
import { connectDatabase, disconnectDatabase } from '@config/database';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should set HTTP-only cookie on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const setCookieHeader = response.headers['set-cookie'][0];
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('Secure');
      expect(setCookieHeader).toContain('SameSite=Strict');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Then refresh
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.token).toBeDefined();
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
    });
  });
});
```

**What to Test:**
- API endpoint contracts
- Database interactions
- Service integrations
- Error handling
- Response formats
- HTTP headers

### E2E Tests

**Coverage Target**: Critical paths only

**Test Structure:**
```typescript
// tests/e2e/auth-flow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@server';

describe('Auth E2E Flow', () => {
  let authToken: string;
  let refreshToken: string;

  it('should complete full auth flow: login -> use token -> refresh -> logout', async () => {
    // Step 1: Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.token;

    // Step 2: Use token to access protected endpoint
    const protectedResponse = await request(app)
      .get('/api/images')
      .set('Authorization', `Bearer ${authToken}`);

    expect(protectedResponse.status).toBe(200);

    // Step 3: Refresh token
    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', loginResponse.headers['set-cookie']);

    expect(refreshResponse.status).toBe(200);
    const newToken = refreshResponse.body.token;

    // Step 4: Use new token
    const newProtectedResponse = await request(app)
      .get('/api/images')
      .set('Authorization', `Bearer ${newToken}`);

    expect(newProtectedResponse.status).toBe(200);

    // Step 5: Logout
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${newToken}`);

    expect(logoutResponse.status).toBe(200);

    // Step 6: Verify token is invalidated
    const invalidResponse = await request(app)
      .get('/api/images')
      .set('Authorization', `Bearer ${newToken}`);

    expect(invalidResponse.status).toBe(401);
  });
});
```

**What to Test:**
- Complete user workflows
- Critical business paths
- Cross-service interactions
- Real database operations

---

## Frontend Testing Strategy

### Unit Tests

**Coverage Target**: 80%+

**Test Structure:**
```typescript
// tests/unit/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@hooks/useAuth';
import { mockAuthService } from '@fixtures/mockData';

describe('useAuth Hook', () => {
  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth());

    // Login first
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

**Component Tests:**
```typescript
// tests/unit/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@components/auth/LoginForm';

describe('LoginForm Component', () => {
  it('should render login form with email and password fields', () => {
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit form with valid credentials', async () => {
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('should display error message on failed login', async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const mockSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<LoginForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });
});
```

### Integration Tests

**Coverage Target**: 60%+

**Test Structure:**
```typescript
// tests/integration/auth-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import { LoginPage } from '@pages/LoginPage';
import { mockAuthService } from '@fixtures/mockData';

describe('Auth Flow Integration', () => {
  it('should complete login flow from form to state update', async () => {
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

**Coverage Target**: Critical user paths only

**Test Structure (using Playwright):**
```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth E2E Flow', () => {
  test('should complete full login and image upload flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173');
    
    // Login
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
    
    // Navigate to upload page
    await page.click('a:has-text("Upload")');
    
    // Upload image
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/test-image.jpg');
    await page.click('button:has-text("Upload")');
    
    // Wait for upload completion
    await page.waitForSelector('text=Upload successful');
    expect(await page.textContent('text=Upload successful')).toBeTruthy();
  });
});
```

---

## Test Execution Schedule

### Automated Test Runs

**Every 6 Hours (Scheduled):**
```bash
# Full test suite
npm run test:full

# Includes:
# - All unit tests
# - All integration tests
# - Coverage report
# - Performance benchmarks
```

**On Every Commit:**
```bash
# Pre-commit hook
npm run test:pre-commit

# Includes:
# - Unit tests for changed files
# - Lint checks
# - Type checking
```

**Before Deployment:**
```bash
# Pre-deployment tests
npm run test:deploy

# Includes:
# - Full test suite
# - E2E tests
# - Performance tests
# - Security tests
```

**On Demand:**
```bash
# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
```

---

## Root Cause Analysis Process

### When a Test Fails

**Step 1: Immediate Investigation (Within 1 hour)**
```markdown
## Test Failure Report

**Test Name:** [test name]
**Failure Time:** [timestamp]
**Environment:** [dev/staging/prod]
**Error Message:** [full error]

### Initial Analysis
- [ ] Is this a flaky test?
- [ ] Is this a real bug?
- [ ] Is this an environment issue?
- [ ] Is this a test data issue?

### Evidence
- Error logs
- Stack trace
- Test output
- Related code changes
```

**Step 2: Root Cause Analysis (Within 4 hours)**
```markdown
## Root Cause Analysis

**Root Cause:** [What actually caused the failure]

### Why Did This Happen?
- [Reason 1]
- [Reason 2]
- [Reason 3]

### Why Didn't Tests Catch This?
- [Gap 1]
- [Gap 2]
- [Gap 3]

### How Can We Improve Tests?
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

### Action Items
- [ ] Fix the bug
- [ ] Add test case
- [ ] Update test strategy
- [ ] Document lesson learned
```

**Step 3: Prevention (Within 24 hours)**
- Add new test case to prevent regression
- Update test strategy documentation
- Share findings with team
- Update testing guidelines

### When a Bug is Reported

**Step 1: Reproduce the Bug**
```typescript
// Create failing test that reproduces bug
describe('Bug: [Bug Description]', () => {
  it('should reproduce reported bug', async () => {
    // Steps to reproduce
    // Expected: [what should happen]
    // Actual: [what actually happens]
    
    expect(actualResult).toBe(expectedResult);
  });
});
```

**Step 2: Analyze Why Tests Missed It**
- Was there a test for this scenario?
- If yes, why did it pass?
- If no, why wasn't it covered?
- What edge case was missed?

**Step 3: Improve Test Coverage**
- Add test for the specific bug
- Add tests for related scenarios
- Add tests for edge cases
- Update test strategy

**Step 4: Document Lesson**
```markdown
## Lesson Learned: [Bug Name]

**Bug:** [Description]
**Root Cause:** [Why it happened]
**Test Gap:** [Why tests didn't catch it]
**Prevention:** [How we improved tests]
**Similar Risks:** [Other areas with similar risk]
```

---

## Test Maintenance

### Regular Review (Weekly)

- Review test execution reports
- Identify flaky tests
- Update test data
- Remove obsolete tests
- Optimize slow tests

### Quarterly Assessment

- Coverage analysis
- Test effectiveness review
- Performance benchmarking
- Test strategy refinement
- Team training needs

### Documentation

**Test Documentation:**
- Test purpose and scope
- Test data requirements
- Expected outcomes
- Known limitations
- Maintenance notes

**Example:**
```typescript
/**
 * Test Suite: Auth Service Login
 * 
 * Purpose: Verify authentication service correctly validates credentials
 * 
 * Scope:
 * - Valid credentials
 * - Invalid email
 * - Invalid password
 * - Account locked
 * - Rate limiting
 * 
 * Test Data:
 * - Valid user: test@example.com / password123
 * - Invalid user: invalid@example.com
 * 
 * Dependencies:
 * - Mock user repository
 * - Mock password hasher
 * 
 * Maintenance:
 * - Update test data if password policy changes
 * - Update if auth logic changes
 * - Review quarterly for effectiveness
 */
```

---

## Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | - |
| Integration Tests | 60% | - |
| E2E Tests | Critical paths | - |
| Overall Coverage | 75% | - |
| Critical Path Coverage | 95% | - |

Unit test coverage
**Branch Coverage Target**: 100%+
**Line Coverage Target**: 100%+
---

## Tools and Frameworks

**Backend:**
- **Test Framework**: Vitest
- **HTTP Testing**: Supertest
- **Mocking**: Vitest mocks
- **Coverage**: Vitest coverage
- **CI/CD**: GitHub Actions

**Frontend:**
- **Test Framework**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: Vitest mocks
- **Coverage**: Vitest coverage
- **CI/CD**: GitHub Actions

---

## Test Naming Conventions

**Unit Tests:**
```typescript
describe('[Unit/Component Name]', () => {
  describe('[Method/Feature]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test
    });
  });
});
```

**Integration Tests:**
```typescript
describe('[Feature] Integration', () => {
  it('should [complete workflow] from [start] to [end]', () => {
    // Test
  });
});
```

**E2E Tests:**
```typescript
describe('[User Story]', () => {
  it('should [complete user journey]', () => {
    // Test
  });
});
```

---

## Continuous Improvement

### Metrics to Track

- Test execution time
- Test pass rate
- Code coverage percentage
- Bug escape rate (bugs found in production)
- Test maintenance effort
- Flaky test frequency

### Goals

- Reduce bug escape rate to < 1%
- Maintain > 75% code coverage
- Keep test execution time < 10 minutes
- Achieve < 5% flaky test rate
- Document all lessons learned

---

## Team Responsibilities

**Developers:**
- Write tests before implementation
- Maintain test quality
- Report test failures immediately
- Participate in RCA sessions

**QA:**
- Review test coverage
- Identify test gaps
- Perform exploratory testing
- Report bugs with reproduction steps

**DevOps:**
- Maintain CI/CD pipeline
- Monitor test execution
- Optimize test performance
- Manage test infrastructure

**Tech Lead:**
- Review test strategy
- Approve test changes
- Conduct RCA sessions
- Update testing guidelines
