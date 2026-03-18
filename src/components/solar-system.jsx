import { useState, useRef, useEffect, useCallback } from "react";

const AU_TO_KM = 149597870.7;
const AU_TO_MI = 92955807.3;

const OBJECTS = [
  { id: "sun", name: "The Sun", type: "star", au: 0, diameter_km: 1392700, color: "#FDB813", description: "Our star. Contains 99.86% of the solar system's mass.", glow: "#FDB81366" },
  { id: "mercury", name: "Mercury", type: "planet", au: 0.387, diameter_km: 4879, color: "#B5A7A7", description: "Smallest planet. Surface temperatures swing from -180°C to 430°C." },
  { id: "venus", name: "Venus", type: "planet", au: 0.723, diameter_km: 12104, color: "#E8CDA0", description: "Hottest planet due to runaway greenhouse effect. Rotates backwards." },
  { id: "earth", name: "Earth", type: "planet", au: 1.0, diameter_km: 12742, color: "#4B9CD3", description: "The only known world with liquid surface water and confirmed life.", glow: "#4B9CD322" },
  { id: "mars", name: "Mars", type: "planet", au: 1.524, diameter_km: 6779, color: "#C1440E", description: "The Red Planet. Home to Olympus Mons, the tallest volcano in the solar system." },
  { id: "asteroid_belt", name: "Asteroid Belt", type: "region", au: 2.7, au_start: 2.2, au_end: 3.2, diameter_km: 0, color: "#8B8680", description: "A torus of rocky debris between Mars and Jupiter. Contains dwarf planet Ceres." },
  { id: "jupiter", name: "Jupiter", type: "planet", au: 5.203, diameter_km: 139820, color: "#C88B3A", description: "Largest planet. Its Great Red Spot is a storm larger than Earth.", glow: "#C88B3A22" },
  { id: "saturn", name: "Saturn", type: "planet", au: 9.537, diameter_km: 116460, color: "#E3D5A3", description: "Famous for its ring system. Less dense than water." },
  { id: "uranus", name: "Uranus", type: "planet", au: 19.19, diameter_km: 50724, color: "#7EC8E3", description: "Tilted 98° on its axis. Moons may harbor subsurface oceans with life's building blocks.", glow: "#7EC8E322" },
  { id: "neptune", name: "Neptune", type: "planet", au: 30.07, diameter_km: 49244, color: "#3F54BA", description: "Windiest planet with gusts up to 2,100 km/h. Gatekeeper to the Kuiper Belt." },
  { id: "pluto", name: "Pluto", type: "dwarf", au: 39.48, diameter_km: 2377, color: "#D2B48C", description: "Dwarf planet with a heart-shaped nitrogen ice plain. Has 5 moons." },
  { id: "haumea", name: "Haumea", type: "dwarf", au: 43.13, diameter_km: 1560, color: "#E0D8CC", description: "Egg-shaped dwarf planet. Fastest rotation of any known large body (3.9 hours). Has rings." },
  { id: "makemake", name: "Makemake", type: "dwarf", au: 45.79, diameter_km: 1430, color: "#D4A574", description: "Second-brightest Kuiper Belt object. Extremely cold surface (~30 K)." },
  { id: "kuiper_belt", name: "Kuiper Belt", type: "region", au: 40, au_start: 30, au_end: 55, diameter_km: 0, color: "#6B7B8D", description: "A vast ring of icy bodies beyond Neptune. Source of short-period comets. Contains hundreds of thousands of objects." },
  { id: "eris", name: "Eris", type: "dwarf", au: 67.78, diameter_km: 2326, color: "#C8C8C8", description: "Most massive known dwarf planet. Its discovery triggered Pluto's reclassification." },
  { id: "termination_shock", name: "Termination Shock", type: "boundary", au: 94, diameter_km: 0, color: "#FF6B6B", description: "Where solar wind abruptly slows from supersonic to subsonic speed. Voyager 1 crossed it in 2004." },
  { id: "heliosheath", name: "Heliosheath", type: "region", au: 110, au_start: 94, au_end: 123, diameter_km: 0, color: "#FF8C42", description: "Turbulent region between the termination shock and heliopause where solar wind piles up." },
  { id: "heliopause", name: "Heliopause", type: "boundary", au: 123, diameter_km: 0, color: "#FF4444", description: "The boundary where solar wind meets interstellar medium. Voyager 1 crossed it in 2012 at 121.6 AU. The edge of the Sun's influence." },
  { id: "sedna", name: "Sedna", type: "dwarf", au: 506, diameter_km: 995, color: "#CC4444", description: "Extremely distant object with a 11,400-year orbit. One of the reddest objects in the solar system." },
  { id: "bow_shock", name: "Bow Shock (est.)", type: "boundary", au: 230, diameter_km: 0, color: "#FF2222", description: "Estimated region where interstellar wind first encounters the heliosphere. Existence debated." },
  { id: "inner_oort", name: "Inner Oort Cloud", type: "region", au: 2000, au_start: 2000, au_end: 20000, diameter_km: 0, color: "#4A5568", description: "Also called the Hills Cloud. A disc-shaped inner region of the Oort Cloud. Source of Halley-type comets." },
  { id: "outer_oort", name: "Outer Oort Cloud", type: "region", au: 50000, au_start: 20000, au_end: 100000, diameter_km: 0, color: "#2D3748", description: "Spherical shell of icy bodies at the edge of the Sun's gravitational influence. Trillions of comets. Extends nearly halfway to the nearest star." },
];

