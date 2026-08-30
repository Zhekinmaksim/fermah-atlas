/* Fermah Atlas — the Fermafia card wall.
   Two rows of real Spotlight cards, each row duplicated so the marquee loops
   seamlessly at -50%. Shared by index.html and fermafia.html. */
function cardPath(handle){ return "cards/" + handle.toLowerCase() + ".png"; }

function mountWall(d, opts){
  const host = document.getElementById("wall-sec");
  if (!host) return;
  const skip = (opts && opts.skip) || 0;
  const named = d.creators.filter(c => c.spotlight_count > 0).map(c => c.display_handle);
  if (named.length < 12) return;
  const pool = named.slice(skip % Math.max(named.length - 18, 1));
  const rows = [pool.slice(0, 9), pool.slice(9, 18)];
  const html = list => list.concat(list).map((h, i) =>
    `<img loading="lazy" src="${cardPath(h)}" ` +
    (i < list.length ? `alt="Spotlight card for @${h}">` : 'alt="" aria-hidden="true">')).join("");
  document.getElementById("wall-a").innerHTML = html(rows[0]);
  document.getElementById("wall-b").innerHTML = html(rows[1]);
  const meta = document.getElementById("wall-meta");
  if (meta){
    const s = d.source_summary;
    meta.textContent =
      `${s.unique_creators} CREATORS · ${s.announcements} WEEKS · ` +
      `${s.spotlight_selections} SPOTLIGHTS · ${s.honourable_mentions} MENTIONS`;
  }
  host.hidden = false;
}
