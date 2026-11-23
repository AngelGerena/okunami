# Angel & Nora U-MUVO card (noraangel.okunami.pro)

Standalone copy of their U-MUVO card, deployed as its own Netlify site (noraangel).
Netlify site settings: repository AngelGerena/okunami, branch main,
base directory `sites/noraangel`, build command empty, publish directory `sites/noraangel`.
Every merge to main that touches this folder updates the live card.

Cloned from `sites/emelyfelix` (Nov 2026). Two phones: every WhatsApp, Call and Text button asks the visitor "Angel or Nora?" first (`js/pick.js`).

## Natural Wellness Quiz (lead funnel)
- Card panel "Find your natural routine" opens a 5-question quiz (`js/quiz.js`, `css/quiz.css`).
- Visitor leaves name + WhatsApp/phone (or email) with consent, then sees suggested products and a one-tap
  "Send my results on WhatsApp". The lead is saved via `cb_lead_submit` (migration `0032_cb_leads.sql`).
- Back office: **Leads** tab with answers, source, prefilled WhatsApp/Text/Email follow-up, status, CSV export.
- Direct link for ads, flyers, social and other sites: `https://noraangel.okunami.pro/?quiz=1&src=facebook`
  (`&lang=es` opens it in Spanish). Product suggestions per goal live in `PICKS` at the top of `js/quiz.js`.
