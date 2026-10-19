import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Brand from '../components/Brand';
import LangToggle from '../components/LangToggle';
import { rich, useT } from '../lib/i18n';
import { supabase, IS_DEMO } from '../lib/supabase';
import { startCreditCheckout } from '../lib/billing';

type Account = { id: string; name: string; balance_micros: number; daily_cap_micros: number | null };
type Pack = { id: string; name: string; price_cents: number; credits_usd: number };

/** Credits are stored in micro-dollars (1 dollar = 1,000,000) so nothing is lost to rounding. */
const money = (micros: number) => `$${(micros / 1_000_000).toFixed(micros !== 0 && Math.abs(micros) < 100_000 ? 4 : 2)}`;

export default function Credits() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [acct, setAcct] = useState<string>('');
  const [use, setUse] = useState<{ ai: number; saved: number; spent: number } | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (IS_DEMO) { setAccounts([]); setPacks([]); return; }
    (async () => {
      const [a, p] = await Promise.all([
        supabase.from('ag_accounts').select('id, name, balance_micros, daily_cap_micros').order('created_at', { ascending: true }),
        supabase.from('ag_settings').select('value').eq('key', 'packs').maybeSingle(),
      ]);
      const list = (a.data ?? []) as Account[];
      setAccounts(list); if (list[0]) setAcct(list[0].id);
      setPacks(Array.isArray(p.data?.value) ? (p.data!.value as Pack[]) : []);
    })().catch(() => { setAccounts([]); setPacks([]); });
  }, []);

  useEffect(() => {
    if (!acct) { setUse(null); return; }
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    supabase.from('ag_usage').select('charge_micros, answered_without_ai').eq('account_id', acct).gte('created_at', since).limit(5000)
      .then(({ data }) => {
        const rows = data ?? [];
        setUse({ saved: rows.filter((r) => r.answered_without_ai).length, ai: rows.filter((r) => !r.answered_without_ai).length, spent: rows.reduce((n, r) => n + Number(r.charge_micros || 0), 0) });
      }, () => setUse(null));
  }, [acct]);

  const current = useMemo(() => accounts?.find((a) => a.id === acct), [accounts, acct]);
  const buy = async (p: Pack) => {
    setErr(''); setBusy(p.id);
    try { await startCreditCheckout(acct, p.id); } catch (e) { setErr(e instanceof Error ? e.message : t('Could not start checkout. Please try again.')); setBusy(''); }
  };
  const ok = params.get('credits');
  const total = use ? use.ai + use.saved : 0;

  return (
    <div className="dash">
      <header className="dash__top">
        <Brand />
        <span className="dash__acts"><LangToggle /><Link to="/app" className="btn btn--ghost btn--sm"><ArrowLeft size={15} /> {t("My cards")}</Link></span>
      </header>
      <main className="dash__main cr">
        <div className="dash__head"><h1>{t("AI agents and credits")}</h1></div>

        {ok === 'ok' && <div className="pay-note is-ok" role="status"><b>{t("Payment received.")}</b><span>{t("Your credits are added in a few seconds. Refresh if the balance has not changed.")}</span><button type="button" className="icon-btn" aria-label={t("Dismiss")} onClick={() => setParams({})}><X size={16} /></button></div>}
        {ok === 'cancelled' && <div className="pay-note" role="status"><b>{t("Checkout canceled.")}</b><span>{t("No charge was made.")}</span><button type="button" className="icon-btn" aria-label={t("Dismiss")} onClick={() => setParams({})}><X size={16} /></button></div>}

        {!accounts && <p className="center-msg"><Loader2 className="spin" /> {t("Loading")}</p>}

        {accounts && accounts.length === 0 && (
          <section className="cr-box"><h2>{t("No AI agents on your account yet")}</h2>
            <p>{t("Your AI agents are set up for you by Finesse Media. Once they are live, your balance and usage show up here.")}</p></section>
        )}

        {current && (
          <>
            {accounts!.length > 1 && (
              <label className="cr-pick">{t("Account")}
                <select value={acct} onChange={(e) => setAcct(e.target.value)}>{accounts!.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              </label>
            )}
            <section className="cr-box cr-bal">
              <small>{t("Credit balance")}</small>
              <b>{money(current.balance_micros)}</b>
              {current.balance_micros <= 0 && <p className="cr-warn">{t("Your balance is empty, so your agents are paused. Visitors see your contact buttons instead. Add credits to turn them back on.")}</p>}
              {current.daily_cap_micros != null && <p>{t("Daily spending limit: {amount}. Your agents stop for the day if they reach it.", { amount: money(current.daily_cap_micros) })}</p>}
            </section>

            <section className="cr-box">
              <h2>{t("Last 30 days")}</h2>
              {!use ? <p><Loader2 className="spin" size={15} /></p> : total === 0 ? <p>{t("No visitor questions yet.")}</p> : (
                <dl className="cr-stats">
                  <div><dt>{t("Questions answered")}</dt><dd>{total}</dd></div>
                  <div><dt>{t("From your saved answers (free)")}</dt><dd>{use.saved}</dd></div>
                  <div><dt>{t("Written by AI")}</dt><dd>{use.ai}</dd></div>
                  <div><dt>{t("Credits used")}</dt><dd>{money(use.spent)}</dd></div>
                </dl>
              )}
            </section>

            <section className="cr-box">
              <h2>{t("Add credits")}</h2>
              {!packs ? <p><Loader2 className="spin" size={15} /></p> : packs.length === 0 ? <p>{t("Credit packs are not available right now. Please try again in a little while.")}</p> : (
                <>
                  <div className="cr-packs">
                    {packs.map((p) => (
                      <div key={p.id} className="cr-pack">
                        <b>{p.name}</b>
                        <span className="cr-pack__price">${(p.price_cents / 100).toFixed(2)}</span>
                        <small>{t("{amount} of agent credits", { amount: `$${p.credits_usd}` })}</small>
                        <button type="button" className="btn btn--gold btn--sm" disabled={!agree || !!busy} onClick={() => buy(p)}>{busy === p.id ? <Loader2 className="spin" size={15} /> : null} {t("Buy credits")}</button>
                      </div>
                    ))}
                  </div>
                  <label className="cr-agree">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>{rich(t("I understand credits are prepaid and non-refundable, are used only when the AI writes a reply, and can not be exchanged for cash. I agree to the <a>Terms</a>."), { a: (c) => <Link to="/terms" target="_blank">{c}</Link> })}</span>
                  </label>
                  {err && <p className="err" role="alert">{err}</p>}
                  <p className="cr-fine">{t("One-time payment, processed by Stripe. This is not a subscription and nothing renews on its own.")}</p>
                </>
              )}
            </section>
          </>
        )}

        <section className="cr-box cr-how">
          <h2>{t("How credits work")}</h2>
          <details open><summary>{t("What are credits?")}</summary>
            <p>{t("Credits are a prepaid balance in dollars. A $10 pack adds $10 of agent usage. They belong to your account and are shared by all the agents on it.")}</p></details>
          <details><summary>{t("What uses credits?")}</summary>
            <p>{t("Only replies the AI has to write. Questions your saved answers can handle, like your hours or services, are answered for free. Most AI replies cost a fraction of a cent, and your usage numbers above show the exact amount.")}</p>
            <p>{t("If a visitor asks something your information does not cover, the agent says it does not have that detail instead of guessing. The AI still read the question, so that reply uses a small amount of credit too.")}</p></details>
          <details><summary>{t("How are my credits kept from running out fast?")}</summary>
            <ul>
              <li>{t("Saved answers come first, so common questions cost nothing.")}</li>
              <li>{t("A low-cost AI model, short replies and short conversations.")}</li>
              <li>{t("A limit on how many messages one visitor can send per hour.")}</li>
              <li>{t("A daily spending limit, so one busy day or a bot can not drain your balance.")}</li>
            </ul></details>
          <details><summary>{t("What happens when my credits run out?")}</summary>
            <p>{t("Your agents pause. Visitors see a polite message and your contact buttons, so you do not lose the lead. You are never charged more than the credits you bought. Add a pack and the agents start again right away.")}</p></details>
          <details><summary>{t("Do credits expire? Can I get a refund?")}</summary>
            <p>{t("Credits do not expire while your OKUNAMI account is open. They are non-refundable and can not be exchanged for cash, except where the law requires otherwise or if we charged you in error. If something looks wrong, contact us and we will make it right.")}</p></details>
          <details><summary>{t("What happens to my visitors' messages?")}</summary>
            <p>{t("Replies are written by Google's Gemini service, so a visitor's question is sent there to get an answer. We keep usage numbers (how many messages, how much it cost), not the text of the conversations, unless you choose to save the questions your agent could not answer so you can add answers for them.")}</p></details>
        </section>
      </main>
    </div>
  );
}
