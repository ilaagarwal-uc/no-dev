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
