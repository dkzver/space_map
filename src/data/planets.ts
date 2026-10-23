// Orbital elements from NASA JPL (J2000 epoch)
// Reference: https://ssd.jpl.nasa.gov/planets/approx_pos.html

export interface OrbitalElements {
  a: number;   // semi-major axis (AU)
  e: number;   // eccentricity
  i: number;   // inclination (degrees)
  L: number;   // mean longitude (degrees)
  wBar: number; // longitude of perihelion (degrees)
  Omega: number; // longitude of ascending node (degrees)
  // Rates per century
  aRate: number;
  eRate: number;
  iRate: number;
  LRate: number;
  wBarRate: number;
  OmegaRate: number;
}

export interface PlanetData {
  name: string;
  nameRu: string;
  type: 'star' | 'planet' | 'dwarf';
  radius: number; // km
  color: string;
  orbitalElements: OrbitalElements;
  description: string;
  mass: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  texture?: string;
  ringColor?: string;
  hasRings?: boolean;
}

// NASA JPL approximate orbital elements for J2000 + rates per century
export const planets: PlanetData[] = [
  {
    name: 'Sun',
    nameRu: 'Солнце',
    type: 'star',
    radius: 696340,
    color: '#FDB813',
    description: 'Звезда в центре Солнечной системы',
    mass: '1.989 × 10³⁰ кг',
    distanceFromSun: '0 км',
    orbitalPeriod: '-',
    orbitalElements: {
      a: 0, e: 0, i: 0, L: 0, wBar: 0, Omega: 0,
      aRate: 0, eRate: 0, iRate: 0, LRate: 0, wBarRate: 0, OmegaRate: 0
    }
  },
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    type: 'planet',
    radius: 2439.7,
    color: '#B5B5B5',
    description: 'Ближайшая к Солнцу планета',
    mass: '3.285 × 10²³ кг',
    distanceFromSun: '57.9 млн км',
    orbitalPeriod: '88 дней',
    orbitalElements: {
      a: 0.38709927, e: 0.20563593, i: 7.00497902,
      L: 252.25032350, wBar: 77.45779628, Omega: 48.33076593,
      aRate: 0.00000037, eRate: 0.00001906, iRate: -0.00594749,
      LRate: 149472.67411175, wBarRate: 0.16047689, OmegaRate: -0.12534081
    }
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    type: 'planet',
    radius: 6051.8,
    color: '#E8CDA0',
    description: 'Вторая планета от Солнца, самая горячая',
    mass: '4.867 × 10²⁴ кг',
    distanceFromSun: '108.2 млн км',
    orbitalPeriod: '225 дней',
    orbitalElements: {
      a: 0.72333566, e: 0.00677672, i: 3.39467605,
      L: 181.97909950, wBar: 131.60246718, Omega: 76.67984255,
      aRate: 0.00000390, eRate: -0.00004107, iRate: -0.00078890,
      LRate: 58517.81538729, wBarRate: 0.00268329, OmegaRate: -0.27769418
    }
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    type: 'planet',
    radius: 6371,
    color: '#6B93D6',
    description: 'Третья планета от Солнца, наш дом',
    mass: '5.972 × 10²⁴ кг',
    distanceFromSun: '149.6 млн км',
    orbitalPeriod: '365.25 дней',
    orbitalElements: {
      a: 1.00000261, e: 0.01671123, i: -0.00001531,
      L: 100.46457166, wBar: 102.93768193, Omega: 0.0,
      aRate: 0.00000562, eRate: -0.00004392, iRate: -0.01294668,
      LRate: 35999.37244981, wBarRate: 0.32327364, OmegaRate: 0.0
    }
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    type: 'planet',
    radius: 3389.5,
    color: '#C1440E',
    description: 'Четвёртая планета от Солнца, красная планета',
    mass: '6.39 × 10²³ кг',
    distanceFromSun: '227.9 млн км',
    orbitalPeriod: '687 дней',
    orbitalElements: {
      a: 1.52371034, e: 0.09339410, i: 1.84969142,
      L: -4.55343205, wBar: -23.94362959, Omega: 49.55953891,
      aRate: 0.00001847, eRate: 0.00007882, iRate: -0.00813131,
      LRate: 19140.30268499, wBarRate: 0.44441088, OmegaRate: -0.29257343
    }
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    type: 'planet',
    radius: 69911,
    color: '#C88B3A',
    description: 'Пятая планета, крупнейший газовый гигант',
    mass: '1.898 × 10²⁷ кг',
    distanceFromSun: '778.5 млн км',
    orbitalPeriod: '11.86 лет',
    orbitalElements: {
      a: 5.20288700, e: 0.04838624, i: 1.30439695,
      L: 34.39644051, wBar: 14.72847983, Omega: 100.47390909,
      aRate: -0.00011607, eRate: -0.00013253, iRate: -0.00183714,
      LRate: 3034.74612775, wBarRate: 0.21252668, OmegaRate: 0.20469106
    }
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    type: 'planet',
    radius: 58232,
    color: '#E8D191',
    description: 'Шестая планета, известна своими кольцами',
    mass: '5.683 × 10²⁶ кг',
    distanceFromSun: '1.434 млрд км',
    orbitalPeriod: '29.46 лет',
    hasRings: true,
    ringColor: '#C8B078',
    orbitalElements: {
      a: 9.53667594, e: 0.05386179, i: 2.48599187,
      L: 49.95424423, wBar: 92.59887831, Omega: 113.66242448,
      aRate: -0.00125060, eRate: -0.00050991, iRate: 0.00193609,
      LRate: 1222.49362201, wBarRate: -0.41897216, OmegaRate: -0.28867794
    }
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    type: 'planet',
    radius: 25362,
    color: '#AFDBF5',
    description: 'Седьмая планета, ледяной гигант',
    mass: '8.681 × 10²⁵ кг',
    distanceFromSun: '2.871 млрд км',
    orbitalPeriod: '84.01 лет',
    orbitalElements: {
      a: 19.18916464, e: 0.04725744, i: 0.77263783,
      L: 313.23810451, wBar: 170.95427630, Omega: 74.01692503,
      aRate: -0.00196176, eRate: -0.00004397, iRate: -0.00242939,
      LRate: 428.48202785, wBarRate: 0.40805281, OmegaRate: 1.05631810
    }
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    type: 'planet',
    radius: 24622,
    color: '#5B5DDF',
    description: 'Восьмая планета, самая далёкая',
    mass: '1.024 × 10²⁶ кг',
    distanceFromSun: '4.495 млрд км',
    orbitalPeriod: '164.8 лет',
    orbitalElements: {
      a: 30.06992276, e: 0.00859048, i: 1.77004347,
      L: -55.12002969, wBar: 44.96476227, Omega: 131.78422574,
      aRate: 0.00026291, eRate: 0.00005105, iRate: 0.00035372,
      LRate: 218.45945325, wBarRate: -0.32241464, OmegaRate: -0.57744050
    }
  },
  {
    name: 'Pluto',
    nameRu: 'Плутон',
    type: 'dwarf',
    radius: 1188.3,
    color: '#C2B280',
    description: 'Карликовая планета в поясе Койпера',
    mass: '1.303 × 10²² кг',
    distanceFromSun: '5.906 млрд км',
    orbitalPeriod: '248 лет',
    orbitalElements: {
      a: 39.48211675, e: 0.24882730, i: 17.14001206,
      L: 238.92903833, wBar: 224.06891629, Omega: 110.30393684,
      aRate: -0.00031596, eRate: 0.00005170, iRate: 0.00004818,
      LRate: 145.20780515, wBarRate: -0.04062942, OmegaRate: -0.01183482
    }
  },
  {
    name: 'Ceres',
    nameRu: 'Церера',
    type: 'dwarf',
    radius: 473,
    color: '#8B8682',
    description: 'Крупнейший объект в поясе астероидов',
    mass: '9.39 × 10²⁰ кг',
    distanceFromSun: '414 млн км',
    orbitalPeriod: '4.6 лет',
    orbitalElements: {
      a: 2.7675, e: 0.0758, i: 10.59,
      L: 130.3, wBar: 73.6, Omega: 80.3,
      aRate: 0, eRate: 0, iRate: 0,
      LRate: 77467.2, wBarRate: 0, OmegaRate: 0
    }
  },
  {
    name: 'Eris',
    nameRu: 'Эрида',
    type: 'dwarf',
    radius: 1163,
    color: '#E0E0E0',
    description: 'Самая массивная карликовая планета',
    mass: '1.66 × 10²² кг',
    distanceFromSun: '10.12 млрд км',
    orbitalPeriod: '559 лет',
    orbitalElements: {
      a: 67.864, e: 0.44068, i: 44.044,
      L: 204.1, wBar: 151.6, Omega: 35.9,
      aRate: 0, eRate: 0, iRate: 0,
      LRate: 51.9, wBarRate: 0, OmegaRate: 0
    }
  }
];

