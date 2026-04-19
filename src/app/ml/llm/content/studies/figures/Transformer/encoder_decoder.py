"""
Transformer encoder-decoder architecture diagram.

Structural redraw (Class A per PAPER_STUDY_SPEC.md §4.1) — no numerical
data from the paper, only block layout and data flow. Output:
encoder_decoder.svg alongside this file.
"""

import os
import sys

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
FIGURES_DIR = os.path.dirname(THIS_DIR)
sys.path.insert(0, FIGURES_DIR)

from _arch import (  # noqa: E402
    GRID, FG, BLUE, ORG, GRN, GRAY, DARK,
    Box, Circle, Arrow, Label, render, save,
)

# ---------------------------------------------------------------------------
# Column centers (in grid cells)
# ---------------------------------------------------------------------------
ENC_CX = 10
DEC_CX = 30

BOX_W = 12  # cells
BOX_H = 2
HALF = BOX_W // 2


def enc_box(row: int, label: str, stroke: str = BLUE) -> Box:
    return Box(col=ENC_CX - HALF, row=row, w=BOX_W, h=BOX_H, label=label, stroke=stroke)


def dec_box(row: int, label: str, stroke: str = ORG) -> Box:
    return Box(col=DEC_CX - HALF, row=row, w=BOX_W, h=BOX_H, label=label, stroke=stroke)


# ---------------------------------------------------------------------------
# Rows (top-down). Smaller row = higher on screen.
# ---------------------------------------------------------------------------
R_SOFTMAX = 2
R_LINEAR = 6
R_DEC_AN3 = 10
R_DEC_FFN = 13
R_DEC_AN2 = 17
R_DEC_XATTN = 20
R_DEC_AN1 = 24
R_DEC_MMHA = 27

R_ENC_AN2 = 17
R_ENC_FFN = 20
R_ENC_AN1 = 24
R_ENC_MHA = 27

R_PLUS = 31
R_EMB = 34
R_LABEL = 38

# ---------------------------------------------------------------------------
# Build the scene
# ---------------------------------------------------------------------------
boxes = []
circles = []
arrows = []
labels = []

# --- Encoder stack ---
enc_mha = enc_box(R_ENC_MHA, "Multi-Head Attention", stroke=BLUE)
enc_an1 = enc_box(R_ENC_AN1, "Add & Norm", stroke=FG)
enc_ffn = enc_box(R_ENC_FFN, "Feed Forward", stroke=BLUE)
enc_an2 = enc_box(R_ENC_AN2, "Add & Norm", stroke=FG)
enc_emb = enc_box(R_EMB, "Input Embedding", stroke=GRN)
boxes += [enc_mha, enc_an1, enc_ffn, enc_an2, enc_emb]

# --- Decoder stack ---
dec_mmha = dec_box(R_DEC_MMHA, "Masked Multi-Head Attention", stroke=ORG)
dec_an1 = dec_box(R_DEC_AN1, "Add & Norm", stroke=FG)
dec_xattn = dec_box(R_DEC_XATTN, "Multi-Head Attention", stroke=ORG)
dec_an2 = dec_box(R_DEC_AN2, "Add & Norm", stroke=FG)
dec_ffn = dec_box(R_DEC_FFN, "Feed Forward", stroke=ORG)
dec_an3 = dec_box(R_DEC_AN3, "Add & Norm", stroke=FG)
dec_lin = dec_box(R_LINEAR, "Linear", stroke=GRN)
dec_sm = dec_box(R_SOFTMAX, "Softmax", stroke=GRN)
dec_emb = dec_box(R_EMB, "Output Embedding", stroke=GRN)
boxes += [dec_mmha, dec_an1, dec_xattn, dec_an2, dec_ffn, dec_an3,
          dec_lin, dec_sm, dec_emb]

# --- Positional encoding adders ---
enc_plus = Circle(col=ENC_CX, row=R_PLUS, r=10, label="+", stroke=ORG)
dec_plus = Circle(col=DEC_CX, row=R_PLUS, r=10, label="+", stroke=ORG)
circles += [enc_plus, dec_plus]

# --- Top label above Softmax, arrow coming out of Softmax ---
labels.append(Label(
    x=dec_sm.cx(), y=dec_sm.y() - 16, text="Output Probabilities",
    font_size=12, weight="bold"
))
arrows.append(Arrow(start=dec_sm.top(), end=(dec_sm.cx(), dec_sm.y() - 8)))

# --- Bottom input labels ---
labels.append(Label(
    x=enc_emb.cx(), y=R_LABEL * GRID + 2, text="Inputs",
    font_size=12, weight="bold"
))
labels.append(Label(
    x=dec_emb.cx(), y=R_LABEL * GRID + 2, text="Outputs (shifted right)",
    font_size=12, weight="bold"
))

# --- Vertical flow arrows ---
def v(a, b):
    arrows.append(Arrow(start=a, end=b))


# Encoder data flow
v(enc_emb.top(), enc_plus.bottom())
v(enc_plus.top(), enc_mha.bottom())
v(enc_mha.top(), enc_an1.bottom())
v(enc_an1.top(), enc_ffn.bottom())
v(enc_ffn.top(), enc_an2.bottom())

