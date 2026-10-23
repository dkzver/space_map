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
import { generateAsteroidBelt, generateKuiperBelt, AsteroidData } from './data/asteroids';

interface TimeState {
  currentDate: Date;
  timeScale: number;
  isPlaying: boolean;
}

// Unified selected object type
type SelectedObject = 
  | { kind: 'planet'; planet: PlanetData; position: [number, number, number] }
  | { kind: 'moon'; moon: MoonData; position: [number, number, number] }
  | { kind: 'asteroid'; name: string; nameRu: string; color: string; position: [number, number, number] };

function getSelectedName(obj: SelectedObject): string {
  if (obj.kind === 'planet') return obj.planet.name;
  if (obj.kind === 'moon') return obj.moon.name;
  return obj.name;
}

function getSelectedNameRu(obj: SelectedObject): string {
  if (obj.kind === 'planet') return obj.planet.nameRu;
  if (obj.kind === 'moon') return obj.moon.nameRu;
  return obj.nameRu;
}

function getSelectedColor(obj: SelectedObject): string {
  if (obj.kind === 'planet') return obj.planet.color;
  if (obj.kind === 'moon') return obj.moon.color;
  return obj.color;
}

function getSelectedKind(obj: SelectedObject): string {
  if (obj.kind === 'planet') {
    if (obj.planet.type === 'star') return 'star';
    if (obj.planet.type === 'dwarf') return 'dwarf';
    return 'planet';
  }
  if (obj.kind === 'moon') return 'moon';
  return 'asteroid';
}

// Object list item
interface ObjectListItem {
  id: string;
  name: string;
  nameRu: string;
  type: 'star' | 'planet' | 'dwarf' | 'moon' | 'asteroid';
  color: string;
  getPosition: (T: number) => [number, number, number];
}

// Asteroid belt component
function AsteroidBelt({ T, asteroids, onSelect }: { T: number; asteroids: AsteroidData[]; onSelect: (obj: SelectedObject) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positionsCache = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!meshRef.current) return;
    const positions: [number, number, number][] = [];
    asteroids.forEach((ast, i) => {
      const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
      const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
      const speed = 0.001 / Math.pow(r / SCALE.distanceScale, 1.5);
      const angle = baseAngle + T * speed * 5000;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      positions.push([x, ast.position[1], z]);
      dummy.position.set(x, ast.position[1], z);
      dummy.scale.setScalar(ast.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    positionsCache.current = positions;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [T, asteroids, dummy]);

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, asteroids.length]}
      onClick={(e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId !== undefined && positionsCache.current[instanceId]) {
          const pos = positionsCache.current[instanceId];
          onSelect({ 
            kind: 'asteroid', 
            name: `Asteroid ${instanceId + 1}`, 
            nameRu: `Астероид ${instanceId + 1}`, 
            color: '#8B7355',
            position: pos 
          });
        }
      }}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8B7355" roughness={0.9} />
    </instancedMesh>
  );
}

