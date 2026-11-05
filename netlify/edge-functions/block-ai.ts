/* Blocks AI crawlers, AI assistants and scraping tools at the edge, before
   any page, script or style is served. robots.txt asks politely; this
   enforces it for bots that announce themselves. Link-preview bots
   (iMessage, WhatsApp, Facebook, X, Slack, LinkedIn) and normal search
   engines are NOT blocked, so shared cards still show their preview. */
import type { Config, Context } from '@netlify/edge-functions';

const BLOCKED = [
  // AI crawlers, trainers and assistants
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-user', 'claude-searchbot', 'claude-web', 'anthropic-ai',
  'googleother', 'google-cloudvertexbot', 'ccbot', 'perplexitybot', 'perplexity-user', 'bytespider', 'tiktokspider',
  'meta-externalagent', 'meta-externalfetcher', 'facebookbot', 'amazonbot', 'cohere-ai', 'cohere-training-data-crawler',
  'diffbot', 'youbot', 'mistralai-user', 'deepseekbot', 'ai2bot', 'petalbot', 'timpibot', 'omgili', 'imagesiftbot',
  'img2dataset', 'magpie-crawler', 'velenpublicwebcrawler', 'kangaroo bot', 'pangubot', 'sidetrade', 'iaskspider',
  'webzio-extended', 'firecrawl', 'jina', 'scrapegraph', 'crawl4ai', 'browserbase', 'apify',
  // site copiers and scraping libraries
  'scrapy', 'httrack', 'wget', 'python-requests', 'python-urllib', 'aiohttp', 'httpx', 'go-http-client',
  'node-fetch', 'axios', 'libwww-perl', 'sitesucker', 'webcopier', 'webzip', 'offline explorer',
  'teleport pro', 'website extractor', 'zgrab',
];

export default async (request: Request, context: Context) => {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua || BLOCKED.some((b) => ua.includes(b))) {
    return new Response('Access denied. Automated and AI access to OKUNAMI is not permitted. Copyright Finesse Media LLC.', {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow, noai, noimageai', 'cache-control': 'no-store' },
    });
  }
  return context.next();
};

export const config: Config = {
  path: '/*',
  excludedPath: ['/robots.txt', '/images/*', '/fonts/*', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/og-image.jpg', '/icon-*'],
};
