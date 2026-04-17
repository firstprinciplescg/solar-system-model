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
  { id: "sun", name: "The Sun", type: "star", au: 0, diam: 1392700, color: "#FDB813",
    desc: "Our star. 99.86% of the solar system's total mass. A medium-sized yellow dwarf that has burned for 4.6 billion years.",
    facts: [
      "The Sun converts about 600 million tons of hydrogen into helium every second through nuclear fusion.",
      "Its core temperature reaches 15 million °C — hot enough to sustain thermonuclear reactions for another 5 billion years.",
      "A photon generated in the Sun's core takes an average of 170,000 years to reach the surface, then just 8 minutes to reach Earth.",
    ]},
  { id: "parker", name: "Parker Solar Probe", type: "spacecraft", au: 0.046, diam: 0, color: "#FFA952",
    desc: "Launched August 12, 2018. The fastest object ever built by humans, and the first spacecraft to 'touch' the Sun — flying through its corona. At closest approach it's just 6.9 million km from the Sun's surface (0.046 AU), inside a region no probe had ever survived before.",
    facts: [
      "At perihelion, Parker travels at about 692,000 km/h — fast enough to go from New York to Tokyo in under a minute.",
      "Its 11.5 cm carbon-composite heat shield keeps the instruments at room temperature while its Sun-facing side endures temperatures over 1,400°C.",
      "Parker uses seven Venus gravity assists over its mission to progressively tighten its orbit, each flyby stealing a bit of Venus's momentum to bring Parker closer to the Sun.",
    ]},
  { id: "mercury", name: "Mercury", type: "planet", au: 0.387, diam: 4879, color: "#B5A7A7",
    desc: "Smallest planet. No atmosphere to speak of. Surface temperatures swing from −180°C to 430°C in the same day.",
    facts: [
      "Mercury's iron core makes up about 85% of its radius — proportionally the largest core of any planet in the solar system.",
      "Despite being closest to the Sun, it has ice deposits in permanently shadowed craters near its poles.",
      "A single solar day on Mercury lasts 176 Earth days — longer than its 88-day year.",
    ]},
  { id: "venus", name: "Venus", type: "planet", au: 0.723, diam: 12104, color: "#E8CDA0",
    desc: "Hottest planet, thanks to a runaway greenhouse effect. Its thick atmosphere rains sulfuric acid. It rotates backwards.",
    facts: [
      "Venus's surface pressure is 92 times Earth's — equivalent to being 900 meters underwater.",
      "Its clouds reflect so much sunlight that Venus is the brightest natural object in the night sky after the Moon.",
      "A day on Venus (243 Earth days) is longer than its year (225 Earth days). It's the only planet where this is true.",
    ]},
  { id: "earth", name: "Earth", type: "planet", au: 1.0, diam: 12742, color: "#5B9BD5",
    desc: "Home. The only confirmed harbor of life in the universe. One pixel wide at this scale.",
    facts: [
      "Earth is the densest planet in the solar system at 5.51 g/cm³, thanks to its heavy iron-nickel core.",
      "71% of Earth's surface is water, but all that water would form a sphere only 1,385 km across — barely visible at this scale.",
      "Earth's magnetic field extends 65,000 km into space, shielding the atmosphere from solar wind that would otherwise strip it away.",
    ]},
  { id: "jwst", name: "James Webb Space Telescope", labelShort: "JWST", type: "spacecraft", au: 1.01, diam: 0, color: "#E8B860",
    desc: "Launched December 25, 2021. Orbits the Sun-Earth L2 Lagrange point, about 1.5 million km beyond Earth — always on the night side, shielded from the Sun. The most powerful space telescope ever built, seeing infrared light from the first galaxies that ever formed.",
    facts: [
      "JWST's gold-coated mirror is 6.5 meters across, giving it nearly 7 times Hubble's light-collecting area. It was folded origami-style to fit inside its rocket and unfolded in space over two weeks.",
      "Its five-layer sunshield is the size of a tennis court. It reduces solar heat by a factor of a million, keeping the telescope at −233°C so it can detect the faintest infrared glows.",
      "JWST has observed galaxies that formed just 300 million years after the Big Bang — the most distant objects ever studied, their light stretched from visible to infrared by 13.5 billion years of cosmic expansion.",
    ]},
  { id: "mars", name: "Mars", type: "planet", au: 1.524, diam: 6779, color: "#C1440E",
    desc: "The Red Planet. Home to Olympus Mons, the tallest volcano in the solar system at 21.9 km high.",
    facts: [
      "Mars has the largest dust storms in the solar system — they can engulf the entire planet and last for months.",
      "Valles Marineris is a canyon system stretching 4,000 km long and 7 km deep. The Grand Canyon would be a side trench.",
      "Mars once had a magnetic field and liquid surface water. Evidence suggests it lost its atmosphere after its core cooled and the field collapsed.",
    ]},
  { id: "ceres", name: "Ceres", type: "dwarf", au: 2.77, diam: 939, color: "#8B8680",
    desc: "The largest object in the asteroid belt and the closest dwarf planet to the Sun. May have a subsurface ocean.",
    facts: [
      "Ceres contains about one-third of the total mass of the entire asteroid belt.",
      "NASA's Dawn spacecraft found bright salt deposits in Occator Crater — evidence of briny water reaching the surface as recently as a few million years ago.",
      "Ceres may have more fresh water than all of Earth's rivers, lakes, and aquifers combined, locked in a subsurface ocean.",
    ]},
  { id: "jupiter", name: "Jupiter", type: "planet", au: 5.203, diam: 139820, color: "#C88B3A",
    desc: "Largest planet. 11 Earths wide. Its Great Red Spot is a storm bigger than Earth that has raged for centuries.",
    facts: [
      "Jupiter's magnetic field is about 20 times stronger than Earth's at its cloud tops — and its total magnetic moment is 20,000 times larger, creating radiation belts that would deliver a fatal dose to an unshielded human in minutes.",
      "Its moon Europa almost certainly has a global saltwater ocean beneath its ice crust, making it one of the best candidates for extraterrestrial life.",
      "Jupiter acts as a cosmic shield — its gravity deflects or captures comets and asteroids that might otherwise hit the inner planets.",
    ]},
  { id: "saturn", name: "Saturn", type: "planet", au: 9.537, diam: 116460, color: "#E3D5A3",
    desc: "Its ring system spans 282,000 km but is only about 10 meters thick. The planet itself is less dense than water.",
    hasRings: true, ringSpan: 280000,
    facts: [
      "Saturn's rings are made of billions of chunks of ice and rock, ranging from dust grains to pieces the size of houses.",
      "Its moon Titan has a thick nitrogen atmosphere, liquid methane lakes, and rain — the only body besides Earth with stable surface liquids.",
      "Saturn's hexagonal storm at its north pole is 30,000 km across. Each side is longer than Earth's diameter. No one fully understands why it's hexagonal.",
    ]},
  { id: "uranus", name: "Uranus", type: "planet", au: 19.19, diam: 50724, color: "#7EC8E3",
    desc: "Tilted 98° on its axis. Its moons may harbor subsurface liquid water oceans containing the building blocks of life: water, carbon, nitrogen, and energy from tidal heating.",
    facts: [
      "Uranus was likely knocked on its side by a collision with an Earth-sized object early in the solar system's history.",
      "Its moon Miranda has a cliff face 20 km high — Verona Rupes — the tallest known cliff in the solar system.",
      "Uranus and Neptune may contain vast oceans of liquid diamond under extreme pressures, with solid diamond icebergs floating on top.",
    ]},
  { id: "neptune", name: "Neptune", type: "planet", au: 30.07, diam: 49244, color: "#3F54BA",
    desc: "Windiest planet, with gusts reaching 2,100 km/h. Its gravity sculpts the inner edge of the Kuiper Belt.",
    facts: [
      "Neptune radiates 2.6 times more energy than it receives from the Sun. The source of this internal heat is still not fully understood.",
      "Its moon Triton orbits backwards (retrograde) and is slowly spiraling inward — in about 3.6 billion years, it will be torn apart into a ring system.",
      "Neptune was the first planet found by mathematical prediction rather than observation, calculated by Urbain Le Verrier in 1846.",
    ]},
  { id: "pluto", name: "Pluto", type: "dwarf", au: 39.48, diam: 2377, color: "#D2B48C",
    desc: "Reclassified as a dwarf planet in 2006. Has a heart-shaped plain of nitrogen ice, five moons, and a thin atmosphere that freezes and collapses as it orbits further from the Sun.",
    facts: [
      "Pluto's heart-shaped region (Tombaugh Regio) is a plain of nitrogen ice that slowly flows like glaciers on Earth, renewing the surface.",
      "Pluto and its largest moon Charon are tidally locked to each other — the same faces always point at one another, like a cosmic slow dance.",
      "From Pluto's surface, the Sun would appear as an extremely bright star — about 1,000 times brighter than Earth's full moon, but just a point of light.",
    ]},
  { id: "haumea", name: "Haumea", type: "dwarf", au: 43.13, diam: 1560, color: "#E0D8CC",
    desc: "Egg-shaped. Spins so fast (3.9-hour day) it has stretched itself into an ellipsoid. One of the few objects beyond Neptune known to have rings.",
    facts: [
      "Haumea's surface is almost pure crystalline water ice — unusual at its distance, where radiation should have degraded the crystals long ago.",
      "It has two small moons, Hi'iaka and Namaka, named after the Hawaiian goddess Haumea's daughters.",
      "Haumea's ring was discovered during a stellar occultation in 2017 — making it the first known trans-Neptunian object with a ring system.",
    ]},
  { id: "pioneer11", name: "Pioneer 11", type: "spacecraft", au: 44, diam: 0, color: "#C0B0A0",
    desc: "Launched April 5, 1973. The first spacecraft to fly past Saturn. Last contact was September 30, 1995, when it was at roughly this distance — 44 AU. Its power source failed; it's still drifting outward in silence, now around 120 AU from the Sun.",
    facts: [
      "Pioneer 11 flew through Saturn's ring plane in 1979 — a risky scouting maneuver that proved the path was safe for the Voyagers to follow.",
      "It carries the Pioneer Plaque: a gold-anodized diagram meant for any extraterrestrials who might find it, showing a man, a woman, and Earth's location in the galaxy.",
      "Its trajectory is aimed toward the constellation Aquila. In about 4 million years it will pass near the star Lambda Aquilae — long after the plaque has been sandblasted unreadable by micrometeorites.",
    ]},
  { id: "makemake", name: "Makemake", type: "dwarf", au: 45.79, diam: 1430, color: "#D4A574",
    desc: "Second-brightest Kuiper Belt object after Pluto. Surface temperature around 30 K (−243°C). Has one known moon.",
    facts: [
      "Makemake was discovered in 2005, just after Easter, earning its preliminary nickname 'Easterbunny' before being officially named.",
      "Unlike Pluto, Makemake appears to have no significant atmosphere — a stellar occultation in 2011 showed no atmospheric signature.",
      "Its surface is covered in frozen methane and ethane, which give it a reddish-brown color similar to Pluto.",
    ]},
  { id: "new_horizons", name: "New Horizons", type: "spacecraft", au: 62, diam: 0, color: "#B0C8D8",
    desc: "Launched January 19, 2006. The fastest spacecraft ever sent from Earth. Flew past Pluto in July 2015 and the Kuiper Belt object Arrokoth in 2019. Still transmitting from here, studying the outer heliosphere.",
    facts: [
      "New Horizons covered the Earth-Moon distance in 9 hours. Apollo 11 took 3 days to cover the same ground.",
      "It's the only spacecraft to have visited Pluto and a Kuiper Belt object up close — and the Arrokoth encounter was the most distant close flyby in history.",
      "It will never catch the Voyagers. It launched faster, but the Voyagers got much stronger gravity-assist boosts from the giant planets. New Horizons should reach the heliopause in the 2040s.",
    ]},
  { id: "eris", name: "Eris", type: "dwarf", au: 67.78, diam: 2326, color: "#C8C8C8",
    desc: "Most massive known dwarf planet. Its discovery in 2005 directly triggered the debate that reclassified Pluto. Named after the Greek goddess of discord.",
    facts: [
      "Eris is 27% more massive than Pluto despite being roughly the same size — it's extraordinarily dense for an icy body.",
      "Its surface is one of the most reflective in the solar system, likely coated in a thin layer of frozen nitrogen that re-freezes from its atmosphere.",
      "At its farthest, Eris reaches 97.5 AU from the Sun. Its 559-year orbit takes it nearly to the edge of the scattered disc.",
    ]},
  { id: "pioneer10", name: "Pioneer 10", type: "spacecraft", au: 80, diam: 0, color: "#C0B0A0",
    desc: "Launched March 2, 1972. The first spacecraft to cross the asteroid belt and the first to fly past Jupiter. Last contact was January 23, 2003, when it was at roughly this distance — 80 AU from Earth. It's still out there, silent, now around 139 AU from the Sun.",
    facts: [
      "Pioneer 10 was the first human-made object ever placed on a trajectory to leave the solar system.",
      "It's heading toward the star Aldebaran in Taurus — a journey of about 2 million years.",
      "Like Pioneer 11, it carries a gold-anodized plaque — a message in pictures for any future finders who may never exist.",
    ]},
];

