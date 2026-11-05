import assert from 'node:assert/strict';
import { costMicros, withMarkup, reserveMicros, originAllowed, matchFaq, trimHistory, daysRemaining } from './agent-core.ts';
const rate = { in: 1, out: 5 };   // test numbers only, not real prices
assert.equal(costMicros(rate, { input: 1000, output: 200 }), 1000 + 1000);
assert.equal(costMicros(rate, { input: 0, output: 0, cacheRead: 1000 }), 100);       // 10% of input rate
assert.equal(costMicros(rate, { input: 0, output: 0, cacheWrite: 1000 }), 1250);     // 125%
assert.equal(withMarkup(1001, 2), 2002);
assert.equal(withMarkup(1000, 0.5), 1000);                                            // never below cost
assert.ok(reserveMicros(rate, 3000, 400, 2) >= withMarkup(costMicros(rate, { input: 1000, output: 400 }), 2));
assert.equal(originAllowed('https://a.com', ['https://a.com']), true);
assert.equal(originAllowed('https://evil.com', ['https://a.com']), false);
assert.equal(originAllowed(null, ['https://a.com']), false);
assert.equal(originAllowed('https://a.com', []), false);
const faqs = [{ q: 'What are your hours?', a: 'Mon-Fri 9-5', keywords: ['open', 'closing'] }, { q: 'Do you offer headshots?', a: 'Yes', keywords: ['portrait'] }];
assert.equal(matchFaq('what hours are you open', faqs)?.a, 'Mon-Fri 9-5');
assert.equal(matchFaq('do you do portrait headshots', faqs)?.a, 'Yes');
assert.equal(matchFaq('are you open to custom designs', faqs), null);
assert.equal(matchFaq('tell me about your cat', faqs), null);
const h = trimHistory([{ role: 'assistant', content: 'x' }, { role: 'user', content: 'y'.repeat(5000) }, { role: 'bad', content: 'z' }], 12);
assert.equal(h.length, 1); assert.equal(h[0].role, 'user'); assert.equal(h[0].content.length, 1000);
assert.equal(daysRemaining(10_000_000, 2_000_000), 5); assert.equal(daysRemaining(1, 0), null);
console.log('core tests passed');
import { numbersIn, verifyAnswer, geminiUsage } from './agent-core.ts';
const info = 'We are open Monday to Friday, 9:00 AM to 5:00 PM. A basic headshot session costs $1,200. Call (407) 960-9004.';
assert.deepEqual(numbersIn('$1,200 at 9:00 AM'), ['1200', '9', '0']);
const good = { found: true, answer: 'Open Monday to Friday, 9 AM to 5 PM.', quote: 'We are open Monday to Friday, 9:00 AM to 5:00 PM.' };
assert.deepEqual(verifyAnswer(good, info), { ok: true });
assert.equal(verifyAnswer({ ...good, answer: 'We are also open Saturday at 10 AM.' }, info).reason, 'invented_number');
assert.equal(verifyAnswer({ ...good, quote: 'We are open every day of the week until late.' }, info).reason, 'quote_not_in_info');
assert.equal(verifyAnswer({ ...good, quote: '' }, info).reason, 'no_quote');
assert.equal(verifyAnswer({ found: false, answer: '', quote: '' }, info).reason, 'not_found');
assert.deepEqual(verifyAnswer({ found: true, answer: 'A basic session is $1200.', quote: 'A basic headshot session costs $1,200.' }, info), { ok: true });
assert.equal(verifyAnswer({ found: true, answer: 'A session is $1,500.', quote: 'A basic headshot session costs $1,200.' }, info).reason, 'invented_number');
assert.deepEqual(geminiUsage({ promptTokenCount: 2000, cachedContentTokenCount: 1500, candidatesTokenCount: 100, thoughtsTokenCount: 50 }), { input: 500, output: 150, cacheRead: 1500 });
console.log('guardrail tests passed');
