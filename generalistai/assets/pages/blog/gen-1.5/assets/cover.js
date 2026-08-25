(function () {
  'use strict';

  var covers = Array.from(document.querySelectorAll('[data-gen1p5cover]'));
  if (!covers.length) return;

  var navigatorData = window.navigator || {};
  var userAgent = navigatorData.userAgent || '';
  var userAgentData = navigatorData.userAgentData;
  var platform = (userAgentData && userAgentData.platform) || navigatorData.platform || '';
  var brands = userAgentData && Array.isArray(userAgentData.brands)
    ? userAgentData.brands.map(function (item) { return item.brand; }).join(' ')
    : '';
  var isWindows = /Windows|Win32|Win64/i.test(platform + ' ' + userAgent);
  var isChromium = /Chromium|Google Chrome|Microsoft Edge/i.test(brands) ||
    /\b(?:Chrome|Chromium|Edg|OPR)\//i.test(userAgent);
  var useStaticHeroFallback = isWindows && isChromium;

  covers = covers.filter(function (hero) {
    if (useStaticHeroFallback && hero.hasAttribute('data-gen1p5cover-hero')) {
      hero.classList.add('gen1p5cover-static-fallback');
      return false;
    }
    return true;
  });
  if (!covers.length) return;

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';

  import(THREE_URL).then(function (THREE) {
    covers.forEach(function (hero) {
      init(THREE, hero);
    });
  }).catch(function () {
    covers.forEach(function (hero) {
      hero.classList.add('gen1p5cover-unavailable');
    });
  });

  function init(THREE, hero) {
    var canvas = hero.querySelector('[data-gen1p5cover-canvas]');
    if (!canvas || hero.__gen1p5coverInitialized) return;
    hero.__gen1p5coverInitialized = true;
    var label = hero.querySelector('[data-gen1p5cover-label]');
    var labelScale = parseFloat(hero.getAttribute('data-gen1p5cover-label-scale'));
    if (!Number.isFinite(labelScale) || labelScale <= 0) labelScale = 1;

    var TWO_PI = Math.PI * 2;
    var PATTERN_RADIUS = 179.2;
    var LOOP_DURATION = 300;
    var POINT_COUNT = 11;
    var STEP_COUNT = 3451;
    var DOT_COUNT = POINT_COUNT * STEP_COUNT;
    var MAX_FPS = 30;

    var params = {
      targetFill: 1.25,
      patternScale: 0.77,
      horizontalScale: 1,
      verticalScale: 1,
      minClusterSize: 10.98,
      maxClusterSize: 205.59,
      clusterSizeStep: 0.20999998,
      minOrbitDistance: 0,
      maxOrbitDistance: 500,
      orbitDistanceStep: 0.055000007,
      orbitStep: -0.025000006,
      rotationStep: 0.195,
      orbitAngleInitial: 2.8274333,
      sizeAngleInitial: 3.0787609,
      distanceAngleInitial: 4.209734,
      orbitCycles: 1,
      rotationCycles: 1,
      sizeCycles: 1,
      distanceCycles: 2,
      heightVariation: 0.95,
      shadowReach: 0.165,
      shadowWidth: 0.54,
      shadowOpacity: 0.45,
      poleColor: '#e8e8e8',
      shadowColor: '#e6e6e6'
    };
    var targetFill = parseFloat(hero.getAttribute('data-gen1p5cover-target-fill'));
    if (Number.isFinite(targetFill) && targetFill > 0) {
      params.targetFill = targetFill;
    }
    var dotScale = parseFloat(hero.getAttribute('data-gen1p5cover-dot-scale'));
    if (!Number.isFinite(dotScale) || dotScale <= 0) dotScale = 1;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      hero.classList.add('gen1p5cover-unavailable');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    camera.position.z = 5;

    var topPositions = new Float32Array(DOT_COUNT * 3);
    var shadowPositions = new Float32Array(DOT_COUNT * 2);
    var shadowDirections = new Float32Array(DOT_COUNT * 2);
    var shadowLengths = new Float32Array(DOT_COUNT);
    var shadowWidths = new Float32Array(DOT_COUNT);
    var shadowStrengths = new Float32Array(DOT_COUNT);
    var poleHeights = new Float32Array(DOT_COUNT);

    function hash(index) {
      var value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
      return value - Math.floor(value);
    }

    for (var index = 0; index < DOT_COUNT; index += 1) {
      poleHeights[index] = hash(index);
    }

    var shadowGeometry = new THREE.InstancedBufferGeometry();
    shadowGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([
        0, -1, 0, 1, -1, 0, 1, 1, 0,
        0, -1, 0, 1, 1, 0, 0, 1, 0
      ], 3)
    );

    function addShadowAttribute(name, values, itemSize) {
      var attribute = new THREE.InstancedBufferAttribute(values, itemSize);
      attribute.setUsage(THREE.DynamicDrawUsage);
      shadowGeometry.setAttribute(name, attribute);
    }

    addShadowAttribute('instancePosition', shadowPositions, 2);
    addShadowAttribute('instanceDirection', shadowDirections, 2);
    addShadowAttribute('instanceLength', shadowLengths, 1);
    addShadowAttribute('instanceWidth', shadowWidths, 1);
    addShadowAttribute('instanceStrength', shadowStrengths, 1);
    shadowGeometry.instanceCount = DOT_COUNT;

    var shadowMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uColor: { value: new THREE.Color(params.shadowColor) },
        uOpacity: { value: params.shadowOpacity }
      },
      vertexShader: [
        'attribute vec2 instancePosition;',
        'attribute vec2 instanceDirection;',
        'attribute float instanceLength;',
        'attribute float instanceWidth;',
        'attribute float instanceStrength;',
        'varying vec2 vUv;',
        'varying float vStrength;',
        'void main() {',
        '  vec2 perpendicular = vec2(-instanceDirection.y, instanceDirection.x);',
        '  vec2 world = instancePosition',
        '    + instanceDirection * position.x * instanceLength',
        '    + perpendicular * position.y * instanceWidth;',
        '  vUv = vec2(position.x, position.y);',
        '  vStrength = instanceStrength;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying vec2 vUv;',
        'varying float vStrength;',
        'void main() {',
        '  float edge = 1.0 - smoothstep(0.22, 1.0, abs(vUv.y));',
        '  float tail = 1.0 - smoothstep(0.62, 1.0, vUv.x);',
        '  float root = smoothstep(0.0, 0.04, vUv.x);',
        '  float alpha = edge * tail * root * uOpacity * vStrength;',
        '  gl_FragColor = vec4(uColor, alpha);',
        '}'
      ].join('\n')
    });

    var shadows = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadows.frustumCulled = false;
    scene.add(shadows);

    var topGeometry = new THREE.BufferGeometry();
    var topPositionAttribute = new THREE.BufferAttribute(topPositions, 3);
    topPositionAttribute.setUsage(THREE.DynamicDrawUsage);
    topGeometry.setAttribute('position', topPositionAttribute);
    topGeometry.setDrawRange(0, DOT_COUNT);

    var topMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(params.poleColor) },
        uPointSize: { value: 1 }
      },
      vertexShader: [
        'uniform float uPointSize;',
        'void main() {',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = uPointSize;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'void main() {',
        '  gl_FragColor = vec4(uColor, 1.0);',
        '}'
      ].join('\n')
    });

    var tops = new THREE.Points(topGeometry, topMaterial);
    tops.frustumCulled = false;
    scene.add(tops);

    function mapRange(value, outMin, outMax) {
      return outMin + (outMax - outMin) * ((value + 1) * 0.5);
    }

    function updateField(progress) {
      var phase = progress * TWO_PI;
      var cOrbit = params.orbitAngleInitial + phase * params.orbitCycles;
      var cRotation = phase * params.rotationCycles;
      var cSize = params.sizeAngleInitial + phase * params.sizeCycles;
      var cDistance = params.distanceAngleInitial - Math.PI / 2
        + phase * params.distanceCycles;
      var instance = 0;

      for (var step = 0; step < STEP_COUNT; step += 1) {
        var clusterSize = mapRange(
          Math.sin(cSize),
          params.minClusterSize,
          params.maxClusterSize
        );
        cSize += params.clusterSizeStep;

        var orbitDistance = mapRange(
          Math.sin(cDistance),
          params.minOrbitDistance,
          params.maxOrbitDistance
        ) * params.patternScale;
        cDistance += params.orbitDistanceStep;

        var clusterX = Math.cos(cOrbit) * orbitDistance;
        var clusterY = Math.sin(cOrbit) * orbitDistance;

        for (var point = 0; point < POINT_COUNT; point += 1) {
          var angle = TWO_PI * point / POINT_COUNT + cRotation;
          var localRadius = clusterSize * 0.5 * params.patternScale;
          var x = (clusterX + Math.cos(angle) * localRadius)
            * params.horizontalScale;
          var y = (clusterY + Math.sin(angle) * localRadius)
            * params.verticalScale;
          var height = 1 + (poleHeights[instance] - 0.5)
            * 2 * params.heightVariation;
          var distance = Math.max(Math.hypot(x, y), 0.001);

          topPositions[instance * 3] = x;
          topPositions[instance * 3 + 1] = y;
          topPositions[instance * 3 + 2] = 0;

          shadowPositions[instance * 2] = x;
          shadowPositions[instance * 2 + 1] = y;
          shadowDirections[instance * 2] = x / distance;
          shadowDirections[instance * 2 + 1] = y / distance;
          shadowLengths[instance] = Math.min(
            distance * params.shadowReach * height,
            150
          );
          shadowWidths[instance] = params.shadowWidth * (0.75 + height * 0.3);
          shadowStrengths[instance] = 0.62 + poleHeights[instance] * 0.38;
          instance += 1;
        }

        cOrbit += params.orbitStep;
        cRotation += params.rotationStep;
      }

      topPositionAttribute.needsUpdate = true;
      [
        'instancePosition',
        'instanceDirection',
        'instanceLength',
        'instanceWidth',
        'instanceStrength'
      ].forEach(function (name) {
        shadowGeometry.getAttribute(name).needsUpdate = true;
      });
    }

    var worldHeight = 1;

    function resize() {
      var width = Math.max(hero.clientWidth, 1);
      var height = Math.max(hero.clientHeight, 1);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (label) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      worldHeight = (PATTERN_RADIUS * 2) / params.targetFill;
      var worldWidth = worldHeight * (width / height);
      camera.left = -worldWidth / 2;
      camera.right = worldWidth / 2;
      camera.top = worldHeight / 2;
      camera.bottom = -worldHeight / 2;
      camera.updateProjectionMatrix();

      var pixelsPerWorldUnit = height / worldHeight;
      topMaterial.uniforms.uPointSize.value = Math.max(
        1.25 * dotScale * dpr,
        0.4 * dotScale * pixelsPerWorldUnit * dpr
      );
      if (label) {
        var compactLabelScale = width <= 767 ? 0.55 : 1;
        label.style.fontSize = Math.round(
          height * 0.48 * compactLabelScale * labelScale
        ) + 'px';
        label.style.top = 'calc(50% + 1%)';
      }
      render(pausedProgress);
    }

    function render(progress) {
      updateField(progress);
      renderer.render(scene, camera);
    }

    var timelineStart = performance.now();
    var pausedProgress = 0;
    var frameId = 0;
    var lastFrameTime = 0;
    var running = false;
    var inViewport = true;
    var animate = hero.getAttribute('data-gen1p5cover-animate') !== 'false';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function progressAt(now) {
      return ((now - timelineStart) / 1000 / LOOP_DURATION) % 1;
    }

    function frame(now) {
      if (!running) return;
      frameId = requestAnimationFrame(frame);
      if (now - lastFrameTime < 1000 / MAX_FPS) return;
      lastFrameTime = now;
      pausedProgress = progressAt(now);
      render(pausedProgress);
    }

    function shouldRun() {
      return animate && inViewport && !document.hidden && !reduceMotion.matches;
    }

    function syncPlayback() {
      var nextRunning = shouldRun();
      if (nextRunning === running) return;

      running = nextRunning;
      if (running) {
        timelineStart = performance.now() - pausedProgress * LOOP_DURATION * 1000;
        lastFrameTime = 0;
        frameId = requestAnimationFrame(frame);
      } else {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }

    if ('IntersectionObserver' in window) {
      var visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== hero) return;
          inViewport = entry.isIntersecting;
          syncPlayback();
        });
      }, { threshold: 0.01 });
      visibilityObserver.observe(hero);
    }

    document.addEventListener('visibilitychange', syncPlayback);
    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', syncPlayback);
    } else if (typeof reduceMotion.addListener === 'function') {
      reduceMotion.addListener(syncPlayback);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(hero);
    } else {
      window.addEventListener('resize', resize);
    }

    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      hero.classList.add('gen1p5cover-unavailable');
    });

    resize();
    hero.classList.add('gen1p5cover-ready');
    syncPlayback();
  }
})();