const REGIONS = [
  { id: "asteroid_belt", name: "Asteroid Belt", au1: 2.2, au2: 3.2, color: "#8B8680", desc: "Contains millions of rocky bodies, but total mass is less than 4% of our Moon. Mostly empty space." },
  { id: "kuiper_belt", name: "Kuiper Belt", au1: 30, au2: 55, color: "#6B7B8D", desc: "A vast ring of icy bodies 25 AU wide. Source of short-period comets. Contains hundreds of thousands of objects larger than 100 km." },
  { id: "heliosheath", name: "Heliosheath", au1: 94, au2: 123, color: "#FF8C42", desc: "Turbulent region where the solar wind piles up against the interstellar medium. Like a shockwave around a bullet, but cosmic." },
];

const BOUNDARIES = [
  { id: "term_shock", name: "Termination Shock", au: 94, color: "#FF6B6B",
    desc: "The solar wind abruptly drops from supersonic to subsonic speed. Voyager 1 crossed it in December 2004 at 94 AU.",
    facts: [
      "The termination shock is not a fixed boundary — it pulses in and out depending on solar activity, shifting by as much as 10 AU.",
      "When Voyager 1 crossed it, instruments detected a sudden 10-fold increase in the density of charged particles.",
      "The solar wind drops from about 400 km/s to under 100 km/s at this boundary — like a supersonic jet hitting a wall of air.",
    ]},
  { id: "heliopause", name: "Heliopause", au: 123, color: "#FF4444",
    desc: "The outermost edge of the Sun's influence. Beyond here, interstellar space begins. Voyager 1 crossed it on August 25, 2012.",
    facts: [
      "When Voyager 1 crossed the heliopause, its plasma wave instrument detected a 40-fold jump in plasma density — confirming it had entered interstellar space.",
      "The heliopause is not spherical. It's compressed on the side facing the direction the Sun moves through the galaxy and stretched into a long tail behind.",
      "Even beyond the heliopause, the Sun's gravity still dominates. True gravitational escape doesn't happen until the outer Oort Cloud, around 100,000 AU.",
    ]},
];

