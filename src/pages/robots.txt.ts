import { siteUrl } from '../../site.config';

export function GET() {
  return new Response(`User-agent: *\nSitemap: ${siteUrl}/sitemap.xml\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
