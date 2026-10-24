import {SCENARIOS} from "../data/briefing.js";

const tabs = [...document.querySelectorAll("[data-flow]")];
function selectFlow(tab) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  }
}
tabs.forEach((tab, index) => {
  tab.disabled = false;
  tab.addEventListener("click", () => selectFlow(tab));
  tab.addEventListener("keydown", event => {
    const offsets = {ArrowRight: 1, ArrowLeft: -1};
    let next;
    if (event.key in offsets) next = (index + offsets[event.key] + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectFlow(tabs[next]);
    tabs[next].focus();
  });
});

const form = document.getElementById("board-form");
if (form) {
  const title = document.getElementById("board-title");
  const body = document.getElementById("board-body");
  const category = document.getElementById("board-category");
  const status = document.getElementById("board-status");
  let lastDraft = null;

  function draft(id, focus = true) {
    const scenario = SCENARIOS.find(item => item.id === id);
    if (!scenario || form.querySelector('button[type="submit"]').disabled) return false;
    const dirty = title.value.trim() || body.value.trim();
    const unchanged = lastDraft && title.value === lastDraft.draftTitle && body.value === lastDraft.draftBody && category.value === lastDraft.category;
    if (dirty && !unchanged && !window.confirm("Replace the title and record in your current draft? Your X handle will be kept.")) return false;
    title.value = scenario.draftTitle;
    body.value = scenario.draftBody;
    category.value = scenario.category;
    category.dispatchEvent(new Event("change", {bubbles: true}));
    lastDraft = scenario;
    status.textContent = "SCENARIO DRAFT - NOT POSTED";
    if (focus) {
      document.getElementById("board-submit").scrollIntoView({block:"start"});
      title.focus({preventScroll:true});
    }
    return true;
  }

  document.querySelectorAll("[data-scenario]").forEach(link => {
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (draft(link.dataset.scenario)) {
        const url = new URL(location.href);
        url.searchParams.set("scenario", link.dataset.scenario);
        url.hash = "board-submit";
        history.replaceState(null, "", url);
      }
    });
  });
  form.addEventListener("reset", () => { lastDraft = null; });
  draft(new URLSearchParams(location.search).get("scenario"), false);
}
