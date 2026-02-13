// Barbershop Tag Browser — Frontend Logic

let allTags = []; // index entries
let tagCache = {}; // id -> full tag data
let activeTagId = null;

const $ = (sel) => document.querySelector(sel);

// ── Data Loading ────────────────────────
async function loadIndex() {
  const resp = await fetch("tags-bundle.json");
  const bundle = await resp.json();
  allTags = bundle.index;
  tagCache = bundle.tags;
  allTags.sort((a, b) => a.title.localeCompare(b.title));
  return allTags;
}

async function loadTag(id) {
  if (tagCache[id]) return tagCache[id];
  return null;
}

// ── Sidebar ─────────────────────────────
function populateKeyFilter() {
  const keys = [...new Set(allTags.map((t) => t.key))].sort();
  const sel = $("#key-filter");
  for (const k of keys) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    sel.appendChild(opt);
  }
}

function renderTagList(tags) {
  const ul = $("#tag-list");
  ul.innerHTML = "";

  for (const tag of tags) {
    const li = document.createElement("li");
    li.dataset.id = tag.id;
    if (tag.id === activeTagId) li.classList.add("active");

    li.innerHTML = `
      <span class="tag-name" title="${escHtml(tag.title)}">${escHtml(tag.title)}</span>
      <span class="tag-key-pill">${escHtml(tag.key)}</span>
    `;

    li.addEventListener("click", () => selectTag(tag.id));
    ul.appendChild(li);
  }

  $("#tag-count").textContent = `${tags.length} tag${tags.length !== 1 ? "s" : ""}`;
}

function getFilteredTags() {
  const query = $("#search").value.toLowerCase().trim();
  const keyFilter = $("#key-filter").value;

  return allTags.filter((t) => {
    if (keyFilter && t.key !== keyFilter) return false;
    if (query) {
      const haystack = [t.title, t.arranger, t.source, t.key]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });
}

function refreshList() {
  renderTagList(getFilteredTags());
}

// ── Mobile Navigation ────────────────────
function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function showTagView() {
  if (isMobile()) $(".layout").classList.add("tag-selected");
}

function showListView() {
  $(".layout").classList.remove("tag-selected");
}

// ── Tag View ────────────────────────────
async function selectTag(id) {
  activeTagId = id;
  refreshList();

  const tag = await loadTag(id);
  if (!tag) return;

  $("#welcome").hidden = true;
  const view = $("#tag-view");
  view.hidden = false;

  $("#tag-title").textContent = tag.title;
  $("#tag-key").textContent = `Key: ${tag.key}`;

  const arrangerEl = $("#tag-arranger");
  if (tag.arranger) {
    arrangerEl.textContent = `Arr: ${tag.arranger}`;
    arrangerEl.hidden = false;
  } else {
    arrangerEl.hidden = true;
  }

  const sourceEl = $("#tag-source");
  if (tag.source) {
    sourceEl.textContent = tag.source;
    sourceEl.hidden = false;
  } else {
    sourceEl.hidden = true;
  }

  renderPhrases(tag.phrases);
  showTagView();
}

function renderPhrases(phrases) {
  const container = $("#phrases");
  container.innerHTML = "";

  for (const phrase of phrases) {
    const div = document.createElement("div");
    div.classList.add("phrase");

    // Lyrics header
    const lyricsDiv = document.createElement("div");
    lyricsDiv.classList.add("phrase-lyrics");
    lyricsDiv.textContent = cleanLyrics(phrase.lyrics);
    div.appendChild(lyricsDiv);

    // Chord grid
    const grid = document.createElement("div");
    grid.classList.add("chord-grid");

    const inner = document.createElement("div");
    inner.classList.add("chord-grid-inner");

    const voices = [
      { key: "tenor", label: "Tenor", cls: "tenor" },
      { key: "lead", label: "Lead", cls: "lead" },
      { key: "lyric", label: "Lyrics", cls: "lyric" },
      { key: "bari", label: "Bari", cls: "bari" },
      { key: "bass", label: "Bass", cls: "bass" },
    ];

    for (const voice of voices) {
      const row = document.createElement("div");
      row.classList.add("grid-row", `${voice.cls}-row`);

      const label = document.createElement("div");
      label.classList.add("grid-label", `${voice.cls}-label`);
      label.textContent = voice.label;
      row.appendChild(label);

      const cells = document.createElement("div");
      cells.classList.add("grid-cells");

      for (const chord of phrase.chords) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");

        const val = chord[voice.key];
        if (val === null || val === undefined) {
          cell.textContent = "·";
          cell.classList.add("sustain");
        } else {
          cell.textContent = voice.key === "lyric" ? cleanLyricCell(val) : val;
        }
        cells.appendChild(cell);
      }

      row.appendChild(cells);
      inner.appendChild(row);
    }

    grid.appendChild(inner);
    div.appendChild(grid);
    container.appendChild(div);
  }
}

// ── Helpers ──────────────────────────────
function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function cleanLyrics(text) {
  // Replace em-dashes used for held syllables with a cleaner look
  return text.replace(/—+/g, "—");
}

function cleanLyricCell(text) {
  // Strip trailing punctuation dashes for display
  return text.replace(/—+$/, "~").replace(/—+/g, "~");
}

// ── Keyboard Navigation ─────────────────
document.addEventListener("keydown", (e) => {
  // Ctrl+K or / to focus search
  if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement !== $("#search"))) {
    e.preventDefault();
    $("#search").focus();
    $("#search").select();
    return;
  }

  // Arrow keys to navigate tag list
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const filtered = getFilteredTags();
    if (filtered.length === 0) return;
    const currentIdx = filtered.findIndex((t) => t.id === activeTagId);
    let nextIdx;
    if (e.key === "ArrowDown") {
      nextIdx = currentIdx < filtered.length - 1 ? currentIdx + 1 : 0;
    } else {
      nextIdx = currentIdx > 0 ? currentIdx - 1 : filtered.length - 1;
    }
    selectTag(filtered[nextIdx].id);
    // Scroll into view
    const li = $(`li[data-id="${filtered[nextIdx].id}"]`);
    if (li) li.scrollIntoView({ block: "nearest" });
  }
});

// ── Init ────────────────────────────────
async function init() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  await loadIndex();
  populateKeyFilter();
  refreshList();
  $("#total-count").textContent = allTags.length;

  $("#search").addEventListener("input", refreshList);
  $("#key-filter").addEventListener("change", refreshList);
  $("#back-btn").addEventListener("click", showListView);

  // Auto-select first tag if URL has hash
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    if (allTags.find((t) => t.id === id)) {
      selectTag(id);
    }
  }
}

init();
