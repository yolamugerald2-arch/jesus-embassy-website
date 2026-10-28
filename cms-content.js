
/* JESUS EMBASSY — FOR ALL NATIONS
   CMS Content Connector — Corrected Version
*/

const CMS_REPOSITORY = "yolamugerald2-arch/jesus-embassy-website";
const CMS_BRANCH = "version-4";

const CMS_COLLECTIONS = [
  {
    path: "content/sermons",
    target: "cms-sermons",
    empty: "Sermons will appear here soon.",
    type: "sermon"
  },
  {
    path: "content/events",
    target: "cms-events",
    empty: "Ministry events will be announced here.",
    type: "event"
  },
  {
    path: "content/resources",
    target: "cms-resources",
    empty: "Teaching resources will be available here soon.",
    type: "resource"
  }
];

/* Safely escape text before inserting it into HTML. */
function cmsEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* Read title, date, description and other front-matter fields. */

function cmsParseMarkdown(markdown) {
  const text = String(markdown || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();

  const fields = {};
  const lines = text.split("\n");
  let bodyStart = 0;

  if (lines[0]?.trim() === "---") {
    const endIndex = lines.findIndex(
      (line, index) => index > 0 && line.trim() === "---"
    );

    if (endIndex !== -1) {
      for (const line of lines.slice(1, endIndex)) {
        const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);

        if (field) {
          let value = field[2].trim();

          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          fields[field[1]] = value;
        }
      }

      bodyStart = endIndex + 1;
    }
  }

  return {
    fields,
    body: lines.slice(bodyStart).join("\n").trim()
  };
}



/* Format inline Markdown safely. */
function cmsFormatInline(text) {
  let result = cmsEscape(text);

  result = result.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  return result;
}

/* Convert headings, paragraphs, lists and rules into HTML. */
function cmsFormatMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");

  const output = [];
  let paragraph = [];
  let listType = null;

  function flushParagraph() {
    if (paragraph.length) {
      output.push(
        "<p>" +
        paragraph.map(cmsFormatInline).join("<br>") +
        "</p>"
      );
      paragraph = [];
    }
  }

  function closeList() {
    if (listType) {
      output.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      closeList();

      const level = Math.min(heading[1].length + 1, 5);

      output.push(
        `<h${level}>${cmsFormatInline(heading[2])}</h${level}>`
      );
      continue;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      closeList();
      output.push("<hr>");
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);

    if (unordered || ordered) {
      flushParagraph();

      const nextType = unordered ? "ul" : "ol";

      if (listType !== nextType) {
        closeList();
        output.push(`<${nextType}>`);
        listType = nextType;
      }

      output.push(
        `<li>${cmsFormatInline((unordered || ordered)[1])}</li>`
      );
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();

  return output.join("\n");
}

/* Build a card for a sermon, event or resource. */
function cmsCard(item, collection) {
  const fields = item.fields;

  const title = cmsEscape(fields.title || "Untitled");
  const description = cmsEscape(fields.description || "");
  const date = cmsEscape(fields.date || "");
  const location = cmsEscape(fields.location || "");
  const body = cmsFormatMarkdown(item.body);

  let links = "";

  for (const [url, label] of [
    [fields.video_url, "Watch video"],
    [fields.audio_url, "Listen to audio"],
    [fields.file, "Open resource"]
  ]) {
    if (
      typeof url === "string" &&
      (
        /^https?:\/\//i.test(url) ||
        url.startsWith("/assets/")
      )
    ) {
      links +=
        `<a href="${cmsEscape(url)}" ` +
        `target="_blank" rel="noopener noreferrer">` +
        `${label}</a> `;
    }
  }

  return `
    <article class="cms-content-card cms-${collection.type}-card">
      <h3>${title}</h3>
      ${date ? `<p class="cms-content-date">${date}</p>` : ""}
      ${location ? `<p>${location}</p>` : ""}
      ${description
        ? `<p class="cms-content-description">${description}</p>`
        : ""}
      ${body ? `<div class="cms-full-content">${body}</div>` : ""}
      ${links ? `<p class="cms-content-links">${links}</p>` : ""}
    </article>
  `;
}

/* Load one Markdown file and report errors accurately. */
async function cmsLoadFile(file, collection) {
  const fileUrl =
    `https://raw.githubusercontent.com/${CMS_REPOSITORY}/` +
    `${CMS_BRANCH}/${collection.path}/` +
    encodeURIComponent(file.name);

  const fileResponse = await fetch(fileUrl, { cache: "no-store" });

  if (!fileResponse.ok) {
    throw new Error(
      `Could not load ${file.name}: HTTP ${fileResponse.status}`
    );
  }

  const markdown = await fileResponse.text();
  const parsed = cmsParseMarkdown(markdown);

  if (!parsed.fields.title) {
    throw new Error(
      `${file.name} has no readable title in its Markdown front matter.`
    );
  }

  return {
    fields: parsed.fields,
    body: parsed.body,
    filename: file.name
  };
}

/* Load one complete collection from GitHub. */
async function cmsLoadCollection(collection) {
  const target = document.getElementById(collection.target);

  if (!target) {
    console.error(
      `CMS display area not found: #${collection.target}`
    );
    return;
  }

  target.innerHTML = "<p>Loading ministry content…</p>";

  try {
    const apiURL =
      `https://api.github.com/repos/${CMS_REPOSITORY}/contents/` +
      `${collection.path}?ref=${CMS_BRANCH}`;

    const response = await fetch(apiURL, { cache: "no-store" });

    if (response.status === 404) {
      console.warn(`CMS folder not found: ${collection.path}`);
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
      return;
    }

    if (!response.ok) {
      throw new Error(
        `GitHub folder request failed: HTTP ${response.status}`
      );
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      throw new Error(
        `GitHub did not return a file list for ${collection.path}.`
      );
    }

    const markdownFiles = files.filter(file =>
      file.type === "file" && /\.md$/i.test(file.name)
    );

    if (!markdownFiles.length) {
      console.info(`No Markdown files in ${collection.path}`);
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
      return;
    }

    const results = await Promise.allSettled(
      markdownFiles.map(file => cmsLoadFile(file, collection))
    );

    const entries = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        entries.push(result.value);
      } else {
        console.error(
          `CMS could not load ${markdownFiles[index].name}:`,
          result.reason
        );
      }
    });

    entries.sort((a, b) =>
      String(b.fields.date || "").localeCompare(
        String(a.fields.date || "")
      )
    );

    if (entries.length) {
      target.innerHTML = entries
        .map(item => cmsCard(item, collection))
        .join("");
    } else if (results.some(result => result.status === "rejected")) {
      target.innerHTML =
        "<p>Some content could not load. Please try again later.</p>";
    } else {
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
    }

    console.info(
      `CMS ${collection.type}: loaded ${entries.length} of ` +
      `${markdownFiles.length} Markdown file(s).`
    );
  } catch (error) {
    console.error(
      `CMS ${collection.type} loading failed:`,
      error
    );

    target.innerHTML =
      "<p>Content could not load right now. Please try again later.</p>";
  }
}

/* Load sermons, events and resources. */
function loadMinistryCMSContent() {
  CMS_COLLECTIONS.forEach(collection => {
    cmsLoadCollection(collection);
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    loadMinistryCMSContent
  );
} else {
  loadMinistryCMSContent();
}
