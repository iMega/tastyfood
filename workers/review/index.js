const REDIRECTS = {
    "google-review": {
        envUrlKey: "GOOGLE_REVIEW_URL",
        eventName: "qr_review_open",
        target: "google_business_review",
        defaultPlacement: "pie_box",
        defaultCampaign: "review_qr_2026",
    },
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const slug = getRedirectSlug(url.pathname);

        if (!slug || !REDIRECTS[slug]) {
            return new Response("Not found", {
                status: 404,
                headers: {
                    "content-type": "text/plain; charset=utf-8",
                },
            });
        }

        const redirectConfig = REDIRECTS[slug];
        const redirectUrl = env[redirectConfig.envUrlKey];

        if (!redirectUrl) {
            return new Response(
                `${redirectConfig.envUrlKey} is not configured`,
                {
                    status: 500,
                    headers: {
                        "content-type": "text/plain; charset=utf-8",
                    },
                },
            );
        }

        ctx.waitUntil(sendGa4Event(request, env, slug, redirectConfig));

        return Response.redirect(redirectUrl, 302);
    },
};

function getRedirectSlug(pathname) {
    const parts = pathname.split("/").filter(Boolean);

    if (parts.length !== 2) {
        return null;
    }

    if (parts[0] !== "r") {
        return null;
    }

    return parts[1];
}

async function sendGa4Event(request, env, slug, redirectConfig) {
    if (!env.GA4_MEASUREMENT_ID || !env.GA4_API_SECRET) {
        return;
    }

    const url = new URL(request.url);

    const source = normalizeParam(url.searchParams.get("src"), "unknown");
    const placement = normalizeParam(
        url.searchParams.get("placement"),
        redirectConfig.defaultPlacement,
    );
    const campaign = normalizeParam(
        url.searchParams.get("campaign"),
        redirectConfig.defaultCampaign,
    );

    const endpoint = new URL("https://www.google-analytics.com/mp/collect");
    endpoint.searchParams.set("measurement_id", env.GA4_MEASUREMENT_ID);
    endpoint.searchParams.set("api_secret", env.GA4_API_SECRET);

    const payload = {
        client_id: getClientId(request),
        events: [
            {
                name: redirectConfig.eventName,
                params: {
                    source,
                    placement,
                    campaign,
                    redirect_slug: slug,
                    target: redirectConfig.target,
                    page_location: url.toString(),
                    page_path: url.pathname,
                },
            },
        ],
    };

    try {
        const response = await fetch(endpoint.toString(), {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("GA4 request failed", {
                status: response.status,
                statusText: response.statusText,
            });
        }
    } catch (error) {
        console.error("GA4 request error", error);
    }
}

function getClientId(request) {
    const ip = request.headers.get("cf-connecting-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const source = `${ip}:${userAgent}`;
    const hash = fnv1a(source);

    return `${Date.now()}.${hash}`;
}

function fnv1a(value) {
    let hash = 0x811c9dc5;

    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString();
}

function normalizeParam(value, fallback) {
    if (!value) {
        return fallback;
    }

    return (
        value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 80) || fallback
    );
}
