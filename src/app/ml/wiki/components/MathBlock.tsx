type MathBlockProps = {
  tex: string;
  title?: string;
};

/** Display-mode TeX; container is typeset by parent MathJax surface. */
export function MathBlock({ tex, title }: MathBlockProps) {
  const trimmed = tex.trim();
  const inner = trimmed.startsWith("$$")
    ? trimmed
    : `$$${trimmed}$$`;
  return (
    <div className="wiki-math-block">
      {title ? <div className="wiki-math-block-title">{title}</div> : null}
      <div className="wiki-math-block-inner">{inner}</div>
    </div>
  );
}
