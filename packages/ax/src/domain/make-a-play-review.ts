// make-a-play review-gate identity constants.
//
// The make-a-play production machinery (including the review-composition
// rendering that used to live in this file) moved to packages/pms in the
// PMS/Alexandria boundary migration, Slice 1. What remains here is the
// LEDGER-READER half: `play.review_level_selected` and
// `play.review_gate_confirmed` events already recorded in project ledgers
// reference these step and gate ids, so ax keeps them to parse and project
// that frozen history. The live authoring surface is
// packages/pms/src/domain/make-a-play-review.ts.

export const MAKE_A_PLAY_STEP_IDS = ["ground", "brief", "harden", "derive", "test", "run"] as const;
export type MakeAPlayStepId = (typeof MAKE_A_PLAY_STEP_IDS)[number];

export type MakeAPlayReviewGateId =
  | "review_after_ground"
  | "review_after_brief"
  | "gate_1_confirm_design"
  | "review_after_derive"
  | "review_after_test"
  | "gate_2_confirm_proven";

export interface MakeAPlayReviewGate {
  afterStep: MakeAPlayStepId;
  approveLabel: string;
  gateId: MakeAPlayReviewGateId;
  label: string;
  rejectLabel?: string;
  returnNodeId?: string;
  typicalSeconds: number;
}

export const MAKE_A_PLAY_REVIEW_GATES: Record<MakeAPlayStepId, MakeAPlayReviewGate> = {
  brief: {
    afterStep: "brief",
    approveLabel: "[A] Approve brief",
    gateId: "review_after_brief",
    label: "Review the brief",
    returnNodeId: "draft_brief",
    typicalSeconds: 180,
  },
  derive: {
    afterStep: "derive",
    approveLabel: "[A] Approve drawing",
    gateId: "review_after_derive",
    label: "Review the drawing and approve prompts",
    returnNodeId: "derive",
    typicalSeconds: 180,
  },
  ground: {
    afterStep: "ground",
    approveLabel: "[A] Approve grounding",
    gateId: "review_after_ground",
    label: "Review the grounding",
    returnNodeId: "ground",
    typicalSeconds: 180,
  },
  harden: {
    afterStep: "harden",
    approveLabel: "[A] Confirm design",
    gateId: "gate_1_confirm_design",
    label: "Gate 1 - confirm the design",
    returnNodeId: "draft_brief",
    typicalSeconds: 180,
  },
  run: {
    afterStep: "run",
    approveLabel: "[A] Confirm proven",
    gateId: "gate_2_confirm_proven",
    label: "Gate 2 - confirm it is proven",
    rejectLabel: "[H] Hold",
    typicalSeconds: 180,
  },
  test: {
    afterStep: "test",
    approveLabel: "[A] Approve test tuning",
    gateId: "review_after_test",
    label: "Approve the test tuning",
    returnNodeId: "author_fixtures",
    typicalSeconds: 180,
  },
};
