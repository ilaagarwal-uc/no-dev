# Backend Test Suite

## Test Structure

This test suite follows the comprehensive test plan defined in `login-page_test_plan.md`.

### Implemented Tests

#### Unit Tests - Domain Layer (9 test suites)
- ✅ `unit/domain/auth/phone_validation.test.ts` - Phone number validation (7 tests)
- ✅ `unit/domain/auth/otp_validation.test.ts` - OTP validation (5 tests)
- ✅ `unit/domain/auth/phone_sanitization.test.ts` - Phone sanitization (6 tests)
- ✅ `unit/domain/auth/otp_generation.test.ts` - OTP generation (3 tests)
- ✅ `unit/domain/auth/otp_expiration.test.ts` - OTP expiration logic (4 tests)
- ✅ `unit/domain/auth/otp_lockout.test.ts` - OTP lockout logic (6 tests)
- ✅ `unit/domain/auth/permanent_invalidation.test.ts` - Permanent invalidation (5 tests)
- ✅ `unit/domain/auth/jwt_generation.test.ts` - JWT token generation (5 tests)
- ✅ `unit/domain/auth/jwt_verification.test.ts` - JWT token verification (7 tests)
- ✅ `unit/domain/auth/security_functions.test.ts` - Security functions (6 tests)

**Total Domain Tests: 54 test cases**

#### Integration Tests - API Endpoints (2 test suites)
- ✅ `integration/auth/generate_otp.test.ts` - Generate OTP API (7 tests)
- ✅ `integration/auth/verify_otp.test.ts` - Verify OTP API (14 tests)

**Total Integration Tests: 21 test cases**

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- phone_validation.test.ts

# Run in watch mode
npm test -- --watch
```

### Test Coverage Targets

- Unit Tests: 80%+ coverage
- Integration Tests: 60%+ coverage
- Overall: 70%+ coverage

### Dependencies

- vitest: Test runner
- supertest: HTTP assertions
- mongodb-memory-server: In-memory MongoDB for integration tests

### Notes

- All tests use in-memory MongoDB to avoid external dependencies
- JWT secret is set to test value in test environment
- Rate limiting tests use actual timing logic
- All tests clean up after themselves (afterEach hooks)
