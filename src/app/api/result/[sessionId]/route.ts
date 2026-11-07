import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPublicSessionDossier, getOrCreateSession } from "@/lib/storage";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { evaluateReport } from "@/lib/scoring";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

function deriveClaimKey(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 8).toUpperCase();
}

const CHAPTER_BRANCH_META: Record<
  number,
  { title: string; labels: Record<string, string>; allLabels: string[] }
> = {
  1: {
    title: "The Last Train",
    labels: {
      return_wallet: "Return the Wallet",
      call_out: "Call Out to Stranger",
      investigate_first: "Inspect Wallet First",
      catch_train: "Board the Train",
    },
    allLabels: [
      "Return the Wallet",
      "Call Out to Stranger",
      "Inspect Wallet First",
      "Board the Train",
    ],
  },
  2: {
    title: "The Locked Room",
    labels: {
      cipher_solved: "Solved Brass Tumbler",
      cipher_attempted: "Tested Archive Lock",
    },
    allLabels: ["Solved Brass Tumbler", "Inspected Ledger Clues"],
  },
  3: {
    title: "The Unknown Message",
    labels: {
      investigate_sender: "Trace Sender Metadata",
      look_for_evidence: "Sweep Study Perimeter",
      ignore_message: "Withhold Engagement",
      confront_sender: "Demand Identity",
      reply_immediately: "Send Direct Reply",
    },
    allLabels: [
      "Trace Sender Metadata",
      "Sweep Study Perimeter",
      "Withhold Engagement",
      "Demand Identity",
      "Send Direct Reply",
    ],
  },
  4: {
    title: "The Empty Canvas",
    labels: {},
    allLabels: ["Balanced Minimalism", "Asymmetric Tension", "Layered Warmth"],
  },
  5: {
    title: "The Final Ten Seconds",
    labels: {
      vault_solved: "Stabilized Vault Relay",
      vault_timeout: "Observed Final Countdown",
    },
    allLabels: ["Stabilized Vault Relay", "Observed Final Countdown"],
  },
  6: {
    title: "The Unknown World",
    labels: {},
    allLabels: [
      "Coastal Observatory",
      "Highland Archive",
      "Sunlit Courtyard",
      "Nocturnal Library",
    ],
  },
};

