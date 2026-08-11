---
name: admin-saas-management
description: Guidelines for managing SaaS subscriptions, school provisioning, and billing in School-Management-Admin
---

# Admin SaaS Management Skill

Guidelines for building features in `School-Management-Admin`:

- Subscription Plans: Sync monthly/yearly limits with `max_students_limit` and `max_buses_limit`.
- Billing & Invoices: Format currency in INR (`₹`) and handle invoice PDF print views.
- School Onboarding: Auto-generate default school credentials (`code`, `password`) upon school creation.
