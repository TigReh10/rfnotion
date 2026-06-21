# Changelog

All notable changes to ResumeForge AI are documented here.

## Unreleased

### Added
- LinkedIn optimizer: generates an optimized headline, About section, and
  profile suggestions from a resume. Persisted per user.
- Skill gap analysis: readiness score for a target role plus prioritized
  missing skills with guidance on how to learn each one.
- Career roadmap: a phased plan (0-3 / 3-6 / 6-12 months) with concrete
  milestones toward a target role.
- History page: server-rendered list of analyzed resumes with the latest ATS
  score, status, and date.
- New dashboard navigation entries and home cards for all of the above.
- `docs/FEATURES.md` describing every feature and its key requirements.

### Changed
- All advanced features use AI when keys are configured and transparently fall
  back to a built-in deterministic engine otherwise.

### Security
- Added a hidden honeypot field to the login form and route, mirroring the
  existing register-form protection. Bot submissions are audit-logged and
  rejected as invalid credentials.
