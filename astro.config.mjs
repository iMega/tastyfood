// @ts-check
import { defineConfig } from "astro/config";
import { siteBase, siteUrl } from "./site.config.js";
import minifyHtml from "astro-minify-html-swc";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

const scriptEntryName = (chunk) => {
    const name = chunk.name
        .replace(/\.astro_astro_type_script_index_\d+_lang$/, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();

    return `asset/${name}.[hash].js`;
};

export default defineConfig({
    site: siteUrl,
    base: siteBase,
    compressHTML: "jsx",
    build: {
        assets: "asset",
    },
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
        environments: {
            client: {
                build: {
                    rollupOptions: {
                        output: {
                            entryFileNames: scriptEntryName,
                            chunkFileNames: scriptEntryName,
                        },
                    },
                },
            },
        },
    },
    integrations: [
        sitemap({
            filter: (page) => {
                const { pathname } = new URL(page, siteUrl);

                return !pathname.includes("/products/") && !pathname.includes("/thank-you/");
            },
            changefreq: ChangeFreqEnum.WEEKLY,
            lastmod: new Date(),
            serialize: (item) => {
                const { pathname } = new URL(item.url, siteUrl);

                if (/^\/(?:en|ru|el|uk|pl)\/?$/.test(pathname) || pathname === "/") {
                    item.priority = 1.0;
                } else if (pathname.includes("/contact/")) {
                    item.priority = 0.6;
                } else if (pathname.includes("/cart/")) {
                    item.priority = 0.3;
                } else if (pathname.includes("/languages/")) {
                    item.priority = 0.4;
                } else {
                    item.priority = 0.5;
                }

                return item;
            },
        }),
        minifyHtml(),
    ],
});
