---
title: "MCP Server"
description: "Connect AI chatbots to your PortalJS Cloud portal through the MCP server."
---


PortalJS Cloud exposes your portal's data through a **Model Context Protocol (MCP)** server. Connect it to any MCP-compatible AI chatbot (Claude, Cursor, etc.) and explore your open data with natural language.

## Find your MCP URL

1. In the sidebar, click **MCP server**.

   ![placeholder: MCP server page](/static/img/cloud-docs/mcp-server-page.png)

2. Your MCP endpoint is shown in the input box. It looks like:

   ```
   https://mcp.portaljs.com/@<your-org-name>/sse
   ```

3. Click **Copy** to put it on your clipboard.

   ![placeholder: copy MCP URL](/static/img/cloud-docs/mcp-copy.png)

## Connect to a chatbot

The exact steps depend on the chatbot. In general:

1. Open your chatbot's MCP / integrations / connectors settings.
2. Add a new MCP server, pasting the URL you copied.
3. Save and (re)start the chat session.
4. Ask the chatbot questions about your data — for example, *"What datasets do you know about? Show me the top 5 rows of the budget dataset."*

For a walkthrough, see the demo video embedded on the **MCP server** page.

![placeholder: MCP demo video](/static/img/cloud-docs/mcp-demo-video.png)

### Example: connect with Claude (web)

1. Copy your MCP URL from the **MCP server** page (see [Find your MCP URL](#find-your-mcp-url)).
2. In Claude on the web, open **Customize → Connectors**.
3. Click **Add custom connector**.

   ![placeholder: Claude add custom connector](/static/img/cloud-docs/mcp-claude-add-connector.png)

4. Give it a name (for example, *My Data Portal*) and paste your MCP URL into the **Remote MCP server URL** field, then confirm.

   ![placeholder: Claude connector URL field](/static/img/cloud-docs/mcp-claude-connector-url.png)
   ![placeholder: Claude connector URL field](/static/img/cloud-docs/mcp-claude-funcs.png)

5. Start a new chat. Open the tools/attachments menu and make sure your connector is enabled.
6. Ask a question about your data, for example: *"What datasets are in my portal? Show me the first 5 rows of the dataset."* Claude calls the MCP server and answers using your portal's data.

   ![placeholder: Claude querying portal data](/static/img/cloud-docs/mcp-claude-query.png)

## What the chatbot can do

Through the MCP server, the chatbot can:

- List datasets and resources in your portal.
- Read resource contents (CSV, JSON, etc.).
- Answer questions and produce summaries grounded in your data.

Private datasets are **not** exposed via the MCP server.

## Troubleshooting

- **Chatbot can't connect** — confirm you pasted the full URL including the `/sse` suffix.
- **Chatbot sees no datasets** — make sure at least one dataset is marked **Public**. See [Datasets → Visibility](/cloud/docs/datasets#visibility-public-vs-private).
