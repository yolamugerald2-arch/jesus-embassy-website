
/*
 * JESUS EMBASSY — FOR ALL NATIONS
 * CMS content connector
 */

const CMS_REPOSITORY = "yolamugerald2-arch/jesus-embassy-website";
const CMS_BRANCH = "version-4";

const CMS_COLLECTIONS = [
  {
    path: "content/sermons",
    target: "cms-sermons",
    empty: "Sermons will appear here soon."
  },
  {
    path: "content/events",
    target: "cms-events",
    empty: "Ministry events will be announced here."
  },
  {
    path: "content/resources",
    target: "cms-resources",
    empty: "Teaching resources will be available here soon."
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

function cmsParseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const fields = {};

  if (!match) return fields;

  let currentKey = "";

  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);

    if (field) {
      currentKey = field[1];
      let value = field[2].trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      fields[currentKey] = value;
    } else if (currentKey && /^\s+/.test(line)) {
      fields[currentKey] += "\n" + line.trim();
    }
  }

  return fields;
}

function cmsCard(item, collectionPath) {
  const title = cmsEscape(item.title || "Untitled");
  const description = cmsEscape(item.description || "");
  const date = cmsEscape(item.date || "");
  const venue = cmsEscape(item.location || "");
  const video = item.video_url || "";
  const audio = item.audio_url || "";
  const file = item.file || "";

  let extraLinks = "";

  if (video.startsWith("https://") || video.startsWith("http://")) {
    extraLinks += ` <a href="${cmsEscape(video)}" target="_blank" rel="noopener noreferrer">Watch video</a>`;
  }

  if (audio.startsWith("https://") || audio.startsWith("http://")) {
    extraLinks += ` <a href="${cmsEscape(audio)}" target="_blank" rel="noopener noreferrer">Listen to audio</a>`;
  }

  if (file.startsWith("https://") || file.startsWith("http://")) {
    extraLinks += ` <a href="${cmsEscape(file)}" target="_blank" rel="noopener noreferrer">Open resource</a>`;
  } else if (file.startsWith("/assets/")) {
    extraLinks += ` <a href="${cmsEscape(file)}" target="_blank" rel="noopener noreferrer">Open resource</a>`;
  }

  return `
    <article class="cms-content-card">
      <h3>${title}</h3>
      ${date ? `<p class="cms-content-date">${date}</p>` : ""}
      ${venue ? `<p>${venue}</p>` : ""}
      ${description ? `<p>${description.replace(/\n/g, "<br>")}</p>` : ""}
      ${extraLinks ? `<p class="cms-content-links">${extraLinks}</p>` : ""}
    </article>
  `;
}

async function cmsLoadCollection(collection) {
  const target = document.getElementById(collection.target);
  if (!target) return;

  target.setAttribute("aria-live", "polite");
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
    const markdownFiles = files.filter(
      file => file.type === "file" && file.name.endsWith(".md")
    );

    if (!markdownFiles.length) {
      target.innerHTML = `<p>${cmsEscape(collection.empty)}</p>`;
      return;
    }

    const entries = await Promise.all(
      markdownFiles.map(async file => {
        const fileResponse = await fetch(file.download_url);
        if (!fileResponse.ok) return null;

        const markdown = await fileResponse.text();
        return cmsParseFrontMatter(markdown);
      })
    );

    const validEntries = entries.filter(Boolean);

    target.innerHTML = validEntries.length
      ? validEntries.map(item => cmsCard(item, collection.path)).join("")
      : `<p>${cmsEscape(collection.empty)}</p>`;
  } catch (error) {
    console.error("CMS content loading failed:", error);
    target.innerHTML =
      `<p>Content could not load right now. Please try again later.</p>`;
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
