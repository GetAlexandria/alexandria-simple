// Fresh V2 module: renders the Owner-view look (plan §1.2) on top of the
// P1 ground grid, inside MapScene's canvas. Everything here is a pure
// projection of an OwnerViewLayout — no state, no data fetching. All
// overlay meshes disable raycasting so the P1 ground-cell hover keeps
// working underneath.

import { Html } from "@react-three/drei";
import { Component, Suspense, type CSSProperties, type ReactNode } from "react";
import { OWNER_VIEW_COLORS } from "./colors";
import { FixedBuilding } from "./FixedBuilding";
import { hexToWorld, type HexCoord } from "./hex";
import type {
  LockedSeat,
  OwnerTerritory,
  OwnerViewLayout,
  OwnerWorkMarker,
} from "./layout/owner-view";

// Matches HexCell's HEX_SIZE / HEX_HEIGHT (ground cells are 1-unit hexes,
// 0.22 tall); overlays float just above the cell tops.
const HEX_SIZE = 1;
const TERRITORY_Y = 0.24;
const WORK_MARKER_Y = 0.3;

// Keep floating labels below MapDevView's z-10 HUD chrome.
const LABEL_Z_INDEX_RANGE: [number, number] = [5, 0];

const LABEL_CHIP_STYLE: CSSProperties = {
  backgroundColor: OWNER_VIEW_COLORS.label.background,
  borderColor: OWNER_VIEW_COLORS.label.border,
  color: OWNER_VIEW_COLORS.label.heading,
};

const MUTED_CHIP_STYLE: CSSProperties = {
  backgroundColor: OWNER_VIEW_COLORS.label.mutedBackground,
  borderColor: OWNER_VIEW_COLORS.label.border,
  color: OWNER_VIEW_COLORS.label.mutedText,
};

type MapLabelProps = {
  coord: HexCoord;
  children: ReactNode;
};

/** A pointer-transparent DOM chip floating at a hex's south edge. */
function MapLabel({ coord, children }: MapLabelProps) {
  const [x, z] = hexToWorld(coord, HEX_SIZE);

  return (
    <Html
      position={[x, 0.1, z + 0.85]}
      center
      zIndexRange={LABEL_Z_INDEX_RANGE}
      style={{ pointerEvents: "none" }}
    >
      {children}
    </Html>
  );
}

function TerritoryTint({ territory }: { territory: OwnerTerritory }) {
  const wash =
    territory.owner === undefined
      ? OWNER_VIEW_COLORS.unclaimedTerritory
      : OWNER_VIEW_COLORS.claimedTerritory;

  return (
    <>
      {territory.cells.map((cell) => {
        const [x, z] = hexToWorld(cell, HEX_SIZE);
        return (
          <mesh
            key={`${territory.domain.id}:${cell.q},${cell.r}`}
            position={[x, TERRITORY_Y, z]}
            raycast={() => null}
          >
            <cylinderGeometry args={[HEX_SIZE * 0.995, HEX_SIZE * 0.995, 0.02, 6]} />
            <meshBasicMaterial
              color={wash.color}
              transparent
              opacity={wash.opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

function WorkMarker({ marker }: { marker: OwnerWorkMarker }) {
  const [x, z] = hexToWorld(marker.coord, HEX_SIZE);
  const color = OWNER_VIEW_COLORS.work[marker.entity.kind];

  return (
    <>
      <mesh position={[x, WORK_MARKER_Y, z]} raycast={() => null}>
        <cylinderGeometry args={[0.3, 0.34, 0.14, 6]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
      </mesh>
      <MapLabel coord={marker.coord}>
        <span
          className="whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px]"
          style={LABEL_CHIP_STYLE}
        >
          {marker.entity.name}
        </span>
      </MapLabel>
    </>
  );
}

/** The domain anchor: owner building, human statue, or vacant plot. */
function TerritoryAnchor({ territory }: { territory: OwnerTerritory }) {
  const { owner, anchor, domain } = territory;

  if (owner === undefined) {
    return (
      <>
        <FixedBuilding kind="vacant-plot" coord={anchor} />
        <MapLabel coord={anchor}>
          <span
            className="block whitespace-nowrap rounded border px-2 py-1 text-center"
            style={MUTED_CHIP_STYLE}
          >
            <span className="block text-[11px] font-semibold">{domain.name}</span>
            <span className="block text-[9px] italic">unclaimed — wants an owner</span>
          </span>
        </MapLabel>
      </>
    );
  }

  return (
    <>
      <FixedBuilding
        kind={owner.kind === "colleague" ? "colleague" : "human"}
        coord={anchor}
        ownerId={owner.id}
      />
      <MapLabel coord={anchor}>
        <span
          className="block whitespace-nowrap rounded border px-2 py-1 text-center"
          style={LABEL_CHIP_STYLE}
        >
          <span className="block text-[11px] font-semibold">{owner.name}</span>
          <span className="block text-[9px]" style={{ color: OWNER_VIEW_COLORS.label.subtext }}>
            {domain.name}
          </span>
        </span>
      </MapLabel>
    </>
  );
}

function LockedSeatPlot({ seat }: { seat: LockedSeat }) {
  return (
    <>
      <FixedBuilding kind="locked-seat" coord={seat.coord} />
      <MapLabel coord={seat.coord}>
        <span
          className="whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px] italic"
          style={MUTED_CHIP_STYLE}
        >
          Locked seat
        </span>
      </MapLabel>
    </>
  );
}

type OwnerViewLayerProps = {
  layout: OwnerViewLayout;
};

/**
 * Contains sprite-texture load failures (a rejected useLoader throws on
 * render) inside the layer: sprites are decorative, so on error the whole
 * overlay drops to nothing instead of collapsing the /dev/map route to the
 * route-level error boundary — the ground grid, HUD, and toggle survive.
 */
class SpriteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function OwnerViewLayer({ layout }: OwnerViewLayerProps) {
  return (
    // The error boundary contains sprite-load failures; Suspense holds
    // sprite-texture loading (useLoader) inside the layer so the ground
    // grid renders immediately.
    <SpriteErrorBoundary>
      <Suspense fallback={null}>
        {layout.territories.map((territory) => (
          <group key={territory.domain.id}>
            <TerritoryTint territory={territory} />
            <TerritoryAnchor territory={territory} />
            {territory.work.map((marker) => (
              <WorkMarker key={marker.entity.id} marker={marker} />
            ))}
          </group>
        ))}
        {layout.seats.map((seat) => (
          <LockedSeatPlot key={seat.id} seat={seat} />
        ))}
      </Suspense>
    </SpriteErrorBoundary>
  );
}
