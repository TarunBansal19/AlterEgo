interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: Props) {
  const alignCls = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-3xl mb-14 md:mb-20 ${alignCls}`}>
      <p className="section-eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-white/55 text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );
}
