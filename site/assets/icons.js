/* ---------------------------------------------------------------------------
   Fermah Atlas — pixel icon set.

   Every icon is a 7x7 grid drawn from the same module as the logo, so the games
   stay inside the brand instead of importing clip art. `#` is an on cell.
--------------------------------------------------------------------------- */

const ICONS = {
  pi:        ["#######","#######",".##.##.",".##.##.",".##.##.",".##.##.","##...##"],
  kernel:    ["##...##",".#####.","##...##","#..#..#","##...##",".#####.","##...##"],
  froben:    ["#######","##.....","##.....","#####..","##.....","##.....","##....."],
  flashcast: ["....##.","...##..","..###..",".#####.","..###..","...##..","..##..."],
  seeker:    ["..###..",".#...#.","#..#..#","#.###.#","#..#..#",".#...#.","..###.."],
  matchmaker:["##...##","###.###",".#####.","..###..",".#####.","###.###","##...##"],
  prover:    ["#.#.#.#","#.#.#.#","#######","..###..","..###..",".#####.","#######"],
  proof:    ["......#",".....##","#...##.","##.##..",".####..","..##...","......."],
  zksync:    ["#######","....##.","...##..","..##...",".##....","##.....","#######"],
  abstract:  [".#####.","##...##","#..#..#","#.###.#","#..#..#","##...##",".#####."],
  request:   ["..###..",".#####.","##...##","##...##","##...##",".#####.","..###.."],
  node:      ["##...##","##...##","..###..",".#####.","..###..","##...##","##...##"],
  atlas:     ["#######","#.....#","#.###.#","#.#.#.#","#.###.#","#.....#","#######"],
  spark:     ["...#...","...#...","#..#..#",".#####.","#..#..#","...#...","...#..."]
};

const ICON_ORDER = ["pi","kernel","froben","flashcast","seeker","matchmaker",
                    "prover","proof","zksync","abstract","request","node"];

const ICON_LABEL = {
  pi:"π", kernel:"Kernel", froben:"Froben", flashcast:"Flashcast", seeker:"Seeker",
  matchmaker:"Matchmaker", prover:"Prover", proof:"Proof", zksync:"ZKsync",
  abstract:"Abstract", request:"Request", node:"Node", atlas:"Atlas", spark:"Spark"
};

/** Inline SVG for an icon. `color` is any CSS colour. */
function iconSvg(name, color = "currentColor"){
  const g = ICONS[name];
  if (!g) return "";
  const n = g.length, cell = 100 / (n + (n - 1) * 0.14), gap = cell * 0.14;
  let out = "";
  for (let r = 0; r < n; r++){
    for (let c = 0; c < n; c++){
      if (g[r][c] !== "#") continue;
      out += `<rect x="${(c * (cell + gap)).toFixed(2)}" y="${(r * (cell + gap)).toFixed(2)}" ` +
             `width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${color}"/>`;
    }
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ` +
         `aria-hidden="true" focusable="false">${out}</svg>`;
}
