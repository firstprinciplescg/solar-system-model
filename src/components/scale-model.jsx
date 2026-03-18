import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const EARTH_DIA_KM = 12742;
const AU_KM = 149597870.7;
const AU_MI = 92955807.3;
const PX_PER_AU = AU_KM / EARTH_DIA_KM; // ~11,741 px per AU
const LEFT_PAD = 600; // space for intro text before the Sun
const END_CARD_WIDTH = 5000;
const HELIOPAUSE_AU = 123;
const TOTAL_WIDTH = LEFT_PAD + Math.ceil(HELIOPAUSE_AU * PX_PER_AU) + END_CARD_WIDTH;

const auToPx = (au) => LEFT_PAD + Math.round(au * PX_PER_AU);
const kmToPxDia = (km) => km / EARTH_DIA_KM;

// ══════════════════════════════════════════════════════════
// SOLAR SYSTEM DATA
// ══════════════════════════════════════════════════════════
const BODIES = [
  { id: "sun", name: "The Sun", type: "star", au: 0, diam: 1392700, color: "#FDB813", desc: "Our star. 99.86% of the solar system's total mass. A medium-sized yellow dwarf that has burned for 4.6 billion years." },
  { id: "mercury", name: "Mercury", type: "planet", au: 0.387, diam: 4879, color: "#B5A7A7", desc: "Smallest planet. No atmosphere to speak of. Surface temperatures swing from −180°C to 430°C in the same day." },
  { id: "venus", name: "Venus", type: "planet", au: 0.723, diam: 12104, color: "#E8CDA0", desc: "Hottest planet, thanks to a runaway greenhouse effect. Its thick atmosphere rains sulfuric acid. It rotates backwards." },
  { id: "earth", name: "Earth", type: "planet", au: 1.0, diam: 12742, color: "#5B9BD5", desc: "Home. The only confirmed harbor of life in the universe. One pixel wide at this scale." },
  { id: "mars", name: "Mars", type: "planet", au: 1.524, diam: 6779, color: "#C1440E", desc: "The Red Planet. Home to Olympus Mons, the tallest volcano in the solar system at 21.9 km high." },
  { id: "ceres", name: "Ceres", type: "dwarf", au: 2.77, diam: 939, color: "#8B8680", desc: "The largest object in the asteroid belt and the closest dwarf planet to the Sun. May have a subsurface ocean." },
  { id: "jupiter", name: "Jupiter", type: "planet", au: 5.203, diam: 139820, color: "#C88B3A", desc: "Largest planet. 11 Earths wide. Its Great Red Spot is a storm bigger than Earth that has raged for centuries." },
  { id: "saturn", name: "Saturn", type: "planet", au: 9.537, diam: 116460, color: "#E3D5A3", desc: "Its ring system spans 282,000 km but is only about 10 meters thick. The planet itself is less dense than water.", hasRings: true, ringSpan: 280000 },
  { id: "uranus", name: "Uranus", type: "planet", au: 19.19, diam: 50724, color: "#7EC8E3", desc: "Tilted 98° on its axis. Its moons may harbor subsurface liquid water oceans containing the building blocks of life: water, carbon, nitrogen, and energy from tidal heating." },
  { id: "neptune", name: "Neptune", type: "planet", au: 30.07, diam: 49244, color: "#3F54BA", desc: "Windiest planet, with gusts reaching 2,100 km/h. Its gravity sculpts the inner edge of the Kuiper Belt." },
  { id: "pluto", name: "Pluto", type: "dwarf", au: 39.48, diam: 2377, color: "#D2B48C", desc: "Reclassified as a dwarf planet in 2006. Has a heart-shaped plain of nitrogen ice, five moons, and a thin atmosphere that freezes and collapses as it orbits further from the Sun." },
  { id: "haumea", name: "Haumea", type: "dwarf", au: 43.13, diam: 1560, color: "#E0D8CC", desc: "Egg-shaped. Spins so fast (3.9-hour day) it has stretched itself into an ellipsoid. One of the few objects beyond Neptune known to have rings." },
  { id: "makemake", name: "Makemake", type: "dwarf", au: 45.79, diam: 1430, color: "#D4A574", desc: "Second-brightest Kuiper Belt object after Pluto. Surface temperature around 30 K (−243°C). Has one known moon." },
  { id: "eris", name: "Eris", type: "dwarf", au: 67.78, diam: 2326, color: "#C8C8C8", desc: "Most massive known dwarf planet. Its discovery in 2005 directly triggered the debate that reclassified Pluto. Named after the Greek goddess of discord." },
];

