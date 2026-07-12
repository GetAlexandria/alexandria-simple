export type DamienStationKind = "conditional" | "core" | "quality";

export interface DamienStation {
  description: string;
  id: string;
  kind: DamienStationKind;
  name: string;
  output: string;
  primary?: true;
  skillName?: string;
  skillPath?: string;
  tasks: readonly string[];
}

export interface DamienStationGroup {
  id: string;
  name: string;
  stations: readonly DamienStation[];
  tag: string;
}

export const DAMIEN_PRIMARY_STATION_IDS = ["demo-thesis", "story-spine", "demo-path"] as const;

export const DAMIEN_STATION_GROUPS: readonly DamienStationGroup[] = [
  {
    id: "strategy-product-marketing",
    name: "Strategy / Product Marketing",
    tag: "belief, promise, proof",
    stations: [
      {
        description:
          "Define the viewer, belief change, demo promise, success criteria, proof burden, and scope boundary.",
        id: "demo-thesis",
        kind: "core",
        name: "Demo Thesis",
        output: "One-page demo thesis brief",
        primary: true,
        skillName: "demo-thesis",
        skillPath: "skills/demo-thesis/SKILL.md",
        tasks: [
          "Define target viewer",
          "Map before/after belief",
          "Choose demo promise",
          "Set proof requirements",
        ],
      },
      {
        description:
          "Rank the product moments that can make the thesis visible and mark each moment's proof value and risk.",
        id: "product-moment-strategy",
        kind: "core",
        name: "Product Moment Strategy",
        output: "Ranked hero moment list",
        tasks: ["Select 3-7 hero moments", "Map moments to viewer reaction", "Flag risk level"],
      },
    ],
  },
  {
    id: "producer-project-lead",
    name: "Producer / Project Lead",
    tag: "scope, owners, cadence",
    stations: [
      {
        description:
          "Turn the demo effort into a controlled production plan with owners, milestones, review checkpoints, and a source-of-truth board.",
        id: "production-operating-plan",
        kind: "core",
        name: "Production Operating Plan",
        output: "Production plan and review calendar",
        tasks: ["Build timeline", "Assign owners", "Lock review checkpoints"],
      },
      {
        description:
          "Define the master video, platform variants, launch assets, and explicit not-doing scope.",
        id: "deliverables-map",
        kind: "core",
        name: "Deliverables Map",
        output: "Required asset inventory",
        tasks: ["Define master deliverables", "Define variants", "Set scope boundary"],
      },
    ],
  },
  {
    id: "story-script",
    name: "Story / Script",
    tag: "hook, beats, proof",
    stations: [
      {
        description:
          "Find the hook, build the narrative arc, choose the video format, and turn the thesis into a causal sequence.",
        id: "story-spine",
        kind: "core",
        name: "Story Spine",
        output: "Beat outline and claim-proof map",
        primary: true,
        skillName: "story-spine",
        skillPath: "skills/story-spine/SKILL.md",
        tasks: ["Find hook options", "Build 5-8 beats", "Map claims to proof", "Draft run-of-show"],
      },
      {
        description:
          "Write timed narration or dialogue, scene notes, product references, and optional cutdown scripts.",
        id: "script-package",
        kind: "core",
        name: "Script Package",
        output: "Master script and optional cutdown scripts",
        tasks: ["Write timed script", "Add scene notes", "Create short-form variants"],
      },
      {
        description:
          "Map claims to visible proof, remove unsupported claims, and identify any missing product proof.",
        id: "claim-proof-map",
        kind: "core",
        name: "Claim-Proof Map",
        output: "Claim to proof to scene table",
        tasks: ["Map claims", "Remove unsupported claims", "Identify proof gaps"],
      },
    ],
  },
  {
    id: "product-demo-design",
    name: "Product / Demo Design",
    tag: "journey, data, hero moments",
    stations: [
      {
        description:
          "Turn the story into exact product actions, visible states, risks, and fallback paths.",
        id: "demo-path",
        kind: "core",
        name: "Demo Path",
        output: "Runnable product flow",
        primary: true,
        skillName: "demo-path",
        skillPath: "skills/demo-path/SKILL.md",
        tasks: [
          "Write exact product steps",
          "Define visible states",
          "Mark risks",
          "Plan fallbacks",
        ],
      },
      {
        description:
          "Create believable accounts, files, records, examples, states, and fallback scenes for capture.",
        id: "demo-data-and-state",
        kind: "core",
        name: "Demo Data And State",
        output: "Seeded account and known-good states",
        tasks: ["Create demo data", "Prepare states", "Document reset steps"],
      },
      {
        description:
          "Design the product interactions that should land emotionally, including before/after contrast and where the viewer should look.",
        id: "hero-moment-design",
        kind: "core",
        name: "Hero Moment Design",
        output: "Hero moment specs",
        tasks: ["Define product interaction", "Define viewer reaction", "Mark attention target"],
      },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    tag: "stability, fixtures, reset",
    stations: [
      {
        description:
          "Stabilize the build, account, fixtures, mocks, seeded state, and reset procedure used for recording.",
        id: "stable-demo-environment",
        kind: "core",
        name: "Stable Demo Environment",
        output: "Reliable environment and reset instructions",
        tasks: ["Stabilize build", "Create fixtures", "Write reset procedure"],
      },
      {
        description:
          "Improve perceived speed, avoid unreliable paths, preload expensive states, and patch camera-facing friction.",
        id: "demo-performance-polish",
        kind: "quality",
        name: "Demo Performance Polish",
        output: "Demo-safe build notes",
        tasks: ["Improve speed", "Avoid unreliable paths", "Patch friction points"],
      },
    ],
  },
  {
    id: "ux-product-design",
    name: "UX / Product Design",
    tag: "legibility, hierarchy, attention",
    stations: [
      {
        description:
          "Audit camera-facing screens for legibility, density, contrast, compression risk, and zoom or crop points.",
        id: "screen-readability-pass",
        kind: "quality",
        name: "Screen Readability Pass",
        output: "Screen readability notes",
        tasks: ["Audit legibility", "Check compression risk", "Recommend zoom points"],
      },
      {
        description:
          "Define where the viewer should look in each scene, including cursor path, focus areas, and hierarchy notes.",
        id: "viewer-attention-map",
        kind: "quality",
        name: "Viewer Attention Map",
        output: "Screen-level attention notes",
        tasks: ["Clarify hierarchy", "Define cursor path", "Mark focus areas"],
      },
    ],
  },
  {
    id: "brand-graphics-motion",
    name: "Brand / Graphics / Motion",
    tag: "treatment, explainers, cues",
    stations: [
      {
        description:
          "Define typography, color, framing, title treatment, lower thirds, and reusable visual system.",
        id: "visual-treatment",
        kind: "core",
        name: "Visual Treatment",
        output: "Visual direction and graphic system",
        tasks: ["Define style board", "Set type and color", "Create title system"],
      },
      {
        description:
          "Design diagrams, thumbnails, end cards, stills, and conceptual visuals needed around the product footage.",
        id: "static-explainer-assets",
        kind: "conditional",
        name: "Static Explainer Assets",
        output: "Diagram and launch graphic assets",
        tasks: ["Design diagrams", "Create thumbnails", "Prepare stills"],
      },
      {
        description:
          "Plan cursor highlights, zooms, callouts, labels, diagram animation, hook cards, and social motion elements.",
        id: "product-attention-cues",
        kind: "quality",
        name: "Product Attention Cues",
        output: "Motion annotation package",
        tasks: ["Add callouts", "Plan zooms", "Define animated labels"],
      },
    ],
  },
  {
    id: "capture-audio-post",
    name: "Capture / Audio / Post",
    tag: "record, assemble, finish",
    stations: [
      {
        description:
          "Build the screen-recording list, shot list, audio plan, settings, pickup checklist, and capture order.",
        id: "capture-plan",
        kind: "core",
        name: "Capture Plan",
        output: "Complete capture plan",
        tasks: ["Build shot list", "Set recording specs", "Create pickup checklist"],
      },
      {
        description:
          "Record clean product footage, hero moments, audio, human context, b-roll, and backup material.",
        id: "product-footage-capture",
        kind: "core",
        name: "Product Footage Capture",
        output: "Raw capture library",
        tasks: ["Capture product footage", "Record multiple takes", "Log pickups"],
      },
      {
        description:
          "Assemble scenes, tighten pacing, resolve story notes, mix audio, add captions, and export the master.",
        id: "story-cut-and-master",
        kind: "core",
        name: "Story Cut And Master",
        output: "Approved master video",
        tasks: ["Build assembly edit", "Tighten pacing", "Finish captions and audio"],
      },
    ],
  },
  {
    id: "qa-distribution",
    name: "QA / Distribution",
    tag: "approval, launch, learn",
    stations: [
      {
        description:
          "Verify product behavior, claims, UI reality, audio, captions, export specs, rights, and customer-data safety.",
        id: "accuracy-and-technical-review",
        kind: "core",
        name: "Accuracy And Technical Review",
        output: "Launch approval notes",
        tasks: ["Verify claims", "Check export specs", "Clear rights and data"],
      },
      {
        description:
          "Prepare launch channels, CTA, schedule, title, thumbnail, description, landing placement, and sales/customer enablement.",
        id: "launch-plan",
        kind: "core",
        name: "Launch Plan",
        output: "Publishing package",
        tasks: ["Define channels", "Write CTA copy", "Prepare enablement notes"],
      },
      {
        description:
          "Create short clips, vertical versions, captions, stills, email copy, sales snippets, and the measurement loop.",
        id: "derivatives-and-measurement",
        kind: "conditional",
        name: "Derivatives And Measurement",
        output: "Derivative bundle and performance readout",
        tasks: ["Create cutdowns", "Prepare launch assets", "Track reactions"],
      },
    ],
  },
];

export const DAMIEN_STATIONS: readonly DamienStation[] = DAMIEN_STATION_GROUPS.flatMap(
  (group) => group.stations,
);
