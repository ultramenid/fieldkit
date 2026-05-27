export default {
  darkMode: false,
  feedback: { content: null },
  editLink: { content: null },
  toc: { backToTop: false },
  sidebar: { defaultMenuCollapseLevel: 1 },
  navigation: false,
  footer: { content: null },
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28 }}>
        <path d="M48 24v68" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M48 24h34" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M48 52h26" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <circle cx="62" cy="37" r="3.5" fill="currentColor"/>
        <path d="M56 63 Q62 69 68 63" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>
        FieldKit Docs
      </span>
    </div>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="FieldKit — Offline-capable form builder for field data collection" />
      <meta name="og:title" content="FieldKit Docs" />
    </>
  ),
}
