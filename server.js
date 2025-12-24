const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "/tmp" });

app.post("/convert", upload.single("file"), (req, res) => {
  const input = req.file.path;
  const outDir = "/tmp/out";

  fs.mkdirSync(outDir, { recursive: true });

  const cmd = `libreoffice --headless --convert-to pdf --outdir ${outDir} ${input}`;

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("convert failed");
    }

    const pdf = fs.readdirSync(outDir).find(f => f.endsWith(".pdf"));
    res.sendFile(path.join(outDir, pdf));
  });
});

app.listen(4000, () => {
  console.log("LibreOffice service running on :4000");
});
