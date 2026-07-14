// New V1 code (not a promotion). Canvas-texture text labels for the map:
// region names, context names, tile hover names, and the system tile's loop
// glyph. Lifebuild drew labels with drei's <Text> (troika SDF), which pulls
// its font over the network unless one ships locally; the Gate 3 checklist
// wants fonts resolved locally, so labels rasterize through an offscreen 2D
// canvas using the viewer's own font stack (Cormorant Garamond is already a
// viewer dependency, with a system-serif fallback) — zero network, zero new
// assets.
//
// Label systems, deliberately split: this MapLabel is canonical for
// in-scene world-space text (region/context/half names, tile names). The
// hex-anchored drei-Html chips (HexHtmlChip, via LandmarkTooltip) are the
// DOM-overlay system — landmark hover captions, the resting locked-seat
// marker — and stay separate.

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { CAMERA_ELEVATION_DEGREES } from "./CameraRig";
import { MAP_LABEL_COLORS } from "./colors";

/**
 * Rotation that leans an XY plane back toward the map's orthographic camera
 * — the vendored Lifebuild sprite tilt, deliberately partial (not a true
 * billboard) so labels and sprites keep a hint of the map's perspective.
 */
export const CAMERA_FACING_ROTATION_X = -Math.PI / 2 + (CAMERA_ELEVATION_DEGREES * Math.PI) / 180;

// Rasterization size; world size comes from the `height` prop.
const FONT_PX = 96;

// Direct navigation to /dev/map never mounts the library shell (the only
// other Cormorant Garamond user), and setting a canvas ctx.font does NOT
// trigger the @font-face download — without an explicit load, labels bake
// the Georgia fallback deterministically. Kick both used faces at module
// load; labels re-rasterize once the faces arrive.
let mapLabelFontsLoaded = false;
const mapLabelFontsReady: Promise<void> =
  typeof document !== "undefined" && "fonts" in document
    ? Promise.all([
        document.fonts.load(`600 ${FONT_PX}px "Cormorant Garamond"`),
        document.fonts.load(`italic 600 ${FONT_PX}px "Cormorant Garamond"`),
      ]).then(
        () => undefined,
        () => undefined,
      )
    : Promise.resolve();
void mapLabelFontsReady.then(() => {
  mapLabelFontsLoaded = true;
});

type MapLabelProps = {
  text: string;
  /** World position of the label's center. */
  position: readonly [number, number, number];
  /** World-unit height of the rendered line. */
  height: number;
  color: string;
  /** Parchment-cream stroke behind the glyphs. */
  haloColor?: string;
  /**
   * Optional filled rounded-rect backing plate drawn UNDER the halo+glyphs
   * for contrast against a busy map. Any CSS color; use an rgba() so the map
   * composites through it. Omit to keep the plain stroke-halo treatment.
   */
  plateColor?: string;
  opacity?: number;
  italic?: boolean;
  /** Extra tracking (em fraction), for cartographic uppercase region names. */
  letterSpacingEm?: number;
};

type LabelTexture = { texture: THREE.CanvasTexture; aspect: number };

