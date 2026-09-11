import type { CSSProperties } from "react";

/** Width of the Figma frames the landing sections were designed in. */
export const FRAME_WIDTH = 1440;

const FRAME_VAR = "--landing-frame";

/** A length tied to the design frame, for use in inline styles. */
export const FRAME = `var(${FRAME_VAR})`;

/**
 * Put this on the element that background art is positioned inside.
 *
 * The frame is never narrower than the design, and grows with the viewport, so
 * the art always overshoots the section on wide screens instead of ending inside
 * it and showing the edge of its own bounding box.
 */
export const frameStyle = {
  [FRAME_VAR]: `max(${FRAME_WIDTH}px, 100vw)`,
} as CSSProperties;

/** Converts a design pixel value into a length that scales with the frame. */
export function scaled(px: number) {
  return `calc(${FRAME} * ${(px / FRAME_WIDTH).toFixed(6)})`;
}
