// Fresh V2 module: renders the Owner-view look (plan §1.2) on top of the
// P1 ground grid, inside MapScene's canvas. Everything here is a pure
// projection of an OwnerViewLayout — no state, no data fetching. All
// overlay meshes disable raycasting so the P1 ground-cell hover keeps
// working underneath.
//
// Territory washes are NOT rendered here: they flow through MapScene's
// cellTintByKey (the parchment-shader tint the Domain view uses), which
// keeps the ground grid one draw pass and avoids z-fighting overlay discs.
// Sprite-load containment also lives in MapScene (SpriteErrorBoundary +
// Suspense around children), not in this layer.
//
// Label systems, deliberately split: V1's MapLabel (canvas-texture meshes)
// is canonical for in-scene world-space text — region/context/half names,
// tile names. The drei-Html OwnerChip below is for DOM-overlay chips —
// owner name cards, the unclaimed/malformed notices, work-marker captions.

import { Html } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import * as THREE from "three";
import { OWNER_VIEW_COLORS } from "./colors";
import { FixedBuilding } from "./FixedBuilding";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";
import { LockedSeatLandmark } from "./MapLandmarks";
import { HEX_CELL_HEIGHT } from "./materials";
import type { OwnerTerritory, OwnerViewLayout, OwnerWorkMarker } from "./layout/owner-view";

// Work markers float just above the ground-cell tops.
const WORK_MARKER_Y = HEX_CELL_HEIGHT + 0.08;

// Keep floating chips below MapDevView's z-10 HUD chrome.
const CHIP_Z_INDEX_RANGE: [number, number] = [5, 0];

const CHIP_STYLE: CSSProperties = {
  backgroundColor: OWNER_VIEW_COLORS.label.background,
  borderColor: OWNER_VIEW_COLORS.label.border,
  color: OWNER_VIEW_COLORS.label.heading,
};

const MUTED_CHIP_STYLE: CSSProperties = {
  backgroundColor: OWNER_VIEW_COLORS.label.mutedBackground,
  borderColor: OWNER_VIEW_COLORS.label.border,
  color: OWNER_VIEW_COLORS.label.mutedText,
};

// The two chip silhouettes: a compact one-line caption (work markers,
// locked seats) and a block title/subtext card (territory anchors).
const CHIP_VARIANT_CLASSES = {
  compact: "whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px]",
  card: "block whitespace-nowrap rounded border px-2 py-1 text-center",
} as const;

type OwnerChipProps = {
  coord: HexCoord;
  variant?: keyof typeof CHIP_VARIANT_CLASSES;
  /** Muted treatment for the vacant-plot and locked-seat chips. */
  muted?: boolean;
  /** Extra classes appended to the chip span (e.g. "italic"). */
  className?: string;
  children: ReactNode;
};

/**
 * A pointer-transparent DOM chip floating at a hex's south edge (drei Html).
 * For in-scene world-space text use ./MapLabel instead — see the label-split
 * note in this file's header.
 */
function OwnerChip({
  coord,
  variant = "compact",
  muted = false,
  className,
  children,
}: OwnerChipProps) {
  const [x, z] = hexToWorld(coord, HEX_SIZE);
  const variantClasses = CHIP_VARIANT_CLASSES[variant];

  return (
    <Html
      position={[x, 0.1, z + 0.85]}
      center
      zIndexRange={CHIP_Z_INDEX_RANGE}
      style={{ pointerEvents: "none" }}
    >
      <span
        className={className ? `${variantClasses} ${className}` : variantClasses}
        style={muted ? MUTED_CHIP_STYLE : CHIP_STYLE}
      >
        {children}
      </span>
    </Html>
  );
}

// Shared work-marker GPU resources (one geometry, one material per entity
// kind) instead of per-marker allocations. Module-lifetime like the caches
// in ./materials; lazy so importing this module stays allocation-free.
let workMarkerGeometry: THREE.CylinderGeometry | null = null;
const workMarkerMaterials = new Map<string, THREE.MeshStandardMaterial>();

