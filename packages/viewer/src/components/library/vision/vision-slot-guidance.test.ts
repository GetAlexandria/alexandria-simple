import { describe, expect, test } from "bun:test";
import { slotGuidance } from "./vision-slot-guidance";

describe("Vision slot guidance", () => {
  test("covers exactly the four Basic Product Description slots", () => {
    expect(Object.keys(slotGuidance).sort()).toEqual(
      ["person", "mechanism", "the-work", "refusal"].sort(),
    );
  });

  test("covers the frozen the-work and What It's Not copy", () => {
    expect(slotGuidance["the-work"]).toEqual({
      prompt:
        "Describe how the product works by following its main path from beginning to end. Choose the thing that moves through it — for example, a lead becoming a listing, a customer completing sign-up, or a client progressing through an engagement — and lay out the steps it passes through and what moves it from one step to the next. Note any step you are unsure about.",
      pullingFor: "The main path from beginning to end, and what advances it.",
      quickTest: "Could someone new follow the path from start to finish?",
      length: "A short, ordered walk-through.",
    });

    expect(slotGuidance.refusal).toEqual({
      prompt:
        "Name what people might reasonably assume this product is for, or who might assume it is for them, when it is not. Identify the adjacent uses, customers, or categories it is often grouped with but deliberately does not serve, and explain briefly why each is a mismatch.",
      pullingFor: "The look-alikes the product is mistaken for but does not serve.",
      quickTest: "Could someone reasonably make this assumption and be wrong?",
      length: "Two or three, each with its reason.",
    });
  });
});
