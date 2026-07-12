// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/ProjectSprite.tsx
// (lifebuild @ bf183a3): the little geometric house that sits on a project
// tile. Era-modernization at promotion: pigments consolidated into ./colors
// (the vendored file carried its own hex literals and a private color
// mixer), plain function component, and the gold/silver/bronze workstream
// tiers + 4-stage drafting states stripped per plan §2 (M1 projects are
// active | completed; completed keeps Lifebuild's "victories stay visible"
// desaturation).

import { useMemo } from "react";
import { PROJECT_SPRITE_COLORS, mixHexColors } from "./colors";

const COMPLETED_DESATURATE_WEIGHT = 0.68;
const COMPLETED_OPACITY = 0.78;

type ProjectSpriteProps = {
  isCompleted?: boolean;
};

export function ProjectSprite({ isCompleted = false }: ProjectSpriteProps) {
  const desaturateWeight = isCompleted ? COMPLETED_DESATURATE_WEIGHT : 0;
  const opacity = isCompleted ? COMPLETED_OPACITY : 1;

  const bodyColor = useMemo(
    () =>
      mixHexColors(
        PROJECT_SPRITE_COLORS.body,
        PROJECT_SPRITE_COLORS.bodyDesaturationTarget,
        desaturateWeight,
      ),
    [desaturateWeight],
  );
  const roofColor = useMemo(
    () =>
      mixHexColors(
        PROJECT_SPRITE_COLORS.roof,
        PROJECT_SPRITE_COLORS.roofDesaturationTarget,
        desaturateWeight,
      ),
    [desaturateWeight],
  );
  const accentColor = useMemo(
    () =>
      mixHexColors(
        PROJECT_SPRITE_COLORS.accent,
        PROJECT_SPRITE_COLORS.accentDesaturationTarget,
        desaturateWeight,
      ),
    [desaturateWeight],
  );

  return (
    <group position={[0, 0.28, 0.06]} rotation={[-0.52, 0, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.56, 0.34, 0.44]} />
        <meshStandardMaterial
          color={PROJECT_SPRITE_COLORS.border}
          emissive={PROJECT_SPRITE_COLORS.border}
          emissiveIntensity={0.02}
          roughness={0.6}
          metalness={0.08}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.46, 0.28, 0.34]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.55}
          metalness={0.14}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.28]} />
        <meshStandardMaterial
          color={roofColor}
          roughness={0.55}
          metalness={0.18}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0.17, 0.19]}>
        <boxGeometry args={[0.16, 0.14, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.45}
          metalness={0.04}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}
