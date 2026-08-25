// MathJax v3 config. Loaded via the page's `scripts` array immediately
// before the MathJax CDN script (which is also `defer`-loaded). Defer-loaded
// scripts execute in document order, so `window.MathJax` is set before
// MathJax itself reads it.
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['$$', '$$']]
  },
  svg: { fontCache: 'global' }
};
