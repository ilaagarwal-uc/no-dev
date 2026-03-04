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
