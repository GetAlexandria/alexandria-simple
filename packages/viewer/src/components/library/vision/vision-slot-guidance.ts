import type {
  RuntimeRavenVisionProjection,
  RuntimeRavenVisionSlotId,
  RuntimeRavenVisionSlotStatus,
} from "../../../app/runtime/schemas";

export const slotStatusLabels: Record<RuntimeRavenVisionSlotStatus, string> = {
  approved: "Approved",
  empty: "Empty",
  needs_review: "Needs review",
  skipped: "Skipped",
};

export const visionStatusLabels: Record<RuntimeRavenVisionProjection["status"], string> = {
  banked: "Banked",
  in_progress: "In progress",
  needs_reconfirmation: "Needs reconfirmation",
  not_started: "Not started",
  ready_to_bank: "Ready to bank",
};

export function slotStatusPipClass(status: RuntimeRavenVisionSlotStatus): string {
  switch (status) {
    case "approved":
      return "raven-status-pip-approved";
    case "needs_review":
      return "raven-status-pip-review";
    case "skipped":
      return "raven-status-pip-skipped";
    case "empty":
      return "raven-status-pip-empty";
  }
}

export function isCompletedSlotStatus(status: RuntimeRavenVisionSlotStatus): boolean {
  return status === "approved" || status === "skipped";
}

export interface VisionSlotGuidance {
  length: string;
  prompt: string;
  pullingFor: string;
  quickTest: string;
}

export const slotGuidance: Record<RuntimeRavenVisionSlotId, VisionSlotGuidance> = {
  person: {
    length: "A short paragraph.",
    prompt:
      "Describe the specific person this product is built for. Give enough detail for the team to picture them — their role, their situation, and the problem in their week that leads them to the product — rather than a market segment or demographic.",
    pullingFor: "One concrete person, not a market segment.",
    quickTest: "Would the team recognize this person if they walked in?",
  },
  mechanism: {
    length: "One or two sentences.",
    prompt:
      "In one or two plain sentences, describe what the product does: what it lets people do, and what it competes with or replaces. For example, Airbnb lets people rent rooms in other people's homes over the internet, without a landlord involved, competing with hotels rather than vacation rentals.",
    pullingFor: "What the product does, and what it stands in for.",
    quickTest: "Would someone unfamiliar understand the product, and its alternative, from this?",
  },
  "the-work": {
    length: "A short, ordered walk-through.",
    prompt:
      "Describe how the product works by following its main path from beginning to end. Choose the thing that moves through it — for example, a lead becoming a listing, a customer completing sign-up, or a client progressing through an engagement — and lay out the steps it passes through and what moves it from one step to the next. Note any step you are unsure about.",
    pullingFor: "The main path from beginning to end, and what advances it.",
    quickTest: "Could someone new follow the path from start to finish?",
  },
  refusal: {
    length: "Two or three, each with its reason.",
    prompt:
      "Name what people might reasonably assume this product is for, or who might assume it is for them, when it is not. Identify the adjacent uses, customers, or categories it is often grouped with but deliberately does not serve, and explain briefly why each is a mismatch.",
    pullingFor: "The look-alikes the product is mistaken for but does not serve.",
    quickTest: "Could someone reasonably make this assumption and be wrong?",
  },
};
