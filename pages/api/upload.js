import formidable from "formidable";
import fs from "fs-extra";
import path from "path";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const dir = path.join(process.cwd(), "templates");
  await fs.ensureDir(dir);

  const form = formidable({ uploadDir: dir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.json({ error: err.message });
    return res.json({ ok: true, file: files.file });
  });
}