const REGIONS = [
  { id: "asteroid_belt", name: "Asteroid Belt", au1: 2.2, au2: 3.2, color: "#8B8680", desc: "Contains millions of rocky bodies, but total mass is less than 4% of our Moon. Mostly empty space." },
  { id: "kuiper_belt", name: "Kuiper Belt", au1: 30, au2: 55, color: "#6B7B8D", desc: "A vast ring of icy bodies 25 AU wide. Source of short-period comets. Contains hundreds of thousands of objects larger than 100 km." },
  { id: "heliosheath", name: "Heliosheath", au1: 94, au2: 123, color: "#FF8C42", desc: "Turbulent region where the solar wind piles up against the interstellar medium. Like a shockwave around a bullet, but cosmic." },
];

const BOUNDARIES = [
  { id: "term_shock", name: "Termination Shock", au: 94, color: "#FF6B6B", desc: "The solar wind abruptly drops from supersonic to subsonic speed. Voyager 1 crossed it in December 2004 at 94 AU." },
  { id: "heliopause", name: "Heliopause", au: 123, color: "#FF4444", desc: "The outermost edge of the Sun's influence. Beyond here, interstellar space begins. Voyager 1 crossed it on August 25, 2012." },
];

// Everything that has a position, sorted for crossing detection
const ALL_POSITIONED = [...BODIES, ...BOUNDARIES].sort((a, b) => a.au - b.au);

const VOID_TEXTS = [
  { au: 1.3, text: "Your entire world was that single pixel.", sub: "Everyone you've ever known. Every ocean, mountain, city, and war." },
  { au: 2.5, text: "You're crossing the asteroid belt.", sub: "If you gathered every asteroid here, they'd mass less than 4% of our Moon." },
  { au: 3.8, text: "Light from the Sun takes 30 minutes to reach this far." },
  { au: 7.5, text: "The gap between Jupiter and Saturn could swallow the entire inner solar system." },
  { au: 12.5, text: "Voyager 2 took over 8 years to travel from Earth to Saturn." },
  { au: 16, text: "Before William Herschel in 1781, no one knew a planet existed this far out." },
  { au: 22, text: "Uranus's moons may harbor subsurface oceans.", sub: "Water, carbon, nitrogen, energy from tidal heating. The building blocks of life, hiding in this darkness." },
  { au: 28, text: "Light from the Sun takes over 3.5 hours to reach this distance." },
  { au: 35, text: "You've entered the Kuiper Belt.", sub: "A ring of hundreds of thousands of icy worlds orbiting in the deep cold." },
  { au: 42, text: "New Horizons launched in 2006 and took 9.5 years to reach Pluto.", sub: "It was the fastest spacecraft ever launched. You've scrolled past Pluto's orbit in minutes." },
  { au: 55, text: "Voyager 1 is roughly here now.", sub: "Launched September 5, 1977. Over 47 years of travel at 61,000 km/h." },
  { au: 70, text: "The space between objects grows. The silence deepens." },
  { au: 82, text: "Almost everything humanity has ever sent into space is behind you now." },
  { au: 100, text: "Light takes nearly 14 hours to travel this far from the Sun." },
  { au: 110, text: "You're in the heliosheath.", sub: "Solar wind piles up here, compressed against interstellar space." },
  { au: 118, text: "The edge of the Sun's domain is just ahead." },
];

