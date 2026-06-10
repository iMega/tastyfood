import { absoluteUrl } from './config';
import { contact } from './contact';
import { t, type Language } from './i18n';
import { type MenuItem, getLocalizedMenuItem } from './menu';
import { productPath } from './productPaths';

export type JsonLd = Record<string, unknown>;

export interface OpenGraph {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'product';
}

export const menuOpenGraph = (lang: Language): OpenGraph => ({
  title: t(lang, 'menu.title'),
  description: t(lang, 'menu.intro'),
  image: absoluteUrl('/og/menu.jpg'),
  url: absoluteUrl(`/${lang}/`),
  type: 'website',
});

export const productOpenGraph = (
  item: MenuItem,
  lang: Language,
  path = productPath(item, lang),
): OpenGraph => {
  const product = getLocalizedMenuItem(item, lang);

  return {
    title: `${product.shortName} - Tastyfood`,
    description: product.cardDescription,
    image: absoluteUrl(`/og/pies/${item.id}.jpg`),
    url: absoluteUrl(path),
    type: 'product',
  };
};

export const restaurantJsonLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Tastyfood',
  url: absoluteUrl('/'),
  image: absoluteUrl('/favicon.png'),
  telephone: contact.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Hellados Ave 70',
    addressLocality: 'Paphos',
    postalCode: '8020',
    addressCountry: 'CY',
  },
  areaServed: 'Paphos, Cyprus',
  servesCuisine: ['Ossetian pies', 'Homemade pies'],
  openingHours: 'Mo-Su 12:00-20:00',
  priceRange: '€€',
});

export const productJsonLd = (
  item: MenuItem,
  lang: Language,
  path = productPath(item, lang),
): JsonLd => {
  const product = getLocalizedMenuItem(item, lang);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteUrl(item.imageUrl),
    description: product.description,
    weight: {
      '@type': 'QuantitativeValue',
      value: item.weight,
      unitCode: 'GRM',
    },
    offers: {
      '@type': 'Offer',
      price: item.price.value,
      priceCurrency: item.price.currency,
      availability: item.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(path),
    },
  };
};

export const breadcrumbJsonLd = (
  item: MenuItem,
  lang: Language,
  path = productPath(item, lang),
): JsonLd => {
  const product = getLocalizedMenuItem(item, lang);
  const menuName = t(lang, 'nav.menu');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Tastyfood',
        item: absoluteUrl(`/${lang}/`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: menuName,
        item: absoluteUrl(`/${lang}/`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: absoluteUrl(path),
      },
    ],
  };
};

export const jsonLd = (items: JsonLd[]): string => {
  return JSON.stringify(items.length === 1 ? items[0] : items);
};
