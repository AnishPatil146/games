# THE UNWRITTEN — System Architecture Specification

## 1. Executive Summary
THE UNWRITTEN is a high-performance web platform combining three distinct runtime experiences:
1. **The Solo Campaign — The Mind Experiment**: An 8-level illustrated mystery investigation where Aarav navigates high-stakes psychological escape rooms alone with server-authoritative puzzle validation.
2. **The Multiplayer Campaign — The Last Alliance**: A synchronous 2–4 player cooperative tactical experience with real-time room discovery, 9x9 Sudoku generation, 8x8 Chess against Count Vesper, and a live Prisoner's Dilemma betrayal matrix.
3. **Junior Mode — The Learning Arena**: A Maharashtra State Board (MSBSHSE) curriculum reasoning studio for Class 11 and Class 12 covering 14 subjects, 1,400 curated non-repeating questions, 3 difficulty tracks (Learn & Understand, Board Prep, Competitive Entrance: JEE, NEET, CUET, CLAT), and built-in LaTeX mathematical typesetting.

## 2. Platform Architecture
```mermaid
graph TD
    Client[Next.js 15 Client App] --> EdgeRouting[Edge Middleware & App Router]
    EdgeRouting --> SoloEngine[/solo - The Mind Experiment]
    EdgeRouting --> AllianceEngine[/alliance - The Last Alliance]
    EdgeRouting --> JuniorEngine[/junior - The Learning Arena]
    EdgeRouting --> AdminEngine[/admin - Command Centre]
    
    SoloEngine --> GameplayValidators[Gameplay Engine: Sudoku, Chess, Keypad, Maze]
    AllianceEngine --> MultiplayerStore[Multiplayer State Store & Room Manager]
    JuniorEngine --> QuestionBank[1,400 Subject Question Catalog]
    JuniorEngine --> MathRenderer[MathRenderer Engine]
    
    SoloEngine --> Telemetry[Telemetry & Session Storage]
    AllianceEngine --> Telemetry
    JuniorEngine --> Telemetry
    AdminEngine --> Telemetry
```

## 3. Core Subsystems
- **Frontend Layer**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS, Framer Motion, Lucide Icons.
- **Math Engine**: High-performance, self-contained `MathRenderer` providing full LaTeX syntax parsing, fractions, superscripts/subscripts, radicals, integrals, Greek letters, and matrices without external network latency.
- **Multiplayer Synchronous Engine**: In-memory and session-backed room coordinator with real-time state polling, server countdown timer (90s threshold), team solve synchronization, and 4-quadrant payoff resolution.
- **Academic Engine**: Class 11 & Class 12 curriculum partitioning, non-repeating cycle selector ensuring zero repetition across 100 questions per subject, and evidence-mapped qualitative ability bands.
- **Admin Command Centre**: Unified telemetry monitoring, participant dossier review, question catalogue audits, and live subsystem health checks.

