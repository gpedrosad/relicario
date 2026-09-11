/**
 * La geometría exacta se aplica con la máscara y el compositor, no como texto
 * sobre la imagen: tablas de coordenadas pueden inducir diagramas o rótulos.
 */
export function buildRelicarioPrompt({ completeTop }: { completeTop: boolean }) {
  return [
    "A seamless, natural photographic continuation of the supplied photograph, with the same scene, perspective, lighting, exposure, colors and depth of field. The photograph fills the entire output edge to edge.",
    "The supplied binary mask defines the exact editable area: preserve the black region; replace every white region with a coherent continuation of the photograph. Stretched colors in the white region are temporary padding, not objects or patterns to keep. All existing people and photographic content must remain identical in the black region, including faces, expressions, clothing, poses and proportions. Do not zoom, crop, stretch, rotate, move or redraw them.",
    completeTop
      ? "Above the cropped top edge, complete the missing top of the person's head with ordinary natural hair matching the visible hairstyle, color and anatomy. Add only the missing continuation, leaving some background above the hair. No headwear, accessories or decorations."
      : "The heads are already complete. Continue only the surrounding background, without extending, duplicating or adding people.",
    "Keep the extended background quiet and consistent with the existing scenery so the original people remain the focus. Join all edges smoothly, without visible rectangular seams, stretched stripes, mirrored details or blank areas. Output a photograph only. No text, labels, diagrams, colored borders, decorative frames, watermarks, extra people, faces or props.",
  ].join("\n\n");
}
