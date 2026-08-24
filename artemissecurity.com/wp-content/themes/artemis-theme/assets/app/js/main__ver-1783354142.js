(function ($) {
  const media = '(max-width: 1024px) and (orientation: portrait)';

  $(document).ready(function () {
    $('.preloader').fadeOut(1000);

    if ($('[data-fancybox]').length > 0) {
      Fancybox.bind('[data-fancybox]', {
        placeFocusBack: false,
        groupAll: false,
        dragToClose: false,
        closeExisting: true,
      });
    }

    fixedHeaderActions();
    initInfoSectionAccordion();
    initSlideToggles('.career-section-2__item-head');
    initSlideToggles('.compare-table__accordion-btn');
    //initLogoCarousel();

    $('.burger-btn').on('click', function (e) {
      e.preventDefault();
      $('.burger-btn').toggleClass('isActive');
      $('.main-menu').toggleClass('isActive');
      $('body').toggleClass('fixed');
    });

    $('#go-to-form').on('click', function (e) {
      e.preventDefault();
      $('#book-a-demo').hide();
      $('#form-modal').show().css('display', 'flex');
    });

    $('#back-to-demo').on('click', function (e) {
      e.preventDefault();
      $('#form-modal').hide();
      $('#book-a-demo').show().css('display', 'flex');
    });

    //tabs for timeline
    $('.timeline-section__switcher button').on('click', function (e) {
      e.preventDefault();
      $('.timeline-section__switcher button').removeClass('isActive');
      $(this).addClass('isActive');
      let index = $(this).index();
      $('.timeline-section__tab').hide();
      $('.timeline-section__tab').eq(index).show();
    });

    // progress bar
    const progressBar = document.querySelector('.progress-bar__line');
    if (progressBar) {
      const updateProgress = () => {
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTop / height;
        progressBar.style.transform = `scaleX(${progress})`;
      };

      updateProgress();
      window.addEventListener('scroll', updateProgress);
    }

    //toc
    initTableOfContents();

    (function trackPageHistory() {
      const currentUrl = window.location.href;
      const savedCurrent = sessionStorage.getItem('current_page');

      if (savedCurrent && savedCurrent !== currentUrl) {
        sessionStorage.setItem('prev_page', savedCurrent);
      }

      sessionStorage.setItem('current_page', currentUrl);
    })();
  });

  $(window).on('load', function () {
    $('.feedback-marquee__slider').each(function () {
      const $container = $(this);
      const $track = $container.find('.feedback-marquee__track');
      const $content = $container.find('.feedback-marquee__content');

      // Use raw DOM element for better performance in the animation loop
      const trackEl = $track[0];

      let contentWidth = 0;
      let currentX = 0;
      let isPaused = false;
      let lastTime = null;

      // Speed is now calculated in pixels per millisecond.
      const speed = 0.03;

      // --- Drag state variables ---
      let isDragging = false;
      let startX = 0;
      let dragStartX = 0;

      // Function to calculate and clone items based on screen width
      function setupMarquee() {
        $track.find('.feedback-marquee__content:not(:first)').remove();
        contentWidth = $content.outerWidth();
        const containerWidth = $container.outerWidth();
        const clonesNeeded = Math.ceil(containerWidth / contentWidth) + 1;

        for (let i = 0; i < clonesNeeded; i++) {
          $track.append($content.clone());
        }
      }

      // Initialize clones
      setupMarquee();
      $container.addClass('is-ready');

      // Main animation loop with Delta Time
      function animate(currentTime) {
        if (!lastTime) lastTime = currentTime;
        let deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        if (deltaTime > 50) deltaTime = 16;

        // Only auto-scroll if not paused AND not being dragged by the user
        if (!isPaused && !isDragging) {
          currentX -= speed * deltaTime;

          // Handle wrapping for auto-scroll (moving left)
          if (currentX <= -contentWidth) {
            currentX = currentX % contentWidth;
          }

          trackEl.style.transform = `translate3d(${currentX}px, 0, 0)`;
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);

      // --- Drag & Swipe Logic ---

      // Start dragging
      $container.on('mousedown touchstart', function (e) {
        isDragging = true;
        isPaused = true;

        // Get correct X coordinate for either mouse or touch
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        dragStartX = currentX;

        $container.css('cursor', 'grabbing');
      });

      // Handle dragging anywhere on the screen (so it doesn't break if cursor leaves container)
      $(window).on('mousemove touchmove', function (e) {
        if (!isDragging) return;

        const currentEventX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const diffX = currentEventX - startX;

        currentX = dragStartX + diffX;

        // Handle seamless wrapping when dragging left (negative X)
        if (currentX <= -contentWidth) {
          currentX = currentX % contentWidth;
          // Reset drag anchors to prevent jump logic from accumulating
          startX = currentEventX;
          dragStartX = currentX;
        }
        // Handle seamless wrapping when dragging right (positive X)
        else if (currentX > 0) {
          currentX = -contentWidth + (currentX % contentWidth);
          startX = currentEventX;
          dragStartX = currentX;
        }

        trackEl.style.transform = `translate3d(${currentX}px, 0, 0)`;
      });

      // Stop dragging
      $(window).on('mouseup touchend', function () {
        if (!isDragging) return;

        isDragging = false;
        isPaused = false;
        $container.css('cursor', '');

        // Reset timer to prevent jump after releasing
        lastTime = performance.now();
      });

      // --- Pause on Hover (Desktop) ---
      $container.on('mouseenter', function () {
        if (!isDragging) isPaused = true;
      });

      $container.on('mouseleave', function () {
        // Only unpause if we aren't currently holding the mouse down
        if (!isDragging) {
          isPaused = false;
          lastTime = performance.now();
        }
      });

      // --- Handle Window Resize ---
      $(window).on('resize', function () {
        setupMarquee();
        if (contentWidth > 0) {
          currentX = currentX % contentWidth;
        }
      });
    });
  });

  //slider each START--------------------------------------------
  const defaultSliders = () => {
    let sliders = document.querySelectorAll('.default-slider');
    let prevArrow = document.querySelectorAll('.default-prev');
    let nextArrow = document.querySelectorAll('.default-next');
    let pagination = document.querySelectorAll('.default-pagination');
    if (sliders.length == 0) return false;

    sliders.forEach((slider, index) => {
      let initial = parseInt(slider.getAttribute('data-initial')) || 0;
      let offset = slider.getAttribute('data-offset');
      let loop = slider.getAttribute('data-loop') === 'true';
      let effect = slider.getAttribute('data-effect') || 'slide';
      let autoplay = slider.getAttribute('data-autoplay') === 'true';
      let centered = slider.getAttribute('data-centered') === 'true';
      let speed = parseInt(slider.getAttribute('data-speed')) || 5000;
      let duration = parseInt(slider.getAttribute('data-duration')) || 1000;
      let useActiveClass = slider.getAttribute('data-active-class') === 'true';

      let swiperOptions = {
        observe: true,
        observeParents: true,
        speed: duration,
        loop: loop,
        effect: effect,
        slidesPerView: 'auto',
        spaceBetween: offset,
        initialSlide: initial,
        centeredSlides: centered,
        navigation: {
          nextEl: nextArrow[index],
          prevEl: prevArrow[index],
        },
        pagination: {
          el: pagination[index],
          clickable: true,
        },
      };

      if (autoplay) {
        swiperOptions.autoplay = {
          delay: speed,
          disableOnInteraction: true,
        };
      }

      const swiper = new Swiper(slider, swiperOptions);

      if (useActiveClass) {
        const clearIsActive = () => {
          swiper.slides.forEach(s => s.classList.remove('isActive'));
        };
        const setIsActive = () => {
          clearIsActive();
          const current = slider.querySelector('.swiper-slide-active');
          if (current) current.classList.add('isActive');
        };
        setIsActive();
        swiper.on('slideChangeTransitionStart', clearIsActive);
        swiper.on('slideChangeTransitionEnd', setIsActive);
        swiper.on('resize', setIsActive);
        swiper.on('update', setIsActive);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', defaultSliders);

  //general functions
  let ticking = false;
  let lastScrollY = $(window).scrollTop();

  $(window).on('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fixedHeaderActions();
      ticking = false;
    });
  });

  $(window).on('resize orientationchange', fixedHeaderActions);

  function fixedHeaderActions() {
    const $header = $('.header');
    const currentScrollY = $(window).scrollTop();

    // Hysteresis thresholds: add at a deeper point, remove a bit earlier
    const ADD_AT = 80;    // when scrolling down past this Y -> add .fixed
    const REMOVE_AT = 40; // when scrolling up above this Y -> remove .fixed

    const hasFixed = $header.hasClass('fixed');

    // 1. Manage the .fixed class
    if (!hasFixed && currentScrollY >= ADD_AT) {
      // Add only once we are clearly past the add threshold
      $header.addClass('fixed');
    } else if (hasFixed && currentScrollY <= REMOVE_AT) {
      // Remove only once we are clearly above the remove threshold
      $header.removeClass('fixed');
    }

    // 2. Manage the scroll direction (hide/show)
    // Prevent issues with iOS/macOS bounce scrolling past the top
    if (currentScrollY <= 0) {
      $header.removeClass('hide-header');
    } else if (currentScrollY > lastScrollY && currentScrollY > ADD_AT) {
      // Scrolling down past the fixed threshold -> hide
      $header.addClass('hide-header');
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up -> show
      $header.removeClass('hide-header');
    }

    // Update the last scroll position for the next event
    lastScrollY = currentScrollY;
  }

  function initSlideToggles(selector, opts = {}) {
    // Init smooth slide toggles on any trigger selector.
    // Example:
    //   initSlideToggles('.footer-menus .menu-item-has-children > a', {
    //     duration: 250,
    //     openedClass: 'opened',
    //     // how to find the panel for each trigger:
    //     // 1) default: nextElementSibling
    //     // 2) data-target on trigger: <a data-target=".sub-menu">
    //     // 3) href="#panelId"
    //     // 4) or pass a function: target: (trigger) => trigger.parentElement.querySelector('.sub-menu')
    //     target: null,
    //     preventDefault: true,
    //     updateAria: true
    //   })
    const duration = Number.isFinite(opts.duration) ? opts.duration : 300
    const openedClass = opts.openedClass || 'opened'
    const preventDefault = opts.preventDefault !== false
    const updateAria = opts.updateAria !== false

    // ---------------- helpers ----------------
    const withScrollBehaviorOff = (fn) => {
      const html = document.documentElement
      const prev = html.style.scrollBehavior
      html.style.scrollBehavior = 'auto'
      try { fn() } finally { html.style.scrollBehavior = prev }
    }

    const getVerticalPadding = (el) => {
      const cs = window.getComputedStyle(el)
      return {
        top: cs.paddingTop,
        bottom: cs.paddingBottom
      }
    }

    // ---------------- animations ----------------
    const slideUp = (el) => {
      if (!el || el.dataset.sliding === '1') return
      el.dataset.sliding = '1'

      const padding = getVerticalPadding(el)

      el.style.height = el.offsetHeight + 'px'
      el.style.overflow = 'hidden'
      el.style.transitionProperty = 'height, padding'
      el.style.transitionDuration = duration + 'ms'

      withScrollBehaviorOff(() => {
        el.offsetHeight
        el.style.height = '0px'
        el.style.paddingTop = '0px'
        el.style.paddingBottom = '0px'
      })

      const onEnd = (e) => {
        if (e.target !== el) return
        el.removeEventListener('transitionend', onEnd)

        el.style.display = 'none'
        el.style.removeProperty('height')
        el.style.removeProperty('overflow')
        el.style.removeProperty('transition-property')
        el.style.removeProperty('transition-duration')
        el.style.paddingTop = padding.top
        el.style.paddingBottom = padding.bottom
        el.dataset.sliding = '0'
      }

      el.addEventListener('transitionend', onEnd)
    }

    const slideDown = (el) => {
      if (!el || el.dataset.sliding === '1') return
      el.dataset.sliding = '1'

      el.style.removeProperty('display')
      if (window.getComputedStyle(el).display === 'none') {
        el.style.display = 'block'
      }

      const padding = getVerticalPadding(el)

      el.style.paddingTop = '0px'
      el.style.paddingBottom = '0px'
      el.style.height = '0px'
      el.style.overflow = 'hidden'
      el.style.transitionProperty = 'height, padding'
      el.style.transitionDuration = duration + 'ms'

      const targetHeight = el.scrollHeight

      withScrollBehaviorOff(() => {
        el.offsetHeight
        el.style.height = targetHeight + 'px'
        el.style.paddingTop = padding.top
        el.style.paddingBottom = padding.bottom
      })

      const onEnd = (e) => {
        if (e.target !== el) return
        el.removeEventListener('transitionend', onEnd)

        el.style.removeProperty('height')
        el.style.removeProperty('overflow')
        el.style.removeProperty('transition-property')
        el.style.removeProperty('transition-duration')
        el.dataset.sliding = '0'
      }

      el.addEventListener('transitionend', onEnd)
    }

    const slideToggle = (el) => {
      const hidden =
        window.getComputedStyle(el).display === 'none' || el.offsetHeight === 0
      hidden ? slideDown(el) : slideUp(el)
    }

    // ---------------- target resolving ----------------
    const resolveTarget = (trigger) => {
      if (typeof opts.target === 'function') return opts.target(trigger)
      if (typeof opts.target === 'string') return document.querySelector(opts.target)

      const dataSel = trigger.getAttribute('data-target')
      if (dataSel) {
        try {
          return trigger.closest(':scope')?.querySelector(dataSel) || document.querySelector(dataSel)
        } catch {
          return document.querySelector(dataSel)
        }
      }

      const href = trigger.getAttribute('href')
      if (href && href.startsWith('#') && href.length > 1) {
        return document.getElementById(href.slice(1))
      }

      return trigger.nextElementSibling
    }

    // ---------------- events ----------------
    const onClick = (e) => {
      if (preventDefault) e.preventDefault()

      const trigger = e.currentTarget
      const panel = resolveTarget(trigger)
      if (!panel) return

      trigger.classList.toggle(openedClass)

      if (updateAria) {
        const expanded = trigger.classList.contains(openedClass)
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false')
        if (panel.id) trigger.setAttribute('aria-controls', panel.id)
      }

      slideToggle(panel)
    }

    // ---------------- init ----------------
    const triggers = typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : selector

    const list = Array.from(triggers || [])
    list.forEach((t) => t.addEventListener('click', onClick))

    // ---------------- API ----------------
    return {
      destroy() {
        list.forEach((t) => t.removeEventListener('click', onClick))
      },
      open(triggerEl) {
        const p = resolveTarget(triggerEl)
        if (p) slideDown(p)
      },
      close(triggerEl) {
        const p = resolveTarget(triggerEl)
        if (p) slideUp(p)
      },
      toggle(triggerEl) {
        const p = resolveTarget(triggerEl)
        if (p) slideToggle(p)
      }
    }
  }

  const initInfoSectionAccordion = ({
    selector = '.info-section',
    allowClose = false,
    duration = 300,
    autoplay = true
  } = {}) => {

    const $sections = $(selector);
    if (!$sections.length) return;

    // Define the mobile media query and get initial state
    const mobileMediaQuery = window.matchMedia('(max-width: 1024px) and (orientation: portrait)');
    let isMobile = mobileMediaQuery.matches;

    $sections.each(function () {
      const $section = $(this);
      const $items = $section.find('.info-section__item');
      const $heads = $section.find('.info-section__item-head');
      const $contents = $section.find('.info-section__item-content');
      const $mediaItems = $section.find('.info-section__media-item.--desktop');
      const $itemsWrapper = $section.find('.info-section__items');

      const delay = parseInt($itemsWrapper.data('time'), 10) || 10000;
      $section[0].style.setProperty('--switch-time', delay + 'ms');

      let currentIndex = 0;
      let interval = null;
      let isUserInteracted = false;
      let isIntersecting = false; // Keep track of visibility for resize events

      const closeAll = () => {
        $items.removeClass('isActive');
        $contents.stop(true, true).slideUp(duration);
      };

      const hideAllMedia = () => {
        $mediaItems.removeClass('isActive').hide();
      };

      const switchMedia = (index) => {
        $mediaItems.each(function (i) {
          const $media = $(this);
          if (i === index) {
            $media.css({ display: 'flex', opacity: 0 });
            requestAnimationFrame(() => {
              $media.addClass('isActive').css({ opacity: 1 });
            });
          } else {
            $media.removeClass('isActive').hide();
          }
        });
      };

      const openItem = (index) => {
        closeAll();
        $items.eq(index).addClass('isActive');
        $contents.eq(index).stop(true, true).slideDown(duration);
        switchMedia(index);
        currentIndex = index;
      };

      const nextItem = () => {
        let next = currentIndex + 1;
        if (next >= $items.length) next = 0;
        openItem(next);
      };

      const startAutoplay = () => {
        // Prevent starting if disabled, interacted, or on mobile
        if (!autoplay || isUserInteracted || isMobile) return;

        stopAutoplay();
        $section.addClass('--autoplay-enabled');
        interval = setInterval(nextItem, delay);
      };

      const stopAutoplay = () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
          $section.removeClass('--autoplay-enabled');
        }
      };

      // --- Handle screen resize / orientation changes ---
      const handleMediaChange = (e) => {
        isMobile = e.matches;

        if (isMobile) {
          // Stop immediately if switched to mobile view
          stopAutoplay();
        } else if (isIntersecting && !isUserInteracted) {
          // Resume if switched back to desktop and block is still visible
          startAutoplay();
        }
      };

      // Listen for changes in the media query
      mobileMediaQuery.addEventListener('change', handleMediaChange);

      // --- Intersection Observer Logic ---
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting; // Update visibility state

          if (isIntersecting) {
            if (!isUserInteracted) {
              startAutoplay();
            }
          } else {
            stopAutoplay();
            isUserInteracted = false;

            // if ($items.length) {
            //   openItem(0);
            // }
          }
        });
      }, {
        threshold: 0.2
      });

      observer.observe($section[0]);

      $heads.off('click.infoAccordion').on('click.infoAccordion', function () {
        isUserInteracted = true;
        stopAutoplay();

        const $item = $(this).closest('.info-section__item');
        const index = $item.index();
        const isActive = $item.hasClass('isActive');

        if (isActive && allowClose) {
          $item.removeClass('isActive');
          $contents.eq(index).stop(true, true).slideUp(duration);
          hideAllMedia();
          return;
        }

        openItem(index);
      });

      // Initial setup
      if ($items.length) {
        openItem(0);
      }
    });
  };

  function initTableOfContents() {
    const content = document.querySelector('#page-content');
    const tocList = document.querySelector('#toc');
    if (!content || !tocList) return;

    const headings = content.querySelectorAll('h2');
    const links = [];

    // Flag to temporarily disable observer updates during anchor clicks
    let isClickScrolling = false;
    let scrollTimeout;

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = 'toc-heading-' + index;
      }

      const li = document.createElement('li');
      const a = document.createElement('a');

      a.href = '#' + heading.id;
      a.textContent = heading.textContent;

      // Handle click to manually set active class and pause observer
      a.addEventListener('click', () => {
        isClickScrolling = true;

        // Manually assign active class
        links.forEach(link => link.classList.remove('active'));
        a.classList.add('active');

        // Reset the flag after scrolling is assumed to be finished
        // Adjust the 800ms delay if your smooth scroll takes longer
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isClickScrolling = false;
        }, 800);
      });

      li.appendChild(a);
      tocList.appendChild(li);
      links.push(a);
    });

    if (links.length > 0) {
      links[0].classList.add('active');
    }

    const observer = new IntersectionObserver((entries) => {
      // Ignore intersection events if we are currently scrolling via anchor click
      if (isClickScrolling) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => link.classList.remove('active'));
          const id = entry.target.id;
          const activeLink = tocList.querySelector(`a[href="#${id}"]`);

          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, {
      // Adjusted rootMargin to better capture top-aligned headings.
      // If you experience issues, consider changing '-15%' to a fixed pixel 
      // value that matches your header height (e.g., '-80px').
      rootMargin: '-15% 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(h => observer.observe(h));
  }

  function initLogoCarousel() {
    const container = document.querySelector('.home-hero__logos-items');
    if (!container) return;

    const originalImages = Array.from(container.querySelectorAll('img'));
    if (!originalImages.length) return;

    const mediaQuery = window.matchMedia('(max-width: 1024px) and (orientation: portrait)');
    let intervals = [];

    function build() {
      intervals.forEach(clearInterval);
      intervals = [];
      container.innerHTML = '';

      const columnsCount = mediaQuery.matches ? 2 : 5;
      const columns = [];

      const itemsPerColumn = Math.ceil(originalImages.length / columnsCount);

      for (let i = 0; i < columnsCount; i++) {
        const chunk = originalImages.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn);
        if (chunk.length > 0) {
          columns.push(chunk);
        }
      }

      container.classList.add('logo-carousel-container');

      columns.forEach((colImages, colIndex) => {
        const colElement = document.createElement('div');
        colElement.className = 'logo-carousel-column';

        const trackElement = document.createElement('div');
        trackElement.className = 'logo-carousel-track';

        const totalImages = colImages.length;

        // Wrap each image in a div and append to track
        colImages.forEach(img => {
          const itemWrapper = document.createElement('div');
          itemWrapper.className = 'logo-carousel-item';
          itemWrapper.appendChild(img.cloneNode(true));
          trackElement.appendChild(itemWrapper);
        });

        // Clone the whole wrapper (not just the image) for the loop
        if (totalImages > 1) {
          const firstItemClone = trackElement.firstChild.cloneNode(true);
          trackElement.appendChild(firstItemClone);
        }

        colElement.appendChild(trackElement);
        container.appendChild(colElement);

        if (totalImages > 1) {
          let currentIndex = 0;
          const trackItemsCount = totalImages + 1;
          const transitionSpeed = 800;

          trackElement.addEventListener('transitionend', () => {
            if (currentIndex === totalImages) {
              trackElement.style.transition = 'none';
              trackElement.style.transform = 'translateY(0)';
              trackElement.offsetHeight; // Force reflow
              currentIndex = 0;
            }
          });

          setTimeout(() => {
            const interval = setInterval(() => {
              // Check if the browser tab is inactive. If yes, skip this frame entirely
              if (document.hidden) return;

              currentIndex++;

              // Failsafe: if the index somehow gets out of bounds due to deep background throttling
              if (currentIndex > totalImages) {
                trackElement.style.transition = 'none';
                trackElement.style.transform = 'translateY(0)';
                trackElement.offsetHeight;
                currentIndex = 1;
              }

              trackElement.style.transition = `transform ${transitionSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)`;
              const translateY = currentIndex * (100 / trackItemsCount);
              trackElement.style.transform = `translateY(-${translateY}%)`;
            }, 3000);

            intervals.push(interval);
          }, colIndex * 400);
        }
      });
    }

    build();
    mediaQuery.addEventListener('change', build);
  }
})(jQuery);

