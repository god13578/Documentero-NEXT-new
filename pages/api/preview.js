import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).send("missing name");
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "previews",
    `${name}.preview.html`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("preview not found");
  }

  const html = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}
