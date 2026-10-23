// Generate asteroid belt positions
export interface AsteroidData {
  position: [number, number, number];
  size: number;
  color: string;
}

// Generate random asteroid belt
export function generateAsteroidBelt(count: number = 2000): AsteroidData[] {
  const asteroids: AsteroidData[] = [];
  const innerRadius = 2.2; // AU
  const outerRadius = 3.2; // AU
  const SCALE_DIST = 50; // same as planets

  for (let i = 0; i < count; i++) {
    const r = innerRadius + Math.random() * (outerRadius - innerRadius);
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 0.5; // slight vertical spread

    const x = r * Math.cos(angle) * SCALE_DIST;
    const z = r * Math.sin(angle) * SCALE_DIST;
    const yPos = y * SCALE_DIST * 0.1;

    asteroids.push({
      position: [x, yPos, z],
      size: 0.05 + Math.random() * 0.15,
      color: `hsl(${30 + Math.random() * 20}, ${10 + Math.random() * 20}%, ${40 + Math.random() * 30}%)`,
    });
  }

  return asteroids;
}

// Kuiper belt
export function generateKuiperBelt(count: number = 1000): AsteroidData[] {
  const asteroids: AsteroidData[] = [];
  const innerRadius = 30; // AU
  const outerRadius = 50; // AU
  const SCALE_DIST = 50;

  for (let i = 0; i < count; i++) {
    const r = innerRadius + Math.random() * (outerRadius - innerRadius);
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3;

    const x = r * Math.cos(angle) * SCALE_DIST;
    const z = r * Math.sin(angle) * SCALE_DIST;
    const yPos = y * SCALE_DIST * 0.05;

    asteroids.push({
      position: [x, yPos, z],
      size: 0.03 + Math.random() * 0.1,
      color: `hsl(${200 + Math.random() * 40}, ${10 + Math.random() * 15}%, ${30 + Math.random() * 30}%)`,
    });
  }

  return asteroids;
}