// Kuiper belt
function KuiperBelt({ T, asteroids, onSelect }: { T: number; asteroids: AsteroidData[]; onSelect: (obj: SelectedObject) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positionsCache = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!meshRef.current) return;
    const positions: [number, number, number][] = [];
    asteroids.forEach((ast, i) => {
      const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
      const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
      const speed = 0.0001 / Math.pow(r / SCALE.distanceScale, 1.5);
      const angle = baseAngle + T * speed * 5000;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      positions.push([x, ast.position[1], z]);
      dummy.position.set(x, ast.position[1], z);
      dummy.scale.setScalar(ast.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    positionsCache.current = positions;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [T, asteroids, dummy]);

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, asteroids.length]}
      onClick={(e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId !== undefined && positionsCache.current[instanceId]) {
          const pos = positionsCache.current[instanceId];
          onSelect({ 
            kind: 'asteroid', 
            name: `KBO ${instanceId + 1}`, 
            nameRu: `Объект пояса Койпера ${instanceId + 1}`, 
            color: '#4A5568',
            position: pos 
          });
        }
      }}
    >
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
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  if (planet.type === 'star') {
    return (
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'planet', planet, position }); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 64, 64]} />
          <meshBasicMaterial color={planet.color} />
        </mesh>
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
            <div className="bg-gray-900/90 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-yellow-500/30 shadow-lg">☀️ {planet.nameRu}</div>
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
        onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'planet', planet, position }); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={planet.color} roughness={0.7} metalness={0.1} emissive={planet.color} emissiveIntensity={0.03} />
      </mesh>
      {planet.hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.3, 64]} />
          <meshBasicMaterial color={planet.ringColor || '#C8B078'} side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
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
  const [hovered, setHovered] = useState(false);
  const angle = T * moon.orbitSpeed * 100;
  const orbitR = moon.orbitRadius * SCALE.moonOrbitScale * SCALE.distanceScale;
  const x = parentPosition[0] + Math.cos(angle) * orbitR;
  const y = parentPosition[1];
  const z = parentPosition[2] + Math.sin(angle) * orbitR;
  const size = Math.max(0.15, moon.radius * SCALE.moonSizeScale);

  return (
    <group>
      <Line
        points={Array.from({ length: 64 }, (_, i) => {
          const a = (i / 63) * Math.PI * 2;
          return [parentPosition[0] + Math.cos(a) * orbitR, parentPosition[1], parentPosition[2] + Math.sin(a) * orbitR] as [number, number, number];
        })}
        color="#334455" lineWidth={0.5} transparent opacity={0.3}
      />
      <mesh
        position={[x, y, z]}
        onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'moon', moon, position: [x, y, z] }); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={moon.color} roughness={0.9} />
      </mesh>
      {hovered && (
        <Html position={[x, y + size + 0.5, z]} distanceFactor={50} style={{ pointerEvents: 'none' }}>
          <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-gray-600">🌙 {moon.nameRu}</div>
        </Html>
      )}
    </group>
  );
}

// Orbit path
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

