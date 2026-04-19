"""
VAE graphical model: amortized inference.

Two nodes, z (latent) and x (observed/shaded). Solid arrow z → x is the
generative path p_θ(x | z); dashed arrow x → z is the recognition /
variational approximation q_φ(z | x). Structural (Class A) — no data.
"""

import os
import sys

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
FIGURES_DIR = os.path.dirname(THIS_DIR)
sys.path.insert(0, FIGURES_DIR)

from _arch import (  # noqa: E402
    GRID, FG, BLUE, ORG, GRN, DARK, GRAY,
    Circle, Arrow, Label, render, save,
)

# Two nodes on a horizontal row
z_node = Circle(col=6, row=6, r=22, label="z", stroke=BLUE, font_size=16)
x_node = Circle(col=16, row=6, r=22, label="x", fill=GRAY, stroke=FG,
                font_size=16)

circles = [z_node, x_node]

# Prior label above z
labels = [
    Label(x=z_node.cx(), y=z_node.cy() - z_node.r - 10,
          text="p(z) = 𝒩(0, I)", font_size=11, fill=BLUE),
    Label(x=x_node.cx(), y=x_node.cy() - x_node.r - 10,
          text="observed", font_size=11, fill=FG),
]

# Solid arrow z -> x (generative, above the line)
gen_start = z_node.right()
gen_end = x_node.left()
gen_mid_y = (gen_start[1] + gen_end[1]) / 2 - 28
arrows = [
    Arrow(
        start=gen_start,
        end=gen_end,
        via=[(gen_start[0] + 10, gen_mid_y),
             (gen_end[0] - 10, gen_mid_y)],
        color=BLUE,
    ),
]
labels.append(Label(
    x=(gen_start[0] + gen_end[0]) / 2,
    y=gen_mid_y - 6,
    text="p_θ(x | z)   generative",
    font_size=12, fill=BLUE, weight="bold",
))

# Dashed arrow x -> z (recognition, below the line)
rec_start = x_node.left()
rec_end = z_node.right()
rec_mid_y = (rec_start[1] + rec_end[1]) / 2 + 28
arrows.append(Arrow(
    start=rec_start,
    end=rec_end,
    via=[(rec_start[0] - 10, rec_mid_y),
         (rec_end[0] + 10, rec_mid_y)],
    color=ORG,
    dashed=True,
))
labels.append(Label(
    x=(rec_start[0] + rec_end[0]) / 2,
    y=rec_mid_y + 18,
    text="q_φ(z | x)   recognition  (amortized)",
    font_size=12, fill=ORG, weight="bold",
))

# Bottom caption: the "amortized" punchline
labels.append(Label(
    x=(z_node.cx() + x_node.cx()) / 2,
    y=x_node.cy() + x_node.r + 50,
    text="One encoder network predicts q_φ(z | x) for every x — not per-datapoint.",
    font_size=11, fill=FG,
))

svg = render(boxes=[], circles=circles, arrows=arrows, labels=labels,
             padding=28, max_width_css=560)
out_path = os.path.join(THIS_DIR, "graphical_model.svg")
save(svg, out_path)
print(f"Wrote {out_path} ({len(svg)} bytes)")
