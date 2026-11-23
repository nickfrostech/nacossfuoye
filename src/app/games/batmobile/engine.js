// Three.js engine for Batmobile. Plain functions, no React, so the game loop never
// triggers a re-render. The React component only receives HUD snapshots and the final score.

import * as THREE from 'three';

const LANE_LIMIT = 5.2;
export const LIVES = 6;
export const AMMO_MAX = 3;
const RELOAD_S = 2;
const BASE_SPEED = 18;
const NITRO_SPEED = 30;
const NITRO_MAX = 100;
const NITRO_DRAIN = 26;
const NITRO_REGEN = 12;
const STEER_ACCEL = 42;
const BULLET_SPEED = 90;
const SPAWN_ENEMY_S = 1.1;
const SPAWN_GEM_S = 2.6;
const HUD_EVERY_S = 0.15;

const GEM_POINTS = 50;
const KILL_POINTS = 100;

const LANES = [-3.5, 0, 3.5];
const BUILDING_ROWS = 24;
const BUILDING_STEP = 18;
const MARK_STEP = 14;
const MARK_ROWS = 14;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Frame-rate independent smoothing: moves `current` toward `target` at a rate set by `dt`
const easeToward = (current, target, dt) => current + (target - current) * Math.min(1, dt * 6);

// Shared geometry and materials, created once so every car reuses them
const makeAssets = () => {
   const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
   return {
      geo: {
         unit: box(1, 1, 1),
         wheel: new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16),
         bigWheel: new THREE.CylinderGeometry(0.6, 0.6, 0.7, 16),
         gem: new THREE.OctahedronGeometry(0.5, 0),
         bullet: box(0.3, 0.15, 0.7),
         particle: box(0.2, 0.2, 0.2),
         mark: new THREE.PlaneGeometry(0.18, 4),
      },
      mat: {
         road: new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.4, metalness: 0.6 }),
         mark: new THREE.MeshBasicMaterial({ color: 0x555566 }),
         building: new THREE.MeshStandardMaterial({ color: 0x0c0c18, roughness: 0.8 }),
         paint: new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.3, metalness: 0.7 }),
         canopy: new THREE.MeshStandardMaterial({ color: 0x14162a, roughness: 0.2, metalness: 0.8 }),
         tyre: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
         headlight: new THREE.MeshBasicMaterial({ color: 0xffffcc }),
         tail: new THREE.MeshBasicMaterial({ color: 0xff2244 }),
         enemyRed: new THREE.MeshStandardMaterial({ color: 0x5a0a14, roughness: 0.2, metalness: 0.6 }),
         enemyBlue: new THREE.MeshStandardMaterial({ color: 0x101a33, roughness: 0.2, metalness: 0.6 }),
         gem: new THREE.MeshBasicMaterial({ color: 0x2de2ff }),
         bullet: new THREE.MeshBasicMaterial({ color: 0x66ccff }),
         windows: new THREE.MeshBasicMaterial({ color: 0xffe9a0 }),
      },
   };
};

const addPart = (group, geo, mat, x, y, z) => {
   const mesh = new THREE.Mesh(geo, mat);
   mesh.position.set(x, y, z);
   group.add(mesh);
   return mesh;
};

const makeBatmobile = (assets) => {
   const { geo, mat } = assets;
   const car = new THREE.Group();
   addPart(car, geo.unit, mat.paint, 0, 0.6, 0).scale.set(2.0, 0.6, 3.8);
   addPart(car, geo.unit, mat.paint, 0, 0.8, 0.5).scale.set(2.4, 0.4, 1.8);
   addPart(car, geo.unit, mat.paint, 1.4, 0.6, 1.2).scale.set(0.5, 0.2, 1.5);
   addPart(car, geo.unit, mat.paint, -1.4, 0.6, 1.2).scale.set(0.5, 0.2, 1.5);
   addPart(car, geo.unit, mat.canopy, 0, 1.15, -0.2).scale.set(1.5, 0.5, 1.4);
   addPart(car, geo.unit, mat.headlight, 0.8, 0.7, -1.95).scale.set(0.6, 0.12, 0.1);
   addPart(car, geo.unit, mat.headlight, -0.8, 0.7, -1.95).scale.set(0.6, 0.12, 0.1);
   const wheels = [
      addPart(car, geo.wheel, mat.tyre, 1.4, 0.45, 1.2),
      addPart(car, geo.wheel, mat.tyre, -1.4, 0.45, 1.2),
      addPart(car, geo.bigWheel, mat.tyre, 1.0, 0.6, -1.2),
      addPart(car, geo.bigWheel, mat.tyre, -1.0, 0.6, -1.2),
   ];
   wheels.forEach((w) => (w.rotation.z = Math.PI / 2));
   car.userData.wheels = wheels;
   return car;
};