const PROJECTIONS = [
  { name: "Sedna", au: 506, note: "Distant dwarf planet, 11,400-year orbit" },
  { name: "Inner Oort Cloud", au: 2000, note: "Source of Halley-type comets" },
  { name: "Outer Oort Cloud edge", au: 100000, note: "~1 trillion comets, edge of the Sun's gravity" },
  { name: "Proxima Centauri", au: 268332, note: "Nearest star system — 4.24 light-years" },
  { name: "Barnard's Star", au: 377098, note: "Second nearest — 5.96 light-years" },
  { name: "Epsilon Eridani", au: 662350, note: "Sun-like star with exoplanets — 10.5 light-years" },
  { name: "Galactic Center", au: 1.644e9, note: "Center of the Milky Way — 26,000 light-years" },
  { name: "Andromeda Galaxy", au: 1.604e11, note: "Nearest large galaxy — 2.5 million light-years" },
];

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
const formatTime = (s) => {
  if (s == null || isNaN(s)) return "—";
  if (s < 1) return "< 1 second";
  if (s < 60) return `${Math.round(s)} second${Math.round(s) !== 1 ? "s" : ""}`;
  if (s < 3600) { const m = s / 60; return `${m < 10 ? m.toFixed(1) : Math.round(m)} minute${Math.round(m) !== 1 ? "s" : ""}`; }
  if (s < 86400) { const h = s / 3600; return `${h < 10 ? h.toFixed(1) : Math.round(h)} hour${Math.round(h) !== 1 ? "s" : ""}`; }
  if (s < 86400 * 365.25) { const d = s / 86400; return `${d < 10 ? d.toFixed(1) : Math.round(d)} day${Math.round(d) !== 1 ? "s" : ""}`; }
  if (s < 86400 * 365.25 * 100) { const y = s / (86400 * 365.25); return `${y < 10 ? y.toFixed(1) : Math.round(y)} year${Math.round(y) !== 1 ? "s" : ""}`; }
  if (s < 86400 * 365.25 * 1e6) { const ky = s / (86400 * 365.25 * 1000); return `${ky < 10 ? ky.toFixed(1) : Math.round(ky).toLocaleString()} thousand years`; }
  if (s < 86400 * 365.25 * 1e9) { const my = s / (86400 * 365.25 * 1e6); return `${my < 10 ? my.toFixed(1) : Math.round(my).toLocaleString()} million years`; }
  const by = s / (86400 * 365.25 * 1e9);
  return `${by.toFixed(1)} billion years`;
};

const formatDist = (au) => {
  const km = au * AU_KM;
  const mi = au * AU_MI;
  const fmtN = (n) => n >= 1e9 ? (n / 1e9).toFixed(2) + " billion" : n >= 1e6 ? (n / 1e6).toFixed(2) + " million" : n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return { au: au.toLocaleString(undefined, { maximumFractionDigits: 3 }), km: fmtN(km), mi: fmtN(mi) };
};

// ══════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════