const formatNumber = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return n.toLocaleString();
  return n.toFixed(2);
};

const DistancePanel = ({ obj }) => {
  const km = obj.au * AU_TO_KM;
  const mi = obj.au * AU_TO_MI;
  return (
    <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
      <div>{obj.au.toLocaleString(undefined, { maximumFractionDigits: 3 })} AU</div>
      <div>{formatNumber(km)} km</div>
      <div>{formatNumber(mi)} mi</div>
    </div>
  );
};

const LogScaleView = () => {
  const scrollRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const TOTAL_WIDTH = 12000;

  const auToX = (au) => {
    if (au <= 0) return 80;
    const minLog = Math.log10(0.1);
    const maxLog = Math.log10(120000);
    const logPos = Math.log10(au);
    const fraction = (logPos - minLog) / (maxLog - minLog);
    return 80 + fraction * (TOTAL_WIDTH - 200);
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollProgress(scrollLeft / (scrollWidth - clientWidth));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => { if (el) el.removeEventListener("scroll", handleScroll); };
  }, [handleScroll]);

  const sortedObjects = [...OBJECTS].sort((a, b) => a.au - b.au);

  const auMarkers = [0.1, 0.5, 1, 5, 10, 30, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "#1a1a2e", zIndex: 10
      }}>
        <div style={{
          height: "100%", background: "linear-gradient(90deg, #FDB813, #4B9CD3, #3F54BA, #6B7B8D)",
          width: `${scrollProgress * 100}%`, transition: "width 0.1s"
        }} />
      </div>

      <div
        ref={scrollRef}
        style={{
          overflowX: "auto", overflowY: "hidden", height: "100%",
          cursor: "grab", WebkitOverflowScrolling: "touch"
        }}
      >
        <div style={{ width: TOTAL_WIDTH, height: "100%", position: "relative", paddingTop: 40 }}>
          {/* AU grid lines */}
          {auMarkers.map(au => {
            const x = auToX(au);
            return (
              <div key={`grid-${au}`} style={{
                position: "absolute", left: x, top: 30, bottom: 0,
                borderLeft: "1px solid #ffffff08", zIndex: 0
              }}>
                <span style={{
                  position: "absolute", top: 0, left: 4,
                  fontSize: 9, color: "#ffffff30", fontFamily: "'DM Mono', monospace",
                  whiteSpace: "nowrap"
                }}>
                  {au >= 1000 ? `${(au/1000)}k` : au} AU
                </span>
              </div>
            );
          })}

          {/* Main axis line */}
          <div style={{
            position: "absolute", left: 60, right: 60, top: "50%",
            height: 1, background: "linear-gradient(90deg, #FDB81344, #ffffff11, #ffffff05)",
            transform: "translateY(-50%)"
          }} />

          {/* Regions */}
          {sortedObjects.filter(o => o.type === "region").map(obj => {
            const x1 = auToX(obj.au_start);
            const x2 = auToX(obj.au_end);
            return (
              <div key={obj.id} onClick={() => setSelected(selected === obj.id ? null : obj.id)} style={{
                position: "absolute", left: x1, width: x2 - x1,
                top: "38%", height: "24%",
                background: `linear-gradient(90deg, ${obj.color}15, ${obj.color}08)`,
                borderTop: `1px solid ${obj.color}30`,
                borderBottom: `1px solid ${obj.color}30`,
                cursor: "pointer", borderRadius: 4
              }}>
                <span style={{
                  position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                  fontSize: 10, color: obj.color, whiteSpace: "nowrap",
                  fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase"
                }}>
                  {obj.name}
                </span>
                {selected === obj.id && (
                  <div style={{
                    position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)",
                    background: "#0d0d1aee", border: `1px solid ${obj.color}44`,
                    borderRadius: 8, padding: "12px 16px", width: 260, zIndex: 20,
                    backdropFilter: "blur(10px)"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: obj.color, marginBottom: 6 }}>{obj.name}</div>
                    <div style={{ fontSize: 11, color: "#ffffffaa", lineHeight: 1.5, marginBottom: 8 }}>{obj.description}</div>
                    <div style={{ fontSize: 10, color: "#ffffff55", fontFamily: "'DM Mono', monospace" }}>
                      {obj.au_start}–{obj.au_end.toLocaleString()} AU
                      <br />{formatNumber(obj.au_start * AU_TO_KM)}–{formatNumber(obj.au_end * AU_TO_KM)} km
                      <br />{formatNumber(obj.au_start * AU_TO_MI)}–{formatNumber(obj.au_end * AU_TO_MI)} mi
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Boundaries */}
          {sortedObjects.filter(o => o.type === "boundary").map(obj => {
            const x = auToX(obj.au);
            return (
              <div key={obj.id} onClick={() => setSelected(selected === obj.id ? null : obj.id)} style={{
                position: "absolute", left: x, top: "25%", height: "50%",
                borderLeft: `2px dashed ${obj.color}66`, cursor: "pointer", zIndex: 5
              }}>
                <span style={{
                  position: "absolute", bottom: "105%", left: 6, whiteSpace: "nowrap",
                  fontSize: 10, color: obj.color, fontFamily: "'Space Mono', monospace",
                  transform: "rotate(-25deg)", transformOrigin: "bottom left"
                }}>
                  {obj.name}
                </span>
                {selected === obj.id && (
                  <div style={{
                    position: "absolute", top: "110%", left: 0,
                    background: "#0d0d1aee", border: `1px solid ${obj.color}44`,
                    borderRadius: 8, padding: "12px 16px", width: 260, zIndex: 20,
                    backdropFilter: "blur(10px)"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: obj.color, marginBottom: 6 }}>{obj.name}</div>
                    <div style={{ fontSize: 11, color: "#ffffffaa", lineHeight: 1.5, marginBottom: 8 }}>{obj.description}</div>
                    <DistancePanel obj={obj} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Celestial bodies */}
          {sortedObjects.filter(o => ["star", "planet", "dwarf"].includes(o.type)).map((obj, i) => {
            const x = auToX(obj.au);
            const isAbove = i % 2 === 0;
            const baseSize = obj.type === "star" ? 28 : obj.type === "planet" ? Math.max(10, Math.min(22, obj.diameter_km / 8000)) : 7;

            return (
              <div key={obj.id} style={{ position: "absolute", left: x, top: "50%", transform: "translate(-50%, -50%)", zIndex: 8 }}>
                {/* Connector line */}
                <div style={{
                  position: "absolute", left: "50%", width: 1,
                  background: `${obj.color}33`,
                  ...(isAbove
                    ? { bottom: baseSize / 2 + 4, height: 50 + (obj.type === "dwarf" ? 15 : 0) }
                    : { top: baseSize / 2 + 4, height: 50 + (obj.type === "dwarf" ? 15 : 0) })
                }} />

                {/* Body */}
                <div
                  onClick={() => setSelected(selected === obj.id ? null : obj.id)}
                  style={{
                    width: baseSize, height: baseSize, borderRadius: "50%",
                    background: obj.type === "star"
                      ? `radial-gradient(circle at 35% 35%, #FFF5D4, ${obj.color}, #E8960A)`
                      : `radial-gradient(circle at 35% 35%, ${obj.color}dd, ${obj.color}88, ${obj.color}44)`,
                    boxShadow: obj.glow ? `0 0 ${baseSize}px ${obj.glow}, 0 0 ${baseSize * 2}px ${obj.glow}` : `0 0 6px ${obj.color}33`,
                    cursor: "pointer", position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    border: selected === obj.id ? `2px solid ${obj.color}` : "none"
                  }}
                  onMouseEnter={e => { e.target.style.transform = "scale(1.3)"; }}
                  onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                />

                {/* Label */}
                <div style={{
                  position: "absolute", left: "50%", transform: "translateX(-50%)",
                  textAlign: "center", whiteSpace: "nowrap",
                  ...(isAbove ? { bottom: baseSize / 2 + 58 } : { top: baseSize / 2 + 58 })
                }}>
                  <div style={{
                    fontSize: obj.type === "dwarf" ? 10 : 11,
                    fontWeight: 600, color: obj.color,
                    fontFamily: "'Space Mono', monospace"
                  }}>
                    {obj.name}
                  </div>
                  <div style={{ fontSize: 9, color: "#ffffff44", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                    {obj.au > 0 ? `${obj.au} AU` : "0 AU"}
                  </div>
                </div>

                {/* Info panel */}
                {selected === obj.id && (
                  <div style={{
                    position: "absolute",
                    ...(isAbove ? { bottom: baseSize / 2 + 100 } : { top: baseSize / 2 + 85 }),
                    left: "50%", transform: "translateX(-50%)",
                    background: "#0a0a18f0", border: `1px solid ${obj.color}44`,
                    borderRadius: 10, padding: "14px 18px", width: 280, zIndex: 30,
                    backdropFilter: "blur(12px)",
                    boxShadow: `0 8px 32px #00000088, 0 0 20px ${obj.color}11`
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: obj.color, marginBottom: 4 }}>{obj.name}</div>
                    <div style={{
                      fontSize: 9, textTransform: "uppercase", letterSpacing: 2,
                      color: "#ffffff44", marginBottom: 8,
                      fontFamily: "'Space Mono', monospace"
                    }}>
                      {obj.type}
                    </div>
                    <div style={{ fontSize: 11, color: "#ffffffbb", lineHeight: 1.6, marginBottom: 10 }}>
                      {obj.description}
                    </div>
                    {obj.diameter_km > 0 && (
                      <div style={{ fontSize: 10, color: "#ffffff55", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
                        Diameter: {obj.diameter_km.toLocaleString()} km / {Math.round(obj.diameter_km * 0.621371).toLocaleString()} mi
                      </div>
                    )}
                    <DistancePanel obj={obj} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Scale note */}
          <div style={{
            position: "absolute", bottom: 12, left: 80,
            fontSize: 10, color: "#ffffff25", fontFamily: "'DM Mono', monospace",
            fontStyle: "italic"
          }}>
            Logarithmic distance scale — scroll right to explore →
          </div>
        </div>
      </div>
    </div>
  );
};


const SizeComparisonView = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showDwarfs, setShowDwarfs] = useState(true);

  const sizeObjects = OBJECTS.filter(o => o.diameter_km > 0).sort((a, b) => b.diameter_km - a.diameter_km);

  const sunDiameter = 1392700;
  const jupiterDiameter = 139820;

  const renderGroup = (objects, maxRefDiameter, maxPx, label, note) => {
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: 3,
          color: "#ffffff33", fontFamily: "'Space Mono', monospace",
          marginBottom: 6
        }}>
          {label}
        </div>
        {note && (
          <div style={{ fontSize: 10, color: "#ffffff22", marginBottom: 16, fontStyle: "italic", fontFamily: "'DM Mono', monospace" }}>
            {note}
          </div>
        )}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 24,
          flexWrap: "wrap", justifyContent: "center",
          padding: "20px 0"
        }}>
          {objects.map(obj => {
            const size = Math.max(4, (obj.diameter_km / maxRefDiameter) * maxPx);
            const isHovered = hoveredId === obj.id;
            return (
              <div
                key={obj.id}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: "pointer", transition: "transform 0.2s",
                  transform: isHovered ? "scale(1.05)" : "scale(1)"
                }}
                onMouseEnter={() => setHoveredId(obj.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{
                  width: size, height: size, borderRadius: "50%", marginBottom: 10,
                  background: obj.id === "sun"
                    ? `radial-gradient(circle at 35% 35%, #FFF5D4, ${obj.color}, #E8960A)`
                    : `radial-gradient(circle at 30% 30%, ${obj.color}ee, ${obj.color}88, ${obj.color}44)`,
                  boxShadow: isHovered
                    ? `0 0 ${size * 0.5}px ${obj.color}66, 0 0 ${size}px ${obj.color}22`
                    : `0 0 ${size * 0.2}px ${obj.color}22`,
                  transition: "box-shadow 0.3s",
                  minWidth: 4, minHeight: 4
                }} />
                <div style={{
                  fontSize: 10, fontWeight: 600, color: isHovered ? obj.color : "#ffffff88",
                  textAlign: "center", fontFamily: "'Space Mono', monospace",
                  transition: "color 0.2s", whiteSpace: "nowrap"
                }}>
                  {obj.name}
                </div>
                <div style={{
                  fontSize: 9, color: "#ffffff33", textAlign: "center",
                  fontFamily: "'DM Mono', monospace", marginTop: 2
                }}>
                  {obj.au} AU
                </div>
                {isHovered && (
                  <div style={{
                    marginTop: 8, background: "#0a0a18ee", border: `1px solid ${obj.color}33`,
                    borderRadius: 8, padding: "10px 14px", width: 200,
                    backdropFilter: "blur(10px)", textAlign: "left"
                  }}>
                    <div style={{ fontSize: 10, color: "#ffffffaa", lineHeight: 1.5, marginBottom: 6 }}>
                      {obj.description}
                    </div>
                    <div style={{ fontSize: 9, color: "#ffffff44", fontFamily: "'DM Mono', monospace" }}>
                      ⌀ {obj.diameter_km.toLocaleString()} km
                      <br />⌀ {Math.round(obj.diameter_km * 0.621371).toLocaleString()} mi
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const planets = sizeObjects.filter(o => o.type === "planet");
  const dwarfs = sizeObjects.filter(o => o.type === "dwarf");
  const sun = sizeObjects.filter(o => o.type === "star");

  return (
    <div style={{ padding: "30px 40px", overflowY: "auto", height: "100%" }}>
      <div style={{
        textAlign: "center", marginBottom: 30,
        fontSize: 11, color: "#ffffff22", fontFamily: "'DM Mono', monospace"
      }}>
        Hover over any object for details. Sizes are proportional within each group.
      </div>

      {/* Sun vs Jupiter comparison */}
      {renderGroup(
        [...sun, ...planets.slice(0, 1)],
        sunDiameter, 220,
        "The Sun vs Jupiter",
        "Jupiter is the largest planet but still just 1/10th the Sun's diameter"
      )}

      <div style={{ borderTop: "1px solid #ffffff08", margin: "10px 0 30px" }} />

      {/* All planets */}
      {renderGroup(
        planets,
        jupiterDiameter, 160,
        "The Planets — Relative Sizes",
        "Scaled to Jupiter. Earth is barely 1/11th the diameter of Jupiter."
      )}

      <div style={{ borderTop: "1px solid #ffffff08", margin: "10px 0 30px" }} />

      {/* Dwarf planets + Earth for reference */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: 3,
          color: "#ffffff33", fontFamily: "'Space Mono', monospace"
        }}>
          Dwarf Planets vs Earth
        </div>
        <button
          onClick={() => setShowDwarfs(!showDwarfs)}
          style={{
            background: showDwarfs ? "#ffffff11" : "#ffffff06",
            border: "1px solid #ffffff22", borderRadius: 4,
            color: "#ffffff66", fontSize: 9, padding: "3px 10px",
            cursor: "pointer", fontFamily: "'Space Mono', monospace"
          }}
        >
          {showDwarfs ? "HIDE" : "SHOW"}
        </button>
      </div>
      {showDwarfs && (
        <div style={{
          fontSize: 10, color: "#ffffff22", marginBottom: 16,
          fontStyle: "italic", fontFamily: "'DM Mono', monospace"
        }}>
          Earth shown for scale. The largest dwarf planet (Eris) is roughly 1/5th Earth's diameter.
        </div>
      )}
      {showDwarfs && renderGroup(
        [sizeObjects.find(o => o.id === "earth"), ...dwarfs],
        12742, 120,
        "",
        null
      )}

      {/* Fun facts */}
      <div style={{
        borderTop: "1px solid #ffffff08", marginTop: 20, paddingTop: 24
      }}>
        <div style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: 3,
          color: "#ffffff22", fontFamily: "'Space Mono', monospace",
          marginBottom: 16
        }}>
          Scale Context
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14
        }}>
          {[
            { stat: "1,300", label: "Earths could fit inside Jupiter by volume" },
            { stat: "1,300,000", label: "Earths could fit inside the Sun by volume" },
            { stat: "4.24 ly", label: "Distance to nearest star (Proxima Centauri) — about 268,000 AU" },
            { stat: "~1 trillion", label: "Estimated comets in the Oort Cloud" },
            { stat: "17 hrs", label: "Light travel time from the Sun to the Oort Cloud's inner edge" },
            { stat: "1.6 years", label: "Light travel time from the Sun to the Oort Cloud's outer edge" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#ffffff04", borderRadius: 8, padding: "14px 16px",
              border: "1px solid #ffffff08"
            }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: "#FDB813",
                fontFamily: "'Space Mono', monospace", marginBottom: 4
              }}>
                {item.stat}
              </div>
              <div style={{ fontSize: 10, color: "#ffffff55", lineHeight: 1.4 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default function SolarSystemExplorer() {
  const [activeTab, setActiveTab] = useState("distance");

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#08080f",
      color: "#ffffff", fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "18px 28px 0", flexShrink: 0,
        borderBottom: "1px solid #ffffff0a"
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 800, margin: 0,
            fontFamily: "'Outfit', sans-serif",
            background: "linear-gradient(135deg, #FDB813, #4B9CD3, #7EC8E3)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -0.5
          }}>
            Solar System Scale Explorer
          </h1>
          <span style={{
            fontSize: 10, color: "#ffffff25",
            fontFamily: "'DM Mono', monospace", letterSpacing: 1
          }}>
            FROM THE SUN TO THE OORT CLOUD
          </span>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {[
            { id: "distance", label: "Distance Model", sub: "Logarithmic scale — scroll to explore" },
            { id: "size", label: "Size Comparison", sub: "Relative object sizes" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "#ffffff0a" : "transparent",
                border: "none", borderBottom: activeTab === tab.id ? "2px solid #FDB813" : "2px solid transparent",
                color: activeTab === tab.id ? "#ffffffcc" : "#ffffff44",
                padding: "10px 20px 10px", cursor: "pointer",
                borderRadius: "6px 6px 0 0", transition: "all 0.2s",
                textAlign: "left"
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", letterSpacing: 0.3
              }}>
                {tab.label}
              </div>
              <div style={{
                fontSize: 9, color: activeTab === tab.id ? "#ffffff33" : "#ffffff1a",
                fontFamily: "'DM Mono', monospace", marginTop: 2
              }}>
                {tab.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Star field background */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
          background: "radial-gradient(ellipse at 10% 50%, #0d0d2208, transparent 60%)"
        }}>
          {Array.from({ length: 120 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              borderRadius: "50%",
              background: `rgba(255,255,255,${Math.random() * 0.25 + 0.03})`,
              animation: `twinkle ${3 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }} />
          ))}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          ::-webkit-scrollbar { height: 6px; width: 6px; }
          ::-webkit-scrollbar-track { background: #08080f; }
          ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #ffffff25; }
          * { box-sizing: border-box; }
        `}</style>

        {activeTab === "distance" ? <LogScaleView /> : <SizeComparisonView />}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 28px", borderTop: "1px solid #ffffff08",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0
      }}>
        <div style={{ fontSize: 9, color: "#ffffff18", fontFamily: "'DM Mono', monospace" }}>
          1 AU = 149,597,870.7 km = 92,955,807.3 miles
        </div>
        <div style={{ fontSize: 9, color: "#ffffff18", fontFamily: "'DM Mono', monospace" }}>
          {activeTab === "distance" ? "Click objects for details · Scroll horizontally to explore" : "Hover objects for details"}
        </div>
      </div>
    </div>
  );
}