# Decoder data flow
v(dec_emb.top(), dec_plus.bottom())
v(dec_plus.top(), dec_mmha.bottom())
v(dec_mmha.top(), dec_an1.bottom())
v(dec_an1.top(), dec_xattn.bottom())
v(dec_xattn.top(), dec_an2.bottom())
v(dec_an2.top(), dec_ffn.bottom())
v(dec_ffn.top(), dec_an3.bottom())
v(dec_an3.top(), dec_lin.bottom())
v(dec_lin.top(), dec_sm.bottom())

# --- Positional encoding inputs (side arrows into the ⊕) ---
PE_DX = 3  # cells to the side of the ⊕
enc_pe_src = ((ENC_CX - PE_DX) * GRID, R_PLUS * GRID)
dec_pe_src = ((DEC_CX + PE_DX) * GRID, R_PLUS * GRID)
arrows.append(Arrow(start=enc_pe_src, end=enc_plus.left()))
arrows.append(Arrow(start=dec_pe_src, end=dec_plus.right()))
labels.append(Label(
    x=enc_pe_src[0] - 4, y=enc_pe_src[1] + 4, text="Positional Encoding",
    font_size=10, anchor="end"
))
labels.append(Label(
    x=dec_pe_src[0] + 4, y=dec_pe_src[1] + 4, text="Positional Encoding",
    font_size=10, anchor="start"
))

# --- Residual connections (sub-layer input → its Add & Norm, side route) ---
RES = GRID * 2  # offset in px


def residual_left(sublayer: Box, target_an: Box) -> Arrow:
    """Residual curves off to the LEFT of sublayer up to target_an's left edge."""
    start_y = sublayer.y() + sublayer.height_px()
    return Arrow(
        start=(sublayer.x(), start_y),
        end=target_an.left(),
        via=[(sublayer.x() - RES, start_y),
             (sublayer.x() - RES, target_an.cy())],
        color=GRAY,
    )


def residual_right(sublayer: Box, target_an: Box) -> Arrow:
    """Residual curves off to the RIGHT of sublayer up to target_an's right edge."""
    start_y = sublayer.y() + sublayer.height_px()
    xR = sublayer.x() + sublayer.width_px()
    return Arrow(
        start=(xR, start_y),
        end=target_an.right(),
        via=[(xR + RES, start_y),
             (xR + RES, target_an.cy())],
        color=GRAY,
    )


# Encoder residuals
arrows.append(residual_left(enc_mha, enc_an1))
arrows.append(residual_left(enc_ffn, enc_an2))
# Decoder residuals
arrows.append(residual_right(dec_mmha, dec_an1))
arrows.append(residual_right(dec_xattn, dec_an2))
arrows.append(residual_right(dec_ffn, dec_an3))

# --- Cross-attention: encoder final output → decoder cross-attn K, V ---
# Route orthogonally from the right edge of enc_an2 to the left edge of
# dec_xattn. Use a mid-x waypoint so the line is a clean right-angle path.
xattn_start = enc_an2.right()
xattn_end = dec_xattn.left()
mid_x = (xattn_start[0] + xattn_end[0]) / 2
arrows.append(Arrow(
    start=xattn_start,
    end=xattn_end,
    via=[(mid_x, xattn_start[1]), (mid_x, xattn_end[1])],
    color=GRN,
))
labels.append(Label(
    x=mid_x + 4, y=(xattn_start[1] + xattn_end[1]) / 2 - 6,
    text="K, V", font_size=11, fill=GRN, anchor="start", weight="bold",
))

# --- Stack multiplier labels ("N×" beside each stack) ---
stack_top_enc = enc_an2.y()
stack_bot_enc = enc_mha.y() + enc_mha.height_px()
labels.append(Label(
    x=enc_mha.x() - RES - 12,
    y=(stack_top_enc + stack_bot_enc) / 2 + 4,
    text="N ×", font_size=13, anchor="end", weight="bold",
))
stack_top_dec = dec_an3.y()
stack_bot_dec = dec_mmha.y() + dec_mmha.height_px()
labels.append(Label(
    x=dec_mmha.x() + dec_mmha.width_px() + RES + 12,
    y=(stack_top_dec + stack_bot_dec) / 2 + 4,
    text="× N", font_size=13, anchor="start", weight="bold",
))

# --- Lane headers ("Encoder" / "Decoder") ---
labels.append(Label(
    x=enc_an2.cx(), y=enc_an2.y() - 14, text="Encoder",
    font_size=13, weight="bold", fill=BLUE,
))
labels.append(Label(
    x=dec_an3.cx(), y=dec_an3.y() - 14, text="Decoder",
    font_size=13, weight="bold", fill=ORG,
))

# ---------------------------------------------------------------------------
# Render
# ---------------------------------------------------------------------------
svg = render(boxes, circles, arrows, labels, padding=28, max_width_css=760)
out_path = os.path.join(THIS_DIR, "encoder_decoder.svg")
save(svg, out_path)
print(f"Wrote {out_path}")
print(f"SVG size: {len(svg)} bytes")