// Everything that has a position, sorted for crossing detection
const ALL_POSITIONED = [...BODIES, ...BOUNDARIES].sort((a, b) => a.au - b.au);

const VOID_TEXTS = [
  { au: 0.5, text: "A comet is passing through here this week.", sub: "C/2025 R3 (PanSTARRS) — naked-eye visible before dawn from the Northern Hemisphere, briefly, before the Sun's glare swallows it.", link: { url: "https://theskylive.com/c2025r3-info", label: "Find it in your sky →" } },
  { au: 1.3, text: "Your entire world was that single pixel.", sub: "Everyone you've ever known. Every ocean, mountain, city, and war." },
  { au: 2.5, text: "You're crossing the asteroid belt.", sub: "If you gathered every asteroid here, they'd mass less than 4% of our Moon." },
  { au: 3.8, text: "Light from the Sun takes 30 minutes to reach this far." },
  { au: 7.5, text: "The gap between Jupiter and Saturn could swallow the entire inner solar system." },
  { au: 12.5, text: "Voyager 2 passed through here in 1981 — the only spacecraft to visit all four giant planets." },
  { au: 16, text: "Before William Herschel in 1781, no one knew a planet existed this far out." },
  { au: 22, text: "Uranus's moons may harbor subsurface oceans.", sub: "Water, carbon, nitrogen, energy from tidal heating. The building blocks of life, hiding in this darkness." },
  { au: 28, text: "Light from the Sun takes over 3.5 hours to reach this distance." },
  { au: 35, text: "You've entered the Kuiper Belt.", sub: "A ring of hundreds of thousands of icy worlds orbiting in the deep cold." },
  { au: 41, text: "You've scrolled past Pluto's orbit in minutes.", sub: "New Horizons, the fastest spacecraft ever launched, took 9.5 years to cover this same distance." },
  { au: 70, text: "The space between objects grows. The silence deepens." },
  { au: 82, text: "Almost everything humanity has ever sent into space is behind you now." },
  { au: 100, text: "Light takes nearly 14 hours to travel this far from the Sun." },
  { au: 110, text: "You're in the heliosheath.", sub: "Solar wind piles up here, compressed against interstellar space." },
  { au: 118, text: "Voyager 1 crossed this edge in 2012.", sub: "It's now roughly 50 AU beyond here — the farthest human-made object, still broadcasting back at 22 watts." },
];

