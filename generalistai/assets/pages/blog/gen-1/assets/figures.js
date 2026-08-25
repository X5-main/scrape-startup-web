(function () {
  'use strict';

  var BAR_COLORS = {
    green:  '#7CB342',
    blue:   '#5B8DEF',
    orange: '#F4511E'
  };

  var FONT_FAMILY = "'FK Grotesk Neue', -apple-system, BlinkMacSystemFont, sans-serif";

  // Read --foreground-color from the page so chart text tracks the site theme
  // automatically (the draft used hard-coded rgba(255,255,255,...) because it
  // was rendered on a dark background; on this site the foreground is #000).
  function readFgRgb() {
    var raw = '';
    try {
      raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground-color').trim();
    } catch (e) { /* ignore */ }
    if (!raw) return [0, 0, 0];
    if (raw.charAt(0) === '#') {
      var h = raw.slice(1);
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      if (!isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = raw.match(/\d+/g);
    if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
    return [0, 0, 0];
  }

  var FG = readFgRgb();
  function fg(alpha) {
    return 'rgba(' + FG[0] + ',' + FG[1] + ',' + FG[2] + ',' + alpha + ')';
  }

  Chart.defaults.color = fg(0.65);
  Chart.defaults.font.family = FONT_FAMILY;
  Chart.register(ChartDataLabels);

  var CHART_WIDTH = 640;
  var CHART_HEIGHT = 480;

  function gridLineColor() {
    return fg(0.08);
  }

  var showGridOverlay = true;

  var gridOverlay = {
    id: 'gridOverlay',
    afterDatasetsDraw: function (chart) {
      if (!showGridOverlay) return;
      var yScale = chart.scales.y;
      var ctx = chart.ctx;
      var left = chart.chartArea.left;
      var right = chart.chartArea.right;
      ctx.save();
      ctx.strokeStyle = fg(0.06);
      ctx.lineWidth = 1;
      yScale.ticks.forEach(function (tick) {
        var y = yScale.getPixelForValue(tick.value);
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      });
      ctx.restore();
    }
  };

  function makeBarChart(canvasId, cfg) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.width = CHART_WIDTH;
    canvas.height = CHART_HEIGHT;

    var colors = cfg.labels.map(function (l) {
      if (/GEN-1/i.test(l)) return BAR_COLORS.orange;
      if (/GEN-0/i.test(l)) return BAR_COLORS.blue;
      return BAR_COLORS.green;
    });

    var chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: cfg.labels,
        datasets: [{
          data: cfg.values,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderRadius: 0,
          barPercentage: 0.75,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        layout: {
          padding: { top: 10, bottom: 21, left: 36, right: 21 }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: true, color: fg(0.2) },
            ticks: {
              font: { size: 14, weight: '600' },
              color: fg(0.8)
            }
          },
          y: {
            min: 0,
            max: cfg.yMax,
            grid: { color: gridLineColor, tickColor: fg(0.4) },
            border: { display: true, color: fg(0.4) },
            title: cfg.yLabel ? {
              display: true,
              text: cfg.yLabel,
              color: fg(0.7),
              font: { size: 13, weight: '400' },
              padding: { bottom: 4 }
            } : { display: false },
            ticks: {
              stepSize: cfg.yStep,
              font: { size: 13 },
              color: fg(0.7),
              callback: function (v) { return v + cfg.ySuffix; }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          title: {
            display: true,
            text: cfg.title,
            color: fg(0.95),
            font: { size: 18, weight: '700' },
            padding: { bottom: cfg.subtitle ? 2 : 16 }
          },
          subtitle: cfg.subtitle ? {
            display: true,
            text: cfg.subtitle,
            color: '#E8A838',
            font: { size: 15, weight: '400' },
            padding: { bottom: 16 }
          } : { display: false },
          datalabels: {
            anchor: 'end',
            align: function (context) {
              var v = context.dataset.data[context.dataIndex];
              return v < 10 ? 'end' : 'start';
            },
            offset: cfg.labelOffset != null ? cfg.labelOffset : 6,
            // Labels inside saturated bars stay white; labels too small to fit
            // inside the bar sit outside and should track the page foreground.
            color: function (context) {
              var v = context.dataset.data[context.dataIndex];
              return v < 10 ? fg(0.95) : 'rgba(255,255,255,0.95)';
            },
            font: { size: 16, weight: '700' },
            formatter: function (v) { return v + cfg.ySuffix; }
          }
        }
      },
      plugins: [ChartDataLabels, gridOverlay]
    });

    return chart;
  }

  function initFigures() {
    var figures = [
      {
        id: 'figure-1',
        labels: ['Scratch', 'GEN-0', 'GEN-1'],
        values: [13, 81, 99],
        yMax: 100,
        yStep: 20,
        ySuffix: '%',
        yLabel: 'Real Robot Average Task Success Score (%)',
        title: 'Success Rates on Folding Boxes'
      },
      {
        id: 'figure-2',
        labels: ['Scratch', 'GEN-0', 'GEN-1'],
        values: [42, 62, 99],
        yMax: 100,
        yStep: 20,
        ySuffix: '%',
        yLabel: 'Real Robot Average Task Success Score (%)',
        title: 'Success Rates on Packing Phones'
      },
      {
        id: 'figure-3-vacuum',
        labels: ['Scratch', 'GEN-0', 'GEN-1'],
        values: [2, 50, 99],
        yMax: 100,
        yStep: 20,
        ySuffix: '%',
        yLabel: 'Real Robot Average Task Success Score (%)',
        title: 'Success Rates on Servicing Robot Vacuums'
      },
      {
        id: 'figure-3',
        labels: ['Prior SOTA', 'GEN-0', 'GEN-1'],
        values: [105.8, 105.8, 300],
        yMax: 400,
        yStep: 100,
        ySuffix: '',
        yLabel: 'Peak Throughput Speed (Boxes Folded Per Hour)',
        title: 'Throughput'
      }
    ];

    figures.forEach(function (cfg) {
      makeBarChart(cfg.id, cfg);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFigures);
  } else {
    initFigures();
  }
})();
