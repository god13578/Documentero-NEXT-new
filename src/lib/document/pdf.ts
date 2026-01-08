import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

export async function generatePdfFromHtml(
  html: string,
  outputPath: string
) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "2.5cm",
      bottom: "2.5cm",
      left: "3cm",
      right: "2cm",
    },
  });

  await browser.close();
}
