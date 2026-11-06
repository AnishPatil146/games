import test, { describe } from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import {
  PREREQUISITE_DEPENDENCY_GRAPH,
  getPrerequisitesForConcept,
  diagnoseFoundationalGaps,
} from "../src/lib/junior/prerequisite-engine";
import {
  evaluateFormulaDimensions,
  computeFormulaExplorerOutput,
} from "../src/lib/junior/formula-intelligence-engine";
import {
  evaluateStudentImprovement,
} from "../src/lib/junior/reassessment-engine";
import {
  MISTAKE_CATEGORY_LABELS,
  INITIAL_MISTAKE_NOTEBOOK,
  MistakeCategory,
} from "../src/lib/junior/mistake-notebook-engine";
import { validateAdminRecoverySecret } from "../src/lib/services/admin-auth-service";

describe("THE UNWRITTEN — Academy 3.0 Intelligence & Diagnostic Verification Suite", () => {
  // 1. MathRender & KaTeX formatting
  describe("1. KaTeX MathRender Engine", () => {
    test("Renders complex LaTeX expressions to HTML without throwing", () => {
      const expressions = [
        "E = h\\nu = \\frac{hc}{\\lambda}",
        "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        "\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)",
        "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
        "P V = n R T",
      ];

      for (const expr of expressions) {
        const rendered = katex.renderToString(expr, {
          throwOnError: false,
          displayMode: true,
        });
        assert.ok(rendered.includes("<span class=\"katex\">"), `Must render KaTeX root span for ${expr}`);
        assert.ok(!rendered.includes("KaTeX parse error"), `Must parse cleanly without error for ${expr}`);
      }
    });

    test("KaTeX strips surrounding delimiters ($$...$$ and $...$) gracefully", () => {
      const stripDelimiters = (raw: string) => {
        let clean = raw.trim();
        if (clean.startsWith("$$") && clean.endsWith("$$")) {
          clean = clean.slice(2, -2).trim();
        } else if (clean.startsWith("$") && clean.endsWith("$")) {
          clean = clean.slice(1, -1).trim();
        }
        return clean;
      };

      assert.equal(stripDelimiters("$$x^2 + y^2 = r^2$$"), "x^2 + y^2 = r^2");
      assert.equal(stripDelimiters("$F = m a$"), "F = m a");
      assert.equal(stripDelimiters("E = mc^2"), "E = mc^2");
    });
  });

  // 2. Prerequisite Weakness Detection DAG
  describe("2. Prerequisite Weakness Detection Engine", () => {
    test("Dependency graph contains valid prerequisites across multiple subjects", () => {
      assert.ok(PREREQUISITE_DEPENDENCY_GRAPH["concept-diff-rules"]);
      const derivPrereqs = getPrerequisitesForConcept("concept-diff-rules");
      assert.ok(derivPrereqs.some((p) => p.conceptId === "concept-limits"));
      assert.ok(derivPrereqs.some((p) => p.conceptId === "concept-functions-domain"));

      assert.ok(PREREQUISITE_DEPENDENCY_GRAPH["concept-projectile-motion"]);
      const projPrereqs = getPrerequisitesForConcept("concept-projectile-motion");
      assert.ok(projPrereqs.some((p) => p.conceptId === "concept-kinematics-1d"));
    });

    test("diagnoseFoundationalGaps correctly diagnoses root causes and computes confidence", () => {
      const result = diagnoseFoundationalGaps(
        "concept-diff-rules",
        "Differentiation Rules",
        "mathematics",
        {
          "concept-limits": { attempts: 6, correct: 2 }, // 33% -> STRONG_EVIDENCE gap
          "concept-functions-domain": { attempts: 5, correct: 3 }, // 60% -> DEVELOPING gap
          "concept-poly-factorization": { attempts: 6, correct: 6 }, // 100% -> no gap
        }
      );

      assert.ok(result.hasRootCauseGaps);
      assert.ok(result.foundationalGapsIdentified.length >= 2);
      const limitsGap = result.foundationalGapsIdentified.find((g) => g.prerequisite.conceptId === "concept-limits");
      assert.ok(limitsGap);
      assert.equal(limitsGap.isGap, true);
      assert.equal(limitsGap.confidence, "STRONG_EVIDENCE");
      assert.ok(result.summaryExplanation.includes("Limits and Indeterminate Forms"));
    });

    test("diagnoseFoundationalGaps returns INSUFFICIENT_DATA when attempt history is sparse", () => {
      const result = diagnoseFoundationalGaps(
        "concept-diff-rules",
        "Differentiation Rules",
        "mathematics",
        {
          "concept-limits": { attempts: 0, correct: 0 },
        }
      );

      const limitsItem = result.foundationalGapsIdentified.find((g) => g.prerequisite.conceptId === "concept-limits");
      assert.ok(limitsItem);
      assert.equal(limitsItem.confidence, "INSUFFICIENT_DATA");
    });
  });

  // 3. Four-Dimension Formula Mastery Intelligence
  describe("3. Four-Dimension Formula Mastery Intelligence", () => {
    test("Evaluates all 4 dimensions independently without merging into a misleading single score", () => {
      const report = evaluateFormulaDimensions(
        "f-c11-phy-1",
        "First Equation of Motion",
        "v = u + at",
        "physics",
        11,
        [
          // Recall: 4 correct, 0 wrong -> 100% (STRONG)
          { dimension: "FORMULA_RECALL", isCorrect: true },
          { dimension: "FORMULA_RECALL", isCorrect: true },
          { dimension: "FORMULA_RECALL", isCorrect: true },
          { dimension: "FORMULA_RECALL", isCorrect: true },
          // Symbol understanding: 4 correct, 0 wrong -> 100% (STRONG)
          { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
          { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
          { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
          { dimension: "SYMBOL_UNDERSTANDING", isCorrect: true },
          // Formula Selection: 2 correct, 2 wrong -> 50% (DEVELOPING)
          { dimension: "FORMULA_SELECTION", isCorrect: true },
          { dimension: "FORMULA_SELECTION", isCorrect: true },
          { dimension: "FORMULA_SELECTION", isCorrect: false },
          { dimension: "FORMULA_SELECTION", isCorrect: false },
          // Numerical application: 1 correct, 3 wrong -> 25% (NEEDS_IMPROVEMENT)
          { dimension: "NUMERICAL_APPLICATION", isCorrect: true },
          { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
          { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
          { dimension: "NUMERICAL_APPLICATION", isCorrect: false },
        ]
      );

      assert.equal(report.formulaId, "f-c11-phy-1");
      assert.equal(report.dimensions.FORMULA_RECALL.rating, "STRONG");
      assert.equal(report.dimensions.FORMULA_RECALL.accuracyPct, 100);

      assert.equal(report.dimensions.SYMBOL_UNDERSTANDING.rating, "STRONG");
      assert.equal(report.dimensions.SYMBOL_UNDERSTANDING.accuracyPct, 100);

      assert.equal(report.dimensions.NUMERICAL_APPLICATION.rating, "NEEDS_IMPROVEMENT");
      assert.equal(report.dimensions.NUMERICAL_APPLICATION.accuracyPct, 25);
      assert.equal(report.primaryWeakDimension, "NUMERICAL_APPLICATION");
    });

    test("computeFormulaExplorerOutput computes step-by-step substitution accurately", () => {
      // First Equation of Motion: v = u + at
      const motionCalc = computeFormulaExplorerOutput("formula-motion-1", {
        u: 10,
        a: 5,
        t: 3,
      });
      assert.equal(motionCalc.outputValue, 25);
      assert.equal(motionCalc.outputVariable, "v");
      assert.equal(motionCalc.formattedOutput, "25.00 m/s");
      assert.ok(motionCalc.stepByStepSteps.length >= 4);

      // Newton's Second Law: F = ma
      const forceCalc = computeFormulaExplorerOutput("formula-newton-2", {
        m: 10,
        a: 3,
      });
      assert.equal(forceCalc.outputValue, 30);
      assert.equal(forceCalc.outputVariable, "F");
      assert.equal(forceCalc.formattedOutput, "30.00 N");
    });
  });

  // 4. Evidence-Based Diagnostic Reassessment State Machine
  describe("4. Reassessment Engine & Progress State Machine", () => {
    test("Confirms improvement only when fresh score meets or exceeds mastery threshold", () => {
      const evalResult = evaluateStudentImprovement(
        {
          timestamp: "2026-11-04T10:00:00Z",
          attemptId: "base-01",
          conceptId: "concept-lens-formula",
          conceptTitle: "Lens Maker Formula & Optical Power",
          subjectSlug: "physics",
          classLevel: 10,
          totalQuestions: 5,
          correctQuestions: 2,
          accuracyPct: 40,
          errorTypesObserved: ["SIGN_ERROR", "CALCULATION_ERROR"],
          weakestSubskill: "Cartesian Sign Convention",
        },
        {
          timestamp: "2026-11-06T10:00:00Z",
          reassessmentAttemptId: "re-01",
          totalQuestions: 5,
          correctQuestions: 5,
          accuracyPct: 100,
          errorTypesObserved: [],
        },
        true
      );

      assert.equal(evalResult.progressState, "IMPROVEMENT_CONFIRMED");
      assert.equal(evalResult.accuracyDelta, 60);
      assert.ok(evalResult.resolvedErrors.includes("SIGN_ERROR"));
      assert.ok(evalResult.evidenceSummary.includes("Verified Genuine Improvement"));
    });

    test("Maintains STILL_NEEDS_SUPPORT when reassessment score fails to reach mastery", () => {
      const evalResult = evaluateStudentImprovement(
        {
          timestamp: "2026-11-04T10:00:00Z",
          attemptId: "base-02",
          conceptId: "concept-equilibrium-kc",
          conceptTitle: "Chemical Equilibrium Kc",
          subjectSlug: "chemistry",
          classLevel: 11,
          totalQuestions: 5,
          correctQuestions: 1,
          accuracyPct: 20,
          errorTypesObserved: ["CONCEPTUAL_MISUNDERSTANDING"],
          weakestSubskill: "Law of Mass Action",
        },
        {
          timestamp: "2026-11-06T10:00:00Z",
          reassessmentAttemptId: "re-02",
          totalQuestions: 5,
          correctQuestions: 2,
          accuracyPct: 40,
          errorTypesObserved: ["CONCEPTUAL_MISUNDERSTANDING"],
        },
        true
      );

      assert.equal(evalResult.progressState, "STILL_NEEDS_SUPPORT");
      assert.equal(evalResult.accuracyDelta, 20);
      assert.ok(evalResult.evidenceSummary.includes("Persistent issues"));
    });
  });

  // 5. Mistake Notebook 9 Diagnostic Categories
  describe("5. Mistake & Error Notebook Engine", () => {
    test("All 9 required diagnostic mistake categories are registered with descriptions", () => {
      const requiredCategories: MistakeCategory[] = [
        "CONCEPTUAL_MISUNDERSTANDING",
        "FORMULA_RECALL_ERROR",
        "FORMULA_SELECTION_ERROR",
        "CALCULATION_ERROR",
        "UNIT_CONVERSION_ERROR",
        "SIGN_ERROR",
        "DIAGRAM_INTERPRETATION_ERROR",
        "CARELESS_MISTAKE",
        "TIME_MANAGEMENT_ISSUE",
      ];

      for (const cat of requiredCategories) {
        assert.ok(MISTAKE_CATEGORY_LABELS[cat], `Category ${cat} must be documented`);
        assert.ok(MISTAKE_CATEGORY_LABELS[cat].label, `Category ${cat} must have a user-facing label`);
        assert.ok(MISTAKE_CATEGORY_LABELS[cat].badgeColor, `Category ${cat} must have a badge color`);
        assert.ok(MISTAKE_CATEGORY_LABELS[cat].description, `Category ${cat} must have an explanation`);
      }
    });

    test("Initial mistake notebook contains verified examples with remediation steps", () => {
      assert.ok(INITIAL_MISTAKE_NOTEBOOK.length >= 3);
      for (const item of INITIAL_MISTAKE_NOTEBOOK) {
        assert.ok(item.id);
        assert.ok(item.questionText);
        assert.ok(item.studentAnswer);
        assert.ok(item.correctAnswer);
        assert.ok(item.stepExplanation);
        assert.ok(typeof item.resolved === "boolean");
      }
    });
  });

  // 6. Admin Recovery Secret Multi-Key Security
  describe("6. Admin Recovery & Master Key Validation", () => {
    test("Validates authorized master keys reliably", () => {
      assert.ok(validateAdminRecoverySecret("SilenceSpeaks#2026"), "SilenceSpeaks#2026 must be authorized");
      assert.ok(validateAdminRecoverySecret("AnishPatil@2026"), "AnishPatil@2026 must be authorized");
      assert.ok(!validateAdminRecoverySecret("WrongPassword123"), "Wrong password must be rejected");
      assert.ok(!validateAdminRecoverySecret(null), "Null must be rejected");
      assert.ok(!validateAdminRecoverySecret(""), "Empty string must be rejected");
    });
  });
});
