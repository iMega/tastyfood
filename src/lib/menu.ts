import type { Language } from './i18n';
import type { ImageMetadata } from 'astro';
import categories from '../data/menu/categories.json';

const imageFiles = import.meta.glob<ImageMetadata>('../assets/images/*', {
  eager: true,
  import: 'default',
});

type ProductImage = ImageMetadata | string;

type MenuItemFile = Omit<MenuItem, 'image' | 'imageUrl'> & {
  image: string;
};

export interface MenuItem {
  id: string;
  order: number;
  categoryId: string;
  categories: string[];
  price: ProductPrice;
  weight: number;
  portions: number;
  image: ProductImage;
  imageUrl: string;
  available: boolean;
  badge?: 'hit' | 'new';
  allergens?: string[];
  translations: Record<Language, {
      name: string;
      shortName: string;
      cardDescription: string;
      description: string;
      details: ProductDetails;
  }>;
}

export interface ProductDetails {
  intro: string;
  dough: string[];
  filling: string[];
  nutrition: ProductLine[];
  allergens: string[];
  traces: string[];
  storage: string[];
  shelfLife: string;
  reheating: string[];
  productionDate?: string;
  packaging: string;
  suitableFor: string[];
  note: string;
}

export interface ProductLine {
  label: string;
  value: string;
}

export interface ProductPrice {
  value: number;
  currency: string;
}

export interface Category {
  id: string;
  order: number;
  translations: {
    [key: string]: string;
  };
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const itemFiles = import.meta.glob('../data/menu/items/*.json');
  const items: MenuItem[] = [];

  for (const path in itemFiles) {
    const item = await itemFiles[path]() as { default: MenuItemFile };
    const image = resolveImage(item.default.image);

    items.push({
      ...item.default,
      ...image,
    });
  }

  return items.sort((a, b) => a.order - b.order);
}

function resolveImage(image: string): {
  image: ProductImage;
  imageUrl: string;
} {
  const filename = image.split('/').pop();
  const match = Object.entries(imageFiles).find(([path]) => {
    return path.endsWith(`/${filename}`);
  });

  return {
    image: match?.[1] || image,
    imageUrl: match?.[1]?.src || image,
  };
}

export function getCategories(): Category[] {
  return categories as Category[];
}

export function getItemsByCategory(items: MenuItem[], categoryId: string): MenuItem[] {
  return items.filter(item => item.categoryId === categoryId);
}

export function getLocalizedMenuItem(item: MenuItem, lang: Language) {
  const translation = item.translations[lang] || item.translations['en'];

  return {
    ...item,
    name: translation.name,
    shortName: translation.shortName,
    cardDescription: translation.cardDescription,
    description: translation.description,
    details: translation.details,
  };
}

export function getLocalizedCategory(category: Category, lang: Language) {
  return {
    ...category,
    name: category.translations[lang] || category.translations['en'],
  };
}