function getWorkMarkerGeometry(): THREE.CylinderGeometry {
  workMarkerGeometry ??= new THREE.CylinderGeometry(0.3, 0.34, 0.14, 6);
  return workMarkerGeometry;
}

function getWorkMarkerMaterial(kind: "project" | "system"): THREE.MeshStandardMaterial {
  let material = workMarkerMaterials.get(kind);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color: OWNER_VIEW_COLORS.work[kind],
      roughness: 0.85,
      metalness: 0.02,
    });
    workMarkerMaterials.set(kind, material);
  }
  return material;
}

function WorkMarker({ marker }: { marker: OwnerWorkMarker }) {
  const [x, z] = hexToWorld(marker.coord, HEX_SIZE);

  return (
    <>
      <mesh
        position={[x, WORK_MARKER_Y, z]}
        geometry={getWorkMarkerGeometry()}
        material={getWorkMarkerMaterial(marker.entity.kind)}
        raycast={() => null}
      />
      <OwnerChip coord={marker.coord}>{marker.entity.name}</OwnerChip>
    </>
  );
}

/** The domain anchor: owner building, human statue, or vacant plot. */
function TerritoryAnchor({
  territory,
  onColleagueClick,
}: {
  territory: OwnerTerritory;
  onColleagueClick: (colleagueId: string) => void;
}) {
  const { ownership, anchor, domain } = territory;

  if (ownership.status !== "owned") {
    // Unclaimed and malformed share the vacant-plot treatment; malformed
    // additionally carries a warning chip — bad owner data must never
    // render as a fake owner.
    return (
      <>
        <FixedBuilding kind="vacant-plot" coord={anchor} />
        <OwnerChip coord={anchor} variant="card" muted>
          <span className="block text-[11px] font-semibold">{domain.name}</span>
          <span className="block text-[9px] italic">unclaimed — wants an owner</span>
          {ownership.status === "malformed" && (
            <span
              className="block text-[9px] font-semibold"
              style={{ color: OWNER_VIEW_COLORS.label.warningText }}
            >
              ⚠ malformed owner “{ownership.raw}”
            </span>
          )}
        </OwnerChip>
      </>
    );
  }

  const { owner } = ownership;
  return (
    <>
      <FixedBuilding
        kind={owner.kind === "colleague" ? "colleague" : "human"}
        coord={anchor}
        ownerId={owner.id}
        // A colleague anchor opens the same colleague overlay a Domain-view
        // bench building does; a human statue is not a colleague, so it stays
        // inert.
        onClick={owner.kind === "colleague" ? () => onColleagueClick(owner.id) : undefined}
      />
      <OwnerChip coord={anchor} variant="card">
        <span className="block text-[11px] font-semibold">{owner.name}</span>
        <span className="block text-[9px]" style={{ color: OWNER_VIEW_COLORS.label.subtext }}>
          {domain.name}
        </span>
      </OwnerChip>
    </>
  );
}

type OwnerViewLayerProps = {
  layout: OwnerViewLayout;
  /** Opens the colleague overlay from a colleague anchor (L2). */
  onColleagueClick: (colleagueId: string) => void;
};

export function OwnerViewLayer({ layout, onColleagueClick }: OwnerViewLayerProps) {
  return (
    <>
      {layout.territories.map((territory) => (
        <group key={territory.domain.id}>
          <TerritoryAnchor territory={territory} onColleagueClick={onColleagueClick} />
          {territory.work.map((marker) => (
            <WorkMarker key={marker.entity.id} marker={marker} />
          ))}
        </group>
      ))}
      {/* Seats render through the shared locked-seat piece (MapLandmarks) so a
          future-teammate plot looks and behaves the same in both view modes. */}
      {layout.seats.map((seat) => (
        <LockedSeatLandmark key={seat.id} coord={seat.coord} />
      ))}
    </>
  );
}
