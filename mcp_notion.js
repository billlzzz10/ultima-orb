#!/usr/bin/env node
// Simple MCP-style wrapper for common Notion actions used by the project
// Usage: node mcp_notion.js <action> [id]

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error('Set NOTION_TOKEN environment variable');
  process.exit(1);
}
const notion = new Client({ auth: token });

const [,, action, idArg] = process.argv;

function normalizeId(id) {
  if (!id) return null;
  return id.split('?')[0].split('-').pop();
}

function writeOutput(actionName, id, data){
  try{
    const outDir = path.join(process.cwd(), 'notion-outputs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const safeId = id ? id.replace(/[^a-zA-Z0-9_-]/g, '') : 'noid';
    const fileName = `notion-${actionName}-${safeId}-${Date.now()}.json`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('WROTE:', filePath);
  }catch(e){
    console.error('Write error:', e.message || e);
  }
}

async function retrievePage(id) {
  const page_id = normalizeId(id);
  const resp = await notion.pages.retrieve({ page_id });
  writeOutput('retrieve-page', page_id, resp);
}

async function listBlocks(id) {
  const block_id = normalizeId(id);
  const all = [];
  let cursor = undefined;
  do {
    const resp = await notion.blocks.children.list({ block_id, start_cursor: cursor });
    all.push(...resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  writeOutput('list-blocks', block_id, all);
}

async function queryDatabase(id) {
  const database_id = normalizeId(id);
  const resp = await notion.databases.query({ database_id, page_size: 100 });
  writeOutput('query-database', database_id, resp);
}

(async ()=>{
  try {
    switch((action||'').toLowerCase()){
      case 'retrieve-page':
        await retrievePage(idArg);
        break;
      case 'list-blocks':
        await listBlocks(idArg);
        break;
      case 'query-database':
        await queryDatabase(idArg);
        break;
      default:
        console.log('Usage: node mcp_notion.js <retrieve-page|list-blocks|query-database> <id>');
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(2);
  }
})();