const makeEnemy = (assets, colour) => {
   const { geo, mat } = assets;
   const car = new THREE.Group();
   addPart(car, geo.unit, colour, 0, 0.5, 0).scale.set(1.8, 0.5, 4.2);
   addPart(car, geo.unit, mat.canopy, 0, 1.0, -0.2).scale.set(1.6, 0.5, 2.2);
   addPart(car, geo.unit, mat.tail, 0.6, 0.7, -2.15).scale.set(0.4, 0.2, 0.1);
   addPart(car, geo.unit, mat.tail, -0.6, 0.7, -2.15).scale.set(0.4, 0.2, 0.1);
   const wheels = [
      addPart(car, geo.wheel, mat.tyre, 0.9, 0.35, 1.2),
      addPart(car, geo.wheel, mat.tyre, -0.9, 0.35, 1.2),
      addPart(car, geo.wheel, mat.tyre, 0.9, 0.35, -1.2),
      addPart(car, geo.wheel, mat.tyre, -0.9, 0.35, -1.2),
   ];
   wheels.forEach((w) => (w.rotation.z = Math.PI / 2));
   car.userData.wheels = wheels;
   return car;
};

/**
 * Starts the game on `canvas`. Returns controls for the React layer and a dispose() to stop it.
 * `onHud(snapshot)` is called a few times per second, and `onOver(score, runGems)` once at the end.
 */
