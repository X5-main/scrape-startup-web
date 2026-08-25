(function () {
  'use strict';

  // Radial mapping exponent for the weight-update rings/profile.
  // 0.5 = area-proportional (sqrt, stretches values near zero);
  // 1.0 = linear. Values in between trade the two off.
  var RADIAL_EXP = 0.85;
  function radialFactor(value) {
    return Math.pow(Math.max(0, value), RADIAL_EXP);
  }

  var LABELS = {
    bottle: 'Bottle Opener',
    boxcutter: 'Box Cutter',
    paddle: 'Extra Wide Hands',
    peel: 'Peeler',
    scrape: 'Scrape + Sweep',
    screw: 'Screwdriver',
    tape: 'Tape Dispenser',
    tong: 'Tongs',
    whisk: 'Whisk',
  };

  var THUMBNAILS = {
    bottle: 'icons/bottle-opener.png',
    boxcutter: 'icons/box-cutter.png',
    paddle: 'icons/paddle.png',
    peel: 'icons/peeler.png',
    scrape: 'icons/sweep.png',
    screw: 'icons/screwdriver.png',
    tape: 'icons/tape.png',
    tong: 'icons/tongs.png',
    whisk: 'icons/whisk.png',
  };

  var SECTOR_LABELS = {
    sensor: 'Sensor Processing',
    reasoning: 'Harmonic Reasoning',
    actuation: 'Actuation',
  };

  var SECTOR_LABEL_OFFSETS = {
    'Harmonic Reasoning': { x: -4, y: 10 },
  };

  function init(root) {
    var src = root.getAttribute('data-src');
    var controls = root.querySelector('[data-manyhands-controls]');
    var chart = root.querySelector('.manyhands-weight-viz-chart');
    var canvas = root.querySelector('canvas');
    var tooltip = root.querySelector('[data-manyhands-tooltip]');
    if (!src || !controls || !chart || !canvas || !tooltip) return;

    fetch(src)
      .then(function (response) {
        if (!response.ok) throw new Error('Could not load visualization data');
        return response.json();
      })
      .then(function (data) {
        mount(root, controls, chart, canvas, tooltip, data);
      })
      .catch(function (error) {
        console.error('[manyhands-weight-viz]', error);
      });
  }

  function mount(root, controls, chart, canvas, tooltip, data) {
    var ctx = canvas.getContext('2d');
    var sectorLabels = SECTOR_LABELS;
    var sectorLabelOffsets = SECTOR_LABEL_OFFSETS;
    var thumbnailMode = root.getAttribute('data-control-style') === 'thumbnails';
    var thumbnailBase = root.getAttribute('data-thumbnail-base') || '';
    var hands = data.hands.slice().sort(function (a, b) {
      return b.rel_l2 - a.rel_l2;
    });
    var byHand = Object.fromEntries(hands.map(function (hand) {
      return [hand.hand, hand];
    }));
    var maxValue = Math.max.apply(null, hands.flatMap(function (hand) {
      return hand.profile;
    }));
    var pretrainedBaseProfile = new Array(data.layer_names.length).fill(0);
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var compactQuery = window.matchMedia('(max-width: 639px)');
    var state = {
      hand: byHand.screw ? 'screw' : hands[0].hand,
      display: new Array(data.layer_names.length).fill(0),
      from: null,
      target: null,
      startedAt: 0,
      duration: 500,
      animating: false,
      autoTransition: false,
      overlay: false,
      pretrainedBase: false,
      viewMode: 'single',
      modeFrom: 'single',
      modeTo: 'single',
      modeProgress: 1,
      modeStartedAt: 0,
      modeDuration: 500,
      modeAnimating: false,
      modeFrame: null,
      pointerInside: false,
      cycleTimer: null,
      geometry: null,
      displayColor: null,
      fromColor: null,
      targetColor: null,
      hoveredSector: null,
      compact: compactQuery.matches,
      visible: !document.hidden && isElementInViewport(root),
    };
    root.classList.toggle('is-compact', state.compact);
    root.classList.toggle('has-thumbnail-controls', thumbnailMode);
    var handColors = {};
    var handColorValues = {};
    var pretrainedBaseColor = [0, 0, 0, 1];
    var selection = document.createElement('span');
    var handButtons = document.createElement('div');
    var selectionReady = false;
    selection.className = 'manyhands-weight-viz-selection';
    selection.setAttribute('aria-hidden', 'true');
    handButtons.className = 'manyhands-weight-viz-hand-buttons';
    controls.appendChild(selection);
    controls.appendChild(handButtons);

    hands.forEach(function (hand) {
      var button = document.createElement('button');
      var swatch = document.createElement('span');
      var label = document.createElement('span');
      var thumbnail = null;
      var handLabel = LABELS[hand.hand] || hand.hand;

      button.type = 'button';
      button.className = 'manyhands-weight-viz-button';
      button.dataset.hand = hand.hand;
      button.setAttribute('aria-pressed', 'false');

      swatch.className = 'manyhands-weight-viz-swatch';
      swatch.setAttribute('aria-hidden', 'true');
      label.className = 'manyhands-weight-viz-label';
      label.textContent = handLabel;

      if (thumbnailMode && THUMBNAILS[hand.hand]) {
        thumbnail = document.createElement('img');
        thumbnail.className = 'manyhands-weight-viz-thumbnail';
        thumbnail.src = thumbnailBase + '/' + THUMBNAILS[hand.hand];
        thumbnail.alt = '';
        thumbnail.draggable = false;
        thumbnail.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-label', handLabel);
        button.appendChild(thumbnail);
      }

      button.appendChild(swatch);
      button.appendChild(label);
      handButtons.appendChild(button);

      handColors[hand.hand] = getComputedStyle(swatch).backgroundColor;
      handColorValues[hand.hand] = colorToRgba(handColors[hand.hand]);
      button.addEventListener('click', function () {
        activateHand(hand.hand);
      });
    });

    function activateHand(handName) {
      root.classList.add('is-user-selecting');
      var shouldSelect =
        state.hand !== handName ||
        state.overlay ||
        state.pretrainedBase;
      setViewMode('single');
      if (shouldSelect) selectHand(handName, 500, false);
    }

    var pretrainedBaseButton = document.createElement('button');
    var pretrainedBaseIcon = document.createElement('span');
    var pretrainedBaseLabel = document.createElement('span');
    pretrainedBaseButton.type = 'button';
    pretrainedBaseButton.className =
      'button button-small manyhands-weight-viz-button manyhands-weight-viz-pretrained';
    pretrainedBaseButton.setAttribute('aria-pressed', 'false');
    pretrainedBaseIcon.className = 'manyhands-weight-viz-pretrained-icon';
    pretrainedBaseIcon.setAttribute('aria-hidden', 'true');
    pretrainedBaseLabel.textContent = 'Pretrained Base';
    pretrainedBaseButton.appendChild(pretrainedBaseIcon);
    pretrainedBaseButton.appendChild(pretrainedBaseLabel);
    controls.appendChild(pretrainedBaseButton);
    pretrainedBaseButton.addEventListener('click', function () {
      setPretrainedBase(!state.pretrainedBase);
    });

    var overlayButton = document.createElement('button');
    var overlayIcon = document.createElement('span');
    var overlayLabel = document.createElement('span');
    overlayButton.type = 'button';
    overlayButton.className =
      'button button-small manyhands-weight-viz-button manyhands-weight-viz-overlay';
    overlayButton.setAttribute('aria-pressed', 'false');
    overlayIcon.className = 'manyhands-weight-viz-overlay-icon';
    overlayIcon.setAttribute('aria-hidden', 'true');
    overlayLabel.textContent = 'Overlay All';
    overlayButton.appendChild(overlayIcon);
    overlayButton.appendChild(overlayLabel);
    controls.appendChild(overlayButton);
    overlayButton.addEventListener('click', function () {
      setOverlay(!state.overlay);
    });

    function refreshButtons(duration) {
      controls.querySelectorAll('.manyhands-weight-viz-button[data-hand]').forEach(function (button) {
        button.setAttribute(
          'aria-pressed',
          String(
            !state.overlay &&
            !state.pretrainedBase &&
            button.dataset.hand === state.hand
          )
        );
      });
      if (pretrainedBaseButton) {
        pretrainedBaseButton.setAttribute(
          'aria-pressed',
          String(state.pretrainedBase)
        );
      }
      overlayButton.setAttribute('aria-pressed', String(state.overlay));
      moveSelection(duration);
    }

    function moveSelection(duration) {
      var selectedButton = controls.querySelector('.manyhands-weight-viz-button[aria-pressed="true"]');
      if (!selectedButton) return;

      var selectionDuration =
        typeof duration === 'number' ? Math.min(duration, 900) : 250;
      selection.style.transitionDuration = selectionReady && !reducedMotion
        ? selectionDuration + 'ms'
        : '0ms';
      selection.style.width = selectedButton.offsetWidth + 'px';
      selection.style.height = selectedButton.offsetHeight + 'px';
      selection.style.transform =
        'translate(' + selectedButton.offsetLeft + 'px, ' + selectedButton.offsetTop + 'px)';
      selection.style.opacity = '1';
      selectionReady = true;
    }

    function selectHand(handName, duration, autoTransition) {
      var hand = byHand[handName];
      if (!hand) return;

      state.hand = handName;
      state.from = state.display.slice();
      state.target = hand.profile.slice();
      state.fromColor = (state.displayColor || handColorValues[handName]).slice();
      state.targetColor = handColorValues[handName].slice();
      state.startedAt = performance.now();
      state.duration = reducedMotion ? 0 : (duration || 500);
      state.autoTransition = !!autoTransition;
      root.classList.toggle('is-user-selecting', !state.autoTransition);
      refreshButtons(state.duration);

      if (!state.animating) {
        state.animating = true;
        requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      if (!state.animating) return;
      if (!state.visible) {
        finishHandTransition();
        return;
      }

      var progress = state.duration === 0
        ? 1
        : Math.min(1, (now - state.startedAt) / state.duration);
      var eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);

      state.display = state.from.map(function (value, index) {
        return value + (state.target[index] - value) * eased;
      });
      state.displayColor = state.fromColor.map(function (value, index) {
        return value + (state.targetColor[index] - value) * eased;
      });
      draw();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        state.animating = false;
        state.autoTransition = false;
      }
    }

    function finishHandTransition() {
      if (state.target) state.display = state.target.slice();
      if (state.targetColor) state.displayColor = state.targetColor.slice();
      state.animating = false;
      state.autoTransition = false;
    }

    function setOverlay(enabled) {
      setViewMode(enabled ? 'overlay' : 'single');
    }

    function setPretrainedBase(enabled) {
      setViewMode(enabled ? 'base' : 'single');
    }

    function setViewMode(nextMode, duration) {
      var targetMode = nextMode;
      if (
        !state.modeAnimating &&
        state.viewMode === targetMode
      ) return;

      if (state.modeFrame !== null) {
        cancelAnimationFrame(state.modeFrame);
        state.modeFrame = null;
      }
      if (state.modeAnimating) {
        state.viewMode = state.modeTo;
        state.modeAnimating = false;
      }

      state.overlay = targetMode === 'overlay';
      state.pretrainedBase = targetMode === 'base';
      root.classList.toggle('is-pretrained-base', state.pretrainedBase);
      setHoveredSector(null);
      clearAutoCycle();
      refreshButtons(250);
      tooltip.style.display = 'none';

      state.modeFrom = state.viewMode;
      state.modeTo = targetMode;
      state.modeProgress = 0;
      state.modeStartedAt = performance.now();
      state.modeDuration = reducedMotion
        ? 0
        : (typeof duration === 'number' ? duration : 500);

      if (state.modeFrom === state.modeTo || state.modeDuration === 0) {
        state.viewMode = targetMode;
        state.modeProgress = 1;
        state.modeAnimating = false;
        if (state.visible) draw();
      } else {
        state.modeAnimating = true;
        state.modeFrame = requestAnimationFrame(tickViewMode);
      }

      if (targetMode === 'single') scheduleAutoCycle();
    }

    function tickViewMode(now) {
      if (!state.modeAnimating) return;
      if (!state.visible) {
        finishViewModeTransition();
        return;
      }
      var progress = Math.min(
        1,
        (now - state.modeStartedAt) / state.modeDuration
      );
      state.modeProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
      draw();

      if (progress < 1) {
        state.modeFrame = requestAnimationFrame(tickViewMode);
      } else {
        state.viewMode = state.modeTo;
        state.modeProgress = 1;
        state.modeAnimating = false;
        state.modeFrame = null;
        draw();
      }
    }

    function finishViewModeTransition() {
      if (state.modeFrame !== null) {
        cancelAnimationFrame(state.modeFrame);
        state.modeFrame = null;
      }
      state.viewMode = state.modeTo;
      state.modeProgress = 1;
      state.modeAnimating = false;
    }

    function clearAutoCycle() {
      if (!state.cycleTimer) return;
      clearTimeout(state.cycleTimer);
      state.cycleTimer = null;
    }

    function scheduleAutoCycle(delay) {
      clearAutoCycle();
      var isCompact = state.compact;
      if (
        !state.visible ||
        document.hidden ||
        reducedMotion ||
        state.overlay ||
        state.pretrainedBase ||
        (!isCompact && (state.pointerInside || root.matches(':hover')))
      ) return;

      state.cycleTimer = setTimeout(function () {
        state.cycleTimer = null;
        var compactNow = state.compact;
        if (
          !state.visible ||
          document.hidden ||
          state.overlay ||
          state.pretrainedBase ||
          (!compactNow && (state.pointerInside || root.matches(':hover')))
        ) return;

        var currentIndex = hands.findIndex(function (hand) {
          return hand.hand === state.hand;
        });
        var nextHand = hands[(currentIndex + 1) % hands.length];
        selectHand(nextHand.hand, 1800, true);
        scheduleAutoCycle(compactNow ? 1800 : 3400);
      }, delay == null ? (isCompact ? 0 : 2400) : delay);
    }

    function setVisibility(isVisible) {
      var nextVisible = !!isVisible && !document.hidden;
      if (state.visible === nextVisible) return;
      state.visible = nextVisible;

      if (!state.visible) {
        clearAutoCycle();
        if (state.animating) finishHandTransition();
        if (state.modeAnimating) finishViewModeTransition();
        return;
      }

      resizeChart();
      draw();
      scheduleAutoCycle();
    }

    function isElementInViewport(element) {
      var rect = element.getBoundingClientRect();
      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth
      );
    }

    function draw() {
      var width = chart.clientWidth;
      var height = chart.clientHeight;
      if (!width || !height) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pixelWidth = Math.round(width * dpr);
      var pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      var styles = getComputedStyle(root);
      var foreground = styles.color;
      var foregroundChannels =
        styles.getPropertyValue('--foreground-rgb').match(/[\d.]+/g);
      if (foregroundChannels && foregroundChannels.length >= 3) {
        pretrainedBaseColor = [
          Number(foregroundChannels[0]),
          Number(foregroundChannels[1]),
          Number(foregroundChannels[2]),
          1,
        ];
      }
      var selectedColorValue =
        state.displayColor ||
        handColorValues[state.hand] ||
        pretrainedBaseColor;
      var selectedColor = rgbaString(selectedColorValue);
      var count = data.layer_names.length;
      var cx = width / 2;
      var cy = height / 2;
      var minDimension = Math.min(width, height);
      var baseRadius = Math.max(75, minDimension * 0.23);
      var outerRadius = Math.max(baseRadius + 37, minDimension / 2 - 26);
      var radialScale = (outerRadius - baseRadius) / radialFactor(maxValue);

      state.geometry = {
        cx: cx,
        cy: cy,
        baseRadius: baseRadius,
        outerRadius: outerRadius,
        radialScale: radialScale,
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      drawRings(
        ctx,
        cx,
        cy,
        baseRadius,
        radialScale,
        maxValue,
        foreground,
        1
      );
      drawSectors(ctx, data, cx, cy, baseRadius, selectedColor, foreground);

      if (state.modeAnimating) {
        if (state.modeTo === 'base') {
          drawViewMode(
            state.modeFrom,
            1 - state.modeProgress,
            1,
            1 - state.modeProgress,
            1 - state.modeProgress
          );
        } else if (state.modeFrom === 'base') {
          drawViewMode(
            state.modeTo,
            state.modeProgress,
            1,
            state.modeProgress,
            state.modeProgress
          );
        } else {
          drawViewMode(
            state.modeFrom,
            1 - state.modeProgress,
            1 - state.modeProgress,
            1,
            1 - state.modeProgress
          );
          drawViewMode(
            state.modeTo,
            state.modeProgress,
            state.modeProgress,
            1,
            state.modeProgress
          );
        }
      } else {
        drawViewMode(state.viewMode, 1, 1, 1, 1);
      }

      function drawViewMode(
        mode,
        radialProgress,
        opacity,
        normalColorMix,
        readoutOpacity
      ) {
        if (opacity <= 0.001) return;

        if (mode === 'base') {
          drawProfile(
            ctx,
            pretrainedBaseProfile,
            cx,
            cy,
            baseRadius,
            radialScale,
            rgbaString(pretrainedBaseColor),
            {
              fill: true,
              spokes: false,
              lineWidth: 1,
              alpha: 0,
              opacity: opacity,
            }
          );
          return;
        }

        var profileScale = radialProgress * radialProgress;
        if (mode === 'overlay') {
          hands.forEach(function (hand) {
            var overlayColor = colorFromPretrainedBase(
              handColorValues[hand.hand],
              normalColorMix
            );
            drawProfile(
              ctx,
              scaledProfile(hand.profile, profileScale),
              cx,
              cy,
              baseRadius,
              radialScale,
              overlayColor,
              {
                fill: false,
                spokes: false,
                lineWidth: 1.4,
                alpha: 0.8,
                opacity: opacity,
              }
            );
          });
          return;
        }

        var profileColor = colorFromPretrainedBase(
          selectedColorValue,
          normalColorMix
        );
        drawProfile(
          ctx,
          scaledProfile(state.display, profileScale),
          cx,
          cy,
          baseRadius,
          radialScale,
          profileColor,
          {
            fill: true,
            spokes: true,
            lineWidth: 1.75,
            alpha: 1,
            opacity: opacity,
          }
        );
        drawReadout(
          ctx,
          byHand[state.hand],
          profileColor,
          foreground,
          readoutOpacity
        );
      }

      function colorFromPretrainedBase(color, normalColorMix) {
        return rgbaString(pretrainedBaseColor.map(function (value, index) {
          return value + (color[index] - value) * normalColorMix;
        }));
      }

      function scaledProfile(profile, scale) {
        if (scale >= 0.999) return profile;
        return profile.map(function (value) {
          return value * scale;
        });
      }
    }

    function drawRings(
      context,
      cx,
      cy,
      baseRadius,
      radialScale,
      maxValue,
      foreground,
      outerOpacity
    ) {
      var ringLabels = [];
      context.font =
        '400 ' + (state.compact ? 9 : 10) + 'px "FK Grotesk", monospace';
      context.textAlign = 'left';

      if (outerOpacity > 0.001) {
        [0.01, 0.05, 0.1, 0.15].forEach(function (value) {
          if (value > maxValue * 1.15) return;
          var radius = baseRadius + radialFactor(value) * radialScale;
          ringLabels.push({
            text: Math.round(value * 100) + '%',
            x: cx + radius * 0.707 + 4,
            y: cy - radius * 0.707 - 3,
          });

          context.save();
          context.globalAlpha = 0.12 * outerOpacity;
          context.strokeStyle = foreground;
          context.lineWidth = 0.6;
          context.setLineDash([2, 5]);
          context.beginPath();
          context.arc(cx, cy, radius, 0, Math.PI * 2);
          context.stroke();
          context.restore();
        });

        ringLabels.sort(function (a, b) {
          return a.y - b.y;
        });
        if (state.compact) {
          ringLabels.forEach(function (label, index) {
            if (index === 0) return;
            label.y = Math.max(label.y, ringLabels[index - 1].y + 12);
          });
        }

        ringLabels.forEach(function (label) {
          context.save();
          context.globalAlpha = 0.5 * outerOpacity;
          context.fillStyle = foreground;
          context.fillText(label.text, label.x, label.y);
          context.restore();
        });
      }

      context.save();
      context.globalAlpha = 1;
      context.strokeStyle = foreground;
      context.lineWidth = 1.75;
      context.beginPath();
      context.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    function drawSectors(context, data, cx, cy, baseRadius, selectedColor, foreground) {
      var count = data.layer_names.length;
      var start = 0;
      var ringRadius = baseRadius - 9;
      var labelRadius = baseRadius * 0.55;
      var labelOffsetScale = baseRadius / 89.6;
      var labelSizeProgress = Math.max(0, Math.min(1, (baseRadius - 54) / 35.6));
      var labelFontSize = 8 + labelSizeProgress * 2;
      var gapAngle = 1.5 / ringRadius;

      while (start < count) {
        var sector = sectorLabels[data.layer_groups[start]];
        var end = start;
        while (
          end + 1 < count &&
          sectorLabels[data.layer_groups[end + 1]] === sector
        ) {
          end += 1;
        }

        var startAngle = angle(start, count) - Math.PI / count;
        var endAngle = angle(end, count) + Math.PI / count;
        var middle = (startAngle + endAngle) / 2;
        var isHovered = sector === state.hoveredSector;
        var labelOffset = sectorLabelOffsets[sector] || { x: 0, y: 0 };

        context.save();
        context.globalAlpha = isHovered ? 1 : 0.5;
        context.strokeStyle = isHovered ? selectedColor : foreground;
        context.lineWidth = 3;
        context.lineCap = 'butt';
        context.beginPath();
        context.arc(
          cx,
          cy,
          ringRadius,
          startAngle + gapAngle / 2,
          endAngle - gapAngle / 2
        );
        context.stroke();
        context.restore();

        if (!state.compact) {
          context.save();
          context.globalAlpha = isHovered ? 1 : 0.5;
          context.fillStyle = isHovered ? selectedColor : foreground;
          context.font =
            (isHovered ? '700' : '500') + ' ' +
            labelFontSize + 'px "FK Grotesk Neue", sans-serif';
          context.textAlign = 'center';

          var desiredX =
            cx + Math.cos(middle) * labelRadius + labelOffset.x * labelOffsetScale;
          var desiredY =
            cy + Math.sin(middle) * labelRadius + 3 + labelOffset.y * labelOffsetScale;
          var maxLabelRadius = ringRadius - 6 * (1 - labelSizeProgress);

          var lines = sector.split(' ');
          var lineHeight = labelFontSize * 1.1;
          var labelPosition = fitLabelInsideCircle(
            context,
            lines,
            lineHeight,
            cx,
            cy,
            desiredX,
            desiredY,
            maxLabelRadius
          );
          var firstLineY = labelPosition.y - (lines.length - 1) / 2 * lineHeight;
          lines.forEach(function (line, lineIndex) {
            context.fillText(line, labelPosition.x, firstLineY + lineIndex * lineHeight);
          });
          context.restore();
        }

        start = end + 1;
      }
    }

    function fitLabelInsideCircle(context, lines, lineHeight, cx, cy, desiredX, desiredY, maxRadius) {
      var halfWidth = 0;
      var ascent = 8;
      var descent = 2;
      lines.forEach(function (line, index) {
        var metrics = context.measureText(line);
        halfWidth = Math.max(
          halfWidth,
          metrics.actualBoundingBoxLeft || metrics.width / 2,
          metrics.actualBoundingBoxRight || metrics.width / 2
        );
        if (index === 0) ascent = metrics.actualBoundingBoxAscent || 8;
        if (index === lines.length - 1) descent = metrics.actualBoundingBoxDescent || 2;
      });

      var half = (lines.length - 1) / 2;
      var top = half * lineHeight + ascent;
      var bottom = half * lineHeight + descent;
      var dx = desiredX - cx;
      var dy = desiredY - cy;

      function fits(scale) {
        var x = cx + dx * scale;
        var y = cy + dy * scale;
        return [
          [x - halfWidth, y - top],
          [x + halfWidth, y - top],
          [x - halfWidth, y + bottom],
          [x + halfWidth, y + bottom],
        ].every(function (corner) {
          var cornerX = corner[0] - cx;
          var cornerY = corner[1] - cy;
          return Math.sqrt(cornerX * cornerX + cornerY * cornerY) <= maxRadius;
        });
      }

      if (fits(1)) return { x: desiredX, y: desiredY };

      var low = 0;
      var high = 1;
      for (var iteration = 0; iteration < 12; iteration += 1) {
        var middle = (low + high) / 2;
        if (fits(middle)) low = middle;
        else high = middle;
      }

      return {
        x: cx + dx * low,
        y: cy + dy * low,
      };
    }

    function drawProfile(context, profile, cx, cy, baseRadius, radialScale, color, options) {
      var count = profile.length;
      var opacity = options.opacity == null ? 1 : options.opacity;
      var points = profile.map(function (value, index) {
        var currentAngle = angle(index, count);
        var radius = baseRadius + radialFactor(value) * radialScale;
        return {
          x: cx + Math.cos(currentAngle) * radius,
          y: cy + Math.sin(currentAngle) * radius,
        };
      });

      if (options.spokes) {
        context.save();
        context.strokeStyle = color;
        points.forEach(function (point, index) {
          var currentAngle = angle(index, count);
          var isHoveredSector =
            sectorLabels[data.layer_groups[index]] === state.hoveredSector;
          context.globalAlpha = (isHoveredSector ? 0.55 : 0.16) * opacity;
          context.lineWidth = isHoveredSector ? 1.5 : 0.6;
          context.beginPath();
          context.moveTo(
            cx + Math.cos(currentAngle) * baseRadius,
            cy + Math.sin(currentAngle) * baseRadius
          );
          context.lineTo(point.x, point.y);
          context.stroke();
        });
        context.restore();
      }

      traceSmoothClosedPath(context, points);

      if (options.fill) {
        context.save();
        context.globalAlpha = 0.16 * opacity;
        context.fillStyle = color;
        context.fill();
        context.restore();
      }

      context.save();
      context.globalAlpha = options.alpha * opacity;
      context.strokeStyle = color;
      context.lineWidth = options.lineWidth;
      context.stroke();
      context.restore();
    }

    function traceSmoothClosedPath(context, points) {
      var tension = 1 / 6;
      var count = points.length;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (var index = 0; index < count; index += 1) {
        var previous = points[(index - 1 + count) % count];
        var current = points[index];
        var next = points[(index + 1) % count];
        var afterNext = points[(index + 2) % count];

        context.bezierCurveTo(
          current.x + (next.x - previous.x) * tension,
          current.y + (next.y - previous.y) * tension,
          next.x - (afterNext.x - current.x) * tension,
          next.y - (afterNext.y - current.y) * tension,
          next.x,
          next.y
        );
      }
      context.closePath();
    }

    function drawReadout(context, hand, color, foreground, opacity) {
      if (!hand) return;

      context.save();
      context.globalAlpha = opacity == null ? 1 : opacity;
      context.textAlign = 'left';
      context.font = '500 14px "FK Grotesk Neue", sans-serif';
      context.fillStyle = color;
      context.fillText(LABELS[hand.hand] || hand.hand, 18, 28);
      context.restore();

      context.save();
      context.globalAlpha = 0.6 * (opacity == null ? 1 : opacity);
      context.fillStyle = foreground;
      context.font = '400 11px "FK Grotesk", monospace';
      context.fillText(formatPercent(hand.rel_l2) + ' change in model weights', 18, 46);
      context.restore();
    }

    function updateHoveredSector(event) {
      tooltip.style.display = 'none';
      if (state.overlay || state.compact) {
        setHoveredSector(null);
        return;
      }

      var geometry = state.geometry;
      if (!geometry) return;

      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var dx = x - geometry.cx;
      var dy = y - geometry.cy;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var theta = Math.atan2(dy, dx) + Math.PI / 2;
      if (theta < 0) theta += Math.PI * 2;
      var index = Math.round(theta / (Math.PI * 2) * data.layer_names.length)
        % data.layer_names.length;

      setHoveredSector(
        distance > 12 &&
          distance <= (
            state.pretrainedBase
              ? geometry.baseRadius
              : geometry.outerRadius + 24
          )
          ? sectorLabels[data.layer_groups[index]]
          : null
      );
    }

    function setHoveredSector(sector) {
      if (state.hoveredSector === sector) return;
      state.hoveredSector = sector;
      draw();
    }

    canvas.addEventListener('pointermove', updateHoveredSector);
    canvas.addEventListener('pointerleave', function () {
      setHoveredSector(null);
      tooltip.style.display = 'none';
    });

    root.addEventListener('pointerenter', function () {
      if (state.compact) return;
      state.pointerInside = true;
      clearAutoCycle();

      if (state.animating && state.autoTransition) {
        state.display = state.target.slice();
        state.displayColor = state.targetColor.slice();
        state.animating = false;
        state.autoTransition = false;
        draw();
      }
    });

    root.addEventListener('pointerleave', function () {
      if (state.compact) return;
      state.pointerInside = false;
      tooltip.style.display = 'none';
      scheduleAutoCycle();
    });

    compactQuery.addEventListener('change', function (event) {
      state.compact = event.matches;
      root.classList.toggle('is-compact', state.compact);

      if (state.compact && (state.overlay || state.pretrainedBase)) {
        setViewMode('single', 0);
      }
      setHoveredSector(null);
      tooltip.style.display = 'none';
      state.pointerInside = state.compact ? false : root.matches(':hover');

      if (state.compact || !state.pointerInside) {
        scheduleAutoCycle(0);
      } else {
        clearAutoCycle();
      }
    });

    var chartResizeFrame = null;
    function controlsContentHeight() {
      if (getComputedStyle(controls).display !== 'flex') return 0;

      var styles = getComputedStyle(controls);
      var gap = parseFloat(styles.rowGap) || 0;

      return (
        (parseFloat(styles.paddingTop) || 0) +
        (parseFloat(styles.paddingBottom) || 0) +
        handButtons.getBoundingClientRect().height +
        (pretrainedBaseButton
          ? pretrainedBaseButton.getBoundingClientRect().height + gap
          : 0) +
        overlayButton.getBoundingClientRect().height +
        gap
      );
    }

    function resizeChart() {
      var width = chart.clientWidth;
      if (!width) return;

      var minimumHeight = state.compact ? 320 : 360;
      var height = Math.round(Math.max(
        minimumHeight,
        Math.min(560, width * 0.75),
        controlsContentHeight()
      ));
      if (chart.style.height !== height + 'px') {
        chart.style.height = height + 'px';
      }
      if (state.visible) draw();
    }

    var chartResizeObserver = new ResizeObserver(function () {
      if (chartResizeFrame !== null) return;
      chartResizeFrame = requestAnimationFrame(function () {
        chartResizeFrame = null;
        resizeChart();
      });
    });
    var controlsResizeObserver = new ResizeObserver(function () {
      moveSelection(0);
    });
    chartResizeObserver.observe(chart);
    controlsResizeObserver.observe(controls);

    if (typeof IntersectionObserver !== 'undefined') {
      var visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          setVisibility(entry.isIntersecting);
        });
      });
      visibilityObserver.observe(root);
    }
    document.addEventListener('visibilitychange', function () {
      setVisibility(isElementInViewport(root));
    });

    resizeChart();

    state.displayColor = colorToRgba(handColors[state.hand]);
    refreshButtons();
    selectHand(state.hand, 500, false);
    scheduleAutoCycle();
  }

  function colorToRgba(color) {
    var probe = document.createElement('canvas');
    var probeContext = probe.getContext('2d', { willReadFrequently: true });
    probe.width = 1;
    probe.height = 1;
    probeContext.clearRect(0, 0, 1, 1);
    probeContext.fillStyle = color;
    probeContext.fillRect(0, 0, 1, 1);
    var pixel = probeContext.getImageData(0, 0, 1, 1).data;
    return [pixel[0], pixel[1], pixel[2], pixel[3] / 255];
  }

  function rgbaString(color) {
    return 'rgba(' +
      Math.round(color[0]) + ', ' +
      Math.round(color[1]) + ', ' +
      Math.round(color[2]) + ', ' +
      color[3].toFixed(3) +
      ')';
  }

  function angle(index, count) {
    return -Math.PI / 2 + index / count * Math.PI * 2;
  }

  function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
  }

  function boot() {
    document.querySelectorAll('[data-manyhands-weight-viz]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
