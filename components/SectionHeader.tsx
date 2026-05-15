interface SectionHeaderProps {
  number: string;
  title: string;
  meta?: string;
}

export function SectionHeader({ number, title, meta }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-baseline gap-4 border-b border-border-subtle pb-3">
      <span className="font-mono text-[12px] tracking-[0.22em] text-accent">
        / {number}
      </span>
      <h2 className="text-[22px] font-medium tracking-[-0.005em] text-fg-bright">
        {title}
      </h2>
      {meta ? (
        <span className="ml-auto font-mono text-[11.5px] tracking-[0.14em] text-fg-dim">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