(() => {
  'use strict';

  // ===== CONFIG you can tweak =====
  const CONFIG = {
    selector: '.init-number',
    startDelayMs: 100,       // delay before starting after entering the viewport
    viewThreshold: 0.75,     // fraction of the element that must be visible (0..1)
    rootMargin: '0px 0px -10% 0px', // trim the viewport bottom so the start happens later
    duration: 2000,          // duration of the roll for a single column
    stepDelay: 60            // stagger delay between columns
  };

  // --- minimal styles (added once) ---
  const STYLE_ID = 'num-roller-style';
  if (!document.getElementById(STYLE_ID)) {
    const css = `
      .num-roller{display:inline-flex;gap:.02em;align-items:flex-end}
      .num-roller-col{display:inline-block;overflow:hidden;height:1em;line-height:1;text-align:center}
      .num-roller-inner{display:block;will-change:transform;transform:translateY(100%)}
      .num-roller-cell{display:block;height:1em;}
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Build DOM for one .number element
  const buildRoller = (el) => {
    const raw = (el.textContent || '').trim();
    el.textContent = '';
    el.classList.add('num-roller');

    [...raw].forEach((ch) => {
      const col = document.createElement('span');
      col.className = 'num-roller-col';

      const inner = document.createElement('span');
      inner.className = 'num-roller-inner';
      col.appendChild(inner);

      const isDigit = /\d/.test(ch);

      if (isDigit && ch !== '0') {
        const target = Number(ch);
        for (let d = 0; d <= target; d++) {
          const cell = document.createElement('span');
          cell.className = 'num-roller-cell';
          cell.textContent = String(d);
          inner.appendChild(cell);
        }
        col.dataset.type = 'digit';
        col.dataset.target = String(target);
        inner.style.transform = 'translateY(0)';
      } else {
        const cell = document.createElement('span');
        cell.className = 'num-roller-cell';
        cell.textContent = isDigit ? '0' : ch;
        inner.appendChild(cell);
        col.dataset.type = 'symbol';
        inner.style.transform = 'translateY(100%)';
      }

      el.appendChild(col);
    });
  };

  // Animate one .number element
  const animateRoller = (el) => {
    const cols = el.querySelectorAll('.num-roller-col');

    cols.forEach((col, i) => {
      const inner = col.querySelector('.num-roller-inner');

      inner.style.transition =
        `transform ${CONFIG.duration}ms cubic-bezier(.22,1,.36,1) ${i * CONFIG.stepDelay}ms`;

      requestAnimationFrame(() => {
        if (col.dataset.type === 'digit') {
          const target = Number(col.dataset.target || 0);

          // Use 'em' units instead of calculating static pixels.
          // Since each cell is exactly 1em tall, moving down by 'target' em 
          // keeps the animation perfectly responsive on window resize.
          inner.style.transform = `translateY(-${target}em)`;
        } else {
          inner.style.transform = 'translateY(0)';
        }
      });
    });
  };

  // Init all .number
  const initCounters = () => {
    const nodes = [...document.querySelectorAll(CONFIG.selector)];
    if (!nodes.length) return;

    nodes.forEach(buildRoller);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Slight delay before animation starts
            setTimeout(() => animateRoller(el), CONFIG.startDelayMs);
            io.unobserve(el);
          }
        });
      },
      {
        threshold: CONFIG.viewThreshold,
        rootMargin: CONFIG.rootMargin
      }
    );

    nodes.forEach((n) => io.observe(n));
  };

  document.addEventListener('DOMContentLoaded', initCounters);
})();