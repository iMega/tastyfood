Список UTM-ссылок для `https://tastyfood.menu/en/`

| Где использовать                                                | Ссылка                                                                                                                                                     | GA4                                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Основная ссылка на сайт в Google Business Profile / Google Maps | `https://tastyfood.menu/en/?utm_source=google_business_profile&utm_medium=organic&utm_campaign=ossetian_pies&utm_content=website_link`                     | `google_business_profile / organic`, переход по обычной ссылке сайта      |
| Кнопка заказа в Google Business Profile                         | `https://tastyfood.menu/en/?utm_source=google_business_profile&utm_medium=order_link&utm_campaign=ossetian_pies&utm_content=business_profile_order_button` | `google_business_profile / order_link`, явный переход через кнопку заказа |
| QR-код на изображении меню в Google Maps                        | `https://tastyfood.menu/en/?utm_source=google_maps&utm_medium=qr_menu&utm_campaign=ossetian_pies_menu&utm_content=menu_image_v1`                           | `google_maps / qr_menu`, скан QR с картинки меню                          |
| QR-код на печатном меню                                         | `https://tastyfood.menu/en/?utm_source=print&utm_medium=qr_menu&utm_campaign=ossetian_pies_menu&utm_content=a4_menu_v1`                                    | `print / qr_menu`, скан QR с бумажного меню                               |
| Facebook, ссылка в профиле / на странице                        | `https://tastyfood.menu/en/?utm_source=facebook&utm_medium=social_profile&utm_campaign=ossetian_pies&utm_content=facebook_page_order_link`                 | `facebook / social_profile`, переход из профиля Facebook                  |
| Instagram, ссылка в bio                                         | `https://tastyfood.menu/en/?utm_source=instagram&utm_medium=social_profile&utm_campaign=ossetian_pies&utm_content=instagram_bio_link`                      | `instagram / social_profile`, переход из bio Instagram                    |
| Instagram, ссылка в посте                                       | `https://tastyfood.menu/en/?utm_source=instagram&utm_medium=social_post&utm_campaign=ossetian_pies&utm_content=post_menu_v1`                               | `instagram / social_post`, переход из поста                               |
| Instagram, ссылка в story                                       | `https://tastyfood.menu/en/?utm_source=instagram&utm_medium=story&utm_campaign=ossetian_pies&utm_content=story_menu_v1`                                    | `instagram / story`, переход из story                                     |
| Facebook, ссылка в посте                                        | `https://tastyfood.menu/en/?utm_source=facebook&utm_medium=social_post&utm_campaign=ossetian_pies&utm_content=post_menu_v1`                                | `facebook / social_post`, переход из поста Facebook                       |

В GA4:

```
Reports → Acquisition → Traffic acquisition
```

Основное измерение:

```
Session source / medium
```

Дополнительные измерения:

```
Session campaign
Session manual ad content
```

Для чистоты отчётов не смешивать `google_business_profile` и `google_maps`: первый использовать для ссылок из профиля, второй — только для QR-кода на изображении меню в Google Maps.
