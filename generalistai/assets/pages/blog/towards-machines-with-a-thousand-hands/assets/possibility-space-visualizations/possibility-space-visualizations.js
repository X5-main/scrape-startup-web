(function (global) {
  "use strict";

  let webglSupport = null;
  let staticFallbackRequired = null;
  const spaceConfigs = new WeakMap();
  const mountedElements = new Set();
  let mountObserver = null;
  let visibilityObserver = null;

  function supportsWebGL() {
    if (webglSupport !== null) return webglSupport;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      webglSupport = !!(gl && typeof gl.getParameter === "function");
    } catch (error) {
      webglSupport = false;
    }
    return webglSupport;
  }

  function shouldUseStaticFallback() {
    if (staticFallbackRequired !== null) return staticFallbackRequired;

    const navigator = global.navigator || {};
    const userAgent = navigator.userAgent || "";
    const userAgentData = navigator.userAgentData;
    const platform = userAgentData?.platform || navigator.platform || "";
    const brands = Array.isArray(userAgentData?.brands)
      ? userAgentData.brands.map((item) => item.brand).join(" ")
      : "";
    const isWindows = /Windows|Win32|Win64/i.test(`${platform} ${userAgent}`);
    const isChromium =
      /Chromium|Google Chrome|Microsoft Edge/i.test(brands) ||
      /\b(?:Chrome|Chromium|Edg|OPR)\//i.test(userAgent);

    staticFallbackRequired = isWindows && isChromium;
    return staticFallbackRequired;
  }

  function queueSpaces(root, config) {
    const elements = root.querySelectorAll(config.selector);
    global[config.collection] = global[config.collection] || [];

    // Chromium's Windows ANGLE path causes severe whole-page jank while these
    // canvases render. Keep the static <picture> fallback visible there, and
    // whenever WebGL is unavailable, by not marking the element as mounted.
    if (shouldUseStaticFallback() || !supportsWebGL()) return;

    for (const element of elements) {
      if (element.dataset[config.mountedKey] === "true") continue;
      spaceConfigs.set(element, config);

      if (typeof IntersectionObserver === "undefined") {
        mountSpace(element, config);
      } else {
        getMountObserver().observe(element);
      }
    }
  }

  function mountSpace(element, config) {
    if (element.dataset[config.mountedKey] === "true") return;

    const options = {
      theme: element.dataset.theme || "dark",
      simulationSpeed: optionalNumber(element.dataset.speed) ?? 0.35,
      compositionScale: optionalNumber(element.dataset.scale) ?? 1,
      interactive: element.dataset.interactive === "true",
    };
    const pixelDensity = optionalNumber(element.dataset.pixelDensity);
    if (pixelDensity !== null) options.pixelDensity = pixelDensity;

    let controller;
    try {
      controller = global[config.factory](element, options);
    } catch (error) {
      // Keep the static image fallback in place if the sketch fails to
      // initialize (e.g. WebGL context creation is refused).
      console.warn(
        "Possibility space failed to initialize; showing fallback image.",
        error,
      );
      return;
    }

    element.dataset[config.mountedKey] = "true";
    element[config.controllerKey] = controller;
    global[config.collection].push(controller);
    mountedElements.add(element);

    if (typeof IntersectionObserver !== "undefined") {
      getVisibilityObserver().observe(element);
      updatePlayback(element, isInViewport(element));
    }
  }

  function getMountObserver() {
    if (mountObserver) return mountObserver;
    mountObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          mountObserver.unobserve(entry.target);
          const config = spaceConfigs.get(entry.target);
          if (config) mountSpace(entry.target, config);
        }
      },
      { rootMargin: "300px 0px" },
    );
    return mountObserver;
  }

  function getVisibilityObserver() {
    if (visibilityObserver) return visibilityObserver;
    visibilityObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        updatePlayback(entry.target, entry.isIntersecting);
      }
    });
    return visibilityObserver;
  }

  function updatePlayback(element, isVisible) {
    const config = spaceConfigs.get(element);
    const controller = config && element[config.controllerKey];
    if (!controller) return;

    if (!document.hidden && isVisible) {
      controller.play();
    } else {
      controller.pause();
    }
  }

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < global.innerHeight &&
      rect.left < global.innerWidth
    );
  }

  function optionalNumber(value) {
    if (value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function mountOrganicSpaces(root = document) {
    queueSpaces(root, {
      selector: "[data-organic-space]",
      mountedKey: "organicSpaceMounted",
      controllerKey: "organicSpace",
      factory: "createOrganicSpace",
      collection: "organicSpaces",
    });
  }

  function mountMechanicalSpaces(root = document) {
    queueSpaces(root, {
      selector: "[data-mechanical-space]",
      mountedKey: "mechanicalSpaceMounted",
      controllerKey: "mechanicalSpace",
      factory: "createMechanicalSpace",
      collection: "mechanicalSpaces",
    });
  }

  function mountPossibilitySpaces() {
    mountOrganicSpaces();
    mountMechanicalSpaces();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPossibilitySpaces, {
      once: true,
    });
  } else {
    mountPossibilitySpaces();
  }

  document.addEventListener("visibilitychange", () => {
    for (const element of mountedElements) {
      updatePlayback(element, isInViewport(element));
    }
  });

  global.mountOrganicSpaces = mountOrganicSpaces;
  global.mountMechanicalSpaces = mountMechanicalSpaces;
})(window);
