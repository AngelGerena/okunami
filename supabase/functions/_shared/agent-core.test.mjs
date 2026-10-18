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
