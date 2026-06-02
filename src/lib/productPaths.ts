import { getMenuItems } from './menu';

export async function getProductStaticPaths() {
  const items = await getMenuItems();

  return items.map(item => ({
    params: { id: item.id },
    props: { item },
  }));
}
