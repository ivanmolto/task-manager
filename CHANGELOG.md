# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-20

### Frontend

- Next.js 16 App Router implementation with protected layout groups
- Responsive UI built with Tailwind CSS and Mantine components
- Global client-side state management using Zustand
- Server-side state, caching, and mutation handling via TanStack Query
- Type-safe form validation using React Hook Form and Zod
- Custom abstracted React hooks (`useAuth`, `useTasks`) for clean API interaction

### Backend & Microservices

- API Gateway pattern to centralize validation, logging, and routing
- TCP microservice communication between Gateway, Auth, and Task services
- User authentication with JWT (access + refresh tokens)
- Refresh token rotation mechanism for enhanced session security
- Full Task CRUD operations with pagination, keyword search, and status filtering
- Dynamic task sorting by creation date and completion status
- Swagger API documentation generated automatically

### Infrastructure & DevOps

- Docker Compose configuration for seamless local orchestration
- Optimized multi-stage Docker builds for Next.js using `standalone` output
- PostgreSQL database integrated via Prisma ORM
- Redis implementation for API rate limiting

### Testing

- End-to-End (E2E) testing suite implemented using Playwright
- Automated user journey tests for authentication flows and dashboard rendering
- Secure test credential injection via environment variables
- Unit tests

### Security

- bcrypt password hashing implementation
- JWT validation secured by NestJS global guards
- Rate limiting applied per API endpoint
- CORS configuration and Helmet security headers enabled
