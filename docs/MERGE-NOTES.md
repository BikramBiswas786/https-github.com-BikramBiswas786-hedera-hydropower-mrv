# Documentation Merge Notes
Date: February 22, 2026

## Manual Merge Tasks Remaining

These files have been archived but contain useful content that should be manually merged:

### 1. API Documentation
**Source**: docs/archived/API-REFERENCE.md
**Target**: docs/API.md
**Action**: Review API-REFERENCE.md and add any missing endpoints to API.md
**Priority**: Low (API.md is already comprehensive)

### 2. Testing Guide
**Source**: docs/archived/UNIT-TESTS-COMPLETE-GUIDEBOOK.md
**Target**: TESTING_GUIDE.md
**Action**: Review guidebook and add any missing test patterns to TESTING_GUIDE.md
**Priority**: Medium (guidebook has detailed test examples)

### 3. Integration Checklist
**Source**: docs/archived/INTEGRATION_CHECKLIST.md
**Target**: INTEGRATION_GUIDE.md
**Action**: Add checklist section to INTEGRATION_GUIDE.md
**Priority**: Low (checklist is straightforward)

### 4. Verra Guide
**Source**: docs/archived/Verra Submission Preparation Guide.md
**Target**: docs/VERRA-GUIDEBOOK.md
**Action**: Merge detailed preparation steps
**Priority**: Medium (preparation guide has submission workflow)

### 5. Roadmap
**Source**: docs/archived/ML_ROADMAP.md
**Target**: ROADMAP.md
**Action**: Add ML-specific roadmap section
**Priority**: Low (main roadmap covers high-level ML items)

## Completed Actions

### Phase 1 (14 files)
- Archived status files (SUBMISSION.md, etc.)
- Archived deployment duplicates (PRODUCTION_GAP_AUDIT.md, etc.)
- Archived test files (AUDIT_REPORT.md, HACKATHON.md)
- Moved evidence files (LIVE_DEMO_RESULTS.md)
- Deleted auto-generated files

### Phase 2 (19 files)
- Archived root status files (DEPLOYMENT-COMPLETE.md, FINAL-STATUS.md, etc.)
- Archived roadmap duplicates (ML_ROADMAP.md, README-SETUP.md)
- Archived integration duplicates (INTEGRATION_CHECKLIST.md)
- Archived AI slop files (Hedera Hydropower MRV - Complete Production-Ready System.md, etc.)
- Archived pilot duplicates (PILOT-DEPLOYMENT-IMPLEMENTATION-GUIDE.md, etc.)
- Moved evidence files (Monitoring-Report-Testnet-Scenario1.md, txids.csv)

### Phase 3 (2 files)
- Archived API duplicate (docs/api/API-REFERENCE.md)
- Archived test guidebook (docs/UNIT-TESTS-COMPLETE-GUIDEBOOK.md)

## Total Progress

**Before**: 93 markdown files
**After**: ~58 markdown files (35 archived)
**Target**: ~35-40 core files

**Status**: ~60% complete
**Remaining**: Manual merges (optional) + final cleanup of docs/deployment/

## Next Steps (Optional)

1. Review archived files in docs/archived/ for any critical content
2. Perform manual merges listed above (priority: Medium items first)
3. Update docs/README.md with final documentation structure
4. Update main README.md to remove references to archived files

## Files Safe to Keep As-Is

All remaining files are core documentation that should be kept:
- README.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/VERRA-GUIDEBOOK.md
- docs/ACM0002-ALIGNMENT-MATRIX.md
- docs/MONITORING-PLAN.md
- docs/PILOT_PLAN_6MW_PLANT.md
- docs/SECURITY.md
- ROADMAP.md
- TESTING_GUIDE.md
- INTEGRATION_GUIDE.md
- All files in evidence/
- All files in examples/
- All files in ml/
- All files in scripts/
