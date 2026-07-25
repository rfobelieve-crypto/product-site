'use client';

// Last-resort boundary — replaces the ROOT layout, so no globals.css, no
// fonts, no i18n context. Everything inline; bilingual by necessity.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#050507',
          color: '#e8e8ef',
          fontFamily: "system-ui, 'Noto Sans TC', sans-serif",
          textAlign: 'center',
          padding: 24,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,139,214,0.8)' }}>
          Error · 錯誤
        </p>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 300 }}>
          Something broke. 出了點問題。
        </h1>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            borderRadius: 999,
            border: 'none',
            background: '#e8e8ef',
            color: '#050507',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again · 再試一次
        </button>
      </body>
    </html>
  );
}
