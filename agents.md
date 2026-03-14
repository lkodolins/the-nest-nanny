# The Nest Nanny — Agents & Services

## Development Agent
- **Claude Code (Opus 4.6)** — Primary development agent building the full-stack platform

## Platform Agents & Services

### Payment Processing
- **Stripe Connect** — Escrow payments, nanny payouts, platform fee collection
- **Stripe Billing** — Family Premium (€29/mo) and Nanny Standard (€9/mo) subscriptions
- **Stripe Webhooks** — Async event handling for payment confirmations, subscription changes

### Identity & Verification
- **Stripe Identity** — Government ID authentication + biometric face match for nanny onboarding
- **Background Check Providers** — Third-party criminal background check per country (TBD per market)
- **Reference Verification** — Admin-driven longform reference interviews (manual process supported by platform)

### Real-time Communication
- **Django Channels** — WebSocket server for real-time messaging between families and nannies
- **Redis** — Channel layer for Django Channels, Celery broker, session/cache store

### Background Task Workers
- **Celery Workers** — Async task processing:
  - Email sending (registration verification, booking confirmations, payment receipts)
  - Notification dispatch (in-app, push)
  - Verification status polling
  - Rating/review aggregation
  - Subscription renewal checks
- **Celery Beat** — Scheduled tasks:
  - Nanny verification expiry checks (annual background check renewal)
  - Certification validity monitoring
  - Stale booking cleanup
  - Analytics aggregation

### Search & Location
- **PostGIS** — Geospatial queries for location-based nanny search
- **PostgreSQL Full-Text Search** — Profile text search across bios, specializations, certifications

## Future Integrations (Not Yet Implemented)
- Video call provider (for in-platform interviews)
- Push notification service (Firebase/OneSignal)
- Email delivery service (SendGrid/Postmark)
- CDN for media assets (CloudFront/Cloudflare)
- Monitoring & alerting (Sentry, Datadog)
