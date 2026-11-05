# THE UNWRITTEN — Interface Specification

## 1. Primary User Journeys
1. **Homepage Universe Hub (`/`)**:
   - Masthead with direct links to Solo, Alliance, Junior, and Admin.
   - Cinematic hero with monograph artwork and ambient parallax motion.
   - 3 canonical pillar cards: Solo Mind Experiment, Multiplayer Alliance, Junior Learning Arena.
   - Architecture & privacy guarantees.

2. **Solo Stage Interface (`/solo`)**:
   - Fixed full-screen chiaroscuro artwork stage.
   - Top HUD bar: Hub button, Mode & Level Title, Dialogue Step Indicator, 5-Hints Modal button, Exit button, Audio Toggle.
   - Central character layer (Aarav alone).
   - Bottom dialogue speech balloon with speaker identifier and decision options.
   - Contextual Puzzle Overlay (Keypad, Three Doors, Memory Matrix, Mirror Maze, Interrogation, Bio-lab Dilemma, Emergency Dispatch, Final Codex).

3. **Multiplayer War Room Interface (`/alliance`)**:
   - Room creation (instant 6-character room code) & joining interface.
   - Synchronous squad lobby with avatar selection, presence indicator, and ready state toggling.
   - Synchronous chamber view with team progress pill, 90-second server countdown clock, and interactive puzzles (9x9 Sudoku, 8x8 Chessboard).
   - Betrayal Matrix & Prisoner's Dilemma resolution view.

4. **Junior Reasoning Studio (`/junior`)**:
   - Class 11 (FYJC) vs Class 12 (HSC) independent curriculum toggle.
   - Stream cards: Science, Commerce, Arts & Humanities.
   - Subject catalog showing code, chapter count, and unseen pool count.
   - Difficulty calibration: Easy (Learn & Understand), Medium (Board Prep), Hard (Competitive Entrance: JEE, NEET, CUET, CLAT), Mixed (Diagnostic).
   - Attempt execution with `<MathRenderer />` and instant feedback toggle.
   - Result monograph with ability indicators, chapter accuracy, verified answers, and syllabus citations.

