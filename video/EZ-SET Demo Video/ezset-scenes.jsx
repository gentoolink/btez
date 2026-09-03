/* EZE-SET demo — scene components + device illustration.
   Loads after animations-v2.jsx and tweaks-panel.jsx (globals available on window). */

const Theme = React.createContext(null);
const useTheme = () => React.useContext(Theme);

/* ---------- helpers ---------- */
const E = () => window.Easing;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
// ramp: 0 before a, 1 after b, eased between
function ramp(p, a, b, ease) {
  const t = clamp01((p - a) / (b - a));
  return ease ? ease(t) : t;
}
// in/out envelope for a scene element: fades in then out, 0 at p=0 and p=1
function env(p, inEnd = 0.14, outStart = 0.86) {
  const ez = E().cubicOut, ei = E().cubicIn;
  return Math.min(ramp(p, 0, inEnd, ez), 1 - ramp(p, outStart, 1, ei));
}

/* ---------- shared SVG defs ---------- */
function Defs({ th }) {
  return (
    <defs>
      <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={th.pipeHi} />
        <stop offset="0.28" stopColor={th.pipe} />
        <stop offset="0.72" stopColor={th.pipe} />
        <stop offset="1" stopColor={th.pipeLo} />
      </linearGradient>
      <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={th.wLo} />
        <stop offset="0.4" stopColor={th.wHi} />
        <stop offset="0.6" stopColor={th.white} />
        <stop offset="1" stopColor={th.wLo} />
      </linearGradient>
      <linearGradient id="thread" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={th.wLo} />
        <stop offset="0.5" stopColor={th.white} />
        <stop offset="1" stopColor={th.wLo} />
      </linearGradient>
      <linearGradient id="blkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={th.blkHi} />
        <stop offset="1" stopColor={th.blk} />
      </linearGradient>
      <radialGradient id="vign" cx="0.5" cy="0.42" r="0.75">
        <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
        <stop offset="1" stopColor="rgba(0,0,0,0.5)" />
      </radialGradient>
    </defs>
  );
}

/* ---------- device parts ---------- */
function ScrewAuger({ cx, topY, bottomY, phase = 0 }) {
  const r = 17;
  const id = "ac" + Math.round(cx) + "_" + Math.round(topY);
  const pointBase = bottomY - 30;        // where the cone tip begins
  const shaftSpan = pointBase - topY;
  const pitch = 26;                      // same thread pitch as Post
  const n = Math.max(3, Math.round(shaftSpan / pitch));
  const off = ((phase % 1) + 1) % 1 * pitch;
  const threads = [];
  for (let i = -1; i < n + 2; i++) {
    const y = topY + off + i * pitch;
    threads.push(
      <polygon key={i}
        points={`${cx - r - 9},${y + 11} ${cx + r + 9},${y - 4} ${cx + r + 9},${y + 4} ${cx - r - 9},${y + 19}`}
        fill="url(#thread)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" />
    );
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          {/* threads stop at the point base — none extend past the tip */}
          <rect x={cx - r - 11} y={topY} width={2 * r + 22} height={pointBase - topY} />
        </clipPath>
      </defs>
      <rect x={cx - r} y={topY} width={2 * r} height={pointBase - topY} rx={r} fill="url(#coreGrad)" />
      <polygon points={`${cx - r},${pointBase} ${cx + r},${pointBase} ${cx},${bottomY}`} fill="url(#coreGrad)" />
      <g clipPath={`url(#${id})`}>{threads}</g>
    </g>
  );
}

function FinPlate({ cx, cy, th, scale = 1 }) {
  const rx = 96 * scale, ry = 17 * scale;
  return (
    <g>
      <ellipse cx={cx} cy={cy + 7 * scale} rx={rx} ry={ry} fill={th.blk} opacity="0.9" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#blkGrad)" />
      <polygon points={`${cx - rx * 0.5},${cy} ${cx + rx * 0.5},${cy} ${cx + rx * 0.14},${cy + ry + 12 * scale} ${cx - rx * 0.14},${cy + ry + 12 * scale}`} fill={th.blk} />
    </g>
  );
}

