import LightboxImage from "../../../components/LightboxImage";
import type { WikiFigure } from "../types";

type FigureBlockProps = {
  figure: WikiFigure;
};

export function FigureBlock({ figure }: FigureBlockProps) {
  const w = figure.width ?? 800;
  const h = figure.height ?? 500;
  return (
    <figure className="wiki-figure">
      <LightboxImage
        src={figure.src}
        alt={figure.alt}
        width={w}
        height={h}
        className="wiki-figure-img"
        caption={figure.caption}
      />
    </figure>
  );
}
