#!/usr/bin/env python3
"""Aplana, recorta fondo y abre el hueco del corazón derecho."""

from __future__ import annotations

import argparse
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ALPHA_CUT = 16
SEED_X_RATIO = 0.727
SEED_Y_RATIO = 0.605
TARGET = (1536, 1024)


def flatten_white(src: Path, dest: Path) -> None:
    image = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", image.size, (255, 255, 255, 255))
    Image.alpha_composite(bg, image).convert("RGB").save(dest, "PNG")


def hole_mask(image: Image.Image) -> set[tuple[int, int]]:
    w, h = image.size
    px = image.load()
    seed = (min(w - 1, max(0, round(w * SEED_X_RATIO))), min(h - 1, max(0, round(h * SEED_Y_RATIO))))
    visited: set[tuple[int, int]] = set()
    stack = deque([seed])

    def is_hole(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a < ALPHA_CUT:
            return True
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
        return a > 200 and luma >= 245 and max(r, g, b) - min(r, g, b) < 18

    if not is_hole(*seed):
        return set()

    while stack:
        x, y = stack.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        if not is_hole(x, y):
            continue
        visited.add((x, y))
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return visited


def copy_alpha(src: Path, dest: Path, reference: Path) -> dict[str, int]:
    image = Image.open(src).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    ref = Image.open(reference).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    r, g, b, _ = image.split()
    a = ref.split()[3]
    Image.merge("RGBA", (r, g, b, a)).save(dest, "PNG")
    hole = hole_mask(Image.merge("RGBA", (r, g, b, a)))
    if not hole:
        raise SystemExit("No se encontró el hueco tras copiar el alpha")
    xs = [x for x, _ in hole]
    ys = [y for _, y in hole]
    return {
        "pixels": len(hole),
        "minX": min(xs),
        "minY": min(ys),
        "maxX": max(xs),
        "maxY": max(ys),
        "width": max(xs) - min(xs) + 1,
        "height": max(ys) - min(ys) + 1,
    }


def is_paper_white(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a < ALPHA_CUT:
        return True
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luma >= 245 and max(r, g, b) - min(r, g, b) < 18


def flood(image: Image.Image, seeds: list[tuple[int, int]], pred) -> set[tuple[int, int]]:
    w, h = image.size
    px = image.load()
    visited: set[tuple[int, int]] = set()
    stack = deque(seeds)
    while stack:
        x, y = stack.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        if not pred(px[x, y]):
            continue
        visited.add((x, y))
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return visited


def finish_llavero(src: Path, dest: Path) -> dict[str, int]:
    """Fondo y huecos a alpha 0; contain en 1536×1024 sin estirar."""
    image = Image.open(src).convert("RGBA")
    w, h = image.size
    px = image.load()
    border = (
        [(x, 0) for x in range(w)]
        + [(x, h - 1) for x in range(w)]
        + [(0, y) for y in range(h)]
        + [(w - 1, y) for y in range(h)]
    )
    exterior = flood(image, border, is_paper_white)

    seen = set(exterior)
    interiors: list[set[tuple[int, int]]] = []
    for y in range(h):
        for x in range(w):
            if (x, y) in seen or not is_paper_white(px[x, y]):
                continue
            region = flood(image, [(x, y)], is_paper_white)
            seen |= region
            if len(region) >= 2000:
                interiors.append(region)

    clear = set(exterior)
    heart: set[tuple[int, int]] = set()
    if interiors:
        interiors.sort(key=len, reverse=True)
        # El hueco del corazón vive más abajo que la argolla.
        heart = max(interiors, key=lambda region: sum(y for _, y in region) / len(region))
        clear |= heart
        for region in interiors:
            clear |= region

    for x, y in clear:
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)

    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
        w, h = image.size

    dest.parent.mkdir(parents=True, exist_ok=True)
    if w >= h:
        canvas = image.resize(TARGET, Image.Resampling.LANCZOS)
        fitted = canvas
    else:
        canvas = Image.new("RGBA", TARGET, (0, 0, 0, 0))
        scale = min(TARGET[0] / w, TARGET[1] / h)
        fitted = image.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)
        canvas.paste(fitted, ((TARGET[0] - fitted.size[0]) // 2, (TARGET[1] - fitted.size[1]) // 2), fitted)
    canvas.save(dest, "PNG")

    hole = hole_mask(canvas)
    if not hole:
        return {"pixels": 0, "width": 0, "height": 0, "fittedW": fitted.size[0], "fittedH": fitted.size[1]}
    xs = [x for x, _ in hole]
    ys = [y for _, y in hole]
    return {
        "pixels": len(hole),
        "minX": min(xs),
        "minY": min(ys),
        "maxX": max(xs),
        "maxY": max(ys),
        "width": max(xs) - min(xs) + 1,
        "height": max(ys) - min(ys) + 1,
        "fittedW": fitted.size[0],
        "fittedH": fitted.size[1],
    }


def cut_white(image: Image.Image) -> Image.Image:
    px = image.load()
    w, h = image.size
    for y in range(h):
        for x in range(w):
            if is_paper_white(px[x, y]):
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


def alpha_hole(image: Image.Image, seed: tuple[int, int]) -> set[tuple[int, int]]:
    w, h = image.size
    px = image.load()
    visited: set[tuple[int, int]] = set()
    stack = deque([seed])
    while stack:
        x, y = stack.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        if px[x, y][3] >= ALPHA_CUT:
            continue
        visited.add((x, y))
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return visited


def enclosed_heart(image: Image.Image) -> set[tuple[int, int]]:
    w, h = image.size
    border = (
        [(x, 0) for x in range(w)]
        + [(x, h - 1) for x in range(w)]
        + [(0, y) for y in range(h)]
        + [(w - 1, y) for y in range(h)]
    )
    exterior = flood(image, border, lambda p: p[3] < ALPHA_CUT)
    px = image.load()
    seen = set(exterior)
    best: set[tuple[int, int]] = set()
    for y in range(h):
        for x in range(w):
            if (x, y) in seen or px[x, y][3] >= ALPHA_CUT:
                continue
            region = alpha_hole(image, (x, y))
            seen |= region
            if len(region) > len(best):
                best = region
    return best


def hole_info(hole: set[tuple[int, int]]) -> dict[str, float | int]:
    xs = [x for x, _ in hole]
    ys = [y for _, y in hole]
    cx = sum(xs) / len(hole)
    cy = sum(ys) / len(hole)
    return {
        "pixels": len(hole),
        "minX": min(xs),
        "minY": min(ys),
        "maxX": max(xs),
        "maxY": max(ys),
        "width": max(xs) - min(xs) + 1,
        "height": max(ys) - min(ys) + 1,
        "centroidX": round(cx, 1),
        "centroidY": round(cy, 1),
        "seedXRatio": round(cx / TARGET[0], 4),
        "seedYRatio": round(cy / TARGET[1], 4),
    }


def compose_llavero(base_path: Path, ring_path: Path, dest: Path) -> dict[str, object]:
    """Relicario más chico + argolla grande. El hueco escala con el relicario."""
    locket_scale = 0.58
    ring_d = 468
    bottom_margin = 56

    base = Image.open(base_path).convert("RGBA")
    bbox = base.getbbox()
    if not bbox:
        raise SystemExit("El plateado no tiene contenido")
    cropped = base.crop(bbox)
    scaled = cropped.resize(
        (max(1, round(cropped.size[0] * locket_scale)), max(1, round(cropped.size[1] * locket_scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", TARGET, (0, 0, 0, 0))
    paste_x = (TARGET[0] - scaled.size[0]) // 2
    paste_y = TARGET[1] - bottom_margin - scaled.size[1]
    canvas.paste(scaled, (paste_x, paste_y), scaled)

    hole = enclosed_heart(canvas)
    if len(hole) < 1000:
        raise SystemExit("No se encontró el hueco tras achicar el relicario")

    ring = cut_white(Image.open(ring_path).convert("RGBA"))
    scale = ring_d / max(ring.size)
    ring = ring.resize(
        (max(1, round(ring.size[0] * scale)), max(1, round(ring.size[1] * scale))),
        Image.Resampling.LANCZOS,
    )

    # Bail: metal más alto en la mitad derecha del relicario pegado.
    px = canvas.load()
    bail_xs: list[int] = []
    bail_y = paste_y
    right0 = paste_x + scaled.size[0] // 2
    for y in range(paste_y, paste_y + 80):
        found = [x for x in range(right0, paste_x + scaled.size[0]) if px[x, y][3] >= ALPHA_CUT]
        if found:
            bail_xs = found
            bail_y = y
            break
    bail_cx = sum(bail_xs) / len(bail_xs) if bail_xs else paste_x + int(scaled.size[0] * 0.72)
    ring_cx = int(bail_cx)
    ring_cy = int(bail_y - ring.size[1] * 0.38)
    x0 = ring_cx - ring.size[0] // 2
    y0 = max(8, ring_cy - ring.size[1] // 2)

    rp = ring.load()
    painted = 0
    for y in range(ring.size[1]):
        for x in range(ring.size[0]):
            px_, py_ = x0 + x, y0 + y
            if px_ < 0 or py_ < 0 or px_ >= TARGET[0] or py_ >= TARGET[1]:
                continue
            if (px_, py_) in hole:
                continue
            r, g, b, a = rp[x, y]
            if a < 16:
                continue
            px[px_, py_] = (r, g, b, 255)
            painted += 1

    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, "PNG")
    info = hole_info(hole)
    info.update(
        {
            "painted": painted,
            "locket": f"{scaled.size[0]}x{scaled.size[1]}@{paste_x},{paste_y}",
            "ring": f"{ring.size[0]}x{ring.size[1]}@{x0},{y0}",
            "scale": locket_scale,
        }
    )
    return info


def attach_ring(base_path: Path, ring_path: Path, dest: Path) -> dict[str, int]:
    """Pega la argolla sobre el plateado sin tocar el hueco del colgante."""
    base = Image.open(base_path).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    hole = hole_mask(base)
    if not hole:
        raise SystemExit("No se encontró el hueco del colgante")

    ring = cut_white(Image.open(ring_path).convert("RGBA"))
    target_d = 304
    scale = target_d / max(ring.size)
    ring = ring.resize(
        (max(1, round(ring.size[0] * scale)), max(1, round(ring.size[1] * scale))),
        Image.Resampling.LANCZOS,
    )

    # Más grande, enganchada al bail, sin tapar el hueco.
    cx, cy = 1290, 168
    x0 = cx - ring.size[0] // 2
    y0 = cy - ring.size[1] // 2

    out = base.copy()
    rp = ring.load()
    op = out.load()
    painted = 0
    for y in range(ring.size[1]):
        for x in range(ring.size[0]):
            px_, py_ = x0 + x, y0 + y
            if px_ < 0 or py_ < 0 or px_ >= TARGET[0] or py_ >= TARGET[1]:
                continue
            if (px_, py_) in hole:
                continue
            r, g, b, a = rp[x, y]
            if a < 16:
                continue
            op[px_, py_] = (r, g, b, 255)
            painted += 1

    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG")

    gold_hole = hole_mask(base)
    new_hole = hole_mask(out)
    return {
        "painted": painted,
        "holePixels": len(new_hole),
        "holeDiff": len(gold_hole.symmetric_difference(new_hole)),
        "ring": f"{ring.size[0]}x{ring.size[1]}@{x0},{y0}",
    }


def keep_locket_add_metal(base_path: Path, generated_path: Path, dest: Path) -> dict[str, int]:
    """Conserva el relicario y el hueco; solo suma metal nuevo del generate."""
    base = Image.open(base_path).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    gen = Image.open(generated_path).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    hole = hole_mask(base)
    if not hole:
        raise SystemExit("No se encontró el hueco del colgante")

    out = base.copy()
    bp = base.load()
    gp = gen.load()
    op = out.load()
    painted = 0
    for y in range(TARGET[1]):
        for x in range(TARGET[0]):
            if (x, y) in hole:
                continue
            if bp[x, y][3] >= ALPHA_CUT:
                continue
            if is_paper_white(gp[x, y]):
                continue
            if gp[x, y][3] < ALPHA_CUT:
                continue
            op[x, y] = (*gp[x, y][:3], 255)
            painted += 1

    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "PNG")
    new_hole = hole_mask(out)
    return {
        "painted": painted,
        "holePixels": len(new_hole),
        "holeDiff": len(hole.symmetric_difference(new_hole)),
    }


def punch_hole(src: Path, dest: Path, reference: Path | None) -> dict[str, int]:
    image = Image.open(src).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)
    mask_source = image
    if reference is not None:
        mask_source = Image.open(reference).convert("RGBA").resize(TARGET, Image.Resampling.LANCZOS)

    hole = hole_mask(mask_source)
    if not hole and reference is not None:
        hole = hole_mask(image)
    if not hole:
        raise SystemExit("No se encontró el hueco del corazón derecho")

    px = image.load()
    min_x, min_y = TARGET
    max_x = max_y = 0
    for x, y in hole:
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x)
        max_y = max(max_y, y)

    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "PNG")
    return {
        "pixels": len(hole),
        "minX": min_x,
        "minY": min_y,
        "maxX": max_x,
        "maxY": max_y,
        "width": max_x - min_x + 1,
        "height": max_y - min_y + 1,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command",
        choices=(
            "flatten",
            "punch",
            "copy-alpha",
            "finish-llavero",
            "attach-ring",
            "keep-locket",
            "compose-llavero",
        ),
    )
    parser.add_argument("--src", required=True)
    parser.add_argument("--dest", required=True)
    parser.add_argument("--reference")
    args = parser.parse_args()
    src = Path(args.src)
    dest = Path(args.dest)

    if args.command == "flatten":
        flatten_white(src, dest)
        print(f"flatten {dest}")
        return 0

    if args.command == "compose-llavero":
        if not args.reference:
            raise SystemExit("compose-llavero necesita --reference (el PNG del relicario)")
        info = compose_llavero(Path(args.reference), src, dest)
        print(f"compose-llavero {dest} {info}")
        return 0

    if args.command == "attach-ring":
        if not args.reference:
            raise SystemExit("attach-ring necesita --reference (el PNG del relicario)")
        info = attach_ring(Path(args.reference), src, dest)
        print(f"attach-ring {dest} {info}")
        return 0

    if args.command == "keep-locket":
        if not args.reference:
            raise SystemExit("keep-locket necesita --reference (el PNG del relicario)")
        info = keep_locket_add_metal(Path(args.reference), src, dest)
        print(f"keep-locket {dest} {info}")
        return 0

    if args.command == "finish-llavero":
        info = finish_llavero(src, dest)
        print(f"finish-llavero {dest} {info}")
        return 0

    if args.command == "copy-alpha":
        if not args.reference:
            raise SystemExit("copy-alpha necesita --reference")
        info = copy_alpha(src, dest, Path(args.reference))
        print(f"copy-alpha {dest} {info}")
        return 0

    info = punch_hole(src, dest, Path(args.reference) if args.reference else None)
    print(f"punch {dest} {info}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
