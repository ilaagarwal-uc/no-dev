# Wall Decor Visualizer - Complete Specification

## 📋 Project Overview

Wall Decor Visualizer is a web application that enables users to transform 2D images of walls into interactive 3D models. Users can mark dimensions on images, generate Blender scripts via Google's Gemini API, and visualize 3D models with drag-and-drop decorative elements.

---

## 📁 Specification Files Structure

### Root Level (15 Files)

```
.kiro/specs/wall-decor-visualizer/
│
├── 📄 README.md                      ← This file (complete file organization guide)
│
├── 🏗️  ARCHITECTURE & DESIGN
│   ├── architecture.md               ← DDD architecture pattern
│   ├── design.md                     ← Technical design document
│   └── requirements.md               ← Feature requirements (Req 0-23)
│
├── 🎨 UI & DESIGN
│   ├── ui_design.md                  ← UI design specifications
│   └── ui_mockup_final.html          ← Interactive HTML mockup
│
├── ⚙️  SETUP & CONFIGURATION
│   ├── setup.md                      ← Project setup guide
│   └── setup_keys.md                 ← API keys and credentials
│
├── 📋 IMPLEMENTATION
│   ├── tasks.md                      ← Task list (12 phases, 100+ tasks)
│   └── validation-specification.md   ← Validation rules
│
├── 🧪 TESTING & QUALITY
│   ├── testing-strategy.md           ← TDD approach and testing pyramid
│   └── test-execution-schedule.md    ← Automated test schedule
│
└── 📝 DOCUMENTATION
    └── user-prompts.md               ← All user prompts logged (30+ prompts)
```

### Validation-Testing Subfolder (2 Files)

```
validation-testing/
├── login-page-test-plan.ts           ← 80+ test cases (TypeScript)
└── login-page-validation-plan.ts     ← Comprehensive validation rules (TypeScript)
```

---

## 📋 Complete File Organization

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
- Sequential numbering (Prompt 1-30+)
- Key decisions and changes documented
- Session history and context

#### 10. **ui_design.md**
- UI design specifications
- Component specifications
- Typography and spacing
- Animation and transition rules
- Responsive design breakpoints
- Color palette (final and simplified)

#### 11. **ui_mockup_final.html**
- Interactive HTML mockup
- Login page preview
- Upload page preview
- Color palette demonstration
- Premium animation showcase

#### 12. **validation-specification.md**
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

## 📊 File Statistics

| Category | Count | Details |
|----------|-------|---------|
| **Specification Files** | 15 | Architecture, design, requirements, setup |
| **Validation-Testing Files** | 2 | Test plan and validation rules (TypeScript) |
| **Total Files** | 17 | Complete specification package |
| **Test Cases** | 80+ | Organized by category |
| **Validation Rules** | 100+ | Frontend and backend |
| **Error Codes** | 14 | With HTTP status and actions |
| **Color Palette** | 6 | Primary, secondary, backgrounds, text |
| **Implementation Tasks** | 100+ | Across 12 phases |

---

## 🎯 Key Features

### ✅ Complete Specification
- **Requirements**: 23 detailed requirements with acceptance criteria
- **Architecture**: DDD pattern with clear folder structure
- **Design**: Technical design with components and data models
- **UI/UX**: Premium animations, responsive design, final color palette

### ✅ Comprehensive Testing
- **80+ Test Cases**: UI, phone entry, OTP, security, accessibility, performance
- **OTP Lockout**: 3 failed attempts = 1 minute lock (8 dedicated tests)
- **Integration Tests**: Full login flows with error scenarios
- **Coverage Target**: 95%+

### ✅ Validation & Security
- **Phone Number**: 10 digits, numeric only, frontend + backend
- **OTP**: 4 digits, numeric only, frontend + backend
- **Rate Limiting**: 3 sends per phone per 10 min, 10 per IP per hour
- **Brute Force**: Progressive lockout, phone enumeration protection
- **CSRF Protection**: Token generation, validation, rotation
- **Input Sanitization**: SQL injection and XSS prevention

### ✅ User Experience
- **Premium Animations**: Cubic-bezier easing, staggered delays
- **Responsive Design**: Mobile and desktop optimized
- **Clear Error Messages**: Specific feedback with remaining attempts
- **Countdown Timers**: Visual feedback during lockouts
- **Auto-Submit**: OTP auto-submits after 4 digits

---

## 📖 How to Use This Specification

### For Developers
1. **Start Here**: Read `requirements.md` for feature overview
2. **Architecture**: Study `architecture.md` for code structure
3. **Design**: Review `design.md` for technical details
4. **Validation**: Check `validation-testing/login-page-validation-plan.ts`
5. **Implement**: Follow the specifications and validation rules

### For QA/Testers
1. **Test Plan**: Read `validation-testing/login-page-test-plan.ts`
2. **Validation Rules**: Study `validation-testing/login-page-validation-plan.ts`
3. **Execute Tests**: Run 80+ test cases across all categories
4. **Report Issues**: Use error codes from `validation-specification.md`

### For Project Managers
1. **Overview**: Read `requirements.md` for feature scope
2. **Timeline**: Check `tasks.md` for 12 implementation phases
3. **Testing**: Monitor `test-execution-schedule.md`
4. **History**: Review `user-prompts.md` for decisions

---

## 🔐 Security Highlights