export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { sessionId } = await props.params;
    const cookieToken = req.cookies.get("the_unwritten_token")?.value;
    const clientSessionId =
      req.headers.get("x-session-id") ||
      req.nextUrl.searchParams.get("sessionId");
    const claimParam = req.nextUrl.searchParams.get("claim") || req.nextUrl.searchParams.get("key");
    const claimHeader = req.headers.get("x-dossier-claim-token") || req.headers.get("x-session-claim-key");
    const candidateClaim = (claimParam || claimHeader || "").trim();

    const lookupKey =
      sessionId === "current"
        ? clientSessionId || cookieToken || "current"
        : sessionId;

    const authorizedDossier = cookieToken
      ? await getPublicSessionDossier(cookieToken)
      : null;

    let isOwner =
      Boolean(authorizedDossier) &&
      (sessionId === "current" || authorizedDossier?.session.id === sessionId || authorizedDossier?.session.id === clientSessionId);

    let tokenToBind: string | null = null;
    let targetDossier = isOwner ? authorizedDossier : null;

    if (!isOwner) {
      // 1. Resolve target session by lookupKey
      targetDossier = await getPublicSessionDossier(lookupKey);
      if (!targetDossier && clientSessionId && clientSessionId !== lookupKey) {
        targetDossier = await getPublicSessionDossier(clientSessionId);
      }
      
      // If still not found and request was for current session, fallback to creating or retrieving session
      if (!targetDossier && sessionId === "current") {
        const fallbackToken = cookieToken || "uw_" + crypto.randomBytes(16).toString("hex");
        const freshSession = await getOrCreateSession(fallbackToken, {}, "UNSPECIFIED");
        targetDossier = await getPublicSessionDossier(freshSession.session.id);
        isOwner = true;
      }

      if (!targetDossier) {
        return NextResponse.json(
          { error: "No recorded gameplay session was found for this identifier." },
          { status: 404 }
        );
      }

      // 2. Check if caller provided valid claim token or key
      if (candidateClaim) {
        const claimDossier = await getPublicSessionDossier(candidateClaim);
        if (claimDossier && claimDossier.session.id === targetDossier.session.id) {
          isOwner = true;
          tokenToBind = candidateClaim;
        } else if (candidateClaim.toUpperCase() === deriveClaimKey(targetDossier.session.id)) {
          isOwner = true;
        }
      }

      // 3. Check if caller is verified administrator
      if (!isOwner) {
        const adminAuth = await verifyAdminAccess();
        if (adminAuth.authorized) {
          isOwner = true;
        }
      }
    }

    if (!targetDossier) {
      return NextResponse.json(
        { error: "No recorded gameplay session was found for this identifier." },
        { status: 404 }
      );
    }

    const events = targetDossier.events;
    const prefs = targetDossier.preferences;

    const report = evaluateReport(
      targetDossier.session.id,
      targetDossier.playerDisplayName || "Anonymous Traveler",
      events,
      prefs,
      targetDossier.session.completed_at ||
        targetDossier.session.started_at,
      targetDossier.session.character_presentation
    );

    if (
      !targetDossier.session.result_archetype &&
      targetDossier.session.current_chapter >= 6
    ) {
      await getPublicSessionDossier(sessionId, report.archetype);
    }

    const uniqueClues = new Set(
      events
        .filter((e) => e.event_type === "clue_inspected")
        .map((e) => String(e.event_data?.clueId || ""))
        .filter(Boolean)
    );

    const seventhDoorCompletedEv = events.find(
      (e) => e.event_type === "seventh_door_completed"
    );
    const seventhDoorUnlocked =
      uniqueClues.size >= 2 ||
      Boolean(seventhDoorCompletedEv) ||
      events.some((e) => e.event_type === "seventh_door_unlocked");

    const hiddenLetterRead = events.some(
      (e) => e.event_type === "hidden_letter_read"
    );
    const hiddenLetterUnlocked =
      uniqueClues.size >= 1 ||
      Boolean(seventhDoorCompletedEv) ||
      hiddenLetterRead ||
      events.some((e) => e.event_type === "hidden_letter_unlocked");

    const doorChoiceLabels: Record<string, string> = {
      leave_lantern_lit: "Left the Brass Lantern Lit",
      inscribe_margin_note: "Inscribed Unsigned Margin Note",
      seal_the_ledger: "Sealed the Archive Ledger",
    };
    const rawDoorChoice = seventhDoorCompletedEv?.event_data?.doorChoice
      ? String(seventhDoorCompletedEv.event_data.doorChoice)
      : null;

    // Build Choice Map steps across Chapters 1..6
    const choiceMapSteps = [1, 2, 3, 4, 5, 6].map((ch) => {
      const meta = CHAPTER_BRANCH_META[ch];
      const chEvents = events.filter((e) => e.chapter === ch);
      const completed =
        targetDossier.session.status === "completed" ||
        targetDossier.session.current_chapter > ch ||
        chEvents.some((e) => e.event_type === "chapter_completed");

      let selectedLabel: string | null = null;
      if (ch === 1 || ch === 3) {
        const cEv = chEvents.find((e) => e.event_type === "choice_selected");
        const key = String(cEv?.event_data?.choiceId || "");
        selectedLabel = meta.labels[key] || (key ? key : null);
      } else if (ch === 2 || ch === 5) {
        const solved = chEvents.some(
          (e) =>
            e.event_type === "puzzle_attempted" &&
            e.event_data?.isCorrect === true
        );
        const attempted = chEvents.some(
          (e) => e.event_type === "puzzle_attempted"
        );
        if (solved) {
          selectedLabel =
            ch === 2 ? "Solved Brass Tumbler" : "Stabilized Vault Relay";
        } else if (attempted || completed) {
          selectedLabel =
            ch === 2 ? "Tested Archive Lock" : "Observed Final Countdown";
        }
      } else if (ch === 4) {
        selectedLabel =
          report.explicitPreferences.canvasArrangement ||
          report.explicitPreferences.canvasPalette ||
          (completed ? "Composed Canvas" : null);
      } else if (ch === 6) {
        selectedLabel =
          report.explicitPreferences.worldEnvironment ||
          (completed ? "Crossed Final Horizon" : null);
      }

      const alternatives = meta.allLabels
        .filter((lbl) => lbl !== selectedLabel)
        .slice(0, 2);

      return {
        chapter: ch,
        title: meta.title,
        selectedLabel,
        alternatives,
        completed,
      };
    });

    const response = NextResponse.json({
      success: true,
      report,
      choiceMapSteps,
      isOwner,
      claimKey: deriveClaimKey(targetDossier.session.id),
      seventhDoorStatus: {
        unlocked: seventhDoorUnlocked,
        completed: Boolean(seventhDoorCompletedEv),
        choiceLabel: rawDoorChoice
          ? doorChoiceLabels[rawDoorChoice] || rawDoorChoice
          : null,
      },
      hiddenLetterStatus: {
        unlocked: hiddenLetterUnlocked,
        read: hiddenLetterRead,
      },
    });

    if (tokenToBind) {
      response.cookies.set({
        name: "the_unwritten_token",
        value: tokenToBind,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 30, // 30 days
      });
    }

    return response;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate gameplay report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
