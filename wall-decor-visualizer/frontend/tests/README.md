# Frontend Test Suite

## Test Structure

This test suite follows the comprehensive test plan defined in `login-page_test_plan.md`.

### Implemented Tests

#### Unit Tests - Domain Layer (2 test suites)
- ✅ `unit/domain/auth/phone_validation.test.ts` - Phone number validation (5 tests)
- ✅ `unit/domain/auth/otp_validation.test.ts` - OTP validation (5 tests)

**Total Domain Tests: 10 test cases**

#### Unit Tests - Components (1 test suite)
- ✅ `unit/components/PhoneNumberForm.test.tsx` - Phone number form component (12 tests)

**Total Component Tests: 12 test cases**

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- PhoneNumberForm.test.tsx

# Run in watch mode
npm test -- --watch
```

### Test Coverage Targets

- Unit Tests: 80%+ coverage
- Integration Tests: 60%+ coverage
- Overall: 70%+ coverage

### Dependencies

- vitest: Test runner
- @testing-library/react: React component testing
- @testing-library/jest-dom: DOM matchers
- @testing-library/user-event: User interaction simulation
- jsdom: DOM environment for tests

### Notes

- All tests use jsdom for DOM simulation
- localStorage and sessionStorage are cleared after each test
- Component tests mock API calls to avoid network dependencies
- All async operations use waitFor for proper timing
