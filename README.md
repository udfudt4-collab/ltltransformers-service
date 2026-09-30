# Transformer Hub

Enterprise Transformer Management Portal (EDL & LTL)

Project Objective

Develop a modern, secure, enterprise-grade web application for LTL to collect, manage, review, analyze, and report transformer-related data submitted by EDL Provincial/Division Offices.

This application is not an internal LTL system.

LTL is the platform owner and administrator.

EDL users are LTL's customers who will log in and submit monthly operational data.

The application should be designed with enterprise architecture, clean code, scalability, and security in mind.

Development Strategy

Develop the project in phases.

Phase 1

Build the complete frontend.

Use mock services and mock data.

No database.

No backend.

No authentication server.

Simulate API responses.

Everything should be designed so that replacing mock services with real APIs later requires minimal changes.

Phase 2

Develop the backend REST APIs.

Phase 3

Design the database after frontend approval.

Technology Stack

Frontend

React 19

Vite

TypeScript

Tailwind CSS

shadcn/ui

React Router

TanStack Query

React Hook Form

Zod

Axios

Recharts

Framer Motion

Lucide Icons

PWA Ready

Responsive Design

Dark Mode

Light Mode

Backend (Future)

Node.js

Express.js

TypeScript

REST API

JWT Authentication

Refresh Tokens

Role Based Access Control

Swagger Documentation

Excel Export

Audit Logging

File Upload Support

Email Notification Ready

Docker Ready

Database (Later)

Do NOT create the database now.

Design the application in a way that the database can be planned after the frontend is finalized.

Business Workflow

The application serves two organizations.

Organization 1

LTL

Platform Owner

Administrator

Can monitor all EDL offices.

Organization 2

EDL

Customer

Each Province/Division has its own login.

They submit operational data every month.

User Roles

EDL User

Represents one province/division.

Can

Login

Change Password

View Dashboard

Submit Monthly Data

Save Draft

Edit Draft

Submit Final Data

View Own Submission History

View Own Reports

Receive Notifications

Cannot

View other provinces

Access administrator pages

Manage users

Delete finalized records

LTL Administrator

Owns the system.

Can

View all provinces

Review submissions

Search everything

Compare provinces

Edit records

Return submissions for correction

Approve submissions

Lock monthly submissions

Unlock submissions

Generate reports

Export Excel

Export PDF

Dashboard Analytics

User Management

Password Reset

Audit Logs

System Settings

Login Accounts

Each EDL Province gets a separate account.

Examples

EDL-NCP

EDL-NP

EDL-NWP-1

EDL-NWP-2

EDL-CC

EDL-CP-1

EDL-CP-2

EDL-WPN

EDL-EP

EDL-WPS-2

EDL-UVA

EDL-SABARAGAMUWA

EDL-WPS-1

EDL-SP-1

EDL-SP-2

Administrator

LTL Admin

Monthly Workflow

Every month

EDL logs in

↓

Enters monthly data

↓

Saves Draft

↓

Reviews

↓

Clicks Submit

↓

LTL receives notification

↓

LTL reviews

↓

Approve

OR

Return for correction

↓

After approval

Month can be locked

Submission Status

Every module should support

Draft

Submitted

Under Review

Returned

Approved

Locked

Display status badges everywhere.

Modules

Dashboard

Different dashboards for each role.

EDL Dashboard

Cards

Current Month Status

Pending Forms

Submitted Forms

Approval Status

Last Submission

Notifications

Charts

Submission Trend

Failure Trend

Feedback Trend

Quick Actions

LTL Dashboard

Executive Dashboard

Cards

Total Provinces

Submitted

Pending

Approved

Returned

Locked

Current Stock

Transformer Failures

Forecast Requirements

Average Feedback Score

Charts

Province Comparison

Submission Trend

Failure Trend

Stock Distribution

Transformer Ratings

Forecast Trend

Feedback Analytics

Top Issues

Latest Activities

Recent Login

Pending Reviews

Module 1

Transformer Stock

Fields

Month

Year

Transformer Rating

Quantity

Features

Multiple Rows

Add

Edit

Delete

Search

Filter

Validation

Draft Save

Submit

Module 2