// Camera controller
function CameraController({
  target,
  selectedObject,
  controlsRef,
}: {
  target: [number, number, number] | null;
  selectedObject: SelectedObject | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animProgress = useRef(0);
  const startCamPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endCamPos = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const viewDistanceRef = useRef(20);
  const isFollowing = useRef(false);
  const lastFocusedName = useRef<string | null>(null);

  useEffect(() => {
    if (target && selectedObject) {
      const objName = getSelectedName(selectedObject);
      if (lastFocusedName.current !== objName) {
        lastFocusedName.current = objName;
        let viewDistance: number;
        if (selectedObject.kind === 'planet') {
          const p = selectedObject.planet;
          if (p.type === 'star') viewDistance = 30;
          else if (p.type === 'dwarf') viewDistance = 10;
          else viewDistance = Math.max(6, p.radius * SCALE.planetScale * 10);
        } else if (selectedObject.kind === 'asteroid') {
          viewDistance = 3;
        } else {
          viewDistance = 5;
        }
        viewDistanceRef.current = viewDistance;
        const targetVec = new THREE.Vector3(target[0], target[1], target[2]);
        const currentTarget = controlsRef.current?.target || new THREE.Vector3();
        const direction = new THREE.Vector3().subVectors(camera.position, currentTarget).normalize();
        if (direction.length() < 0.001) direction.set(0.5, 0.7, 1).normalize();
        startCamPos.current.copy(camera.position);
        startTarget.current.copy(currentTarget);
        endTarget.current.copy(targetVec);
        endCamPos.current.copy(targetVec).add(direction.multiplyScalar(viewDistance));
        isAnimating.current = true;
        isFollowing.current = false;
        animProgress.current = 0;
        setTimeout(() => { isFollowing.current = true; }, 1200);
      }
    } else {
      isFollowing.current = false;
      lastFocusedName.current = null;
    }
  }, [selectedObject]);

  useFrame((_, delta) => {
    if (isAnimating.current) {
      animProgress.current = Math.min(1, animProgress.current + delta * 1.0);
      const t = 1 - Math.pow(1 - animProgress.current, 3);
      camera.position.lerpVectors(startCamPos.current, endCamPos.current, t);
      if (controlsRef.current) {
        const newTarget = new THREE.Vector3().lerpVectors(startTarget.current, endTarget.current, t);
        controlsRef.current.target.copy(newTarget);
        controlsRef.current.update();
      }
      if (animProgress.current >= 1) isAnimating.current = false;
      return;
    }
    if (isFollowing.current && target && controlsRef.current) {
      const targetVec = new THREE.Vector3(target[0], target[1], target[2]);
      const currentTarget = controlsRef.current.target as THREE.Vector3;
      currentTarget.lerp(targetVec, 0.08);
      const dist = camera.position.distanceTo(currentTarget);
      if (Math.abs(dist - viewDistanceRef.current) > 0.5) {
        const dir = new THREE.Vector3().subVectors(camera.position, currentTarget).normalize();
        const desiredPos = new THREE.Vector3().copy(currentTarget).add(dir.multiplyScalar(viewDistanceRef.current));
        camera.position.lerp(desiredPos, 0.05);
      }
      controlsRef.current.update();
    }
  });

  return null;
}

// Solar System scene
function SolarSystem({
  timeState,
  onSelect,
  selectedObject,
  focusTarget,
  asteroidBelt,
  kuiperBelt,
}: {
  timeState: TimeState;
  onSelect: (obj: SelectedObject) => void;
  selectedObject: SelectedObject | null;
  focusTarget: [number, number, number] | null;
  asteroidBelt: AsteroidData[];
  kuiperBelt: AsteroidData[];
}) {
  const controlsRef = useRef<any>(null);
  const T = dateToJulianCenturies(timeState.currentDate);

  const planetPositions: Record<string, [number, number, number]> = {};
  planets.forEach((p) => {
    planetPositions[p.name] = calculatePlanetPosition(p.orbitalElements, T);
  });

  const liveTarget = useMemo((): [number, number, number] | null => {
    if (!selectedObject) return null;
    if (selectedObject.kind === 'planet') {
      return calculatePlanetPosition(selectedObject.planet.orbitalElements, T);
    } else if (selectedObject.kind === 'moon') {
      const moon = selectedObject.moon;
      const parentPos = planetPositions[moon.parentPlanet] || [0, 0, 0];
      const angle = T * moon.orbitSpeed * 100;
      const orbitR = moon.orbitRadius * SCALE.moonOrbitScale * SCALE.distanceScale;
      return [parentPos[0] + Math.cos(angle) * orbitR, parentPos[1], parentPos[2] + Math.sin(angle) * orbitR];
    }
    return selectedObject.position;
  }, [selectedObject, T]);

  return (
    <>
      <ambientLight intensity={0.06} />
      <Stars radius={4000} depth={800} count={10000} factor={5} saturation={0.1} fade speed={0.3} />
      {planets.map((planet) => <OrbitPath key={`orbit-${planet.name}`} planet={planet} T={T} />)}
      <AsteroidBelt T={T} asteroids={asteroidBelt} onSelect={onSelect} />
      <KuiperBelt T={T} asteroids={kuiperBelt} onSelect={onSelect} />
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          T={T}
          onSelect={onSelect}
          isSelected={selectedObject?.kind === 'planet' && selectedObject.planet.name === planet.name}
        />
      ))}
      {moons.map((moon) => (
        <Moon
          key={moon.name}
          moon={moon}
          parentPosition={planetPositions[moon.parentPlanet] || [0, 0, 0]}
          T={T}
          onSelect={onSelect}
        />
      ))}
      <OrbitControls
        ref={controlsRef}
        enablePan enableZoom enableRotate
        minDistance={0.5} maxDistance={5000}
        zoomSpeed={1.5} rotateSpeed={0.5} panSpeed={1}
        enableDamping dampingFactor={0.08}
      />
      <CameraController target={liveTarget || focusTarget} selectedObject={selectedObject} controlsRef={controlsRef} />
    </>
  );
}