// Threaded shaft segment — same auger thread as ScrewAuger but no point tip.
// Used above the fin plate so the whole device reads as one continuous screw.
function Post({ cx, topY, botY, th, phase = 0 }) {
  const r = 17;
  const id = "ps" + Math.round(cx) + "_" + Math.round(topY);
  const span = botY - topY;
  const pitch = 26;
  const n = Math.max(3, Math.round(span / pitch));
  const off = (((phase % 1) + 1) % 1) * pitch;
  const threads = [];
  for (let i = -1; i < n + 1; i++) {
    const y = topY + off + i * pitch;
    threads.push(
      <polygon key={i}
        points={`${cx - r - 9},${y + 11} ${cx + r + 9},${y - 4} ${cx + r + 9},${y + 4} ${cx - r - 9},${y + 19}`}
        fill="url(#thread)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" />
    );
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={cx - r - 11} y={topY} width={2 * r + 22} height={span} />
        </clipPath>
      </defs>
      <rect x={cx - r} y={topY} width={2 * r} height={span} rx={r} fill="url(#coreGrad)" />
      <g clipPath={`url(#${id})`}>{threads}</g>
    </g>
  );
}

function BoltHead({ cx, y, th, w = 21, h = 20 }) {
  const k = w * 0.42;
  const pts = [
    [cx - w, y - h / 2 + k * 0.5], [cx - w + k, y - h / 2], [cx + w - k, y - h / 2], [cx + w, y - h / 2 + k * 0.5],
    [cx + w, y + h / 2 - k * 0.5], [cx + w - k, y + h / 2], [cx - w + k, y + h / 2], [cx - w, y + h / 2 - k * 0.5],
  ];
  return (
    <g>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="url(#coreGrad)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      <ellipse cx={cx} cy={y} rx={w * 0.5} ry={h * 0.3} fill="rgba(0,0,0,0.14)" />
    </g>
  );
}

