export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="max-w-2xl">
      <p className="text-xs tracking-[0.18em] uppercase text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-4xl leading-none sm:text-6xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
    </header>
  );
}
