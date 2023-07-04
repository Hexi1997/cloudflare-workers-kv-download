import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const accountId = process.env.ACCOUNT_ID;
const apiKey = process.env.API_KEY;
const nameSpaceId = process.env.KV_NAMESPACE_ID;
const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};
const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nameSpaceId}`;

/**
 * 获取kv的所有key
 * @returns key name array
 */
async function getKeys(): Promise<string[]> {
  const url = `${baseUrl}/keys`;
  const res = await fetch(url, {
    headers,
  }).then((v: any) => v.json());
  if (res.success) {
    return res.result.map((item: any) => item.name);
  } else {
    return [];
  }
}

async function getValueByKey(key: string): Promise<any> {
  const url = `${baseUrl}/values/${key}`;
  const res = await fetch(url, {
    headers,
  }).then((v) => v.text());
  return res;
}

async function main() {
  // 清空dist文件夹
  fs.emptyDirSync(path.resolve(__dirname, "../dist"));
  const keys = (await getKeys());
  const keyArrayLen = keys.length;
  for (let i = 0; i < keyArrayLen; i++) {
    const key = keys[i];
    console.log(`${i + 1}/${keyArrayLen} ${key} is downloading...`);
    const value = await getValueByKey(key);
    const filePath = path.resolve(__dirname, "../dist", key);
    writeFileSyncRecursive(filePath, value);
  }
}

main().catch(console.error);

function writeFileSyncRecursive(filename: any, content: any) {
  fs.ensureFileSync(filename);
  fs.writeFileSync(filename, content);
}
