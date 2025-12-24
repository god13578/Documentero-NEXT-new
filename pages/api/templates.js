import fs from "fs-extra";
import path from "path";

export default async function handler(req, res) {
  const dir = path.join(process.cwd(), "templates");
  await fs.ensureDir(dir);
  const files = await fs.readdir(dir);
  res.json({ templates: files });
}
