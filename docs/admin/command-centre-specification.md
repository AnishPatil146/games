# Admin Portal & Command Centre Specification

## 1. Operational Overview
The Command Centre (`/admin`) serves as the administrative cockpit for THE UNWRITTEN. Protected by session credentials and allowlist verification, it monitors live player engagement across Solo, Multiplayer, and Junior modes.

## 2. Key Modules
1. **Executive Dashboard (`/admin/dashboard`)**:
   - Platform KPIs: Landing Visits, Participants, Senior vs Junior Runs, Completion Rates, Mean Junior Scores.
   - Stream & Subject breakdown tables.
   - Recent attempts feed with real-time status and participant drill-down.
   - Subsystem Health indicators (Solo, Alliance, Junior Mode).
   - Live MathRenderer Telemetry verification preview.
2. **Participant Intelligence (`/admin/participants`)**:
   - Searchable, filterable list of voluntary and anonymous participants.
   - Longitudinal player timeline, decision history, and privacy deletion controls.
3. **Question Bank Explorer (`/admin/questions`)**:
   - Complete 1,400-question audit table across 14 subjects.
   - Filter by Class, Stream, Subject, Difficulty, and Syllabus Chapter.
4. **Multiplayer Room Monitor (`/admin/sessions`)**:
   - Active room codes, connected players, current chamber, countdown timers, and betrayal statistics.
