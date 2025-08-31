# Changelog

All notable changes to the Living Spec Dashboard project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time WebSocket updates for KPI metrics
- Dark mode theme support with system preference detection
- Advanced search functionality across all content types

### Changed
- Improved mobile responsiveness for Kanban board
- Enhanced error handling with user-friendly messages

### Fixed
- Chart rendering issues in Safari browser
- Memory leak in real-time data subscriptions

## [1.2.0] - 2024-01-16

### Added
- feat: Interactive risk matrix heat map visualization
- feat: Mermaid diagram renderer with dynamic loading
- feat: ADR template generator with MADR format support
- feat: Comprehensive error boundaries for better UX
- feat: Export functionality for dashboard data (JSON, CSV)

### Changed
- refactor: Improved TypeScript types for better IDE support  
- style: Updated Nordic design system with consistent spacing
- perf: Optimized bundle size by 20% through code splitting

### Fixed
- fix: KPI trend calculations now handle edge cases correctly
- fix: Timeline rendering on mobile devices improved
- fix: Memory leaks in chart components resolved

### Security
- Updated all dependencies to latest secure versions
- Implemented CSP headers for XSS protection

## [1.1.0] - 2024-01-02

### Added
- feat: Kanban board with drag-and-drop functionality
- feat: Real-time task status updates via WebSocket
- feat: Advanced filtering for tasks by status, owner, and tags
- feat: Automated testing pipeline with Vitest and Testing Library
- feat: Comprehensive accessibility improvements (WCAG 2.1 AA)

### Changed
- refactor: Migrated from Pages Router to App Router (Next.js 14)
- style: Implemented responsive design for tablet and mobile
- docs: Added comprehensive component documentation with Storybook

### Fixed
- fix: Dashboard loading performance improved by 40%
- fix: Date formatting issues in Norwegian locale
- fix: Chart tooltips now display correctly on touch devices

### Deprecated
- Legacy API endpoints will be removed in version 2.0.0

## [1.0.0] - 2023-12-15

### Added
- feat: Initial dashboard implementation with KPI cards
- feat: Project overview with phase tracking and milestones
- feat: Team information and contact details display
- feat: Basic roadmap timeline with Now/Next/Later phases
- feat: Changelog integration from CHANGELOG.md file
- feat: Tech stack visualization with categorized badges
- feat: Architecture Decision Records (ADR) listing and display
- feat: Risk management with probability/impact matrix
- feat: Environment status monitoring and deployment info
- feat: Requirements tracking with acceptance criteria
- feat: Service Level Objectives (SLO) monitoring
- feat: Glossary terms with definitions and cross-references
- feat: External links management for project resources

### Technical
- Next.js 14 with App Router and TypeScript
- Tailwind CSS with custom Nordic design system
- Comprehensive test suite with 95%+ coverage
- ESLint and Prettier configuration for code quality
- Husky pre-commit hooks for quality gates
- Internationalization support (Norwegian/English)

### Security
- Implemented secure headers and CSP
- Input validation and sanitization
- Dependency vulnerability scanning

## [0.9.0] - 2023-12-01

### Added
- feat: Project setup with Next.js 14 and TypeScript
- feat: Basic component library with Nordic design tokens
- feat: Data layer architecture with JSON file support
- feat: Initial routing structure and navigation

### Technical
- Project scaffolding and development environment setup
- CI/CD pipeline configuration with GitHub Actions
- Docker containerization for consistent deployments
- Development documentation and contributing guidelines

## [0.1.0] - 2023-11-15

### Added
- Initial project conception and requirements gathering
- Technology stack evaluation and selection
- Team formation and role assignments
- Project charter and success criteria definition