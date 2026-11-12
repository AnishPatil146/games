import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import {
  createPlayerReview,
  getPublicPlayerReviews,
  getAllAdminPlayerReviews,
  updateAdminPlayerReview,
  deleteAdminPlayerReview,
  setLocalStorePathForTests,
} from "../src/lib/storage";

test("THE UNWRITTEN — Player Reviews & Admin Moderation Suite", async (t) => {
  const tmpDir = path.join(process.cwd(), ".data", "test-reviews");
  const tmpStorePath = path.join(tmpDir, `store-${Date.now()}.json`);

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  setLocalStorePathForTests(tmpStorePath);

  t.after(() => {
    setLocalStorePathForTests(null);
    try {
      if (fs.existsSync(tmpStorePath)) fs.unlinkSync(tmpStorePath);
      if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
    } catch {
      // ignore
    }
  });

  let createdReviewId = "";

  await t.test("1. Starts Empty — Zero Fake or Seed Reviews", async () => {
    const res = await getPublicPlayerReviews({ category: "all" });
    assert.equal(res.reviews.length, 0, "Initial review store must be completely empty");
    assert.equal(res.stats.totalReviews, 0);
    assert.equal(res.stats.averageRating, 0);
  });

  await t.test("2. Player Review Creation & Validation", async () => {
    // Rejects too-short name
    await assert.rejects(
      async () => {
        await createPlayerReview({
          playerName: "A",
          title: "Good game",
          feedback: "Really enjoyed playing this.",
          rating: 5,
        });
      },
      /Player name must be at least 2 characters/,
      "Must reject name shorter than 2 characters"
    );

    // Rejects too-short feedback
    await assert.rejects(
      async () => {
        await createPlayerReview({
          playerName: "Aarav",
          title: "Short",
          feedback: "Bad",
          rating: 3,
        });
      },
      /Review feedback must be at least 5 characters/,
      "Must reject feedback shorter than 5 characters"
    );

    // Successfully creates genuine player review
    const rev = await createPlayerReview({
      playerName: "Inspector_Rao",
      instagramId: "@rao_investigates",
      rating: 5,
      title: "Chamber 7 emergency console was intensely atmospheric",
      feedback:
        "The audio cues and vacuum tube terminal design were spectacular. A truly unique psychological deduction experience.",
      category: "solo",
      modePlayed: "senior",
    });

    assert.ok(rev.id.startsWith("rev_"), "Review ID must start with rev_");
    assert.equal(rev.playerName, "Inspector_Rao");
    assert.equal(rev.instagramId, "rao_investigates", "Must strip @ prefix");
    assert.equal(rev.rating, 5);
    assert.equal(rev.category, "solo");
    assert.equal(rev.status, "approved");
    assert.equal(rev.featured, false);
    assert.equal(rev.adminResponse, null);

    createdReviewId = rev.id;
  });

  await t.test("3. Public Reviews Retrieval & Community Stats Calculation", async () => {
    const res = await getPublicPlayerReviews({ category: "all" });

    assert.equal(res.reviews.length, 1, "Must return exactly the 1 genuine review");
    assert.equal(res.stats.totalReviews, 1);
    assert.equal(res.stats.averageRating, 5.0);
    assert.equal(res.stats.ratingBreakdown[5], 1);

    // Filter by specific category
    const soloRes = await getPublicPlayerReviews({ category: "solo" });
    assert.equal(soloRes.reviews.length, 1);
    assert.equal(soloRes.reviews[0].category, "solo");

    const juniorRes = await getPublicPlayerReviews({ category: "junior" });
    assert.equal(juniorRes.reviews.length, 0);
  });

  await t.test("4. Admin Review Querying, Search & Moderation Telemetry", async () => {
    const adminData = await getAllAdminPlayerReviews({
      status: "all",
      search: "vacuum tube",
    });

    assert.equal(adminData.reviews.length, 1);
    assert.equal(adminData.reviews[0].id, createdReviewId);
    assert.equal(adminData.stats.approvedCount, 1);
    assert.equal(adminData.stats.pendingCount, 0);
  });

  await t.test("5. Admin Moderation: Feature Pinning & Creator Response", async () => {
    // Pin review as featured
    const pinned = await updateAdminPlayerReview(createdReviewId, {
      featured: true,
      adminResponse: "Thank you Inspector Rao! The vacuum tube sequence was a favorite to craft.",
    });

    assert.ok(pinned);
    assert.equal(pinned?.featured, true);
    assert.ok(pinned?.adminResponse?.includes("Inspector Rao"));

    // Verify public view reflects featured order
    const publicRes = await getPublicPlayerReviews({ category: "all" });
    assert.equal(publicRes.reviews[0].id, createdReviewId);
    assert.equal(publicRes.reviews[0].featured, true);
    assert.ok(publicRes.reviews[0].adminResponse !== null);
  });

  await t.test("6. Review Status Updating & Deletion Lifecycle", async () => {
    // Flag review
    const flagged = await updateAdminPlayerReview(createdReviewId, {
      status: "flagged",
    });
    assert.equal(flagged?.status, "flagged");

    // Public view must exclude flagged reviews
    const publicRes = await getPublicPlayerReviews({ category: "all" });
    assert.equal(publicRes.reviews.length, 0);

    // Delete review
    const deleted = await deleteAdminPlayerReview(createdReviewId);
    assert.equal(deleted, true);

    // Verify deletion in admin query
    const checkDeleted = await getAllAdminPlayerReviews({ search: "Inspector_Rao" });
    assert.equal(checkDeleted.reviews.length, 0);
  });
});
