
/* JESUS EMBASSY — FOR ALL NATIONS
   Full CMS content connector
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

function cmsEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function cmsParseMarkdown(markdown) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  const fields = {};

  let body = markdown;

  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
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

    body = markdown.slice(match[0].length).trim();
  }

  return { fields, body };
}

/* Convert common Markdown formatting into safe HTML. */
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

function cmsFormatMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const output = [];
  let paragraph = [];
  let listType = null;

  function flushParagraph() {
    if (paragraph.length) {
      output.push("<p>" + paragraph.map(cmsFormatInline).join("<br>") + "</p>");
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
      output.push(`<h${level}>${cmsFormatInline(heading[2])}</h${level}>`);
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

      output.push(`<li>${cmsFormatInline((unordered || ordered)[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();

  return output.join("\n");
}

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
      (/^https?:\/\//i.test(url) || url.startsWith("/assets/"))
    ) {
      links += `<a href="${cmsEscape(url)}" target="_blank" rel="noopener noreferrer">${label}</a> `;
    }
  }

  return `
    <article class="cms-content-card cms-${collection.type}-card">
      <h3>${title}</h3>
      ${date ? `<p class="cms-content-date">${date}</p>` : ""}
      ${location ? `<p>${location}</p>` : ""}
      ${description ? `<p class="cms-content-description">${description}</p>` : ""}
      ${body ? `<div class="cms-full-content">${body}</div>` : ""}
      ${links ? `<p class="cms-content-links">${links}</p>` : ""}
    </article>
  `;
}

async function cmsLoadCollection(collection) {
  const target = document.getElementById(collection.target);
  if (!target) return;

  target.innerHTML = "<p>Loading ministry content…</p>";

  try {
    const apiURL =
      `https://api.github.com/repos/${CMS_REPOSITORY}/contents/` +
      `${collection.path}?ref=${CMS_BRANCH}`;

    const response = await fetch(apiURL);

    if (response.status === 404) {
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
      return;
    }

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const files = await response.json();

    const markdownFiles = files.filter(file =>
      file.type === "file" && /\.md$/i.test(file.name)
    );

    if (!markdownFiles.length) {
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
      return;
    }

    const entries = await Promise.all(
      markdownFiles.map(async file => {
        const fileResponse = await fetch(file.download_url);

       if (!fileResponse.ok) {
  console.error("CMS file request failed:", fileUrl, fileResponse.status);
  return null;
}

const markdown = await fileResponse.text();
const parsed = cmsParseMarkdown(markdown);

if (!parsed.fields.title) {
  console.error("CMS file has no title:", fileUrl, markdown);
  return null;
}

        return {
          fields: parsed.fields,
          body: parsed.body,
          filename: file.name
        };
      })
    );

    const validEntries = entries
      .filter(Boolean)
      .sort((a, b) =>
        String(b.fields.date || "").localeCompare(
          String(a.fields.date || "")
        )
      );

    target.innerHTML = validEntries.length
      ? validEntries.map(item => cmsCard(item, collection)).join("")
      : `<p>${cmsEscape(collection.empty)}</p>`;
  } catch (error) {
    console.error("CMS content loading failed:", error);
    target.innerHTML =
      "<p>Content could not load right now. Please try again later.</p>";
  }
}

function loadMinistryCMSContent() {
  CMS_COLLECTIONS.forEach(cmsLoadCollection);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadMinistryCMSContent);
} else {
  loadMinistryCMSContent();
}