// Major moons data
export interface MoonData {
  name: string;
  nameRu: string;
  parentPlanet: string;
  radius: number; // km
  color: string;
  orbitRadius: number; // relative to parent (scaled)
  orbitSpeed: number; // relative speed
  description: string;
}

export const moons: MoonData[] = [
  { name: 'Moon', nameRu: 'Луна', parentPlanet: 'Earth', radius: 1737.4, color: '#C0C0C0', orbitRadius: 0.00257, orbitSpeed: 13.37, description: 'Единственный естественный спутник Земли' },
  { name: 'Phobos', nameRu: 'Фобос', parentPlanet: 'Mars', radius: 11.267, color: '#8B7355', orbitRadius: 0.0000627, orbitSpeed: 30, description: 'Крупнейший спутник Марса' },
  { name: 'Deimos', nameRu: 'Деймос', parentPlanet: 'Mars', radius: 6.2, color: '#9B8B72', orbitRadius: 0.000157, orbitSpeed: 10, description: 'Второй спутник Марса' },
  { name: 'Io', nameRu: 'Ио', parentPlanet: 'Jupiter', radius: 1821.6, color: '#FFFF00', orbitRadius: 0.00282, orbitSpeed: 20, description: 'Вулканический спутник Юпитера' },
  { name: 'Europa', nameRu: 'Европа', parentPlanet: 'Jupiter', radius: 1560.8, color: '#E8DCC8', orbitRadius: 0.00449, orbitSpeed: 10, description: 'Ледяной спутник Юпитера с подповерхностным океаном' },
  { name: 'Ganymede', nameRu: 'Ганимед', parentPlanet: 'Jupiter', radius: 2634.1, color: '#A0A0A0', orbitRadius: 0.00716, orbitSpeed: 5, description: 'Крупнейший спутник в Солнечной системе' },
  { name: 'Callisto', nameRu: 'Каллисто', parentPlanet: 'Jupiter', radius: 2410.3, color: '#696969', orbitRadius: 0.01259, orbitSpeed: 3.5, description: 'Сильно кратерированный спутник Юпитера' },
  { name: 'Titan', nameRu: 'Титан', parentPlanet: 'Saturn', radius: 2574.73, color: '#D4A017', orbitRadius: 0.00817, orbitSpeed: 4.5, description: 'Крупнейший спутник Сатурна с атмосферой' },
  { name: 'Enceladus', nameRu: 'Энцелад', parentPlanet: 'Saturn', radius: 252.1, color: '#FFFFFF', orbitRadius: 0.00159, orbitSpeed: 17, description: 'Ледяной спутник Сатурна с гейзерами' },
  { name: 'Triton', nameRu: 'Тритон', parentPlanet: 'Neptune', radius: 1353.4, color: '#B0C4DE', orbitRadius: 0.00237, orbitSpeed: -6, description: 'Крупнейший спутник Нептуна, ретроградная орбита' },
];

