// === FADE-UP SCROLL ANIMATION === //

(function () {
	var els = document.querySelectorAll('.fade-up');
	if (!els.length) return;

	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	els.forEach(function (el, i) {
		el.style.transitionDelay = (i * 0.15) + 's';
		observer.observe(el);
	});
})();

// === FADE-UP SCROLL ANIMATION ENDS === //

// === ABOUT PAGE SECTION REVEAL === //

(function () {
	var sections = document.querySelectorAll('.about-page-body .about-section');
	if (!sections.length) return;

	sections.forEach(function (section) {
		section.classList.add('about-scroll-reveal');
	});

	if (!('IntersectionObserver' in window)) {
		sections.forEach(function (section) {
			section.classList.add('is-visible');
		});
		return;
	}

	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	sections.forEach(function (section) {
		observer.observe(section);
	});
})();

// === ABOUT PAGE SECTION REVEAL ENDS === //

// === TERMINAL TYPE EFFECT === //

(function () {
	var terminals = document.querySelectorAll('[data-terminal-typing]');
	if (!terminals.length) return;

	var prefersReducedMotion =
		window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

	var terminalList = Array.prototype.slice.call(terminals);

	function normalizeText(text) {
		return text.replace(/\s+/g, ' ').trim();
	}

	function getDelayScale(el) {
		var delayScale = parseFloat(el.getAttribute('data-terminal-delay-scale'));

		if (isNaN(delayScale) || delayScale <= 0) {
			return 1;
		}

		return delayScale;
	}

	function prepareTerminal(terminal) {
		if (terminal.getAttribute('data-terminal-typing-ready') === 'true') return;

		var delayScale = getDelayScale(terminal);
		var lines = Array.prototype.slice.call(
			terminal.querySelectorAll('.terminal-line')
		);

		lines.forEach(function (line) {
			var typedEls = Array.prototype.slice.call(
				line.querySelectorAll('.terminal-command, .terminal-output')
			);

			if (!typedEls.length) return;

			var readableText = normalizeText(line.textContent);
			if (readableText) {
				line.setAttribute('aria-label', readableText);
			}

			line.classList.add('terminal-line--typing-hidden');
			line.setAttribute('data-terminal-delay-scale', delayScale);

			typedEls.forEach(function (el) {
				var text = normalizeText(el.textContent);

				el.setAttribute('data-terminal-text', text);
				el.setAttribute('data-terminal-delay-scale', delayScale);
				el.textContent = '';
				el.classList.add('terminal-typed-text');
			});
		});

		terminal.classList.add('terminal-card--typing-ready');
		terminal.setAttribute('data-terminal-typing-ready', 'true');
	}

	function typeElement(el, done) {
		var text = el.getAttribute('data-terminal-text') || '';
		var delayScale = getDelayScale(el);
		var charIndex = 0;

		el.textContent = '';
		el.classList.add('is-typing');

		function tick() {
			charIndex += 1;
			el.textContent = text.slice(0, charIndex);

			if (charIndex < text.length) {
				var typedChar = text.charAt(charIndex - 1);
				var delay = typedChar === ' ' ? 22 : 28 + Math.random() * 18;

				if (typedChar === '.' || typedChar === ',') {
					delay += 55 * delayScale;
				}

				window.setTimeout(tick, delay * delayScale);
				return;
			}

			el.classList.remove('is-typing');
			window.setTimeout(done, 120 * delayScale);
		}

		window.setTimeout(tick, 120 * delayScale);
	}

	function typeLine(line, done) {
		var delayScale = getDelayScale(line);
		var typedEls = Array.prototype.slice.call(
			line.querySelectorAll('.terminal-typed-text')
		);
		var index = 0;

		line.classList.remove('terminal-line--typing-hidden');
		line.classList.add('terminal-line--typing-active');

		function typeNextEl() {
			if (index >= typedEls.length) {
				line.classList.remove('terminal-line--typing-active');
				line.classList.add('terminal-line--typing-complete');
				window.setTimeout(done, 110 * delayScale);
				return;
			}

			typeElement(typedEls[index], function () {
				index += 1;
				typeNextEl();
			});
		}

		typeNextEl();
	}

	function animateTerminal(terminal) {
		if (terminal.getAttribute('data-terminal-typing-started') === 'true') return;

		var lines = Array.prototype.slice
			.call(terminal.querySelectorAll('.terminal-line'))
			.filter(function (line) {
				return line.querySelector('.terminal-typed-text');
			});
		var lineIndex = 0;
		var terminalIndex = terminalList.indexOf(terminal);

		terminal.setAttribute('data-terminal-typing-started', 'true');

		function typeNextLine() {
			if (lineIndex >= lines.length) {
				terminal.classList.add('terminal-card--typing-complete');
				return;
			}

			typeLine(lines[lineIndex], function () {
				lineIndex += 1;
				typeNextLine();
			});
		}

		window.setTimeout(typeNextLine, Math.max(terminalIndex, 0) * 180);
	}

	terminalList.forEach(prepareTerminal);

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;

				animateTerminal(entry.target);
				observer.unobserve(entry.target);
			});
		},
		{
			rootMargin: '0px 0px 18% 0px',
			threshold: 0.12,
		}
	);

	terminalList.forEach(function (terminal) {
		observer.observe(terminal);
	});
})();

// === TERMINAL TYPE EFFECT ENDS === //