function createLabelTexture(
  text: string,
  color: string,
  haloColor: string,
  plateColor: string,
  italic: boolean,
  letterSpacingEm: number,
): LabelTexture {
  const canvas = document.createElement("canvas");
  const font = `${italic ? "italic " : ""}600 ${FONT_PX}px "Cormorant Garamond", Georgia, "Times New Roman", serif`;
  const spacing = letterSpacingEm * FONT_PX;

  const measureContext = canvas.getContext("2d");
  if (!measureContext) {
    throw new Error("MapLabel requires a 2D canvas context");
  }
  measureContext.font = font;
  const characters = [...text];
  const textWidth =
    spacing === 0
      ? measureContext.measureText(text).width
      : characters.reduce((width, character) => {
          return width + measureContext.measureText(character).width;
        }, 0) +
        spacing * Math.max(0, characters.length - 1);

  const pad = FONT_PX * 0.45;
  // A backing plate wants breathing room around the glyphs. Grow the WIDTH
  // (not the height): the plane's world height comes from the `height` prop,
  // so widening only changes the aspect and leaves the on-screen glyph size
  // unchanged, while extra height would shrink the text. The existing 1.5×
  // height already leaves vertical margin the plate reuses.
  const plateExtraX = plateColor ? FONT_PX * 0.35 : 0;
  canvas.width = Math.max(2, Math.ceil(textWidth + (pad + plateExtraX) * 2));
  canvas.height = Math.ceil(FONT_PX * 1.5);

  // Resizing resets context state; reconfigure before drawing.
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("MapLabel requires a 2D canvas context");
  }
  context.font = font;
  context.textBaseline = "middle";
  context.lineJoin = "round";

  const drawText = (mode: "stroke" | "fill") => {
    const y = canvas.height / 2;
    if (spacing === 0) {
      // Single draw keeps native kerning when no tracking is requested.
      context.textAlign = "center";
      if (mode === "stroke") {
        context.strokeText(text, canvas.width / 2, y);
      } else {
        context.fillText(text, canvas.width / 2, y);
      }
      return;
    }
    context.textAlign = "left";
    // Same left margin baked into canvas.width above: `pad` alone when
    // unplated (identical to the pre-plate start position), plus
    // `plateExtraX` once a plate has widened the canvas.
    let x = pad + plateExtraX;
    for (const character of text) {
      if (mode === "stroke") {
        context.strokeText(character, x, y);
      } else {
        context.fillText(character, x, y);
      }
      x += context.measureText(character).width + spacing;
    }
  };

  // Backing plate first, UNDER the halo + glyphs. A rounded rect inset a
  // little from the texture edge so it reads as a floating nameplate, not a
  // full-bleed fill. arcTo (not roundRect) keeps the path portable.
  if (plateColor) {
    const plateMargin = FONT_PX * 0.06;
    const plateX = plateMargin;
    const plateY = plateMargin;
    const plateWidth = canvas.width - plateMargin * 2;
    const plateHeight = canvas.height - plateMargin * 2;
    const radius = Math.min(plateHeight * 0.32, plateWidth / 2, plateHeight / 2);
    context.beginPath();
    context.moveTo(plateX + radius, plateY);
    context.arcTo(plateX + plateWidth, plateY, plateX + plateWidth, plateY + plateHeight, radius);
    context.arcTo(plateX + plateWidth, plateY + plateHeight, plateX, plateY + plateHeight, radius);
    context.arcTo(plateX, plateY + plateHeight, plateX, plateY, radius);
    context.arcTo(plateX, plateY, plateX + plateWidth, plateY, radius);
    context.closePath();
    context.fillStyle = plateColor;
    context.fill();
  }

  if (haloColor) {
    context.strokeStyle = haloColor;
    context.lineWidth = FONT_PX * 0.14;
    context.globalAlpha = 0.85;
    drawText("stroke");
    context.globalAlpha = 1;
  }
  context.fillStyle = color;
  drawText("fill");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: canvas.width / canvas.height };
}

export function MapLabel({
  text,
  position,
  height,
  color,
  haloColor = MAP_LABEL_COLORS.halo,
  plateColor = "",
  opacity = 1,
  italic = false,
  letterSpacingEm = 0,
}: MapLabelProps) {
  const [fontsReady, setFontsReady] = useState(mapLabelFontsLoaded);

  useEffect(() => {
    if (fontsReady) {
      return;
    }
    let active = true;
    void mapLabelFontsReady.then(() => {
      if (active) {
        setFontsReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [fontsReady]);

  const label = useMemo(
    () => createLabelTexture(text, color, haloColor, plateColor, italic, letterSpacingEm),
    // fontsReady re-rasterizes the same text once Cormorant Garamond lands.
    [color, haloColor, plateColor, italic, letterSpacingEm, text, fontsReady],
  );

  useEffect(() => {
    return () => {
      label.texture.dispose();
    };
  }, [label]);

  return (
    <mesh
      position={[position[0], position[1], position[2]]}
      rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
      raycast={() => null}
    >
      <planeGeometry args={[height * label.aspect, height]} />
      <meshBasicMaterial
        map={label.texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
