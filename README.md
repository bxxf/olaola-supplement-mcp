# OlaOla Supplement MCP

Finding the right supplements is rarely just a search problem. What makes sense depends on what you are trying to solve, what you already take, your diet, budget, medication risks, labs, and whether you are trying to avoid specific ingredients.

[OlaOla](https://www.olaola.cz/) already makes supplement discovery fairly approachable for Czech customers, and they have a chatbot on [olaola.cz](https://www.olaola.cz/). The limitation is that the shop bot only has storefront context. It does not know what you have already discussed in ChatGPT, what is in your current supplement stack, or the constraints you gave elsewhere. It can also get stuck on shallow recommendations. For example, if you ask for something for energy without ashwagandha, it may keep recommending the same ashwagandha-containing product through different bundles.

This MCP server connects a model to [OlaOla](https://www.olaola.cz/) product data, product composition details, account order history, anonymous shadow carts, and quick-buy links. The connector retrieves facts; the model keeps the personal context, asks follow-up questions, checks ingredients, compares doses, and decides what is worth recommending.

## What Can You Do?

### Personal Supplement Picking

Use your existing chat context and ask for recommendations that respect your real constraints:

```text
"What should I buy on OlaOla if I am constantly tired?"
"Find something for energy, but avoid ashwagandha."
"I already take vitamin D and magnesium. What still makes sense?"
"Compare OlaDen with magnesium malate for fatigue and value."
```

The model can search [OlaOla](https://www.olaola.cz/), use public product-content text from [olaola.cz](https://www.olaola.cz/) for extra context, fetch the actual product composition, check ingredient amounts, and explain why a product is a good fit, bad fit, or only a maybe.

### Stack And Combination Checks

The MCP is useful when the question is not just "what is popular?", but "what fits with what I already have?":

```text
"Can I combine these supplements?"
"Is there duplicated vitamin D in this stack?"
"Which products in my planned cart contain ashwagandha?"
"What should I skip until I have blood tests?"
```

The model should ask about current supplements, medication risks, goals, budget, and labs before making confident recommendations.

### Order History

With local [OlaOla](https://www.olaola.cz/) credentials configured, the MCP can read your account order history on demand:

```text
"What did I already buy from OlaOla?"
"Did my last OlaOla order already include magnesium?"
"Use my previous OlaOla purchases as context for this recommendation."
```

The server does not store this history. It logs in, fetches the requested account page, returns normalized results, and keeps authenticated cookies in memory only for that request.

### Cart Planning

You can build an anonymous planning cart, read your real [OlaOla](https://www.olaola.cz/) account cart when credentials are configured, or export a recommended stack as a quick-buy link:

```text
"Create a simple energy stack under 900 Kč."
"Add the best candidates to a planning cart."
"What's currently in my OlaOla cart?"
"Generate a quick-buy link for this stack."
```

## Quick Start

```bash
cd /Users/bxxf/projects/ola-ola
npm install
npm run build
npm run typecheck
```

To run the server directly:

```bash
cd /Users/bxxf/projects/ola-ola
npm start
```

For local development without building first:

```bash
npm run dev
```

The server speaks MCP over `stdio`, so most local MCP clients need a command plus args rather than a URL.

To run MCP over HTTP locally:

```bash
npm run dev:http
```

The HTTP MCP endpoint is available at:

```text
http://localhost:3000/mcp
```

## Local MCP Setup

Use this for local MCP clients that can start a `stdio` server, such as Claude Desktop, Cursor, Codex, or native AI apps with MCP support.

Build the project first, then add this server to your MCP client config:

```json
{
  "mcpServers": {
    "olaola": {
      "command": "node",
      "args": ["/Users/bxxf/projects/ola-ola/dist/server.js"]
    }
  }
}
```

To enable [OlaOla](https://www.olaola.cz/) account order history, add credentials as environment variables in the MCP client config:

```json
{
  "mcpServers": {
    "olaola": {
      "command": "node",
      "args": ["/Users/bxxf/projects/ola-ola/dist/server.js"],
      "env": {
        "OLAOLA_EMAIL": "you@example.com",
        "OLAOLA_PASSWORD": "your-password"
      }
    }
  }
}
```

Do not put credentials into prompts or tool arguments. Keep them in the local MCP client configuration only.

## ChatGPT Setup

Use the hosted MCP endpoint directly in ChatGPT:

1. Enable developer mode for custom MCP connectors in your workspace.
2. Create a new app/connector.
3. Provide this MCP endpoint: `https://olaola-mcp.bxxf.dev/mcp`.
4. Enable the connector in a new chat and test the tools.

ChatGPT custom connectors use the remote HTTP endpoint directly. Do not put OlaOla credentials into ChatGPT prompts.

## Remote MCP Clients

Use this for local MCP clients that connect to the hosted endpoint through `mcp-remote`, such as Codex, Claude Desktop, Cursor, or other clients that expect a local command.

Public product lookup only:

```json
{
  "mcpServers": {
    "olaola": {
      "command": "npx",
      "args": ["mcp-remote", "https://olaola-mcp.bxxf.dev/mcp"]
    }
  }
}
```

With per-user OlaOla account tools, pass credentials from local environment variables as headers:

```json
{
  "mcpServers": {
    "olaola": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://olaola-mcp.bxxf.dev/mcp",
        "--header",
        "olaola-email: ${OLAOLA_EMAIL}",
        "--header",
        "olaola-password: ${OLAOLA_PASSWORD}"
      ],
      "env": {
        "OLAOLA_EMAIL": "you@example.com",
        "OLAOLA_PASSWORD": "your-password"
      }
    }
  }
}
```

Only use headers with an HTTPS endpoint you control or trust. The remote MCP server receives the password on every request that includes the header.

### Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.olaola]
command = "npx"
args = [
  "mcp-remote",
  "https://olaola-mcp.bxxf.dev/mcp",
  "--header",
  "olaola-email: ${OLAOLA_EMAIL}",
  "--header",
  "olaola-password: ${OLAOLA_PASSWORD}"
]

[mcp_servers.olaola.env]
OLAOLA_EMAIL = "you@example.com"
OLAOLA_PASSWORD = "your-password"
```

### Claude Desktop

Add the JSON config above to Claude Desktop's MCP config file, then restart Claude Desktop.

## Custom Deployment

The server supports Streamable HTTP at `/mcp`, so it can be deployed behind a public HTTPS URL.

This repository deploys to the custom domain `olaola-mcp.bxxf.dev`. For your own deployment, replace every endpoint example with:

```text
https://YOUR_CUSTOM_DOMAIN/mcp
```

The domain's Cloudflare zone must be in the selected Cloudflare account or available to that account.

For local HTTP testing:

```bash
npm run build
npm run start:http
```

For Cloudflare Workers, copy the example config and replace the route with your own domain:

```bash
cp wrangler.example.toml wrangler.toml
```

`wrangler.toml` is intentionally gitignored because it is deployment-specific.

Then deploy:

```bash
npm run deploy:cloudflare
```

For account tools, a shared hosted deployment must not use one global OlaOla account. Do not set `OLAOLA_EMAIL` or `OLAOLA_PASSWORD` as Cloudflare secrets on a public deployment, because every user would operate through that same account.

For local-only usage, `stdio` can still read credentials from the MCP client environment.

## Tools

### Account

- `olaola_get_auth_status`: check whether [OlaOla](https://www.olaola.cz/) login is configured and working.
- `olaola_get_order_history`: fetch authenticated [OlaOla](https://www.olaola.cz/) order summaries.
- `olaola_get_order_detail`: fetch one authenticated order detail.
- `olaola_read_account_cart`: fetch the real authenticated [OlaOla](https://www.olaola.cz/) cart.
- `olaola_add_to_cart`: add to the real account cart when credentials are configured, otherwise create/use a shadow cart. Real account cart changes require `confirmed=true`.
- `olaola_update_cart_item`: update an existing cart line item by `cartItemId`. Real account cart changes require `confirmed=true`.
- `olaola_remove_from_cart`: remove an existing cart line item by `cartItemId`. Real account cart changes require `confirmed=true`.
- `olaola_add_to_account_cart`: add a product to the real authenticated cart. Requires `confirmed=true`.

### Product Discovery

- `olaola_get_product`: parse a public product URL or slug.
- `olaola_get_product_details`: fetch product composition, ingredient amounts, warnings, and dosing text when available.
- `olaola_search_products`: search [OlaOla](https://www.olaola.cz/) for real product candidates using storefront search plus the product sitemap.
- `olaola_search_product_content`: search public WP product-content text for extra semantic context. These results are not directly cartable products.

### Cart Planning

- `olaola_create_shadow_cart`: create an anonymous cart session.
- `olaola_add_to_shadow_cart`: add a product variant or URL to a shadow cart.
- `olaola_read_shadow_cart`: read normalized cart items from a shadow cart.
- `olaola_update_cart_item`: update a shadow-cart line item when `mode="shadow"` and `cartId` are provided.
- `olaola_remove_from_cart`: remove a shadow-cart line item when `mode="shadow"` and `cartId` are provided.
- `olaola_generate_quick_buy_url`: generate an [OlaOla](https://www.olaola.cz/) quick-buy URL from variant IDs or product URLs.

Credentials are read only from local environment variables. Passwords and cookies are never returned by tools. Authenticated cookies stay in memory for the request.

## Stateless By Default

Supplement history, owned products, medication context, ingredient exclusions, and product feedback can be sensitive. This MCP does not store those details in a database or local profile. The model should use personal information from the active chat context, and account history should be fetched live from [OlaOla](https://www.olaola.cz/) only when credentials are configured and the user asks for it.

The only server-side state is short-lived process memory for anonymous shadow carts and authenticated request cookies. It is not durable and is not returned to the model.

Tools that modify the real [OlaOla](https://www.olaola.cz/) account cart require explicit confirmation. For planning, prefer shadow carts or quick-buy links until the user is ready to change their actual cart.

HTTP deployments are stateless per request. That is good for product lookup, product details, order history, account cart reads, account cart mutations, and quick-buy links. Anonymous shadow carts are best for local `stdio` or a single long-running local process; a globally deployed Worker should treat quick-buy links as the portable planning output unless a durable session store is added intentionally.

## Limitations

The server does not currently maintain its own indexed copy of the [OlaOla](https://www.olaola.cz/) catalogue. Product discovery uses live [olaola.cz](https://www.olaola.cz/) search, the public product sitemap, and then fetches details for selected products. This keeps the connector simple and fresh, but it is not as accurate as a proper product index with embeddings or RAG over product names, ingredients, descriptions, use cases, and composition tables.

The WP product-content data is available only as optional context. It can mention benefits, ingredients, and use cases, but it does not reliably expose the real product URL, variant ID, price, or cart identifier. Treat it as discovery context and verify real products through product pages and product details before recommending or buying.

Because of that, the best results usually come from asking the model to search a few focused angles, inspect promising product details, and then compare actual ingredient amounts instead of trusting the first search result.

## Prompts

- `supplement_intake`: reusable intake prompt for supplement recommendation and cart audit workflows. It instructs the model to collect current supplements, doses, medications, relevant medical context, goals, diet/lifestyle, labs, and budget before making recommendations or checking combinations.

Prompts are client-invoked templates. They guide the model when used, but they do not replace application-level policy or validation.

## Cart Modes

### Shadow cart

The MCP process can create an anonymous OlaOla cart session for planning and comparison. The cookie stays inside the MCP process and is not shared with the user or the model.

### Account cart

With `OLAOLA_EMAIL` and `OLAOLA_PASSWORD` configured, the MCP can read the real [OlaOla](https://www.olaola.cz/) account cart live. It can also add products to the real cart, but only when the tool call includes `confirmed=true`.

### Quick-buy export

The server can also generate an [OlaOla](https://www.olaola.cz/) quick-buy link such as:

```text
https://www.olaola.cz/?quick-buy=43%2C16
```

The user's browser creates its own cart after opening the link. No session cookie is shared.
