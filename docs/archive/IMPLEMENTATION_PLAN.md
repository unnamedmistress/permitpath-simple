# PermitPath Implementation Plan

## Overview
Complete redesign of PermitPath based on VISION.md, PRD.md, and ARCHITECTURE.md

## Phase 1: MVP Features

### 1. Smart Requirements Engine
- AI-powered requirements matching using OpenAI
- Natural language job description → structured requirements
- Confidence scoring for requirements
- Cached requirements database

### 2. Job Creation Wizard (Redesigned)
- 5-7 question wizard
- Address autocomplete
- Job type selection with smart recommendations
- Requirements preview

### 3. Document Management
- Document upload with validation
- OCR for document parsing
- Expiration date extraction
- Document status tracking

### 4. Permit Status Tracking
- Manual status updates
- Timeline view
- Inspection scheduling
- Notifications

### 5. User System (Lightweight)
- Simple account creation
- Job history
- Business profile

## Technical Implementation

### Frontend (React + Vite)
1. Redesign UI components
2. New job wizard
3. Requirements display
4. Document upload
5. Status tracking dashboard

### Backend (Node.js + Express)
1. API routes
2. OpenAI integration
3. Database models
4. File upload handling

### Database (PostgreSQL via Supabase)
1. User tables
2. Job/Permit tables
3. Requirements cache
4. Document metadata

## Implementation Order

1. Database schema setup
2. Backend API foundation
3. Frontend components
4. AI integration
5. Testing & QA

## Files to Create/Modify

### New Files
- src/services/ai.ts - OpenAI integration
- src/services/requirements.ts - Requirements engine
- src/components/wizard/SmartWizard.tsx - New job wizard
- src/components/requirements/RequirementsDisplay.tsx
- src/components/documents/DocumentUploader.tsx
- src/components/dashboard/StatusTracker.tsx
- supabase/schema.sql - Database schema
- api/ - Backend API routes

### Modified Files
- src/App.tsx - New routing
- src/pages/NewJobPage.tsx - Complete redesign
- src/pages/WizardPage.tsx - Enhanced with AI
- src/hooks/useJob.ts - Extended functionality
- src/types/index.ts - Updated types