export function createGame(canvas, { onHud, onOver }) {
   const assets = makeAssets();
   const { geo, mat } = assets;

   const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
   // 1.5 keeps phones smooth; anything sharper costs a lot of fill rate for little visible gain
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

   const scene = new THREE.Scene();
   scene.background = new THREE.Color(0x03030a);
   scene.fog = new THREE.FogExp2(0x03030a, 0.012);

   const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 400);
   camera.position.set(0, 4, 9);

   scene.add(new THREE.AmbientLight(0x6666aa, 1.2));
   const sun = new THREE.DirectionalLight(0xffffff, 1.2);
   sun.position.set(5, 20, 10);
   scene.add(sun);

   const road = new THREE.Mesh(new THREE.PlaneGeometry(26, 400), mat.road);
   road.rotation.x = -Math.PI / 2;
   road.position.z = -120;
   scene.add(road);

   const marks = [];
   for (const x of [-5.25, -1.75, 1.75, 5.25]) {
      for (let i = 0; i < MARK_ROWS; i++) {
         const mark = new THREE.Mesh(geo.mark, mat.mark);
         mark.rotation.x = -Math.PI / 2;
         mark.position.set(x, 0.01, -i * MARK_STEP);
         scene.add(mark);
         marks.push(mark);
      }
   }

   const buildings = [];
   for (let i = 0; i < BUILDING_ROWS; i++) {
      for (const side of [-1, 1]) {
         const height = 18 + Math.random() * 40;
         const building = new THREE.Mesh(geo.unit, mat.building);
         building.scale.set(8 + Math.random() * 4, height, 8);
         building.position.set(side * (16 + Math.random() * 4), height / 2, -i * BUILDING_STEP);
         scene.add(building);
         buildings.push(building);
      }
   }

   const player = makeBatmobile(assets);
   scene.add(player);

   const enemies = [];
   const gems = [];
   const bullets = [];
   const particles = [];

   const state = {
      x: 0,
      vx: 0,
      speed: BASE_SPEED,
      nitro: NITRO_MAX,
      lives: LIVES,
      ammo: AMMO_MAX,
      reloadT: 0,
      distance: 0,
      kills: 0,
      gems: 0,
      invulnerable: 0,
      shake: 0,
      over: false,
      spawnEnemyT: 0,
      spawnGemT: 0,
      hudT: 0,
   };
   const keys = { left: false, right: false, nitro: false };

   const explode = (x, y, z, colour, count = 14) => {
      const material = new THREE.MeshBasicMaterial({ color: colour });
      for (let i = 0; i < count; i++) {
         const piece = new THREE.Mesh(geo.particle, material);
         piece.position.set(x, y, z);
         piece.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 4 + 1, (Math.random() - 0.5) * 6);
         piece.userData.life = 0.8;
         scene.add(piece);
         particles.push(piece);
      }
   };

   const remove = (list, index) => {
      scene.remove(list[index].mesh ?? list[index]);
      list.splice(index, 1);
   };

   const spawnEnemy = () => {
      const car = makeEnemy(assets, Math.random() > 0.5 ? mat.enemyRed : mat.enemyBlue);
      car.position.set(LANES[Math.floor(Math.random() * LANES.length)], 0, -170);
      scene.add(car);
      // how much slower than the player this car drives, as a share of the road speed
      enemies.push({ mesh: car, ratio: 0.45 + Math.random() * 0.35 });
   };

   const spawnGemRow = () => {
      const x = LANES[Math.floor(Math.random() * LANES.length)];
      for (let i = 0; i < 4; i++) {
         const gem = new THREE.Mesh(geo.gem, mat.gem);
         gem.position.set(x, 0.8, -150 - i * 6);
         scene.add(gem);
         gems.push({ mesh: gem });
      }
   };

   const endRun = () => {
      state.over = true;
      const score = Math.floor(state.distance / 10) + state.kills * KILL_POINTS + state.gems * GEM_POINTS;
      onOver(score, state.gems);
   };

   const update = (dt) => {
      const playing = !state.over;
      const steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      state.vx += steer * STEER_ACCEL * dt;
      state.vx *= Math.exp(-5 * dt);
      state.x = clamp(state.x + state.vx * dt, -LANE_LIMIT, LANE_LIMIT);

      const boosting = playing && keys.nitro && state.nitro > 0;
      const target = BASE_SPEED + Math.min(8, state.distance / 500) + (boosting ? NITRO_SPEED - BASE_SPEED : 0);
      state.speed += (target - state.speed) * Math.min(1, dt * 4);
      state.nitro = clamp(state.nitro + (boosting ? -NITRO_DRAIN : NITRO_REGEN) * dt, 0, NITRO_MAX);

      const scroll = playing ? state.speed : 0;
      const move = scroll * dt;
      if (playing) state.distance += move;

      marks.forEach((m) => {
         m.position.z += move;
         if (m.position.z > 4) m.position.z -= MARK_STEP * MARK_ROWS;
      });
      buildings.forEach((b) => {
         b.position.z += move;
         if (b.position.z > 12) b.position.z -= BUILDING_STEP * BUILDING_ROWS;
      });

      player.position.x = state.x;
      player.rotation.z = -state.vx * 0.03;
      player.rotation.y = -state.vx * 0.015;
      player.userData.wheels.forEach((w) => (w.rotation.x += scroll * dt * 2));

      if (playing) {
         state.spawnEnemyT += dt;
         if (state.spawnEnemyT >= SPAWN_ENEMY_S) {
            state.spawnEnemyT = 0;
            spawnEnemy();
         }
         state.spawnGemT += dt;
         if (state.spawnGemT >= SPAWN_GEM_S) {
            state.spawnGemT = 0;
            spawnGemRow();
         }
      }

      if (state.reloadT >= 0 && state.ammo < AMMO_MAX) {
         state.reloadT += dt;
         if (state.reloadT >= RELOAD_S) {
            state.ammo += 1;
            state.reloadT = state.ammo < AMMO_MAX ? 0 : -1;
         }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
         const enemy = enemies[i];
         enemy.mesh.position.z += scroll * (1 - enemy.ratio) * dt;
         enemy.mesh.userData.wheels.forEach((w) => (w.rotation.x += scroll * dt * 2));
         if (enemy.mesh.position.z > 10) {
            remove(enemies, i);
            continue;
         }
         const hit =
            playing &&
            state.invulnerable <= 0 &&
            Math.abs(enemy.mesh.position.z) < 3.4 &&
            Math.abs(enemy.mesh.position.x - state.x) < 1.7;
         if (hit) {
            explode(enemy.mesh.position.x, 0.8, enemy.mesh.position.z, 0xff3355, 18);
            remove(enemies, i);
            state.lives -= 1;
            state.invulnerable = 1;
            state.shake = 0.8;
            state.speed *= 0.6;
            if (state.lives <= 0) endRun();
         }
      }

      for (let i = gems.length - 1; i >= 0; i--) {
         const gem = gems[i];
         gem.mesh.position.z += move;
         gem.mesh.rotation.y += dt * 3;
         if (gem.mesh.position.z > 8) {
            remove(gems, i);
            continue;
         }
         if (playing && Math.abs(gem.mesh.position.z) < 2.2 && Math.abs(gem.mesh.position.x - state.x) < 1.6) {
            explode(gem.mesh.position.x, 0.8, gem.mesh.position.z, 0x2de2ff, 8);
            remove(gems, i);
            state.gems += 1;
         }
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
         const bullet = bullets[i];
         bullet.mesh.position.z -= BULLET_SPEED * dt;
         let spent = bullet.mesh.position.z < -200;
         for (let j = enemies.length - 1; j >= 0 && !spent; j--) {
            const enemy = enemies[j];
            if (Math.abs(enemy.mesh.position.z - bullet.mesh.position.z) < 2.6 && Math.abs(enemy.mesh.position.x - bullet.mesh.position.x) < 1.6) {
               explode(enemy.mesh.position.x, 0.8, enemy.mesh.position.z, 0xff9933, 20);
               remove(enemies, j);
               state.kills += 1;
               spent = true;
            }
         }
         if (spent) remove(bullets, i);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
         const piece = particles[i];
         piece.userData.life -= dt;
         piece.userData.vel.y -= 9 * dt;
         piece.position.addScaledVector(piece.userData.vel, dt);
         piece.rotation.x += dt * 8;
         if (piece.userData.life <= 0) remove(particles, i);
      }

      state.invulnerable = Math.max(0, state.invulnerable - dt);
      state.shake *= Math.exp(-8 * dt);
      const shakeX = (Math.random() - 0.5) * state.shake;
      const shakeY = (Math.random() - 0.5) * state.shake;
      camera.position.x = easeToward(camera.position.x, state.x * 0.4 + shakeX, dt);
      camera.position.y = easeToward(camera.position.y, 4 + shakeY, dt);
      camera.position.z = easeToward(camera.position.z, 9 + state.speed * 0.05, dt);
      camera.lookAt(state.x * 0.1, 0, -20);

      state.hudT += dt;
      if (state.hudT >= HUD_EVERY_S) {
         state.hudT = 0;
         onHud({
            distance: Math.floor(state.distance / 10),
            lives: state.lives,
            ammo: state.ammo,
            nitro: state.nitro,
            speed: Math.round(state.speed * 6),
            kills: state.kills,
            gems: state.gems,
            over: state.over,
         });
      }
   };

   const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // narrow phone screens get a wider lens so the three lanes stay visible
      camera.fov = camera.aspect < 0.8 ? 80 : 65;
      camera.updateProjectionMatrix();
   };

   let last = performance.now();
   // setAnimationLoop lets three.js pick the right timing for the device and pauses in hidden tabs
   renderer.setAnimationLoop((now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      renderer.render(scene, camera);
   });

   resize();
   window.addEventListener('resize', resize);

   return {
      setKey(name, down) {
         if (name in keys) keys[name] = down;
      },
      releaseKeys() {
         keys.left = false;
         keys.right = false;
         keys.nitro = false;
      },
      fire() {
         if (state.over || state.ammo <= 0) return;
         state.ammo -= 1;
         if (state.reloadT < 0 || state.ammo === AMMO_MAX - 1) state.reloadT = 0;
         const bullet = new THREE.Mesh(geo.bullet, mat.bullet);
         bullet.position.set(state.x, 0.8, -1.5);
         scene.add(bullet);
         bullets.push({ mesh: bullet });
      },
      dispose() {
         renderer.setAnimationLoop(null);
         window.removeEventListener('resize', resize);
         renderer.dispose();
      },
   };
}
