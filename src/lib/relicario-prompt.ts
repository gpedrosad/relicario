/**
 * La geometría exacta se aplica con la máscara y el compositor, no como texto
 * sobre la imagen: tablas de coordenadas pueden inducir diagramas o rótulos.
 */
export function buildSquareOutpaintPrompt() {
  return [
    "Extend this photograph naturally to create a square composition.",
    "Preserve the exact identity, faces, facial features, hairstyle, expression and appearance of every visible person.",
    "Do not modify existing faces. Do not add or remove people.",
    "Extend only the necessary background and peripheral areas.",
    "If necessary, naturally continue visible shoulders, clothing or background.",
    "Keep all people comfortably centered with space around their heads and shoulders.",
    "Photorealistic and consistent with the original photograph.",
    "The supplied binary mask marks the only editable area: preserve the black region; generate only the white region.",
  ].join(" ");
}

export function buildRelicarioPrompt({ completeTop }: { completeTop: boolean }) {
  return [
    "A seamless, natural photographic continuation of the supplied photograph, with the same scene, perspective, lighting, exposure, colors and depth of field. The photograph fills the entire output edge to edge.",
    "The supplied binary mask defines the exact editable area: preserve the black region; replace every white region with a coherent continuation of the photograph. Stretched colors in the white region are temporary padding, not objects or patterns to keep. All existing people and photographic content must remain identical in the black region, including faces, expressions, clothing, poses and proportions. Do not zoom, crop, stretch, rotate, move or redraw them.",
    completeTop
      ? "If existing hair is cut by the top edge, continue only that same hair locally, keeping the person's existing face untouched. Never invent a missing face, eyes, nose, mouth or a second head. The rest of the new area must be unoccupied background. No headwear, accessories or decorations."
      : "The heads are already complete. Continue only the surrounding background, without extending, duplicating or adding people.",
    "Fill the new surroundings with unoccupied environmental context from the original scene: sky, foliage, walls, ground, water or soft scenery as appropriate. No bystanders, crowds, people in the distance, silhouettes, human reflections, faces in posters or repeated portraits. Keep the background quiet so the existing people remain the focus. Join all edges smoothly, without rectangular seams, stretched stripes, mirrored details or blank areas. Output a photograph only. No text, labels, diagrams, colored borders, decorative frames, watermarks or new props.",
  ].join("\n\n");
}