// Pipe holder: a thick curved band (deep U/C hoop) of uniform thickness that
// wraps around the pipe — arms rise past the pipe centerline so the pipe is
// held INSIDE the hoop. Drawn IN FRONT of the pipe. Stem plugs onto the bolt head.
function Saddle({ cx, seatY, th, pipeR = 50 }) {
  const ri = pipeR + 5;              // inner radius (hugs the pipe)
  const t = 19;                      // band thickness
  const ro = ri + t;                 // outer radius
  const armTopY = seatY - pipeR * 0.78;  // arms rise above pipe center
  const d = `M ${cx - ro},${armTopY}
    L ${cx - ro},${seatY}
    A ${ro} ${ro} 0 0 0 ${cx + ro},${seatY}
    L ${cx + ro},${armTopY}
    L ${cx + ri},${armTopY}
    L ${cx + ri},${seatY}
    A ${ri} ${ri} 0 0 1 ${cx - ri},${seatY}
    L ${cx - ri},${armTopY} Z`;
  const stemBot = seatY + 74;
  return (
    <g>
      {/* short stem/collar down to the bolt head */}
      <rect x={cx - 13} y={seatY + ro - 8} width="26" height={stemBot - (seatY + ro) + 8} fill="url(#blkGrad)" />
      <path d={d} fill="url(#blkGrad)" stroke="rgba(0,0,0,0.4)" strokeWidth="1" strokeLinejoin="round" />
      {/* inner-face shading + outer highlight to read as a rounded band */}
      <path d={`M ${cx - ri - 1},${armTopY + 2} L ${cx - ri - 1},${seatY} A ${ri + 1} ${ri + 1} 0 0 0 ${cx + ri + 1},${seatY} L ${cx + ri + 1},${armTopY + 2}`}
        fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2.5" />
      <path d={`M ${cx - ro + 3},${armTopY + 4} L ${cx - ro + 3},${seatY} A ${ro - 3} ${ro - 3} 0 0 0 ${cx + ro - 3},${seatY}`}
        fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Pipe({ cx, cy, len, r, th, label }) {
  const x = cx - len / 2;
  return (
    <g>
      <rect x={x} y={cy - r} width={len} height={2 * r} rx={r} fill="url(#pipeGrad)" />
      <rect x={x} y={cy - r * 0.62} width={len} height={r * 0.34} rx={r * 0.17} fill={th.pipeHi} opacity="0.55" />
      <ellipse cx={x + len} cy={cy} rx={r * 0.34} ry={r} fill={th.pipeLo} />
      <ellipse cx={x + len} cy={cy} rx={r * 0.2} ry={r * 0.62} fill={th.pipeShadow} />
      {label && (
        <text x={cx} y={cy + 5} textAnchor="middle" fill={th.pipeShadow}
          style={{ font: "600 13px 'Barlow Condensed', sans-serif", letterSpacing: "2px", opacity: 0.5 }}>{label}</text>
      )}
    </g>
  );
}

function PipeEnd({ cx, cy, r, th }) {
  // pipe seen end-on: viewer looks straight into the open end
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#pipeGrad)" stroke={th.pipeLo} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r * 0.78} fill={th.pipeShadow} />
      <circle cx={cx} cy={cy + r * 0.06} r={r * 0.7} fill="#4a5158" />
      <path d={`M ${cx - r * 0.62} ${cy - r * 0.5} A ${r * 0.82} ${r * 0.82} 0 0 1 ${cx + r * 0.5} ${cy - r * 0.62}`}
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Ground({ y, th, w = 1280, wavy = 0, dark = false }) {
  // top edge, optionally wavy for "uneven ground"
  let d = `M 0 ${y}`;
  const seg = 8;
  for (let i = 0; i <= seg; i++) {
    const px = (w / seg) * i;
    const py = y + (wavy ? Math.sin(i * 1.6) * 10 * wavy - 4 * wavy : 0);
    d += ` L ${px} ${py}`;
  }
  d += ` L ${w} 720 L 0 720 Z`;
  const specks = [];
  for (let i = 0; i < 46; i++) {
    const sx = (i * 137.5) % w;
    const sy = y + 22 + ((i * 53) % 200);
    specks.push(<circle key={i} cx={sx} cy={sy} r={(i % 3) + 1} fill="rgba(0,0,0,0.22)" />);
  }
  return (
    <g>
      <path d={d} fill={dark ? th.groundDark : th.ground} />
      <path d={d} fill="url(#groundShade)" opacity="0.5" />
      {specks}
    </g>
  );
}

/* ---------- SVG stage wrapper ---------- */
function Frame({ th, children }) {
  return (
    <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ display: "block" }}>
      <Defs th={th} />
      <defs>
        <linearGradient id="groundShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="0.2" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1280" height="720" fill={th.bg} />
      {children}
      <rect x="0" y="0" width="1280" height="720" fill="url(#vign)" />
    </svg>
  );
}

/* label chip used across scenes */
function Kicker({ x, y, text, th, o = 1 }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y - 20} width={10} height={26} fill={th.accent} />
      <text x={x + 22} y={y} fill={th.accent}
        style={{ font: "700 20px 'Barlow Condensed', sans-serif", letterSpacing: "4px" }}>{text}</text>
    </g>
  );
}

/* =========================================================
   SCENES
   ========================================================= */

function Problem({ progress }) {
  const th = useTheme();
  const p = progress;
  const gy = 470;
  // pipe sags & shifts on a wavy soft ground with no support
  const wobble = Math.sin(p * Math.PI * 3) * (1 - ramp(p, 0.75, 1));
  const sag = ramp(p, 0.15, 0.7, E().cubicInOut) * 46;
  const drift = ramp(p, 0.2, 0.9) * 34;
  const pipeCy = 300 + sag + wobble * 6;
  const rot = (0.9 + wobble * 0.6) - drift * 0.06;
  const to = env(p, 0.12, 0.88);
  return (
    <Frame th={th}>
      <Ground y={gy} th={th} wavy={1.4} dark />
      {/* unsupported pipe, tilting */}
      <g transform={`translate(${640 + drift} ${pipeCy}) rotate(${rot})`}>
        <Pipe cx={0} cy={0} len={1180} r={48} th={th} />
      </g>
      {/* stress marks */}
      <g opacity={ramp(p, 0.4, 0.65) * (1 - ramp(p, 0.8, 1))}>
        {[-180, 180].map((dx, i) => (
          <text key={i} x={640 + dx} y={pipeCy - 78} textAnchor="middle" fill={th.accent}
            style={{ font: "700 40px 'Barlow Condensed', sans-serif" }}>↯</text>
        ))}
      </g>
      <g opacity={to}>
        <Kicker x={110} y={140} text="THE PROBLEM" th={th} />
        <text x={110} y={210} fill={th.ink}
          style={{ font: "700 66px 'Barlow Condensed', sans-serif", letterSpacing: "0.5px" }}>PIPES SAG. SHIFT. FAIL.</text>
        <text x={112} y={252} fill={th.inkDim}
          style={{ font: "400 25px 'Barlow', sans-serif" }}>Soft, uneven ground won't hold a water or sewage line in place.</text>
      </g>
    </Frame>
  );
}

