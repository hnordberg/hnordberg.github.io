"""
VAE reparameterization trick diagram.

Shows how sampling z ~ q_φ(z | x) is re-expressed as
z = μ + σ ⊙ ε  with  ε ~ 𝒩(0, I), so gradients flow through the
deterministic path μ, σ instead of through the stochastic sample.
Structural (Class A) — no data.
"""

import os
import sys

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
FIGURES_DIR = os.path.dirname(THIS_DIR)
sys.path.insert(0, FIGURES_DIR)

from _arch import (  # noqa: E402
    GRID, FG, BLUE, ORG, GRN, DARK, GRAY,
    Box, Circle, Arrow, Label, render, save,
)

# Columns
C_X = 3
C_ENC = 10
C_MUSIG = 20
C_OP = 26
C_Z = 32
C_DEC = 38
C_XHAT = 45

# Rows
R_MAIN = 8
R_EPS = 14
R_NOISE = 4

# --- Input x ---
x_box = Box(col=C_X - 2, row=R_MAIN - 1, w=4, h=2, label="x",
            stroke=GRN, font_size=14)

# --- Encoder network ---
enc_box = Box(col=C_ENC - 3, row=R_MAIN - 1, w=6, h=2,
              label="Encoder q_φ", stroke=BLUE)

# --- μ and σ outputs ---
mu_box = Box(col=C_MUSIG - 2, row=R_MAIN - 2, w=4, h=1,
             label="μ_φ(x)", stroke=FG, font_size=12)
sig_box = Box(col=C_MUSIG - 2, row=R_MAIN + 1, w=4, h=1,
              label="σ_φ(x)", stroke=FG, font_size=12)

# --- Ops: μ + σ ⊙ ε produces z ---
plus_node = Circle(col=C_OP, row=R_MAIN, r=12, label="+", stroke=ORG)
times_node = Circle(col=C_OP - 2, row=R_MAIN + 2, r=10, label="×",
                    stroke=ORG, font_size=13)

# --- ε (external noise) ---
eps_node = Circle(col=C_OP, row=R_EPS, r=14, label="ε", stroke=ORG,
                  font_size=13)

# --- z ---
z_box = Box(col=C_Z - 2, row=R_MAIN - 1, w=4, h=2, label="z",
            stroke=BLUE, font_size=14)

# --- Decoder ---
dec_box = Box(col=C_DEC - 3, row=R_MAIN - 1, w=6, h=2,
              label="Decoder p_θ", stroke=BLUE)

# --- Reconstruction ---
xhat_box = Box(col=C_XHAT - 2, row=R_MAIN - 1, w=4, h=2, label="x̂",
               stroke=GRN, font_size=14)

boxes = [x_box, enc_box, mu_box, sig_box, z_box, dec_box, xhat_box]
circles = [plus_node, times_node, eps_node]
arrows: list = []
labels: list = []


def v(a, b, color=FG, via=None, dashed=False):
    arrows.append(Arrow(start=a, end=b, color=color, via=via, dashed=dashed))


# x -> encoder
v(x_box.right(), enc_box.left())

# encoder -> μ and σ (split)
v(enc_box.right(), mu_box.left())
v(enc_box.right(), sig_box.left())

# μ -> + node (horizontal then into plus)
v(mu_box.right(), plus_node.left())

# σ -> × node
v(sig_box.right(), times_node.left())

# ε -> × node (so × computes σ ⊙ ε)
v(eps_node.top(), times_node.bottom())

# × -> + node (so + computes μ + (σ ⊙ ε))
v(times_node.top(), plus_node.bottom())

# + -> z
v(plus_node.right(), z_box.left())

# z -> decoder
v(z_box.right(), dec_box.left())

# decoder -> x̂
v(dec_box.right(), xhat_box.left())

# Label on ε source
labels.append(Label(
    x=eps_node.cx(), y=eps_node.cy() + eps_node.r + 16,
    text="ε ~ 𝒩(0, I)", font_size=11, fill=ORG, weight="bold",
))

# Label on z explaining the formula
labels.append(Label(
    x=z_box.cx(), y=z_box.y() - 10,
    text="z = μ + σ ⊙ ε", font_size=12, fill=BLUE, weight="bold",
))

# Gradient-flow annotation: highlight that gradients flow through μ, σ
labels.append(Label(
    x=(enc_box.cx() + z_box.cx()) / 2,
    y=enc_box.y() + enc_box.height_px() + 52,
    text="gradients flow through deterministic path (μ, σ)",
    font_size=11, fill=GRN,
))
labels.append(Label(
    x=eps_node.cx() + eps_node.r + 100,
    y=eps_node.cy() + 4,
    text="noise is external — not differentiated",
    font_size=11, fill=GRAY, anchor="start",
))

svg = render(boxes=boxes, circles=circles, arrows=arrows, labels=labels,
             padding=28, max_width_css=820)
out_path = os.path.join(THIS_DIR, "reparameterization.svg")
save(svg, out_path)
print(f"Wrote {out_path} ({len(svg)} bytes)")
