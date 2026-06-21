export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/r/google-review") {
            return Response.redirect(env.GOOGLE_REVIEW_URL, 302);
        }

        return new Response("Not found", { status: 404 });
    },
};