function Reveal({ progress }) {
  const th = useTheme();
  const p = progress;
  // piece-by-piece assembly: 1) screw anchor (one piece: octagon head + threaded
  // shaft + point)  2) separate round adjuster plate threads down the shaft
  // 3) U-cradle sockets onto the bolt head  4) pipe lowers into the cradle
  const cx = 560, seatY = 200;
  const headY = seatY + 74;         // octagon bolt head (top of the screw)
  const shaftTop = headY + 8, shaftBot = 600;
  const plateSeat = 462;
  const anchorIn = ramp(p, 0.02, 0.16, E().cubicOut);
  const plateIn = ramp(p, 0.16, 0.26, E().cubicOut);
  const plateThread = ramp(p, 0.26, 0.46, E().cubicInOut);   // spins down the shaft
  const plateY = lerp(shaftTop + 40, plateSeat, plateThread);
  const cradleDrop = ramp(p, 0.42, 0.58, E().cubicOut);
  const pipeDrop = ramp(p, 0.6, 0.82, E().cubicOut);
  const to = env(p, 0.16, 0.92);
  const lbl = (x, y, num, text, o, anchor) => (
    <g opacity={o}>
      <circle cx={x} cy={y - 7} r="14" fill={th.accent} />
      <text x={x} y={y - 1} textAnchor="middle" fill="#fff" style={{ font: "700 17px 'Barlow Condensed', sans-serif" }}>{num}</text>
      <text x={anchor === "end" ? x - 26 : x + 26} y={y} textAnchor={anchor || "start"} fill={th.inkDim}
        style={{ font: "600 21px 'Barlow Condensed', sans-serif", letterSpacing: "2px" }}>{text}</text>
    </g>
  );
  return (
    <Frame th={th}>
      <g opacity={anchorIn} transform={`translate(0 ${(1 - anchorIn) * 40})`}>
        <BoltHead cx={cx} y={headY} th={th} />
        <ScrewAuger cx={cx} topY={shaftTop} bottomY={shaftBot} phase={0} />
      </g>
      {lbl(cx + 90, 540, "1", "SCREW ANCHOR — ONE PIECE, THREADED TO THE POINT", anchorIn * ramp(p, 0.1, 0.18))}
      <g opacity={plateIn}>
        <FinPlate cx={cx} cy={plateY} th={th} />
      </g>
      {lbl(cx + 130, plateY + 6, "2", "ADJUSTER PLATE — THREADS UP / DOWN TO SET HEIGHT", plateIn * ramp(p, 0.3, 0.4))}
      <g opacity={ramp(p, 0.42, 0.5)} transform={`translate(0 ${(1 - cradleDrop) * -120})`}>
        <Saddle cx={cx} seatY={seatY} th={th} pipeR={52} />
      </g>
      <g opacity={ramp(p, 0.6, 0.68)} transform={`translate(0 ${(1 - pipeDrop) * -260})`}>
        <PipeEnd cx={cx} cy={seatY} r={52} th={th} />
      </g>
      <g opacity={ramp(p, 0.6, 0.68)}>
        <Saddle cx={cx} seatY={seatY} th={th} pipeR={52} />
      </g>
      <g opacity={anchorIn}>
        <BoltHead cx={cx} y={headY} th={th} />
      </g>
      {lbl(cx - 130, seatY - 84, "3", "PIPE CRADLE — LOCKS ONTO THE BOLT HEAD", ramp(p, 0.52, 0.6), "end")}
      <g opacity={to}>
        <text x={640} y={648} textAnchor="middle" fill={th.ink}
          style={{ font: "800 74px 'Barlow Condensed', sans-serif", letterSpacing: "3px" }}>
          MEET <tspan fill={th.accent}>EZE-SET</tspan>
        </text>
        <text x={640} y={686} textAnchor="middle" fill={th.inkDim}
          style={{ font: "400 24px 'Barlow', sans-serif", letterSpacing: "1px" }}>The screw-in pipe anchor that just holds.</text>
      </g>
    </Frame>
  );
}

