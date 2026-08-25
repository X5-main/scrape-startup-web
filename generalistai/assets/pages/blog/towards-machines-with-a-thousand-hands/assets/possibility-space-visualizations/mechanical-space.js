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
    cubeSize: 360,
    cubeHalf: 180,
    boundaryMargin: 7,
    cubeLineWeight: 1.5,
    backLineAlpha: 58,
    frontLineAlpha: 235,
    cabinetDepthScale: 0.5,
    cabinetAngle: -Math.PI / 4,

    gridSubdivisions: 90,
    maxLiveCells: 750,
    maxActiveTips: 52,
    primaryTipCountMin: 9,
    primaryTipCountMax: 16,
    tipLifespanMin: 45,
    tipLifespanMax: 190,
    tipRespawnInterval: 12,
    tipRespawnMin: 3,
    tipRespawnMax: 8,
    tipSplitChance: 0.038,
    tipDeathChance: 0.004,
    straightRunMin: 5,
    straightRunMax: 18,
    turnAttempts: 7,

    extinctionInterval: 22,
    extinctionChance: 0.72,
    extinctionTargetMin: 18,
    extinctionTargetMax: 90,
    extinctionRadiusMin: 4,
    extinctionRadiusMax: 13,
    extinctionFadeMin: 45,
    extinctionFadeMax: 115,

    warmStartFramesMin: 170,
    warmStartFramesMax: 250,
    voxelPopFrames: 10,
    voxelPulseAmount: 0.12,
    voxelPulseSpeed: 0.05,
    voxelAlphaPulse: 0.08,
    voxelPointSize: 2.55,
    coolColorProbability: 0.75,
    lightModePointSizeMultiplier: 1.4,
    lightModeSaturationMultiplier: 1.65,
    lightModeValueMultiplier: 1.1,
  };

  const COOL_COLORS = [
    "#BEEAF0",
    "#93DDEE",
    "#66C1DC",
    "#558FA9",
    "#436E83",
    "#2C4B5D",
  ].map(hexToRgb);

  const WARM_COLORS = [
    "#FF681A",
    "#FB941F",
    "#EAA846",
    "#C65427",
    "#943924",
    "#D17257",
  ].map(hexToRgb);
  const LIGHT_MODE_COLOR_CACHE = new WeakMap();

  const CUBE_EDGES = [
    [0, 1], [1, 3], [3, 2], [2, 0],
    [4, 5], [5, 7], [7, 6], [6, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  const CABINET_BACK_EDGES = new Set(["2:6", "4:6", "6:7"]);

  class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    copy() {
      return new Vec3(this.x, this.y, this.z);
    }

    normalize() {
      const magnitude = Math.sqrt(
        this.x * this.x + this.y * this.y + this.z * this.z,
      );
      if (magnitude < 0.0001) {
        this.x = 1;
        this.y = 0;
        this.z = 0;
      } else {
        this.x /= magnitude;
        this.y /= magnitude;
        this.z /= magnitude;
      }
      return this;
    }
  }

  class MechanicalCell {
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

  class MechanicalTip {
    constructor(x, y, z, heading, branchColor) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.age = 0;
      this.maxAge = randomInt(
        CONFIG.tipLifespanMin,
        CONFIG.tipLifespanMax,
      );
      this.runRemaining = randomInt(
        CONFIG.straightRunMin,
        CONFIG.straightRunMax,
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

      let added = null;
      for (let attempt = 0; attempt < CONFIG.turnAttempts; attempt += 1) {
        const nx = this.x + Math.round(this.heading.x);
        const ny = this.y + Math.round(this.heading.y);
        const nz = this.z + Math.round(this.heading.z);
        added = system.addCell(
          nx,
          ny,
          nz,
          this.heading,
          this.branchColor,
          simFrame,
        );

        if (added) {
          this.x = nx;
          this.y = ny;
          this.z = nz;
          this.runRemaining -= 1;
          break;
        }

        this.heading = perpendicularAxis(this.heading);
        this.runRemaining = randomInt(
          CONFIG.straightRunMin,
          CONFIG.straightRunMax,
        );
      }

      if (!added) {
        this.dead = true;
        return;
      }

      if (this.runRemaining <= 0) {
        this.heading = perpendicularAxis(this.heading);
        this.runRemaining = randomInt(
          CONFIG.straightRunMin,
          CONFIG.straightRunMax,
        );
      }

      if (system.tips.length < CONFIG.maxActiveTips &&
          Math.random() < CONFIG.tipSplitChance) {
        const splitHeading = perpendicularAxis(this.heading);
        const splitColor = system.balancedTipColor(this.branchColor);
        system.tips.push(
          new MechanicalTip(
            this.x,
            this.y,
            this.z,
            splitHeading,
            splitColor,
          ),
        );
      }
    }
  }

  class MechanicalGrowthSystem {
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
          const radius = randomInt(3, 9);
          const heading = randomAxisDirection();
          const x = center + Math.round(offset.x * radius);
          const y = center + Math.round(offset.y * radius);
          const z = center + Math.round(offset.z * radius);
          const branchColor = this.balancedTipColor(
            this.randomBranchColor(),
          );
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
              new MechanicalTip(x, y, z, heading, branchColor),
            );
            break;
          }
        }
      }
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
        const heading = Math.random() < 0.65
          ? cell.heading.copy()
          : perpendicularAxis(cell.heading);
        const branchColor = this.balancedTipColor(cell.branchColor);
        this.tips.push(
          new MechanicalTip(
            cell.x,
            cell.y,
            cell.z,
            heading,
            branchColor,
          ),
        );
      }
    }

    randomBranchColor() {
      const colors = Math.random() < CONFIG.coolColorProbability
        ? COOL_COLORS
        : WARM_COLORS;
      return colors[randomInt(0, colors.length - 1)];
    }

    balancedTipColor(preferredColor) {
      const totalAfterAddition = this.tips.length + 1;
      const targetWarmTips = Math.round(
        totalAfterAddition * (1 - CONFIG.coolColorProbability),
      );
      const needsWarm = this.countWarmTips() < targetWarmTips;
      if (isWarmColor(preferredColor) === needsWarm) {
        return preferredColor;
      }
      const colors = needsWarm ? WARM_COLORS : COOL_COLORS;
      return colors[randomInt(0, colors.length - 1)];
    }

    countWarmTips() {
      return this.tips.reduce(
        (count, tip) =>
          count + (!tip.dead && isWarmColor(tip.branchColor) ? 1 : 0),
        0,
      );
    }

    addCell(x, y, z, heading, branchColor, simFrame) {
      if (!this.insideBoundary(x, y, z)) return null;
      const key = gridKey(x, y, z);
      if (this.occupied.has(key)) return null;

      const cell = new MechanicalCell(
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
      return x >= padding && x < size - padding &&
        y >= padding && y < size - padding &&
        z >= padding && z < size - padding;
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

  function createMechanicalSpace(containerOrSelector, userOptions = {}) {
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
    let resizeObserver;

    const sketch = (p) => {
      p.setup = () => {
        const size = containerSize(container);
        const canvas = p.createCanvas(size.width, size.height, p.WEBGL);
        canvas.parent(container);
        canvas.elt.style.display = "block";
        canvas.elt.setAttribute(
          "aria-label",
          "Animated mechanical possibility space",
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
        if (!paused) updateSimulation();

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
        applyCabinetProjection(p);
        drawCubeEdges(p, true, resolvedTheme, scale);
        drawVoxels(
          p,
          growth,
          simFrame + simulationAccumulator,
          scale,
          resolvedTheme,
        );
        drawCubeEdges(p, false, resolvedTheme, scale);
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
        growth = new MechanicalGrowthSystem();
        const warmupFrames = randomInt(
          CONFIG.warmStartFramesMin,
          CONFIG.warmStartFramesMax,
        );
        for (let i = 0; i < warmupFrames; i += 1) {
          simFrame += 1;
          growth.update(simFrame);
        }
      }

      p._mechanicalReset = reset;
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
        instance._mechanicalReset?.();
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
        const registry = global.mechanicalSpaces;
        const index = registry?.indexOf(container.mechanicalSpace) ?? -1;
        if (index >= 0) registry.splice(index, 1);
        delete container.dataset.mechanicalSpaceMounted;
        delete container.mechanicalSpace;
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

  function applyCabinetProjection(p) {
    p.applyMatrix(
      1, 0, 0, 0,
      0, 1, 0, 0,
      Math.cos(CONFIG.cabinetAngle) * CONFIG.cabinetDepthScale,
      Math.sin(CONFIG.cabinetAngle) * CONFIG.cabinetDepthScale,
      1,
      0,
      0, 0, 0, 1,
    );
  }

  function drawCubeEdges(p, drawBack, theme, scale) {
    const gl = p.drawingContext;
    gl.disable(gl.DEPTH_TEST);
    const lineColor = theme === "light" ? 0 : 255;
    const corners = cubeCorners();
    p.push();
    p.noFill();
    p.strokeWeight(CONFIG.cubeLineWeight * scale);

    for (const [aIndex, bIndex] of CUBE_EDGES) {
      const key = `${Math.min(aIndex, bIndex)}:${Math.max(aIndex, bIndex)}`;
      const back = CABINET_BACK_EDGES.has(key);
      if (back !== drawBack) continue;
      p.stroke(
        lineColor,
        back ? CONFIG.backLineAlpha : CONFIG.frontLineAlpha,
      );
      const a = corners[aIndex];
      const b = corners[bIndex];
      p.line(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    p.pop();
    gl.enable(gl.DEPTH_TEST);
  }

  function cubeCorners() {
    const h = CONFIG.cubeHalf;
    return [
      new Vec3(-h, -h, -h),
      new Vec3(h, -h, -h),
      new Vec3(-h, h, -h),
      new Vec3(h, h, -h),
      new Vec3(-h, -h, h),
      new Vec3(h, -h, h),
      new Vec3(-h, h, h),
      new Vec3(h, h, h),
    ];
  }

  function gridToLocal(x, y, z) {
    const min = -CONFIG.cubeHalf + CONFIG.boundaryMargin;
    const max = CONFIG.cubeHalf - CONFIG.boundaryMargin;
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

  function randomUnitVector() {
    return new Vec3(
      random(-1, 1),
      random(-1, 1),
      random(-1, 1),
    ).normalize();
  }

  function randomAxisDirection() {
    const axis = randomInt(0, 2);
    const sign = Math.random() < 0.5 ? -1 : 1;
    if (axis === 0) return new Vec3(sign, 0, 0);
    if (axis === 1) return new Vec3(0, sign, 0);
    return new Vec3(0, 0, sign);
  }

  function perpendicularAxis(heading) {
    let choices;
    if (Math.abs(heading.x) > 0.5) {
      choices = [
        new Vec3(0, 1, 0),
        new Vec3(0, -1, 0),
        new Vec3(0, 0, 1),
        new Vec3(0, 0, -1),
      ];
    } else if (Math.abs(heading.y) > 0.5) {
      choices = [
        new Vec3(1, 0, 0),
        new Vec3(-1, 0, 0),
        new Vec3(0, 0, 1),
        new Vec3(0, 0, -1),
      ];
    } else {
      choices = [
        new Vec3(1, 0, 0),
        new Vec3(-1, 0, 0),
        new Vec3(0, 1, 0),
        new Vec3(0, -1, 0),
      ];
    }
    return choices[randomInt(0, choices.length - 1)];
  }

  function isWarmColor(color) {
    return WARM_COLORS.includes(color);
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
    if (!container) {
      throw new Error("Mechanical Space container was not found.");
    }
    return container;
  }

  function requireP5() {
    if (typeof global.p5 !== "function") {
      throw new Error("Mechanical Space requires p5.js.");
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

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
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

  global.createMechanicalSpace = createMechanicalSpace;
})(window);
