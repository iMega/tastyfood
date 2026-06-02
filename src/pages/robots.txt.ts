import { absoluteUrl } from '../lib/config';

export function GET() {
  return new Response(`User-agent: *\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
