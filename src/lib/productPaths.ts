import { getMenuItems } from './menu';
import { defaultLanguage, languages, type Language } from './i18n';
import type { MenuItem } from './menu';

export const productPath = (
  item: MenuItem,
  lang?: Language,
): string => {
  const prefix = lang ? `/${lang}` : '';

  return `${prefix}/${item.url.section}/${item.url.slug}/`;
};

export async function getProductStaticPaths() {
  const items = await getMenuItems();

  return items.map(item => ({
    params: { id: item.id },
    props: { item },
  }));
}

export async function getDefaultProductStaticPaths() {
  const items = await getMenuItems();

  return items.map(item => ({
    params: {
      section: item.url.section,
      slug: item.url.slug,
    },
    props: {
      item,
      lang: defaultLanguage,
    },
  }));
}

export async function getLocalizedProductStaticPaths() {
  const items = await getMenuItems();

  return (Object.keys(languages) as Language[]).flatMap(lang => {
    return items.map(item => ({
      params: {
        lang,
        section: item.url.section,
        slug: item.url.slug,
      },
      props: {
        item,
        lang,
      },
    }));
  });
}