Transformer Issued

Same UI

Rating

Quantity

Month

Year

Validation

Module 3

Transformer Failure

Fields

Serial Number

Transformer Capacity

Date of Failure

Failure Cause

Remarks

Status

Features

Search

Filter

Table

Form

Validation

History

Module 4

Customer Feedback

Dynamic Questionnaire

Rating

Comments

Charts

Average Rating

Pie Chart

Bar Chart

Trend

Statistics

Module 5

Transformer Requirements

Filled once every 3 months.

Fields

Forecast Month

Transformer Rating

Quantity

Forecast Summary

Reports

Administrator

Monthly Report

Province Report

Failure Report

Transformer Rating Report

Forecast Report

Feedback Report

Summary Report

Export Buttons

Excel

PDF

CSV

Search

Global Search

Search by

Province

Serial Number

Transformer Rating

Month

Failure

Remarks

Filters

Province

Month

Year

Status

Rating

Failure Type

User Management

Administrator

Create User

Disable User

Reset Password

Assign Province

Edit User

Unlock User

Notifications

Dashboard Alerts

Pending Submission

Submission Returned

Submission Approved

Forecast Due

Password Expiry

System Announcement

Audit Logs

Track

Login

Logout

Submission

Approval

Correction

Export

Password Reset

User Creation

Record Update

Include

Date

Time

User

Province

IP

Browser

Action

Frontend Requirements

Use feature-based architecture.

Do not create huge components.

Keep every page modular.

Create reusable

Tables

Forms

Cards

Dialogs

Charts

Buttons

Inputs

Dropdowns

Date Pickers

Badges

Breadcrumbs

Loaders

Pagination

Search Components

Filter Panels

Confirmation Dialogs

Toast Notifications

Empty States

Skeleton Loaders

Error Pages

UI/UX

The UI should resemble a premium enterprise SaaS application.

Requirements

Modern

Minimal

Professional

Responsive

Fast

Accessible

Keyboard Friendly

Consistent

Suitable for utility companies and government organizations.

Avoid flashy designs.

Use a clean corporate style.

Mobile Compatibility

Fully responsive.

Desktop

Laptop

Tablet

Android

iPhone

Navigation should automatically adapt.

Forms should be mobile-friendly.

Tables should become responsive cards on smaller screens where appropriate.

Mock Services

Do not hardcode data inside components.

Create a dedicated service layer.

Example

services/

auth.service.ts

dashboard.service.ts

stock.service.ts

issued.service.ts

failure.service.ts

feedback.service.ts

requirements.service.ts

report.service.ts

user.service.ts

Each service should simulate API requests with Promise delays.

Later these services will be replaced with real backend APIs.

Mock Data

Store separately.

mock/

dashboard.ts

users.ts

stock.ts

issued.ts

failure.ts

feedback.ts

requirements.ts

reports.ts

notifications.ts

Backend Planning (Do Not Build Yet)

When Phase 2 begins

Build

REST APIs

JWT Authentication

Refresh Tokens

Role Permissions

Validation

Swagger

Excel Export

Audit Logs

Docker

Environment Config

Email Service

File Upload

Logging

Caching

Pagination

Filtering

Search

Database Planning (Later)

Do not create database now.

Once frontend is finalized,

Then design

ER Diagram

Tables

Relationships

Indexes

Constraints

Optimized schema

Coding Standards

Strict TypeScript

Clean Architecture

SOLID Principles

Reusable Components

ESLint

Prettier

Meaningful Folder Structure

No duplicated code

Well-commented where necessary

Deliverables

The result should be a production-quality frontend prototype that includes:

Login UI

Role-based dashboards

Complete navigation

All data entry modules

Reports section

Search and filters

Responsive layouts

Mobile support

Mock authentication

Mock APIs

Loading and error states

Professional UI/UX

Reusable component library

Clean project architecture

The application must be designed so that, after frontend approval, the backend APIs and database can be integrated without changing the UI architecture.
## About Lanka Transformers Limited (LTL) Portal

The LTL Transformer Management Portal is an enterprise-grade web application for consolidating, reviewing, and analyzing monthly transformer operations across EDL provincial offices.


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
