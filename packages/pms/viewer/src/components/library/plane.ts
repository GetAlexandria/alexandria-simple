export function formatPlaneLabel(plane: string): string {
  return plane
    .split(/[\s_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}
