import path from "path";

export function buildPdfHtml(
  content: string
) {
  const sarabunPath = path.join(
    process.cwd(),
    "fonts/THSarabunNew.ttf"
  );

  return `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<style>
@font-face {
  font-family: "THSarabunNew";
  src: url("file://${sarabunPath}") format("truetype");
}
body {
  font-family: "THSarabunNew", Arial, sans-serif;
  font-size: 16pt;
  line-height: 1.6;
}
</style>
</head>
<body>
${content}
</body>
</html>
`;
}
