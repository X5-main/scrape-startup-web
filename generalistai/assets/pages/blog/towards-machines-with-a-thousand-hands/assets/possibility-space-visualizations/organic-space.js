(function (global) {
  "use strict";

  const DEFAULTS = {
    theme: "dark",
    simulationSpeed: 0.35,
    compositionScale: 1,
    interactive: false,
    pixelDensity: Math.min(global.devicePixelRatio || 1, 2),
  };

  const CONFIG = {
    baseCanvasSize: 550,
    sphereSize: 486,
    sphereHalf: 243,
    boundaryMargin: 7,
    sphereGridWeight: 1.15,
    backLineAlpha: 58,
    frontLineAlpha: 235,
    latitudeLines: 5,
    longitudeLines: 10,
    lineSegments: 52,

    viewTiltX: radians(14),
    viewTiltY: radians(-24),
    viewSwayX: radians(4),
    viewSwayY: radians(13),
    viewSwaySpeed: 0.004,

    gridSubdivisions: 125,
    maxLiveCells: 1000,
    maxActiveTips: 90,
    tipLifespanMin: 45,
    tipLifespanMax: 220,
    tipRespawnInterval: 8,
    tipRespawnMin: 4,
    tipRespawnMax: 14,
    tipTurnAmount: 0.16,
    tipOutwardBias: 0.08,
    tipSplitChance: 0.04,
    tipDeathChance: 0.006,
    tipNeighborCandidates: 10,
    tipHeadingScore: 1.35,
    tipDirectionRandomness: 0.38,
    tipDiagonalPenalty: 0.18,
    primaryTipCountMin: 7,
    primaryTipCountMax: 28,
    seedScatterMin: 12,
    seedScatterMax: 32,
    respawnHeadingMemory: 0.62,
    respawnOutwardBias: 0.22,
    respawnRandomness: 0.46,

    extinctionInterval: 12,
    extinctionChance: 0.96,
    extinctionTargetMin: 35,
    extinctionTargetMax: 260,
    extinctionRadiusMin: 5,
    extinctionRadiusMax: 22,
    extinctionFadeMin: 35,
    extinctionFadeMax: 95,

    warmStartFramesMin: 170,
    warmStartFramesMax: 250,
    voxelPopFrames: 10,
    voxelPulseAmount: 0.16,
    voxelPulseSpeed: 0.055,
    voxelAlphaPulse: 0.1,
    voxelPointSize: 2.45,
    lightModePointSizeMultiplier: 1.4,
    lightModeSaturationMultiplier: 1.75,
    lightModeValueMultiplier: 1.2,
  };

  const EARTH_COLORS = [
    "#398346", "#398346", "#398346", "#398346",
    "#5B9F36", "#5B9F36", "#5B9F36",
    "#839941", "#839941",
    "#93A579",
    "#2D6F90", "#2D6F90", "#2D6F90", "#2D6F90",
    "#4484A8", "#4484A8", "#4484A8",
    "#607D96", "#607D96",
    "#478579",
    "#C78A85", "#C78A85", "#C78A85",
    "#8C5F3E", "#8C5F3E", "#8C5F3E",
    "#CEA561", "#CEA561", "#CEA561",
    "#C58932", "#C58932",
    "#B35C3D", "#B35C3D",
    "#C07463",
  ].map(hexToRgb);
  const LIGHT_MODE_COLOR_CACHE = new WeakMap();

  class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    copy() {
      return new Vec3(this.x, this.y, this.z);
    }

    add(other) {
      this.x += other.x;
      this.y += other.y;
      this.z += other.z;
      return this;
    }

    subtract(other) {
      this.x -= other.x;
      this.y -= other.y;
      this.z -= other.z;
      return this;
    }

    multiply(amount) {
      this.x *= amount;
      this.y *= amount;
      this.z *= amount;
      return this;
    }

    magnitudeSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    magnitude() {
      return Math.sqrt(this.magnitudeSquared());
    }

    normalize() {
      const magnitude = this.magnitude();
      if (magnitude < 0.0001) {
        this.x = 1;
        this.y = 0;
        this.z = 0;
      } else {
        this.multiply(1 / magnitude);
      }
      return this;
    }

    static dot(a, b) {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }
  }

  class OrganicCell {
    constructor(x, y, z, order, birthFrame, heading, branchColor) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.order = order;
      this.birthFrame = birthFrame;
      this.heading = heading.copy();
      this.branchColor = branchColor;
      this.extinctionFrame = -1;
      this.extinctionFadeFrames = 1;
    }

    get key() {
      return gridKey(this.x, this.y, this.z);
    }

    get isExtinct() {
      return this.extinctionFrame >= 0;
    }

    markExtinct(simFrame) {
      this.extinctionFrame = simFrame;
      this.extinctionFadeFrames = randomInt(
        CONFIG.extinctionFadeMin,
        CONFIG.extinctionFadeMax,
      );
    }

    isGone(simFrame) {
      return this.isExtinct &&
        simFrame > this.extinctionFrame + this.extinctionFadeFrames;
    }
  }

  class OrganicTip {
    constructor(x, y, z, heading, branchColor) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.age = 0;
      this.maxAge = randomInt(
        CONFIG.tipLifespanMin,
        CONFIG.tipLifespanMax,
      );
      this.heading = heading.copy().normalize();
      this.branchColor = branchColor;
      this.dead = false;
    }

    step(system, simFrame) {
      if (this.dead) return;
      this.age += 1;

      if (this.age > this.maxAge ||
          Math.random() < CONFIG.tipDeathChance) {
        this.dead = true;
        return;
      }

      if (system.liveCellCount >= CONFIG.maxLiveCells) {
        system.triggerExtinction(simFrame);
        return;
      }

      const outward = system
        .outwardVector(this.x, this.y, this.z)
        .multiply(CONFIG.tipOutwardBias);
      const turn = randomUnitVector().multiply(CONFIG.tipTurnAmount);
      this.heading.add(outward).add(turn).normalize();

      const [dx, dy, dz] = system.neighborOffset(
        this.x,
        this.y,
        this.z,
        this.heading,
      );
      const nx = this.x + dx;
      const ny = this.y + dy;
      const nz = this.z + dz;

      if (!system.insideBoundary(nx, ny, nz) ||
          system.occupied.has(gridKey(nx, ny, nz))) {
        if (!this.trySidestep(system, simFrame)) this.dead = true;
        return;
      }

      system.addCell(
        nx,
        ny,
        nz,
        this.heading,
        this.branchColor,
        simFrame,
      );
      this.x = nx;
      this.y = ny;
      this.z = nz;

      if (system.tips.length < CONFIG.maxActiveTips &&
          Math.random() < CONFIG.tipSplitChance) {
        const splitHeading = this.heading
          .copy()
          .add(randomUnitVector().multiply(random(0.35, 0.75)))
          .normalize();
        const splitColor = Math.random() < 0.86
          ? this.branchColor
          : system.randomEarthColor();
        system.tips.push(
          new OrganicTip(
            this.x,
            this.y,
            this.z,
            splitHeading,
            splitColor,
          ),
        );
      }
    }

    trySidestep(system, simFrame) {
      for (let i = 0; i < CONFIG.tipNeighborCandidates; i += 1) {
        const sidestepHeading = this.heading
          .copy()
          .add(randomUnitVector().multiply(random(0.25, 1.15)))
          .normalize();
        const [dx, dy, dz] = system.neighborOffset(
          this.x,
          this.y,
          this.z,
          sidestepHeading,
        );
        const nx = this.x + dx;
        const ny = this.y + dy;
        const nz = this.z + dz;

        if (system.insideBoundary(nx, ny, nz) &&
            !system.occupied.has(gridKey(nx, ny, nz))) {
          this.heading = sidestepHeading;
          system.addCell(
            nx,
            ny,
            nz,
            this.heading,
            this.branchColor,
            simFrame,
          );
          this.x = nx;
          this.y = ny;
          this.z = nz;
          return true;
        }
      }
      return false;
    }
  }

  class OrganicGrowthSystem {
    constructor() {
      this.cells = [];
      this.tips = [];
      this.occupied = new Set();
      this.liveCellCount = 0;
      this.nextOrder = 0;
      this.lastRespawnFrame = -1;
      this.lastExtinctionCheckFrame = -1;
      this.seedPrimaryTips(0);
    }

    update(simFrame) {
      this.removeDeadCells(simFrame);

      if (this.tips.length === 0 ||
          (simFrame % CONFIG.tipRespawnInterval === 0 &&
           simFrame !== this.lastRespawnFrame &&
           this.tips.length < CONFIG.maxActiveTips)) {
        this.respawnTips();
        this.lastRespawnFrame = simFrame;
      }

      const initialTipCount = this.tips.length;
      for (let i = initialTipCount - 1; i >= 0; i -= 1) {
        const tip = this.tips[i];
        tip.step(this, simFrame);
        if (tip.dead) this.tips.splice(i, 1);
      }

      if (simFrame % CONFIG.extinctionInterval === 0 &&
          simFrame !== this.lastExtinctionCheckFrame) {
        if (Math.random() < CONFIG.extinctionChance) {
          this.triggerExtinction(simFrame);
        }
        this.lastExtinctionCheckFrame = simFrame;
      }
    }

    seedPrimaryTips(simFrame) {
      const count = randomInt(
        CONFIG.primaryTipCountMin,
        CONFIG.primaryTipCountMax,
      );
      const center = Math.floor(CONFIG.gridSubdivisions / 2);

      for (let i = 0; i < count; i += 1) {
        for (let attempt = 0; attempt < 30; attempt += 1) {
          const offset = randomUnitVector();
          const radius = randomInt(
            CONFIG.seedScatterMin,
            CONFIG.seedScatterMax,
          );
          const heading = this.seedHeading(offset);
          const x = center + Math.round(offset.x * radius);
          const y = center + Math.round(offset.y * radius);
          const z = center + Math.round(offset.z * radius);
          const branchColor = this.randomEarthColor();
          const cell = this.addCell(
            x,
            y,
            z,
            heading,
            branchColor,
            simFrame,
          );
          if (cell) {
            this.tips.push(
              new OrganicTip(x, y, z, heading, branchColor),
            );
            break;
          }
        }
      }
    }

    seedHeading(outward) {
      outward = outward.copy().normalize();
      let tangent = randomUnitVector();
      const projection = outward
        .copy()
        .multiply(Vec3.dot(tangent, outward));
      tangent.subtract(projection);
      if (tangent.magnitudeSquared() < 0.001) {
        tangent = randomUnitVector();
      }
      tangent.normalize().multiply(random(0.55, 0.88));
      tangent.add(
        outward.copy().multiply(random(0.12, 0.34)),
      );
      return tangent.normalize();
    }

    respawnTips() {
      const count = randomInt(
        CONFIG.tipRespawnMin,
        CONFIG.tipRespawnMax,
      );
      for (let i = 0;
        i < count && this.tips.length < CONFIG.maxActiveTips;
        i += 1) {
        const cell = this.pickOuterLiveCell();
        if (!cell) continue;
        this.tips.push(
          new OrganicTip(
            cell.x,
            cell.y,
            cell.z,
            this.respawnHeading(cell),
            cell.branchColor,
          ),
        );
      }
    }

    respawnHeading(cell) {
      const heading = cell.heading
        .copy()
        .multiply(CONFIG.respawnHeadingMemory);
      const outward = this
        .outwardVector(cell.x, cell.y, cell.z)
        .multiply(CONFIG.respawnOutwardBias);
      const randomBend = randomUnitVector().multiply(
        random(0.02, CONFIG.respawnRandomness),
      );
      return heading.add(outward).add(randomBend).normalize();
    }

    randomEarthColor() {
      return EARTH_COLORS[randomInt(0, EARTH_COLORS.length - 1)];
    }

    addCell(x, y, z, heading, branchColor, simFrame) {
      if (!this.insideBoundary(x, y, z)) return null;
      const key = gridKey(x, y, z);
      if (this.occupied.has(key)) return null;

      const cell = new OrganicCell(
        x,
        y,
        z,
        this.nextOrder,
        simFrame,
        heading,
        branchColor,
      );
      this.nextOrder += 1;
      this.cells.push(cell);
      this.occupied.add(key);
      this.liveCellCount += 1;
      return cell;
    }

    insideBoundary(x, y, z) {
      const padding = 2;
      const size = CONFIG.gridSubdivisions;
      if (x < padding || x >= size - padding ||
          y < padding || y >= size - padding ||
          z < padding || z >= size - padding) return false;

      const center = (size - 1) * 0.5;
      const radius = center - padding;
      const dx = x - center;
      const dy = y - center;
      const dz = z - center;
      return dx * dx + dy * dy + dz * dz <= radius * radius;
    }

    neighborOffset(x, y, z, heading) {
      const outward = this.outwardVector(x, y, z);
      let best = [1, 0, 0];
      let bestScore = -Infinity;

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            if (dx === 0 && dy === 0 && dz === 0) continue;
            const direction = new Vec3(dx, dy, dz).normalize();
            const diagonalPenalty =
              Math.abs(dx) + Math.abs(dy) + Math.abs(dz) === 3
                ? CONFIG.tipDiagonalPenalty
                : 0;
            const score =
              Vec3.dot(direction, heading) * CONFIG.tipHeadingScore +
              Vec3.dot(direction, outward) * CONFIG.tipOutwardBias +
              random(
                -CONFIG.tipDirectionRandomness,
                CONFIG.tipDirectionRandomness,
              ) -
              diagonalPenalty;
            if (score > bestScore) {
              bestScore = score;
              best = [dx, dy, dz];
            }
          }
        }
      }
      return best;
    }

    outwardVector(x, y, z) {
      const center = (CONFIG.gridSubdivisions - 1) * 0.5;
      const outward = new Vec3(x - center, y - center, z - center);
      return outward.magnitudeSquared() < 0.001
        ? randomUnitVector()
        : outward.normalize();
    }

    pickOuterLiveCell() {
      if (this.liveCellCount === 0 || this.cells.length === 0) return null;
      let best = null;
      let bestDistance = -1;
      const center = (CONFIG.gridSubdivisions - 1) * 0.5;

      for (let i = 0; i < 32; i += 1) {
        const candidate = this.cells[
          randomInt(0, this.cells.length - 1)
        ];
        if (candidate.isExtinct) continue;
        const dx = candidate.x - center;
        const dy = candidate.y - center;
        const dz = candidate.z - center;
        const distance = dx * dx + dy * dy + dz * dz;
        if (distance > bestDistance) {
          best = candidate;
          bestDistance = distance;
        }
      }

      return best || this.cells.find((cell) => !cell.isExtinct) || null;
    }

    triggerExtinction(simFrame) {
      const seed = this.pickOuterLiveCell();
      if (!seed) return;
      const target = randomInt(
        CONFIG.extinctionTargetMin,
        CONFIG.extinctionTargetMax,
      );
      const radius = randomInt(
        CONFIG.extinctionRadiusMin,
        CONFIG.extinctionRadiusMax,
      );
      const radiusSquared = radius * radius;
      let marked = 0;

      for (const cell of this.cells) {
        if (marked >= target) break;
        if (cell.isExtinct) continue;
        const dx = cell.x - seed.x;
        const dy = cell.y - seed.y;
        const dz = cell.z - seed.z;
        if (dx * dx + dy * dy + dz * dz <= radiusSquared) {
          this.markCellExtinct(cell, simFrame);
          marked += 1;
        }
      }

      let attempts = 0;
      while (marked < target && attempts < this.cells.length * 2) {
        const cell = this.cells[randomInt(0, this.cells.length - 1)];
        if (!cell.isExtinct) {
          this.markCellExtinct(cell, simFrame);
          marked += 1;
        }
        attempts += 1;
      }
    }

    markCellExtinct(cell, simFrame) {
      cell.markExtinct(simFrame);
      this.liveCellCount -= 1;
    }

    removeDeadCells(simFrame) {
      for (let i = this.cells.length - 1; i >= 0; i -= 1) {
        const cell = this.cells[i];
        if (cell.isGone(simFrame)) {
          this.occupied.delete(cell.key);
          this.cells.splice(i, 1);
        }
      }
      if (this.cells.length === 0) {
        this.tips.length = 0;
        this.seedPrimaryTips(simFrame);
      }
    }
  }

  function createOrganicSpace(containerOrSelector, userOptions = {}) {
    requireP5();
    const container = resolveContainer(containerOrSelector);
    const options = { ...DEFAULTS, ...userOptions };
    let theme = normalizeTheme(options.theme);
    container.dataset.theme = theme;
    let simulationSpeed = nonNegative(options.simulationSpeed, 0.35);
    let compositionScale = positive(options.compositionScale, 1);
    let paused = false;
    let growth;
    let simFrame = 0;
    let simulationAccumulator = 0;
    let viewPhase = 0;
    let resizeObserver;

    const sketch = (p) => {
      p.setup = () => {
        const size = containerSize(container);
        const canvas = p.createCanvas(size.width, size.height, p.WEBGL);
        canvas.parent(container);
        canvas.elt.style.display = "block";
        canvas.elt.setAttribute(
          "aria-label",
          "Animated organic possibility space",
        );
        p.pixelDensity(options.pixelDensity);
        p.frameRate(60);
        reset();

        resizeObserver = new ResizeObserver(() => {
          const next = containerSize(container);
          if (next.width !== p.width || next.height !== p.height) {
            p.resizeCanvas(next.width, next.height);
          }
        });
        resizeObserver.observe(container);
      };

      p.draw = () => {
        const resolvedTheme = resolveTheme(theme);
        p.background(resolvedTheme === "light" ? 255 : 0);

        if (!paused) {
          updateSimulation();
          viewPhase += CONFIG.viewSwaySpeed;
        }

        const scale = sceneScale(
          p.width,
          p.height,
          compositionScale,
        );
        p.push();
        p.ortho(
          -p.width * 0.5,
          p.width * 0.5,
          -p.height * 0.5,
          p.height * 0.5,
          -5000,
          5000,
        );
        p.scale(scale);

        drawSphereGrid(p, true, resolvedTheme, scale);
        p.push();
        const tiltX = CONFIG.viewTiltX +
          Math.sin(viewPhase * 0.73) * CONFIG.viewSwayX;
        const tiltY = CONFIG.viewTiltY +
          Math.sin(viewPhase) * CONFIG.viewSwayY;
        p.rotateX(tiltX);
        p.rotateY(tiltY);
        drawVoxels(
          p,
          growth,
          simFrame + simulationAccumulator,
          scale,
          resolvedTheme,
        );
        p.pop();
        drawSphereGrid(p, false, resolvedTheme, scale);
        p.pop();
      };

      p.keyPressed = () => {
        if (!options.interactive) return;
        if (p.key === " ") {
          paused = !paused;
          return false;
        }
        if (p.key === "r" || p.key === "R") reset();
      };

      function updateSimulation() {
        simulationAccumulator += simulationSpeed;
        while (simulationAccumulator >= 1) {
          simFrame += 1;
          growth.update(simFrame);
          simulationAccumulator -= 1;
        }
      }

      function reset() {
        simFrame = 0;
        simulationAccumulator = 0;
        viewPhase = 0;
        growth = new OrganicGrowthSystem();
        const warmupFrames = randomInt(
          CONFIG.warmStartFramesMin,
          CONFIG.warmStartFramesMax,
        );
        for (let i = 0; i < warmupFrames; i += 1) {
          simFrame += 1;
          growth.update(simFrame);
        }
      }

      p._organicReset = reset;
    };

    const instance = new global.p5(sketch, container);
    return {
      pause() {
        paused = true;
        instance.noLoop();
      },
      play() {
        paused = false;
        instance.loop();
      },
      toggle() {
        if (paused) {
          paused = false;
          instance.loop();
        } else {
          paused = true;
          instance.noLoop();
        }
        return paused;
      },
      reset() {
        instance._organicReset?.();
      },
      setTheme(value) {
        theme = normalizeTheme(value);
        container.dataset.theme = theme;
      },
      setSpeed(value) {
        simulationSpeed = nonNegative(value, simulationSpeed);
      },
      setScale(value) {
        compositionScale = positive(value, compositionScale);
      },
      getState() {
        return {
          paused,
          theme,
          simulationSpeed,
          compositionScale,
          simFrame,
          liveCells: growth?.liveCellCount || 0,
        };
      },
      destroy() {
        resizeObserver?.disconnect();
        instance.remove();
        const registry = global.organicSpaces;
        const index = registry?.indexOf(container.organicSpace) ?? -1;
        if (index >= 0) registry.splice(index, 1);
        delete container.dataset.organicSpaceMounted;
        delete container.organicSpace;
      },
      p5: instance,
    };
  }

  function drawVoxels(p, growth, simFrame, scale, theme) {
    const groups = new Map();

    for (const cell of growth.cells) {
      const alpha = cellAlpha(cell, simFrame);
      if (alpha <= 0) continue;
      const pop = smoothStep(clamp(
        (simFrame - cell.birthFrame) / CONFIG.voxelPopFrames,
        0,
        1,
      ));
      const phase =
        cell.order * 0.071 +
        cell.x * 0.013 +
        cell.y * 0.017 +
        cell.z * 0.011;
      const pulse =
        0.5 +
        0.5 * Math.sin(simFrame * CONFIG.voxelPulseSpeed + phase);
      const drawAlpha =
        alpha * lerp(1 - CONFIG.voxelAlphaPulse, 1, pulse);
      const size =
        CONFIG.voxelPointSize *
        (theme === "light" ? CONFIG.lightModePointSizeMultiplier : 1) *
        pop *
        lerp(1 - CONFIG.voxelPulseAmount, 1, pulse) *
        scale;
      const position = gridToLocal(cell.x, cell.y, cell.z);
      const color = theme === "light"
        ? lightModeColor(cell.branchColor)
        : cell.branchColor;
      const group = pointGroup(color, drawAlpha, size);
      const existing = groups.get(group.key);
      if (existing) existing.positions.push(position);
      else groups.set(group.key, { ...group, positions: [position] });
    }

    p.push();
    p.noFill();
    for (const group of groups.values()) {
      p.stroke(group.r, group.g, group.b, group.a);
      p.strokeWeight(group.size);
      p.beginShape(p.POINTS);
      for (const position of group.positions) {
        p.vertex(position.x, position.y, position.z);
      }
      p.endShape();
    }
    p.pop();
  }

  function drawSphereGrid(p, drawBack, theme, scale) {
    const gl = p.drawingContext;
    gl.disable(gl.DEPTH_TEST);
    const lineColor = theme === "light" ? 0 : 255;
    p.push();
    p.noFill();
    p.strokeWeight(CONFIG.sphereGridWeight * scale);

    for (let ring = 1; ring <= CONFIG.latitudeLines; ring += 1) {
      const latitude = map(
        ring,
        0,
        CONFIG.latitudeLines + 1,
        -Math.PI * 0.5,
        Math.PI * 0.5,
      );
      const ringRadius = Math.cos(latitude) * CONFIG.sphereHalf;
      const y = Math.sin(latitude) * CONFIG.sphereHalf;
      for (let segment = 0; segment < CONFIG.lineSegments; segment += 1) {
        const a0 = Math.PI * 2 * segment / CONFIG.lineSegments;
        const a1 = Math.PI * 2 * (segment + 1) / CONFIG.lineSegments;
        drawSphereSegment(
          p,
          new Vec3(
            Math.cos(a0) * ringRadius,
            y,
            Math.sin(a0) * ringRadius,
          ),
          new Vec3(
            Math.cos(a1) * ringRadius,
            y,
            Math.sin(a1) * ringRadius,
          ),
          drawBack,
          lineColor,
        );
      }
    }

    for (let longitude = 0;
      longitude < CONFIG.longitudeLines;
      longitude += 1) {
      const angle = Math.PI * 2 * longitude / CONFIG.longitudeLines;
      for (let segment = 0; segment < CONFIG.lineSegments; segment += 1) {
        const lat0 = map(
          segment,
          0,
          CONFIG.lineSegments,
          -Math.PI * 0.5,
          Math.PI * 0.5,
        );
        const lat1 = map(
          segment + 1,
          0,
          CONFIG.lineSegments,
          -Math.PI * 0.5,
          Math.PI * 0.5,
        );
        drawSphereSegment(
          p,
          spherePoint(lat0, angle),
          spherePoint(lat1, angle),
          drawBack,
          lineColor,
        );
      }
    }

    p.pop();
    gl.enable(gl.DEPTH_TEST);
  }

  function drawSphereSegment(p, a, b, drawBack, lineColor) {
    const back = (a.z + b.z) * 0.5 < 0;
    if (back !== drawBack) return;
    p.stroke(
      lineColor,
      back ? CONFIG.backLineAlpha : CONFIG.frontLineAlpha,
    );
    p.line(a.x, a.y, a.z, b.x, b.y, b.z);
  }

  function spherePoint(latitude, longitude) {
    const radius = Math.cos(latitude) * CONFIG.sphereHalf;
    return new Vec3(
      Math.cos(longitude) * radius,
      Math.sin(latitude) * CONFIG.sphereHalf,
      Math.sin(longitude) * radius,
    );
  }

  function gridToLocal(x, y, z) {
    const min = -CONFIG.sphereHalf + CONFIG.boundaryMargin;
    const max = CONFIG.sphereHalf - CONFIG.boundaryMargin;
    const denominator = CONFIG.gridSubdivisions - 1;
    return new Vec3(
      lerp(min, max, x / denominator),
      lerp(max, min, y / denominator),
      lerp(min, max, z / denominator),
    );
  }

  function cellAlpha(cell, simFrame) {
    if (!cell.isExtinct) return 255;
    const fade = clamp(
      (simFrame - cell.extinctionFrame) / cell.extinctionFadeFrames,
      0,
      1,
    );
    return lerp(255, 0, smoothStep(fade));
  }

  function pointGroup(color, alpha, size) {
    const a = quantize(alpha, 32);
    const s = Math.max(0.25, quantize(size, 0.25));
    return {
      key: `${color.r}:${color.g}:${color.b}:${a}:${s}`,
      r: color.r,
      g: color.g,
      b: color.b,
      a,
      size: s,
    };
  }

  function lightModeColor(color) {
    const cached = LIGHT_MODE_COLOR_CACHE.get(color);
    if (cached) return cached;

    const maximum = Math.max(color.r, color.g, color.b);
    const minimum = Math.min(color.r, color.g, color.b);
    const range = maximum - minimum;
    const saturation = maximum > 0 ? range / maximum : 0;
    const adjustedMaximum =
      maximum * CONFIG.lightModeValueMultiplier;
    const adjustedSaturation = Math.min(
      1,
      saturation * CONFIG.lightModeSaturationMultiplier,
    );
    const adjustedMinimum =
      adjustedMaximum * (1 - adjustedSaturation);

    const adjustChannel = (channel) => {
      const position = range > 0 ? (channel - minimum) / range : 0;
      return Math.round(
        adjustedMinimum +
        position * (adjustedMaximum - adjustedMinimum),
      );
    };
    const adjusted = {
      r: adjustChannel(color.r),
      g: adjustChannel(color.g),
      b: adjustChannel(color.b),
    };
    LIGHT_MODE_COLOR_CACHE.set(color, adjusted);
    return adjusted;
  }

  function sceneScale(width, height, compositionScale) {
    return Math.min(width, height) /
      CONFIG.baseCanvasSize *
      compositionScale;
  }

  function normalizeTheme(value) {
    const theme = String(value || "dark").toLowerCase();
    return ["dark", "light", "auto"].includes(theme) ? theme : "dark";
  }

  function resolveTheme(theme) {
    if (theme !== "auto") return theme;
    return global.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function resolveContainer(value) {
    const container = typeof value === "string"
      ? document.querySelector(value)
      : value;
    if (!container) throw new Error("Organic Space container was not found.");
    return container;
  }

  function requireP5() {
    if (typeof global.p5 !== "function") {
      throw new Error("Organic Space requires p5.js.");
    }
  }

  function containerSize(container) {
    return {
      width: Math.max(1, Math.round(container.clientWidth || 550)),
      height: Math.max(1, Math.round(container.clientHeight || 550)),
    };
  }

  function gridKey(x, y, z) {
    return `${x}:${y}:${z}`;
  }

  function randomUnitVector() {
    return new Vec3(
      random(-1, 1),
      random(-1, 1),
      random(-1, 1),
    ).normalize();
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }

  function radians(degrees) {
    return degrees * Math.PI / 180;
  }

  function map(value, a, b, c, d) {
    return c + (d - c) * ((value - a) / (b - a));
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function smoothStep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function quantize(value, step) {
    return Math.round(value / step) * step;
  }

  function nonNegative(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
  }

  function positive(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0.05, number) : fallback;
  }

  function hexToRgb(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  }

  global.createOrganicSpace = createOrganicSpace;
})(window);
