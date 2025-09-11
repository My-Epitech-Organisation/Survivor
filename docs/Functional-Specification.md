# Functional Specification Document: JEB Platform

## Overview

The JEB platform is designed to facilitate collaboration, resource sharing, and project management for founders, investors, partners, and administrators. This document outlines the key user journeys and functional requirements for the platform.

---

## User Roles

- **Founder**: Creates and manages projects, uploads documents, interacts with investors and partners.
- **Investor**: Searches for opportunities, reviews projects, communicates with founders.
- **Administrator**: Manages users, oversees platform health, audits activities.

The roles are distributed by the plateform's administrators.

---

## Key User Journeys

### 1. Founder Journey

#### a. Registration & Authentication

- Founder signs up via the registration form.
- Login using credentials.

#### b. Project Creation & Management

- Access dashboard after login.
- Create a new project: enter details, upload documents/media.
- Edit or delete existing projects.
- View project KPIs and analytics.

#### c. Document Management

- Upload files to drive (media, documents).
- Organize files by project.
- Share files with investors/partners.

#### d. Communication

- Send/receive messages to/from investors and partners.
- Receive notifications for project updates and investor interest.

---

### 2. Investor Journey

#### a. Registration & Authentication

- Investor signs up via the registration form.
- Login to access platform.

#### b. Opportunity Search & Review

- Use search filters to find projects by category, founder, etc.
- View project details.
- Express opinion on projects via likes, dislikes and shares.

#### c. Communication

- Initiate chat with founders.

---

### 4. Administrator Journey

#### a. Registration & Authentication

- Administrator signs up via the registration form.

#### b. User Management

- View, add, edit, or remove users (founders, investors, partners).
- Assign roles and permissions.

#### c. Project Management

- View, add, edit, or remove projects.

#### d. Event Management

- View, add, edit, or remove projects.

#### e. News Management

- View, add, edit, or remove projects.

#### f. Audit & Health Monitoring

- Access audit logs for user activities.
- Run health checks on backend services.
- Manage platform settings and security.

#### g. Platform overview

- Dashboard with the platform's stats

---

## Functional Requirements

- **Authentication**: Secure login, registration, password reset, and role-based access.
- **Project Management**: CRUD operations for projects, KPI tracking, media uploads.
- **Search & Filters**: Advanced search for projects, users, and opportunities.
- **Messaging**: Real-time chat and notifications between users.
- **File Management**: Upload, organize, and share files securely.
- **Admin Panel**: User management, audit logs, health checks.
- **API Exposure**: RESTful endpoints for frontend-backend communication.

---

## Non-Functional Requirements

- **Security**: Data encryption, secure authentication, audit logging.
- **Performance**: Fast search, efficient file handling, scalable architecture.
- **Usability**: Intuitive UI, clear navigation, responsive design.
- **Reliability**: Health checks, error handling, backup and recovery.

---

_This document is subject to updates as the platform evolves._