function Install({ progress }) {
  const th = useTheme();
  const p = progress;
  const cx = 640, gy = 430;
  // camera nudge in on the drive point
  const zoom = 1 + ramp(p, 0, 0.5, E().cubicInOut) * 0.12;
  // auger drives down + spins (thread scroll) during 0.15..0.7
  const drive = ramp(p, 0.12, 0.72, E().cubicInOut);
  const spins = 6;
  const phase = -drive * spins * (11 - 1); // scroll threads while driving
  const dy = (1 - drive) * -210;
  const to = env(p, 0.12, 0.9);
  const dust = ramp(p, 0.55, 0.75) * (1 - ramp(p, 0.85, 1));
  return (
    <Frame th={th}>
      <Ground y={gy} th={th} dark />
      <g transform={`translate(${cx} ${gy}) scale(${zoom}) translate(${-cx} ${-gy})`}>
        <g transform={`translate(0 ${dy})`}>
          <ScrewAuger cx={cx} topY={gy - 8} bottomY={gy + 190} phase={phase} />
          <FinPlate cx={cx} cy={gy - 8} th={th} scale={0.92} />
          <BoltHead cx={cx} y={gy - 30} th={th} />
        </g>
        {/* rotation arrows */}
        <g opacity={drive > 0.02 && drive < 0.98 ? 0.9 : 0} transform={`translate(${cx} ${gy - 150})`}>
          <path d="M -46 0 A 46 20 0 1 1 40 12" fill="none" stroke={th.accent} strokeWidth="5" strokeLinecap="round" />
          <polygon points="40,12 30,2 46,-2" fill={th.accent} />
        </g>
        {/* dust kick */}
        {dust > 0 && [0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={cx + (i - 2) * 26} cy={gy - 4 - (i % 2) * 8} r={8 + (i % 3) * 4}
            fill={th.ground} opacity={0.5 * dust} />
        ))}
      </g>
      <g opacity={to}>
        <Kicker x={110} y={130} text="STEP 01 — DRIVE" th={th} />
        <text x={110} y={196} fill={th.ink}
          style={{ font: "700 58px 'Barlow Condensed', sans-serif" }}>SCREW IT IN.</text>
        <text x={112} y={236} fill={th.inkDim}
          style={{ font: "400 24px 'Barlow', sans-serif" }}>No digging. No concrete. Anchors deep in seconds.</text>
      </g>
    </Frame>
  );
}

