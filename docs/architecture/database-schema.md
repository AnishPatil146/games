# THE UNWRITTEN — Database & State Schema Specification

## 1. Storage Topology
THE UNWRITTEN employs a hybrid architecture:
- **Primary / Edge Persistence**: Vercel Postgres / Neon SQL Database (when `POSTGRES_URL` is configured).
- **Graceful Zero-Config Fallback**: File-based / Memory store (`PlatformStore`) preserving session integrity, telemetry events, and progress even in local or isolated deployment environments.

## 2. Relational Schema Architecture

```mermaid
erDiagram
    PARTICIPANTS ||--o{ SESSIONS : initiates
    SESSIONS ||--o{ EVENTS : records
    PARTICIPANTS ||--o{ JUNIOR_ATTEMPTS : submits
    JUNIOR_ATTEMPTS ||--o{ JUNIOR_RESPONSES : contains
    MULTIPLAYER_ROOMS ||--o{ ROOM_PLAYERS : joins

    PARTICIPANTS {
        string id PK
        string display_name
        string username
        boolean is_anonymous
        string ip_hash
        timestamp created_at
    }

    SESSIONS {
        string id PK
        string participant_id FK
        string mode
        string status
        int current_chapter
        timestamp started_at
        timestamp completed_at
    }

    EVENTS {
        string id PK
        string session_id FK
        int chapter
        string event_type
        jsonb event_data
        timestamp created_at
    }

    JUNIOR_ATTEMPTS {
        string id PK
        string participant_id FK
        string stream
        string subject_slug
        string difficulty_preference
        int score_out_of_10
        float accuracy_pct
        timestamp started_at
        timestamp completed_at
    }

    MULTIPLAYER_ROOMS {
        string code PK
        string host_id
        string status
        int current_level
        int time_remaining
        timestamp created_at
    }
```

## 3. Privacy & Data Governance
- Strict participant consent enforcement before storing names or usernames.
- IP addresses are salted and hashed (SHA-256) for audit trails and abuse mitigation without storing PII.
- Comprehensive GDPR/CCPA participant deletion endpoints supported in `/api/v1/admin/participants/[id]`.

