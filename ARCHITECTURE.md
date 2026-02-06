# PermitPath Architecture Document

## 1. System Overview

**Description**: PermitPath is an AI-powered permit documentation platform aimed at simplifying the workflow for contractors in Pinellas County, Florida. The core functionalities include permit application, document validation, and inspection scheduling, leveraging AI to enhance efficiency.

**Architecture**:
- **Frontend**: Developed with React and Vite, utilizing component-based architecture for modularity and reusability.
- **Backend**: A lightweight Node.js Express server for managing AI features and interactions.
- **Database**: PostgreSQL for structured data and Redis for caching frequently accessed information.
- **AI Integration**: Utilizing OpenAI APIs for natural language processing and document validation processes.
- **Storage**: S3-compatible storage solutions for document management.

## 2. Tech Stack Recommendations

- **Frontend**:
  - Current: React + Vite
  - Recommendation: Consider integrating advanced state management tools like Redux or Zustand for complex state handling. Leverage Tailwind CSS for design consistency and easy theming.

- **Backend**:
  - Recommended: Node.js with Express for a lightweight setup, GraphQL for efficient data querying, and WebSockets for real-time updates.

- **Database**:
  - Recommended: PostgreSQL as a robust, reliable choice for managing relational data.
  - Redis: To be used for caching and state management to improve response times.

- **AI**:
  - OpenAI's API: For document validation and generating insights based on permit requirements and historical data.

- **Storage**:
  - S3-compatible storage: Recommended for storing permit documents securely and scalably.

## 3. Data Models

- **User/Contractor**: Model includes the user's basic information, roles, and permissions.

- **Job/Permit**: Includes the job type, status, dates, and associated user/contractor info.

- **Requirements**: Encompasses specific permit requirements identified by the Smart Requirements Engine.

- **Documents**: Metadata and storage paths for documents uploaded and generated within the system.

- **Inspections**: Scheduling, results, and follow-up actions.

## 4. Component Architecture

- **Frontend Components**
  - Use component libraries like Radix UI for consistent UI patterns.
  - Modularize UI components for reuse and reusability across different pages and flows.

- **State Management**
  - Incorporate React Query or alternative data-fetching libraries to manage server-state.

- **API Layer Design**
  - Organize API calls in a service layer, separating logic from presentation.

## 5. AI Integration Architecture

- **Smart Requirements Engine**
  - Develop a question-driven interface to interactively gather project-specific requirements.
  - Validate and map user responses to code requirements using AI models.

- **Document Validation Pipeline**
  - Use AI to validate key document aspects before submission.
  - Automate checks for compliance, ensuring requirements are met.

- **Caching Strategy for AI Calls**
  - Cache responses from AI for previously answered questions to improve speed and reduce costs.

## 6. Security & Privacy

- **Data Handling**
  - Ensure encryption at rest and in transit to protect sensitive contractor information.

- **Document Security**
  - Implement access logs and permission controls to secure document access.

- **Compliance**
  - Adhere to SOC 2 Type II requirements and Florida's data retention laws.

## 7. Scalability Plan

- **Growth Handling**
  - Plan for horizontal scaling through cloud-based services to manage increasing load efficiently.

- **Caching Strategy**
  - Extended use of Redis to cache common database queries and API calls.

- **Database Scaling**
  - Use read replicas and partitioning strategies for scaling PostgreSQL.

## 8. Implementation Phases

- **Phase 1 (MVP)**
  - Focus on core job types: Roofing, HVAC, and Electrical permits.
  - Implement the Smart Requirements Engine and core lifecycle tracking features first.

- **Phase 2**
  - Expand to include plumbing and additional areas, enhancing AI features based on user feedback.
  - Integrate deeper with local jurisdictions for real-time updates.

- **Technical Dependencies**
  - Ensure initial integration with authentication and user management systems is solid to avoid rework.

The architecture aims to provide a clear development path while prioritizing scalability and compliance to facilitate a seamless contractor experience in PermitPath.