// Scale factors for visualization
export const SCALE = {
  distanceScale: 50, // 1 AU = 50 units in scene
  planetScale: 0.00005, // planet radius to scene units
  sunScale: 0.000005, // sun is scaled differently to not overwhelm
  moonOrbitScale: 5000, // moon orbit visualization scale
  moonSizeScale: 0.0001,
};

// Convert J2000 Julian date to centuries since J2000
export function dateToJulianCenturies(date: Date): number {
  const jd = dateToJulianDate(date);
  return (jd - 2451545.0) / 36525.0;
}

export function dateToJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5;
}

// Calculate position of a planet at a given date
export function calculatePlanetPosition(elements: OrbitalElements, T: number): [number, number, number] {
  if (elements.a === 0) return [0, 0, 0]; // Sun
  
  // Calculate orbital elements at time T
  const a = elements.a + elements.aRate * T;
  const e = elements.e + elements.eRate * T;
  const i = (elements.i + elements.iRate * T) * Math.PI / 180;
  const L = (elements.L + elements.LRate * T) * Math.PI / 180;
  const wBar = (elements.wBar + elements.wBarRate * T) * Math.PI / 180;
  const Omega = (elements.Omega + elements.OmegaRate * T) * Math.PI / 180;
  
  // Argument of perihelion
  const w = wBar - Omega;
  // Mean anomaly
  const M = L - wBar;
  
  // Solve Kepler's equation: E - e*sin(E) = M
  let E = M;
  for (let iter = 0; iter < 20; iter++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  
  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  
  // Distance from Sun
  const r = a * (1 - e * Math.cos(E));
  
  // Position in orbital plane
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);
  
  // Transform to ecliptic coordinates
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  
  const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const y = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;
  
  return [x * SCALE.distanceScale, z * SCALE.distanceScale, y * SCALE.distanceScale];
}

// Calculate orbit path for visualization
export function calculateOrbitPath(elements: OrbitalElements, T: number, segments: number = 128): [number, number, number][] {
  if (elements.a === 0) return [];
  
  const a = elements.a + elements.aRate * T;
  const e = elements.e + elements.eRate * T;
  const i = (elements.i + elements.iRate * T) * Math.PI / 180;
  const wBar = (elements.wBar + elements.wBarRate * T) * Math.PI / 180;
  const Omega = (elements.Omega + elements.OmegaRate * T) * Math.PI / 180;
  const w = wBar - Omega;
  
  const points: [number, number, number][] = [];
  
  for (let j = 0; j <= segments; j++) {
    const nu = (j / segments) * 2 * Math.PI;
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);
    
    const cosO = Math.cos(Omega);
    const sinO = Math.sin(Omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosW = Math.cos(w);
    const sinW = Math.sin(w);
    
    const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
    const y = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
    const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;
    
    points.push([x * SCALE.distanceScale, z * SCALE.distanceScale, y * SCALE.distanceScale]);
  }
  
  return points;
}
