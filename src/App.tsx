import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  planets,
  moons,
  SCALE,
  calculatePlanetPosition,
  calculateOrbitPath,
  dateToJulianCenturies,
  PlanetData,
  MoonData,
} from './data/planets';
import { generateAsteroidBelt, generateKuiperBelt } from './data/asteroids';

// Time control state
interface TimeState {
  currentDate: Date;
  timeScale: number;
  isPlaying: boolean;
}

// Selected object
interface SelectedObject {
  type: 'planet' | 'moon';
  data: PlanetData | MoonData;
  position: [number, number, number];
}

// Asteroid belt component using instanced rendering
function AsteroidBelt({ T }: { T: number }) {
  const asteroids = useMemo(() => generateAsteroidBelt(1500), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    asteroids.forEach((ast, i) => {
      // Slow rotation based on distance
      const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
      const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
      const speed = 0.001 / Math.pow(r / SCALE.distanceScale, 1.5);
      const angle = baseAngle + T * speed * 5000;
      
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      
      dummy.position.set(x, ast.position[1], z);
      dummy.scale.setScalar(ast.size);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [T, asteroids, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, asteroids.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8B7355" roughness={0.9} />
    </instancedMesh>
  );
}

// Kuiper belt
function KuiperBelt({ T }: { T: number }) {
  const asteroids = useMemo(() => generateKuiperBelt(800), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    asteroids.forEach((ast, i) => {
      const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
      const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
      const speed = 0.0001 / Math.pow(r / SCALE.distanceScale, 1.5);
      const angle = baseAngle + T * speed * 5000;
      
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      
      dummy.position.set(x, ast.position[1], z);
      dummy.scale.setScalar(ast.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [T, asteroids, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, asteroids.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4A5568" roughness={0.95} />
    </instancedMesh>
  );
}

// Planet 3D component
function Planet({
  planet,
  T,
  onSelect,
  isSelected,
}: {
  planet: PlanetData;
  T: number;
  onSelect: (obj: SelectedObject) => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = calculatePlanetPosition(planet.orbitalElements, T);

  const size = planet.type === 'star'
    ? Math.max(2.5, planet.radius * SCALE.sunScale)
    : planet.type === 'dwarf'
    ? Math.max(0.4, planet.radius * SCALE.planetScale * 1.5)
    : Math.max(0.35, planet.radius * SCALE.planetScale);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  if (planet.type === 'star') {
    return (
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect({ type: 'planet', data: planet, position });
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 64, 64]} />
          <meshBasicMaterial color={planet.color} />
        </mesh>
        {/* Sun glow layers */}
        <mesh>
          <sphereGeometry args={[size * 1.2, 32, 32]} />
          <meshBasicMaterial color="#FFA500" transparent opacity={0.12} />
        </mesh>
        <mesh>
          <sphereGeometry args={[size * 1.5, 32, 32]} />
          <meshBasicMaterial color="#FF6600" transparent opacity={0.05} />
        </mesh>
        <pointLight color="#FDB813" intensity={3} distance={2000} decay={0.5} />
        {hovered && (
          <Html distanceFactor={100} style={{ pointerEvents: 'none' }}>
            <div className="bg-gray-900/90 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-yellow-500/30 shadow-lg">
              ☀️ {planet.nameRu}
            </div>
          </Html>
        )}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.6, size * 1.8, 64]} />
            <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ type: 'planet', data: planet, position });
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          roughness={0.7}
          metalness={0.1}
          emissive={planet.color}
          emissiveIntensity={0.03}
        />
      </mesh>
      {/* Rings for Saturn */}
      {planet.hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.3, 64]} />
          <meshBasicMaterial
            color={planet.ringColor || '#C8B078'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      {/* Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={80} style={{ pointerEvents: 'none' }}>
          <div className="bg-gray-900/90 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-gray-600 shadow-lg">
            {planet.type === 'dwarf' ? '⚪' : '🪐'} {planet.nameRu}
          </div>
        </Html>
      )}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 2.0, size * 2.2, 32]} />
          <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// Moon component
function Moon({
  moon,
  parentPosition,
  T,
  onSelect,
}: {
  moon: MoonData;
  parentPosition: [number, number, number];
  T: number;
  onSelect: (obj: SelectedObject) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const angle = T * moon.orbitSpeed * 100;
  const orbitR = moon.orbitRadius * SCALE.moonOrbitScale * SCALE.distanceScale;
  const x = parentPosition[0] + Math.cos(angle) * orbitR;
  const y = parentPosition[1];
  const z = parentPosition[2] + Math.sin(angle) * orbitR;

  const size = Math.max(0.15, moon.radius * SCALE.moonSizeScale);

  return (
    <group>
      {/* Moon orbit line */}
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const a = (i / 63) * Math.PI * 2;
          return [
            parentPosition[0] + Math.cos(a) * orbitR,
            parentPosition[1],
            parentPosition[2] + Math.sin(a) * orbitR,
          ] as [number, number, number];
        })}
        color="#334455"
        lineWidth={0.5}
        transparent
        opacity={0.3}
      />
      <mesh
        ref={meshRef}
        position={[x, y, z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ type: 'moon', data: moon, position: [x, y, z] });
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={moon.color} roughness={0.9} />
      </mesh>
      {hovered && (
        <Html position={[x, y + size + 0.5, z]} distanceFactor={50} style={{ pointerEvents: 'none' }}>
          <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-gray-600">
            🌙 {moon.nameRu}
          </div>
        </Html>
      )}
    </group>
  );
}

