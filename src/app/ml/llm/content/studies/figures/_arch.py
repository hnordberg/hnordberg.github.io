"""
Minimal grid-based architecture diagram helper.

Zero dependencies (stdlib only). Primitives are Box, Circle, Arrow, Label.
Coordinates are expressed in grid cells (GRID px per cell); arrow endpoints
are computed from box/circle edges, never typed. render() returns an SVG
string sized to the bounding box of all drawn elements plus padding.
"""

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


def _escape(text: str) -> str:
    """Escape &, <, > for safe inclusion inside SVG text nodes."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

GRID = 20
BG = "#1a202c"
FG = "#cbd5e0"
BLUE = "#63b3ed"
ORG = "#f6ad55"
GRN = "#68d391"
DARK = "#2d3748"
GRAY = "#4a5568"
RED = "#fc8181"

Point = Tuple[float, float]


@dataclass
class Box:
    col: int
    row: int
    w: int = 6
    h: int = 2
    label: str = ""
    fill: str = DARK
    stroke: str = FG
    font_size: int = 12

    def x(self) -> float:
        return self.col * GRID

    def y(self) -> float:
        return self.row * GRID

    def width_px(self) -> float:
        return self.w * GRID

    def height_px(self) -> float:
        return self.h * GRID

    def cx(self) -> float:
        return self.x() + self.width_px() / 2

    def cy(self) -> float:
        return self.y() + self.height_px() / 2

    def top(self) -> Point:
        return (self.cx(), self.y())

    def bottom(self) -> Point:
        return (self.cx(), self.y() + self.height_px())

    def left(self) -> Point:
        return (self.x(), self.cy())

    def right(self) -> Point:
        return (self.x() + self.width_px(), self.cy())


@dataclass
class Circle:
    col: float
    row: float
    r: int = 10
    label: str = ""
    fill: str = DARK
    stroke: str = ORG
    font_size: int = 14
    font_weight: str = "bold"

    def cx(self) -> float:
        return self.col * GRID

    def cy(self) -> float:
        return self.row * GRID

    def top(self) -> Point:
        return (self.cx(), self.cy() - self.r)

    def bottom(self) -> Point:
        return (self.cx(), self.cy() + self.r)

    def left(self) -> Point:
        return (self.cx() - self.r, self.cy())

    def right(self) -> Point:
        return (self.cx() + self.r, self.cy())


@dataclass
class Arrow:
    start: Point
    end: Point
    color: str = FG
    via: Optional[List[Point]] = None
    dashed: bool = False


@dataclass
class Label:
    x: float
    y: float
    text: str
    fill: str = FG
    font_size: int = 11
    anchor: str = "middle"
    weight: str = "normal"


def _box_svg(b: Box) -> str:
    return (
        f'<rect x="{b.x()}" y="{b.y()}" width="{b.width_px()}" '
        f'height="{b.height_px()}" rx="4" fill="{b.fill}" '
        f'stroke="{b.stroke}" stroke-width="1.5"/>'
        f'<text x="{b.cx()}" y="{b.cy() + 4}" fill="{FG}" '
        f'font-family="sans-serif" font-size="{b.font_size}" '
        f'text-anchor="middle">{_escape(b.label)}</text>'
    )


def _circle_svg(c: Circle) -> str:
    return (
        f'<circle cx="{c.cx()}" cy="{c.cy()}" r="{c.r}" fill="{c.fill}" '
        f'stroke="{c.stroke}" stroke-width="1.5"/>'
        f'<text x="{c.cx()}" y="{c.cy() + 5}" fill="{FG}" '
        f'font-family="sans-serif" font-size="{c.font_size}" '
        f'font-weight="{c.font_weight}" text-anchor="middle">{_escape(c.label)}</text>'
    )


def _arrow_svg(a: Arrow) -> str:
    dash = ' stroke-dasharray="4 3"' if a.dashed else ""
    if a.via:
        pts = [a.start] + list(a.via) + [a.end]
        d = "M " + " L ".join(f"{x} {y}" for x, y in pts)
        return (
            f'<path d="{d}" fill="none" stroke="{a.color}" '
            f'stroke-width="2"{dash} marker-end="url(#arrow)"/>'
        )
    return (
        f'<line x1="{a.start[0]}" y1="{a.start[1]}" '
        f'x2="{a.end[0]}" y2="{a.end[1]}" stroke="{a.color}" '
        f'stroke-width="2"{dash} marker-end="url(#arrow)"/>'
    )


def _label_svg(l: Label) -> str:
    return (
        f'<text x="{l.x}" y="{l.y}" fill="{l.fill}" font-family="sans-serif" '
        f'font-size="{l.font_size}" font-weight="{l.weight}" '
        f'text-anchor="{l.anchor}">{_escape(l.text)}</text>'
    )


def render(
    boxes: List[Box],
    circles: Optional[List[Circle]] = None,
    arrows: Optional[List[Arrow]] = None,
    labels: Optional[List[Label]] = None,
    padding: int = 24,
    max_width_css: int = 680,
) -> str:
    circles = circles or []
    arrows = arrows or []
    labels = labels or []

    xs: List[float] = []
    ys: List[float] = []
    for b in boxes:
        xs += [b.x(), b.x() + b.width_px()]
        ys += [b.y(), b.y() + b.height_px()]
    for c in circles:
        xs += [c.cx() - c.r, c.cx() + c.r]
        ys += [c.cy() - c.r, c.cy() + c.r]
    for a in arrows:
        for p in [a.start, a.end] + list(a.via or []):
            xs.append(p[0])
            ys.append(p[1])
    for l in labels:
        xs.append(l.x)
        ys.append(l.y)

    minx = min(xs) - padding
    miny = min(ys) - padding
    maxx = max(xs) + padding
    maxy = max(ys) + padding
    width = maxx - minx
    height = maxy - miny

    parts: List[str] = []
    parts.append(
        f'<svg viewBox="{minx} {miny} {width} {height}" '
        f'xmlns="http://www.w3.org/2000/svg" '
        f'style="display:block; margin:12px auto; max-width:{max_width_css}px; '
        f'border-radius:8px; overflow:hidden;">'
    )
    parts.append(
        '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" '
        'markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
        f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{FG}"/>'
        "</marker></defs>"
    )
    parts.append(
        f'<rect x="{minx}" y="{miny}" width="{width}" height="{height}" '
        f'fill="{BG}"/>'
    )
    for b in boxes:
        parts.append(_box_svg(b))
    for c in circles:
        parts.append(_circle_svg(c))
    for a in arrows:
        parts.append(_arrow_svg(a))
    for l in labels:
        parts.append(_label_svg(l))
    parts.append("</svg>")
    return "\n".join(parts)


def validate_svg(svg_string: str) -> None:
    """Parse the SVG as XML; raise ValueError with location on failure."""
    try:
        ET.fromstring(svg_string)
    except ET.ParseError as e:
        raise ValueError(
            f"Generated SVG is not valid XML: {e}. "
            f"Common causes: unescaped '&' (use &amp;), "
            f"unescaped '<' / '>' in text (use &lt; / &gt;), "
            f"or an unclosed tag."
        ) from e


def save(svg_string: str, path: str) -> None:
    """Validate and write the SVG. Raises if the string is not valid XML."""
    validate_svg(svg_string)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_string + "\n")