### Authentication
- **Phone Number + OTP**: Two-step authentication flow
- **Fixed OTP**: 2213 for development/testing
- **10-Minute Expiration**: OTP validity period
- **Session Persistence**: 30-day refresh token

### Protection Mechanisms
- **Rate Limiting**: Per phone, per IP address
- **Brute Force**: Progressive lockout (3 attempts = 1 min lock)
- **CSRF**: Token-based protection
- **Input Sanitization**: SQL injection and XSS prevention
- **Constant-Time Comparison**: Timing attack prevention

### Monitoring
- **Failed Attempts**: Tracked and logged
- **Suspicious Patterns**: Alerts on 100+ attempts in 1 hour
- **Security Events**: All logged with timestamp and IP

---

## 🎨 Design System

### Color Palette (Final)
- **Primary Accent**: `#97B3AE` (Muted Teal) - Buttons, links, titles
- **Secondary Accent**: `#F2C3B9` (Soft Rose) - Hover states, highlights
- **Backgrounds**: `#ffffff` (White) - Main, `#F0DDD6` (Warm Beige) - Light
- **Borders**: `#D6CBBF` (Taupe)
- **Text**: `#2d3748` (Soft Charcoal) - Primary, `#78716c` (Warm Gray) - Secondary

### Animations
- **Easing**: Cubic-bezier(0.34, 1.56, 0.64, 1) - Smooth, elastic feel
- **Fade-In**: 0.6s on page load
- **Staggered**: 0.1s-0.4s delays on form fields
- **Floating**: 20-25s ambient movement
- **Hover**: Scale and shadow effects

---

## 📋 Implementation Phases

### Phase 1-3: Foundation
- Project setup and infrastructure
- DDD architecture implementation
- Database and API configuration

### Phase 4-6: Authentication
- Phone number + OTP authentication
- Session management
- Token refresh mechanism

### Phase 7-9: Image Processing
- Image upload and storage
- Dimension marking
- Blender script generation

### Phase 10-12: 3D Visualization
- 3D model viewer
- Viewport controls
- Model catalog and drag-drop

---

## 🧪 Testing Strategy

### Testing Pyramid
- **Unit Tests**: 70% (Fast, isolated, comprehensive)
- **Integration Tests**: 25% (Service interactions)
- **E2E Tests**: 5% (Critical user paths)

### Test Execution
- **Every 6 Hours**: Full test suite
- **On Commit**: Pre-commit hook tests
- **Before Deploy**: Pre-deployment tests
- **CI/CD**: GitHub Actions workflow

### Coverage Targets
- **Overall**: 75%+
- **Critical Paths**: 95%+
- **Login Page**: 95%+

---

## 📝 Documentation Files

### Core Documentation
| File | Purpose | Audience |
|------|---------|----------|
| `requirements.md` | Feature requirements | Everyone |
| `architecture.md` | Code structure | Developers |
| `design.md` | Technical design | Developers |
| `setup.md` | Project setup | DevOps, Developers |
| `setup_keys.md` | API credentials | DevOps |

### Design & UI
| File | Purpose | Audience |
|------|---------|----------|
| `ui_design.md` | UI specifications | Designers, Developers |
| `ui_mockup_final.html` | Visual mockup | Everyone |
| `color_palette_final.md` | Color system | Designers, Developers |

### Testing & Validation
| File | Purpose | Audience |
|------|---------|----------|
| `validation-testing/login-page-test-plan.ts` | 80+ test cases | QA, Developers |
| `validation-testing/login-page-validation-plan.ts` | Validation rules | QA, Developers |
| `validation-specification.md` | Validation details | Developers |
| `testing-strategy.md` | Testing approach | QA, Developers |
| `test-execution-schedule.md` | Test automation | DevOps, QA |

### Project Management
| File | Purpose | Audience |
|------|---------|----------|
| `tasks.md` | Implementation tasks | Project Managers |
| `user-prompts.md` | Decision history | Everyone |

---

## ✅ Implementation Status

### Completed ✅
- Architecture specification
- Design document
- Requirements document
- UI design and mockups
- Color palette
- Validation specification
- Test plan (80+ tests)
- Validation plan (comprehensive rules)
- Frontend login form component (with OTP lockout)
- Backend auth schema and API (with validation)

### In Progress 🔄
- Backend implementation (database operations)
- Rate limiting implementation
- SMS provider integration

### Planned ⏳
- Test execution and automation
- Performance optimization
- Security audit
- Production deployment

---

## 🚀 Quick Start

### 1. Read the Specification
```bash
# Start with requirements
cat requirements.md

# Then architecture
cat architecture.md

# Then design
cat design.md
```

### 2. Review the Tests
```bash
# View test plan
cat validation-testing/login-page-test-plan.ts

# View validation rules
cat validation-testing/login-page-validation-plan.ts
```

### 3. Check the UI
```bash
# Open mockup in browser
open ui_mockup_final.html
```

### 4. Start Implementation
```bash
# Follow tasks.md for implementation phases
cat tasks.md
```

---

## 📞 Support

For questions about the specification:
1. Check `README.md` for file organization and overview
2. Review `user-prompts.md` for decision history
3. Consult relevant specification file for details
4. Contact project team for clarification

---

## 📄 License

This specification is part of the Wall Decor Visualizer project.

---

**Last Updated**: March 4, 2026  
**Total Specification Files**: 17  
**Test Cases**: 80+  
**Validation Rules**: 100+  
**Status**: ✅ Complete and Ready for Implementation