// Orbit path component
function OrbitPath({ planet, T }: { planet: PlanetData; T: number }) {
  if (planet.type === 'star') return null;

  const points = calculateOrbitPath(planet.orbitalElements, T, 256);

  return (
    <Line
      points={points}
      color={planet.type === 'dwarf' ? '#666688' : planet.color}
      lineWidth={planet.type === 'dwarf' ? 0.3 : 0.5}
      transparent
      opacity={planet.type === 'dwarf' ? 0.15 : 0.2}
      dashed={planet.type === 'dwarf'}
      dashSize={2}
      gapSize={1}
    />
  );
}

// Camera controller for focusing on objects
function CameraController({ target, enabled }: { target: [number, number, number] | null; enabled: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    if (target && enabled) {
      camera.lookAt(target[0], target[1], target[2]);
    }
  }, [target, enabled, camera]);

  return null;
}



// Solar System scene
function SolarSystem({
  timeState,
  onSelect,
  selectedObject,
  focusTarget,
}: {
  timeState: TimeState;
  onSelect: (obj: SelectedObject) => void;
  selectedObject: SelectedObject | null;
  focusTarget: [number, number, number] | null;
}) {
  const T = dateToJulianCenturies(timeState.currentDate);

  // Calculate planet positions for moons
  const planetPositions: Record<string, [number, number, number]> = {};
  planets.forEach((p) => {
    planetPositions[p.name] = calculatePlanetPosition(p.orbitalElements, T);
  });

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.06} />

      {/* Stars background */}
      <Stars radius={4000} depth={800} count={10000} factor={5} saturation={0.1} fade speed={0.3} />

      {/* Orbit paths */}
      {planets.map((planet) => (
        <OrbitPath key={`orbit-${planet.name}`} planet={planet} T={T} />
      ))}

      {/* Asteroid belt */}
      <AsteroidBelt T={T} />

      {/* Kuiper belt */}
      <KuiperBelt T={T} />

      {/* Planets */}
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          T={T}
          onSelect={onSelect}
          isSelected={selectedObject?.type === 'planet' && (selectedObject.data as PlanetData).name === planet.name}
        />
      ))}

      {/* Moons */}
      {moons.map((moon) => (
        <Moon
          key={moon.name}
          moon={moon}
          parentPosition={planetPositions[moon.parentPlanet] || [0, 0, 0]}
          T={T}
          onSelect={onSelect}
        />
      ))}

      {/* Camera controller */}
      <CameraController target={focusTarget} enabled={!!focusTarget} />

      {/* Camera controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1}
        maxDistance={5000}
        zoomSpeed={1.5}
        rotateSpeed={0.5}
        panSpeed={1}
      />
    </>
  );
}

// Main App
export default function App() {
  const [timeState, setTimeState] = useState<TimeState>({
    currentDate: new Date(),
    timeScale: 86400, // 1 day per second
    isPlaying: true,
  });
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  // Animation loop for time
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (timeState.isPlaying) {
        setTimeState((prev) => {
          const newDate = new Date(prev.currentDate.getTime() + dt * prev.timeScale * 1000);
          return { ...prev, currentDate: newDate };
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [timeState.isPlaying, timeState.timeScale]);

  const handleSelect = useCallback((obj: SelectedObject) => {
    setSelectedObject(obj);
    setFocusTarget(obj.position);
    setShowInfo(true);
  }, []);

  const handleFocusPlanet = useCallback((planet: PlanetData) => {
    const T = dateToJulianCenturies(timeState.currentDate);
    const pos = calculatePlanetPosition(planet.orbitalElements, T);
    setSelectedObject({ type: 'planet', data: planet, position: pos });
    setFocusTarget(pos);
    setShowInfo(true);
    setShowSearch(false);
  }, [timeState.currentDate]);

  const handleTimeScale = (scale: number) => {
    setTimeState((prev) => ({ ...prev, timeScale: Math.max(1, Math.min(315360000, scale)) }));
  };

  const togglePlay = () => {
    setTimeState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const goToday = () => {
    setTimeState((prev) => ({ ...prev, currentDate: new Date() }));
  };

  const searchResults = searchQuery.length > 0
    ? [
        ...planets.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameRu.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...moons.filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.nameRu.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      ]
    : [];

  const formatTimeScale = (scale: number): string => {
    if (scale >= 31536000) return `${(scale / 31536000).toFixed(0)} г/с`;
    if (scale >= 2592000) return `${(scale / 2592000).toFixed(0)} мес/с`;
    if (scale >= 604800) return `${(scale / 604800).toFixed(0)} нед/с`;
    if (scale >= 86400) return `${(scale / 86400).toFixed(0)} дн/с`;
    if (scale >= 3600) return `${(scale / 3600).toFixed(0)} ч/с`;
    if (scale >= 60) return `${(scale / 60).toFixed(0)} мин/с`;
    return `${scale} с/с`;
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 250, 500], fov: 55, near: 0.01, far: 20000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          setSelectedObject(null);
          setFocusTarget(null);
        }}
      >
        <SolarSystem
          timeState={timeState}
          onSelect={handleSelect}
          selectedObject={selectedObject}
          focusTarget={focusTarget}
        />
      </Canvas>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-white text-xl font-bold tracking-wider flex items-center gap-2">
            <span className="text-2xl">🪐</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Space Map
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Интерактивная карта Солнечной системы • Данные NASA JPL</p>
        </div>

        {/* Search */}
        <div className="pointer-events-auto relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-white/10 hover:border-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm hidden sm:inline">Поиск объектов</span>
          </button>

          {showSearch && (
            <div className="absolute top-12 right-0 w-80 bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название планеты или спутника..."
                className="w-full px-4 py-3 bg-transparent text-white border-b border-gray-700 outline-none placeholder-gray-500 text-sm"
                autoFocus
              />
              <div className="max-h-72 overflow-y-auto">
                {searchResults.length === 0 && searchQuery && (
                  <div className="px-4 py-4 text-gray-500 text-sm text-center">Ничего не найдено</div>
                )}
                {searchResults.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if ('orbitalElements' in item) {
                        handleFocusPlanet(item as PlanetData);
                      }
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-gray-800/50"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}40` }}
                    />
                    <div>
                      <div className="text-sm font-medium">{item.nameRu}</div>
                      <div className="text-xs text-gray-400">{item.name}</div>
                    </div>
                  </button>
                ))}
                {!searchQuery && (
                  <div className="px-3 py-3">
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider px-1">Планеты</div>
                    {planets.filter(p => p.type === 'planet').map((planet) => (
                      <button
                        key={planet.name}
                        onClick={() => handleFocusPlanet(planet)}
                        className="w-full px-2 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 rounded-lg transition-colors"
                      >
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: planet.color }} />
                        <div>
                          <span className="text-sm">{planet.nameRu}</span>
                          <span className="text-xs text-gray-500 ml-2">{planet.name}</span>
                        </div>
                      </button>
                    ))}
                    <div className="text-xs text-gray-500 mt-3 mb-2 uppercase tracking-wider px-1">Карликовые планеты</div>
                    {planets.filter(p => p.type === 'dwarf').map((planet) => (
                      <button
                        key={planet.name}
                        onClick={() => handleFocusPlanet(planet)}
                        className="w-full px-2 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 rounded-lg transition-colors"
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: planet.color }} />
                        <div>
                          <span className="text-sm">{planet.nameRu}</span>
                          <span className="text-xs text-gray-500 ml-2">{planet.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 flex items-center justify-center text-white transition-all border border-white/10"
          >
            {timeState.isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time display */}
          <div className="text-center min-w-[140px]">
            <div className="text-white text-sm font-mono font-medium">
              {timeState.currentDate.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="text-gray-400 text-xs font-mono">
              {timeState.currentDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-700" />

          {/* Time scale buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTimeScale(timeState.timeScale / 10)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20"
            >
              ⟪
            </button>
            <button
              onClick={() => handleTimeScale(timeState.timeScale / 2)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20"
            >
              ⟨
            </button>
            <div className="px-3 py-1.5 text-blue-300 text-xs font-mono min-w-[70px] text-center bg-blue-500/10 rounded-lg border border-blue-500/20">
              {formatTimeScale(timeState.timeScale)}
            </div>
            <button
              onClick={() => handleTimeScale(timeState.timeScale * 2)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20"
            >
              ⟩
            </button>
            <button
              onClick={() => handleTimeScale(timeState.timeScale * 10)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20"
            >
              ⟫
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-700" />

          {/* Today button */}
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs transition-all border border-blue-500/30 hover:border-blue-400/50"
          >
            Сегодня
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {selectedObject && showInfo && (
        <div className="absolute top-20 right-4 w-80 pointer-events-auto animate-in">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-transparent">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: selectedObject.data.color + '30',
                    border: `2px solid ${selectedObject.data.color}`,
                    boxShadow: `0 0 15px ${selectedObject.data.color}30`,
                  }}
                >
                  {selectedObject.type === 'planet' && (selectedObject.data as PlanetData).type === 'star' ? '☀️' :
                   selectedObject.type === 'planet' && (selectedObject.data as PlanetData).type === 'dwarf' ? '⚪' :
                   selectedObject.type === 'moon' ? '🌙' : '🪐'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{selectedObject.data.nameRu}</h3>
                  <p className="text-gray-400 text-xs">{selectedObject.data.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">{selectedObject.data.description}</p>

              {selectedObject.type === 'planet' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Радиус</div>
                    <div className="text-white text-sm font-medium mt-0.5">
                      {(selectedObject.data as PlanetData).radius.toLocaleString()} км
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Масса</div>
                    <div className="text-white text-sm font-medium mt-0.5">
                      {(selectedObject.data as PlanetData).mass}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">До Солнца</div>
                    <div className="text-white text-sm font-medium mt-0.5">
                      {(selectedObject.data as PlanetData).distanceFromSun}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Период</div>
                    <div className="text-white text-sm font-medium mt-0.5">
                      {(selectedObject.data as PlanetData).orbitalPeriod}
                    </div>
                  </div>
                </div>
              )}

              {selectedObject.type === 'moon' && (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Родительская планета</div>
                  <div className="text-white text-sm font-medium mt-0.5">
                    {(selectedObject.data as MoonData).parentPlanet}
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Координаты (эклиптика)</div>
                <div className="text-white text-xs font-mono space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">X:</span>
                    <span>{(selectedObject.position[0] / SCALE.distanceScale).toFixed(4)} AU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Y:</span>
                    <span>{(selectedObject.position[2] / SCALE.distanceScale).toFixed(4)} AU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Z:</span>
                    <span>{(selectedObject.position[1] / SCALE.distanceScale).toFixed(4)} AU</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700/50 pt-1 mt-1">
                    <span className="text-gray-400">Расст. от Солнца:</span>
                    <span>
                      {(Math.sqrt(
                        selectedObject.position[0] ** 2 +
                        selectedObject.position[1] ** 2 +
                        selectedObject.position[2] ** 2
                      ) / SCALE.distanceScale).toFixed(4)} AU
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planet quick nav */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-2 space-y-1 shadow-xl">
          {planets.map((planet) => (
            <button
              key={planet.name}
              onClick={() => handleFocusPlanet(planet)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110 group relative ${
                selectedObject?.type === 'planet' &&
                (selectedObject.data as PlanetData).name === planet.name
                  ? 'bg-white/15 ring-1 ring-cyan-400/50'
                  : 'hover:bg-white/10'
              }`}
              title={planet.nameRu}
            >
              <div
                className="rounded-full transition-transform group-hover:scale-125"
                style={{
                  width: planet.type === 'star' ? 18 : Math.max(6, Math.min(22, planet.radius * 0.00025)),
                  height: planet.type === 'star' ? 18 : Math.max(6, Math.min(22, planet.radius * 0.00025)),
                  backgroundColor: planet.color,
                  boxShadow: planet.type === 'star' ? `0 0 10px ${planet.color}80` : `0 0 4px ${planet.color}40`,
                }}
              />
              {/* Tooltip */}
              <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-600">
                {planet.nameRu}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 pointer-events-none">
        <div className="text-gray-500 text-xs space-y-0.5 bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-gray-800/50">
          <div>🖱️ ЛКМ — вращение</div>
          <div>🔍 Колёсико — масштаб</div>
          <div>📍 ПКМ — перемещение</div>
          <div>🎯 Клик — информация</div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-20 left-4 pointer-events-none">
        <div className="text-gray-600 text-xs font-mono">
          <div>Объектов: {planets.length + moons.length}</div>
          <div>Астероиды: 2300</div>
        </div>
      </div>
    </div>
  );
}
