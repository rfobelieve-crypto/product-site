# fixes/ — 一次修到位的修正包

`fixes/` 內的路徑 **鏡像 repo 根目錄**。套用方式:把 `fixes/` 底下所有檔案複製到專案對應位置(覆蓋),然後:

```bash
npm run build   # 確認過編譯再部署
```

## 環境變數(Vercel → Settings → Environment Variables)

| 變數 | 用途 | 未設定時 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical/hreflang/sitemap 的絕對網址 | 退回 vercel.app 網址 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 全站聯絡信箱(waitlist、法務頁、忘記密碼) | 佔位 `hello@flowbot.example` |
| `NEXT_PUBLIC_GITHUB_URL` | Footer GitHub 連結 | **連結隱藏**(不再是死連結) |
| `NEXT_PUBLIC_WRITEUPS_URL` | Footer 文章連結 | **連結隱藏** |
| `FORGOT_PASSWORD_URL` | agent service 的重設密碼端點 | 表單顯示「尚未開通,請來信」 |

## 各檔案對應的問題

**SEO / 分享**
- `app/robots.ts`、`app/sitemap.ts` — 新增(sitemap 含雙語 hreflang)。
- `app/[locale]/opengraph-image.tsx` — 新增 OG 卡圖(1200×630,全站共用;LINE/X/Telegram 分享有預覽)。
- `lib/seo.ts` — `SITE_URL`/`CONTACT_EMAIL`/`pageAlternates()`(canonical + hreflang)。
- `app/[locale]/layout.tsx` — `metadataBase`、OG/Twitter 預設、`lang="zh-Hant"`、移除 `maximumScale`、載入 Noto Sans TC、掛 MotionProvider。
- 已在 home / signals / privacy / terms / forgot-password 加 `alternates`;**其餘頁面**(system、track-record、incidents、charts×3)請在各自 `generateMetadata` 加一行:`alternates: pageAlternates(locale, '/system')`。

**首頁對搜尋引擎隱形 + Intro 文案**
- `components/intro/IntroGate.tsx` — 內容永遠掛載,閘門只是覆蓋層(SSR 有完整首頁);標語改走 i18n(`intro.title`),`prefers-reduced-motion` 直接跳過儀式。
- `messages/*.json` — 「Trading is fantastic」→ zh「公開建置,連犯錯也公開。」/ en「Built in public. Wrong in public.」

**中文字體 / Hero 斷行**
- `app/[locale]/layout.tsx` + `tailwind.config.ts` — Noto Sans TC(`--font-cjk`)進 display/body 字體堆疊。
- `components/sections/Hero.tsx` — canvas 標題字體堆疊改用已載入的 `--font-cjk`。
- `messages/zh.json` — 標題斷行改「會犯錯的」/「AI 交易系統」(原本第二行孤懸「系統」)。

**錯誤頁**
- `app/[locale]/not-found.tsx`、`app/[locale]/error.tsx`、`app/global-error.tsx` — 品牌化 404 / 錯誤頁(雙語)。

**帳號流程**
- `app/[locale]/forgot-password/page.tsx` + `components/sections/ForgotPasswordForm.tsx` + `app/api/forgot-password/route.ts` — 忘記密碼 UI + proxy;`LoginForm.tsx` 加「忘記密碼?」連結。回應永遠不透露 email 是否存在。

**法務**
- `app/[locale]/privacy/page.tsx`、`app/[locale]/terms/page.tsx` — 隱私權政策 + 使用條款(zh/en 內文都寫好了,**請自行過目調整**);`Footer.tsx` 加連結。

**安全 / 濫用**
- `next.config.js` — nosniff、X-Frame-Options、Referrer-Policy、Permissions-Policy、HSTS。
- `lib/rateLimit.ts` + waitlist/register/forgot 三條 API — per-IP 限流 + email 格式檢查;waitlist 加 honeypot(`Waitlist.tsx` 隱藏欄位)。

**無障礙 / 動效**
- `app/globals.css` — 按鈕/表單移除 text-shadow 黑暈、全站 `:focus-visible` 焦點環、CSS 層 reduced-motion。
- `components/MotionProvider.tsx` — framer-motion 尊重系統減少動態設定。
- `components/canvas/SceneWrapper.tsx` — reduced-motion 時以靜態漸層取代 WebGL 粒子場。
- `Nav.tsx` / `FAQ.tsx` — `aria-expanded` / `aria-controls`。

**文案 / 在地化**
- `LiveSignal.tsx` + `signals/page.tsx` — regime/tier/方向顯示翻譯(未知值退回原字串)。
- `zh.json` — 半形逗號修正、「不重複」重複句刪除、cancel-flow 日期改 2026-08-10 全寫。

## 仍需後端配合(前端已就緒)
1. **忘記密碼**:agent service 需要 `POST /public/forgot-password`(產 token + 寄信);設好 `FORGOT_PASSWORD_URL` 後表單自動啟用。
2. **註冊 email 驗證**:目前打錯字的信箱也能註冊——需要後端寄驗證信。
3. **限流**:`lib/rateLimit.ts` 是單一 instance 的 best-effort;要硬保證換 Upstash Redis(呼叫介面不用改)。

**3D K 線背景重設計(方案 B「調和綠紅」,見 candle-field-redesign.html)**
- `components/canvas/CandleField.tsx` — 綠紅降飽和(#4de8b4 / #ff6584,亮度對齊 iris 青紫);移除 transmission(少一個 render pass,桌機手機同一材質);三層景深殘影列(手機只跑主列);K 線於兩側邊界淡入淡出,不再瞬間出現。
- `components/canvas/Scene.tsx` — 加 FogExp2 景深霧;Bloom 依新色調重調(0.55 / threshold 0.4)。
- `components/canvas/ParticleField.tsx` — bokeh 粒子從綠改為品牌紫,環境粒子只留青/紫。

## 刻意沒做
- 完整 CSP(Next inline runtime + three.js 需要另開專案處理)。
- OG 卡圖為英文(OG 渲染器無 CJK 字體;品牌訊息兩語共用)。
