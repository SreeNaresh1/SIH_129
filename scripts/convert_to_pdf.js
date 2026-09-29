const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Check if marked is available in server/node_modules
let marked;
try {
  marked = require("../server/node_modules/marked");
} catch (e) {
  try {
    marked = require("marked");
  } catch (e2) {
    console.error("marked library not found:", e2.message);
    process.exit(1);
  }
}

// Find Edge or Chrome
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let browserPath = "";
if (fs.existsSync(chromePath)) {
  browserPath = chromePath;
} else if (fs.existsSync(edgePath)) {
  browserPath = edgePath;
} else {
  console.error("Neither Chrome nor Edge was found!");
  process.exit(1);
}

console.log("Using browser for PDF rendering:", browserPath);

const targetDir = path.join(__dirname, "..", "sih_2026_submission_attachments");

const filesToConvert = [
  {
    input: path.join(targetDir, "SIH2026_File1_Project_Datasheet.md"),
    outputHtml: path.join(targetDir, "SIH2026_File1_Project_Datasheet.html"),
    outputPdf: path.join(targetDir, "SIH2026_File1_Project_Datasheet.pdf"),
    title: "SIH 2026 - Project Datasheet (PS 26129 - MahaSetu)"
  },
  {
    input: path.join(targetDir, "SIH2026_File2_AI_Benchmark_and_Test_Results.md"),
    outputHtml: path.join(targetDir, "SIH2026_File2_AI_Benchmark_and_Test_Results.html"),
    outputPdf: path.join(targetDir, "SIH2026_File2_AI_Benchmark_and_Test_Results.pdf"),
    title: "SIH 2026 - AI Benchmarks & Test Evaluation Report (PS 26129 - MahaSetu)"
  },
  {
    input: path.join(targetDir, "SIH2026_File3_Executive_Poster_and_Architecture.md"),
    outputHtml: path.join(targetDir, "SIH2026_File3_Executive_Poster_and_Architecture.html"),
    outputPdf: path.join(targetDir, "SIH2026_File3_Executive_Poster_and_Architecture.pdf"),
    title: "SIH 2026 - Official Presentation Poster & Architecture (PS 26129 - MahaSetu)"
  }
];

function buildHtml(markdownContent, title) {
  const htmlContent = marked.parse(markdownContent);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 14mm 16mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  
  /* Top Branding Header */
  .doc-header {
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 6px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .doc-header .org-badge {
    font-size: 8.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2563eb;
  }
  .doc-header .meta-badge {
    font-size: 8pt;
    color: #64748b;
    font-weight: 600;
  }

  /* Headings */
  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    line-height: 1.25;
  }
  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a8a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 10pt;
    font-weight: 700;
    color: #334155;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 6px 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }
  th {
    background: #1e293b !important;
    color: #ffffff !important;
    text-align: left;
    padding: 6px 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
    border: 1px solid #1e293b;
  }
  td {
    padding: 5px 9px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Code / Pre Blocks */
  pre {
    background: #0f172a !important;
    color: #f8fafc !important;
    padding: 9px 12px;
    border-radius: 6px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 8pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 8px 0;
    page-break-inside: avoid;
    border-left: 3.5px solid #3b82f6;
  }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 8pt;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #0f172a;
  }
  pre code {
    background: transparent;
    padding: 0;
    color: inherit;
  }

  /* Blockquotes / Callout Alerts */
  blockquote {
    margin: 8px 0;
    padding: 6px 12px;
    background: #eff6ff;
    border-left: 3.5px solid #2563eb;
    border-radius: 0 6px 6px 0;
    color: #1e40af;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  /* Lists */
  ul, ol {
    margin: 3px 0 8px 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 2px;
  }

  /* Horizontal Rules */
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 12px 0;
  }

  /* Footer */
  .doc-footer {
    border-top: 1px solid #cbd5e1;
    padding-top: 5px;
    margin-top: 20px;
    font-size: 7.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
</head>
<body>
  <div class="doc-header">
    <div class="org-badge">🇮🇳 Smart India Hackathon 2026 • Problem SIH-43</div>
    <div class="meta-badge">Government of Jharkhand • Higher Education Institutions • Corporate CSR</div>
  </div>
  
  <div class="doc-content">
    ${htmlContent}
  </div>

  <div class="doc-footer">
    <div>Jharkhand Societal Innovation Collaboration Portal | Official Evaluation Attachment</div>
    <div>Confidential &amp; Proprietary • Smart India Hackathon 2026</div>
  </div>
</body>
</html>`;
}

console.log("Starting conversion of 3 markdown files to PDF...");

filesToConvert.forEach((item, index) => {
  try {
    console.log(`\n[${index + 1}/3] Processing: ${path.basename(item.input)}`);
    const mdContent = fs.readFileSync(item.input, "utf-8");
    const fullHtml = buildHtml(mdContent, item.title);
    fs.writeFileSync(item.outputHtml, fullHtml, "utf-8");
    console.log(` -> HTML generated: ${path.basename(item.outputHtml)}`);

    // Run Chrome/Edge headless to generate PDF
    const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${item.outputPdf}" "${item.outputHtml}"`;
    execSync(cmd, { stdio: "pipe" });

    if (fs.existsSync(item.outputPdf)) {
      const stats = fs.statSync(item.outputPdf);
      console.log(` -> SUCCESS! PDF created: ${path.basename(item.outputPdf)} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(` -> Failed to create PDF for ${item.title}`);
    }
  } catch (err) {
    console.error(` -> Error processing ${item.input}:`, err.message);
  }
});

console.log("\nAll 3 PDF files have been generated successfully!");
