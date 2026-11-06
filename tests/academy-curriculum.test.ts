import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  CLASS_CURRICULA,
  CLASS_10_CURRICULUM,
  CLASS_11_CURRICULUM,
  CLASS_12_CURRICULUM,
} from "../src/lib/junior/curriculum-data";

import {
  ACADEMIC_FORMULA_REGISTRY,
  queryFormulaRegistry,
} from "../src/lib/junior/formula-library-data";

import {
  CONCEPT_REGISTRY,
  queryConceptRegistry,
} from "../src/lib/junior/concept-library-data";

import {
  DIAGRAM_SIMULATION_CATALOGUE,
} from "../src/lib/junior/diagram-lab-data";

import {
  PRACTICE_QUESTION_BANK,
} from "../src/components/junior/PracticeArenaHub";

import {
  MOCK_TESTS_CATALOGUE,
} from "../src/components/junior/TestCentreHub";

import {
  calculateStudentRank,
} from "../src/lib/junior/academy-models";

describe("THE UNWRITTEN — The Academy 2.0 Academic Curriculum Engine", () => {
  describe("1. Academic Structure & Class Independence", () => {
    test("Supports three independent academic levels: Class 10, 11, and 12", () => {
      assert.ok(CLASS_CURRICULA[10], "Class 10 curriculum must be registered");
      assert.ok(CLASS_CURRICULA[11], "Class 11 curriculum must be registered");
      assert.ok(CLASS_CURRICULA[12], "Class 12 curriculum must be registered");
      assert.equal(CLASS_10_CURRICULUM.level, 10);
      assert.equal(CLASS_11_CURRICULUM.level, 11);
      assert.equal(CLASS_12_CURRICULUM.level, 12);
    });

    test("CBSE Class 10 supports distinct Mathematics Standard (041) and Mathematics Basic (241) tracks", () => {
      const cbseSubjects = CLASS_10_CURRICULUM.boardVariants.CBSE.subjects;
      const mathStandard = cbseSubjects.find((s) => s.code === "041");
      const mathBasic = cbseSubjects.find((s) => s.code === "241");

      assert.ok(mathStandard, "Class 10 CBSE must include Math Standard (Code 041)");
      assert.ok(mathBasic, "Class 10 CBSE must include Math Basic (Code 241)");
      assert.notEqual(mathStandard.id, mathBasic.id, "Math Standard and Basic must be distinct subject tracks");
      assert.equal(mathStandard.theoryMarks, 80);
      assert.equal(mathBasic.theoryMarks, 80);
      assert.ok(mathStandard.chapters.length >= 10, "Math Standard must have complete chapters");
      assert.ok(mathBasic.chapters.length >= 10, "Math Basic must have complete chapters");
    });

    test("Class 10 includes core secondary subjects (Science, Social Science, English, IT)", () => {
      const cbseSubjects = CLASS_10_CURRICULUM.boardVariants.CBSE.subjects;
      const science = cbseSubjects.find((s) => s.code === "086");
      const sst = cbseSubjects.find((s) => s.code === "087");
      const english = cbseSubjects.find((s) => s.code === "184");
      const it = cbseSubjects.find((s) => s.code === "402");

      assert.ok(science, "Science 086 must exist");
      assert.ok(sst, "Social Science 087 must exist");
      assert.ok(english, "English 184 must exist");
      assert.ok(it, "Information Technology 402 must exist");
    });

    test("Class 11 & 12 support Science, Commerce, and Arts/Humanities streams", () => {
      for (const lvl of [11, 12] as const) {
        const curr = CLASS_CURRICULA[lvl];
        assert.ok(curr.streams.science, `Class ${lvl} Science stream must exist`);
        assert.ok(curr.streams.commerce, `Class ${lvl} Commerce stream must exist`);
        assert.ok(curr.streams.arts, `Class ${lvl} Arts stream must exist`);
        assert.ok(curr.streams.science.subjects.length >= 3, `Class ${lvl} Science has subjects`);
        assert.ok(curr.streams.commerce.subjects.length >= 3, `Class ${lvl} Commerce has subjects`);
        assert.ok(curr.streams.arts.subjects.length >= 3, `Class ${lvl} Arts has subjects`);
      }
    });

    test("Maharashtra State Board (MSBSHSE) variants are configured for all levels", () => {
      for (const lvl of [10, 11, 12] as const) {
        const curr = CLASS_CURRICULA[lvl];
        assert.ok(curr.boardVariants.MSBSHSE, `MSBSHSE variant must exist for Class ${lvl}`);
        assert.equal(curr.boardVariants.MSBSHSE.boardId, "MSBSHSE");
      }
    });
  });

  describe("2. Formula Registry 12 Mandatory Specifications", () => {
    test("Every formula record satisfies all 12 mandatory specification fields", () => {
      assert.ok(ACADEMIC_FORMULA_REGISTRY.length >= 10, "Registry must contain at least 10 core formulas");

      for (const formula of ACADEMIC_FORMULA_REGISTRY) {
        // 1. Identification & Naming
        assert.ok(formula.id && formula.id.length > 0, `Formula ${formula.id} must have an ID`);
        assert.ok(formula.name && formula.name.length > 0, `Formula ${formula.id} must have a name`);

        // 2. Mathematical LaTeX String
        assert.ok(formula.latexExpression && formula.latexExpression.length > 0, `Formula ${formula.id} must have latexExpression`);

        // 3. Symbol Definitions with SI Units
        assert.ok(
          Array.isArray(formula.symbols) && formula.symbols.length > 0,
          `Formula ${formula.id} must have symbols`
        );
        for (const sym of formula.symbols) {
          assert.ok(sym.symbol, `Symbol in ${formula.id} must have a symbol character`);
          assert.ok(sym.meaning, `Symbol in ${formula.id} must have a meaning`);
          assert.ok(sym.siUnit, `Symbol in ${formula.id} must specify an SI unit or dimensionless`);
        }

        // 4. Master Output SI Unit
        assert.ok(formula.outputUnit, `Formula ${formula.id} must have outputUnit`);

        // 5. Conditions & Assumptions
        assert.ok(
          Array.isArray(formula.applicabilityConditions) && formula.applicabilityConditions.length > 0,
          `Formula ${formula.id} must have applicabilityConditions`
        );

        // 6. Related Concepts
        assert.ok(
          Array.isArray(formula.relatedConcepts) && formula.relatedConcepts.length > 0,
          `Formula ${formula.id} must have relatedConcepts`
        );

        // 7. Derivation Summary
        assert.ok(
          formula.derivationSummary && formula.derivationSummary.length > 20,
          `Formula ${formula.id} must have a derivationSummary`
        );

        // 8. Solved Numerical Example
        assert.ok(formula.solvedExample, `Formula ${formula.id} must have a solvedExample`);
        assert.ok(formula.solvedExample.problemStatement, `Example in ${formula.id} must have problemStatement`);
        assert.ok(
          Array.isArray(formula.solvedExample.givenData) && formula.solvedExample.givenData.length > 0,
          `Example in ${formula.id} must have givenData`
        );
        assert.ok(
          Array.isArray(formula.solvedExample.stepByStepSolution) && formula.solvedExample.stepByStepSolution.length > 0,
          `Example in ${formula.id} must have stepByStepSolution`
        );
        assert.ok(formula.solvedExample.finalAnswer, `Example in ${formula.id} must have finalAnswer`);

        // 9. Common Student Mistakes
        assert.ok(
          Array.isArray(formula.commonMistakes) && formula.commonMistakes.length > 0,
          `Formula ${formula.id} must document commonMistakes`
        );

        // 10. Exam Question Types
        assert.ok(
          Array.isArray(formula.examQuestionTypes) && formula.examQuestionTypes.length > 0,
          `Formula ${formula.id} must list typical examQuestionTypes`
        );

        // 11. Difficulty
        assert.ok(
          ["Easy", "Medium", "Hard"].includes(formula.difficulty),
          `Formula ${formula.id} difficulty must be Easy, Medium, or Hard`
        );

        // 12. Syllabus Reference
        assert.ok(formula.syllabusReference && formula.syllabusReference.length > 0, `Formula ${formula.id} must have syllabusReference`);
      }
    });

    test("queryFormulaRegistry correctly filters by class level, subject, and search term", () => {
      const class10Formulas = queryFormulaRegistry({ classLevel: 10 });
      assert.ok(class10Formulas.length > 0, "Must return Class 10 formulas");
      assert.ok(class10Formulas.every((f) => f.classLevel === 10));

      const mathFormulas = queryFormulaRegistry({ subjectSlug: "c10-math-standard" });
      assert.ok(mathFormulas.length > 0, "Must return Mathematics formulas");
      assert.ok(mathFormulas.every((f) => f.subjectSlug === "c10-math-standard"));

      const searchResults = queryFormulaRegistry({ searchTerm: "Ohm" });
      assert.ok(searchResults.length > 0, "Must find Ohm's law");
      assert.ok(searchResults.some((f) => f.name.includes("Ohm")));
    });
  });

  describe("3. Concept Library Dual-Tier Rigor", () => {
    test("Every concept has simple analogy, exam-level rigor, misconceptions, and check questions", () => {
      assert.ok(CONCEPT_REGISTRY.length >= 4, "Must have concept definitions");

      for (const concept of CONCEPT_REGISTRY) {
        assert.ok(concept.id, "Concept must have ID");
        assert.ok(concept.conceptTitle, "Concept must have conceptTitle");
        assert.ok(concept.simpleExplanation.length > 30, `Concept ${concept.id} must have simple explanation`);
        assert.ok(concept.examLevelExplanation.length > 30, `Concept ${concept.id} must have exam-level explanation`);
        assert.ok(concept.prerequisites.length > 0, `Concept ${concept.id} must list prerequisites`);
        assert.ok(concept.keyDefinitions.length > 0, `Concept ${concept.id} must list keyDefinitions`);
        for (const def of concept.keyDefinitions) {
          assert.ok(def.term, "Definition must have term");
          assert.ok(def.definition, "Definition must have explanation");
        }
        assert.ok(concept.misconceptions.length > 0, `Concept ${concept.id} must list misconceptions`);
        for (const misc of concept.misconceptions) {
          assert.ok(misc.trap, "Misconception must document student trap");
          assert.ok(misc.truth, "Misconception must document scientific truth");
        }
        assert.ok(concept.practiceQuestion, `Concept ${concept.id} must have practiceQuestion`);
        assert.ok(concept.practiceQuestion.options.length >= 4, "Practice question must have at least 4 options");
        assert.ok(concept.practiceQuestion.correctKey, "Practice question must have correct key");
      }
    });

    test("queryConceptRegistry filters by class and keyword correctly", () => {
      const c10Concepts = queryConceptRegistry({ classLevel: 10 });
      assert.ok(c10Concepts.length > 0, "Must return Class 10 concepts");
      assert.ok(c10Concepts.every((c) => c.classLevel === 10));

      const refractionSearch = queryConceptRegistry({ searchTerm: "refraction" });
      assert.ok(refractionSearch.length > 0, "Must find refraction concept");
      assert.ok(refractionSearch.some((c) => c.id === "c-c10-light-refraction"));
    });
  });

  describe("4. Diagram Visualisation Lab", () => {
    test("All 7 required interactive simulations exist across Math, Physics, Chem, Bio, and SST", () => {
      const simIds = DIAGRAM_SIMULATION_CATALOGUE.map((s) => s.id);
      assert.ok(simIds.includes("sim-math-unit-circle"), "Unit circle simulation must exist");
      assert.ok(simIds.includes("sim-physics-ray-optics"), "Convex lens simulation must exist");
      assert.ok(simIds.includes("sim-physics-projectile"), "Projectile simulation must exist");
      assert.ok(simIds.includes("sim-physics-dc-circuit"), "DC circuit simulation must exist");
      assert.ok(simIds.includes("sim-chem-vsepr"), "VSEPR simulation must exist");
      assert.ok(simIds.includes("sim-bio-cell-architecture"), "Cell organelle simulation must exist");
      assert.ok(simIds.includes("sim-humanities-timeline"), "National movement timeline must exist");
    });

    test("Every simulation specifies parameter controls with valid numerical ranges", () => {
      for (const sim of DIAGRAM_SIMULATION_CATALOGUE) {
        assert.ok(sim.parameters.length > 0, `Simulation ${sim.id} must have interactive parameters`);
        for (const p of sim.parameters) {
          assert.ok(p.id, "Parameter must have an ID");
          assert.ok(p.name, "Parameter must have a name");
          assert.ok(p.min < p.max, `Parameter ${p.id} min must be less than max`);
          assert.ok(p.defaultValue >= p.min && p.defaultValue <= p.max, `Default value within bounds`);
        }
      }
    });
  });

  describe("5. Practice Arena & Mock Test Blueprints", () => {
    test("Practice question bank covers Class 10, 11, and 12 with hints and step solutions", () => {
      assert.ok(PRACTICE_QUESTION_BANK.length >= 5, "Question bank must contain questions");

      const classesInBank = new Set(PRACTICE_QUESTION_BANK.map((q) => q.classLevel));
      assert.ok(classesInBank.has(10), "Question bank covers Class 10");
      assert.ok(classesInBank.has(11), "Question bank covers Class 11");
      assert.ok(classesInBank.has(12), "Question bank covers Class 12");

      for (const q of PRACTICE_QUESTION_BANK) {
        assert.ok(q.prompt && q.prompt.length > 10, "Question must have prompt");
        assert.ok(q.options && q.options.length === 4, "Question must have 4 options");
        assert.ok(["A", "B", "C", "D"].includes(q.correctKey), "Valid correctKey");
        assert.ok(Array.isArray(q.hints) && q.hints.length >= 2, "Question must have progressive hints");
        assert.ok(q.stepByStepSolution && q.stepByStepSolution.length > 20, "Step by step solution must be provided");
      }
    });

    test("Mock test catalogue configures authentic exam schemes (CBSE board vs entrance marking)", () => {
      assert.ok(MOCK_TESTS_CATALOGUE.length >= 3, "Mock tests catalogue must be populated");

      const jeeTest = MOCK_TESTS_CATALOGUE.find((t) => t.boardOrExam === "JEE");
      assert.ok(jeeTest, "JEE mock test must exist");
      assert.equal(jeeTest.markingScheme.correct, 4, "JEE correct answer must award +4");
      assert.equal(jeeTest.markingScheme.incorrect, -1, "JEE incorrect answer must penalize -1");

      const cbseTest = MOCK_TESTS_CATALOGUE.find((t) => t.boardOrExam === "CBSE");
      assert.ok(cbseTest, "CBSE mock test must exist");
      assert.equal(cbseTest.markingScheme.correct, 1, "CBSE correct answer awards +1");
      assert.equal(cbseTest.markingScheme.incorrect, 0, "CBSE incorrect answer has 0 negative penalty");
    });
  });

  describe("6. Learning Progression & Scholar Ranking", () => {
    test("calculateStudentRank correctly scales title and rank level with earned XP", () => {
      const novice = calculateStudentRank(50);
      assert.equal(novice.level, 1);
      assert.equal(novice.title, "Novice Scholar");

      const apprentice = calculateStudentRank(250);
      assert.equal(apprentice.level, 2);
      assert.equal(apprentice.title, "Axiom Apprentice");

      const investigator = calculateStudentRank(500);
      assert.equal(investigator.level, 3);
      assert.equal(investigator.title, "Theorem Investigator");

      const fellow = calculateStudentRank(1200);
      assert.equal(fellow.level, 4);
      assert.equal(fellow.title, "Senior Fellow of Logic");

      const grandMaster = calculateStudentRank(2500);
      assert.equal(grandMaster.level, 5);
      assert.equal(grandMaster.title, "Grand Master of Deduction");
    });
  });
});