function Secure({ progress }) {
  const th = useTheme();
  const p = progress;
  const cx = 640, gy = 470, seatY = 356;
  const postTop = seatY + 74;
  // U stays edge-on (its opening faces up, plane perpendicular to the pipe —
  // the physically correct orientation); the pipe lowers straight into it
  const holderSX = 0.22;
  const nearArmId = "cr" + cx + "_" + seatY;
  const drop = ramp(p, 0.1, 0.5, E().cubicIn);
  const settle = ramp(p, 0.5, 0.62, E().cubicOut);
  const pipeCy = lerp(-120, seatY, drop);
  const bounce = settle > 0 && settle < 1 ? Math.sin(settle * Math.PI) * 6 : 0;
  const locked = ramp(p, 0.64, 0.8);
  const to = env(p, 0.12, 0.9);
  return (
    <Frame th={th}>
      <Ground y={gy} th={th} dark />
      <ScrewAuger cx={cx} topY={gy - 6} bottomY={gy + 170} phase={0} />
      <FinPlate cx={cx} cy={gy - 6} th={th} scale={0.92} />
      <Post cx={cx} topY={postTop} botY={gy - 6} th={th} />
      <BoltHead cx={cx} y={postTop} th={th} />
      <g opacity={ramp(p, 0.02, 0.12)}>
        <rect x={cx + 190} y={seatY - 100} width="330" height="34" rx="17" fill={th.panel} />
        <text x={cx + 355} y={seatY - 78} textAnchor="middle" fill={th.inkDim}
          style={{ font: "600 15px 'Barlow Condensed', sans-serif", letterSpacing: "1.5px" }}>INTERCHANGEABLE CRADLES · MULTIPLE PIPE SIZES</text>
      </g>
      {/* The U is edge-on, so one arm is nearer the viewer than the other and
          the pipe drops between them: draw the whole cradle, lay the pipe over
          it, then repeat the near half on top. Both copies are the same
          geometry, so where they overlap below the pipe there is no seam. */}
      <g transform={`translate(${cx} 0) scale(${holderSX} 1) translate(${-cx} 0)`}>
        <Saddle cx={cx} seatY={seatY} th={th} />
      </g>
      <g transform={`translate(0 ${bounce})`}>
        <Pipe cx={cx} cy={pipeCy} len={1180} r={50} th={th} label="WATER / SEWAGE" />
      </g>
      <defs>
        <clipPath id={nearArmId}>
          <rect x={cx} y="0" width="120" height="720" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${nearArmId})`}>
        <g transform={`translate(${cx} 0) scale(${holderSX} 1) translate(${-cx} 0)`}>
          <Saddle cx={cx} seatY={seatY} th={th} />
        </g>
      </g>
      {/* lock indicator */}
      <g opacity={locked} transform={`translate(${cx + 170} ${seatY})`}>
        <circle r="26" fill={th.accent} />
        <path d="M -11 0 L -3 9 L 12 -10" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g opacity={to}>
        <Kicker x={110} y={130} text="STEP 02 — SET" th={th} />
        <text x={110} y={196} fill={th.ink}
          style={{ font: "700 58px 'Barlow Condensed', sans-serif" }}>LOCKED IN. ZERO MOVEMENT.</text>
        <text x={112} y={236} fill={th.inkDim}
          style={{ font: "400 24px 'Barlow', sans-serif" }}>The cradle grips the pipe — no sag, no shift, no drift.</text>
      </g>
    </Frame>
  );
}

function Adjust({ progress }) {
  const th = useTheme();
  const p = progress;
  const cx = 640, gy = 470;
  // saddle threads up, raising the pipe toward the grade line, then settles
  const raise = ramp(p, 0.15, 0.55, E().cubicInOut) - ramp(p, 0.62, 0.82, E().cubicInOut) * 0.28;
  const seatY = lerp(388, 332, clamp01(raise));
  const postTop = seatY + 74;
  // unscrewing physics: one rigid screw — as it backs out, threads scroll
  // (rotation), the tip rises by the same distance, and the separate
  // adjuster plate stays resting on the ground
  const backOut = 388 - seatY;            // px the screw has risen
  const spin = backOut / 26;              // thread pitch = 26px per turn
  const augerBot = gy + 170 - backOut;
  const pipeCy = seatY;
  const gradeY = 284;
  const to = env(p, 0.12, 0.9);
  return (
    <Frame th={th}>
      <Ground y={gy} th={th} dark />
      {/* target grade line */}
      <g opacity={ramp(p, 0.1, 0.3) * (1 - ramp(p, 0.9, 1))}>
        <line x1="120" y1={gradeY} x2="1160" y2={gradeY} stroke={th.accent} strokeWidth="2" strokeDasharray="10 9" />
        <text x="1150" y={gradeY - 12} textAnchor="end" fill={th.accent}
          style={{ font: "700 18px 'Barlow Condensed', sans-serif", letterSpacing: "3px" }}>TARGET GRADE</text>
      </g>
      <ScrewAuger cx={cx} topY={gy - 6} bottomY={augerBot} phase={spin} />
      <FinPlate cx={cx} cy={gy - 6} th={th} scale={0.92} />
      <Post cx={cx} topY={postTop} botY={gy - 6} th={th} phase={spin} />
      <BoltHead cx={cx} y={postTop} th={th} />
      <PipeEnd cx={cx} cy={pipeCy} r={50} th={th} />
      <Saddle cx={cx} seatY={seatY} th={th} />
      {/* up/down adjust arrows on post */}
      <g opacity={ramp(p, 0.12, 0.32) * (1 - ramp(p, 0.85, 1))} transform={`translate(${cx + 120} ${(postTop + gy) / 2})`}>
        <polygon points="0,-30 -11,-10 11,-10" fill={th.accent} />
        <polygon points="0,30 -11,10 11,10" fill={th.accent} />
        <line x1="0" y1="-10" x2="0" y2="10" stroke={th.accent} strokeWidth="4" />
      </g>
      <g opacity={to}>
        <Kicker x={110} y={130} text="STEP 03 — DIAL IN" th={th} />
        <text x={110} y={196} fill={th.ink}
          style={{ font: "700 58px 'Barlow Condensed', sans-serif" }}>ADJUSTABLE HEIGHT.</text>
        <text x={112} y={236} fill={th.inkDim}
          style={{ font: "400 24px 'Barlow', sans-serif" }}>Thread the cradle up or down to hit exact grade.</text>
      </g>
    </Frame>
  );
}

function Benefits({ progress }) {
  const th = useTheme();
  const p = progress;
  const items = [
    { t: "SOFT & UNEVEN GROUND", s: "Anchors where others can't", icon: "terrain" },
    { t: "REUSABLE & REMOVABLE", s: "Back out and reset anytime", icon: "loop" },
    { t: "CORROSION-PROOF", s: "Built for buried, wet service", icon: "shield" },
  ];
  const to = env(p, 0.1, 0.9);
  return (
    <Frame th={th}>
      <g opacity={to}>
        <Kicker x={110} y={110} text="BUILT TO LAST" th={th} />
        <text x={110} y={172} fill={th.ink}
          style={{ font: "700 56px 'Barlow Condensed', sans-serif" }}>WHY IT WINS</text>
      </g>
      {items.map((it, i) => {
        const a = 0.18 + i * 0.16;
        const o = ramp(p, a, a + 0.16, E().cubicOut) * (1 - ramp(p, 0.9, 1));
        const dx = (1 - ramp(p, a, a + 0.2, E().cubicOut)) * -40;
        const y = 262 + i * 118;
        return (
          <g key={i} opacity={o} transform={`translate(${dx} 0)`}>
            <rect x="110" y={y - 46} width="1060" height="96" rx="10" fill={th.panel} />
            <rect x="110" y={y - 46} width="8" height="96" fill={th.accent} />
            <g transform={`translate(178 ${y})`}>{iconFor(it.icon, th)}</g>
            <text x="260" y={y - 6} fill={th.ink}
              style={{ font: "700 34px 'Barlow Condensed', sans-serif", letterSpacing: "1px" }}>{it.t}</text>
            <text x="260" y={y + 26} fill={th.inkDim}
              style={{ font: "400 22px 'Barlow', sans-serif" }}>{it.s}</text>
          </g>
        );
      })}
    </Frame>
  );
}

function iconFor(kind, th) {
  const c = th.accent;
  if (kind === "terrain")
    return <g><path d="M -30 22 L -8 -14 L 8 8 L 20 -10 L 32 22 Z" fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round" /></g>;
  if (kind === "loop")
    return <g><path d="M -26 -4 A 24 24 0 1 1 -18 16" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" /><polygon points="-26,-16 -14,-6 -30,4" fill={c} /></g>;
  return <g><path d="M 0 -28 L 26 -16 V 6 C 26 22 14 30 0 34 C -14 30 -26 22 -26 6 V -16 Z" fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round" /><path d="M -10 2 L -2 11 L 13 -8" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>;
}

function Endcard({ progress }) {
  const th = useTheme();
  const p = progress;
  const cx = 640;
  const rise = ramp(p, 0.05, 0.4, E().cubicOut);
  const to = Math.min(ramp(p, 0.05, 0.35), 1 - ramp(p, 0.92, 1));
  // mini assembly mark
  const seatY = 300;
  return (
    <Frame th={th}>
      <g opacity={to} transform={`translate(0 ${(1 - rise) * 24})`}>
        <g transform="translate(0 -30) scale(0.62) translate(388 60)">
          <ScrewAuger cx={cx} topY={452 - 6} bottomY={600} phase={0} />
          <FinPlate cx={cx} cy={452} th={th} />
          <Post cx={cx} topY={seatY + 74} botY={452} th={th} />
          <BoltHead cx={cx} y={seatY + 74} th={th} />
          <PipeEnd cx={cx} cy={seatY} r={46} th={th} />
          <Saddle cx={cx} seatY={seatY} th={th} pipeR={46} />
        </g>
        <text x={cx} y={508} textAnchor="middle" fill={th.ink}
          style={{ font: "800 92px 'Barlow Condensed', sans-serif", letterSpacing: "5px" }}>
          EZE-<tspan fill={th.accent}>SET</tspan>
        </text>
        <text x={cx} y={556} textAnchor="middle" fill={th.inkDim}
          style={{ font: "400 30px 'Barlow', sans-serif", letterSpacing: "2px" }}>{th.tagline}</text>
        <rect x={cx - 150} y={598} width="300" height="3" fill={th.accent} opacity="0.7" />
        <text x={cx} y={648} textAnchor="middle" fill={th.accent}
          style={{ font: "700 22px 'Barlow Condensed', sans-serif", letterSpacing: "4px" }}>{th.cta}</text>
      </g>
    </Frame>
  );
}

/* =========================================================
   APP  (theme + tweaks + stage)
   ========================================================= */
function buildTheme(t) {
  const accent = t.accent || "#FF6B1C";
  return {
    accent,
    bg: t.dark === false ? "#e9ebee" : "#15181c",
    ink: t.dark === false ? "#15181c" : "#f4f6f8",
    inkDim: t.dark === false ? "#5a626b" : "#9aa4ad",
    panel: t.dark === false ? "#dcdfe4" : "#20242a",
    ground: "#4b3a2b",
    groundDark: "#3a2c20",
    pipe: "#cfd4d9", pipeHi: "#f2f4f6", pipeLo: "#a7aeb6", pipeShadow: "#7d858e",
    white: "#f3f5f7", wHi: "#e2e6ea", wLo: "#b7bdc4",
    blk: "#23262b", blkHi: "#3a3f46",
    tagline: t.tagline || "Set it once. It holds.",
    cta: t.cta || "GET EZE-SET — YOURSITE.COM",
  };
}

function App() {
  const [t, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS);
  const th = buildTheme(t);
  const T = window;
  return (
    <React.Fragment>
      <Theme.Provider value={th}>
        <window.SceneStage width={1280} height={720}
          scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={th.bg}>
          {{ Problem, Reveal, Install, Secure, Adjust, Benefits, Endcard }}
        </window.SceneStage>
      </Theme.Provider>
      <window.TweaksPanel>
        <T.TweakSection label="Brand" />
        <T.TweakColor label="Accent" value={t.accent}
          options={["#FF6B1C", "#F5A623", "#2A6FDB", "#1F8A5B", "#E4372E"]}
          onChange={(v) => setTweak("accent", v)} />
        <T.TweakToggle label="Dark background" value={t.dark}
          onChange={(v) => setTweak("dark", v)} />
        <T.TweakSection label="Copy" />
        <T.TweakText label="Tagline" value={t.tagline}
          onChange={(v) => setTweak("tagline", v)} />
        <T.TweakText label="End-card CTA" value={t.cta}
          onChange={(v) => setTweak("cta", v)} />
        <T.TweakSection label="Editor" />
        <T.TweakToggle label="Motion editor" value={t.motionEditor}
          onChange={(v) => setTweak("motionEditor", v)} />
      </window.TweaksPanel>
    </React.Fragment>
  );
}
window.App = App;