// Object List Panel
function ObjectListPanel({
  objects,
  onSelect,
  selectedObject,
}: {
  objects: ObjectListItem[];
  onSelect: (item: ObjectListItem) => void;
  selectedObject: SelectedObject | null;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPanel, setShowPanel] = useState(false);

  const categories = [
    { id: 'all', label: 'Все', icon: '🌌', count: objects.length },
    { id: 'star', label: 'Звёзды', icon: '☀️', count: objects.filter(o => o.type === 'star').length },
    { id: 'planet', label: 'Планеты', icon: '🪐', count: objects.filter(o => o.type === 'planet').length },
    { id: 'dwarf', label: 'Карликовые', icon: '⚪', count: objects.filter(o => o.type === 'dwarf').length },
    { id: 'moon', label: 'Спутники', icon: '🌙', count: objects.filter(o => o.type === 'moon').length },
    { id: 'asteroid', label: 'Астероиды', icon: '☄️', count: objects.filter(o => o.type === 'asteroid').length },
  ];

  const filteredObjects = objects.filter((obj) => {
    const matchesSearch = searchQuery === '' || 
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.nameRu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || obj.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (item: ObjectListItem): boolean => {
    if (!selectedObject) return false;
    const selName = getSelectedName(selectedObject);
    const selNameRu = getSelectedNameRu(selectedObject);
    return item.name === selName || item.nameRu === selNameRu;
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="absolute top-20 right-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl px-4 py-2.5 text-white hover:bg-gray-800/90 transition-all shadow-lg pointer-events-auto flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-sm font-medium">Объекты</span>
        <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full text-xs font-mono">
          {objects.length}
        </span>
      </button>

      {showPanel && (
        <div className="absolute top-36 right-4 w-[420px] max-h-[calc(100vh-200px)] bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col">
          <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-lg">Все объекты</h3>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск объекта..."
              className="w-full px-3 py-2 bg-white/5 border border-gray-600/50 rounded-lg text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder-gray-500"
            />
          </div>

          <div className="px-4 py-2 border-b border-gray-700/50 flex gap-1 overflow-x-auto flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === cat.id
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-60 ml-0.5">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredObjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm">Объекты не найдены</div>
              </div>
            ) : (
              <div className="p-2">
                {filteredObjects.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => onSelect(obj)}
                    className={`w-full px-3 py-2 text-left rounded-lg mb-0.5 transition-all flex items-center gap-3 ${
                      isSelected(obj)
                        ? 'bg-blue-500/20 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: obj.color + '30',
                        border: `2px solid ${obj.color}`,
                        boxShadow: `0 0 8px ${obj.color}40`,
                      }}
                    >
                      {obj.type === 'star' ? '☀️' : obj.type === 'planet' ? '🪐' : obj.type === 'dwarf' ? '⚪' : obj.type === 'moon' ? '🌙' : '☄️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{obj.nameRu}</div>
                      <div className="text-gray-500 text-xs truncate">{obj.name}</div>
                    </div>
                    {isSelected(obj) && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Показано: {filteredObjects.length}</span>
              <span>Всего: {objects.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main App
export default function App() {
  const [timeState, setTimeState] = useState<TimeState>({
    currentDate: new Date(),
    timeScale: 86400,
    isPlaying: true,
  });
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  const asteroidBelt = useMemo(() => generateAsteroidBelt(1500), []);
  const kuiperBelt = useMemo(() => generateKuiperBelt(800), []);

  // Build object list
  const objectList = useMemo((): ObjectListItem[] => {
    const list: ObjectListItem[] = [];

    planets.forEach((planet) => {
      list.push({
        id: `planet-${planet.name}`,
        name: planet.name,
        nameRu: planet.nameRu,
        type: planet.type as 'star' | 'planet' | 'dwarf',
        color: planet.color,
        getPosition: (T: number) => calculatePlanetPosition(planet.orbitalElements, T),
      });
    });

    moons.forEach((moon) => {
      list.push({
        id: `moon-${moon.name}`,
        name: moon.name,
        nameRu: moon.nameRu,
        type: 'moon',
        color: moon.color,
        getPosition: (T: number) => {
          const parentPos = calculatePlanetPosition(
            planets.find(p => p.name === moon.parentPlanet)!.orbitalElements, T
          );
          const angle = T * moon.orbitSpeed * 100;
          const orbitR = moon.orbitRadius * SCALE.moonOrbitScale * SCALE.distanceScale;
          return [parentPos[0] + Math.cos(angle) * orbitR, parentPos[1], parentPos[2] + Math.sin(angle) * orbitR];
        },
      });
    });

    asteroidBelt.forEach((ast, i) => {
      list.push({
        id: `asteroid-${i}`,
        name: `Asteroid ${i + 1}`,
        nameRu: `Астероид ${i + 1}`,
        type: 'asteroid',
        color: '#8B7355',
        getPosition: (T: number) => {
          const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
          const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
          const speed = 0.001 / Math.pow(r / SCALE.distanceScale, 1.5);
          const angle = baseAngle + T * speed * 5000;
          return [r * Math.cos(angle), ast.position[1], r * Math.sin(angle)];
        },
      });
    });

    kuiperBelt.forEach((ast, i) => {
      list.push({
        id: `kbo-${i}`,
        name: `KBO ${i + 1}`,
        nameRu: `Объект пояса Койпера ${i + 1}`,
        type: 'asteroid',
        color: '#4A5568',
        getPosition: (T: number) => {
          const r = Math.sqrt(ast.position[0] ** 2 + ast.position[2] ** 2);
          const baseAngle = Math.atan2(ast.position[2], ast.position[0]);
          const speed = 0.0001 / Math.pow(r / SCALE.distanceScale, 1.5);
          const angle = baseAngle + T * speed * 5000;
          return [r * Math.cos(angle), ast.position[1], r * Math.sin(angle)];
        },
      });
    });

    return list;
  }, [asteroidBelt, kuiperBelt]);

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

  const handleListSelect = useCallback((item: ObjectListItem) => {
    const T = dateToJulianCenturies(timeState.currentDate);
    const position = item.getPosition(T);
    
    if (item.type === 'star' || item.type === 'planet' || item.type === 'dwarf') {
      const planet = planets.find(p => p.name === item.name)!;
      handleSelect({ kind: 'planet', planet, position });
    } else if (item.type === 'moon') {
      const moon = moons.find(m => m.name === item.name)!;
      handleSelect({ kind: 'moon', moon, position });
    } else {
      handleSelect({ 
        kind: 'asteroid', 
        name: item.name, 
        nameRu: item.nameRu, 
        color: item.color,
        position 
      });
    }
  }, [timeState.currentDate, handleSelect]);

  const handleTimeScale = (scale: number) => {
    setTimeState((prev) => ({ ...prev, timeScale: Math.max(1, Math.min(315360000, scale)) }));
  };

  const togglePlay = () => setTimeState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  const goToday = () => setTimeState((prev) => ({ ...prev, currentDate: new Date() }));

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
      <Canvas
        camera={{ position: [0, 250, 500], fov: 55, near: 0.01, far: 20000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => { setSelectedObject(null); setFocusTarget(null); }}
      >
        <SolarSystem
          timeState={timeState}
          onSelect={handleSelect}
          selectedObject={selectedObject}
          focusTarget={focusTarget}
          asteroidBelt={asteroidBelt}
          kuiperBelt={kuiperBelt}
        />
      </Canvas>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-white text-xl font-bold tracking-wider flex items-center gap-2">
            <span className="text-2xl">🪐</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Space Map</span>
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Интерактивная карта Солнечной системы • Данные NASA JPL</p>
        </div>
      </div>

      {/* Object List Panel */}
      <ObjectListPanel objects={objectList} onSelect={handleListSelect} selectedObject={selectedObject} />

      {/* Time Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 flex items-center justify-center text-white transition-all border border-white/10"
          >
            {timeState.isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <div className="text-center min-w-[140px]">
            <div className="text-white text-sm font-mono font-medium">
              {timeState.currentDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-gray-400 text-xs font-mono">
              {timeState.currentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleTimeScale(timeState.timeScale / 10)} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20">⟪</button>
            <button onClick={() => handleTimeScale(timeState.timeScale / 2)} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20">⟨</button>
            <div className="px-3 py-1.5 text-blue-300 text-xs font-mono min-w-[70px] text-center bg-blue-500/10 rounded-lg border border-blue-500/20">
              {formatTimeScale(timeState.timeScale)}
            </div>
            <button onClick={() => handleTimeScale(timeState.timeScale * 2)} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20">⟩</button>
            <button onClick={() => handleTimeScale(timeState.timeScale * 10)} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs transition-all border border-white/5 hover:border-white/20">⟫</button>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <button onClick={goToday} className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs transition-all border border-blue-500/30 hover:border-blue-400/50">Сегодня</button>
        </div>
      </div>

      {/* Info Panel */}
      {selectedObject && showInfo && (
        <div className="absolute top-20 left-4 w-80 pointer-events-auto">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-transparent">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: getSelectedColor(selectedObject) + '30',
                    border: `2px solid ${getSelectedColor(selectedObject)}`,
                    boxShadow: `0 0 15px ${getSelectedColor(selectedObject)}30`,
                  }}
                >
                  {getSelectedKind(selectedObject) === 'star' ? '☀️' :
                   getSelectedKind(selectedObject) === 'dwarf' ? '⚪' :
                   getSelectedKind(selectedObject) === 'moon' ? '🌙' :
                   getSelectedKind(selectedObject) === 'asteroid' ? '☄️' : '🪐'}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{getSelectedNameRu(selectedObject)}</h3>
                  <p className="text-gray-400 text-xs">{getSelectedName(selectedObject)}</p>
                </div>
              </div>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedObject.kind === 'planet' && (
                <>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedObject.planet.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Радиус</div>
                      <div className="text-white text-sm font-medium mt-0.5">{selectedObject.planet.radius.toLocaleString()} км</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Масса</div>
                      <div className="text-white text-sm font-medium mt-0.5">{selectedObject.planet.mass}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <div className="text-gray-500 text-xs uppercase tracking-wider">До Солнца</div>
                      <div className="text-white text-sm font-medium mt-0.5">{selectedObject.planet.distanceFromSun}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <div className="text-gray-500 text-xs uppercase tracking-wider">Период</div>
                      <div className="text-white text-sm font-medium mt-0.5">{selectedObject.planet.orbitalPeriod}</div>
                    </div>
                  </div>
                </>
              )}
              {selectedObject.kind === 'moon' && (
                <>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedObject.moon.description}</p>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Родительская планета</div>
                    <div className="text-white text-sm font-medium mt-0.5">{selectedObject.moon.parentPlanet}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Радиус</div>
                    <div className="text-white text-sm font-medium mt-0.5">{selectedObject.moon.radius.toLocaleString()} км</div>
                  </div>
                </>
              )}
              {selectedObject.kind === 'asteroid' && (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Тип</div>
                  <div className="text-white text-sm font-medium mt-0.5">
                    {selectedObject.name.startsWith('KBO') ? 'Объект пояса Койпера' : 'Астероид'}
                  </div>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Координаты (эклиптика)</div>
                <div className="text-white text-xs font-mono space-y-0.5">
                  <div className="flex justify-between"><span className="text-gray-400">X:</span><span>{(selectedObject.position[0] / SCALE.distanceScale).toFixed(4)} AU</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Y:</span><span>{(selectedObject.position[2] / SCALE.distanceScale).toFixed(4)} AU</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Z:</span><span>{(selectedObject.position[1] / SCALE.distanceScale).toFixed(4)} AU</span></div>
                  <div className="flex justify-between border-t border-gray-700/50 pt-1 mt-1">
                    <span className="text-gray-400">Расст. от Солнца:</span>
                    <span>{(Math.sqrt(selectedObject.position[0] ** 2 + selectedObject.position[1] ** 2 + selectedObject.position[2] ** 2) / SCALE.distanceScale).toFixed(4)} AU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className="absolute bottom-20 right-4 pointer-events-none">
        <div className="text-gray-600 text-xs font-mono bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-gray-800/50">
          <div>Всего объектов: {objectList.length}</div>
          <div>• Планет: {planets.filter(p => p.type === 'planet').length}</div>
          <div>• Карликовых: {planets.filter(p => p.type === 'dwarf').length}</div>
          <div>• Спутников: {moons.length}</div>
          <div>• Астероидов: {asteroidBelt.length + kuiperBelt.length}</div>
        </div>
      </div>
    </div>
  );
}
