import type { APIRoute } from 'astro';
import { languages } from '../lib/i18n';
import { getMenuItems } from '../lib/menu';

const languageCodes = Object.keys(languages);

const pages = [
  { path: '/', priority: '1.0', localized: true },
  { path: '/contact/', priority: '0.6', localized: true },
  { path: '/cart/', priority: '0.3', localized: true },
  { path: '/languages/', priority: '0.4', localized: false },
];

const localizedPath = (lang: string, path: string): string => {
  return path === '/' ? `/${lang}/` : `/${lang}${path}`;
};

const localizedUrls = (path: string, priority: string) => {
  return languageCodes.map(lang => ({
    path: localizedPath(lang, path),
    priority,
  }));
};

const escapeXml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
};

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Set site in astro.config.mjs to build sitemap.');
  }

  const base = site;
  const lastmod = new Date().toISOString();
  const items = await getMenuItems();
  const staticUrls = pages.flatMap(page => {
    if (page.localized) {
      return localizedUrls(page.path, page.priority);
    }

    return [{ path: page.path, priority: page.priority }];
  });
  const productUrls = items.flatMap(item => {
    return localizedUrls(`/products/${item.id}/`, '0.5');
  });
  const sitemapUrls = [...staticUrls, ...productUrls];

  const urls = sitemapUrls.map(({ path, priority }) => {
    const loc = new URL(path, base).toString();

    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
