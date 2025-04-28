const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const md = new markdownIt();

if (!process.argv[2])
  throw new Error(`Usage: node index.js <in-dir> [out-dir]`);

const style = /* css */ `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  padding: 20px;
  background-color: #f4f4f4;
}

h1, h2, h3 {
  color: #333;
  margin-bottom: 10px;
}

h1 {
  font-size: 2.5em;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

h2 {
  font-size: 2em;
  margin-bottom: 15px;
}

h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

p {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 15px;
}

ul, ol {
  margin-left: 20px;
}

li {
  margin-bottom: 10px;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background-color: #f8f9fa;
  padding: 0.2em 0.4em;
  border-radius: 5px;
  font-family: 'Courier New', Courier, monospace;
}

pre {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
}

blockquote {
  padding: 10px;
  background-color: #f0f0f0;
  border-left: 5px solid #007bff;
  margin-bottom: 20px;
}

hr {
  border: 1px solid #ddd;
  margin: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}`;

const toHtmlDocument = (html, title) => /* html */ ` <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          ${style}
        </style>
      </head>
      <body>
        <div class="container">${html}</div>
      </body>
    </html>`;

const outDir = process.argv[3] || process.argv[2];
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.lstatSync(outDir).isDirectory())
  throw new Error("input dir must be a directory, not a file.");

function copyOver(file, directory, outDirectory) {
  if (!fs.existsSync(outDirectory))
    fs.mkdirSync(outDirectory, { recursive: true });
  const input = path.join(directory, file);
  const output = path.join(outDirectory, file);

  console.error({
    file: file,
    directory: directory,
    outDirectory: outDirectory,
    input: input,
    output: output,
  });

  fs.copyFile(input, output, (err) => {
    if (err) throw err;
    console.log(`Copied ${input} over to ${output}.`);
  });
}

/** Function to recursively search for all README.md files and convert them to HTML */
const convertMdFilesToHtml = (directory, outDirectory) => {
  // Prevents recursion into the out dir
  if (directory === outDir) return;

  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);

    /* Copying over images */ {
      if (file.endsWith(".png")) copyOver(file, directory, outDirectory);
      if (file.endsWith(".jpeg")) copyOver(file, directory, outDirectory);
      if (file.endsWith(".jpg")) copyOver(file, directory, outDirectory);
      if (file.endsWith(".svg")) copyOver(file, directory, outDirectory);
      if (file.endsWith(".ico")) copyOver(file, directory, outDirectory);
    }

    /* ignoring these directories */ {
      if (file === "node_modules") return;
      if (file === ".git") return;
      if (file === ".github") return;
      if (file === ".vscode") return;
      if (file === ".devcontainer") return;
      if (file === "dist") return;
    }

    // recurse into directories
    if (fs.lstatSync(filePath).isDirectory())
      return convertMdFilesToHtml(filePath, path.join(outDirectory, file));

    // ignoring all other none targets
    if (file !== "README.md") return;

    /* Converting markdown files and creating HTML */ {
      const markdownContent = fs.readFileSync(filePath, "utf-8");

      const htmlContent = md
        .render(markdownContent)
        .replace(/href="(.*?)\/README\.md"/g, (match, p1) => {
          console.error({ p1 });
          return `href="${p1}"`;
        });

      const title = directory.split("/").slice(-1).pop().replace(/-/g, " ");
      const result = toHtmlDocument(htmlContent, title);

      const outputPath = path.join(
        outDirectory,
        file.replace("README.md", "index.html"),
      );

      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      fs.writeFileSync(outputPath, result);
      console.log(`Converted: ${filePath} to ${outputPath}`);
    }
  });
};

convertMdFilesToHtml(process.argv[2], outDir);