const PROJECTIONS = [
  { name: "Voyager 2", au: 143, note: "In interstellar space — launched 1977",
    facts: [
      "Voyager 2 crossed the heliopause on November 5, 2018 — six years after Voyager 1, and on a completely different trajectory, confirming the boundary is real.",
      "It's the only spacecraft ever to visit all four giant planets: Jupiter, Saturn, Uranus, and Neptune.",
      "It carries a Golden Record of Earth's sounds and images — a message for whoever might find it over the next billion years.",
    ]},
  { name: "Voyager 1", au: 173, note: "Farthest human-made object — launched 1977",
    facts: [
      "Voyager 1 became the first spacecraft to enter interstellar space when it crossed the heliopause on August 25, 2012.",
      "Its radio signal, traveling at the speed of light, takes over 23 hours to reach Earth.",
      "Its plutonium power source is expected to fail around 2030. After that, it will drift silently through the galaxy for billions of years.",
    ]},
  { name: "Sedna", au: 506, note: "Distant dwarf planet, 11,400-year orbit",
    facts: [
      "Sedna's orbit is one of the most extreme known — it ranges from 76 AU at its closest to 937 AU at its farthest.",
      "Its deep red color makes it one of the reddest objects in the solar system, likely due to hydrocarbon deposits from billions of years of radiation.",
      "Sedna takes 11,400 years to complete one orbit. The last time it was this close to the Sun, humans were painting caves in Europe.",
    ]},
  { name: "Inner Oort Cloud", au: 2000, note: "Source of Halley-type comets",
    facts: [
      "Also called the Hills Cloud, this disc-shaped region may contain trillions of icy bodies too faint to detect directly.",
      "Comets from this region take 200–10,000 years to orbit the Sun. Halley's Comet likely originated here.",
      "The inner Oort Cloud was probably formed from planetesimals ejected by Jupiter and Saturn during the early solar system.",
    ]},
  { name: "Outer Oort Cloud edge", au: 100000, note: "~1 trillion comets, edge of the Sun's gravity",
    facts: [
      "The Oort Cloud is a spherical shell of icy bodies so loosely bound that passing stars regularly perturb their orbits, sending some sunward as long-period comets.",
      "Despite containing perhaps a trillion objects, the total mass is estimated at only 5–100 Earth masses — spread across an unimaginable volume.",
      "At 100,000 AU, the Sun's gravity is so weak that the galactic tide — the Milky Way's own gravitational pull — shapes the orbits of objects here.",
    ]},
  { name: "Proxima Centauri", au: 268332, note: "Nearest star system — 4.24 light-years",
    facts: [
      "Proxima Centauri is a red dwarf so dim that despite being the nearest star, it's invisible to the naked eye.",
      "It has at least two confirmed exoplanets. Proxima b orbits in the habitable zone — but intense stellar flares may have stripped its atmosphere.",
      "At the speed of Voyager 1 (61,000 km/h), reaching Proxima Centauri would take about 73,000 years.",
    ]},
  { name: "Barnard's Star", au: 377098, note: "Second nearest — 5.96 light-years",
    facts: [
      "Barnard's Star has the fastest apparent motion of any star in Earth's sky, crossing the width of a full moon every 180 years.",
      "It's an ancient red dwarf, estimated at 10 billion years old — more than twice the age of our Sun.",
      "In 2024, astronomers finally confirmed a sub-Earth-mass planet (Barnard b) orbiting in just 3.15 days; by 2025, a full system of four tiny rocky worlds had been found. It's the nearest known multi-planet system.",
    ]},
  { name: "Epsilon Eridani", au: 662350, note: "Sun-like star with exoplanets — 10.5 light-years",
    facts: [
      "Epsilon Eridani is one of the most Sun-like nearby stars, making it a frequent target in searches for extraterrestrial intelligence (SETI).",
      "It has at least one confirmed planet and two asteroid/debris belts — a young solar system that may still be forming planets.",
      "At only 800 million years old, it offers a window into what our own solar system may have looked like in its youth.",
    ]},
  { name: "Galactic Center", au: 1.644e9, note: "Center of the Milky Way — 26,000 light-years",
    facts: [
      "At the center sits Sagittarius A*, a supermassive black hole 4 million times the mass of our Sun.",
      "The region is so dense with stars that if Earth orbited there, the night sky would glow with millions of stars brighter than Sirius.",
      "We can't see the galactic center in visible light — it's hidden behind thick clouds of interstellar dust. We observe it in radio, infrared, and X-rays.",
    ]},
  { name: "Andromeda Galaxy", au: 1.604e11, note: "Nearest large galaxy — 2.5 million light-years",
    facts: [
      "Andromeda contains roughly 1 trillion stars — about twice as many as the Milky Way.",
      "It's approaching us at 110 km/s. In about 4.5 billion years, the two galaxies will collide and merge into a single giant elliptical galaxy.",
      "The light you see from Andromeda left 2.5 million years ago, when early Homo habilis was just beginning to use stone tools on Earth.",
    ]},
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
  if (s < 86400 * 365.25 * 1000) { const y = s / (86400 * 365.25); return `${y < 10 ? y.toFixed(1) : Math.round(y).toLocaleString()} year${Math.round(y) !== 1 ? "s" : ""}`; }
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
  const isStar = obj.type === "star";
  const isSpacecraft = obj.type === "spacecraft";
  const truePx = obj.diam ? kmToPxDia(obj.diam) : 0;
  const isSubPixel = !isSpacecraft && truePx < 3 && !isStar;
  const displaySize = isSpacecraft ? 14 : (isStar ? Math.round(truePx) : Math.max(3, Math.round(truePx)));

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

      {/* Spacecraft marker: rotated square with pulsing ring */}
      {isSpacecraft ? (
        <div style={{ width: displaySize, height: displaySize, position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 8, height: 8,
            background: `${obj.color}`,
            border: `1px solid ${obj.color}`,
            boxShadow: isSelected
              ? `0 0 10px ${obj.color}cc, 0 0 20px ${obj.color}44`
              : `0 0 4px ${obj.color}66`,
            transition: "box-shadow 0.3s",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 18, height: 18, borderRadius: "50%",
            border: `1px solid ${obj.color}55`,
            animation: "pulse 3s ease-in-out infinite",
            pointerEvents: "none"
          }} />
        </div>
      ) : (
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
      )}

      {/* Label above */}
      <div style={{
        position: "absolute", bottom: displaySize / 2 + 88, left: "50%", transform: "translateX(-50%)",
        textAlign: "center", whiteSpace: "nowrap"
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: obj.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
          {obj.labelShort || obj.name}
        </div>
        <div style={{ fontSize: 11, color: "#ffffff55", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>
          {obj.au > 0 ? `${obj.au} AU` : "0 AU"}
        </div>
        {isSubPixel && (
          <div style={{ fontSize: 10, color: "#ffffff33", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
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
          <div style={{ fontSize: 10, color: "#ffffff44", fontFamily: "'JetBrains Mono', monospace" }}>
            reached in {formatTime(crossingTime)}
          </div>
          {prevCrossingTime != null && (crossingTime - prevCrossingTime) >= 1 && (
            <div style={{ fontSize: 10, color: "#ffffff2a", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
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

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000000aa", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", cursor: "pointer"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0a12f8", border: `1px solid ${obj.color}33`,
        borderRadius: 12, padding: "28px 32px", maxWidth: 460, width: "90%",
        boxShadow: `0 20px 60px #00000099, 0 0 40px ${obj.color}08`,
        cursor: "default", maxHeight: "85vh", overflowY: "auto"
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

        {obj.facts && obj.facts.length > 0 && (
          <div style={{ borderTop: "1px solid #ffffff0a", paddingTop: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {obj.facts.map((fact, i) => (
                <div key={i} style={{
                  fontSize: 12, color: "#ffffff88", lineHeight: 1.55,
                  fontFamily: "'Space Grotesk', sans-serif",
                  paddingLeft: 12, borderLeft: `2px solid ${obj.color}33`
                }}>
                  {fact}
                </div>
              ))}
            </div>
          </div>
        )}

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
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const isDraggingProgress = useRef(false);
  const startTimeRef = useRef(null);
  const crossingsRef = useRef(new Map());
  const rafRef = useRef(null);
  const lastAURef = useRef(0);
  const lastTimeUpdate = useRef(0);

  const [currentAU, setCurrentAU] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [expandedProjection, setExpandedProjection] = useState(null);
  const [, forceUpdate] = useState(0);

  // Animation loop
  useEffect(() => {
    const loop = () => {
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(loop); return; }

      const sx = el.scrollLeft;
      const au = Math.max(0, (sx - LEFT_PAD) / PX_PER_AU);
      const vw = el.clientWidth;

      // Update progress bar directly (bypasses React for smooth animation)
      if (progressRef.current) {
        progressRef.current.style.width = `${Math.min(100, (au / HELIOPAUSE_AU) * 100)}%`;
      }

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

  // Clamp scroll so end card centers in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const endCardCenter = auToPx(HELIOPAUSE_AU) + 800 + (END_CARD_WIDTH - 1200) / 2;
      const maxScroll = endCardCenter - el.clientWidth / 2;
      if (el.scrollLeft > maxScroll) {
        el.scrollLeft = maxScroll;
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Click/drag on progress bar to navigate
  useEffect(() => {
    const bar = progressBarRef.current;
    const el = containerRef.current;
    if (!bar || !el) return;

    const jumpToPosition = (clientX) => {
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const endCardCenter = auToPx(HELIOPAUSE_AU) + 800 + (END_CARD_WIDTH - 1200) / 2;
      const maxScroll = endCardCenter - el.clientWidth / 2;
      el.scrollLeft = fraction * maxScroll;
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      isDraggingProgress.current = true;
      jumpToPosition(e.clientX);
    };
    const onMouseMove = (e) => {
      if (!isDraggingProgress.current) return;
      e.preventDefault();
      jumpToPosition(e.clientX);
    };
    const onMouseUp = () => {
      isDraggingProgress.current = false;
    };

    bar.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      bar.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Close modal on Esc
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

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
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
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
          <div style={{ fontSize: 10, color: "#ffffff66", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>
            Earth = 1 pixel
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#ffffffcc", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
            {currentAU < 0.001 ? "0" : currentAU < 10 ? currentAU.toFixed(2) : currentAU < 100 ? currentAU.toFixed(1) : Math.round(currentAU)} <span style={{ fontSize: 11, color: "#ffffff77" }}>AU</span>
          </div>
          <div style={{ fontSize: 9, color: "#ffffff66", fontFamily: "'JetBrains Mono', monospace" }}>
            {(currentAU * AU_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {startTimeRef.current && (
            <div style={{ fontSize: 11, color: "#ffffff77", fontFamily: "'JetBrains Mono', monospace" }}>
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div ref={progressBarRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 6, zIndex: 51,
        background: "#ffffff0a", cursor: "pointer"
      }}>
        <div ref={progressRef} style={{
          height: "100%", background: `linear-gradient(90deg, #FDB813, #5B9BD5, #3F54BA)`,
          width: "0%", pointerEvents: "none",
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
              textAlign: "center", maxWidth: 520, padding: "0 20px"
            }}>
              <div style={{ fontSize: 24, color: "#ffffff66", lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>
                {vt.text}
              </div>
              {vt.sub && (
                <div style={{ fontSize: 16, color: "#ffffff44", lineHeight: 1.5, marginTop: 12 }}>
                  {vt.sub}
                </div>
              )}
              {vt.link && (
                <a
                  href={vt.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block", marginTop: 14,
                    fontSize: 14, color: "#FDB813cc",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: 1, textDecoration: "none",
                    borderBottom: "1px solid #FDB81344", paddingBottom: 2,
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FDB813"; e.currentTarget.style.borderBottomColor = "#FDB813"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#FDB813cc"; e.currentTarget.style.borderBottomColor = "#FDB81344"; }}
                >
                  {vt.link.label}
                </a>
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
                fontSize: 14, letterSpacing: 4, color: "#FF4444aa",
                fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                marginBottom: 14
              }}>
                Beyond the Heliopause
              </div>

              <h2 style={{
                fontSize: 32, fontWeight: 700, margin: "0 0 10px",
                color: "#ffffffdd", fontFamily: "'Space Grotesk', sans-serif"
              }}>
                You've left the Sun's domain.
              </h2>

              <p style={{ fontSize: 16, color: "#ffffff66", lineHeight: 1.6, margin: "0 0 28px" }}>
                Interstellar space begins here. Everything the Sun touches is behind you.
              </p>

              {endTime > 0 && (
                <>
                  <div style={{
                    background: "#ffffff06", borderRadius: 10, padding: "20px 24px",
                    border: "1px solid #ffffff0a", marginBottom: 24
                  }}>
                    <div style={{ fontSize: 12, letterSpacing: 2, color: "#ffffff44", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 12 }}>
                      Your journey
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 700, color: "#FDB813", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                      {formatTime(endTime)}
                    </div>
                    <div style={{ fontSize: 14, color: "#ffffff55" }}>
                      to scroll {HELIOPAUSE_AU} AU at an average of {(HELIOPAUSE_AU / endTime * 60).toFixed(1)} AU/min
                    </div>
                  </div>

                  <div style={{
                    fontSize: 13, letterSpacing: 2, color: "#ffffff44",
                    fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                    marginBottom: 16
                  }}>
                    At your pace, to continue scrolling to...
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {PROJECTIONS.map((p, i) => {
                      const t = projectTime(p.au);
                      const isExpanded = expandedProjection === i;
                      return (
                        <div key={i}>
                          <div
                            onClick={() => setExpandedProjection(isExpanded ? null : i)}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "baseline",
                              padding: "10px 16px",
                              background: i % 2 === 0 ? "#ffffff03" : "transparent",
                              borderRadius: isExpanded ? "6px 6px 0 0" : 6,
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff0a"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "#ffffff03" : "transparent"; }}
                          >
                            <div>
                              <div style={{ fontSize: 15, color: "#ffffffcc", fontWeight: 500 }}>
                                {p.name}
                                <span style={{ fontSize: 11, color: "#ffffff44", marginLeft: 8 }}>
                                  {isExpanded ? "▾" : "▸"}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: "#ffffff55", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>
                                {p.au.toLocaleString()} AU · {p.note}
                              </div>
                            </div>
                            <div style={{
                              fontSize: 16, fontWeight: 600, color: t > 86400 * 365.25 ? "#FF6B6B" : t > 86400 ? "#FF8C42" : "#FDB813",
                              fontFamily: "'JetBrains Mono', monospace",
                              whiteSpace: "nowrap", marginLeft: 16,
                              textAlign: "right"
                            }}>
                              {formatTime(t)}
                            </div>
                          </div>
                          {isExpanded && p.facts && (
                            <div style={{
                              padding: "12px 16px 14px",
                              background: "#ffffff06",
                              borderRadius: "0 0 6px 6px",
                              borderTop: "1px solid #ffffff0a",
                              display: "flex", flexDirection: "column", gap: 8,
                            }}>
                              {p.facts.map((fact, fi) => (
                                <div key={fi} style={{
                                  fontSize: 13, color: "#ffffff88", lineHeight: 1.5,
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  paddingLeft: 10, borderLeft: "2px solid #ffffff1a"
                                }}>
                                  {fact}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    marginTop: 24, padding: "14px 20px",
                    background: "#ffffff06", borderRadius: 8,
                    border: "1px solid #ffffff0a",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 13, color: "#ffffff55", lineHeight: 1.6 }}>
                      Want to revisit anything? Click or drag the progress bar at the top of the screen to jump to any point in the model.
                    </div>
                  </div>

                  <div style={{
                    marginTop: 32, padding: "24px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 26, color: "#ffffffaa", fontStyle: "italic", fontFamily: "'Space Grotesk', sans-serif" }}>
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