const ObjectMarker = ({ obj, onClick, crossingTime, prevCrossingTime, isSelected }) => {
  const x = auToPx(obj.au);
  const truePx = obj.diam ? kmToPxDia(obj.diam) : 0;
  const isSubPixel = truePx < 3 && obj.type !== "star";
  const displaySize = obj.type === "star" ? Math.round(truePx) : Math.max(3, Math.round(truePx));
  const isStar = obj.type === "star";

  return (
    <div style={{ position: "absolute", left: x, top: "50%", transform: "translate(-50%, -50%)", zIndex: 10, cursor: "pointer" }} onClick={onClick}>
      {/* Vertical guide line */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        width: 1, background: `${obj.color}18`,
        top: -80, height: 60,
      }} />
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        width: 1, background: `${obj.color}18`,
        bottom: -80, height: 60,
      }} />

      {/* The body */}
      <div style={{
        width: displaySize, height: displaySize, borderRadius: "50%",
        background: isStar
          ? `radial-gradient(circle at 38% 38%, #FFF8E1, #FDB813, #E89A00)`
          : `radial-gradient(circle at 35% 35%, ${obj.color}ee, ${obj.color}99, ${obj.color}55)`,
        boxShadow: isStar
          ? `0 0 60px #FDB81366, 0 0 120px #FDB81322, 0 0 200px #FDB81311`
          : isSelected
            ? `0 0 12px ${obj.color}88, 0 0 24px ${obj.color}33`
            : `0 0 6px ${obj.color}22`,
        position: "relative",
        transition: "box-shadow 0.3s",
      }}>
        {/* Saturn rings */}
        {obj.hasRings && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotateX(70deg)",
            width: kmToPxDia(obj.ringSpan), height: kmToPxDia(obj.ringSpan) * 0.15,
            borderRadius: "50%",
            border: `1px solid ${obj.color}66`,
            boxShadow: `inset 0 0 3px ${obj.color}33`,
            pointerEvents: "none"
          }} />
        )}
        {/* Sub-pixel indicator ring */}
        {isSubPixel && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 12, height: 12, borderRadius: "50%",
            border: `1px solid ${obj.color}44`,
            animation: "pulse 3s ease-in-out infinite",
            pointerEvents: "none"
          }} />
        )}
      </div>

      {/* Label above */}
      <div style={{
        position: "absolute", bottom: displaySize / 2 + 88, left: "50%", transform: "translateX(-50%)",
        textAlign: "center", whiteSpace: "nowrap"
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: obj.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
          {obj.name}
        </div>
        <div style={{ fontSize: 9, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          {obj.au > 0 ? `${obj.au} AU` : "0 AU"}
        </div>
        {isSubPixel && (
          <div style={{ fontSize: 8, color: "#ffffff1a", fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
            {truePx < 1 ? "sub-pixel" : `${truePx.toFixed(1)}px true`}
          </div>
        )}
      </div>

      {/* Crossing time below */}
      {crossingTime != null && (
        <div style={{
          position: "absolute", top: displaySize / 2 + 88, left: "50%", transform: "translateX(-50%)",
          textAlign: "center", whiteSpace: "nowrap"
        }}>
          <div style={{ fontSize: 8, color: "#ffffff22", fontFamily: "'JetBrains Mono', monospace" }}>
            reached in {formatTime(crossingTime)}
          </div>
          {prevCrossingTime != null && (
            <div style={{ fontSize: 8, color: "#ffffff15", fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
              {formatTime(crossingTime - prevCrossingTime)} from prev
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoModal = ({ obj, crossingTime, prevCrossingTime, startTime, onClose }) => {
  if (!obj) return null;
  const dist = formatDist(obj.au);
  const truePx = obj.diam ? kmToPxDia(obj.diam) : null;
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : null;
  const speed = elapsed && elapsed > 0 ? (HELIOPAUSE_AU * PX_PER_AU) / elapsed : null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000aa", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", cursor: "pointer"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0a12f8", border: `1px solid ${obj.color}33`,
        borderRadius: 12, padding: "28px 32px", maxWidth: 420, width: "90%",
        boxShadow: `0 20px 60px #00000099, 0 0 40px ${obj.color}08`,
        cursor: "default"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: obj.color, fontFamily: "'Space Grotesk', sans-serif" }}>
            {obj.name}
          </h2>
          <span style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: 2,
            color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace",
            padding: "3px 8px", border: "1px solid #ffffff15", borderRadius: 4
          }}>
            {obj.type}
          </span>
        </div>

        <p style={{ fontSize: 13, color: "#ffffffbb", lineHeight: 1.65, margin: "12px 0 16px", fontFamily: "'Space Grotesk', sans-serif" }}>
          {obj.desc}
        </p>

        <div style={{ borderTop: "1px solid #ffffff0a", paddingTop: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#ffffff25", textTransform: "uppercase", letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            Distance from the Sun
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ffffffaa", lineHeight: 1.8 }}>
            <div><span style={{ color: "#ffffff44" }}>AU:</span> {dist.au}</div>
            <div><span style={{ color: "#ffffff44" }}>km:</span> {dist.km}</div>
            <div><span style={{ color: "#ffffff44" }}>mi:</span> {dist.mi}</div>
          </div>
        </div>

        {obj.diam > 0 && (
          <div style={{ borderTop: "1px solid #ffffff0a", paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#ffffff25", textTransform: "uppercase", letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
              Size
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ffffffaa", lineHeight: 1.8 }}>
              <div><span style={{ color: "#ffffff44" }}>Diameter:</span> {obj.diam.toLocaleString()} km / {Math.round(obj.diam * 0.621371).toLocaleString()} mi</div>
              <div><span style={{ color: "#ffffff44" }}>At this scale:</span> {truePx >= 1 ? `${truePx.toFixed(1)} pixels` : `${truePx.toFixed(3)} pixels (sub-pixel)`}</div>
            </div>
          </div>
        )}

        {crossingTime != null && (
          <div style={{ borderTop: "1px solid #ffffff0a", paddingTop: 14, marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: "#ffffff25", textTransform: "uppercase", letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
              Your scroll journey
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ffffffaa", lineHeight: 1.8 }}>
              <div><span style={{ color: "#ffffff44" }}>From the Sun:</span> {formatTime(crossingTime)}</div>
              {prevCrossingTime != null && (
                <div><span style={{ color: "#ffffff44" }}>From previous object:</span> {formatTime(crossingTime - prevCrossingTime)}</div>
              )}
            </div>
          </div>
        )}

        <button onClick={onClose} style={{
          marginTop: 16, width: "100%", padding: "10px",
          background: "#ffffff08", border: "1px solid #ffffff15",
          borderRadius: 6, color: "#ffffff55", fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
          letterSpacing: 1
        }}>
          CLOSE
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
export default function SolarSystemScale() {
  const containerRef = useRef(null);
  const startTimeRef = useRef(null);
  const crossingsRef = useRef(new Map());
  const rafRef = useRef(null);
  const lastAURef = useRef(0);
  const lastTimeUpdate = useRef(0);

  const [currentAU, setCurrentAU] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [, forceUpdate] = useState(0);

  // Animation loop
  useEffect(() => {
    const loop = () => {
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(loop); return; }

      const sx = el.scrollLeft;
      const au = Math.max(0, (sx - LEFT_PAD) / PX_PER_AU);
      const vw = el.clientWidth;

      // Start timer on first meaningful scroll
      if (sx > 10 && !startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      // Throttled AU update
      if (Math.abs(au - lastAURef.current) > 0.005) {
        lastAURef.current = au;
        setCurrentAU(au);
      }

      // Throttled time update (1/sec)
      const now = Date.now();
      if (startTimeRef.current && now - lastTimeUpdate.current > 500) {
        lastTimeUpdate.current = now;
        setElapsedTime((now - startTimeRef.current) / 1000);
      }

      // Check object crossings
      const centerX = sx + vw / 2;
      for (const obj of ALL_POSITIONED) {
        const objX = auToPx(obj.au);
        if (centerX >= objX && !crossingsRef.current.has(obj.id) && startTimeRef.current) {
          crossingsRef.current.set(obj.id, (now - startTimeRef.current) / 1000);
          forceUpdate(n => n + 1);
        }
      }

      // End detection
      if (sx + vw >= TOTAL_WIDTH - END_CARD_WIDTH + 200 && startTimeRef.current) {
        setReachedEnd(true);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Convert vertical mouse wheel to horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const getCrossing = (id) => crossingsRef.current.get(id) ?? null;
  const getPrevCrossing = (id) => {
    const idx = ALL_POSITIONED.findIndex(o => o.id === id);
    if (idx <= 0) return null;
    return crossingsRef.current.get(ALL_POSITIONED[idx - 1].id) ?? null;
  };

  const selectedObj = selectedId ? [...BODIES, ...BOUNDARIES].find(o => o.id === selectedId) : null;

  // Projection calculation
  const endTime = crossingsRef.current.get("heliopause") || elapsedTime;
  const avgSpeed = endTime > 0 ? (HELIOPAUSE_AU * PX_PER_AU) / endTime : 400; // px/sec, fallback to 400
  const projectTime = (targetAU) => {
    const px = targetAU * PX_PER_AU;
    return px / avgSpeed;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.7;transform:translate(-50%,-50%) scale(1.3)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{height:4px} ::-webkit-scrollbar-track{background:#000} ::-webkit-scrollbar-thumb{background:#ffffff12;border-radius:2px}
      `}</style>

      {/* ── Fixed star background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 7.3 + i * i * 0.1) % 100}%`,
            top: `${(i * 11.7 + i * i * 0.07) % 100}%`,
            width: i % 7 === 0 ? 1.5 : 1,
            height: i % 7 === 0 ? 1.5 : 1,
            borderRadius: "50%",
            background: `rgba(255,255,255,${0.03 + (i % 13) * 0.015})`,
          }} />
        ))}
      </div>

      {/* ── HUD ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "linear-gradient(180deg, #000000ee 0%, #000000cc 70%, transparent 100%)",
        padding: "10px 24px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        pointerEvents: "none"
      }}>
        <div style={{ pointerEvents: "auto" }}>
          <div style={{ fontSize: 10, color: "#ffffff20", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>
            Earth = 1 pixel
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#ffffffcc", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
            {currentAU < 0.001 ? "0" : currentAU < 10 ? currentAU.toFixed(2) : currentAU < 100 ? currentAU.toFixed(1) : Math.round(currentAU)} <span style={{ fontSize: 11, color: "#ffffff44" }}>AU</span>
          </div>
          <div style={{ fontSize: 9, color: "#ffffff22", fontFamily: "'JetBrains Mono', monospace" }}>
            {(currentAU * AU_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {startTimeRef.current && (
            <div style={{ fontSize: 11, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace" }}>
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 51, background: "#ffffff06" }}>
        <div style={{
          height: "100%", background: `linear-gradient(90deg, #FDB813, #5B9BD5, #3F54BA)`,
          width: `${Math.min(100, (currentAU / HELIOPAUSE_AU) * 100)}%`,
          transition: "width 0.3s"
        }} />
      </div>

      {/* ── Main scroll container ── */}
      <div
        ref={containerRef}
        style={{
          width: "100%", height: "100%",
          overflowX: "auto", overflowY: "hidden",
          position: "relative", zIndex: 1
        }}
      >
        <div style={{ width: TOTAL_WIDTH, height: "100%", position: "relative" }}>

          {/* Intro text */}
          <div style={{
            position: "absolute", left: 40, top: "50%", transform: "translateY(-50%)",
            width: LEFT_PAD - 120, textAlign: "right", paddingRight: 40
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffffdd", lineHeight: 1.3, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
              Earth is 1 pixel.
            </div>
            <div style={{ fontSize: 13, color: "#ffffff44", lineHeight: 1.6, marginBottom: 20 }}>
              Every distance in this model is real.<br />
              Every gap is the actual emptiness of space.
            </div>
            <div style={{ fontSize: 11, color: "#ffffff22", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
              scroll →
            </div>
          </div>

          {/* Center axis line */}
          <div style={{
            position: "absolute", left: LEFT_PAD, right: END_CARD_WIDTH,
            top: "50%", height: 1,
            background: "linear-gradient(90deg, #FDB81322, #ffffff08 5%, #ffffff04 50%, #ffffff02)",
            transform: "translateY(-50%)"
          }} />

          {/* Regions */}
          {REGIONS.map(r => (
            <div key={r.id} style={{
              position: "absolute",
              left: auToPx(r.au1), width: auToPx(r.au2) - auToPx(r.au1),
              top: "40%", height: "20%",
              background: `linear-gradient(90deg, ${r.color}08, ${r.color}05, ${r.color}08)`,
              borderTop: `1px solid ${r.color}12`,
              borderBottom: `1px solid ${r.color}12`,
            }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 9, color: `${r.color}33`, letterSpacing: 3,
                fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                whiteSpace: "nowrap"
              }}>
                {r.name}
              </div>
            </div>
          ))}

          {/* Boundaries */}
          {BOUNDARIES.map(b => (
            <div key={b.id}
              onClick={() => setSelectedId(b.id)}
              style={{
                position: "absolute", left: auToPx(b.au), top: "20%", height: "60%",
                borderLeft: `1px dashed ${b.color}44`, cursor: "pointer", zIndex: 8,
                paddingLeft: 8
              }}
            >
              <div style={{ fontSize: 9, color: b.color, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", opacity: 0.6 }}>
                {b.name}
              </div>
              <div style={{ fontSize: 8, color: "#ffffff22", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {b.au} AU
              </div>
              {getCrossing(b.id) != null && (
                <div style={{ fontSize: 8, color: "#ffffff18", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                  reached in {formatTime(getCrossing(b.id))}
                </div>
              )}
            </div>
          ))}

          {/* Bodies */}
          {BODIES.map(obj => (
            <ObjectMarker
              key={obj.id}
              obj={obj}
              onClick={() => setSelectedId(obj.id)}
              crossingTime={getCrossing(obj.id)}
              prevCrossingTime={getPrevCrossing(obj.id)}
              isSelected={selectedId === obj.id}
            />
          ))}

          {/* Void texts */}
          {VOID_TEXTS.map((vt, i) => (
            <div key={i} style={{
              position: "absolute", left: auToPx(vt.au), top: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center", maxWidth: 360, padding: "0 20px"
            }}>
              <div style={{ fontSize: 14, color: "#ffffff1a", lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>
                {vt.text}
              </div>
              {vt.sub && (
                <div style={{ fontSize: 11, color: "#ffffff0e", lineHeight: 1.5, marginTop: 8 }}>
                  {vt.sub}
                </div>
              )}
            </div>
          ))}

          {/* ════════ END CARD ════════ */}
          <div style={{
            position: "absolute",
            left: auToPx(HELIOPAUSE_AU) + 800,
            top: 0, bottom: 0,
            width: END_CARD_WIDTH - 1200,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              maxWidth: 560, width: "100%", padding: "40px",
              animation: reachedEnd ? "fadeIn 1s ease" : "none",
              opacity: reachedEnd ? 1 : 0.15
            }}>
              <div style={{
                fontSize: 11, letterSpacing: 4, color: "#FF444488",
                fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                marginBottom: 12
              }}>
                Beyond the Heliopause
              </div>

              <h2 style={{
                fontSize: 26, fontWeight: 700, margin: "0 0 8px",
                color: "#ffffffdd", fontFamily: "'Space Grotesk', sans-serif"
              }}>
                You've left the Sun's domain.
              </h2>

              <p style={{ fontSize: 13, color: "#ffffff55", lineHeight: 1.6, margin: "0 0 28px" }}>
                Interstellar space begins here. Everything the Sun touches is behind you.
              </p>

              {endTime > 0 && (
                <>
                  <div style={{
                    background: "#ffffff06", borderRadius: 10, padding: "20px 24px",
                    border: "1px solid #ffffff0a", marginBottom: 24
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 12 }}>
                      Your journey
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#FDB813", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                      {formatTime(endTime)}
                    </div>
                    <div style={{ fontSize: 11, color: "#ffffff44" }}>
                      to scroll {HELIOPAUSE_AU} AU at an average of {(HELIOPAUSE_AU / endTime * 60).toFixed(1)} AU/min
                    </div>
                  </div>

                  <div style={{
                    fontSize: 10, letterSpacing: 2, color: "#ffffff25",
                    fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                    marginBottom: 16
                  }}>
                    At your pace, to continue scrolling to...
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {PROJECTIONS.map((p, i) => {
                      const t = projectTime(p.au);
                      return (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "baseline",
                          padding: "10px 16px",
                          background: i % 2 === 0 ? "#ffffff03" : "transparent",
                          borderRadius: 6
                        }}>
                          <div>
                            <div style={{ fontSize: 12, color: "#ffffffbb", fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: 9, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                              {p.au.toLocaleString()} AU · {p.note}
                            </div>
                          </div>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: t > 86400 * 365.25 ? "#FF6B6B" : t > 86400 ? "#FF8C42" : "#FDB813",
                            fontFamily: "'JetBrains Mono', monospace",
                            whiteSpace: "nowrap", marginLeft: 16,
                            textAlign: "right"
                          }}>
                            {formatTime(t)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    marginTop: 32, padding: "20px 24px",
                    background: "#ffffff04", borderRadius: 10,
                    border: "1px solid #ffffff08",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 13, color: "#ffffff66", lineHeight: 1.6 }}>
                      You scrolled for {formatTime(endTime)} and crossed {HELIOPAUSE_AU} AU.
                    </div>
                    <div style={{ fontSize: 13, color: "#ffffff44", lineHeight: 1.6, marginTop: 8 }}>
                      Reaching the Andromeda Galaxy at this speed would take{" "}
                      <span style={{ color: "#FF6B6B", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatTime(projectTime(1.604e11))}
                      </span>.
                    </div>
                    <div style={{ fontSize: 11, color: "#ffffff22", marginTop: 16, fontStyle: "italic" }}>
                      Space is big. Really big.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Info modal */}
      {selectedObj && (
        <InfoModal
          obj={selectedObj}
          crossingTime={getCrossing(selectedObj.id)}
          prevCrossingTime={getPrevCrossing(selectedObj.id)}
          startTime={startTimeRef.current}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
