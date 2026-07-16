const PROMO_LINKS = [
  {
    href: 'https://noahisarider.github.io/',
    label: 'Personal Site',
  },
  {
    href: 'https://github.com/NoahIsARider',
    label: 'GitHub',
  },
  {
    href: 'https://geek-rss.vercel.app/',
    label: 'Geek RSS',
  },
  {
    href: 'https://ark-rss.vercel.app/',
    label: 'Ark RSS',
  },
] as const;

export function SiteFooter() {
  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--color-desk)',
        borderColor: 'var(--color-rule)',
        color: 'var(--color-ink)',
      }}
    >
      <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-8 py-8">
        <p
          className="text-[11px] uppercase tracking-[0.24em]"
          style={{ color: 'var(--color-muted-ink)' }}
        >
          Built and shipped by Noah. More work lives here.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          {PROMO_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-1 underline-offset-[6px] hover:decoration-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
