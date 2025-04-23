import { AnimateByElements, AnimateScrubByElements } from './TimelineText.js';

window.addEventListener('load', async () => {
  await RemoveLoader();
  BannerBgEffect.init();
  AlignBleedOut();
  InitializeSliders();
  HideBrokenImg();
  AnimateByElements();
  AnimateScrubByElements();
  CurtainOpener();
  GsapImgParallax();
  window.addEventListener('resize', BannerBgEffect.init);
  window.addEventListener('resize', AlignBleedOut);
  window.addEventListener('resize', CurtainOpener);
});

function RemoveLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById('loader');
    if (!loader) return;

    let loopCounter = 0;

    const animationIterationHandler = () => {
      if (loopCounter < 1) {
        loopCounter++;
        return;
      }

      // Apply styles and resolve the promise after a brief delay to allow the styles to be applied
      loader.classList.add('loaded');
      // Resolve the promise after styles are applied
      resolve();
    };

    loader
      .querySelector('.loader')
      .addEventListener('animationiteration', animationIterationHandler);
  });
}

function HideBrokenImg() {
  document.querySelectorAll('img').forEach(function (img) {
    img.onerror = function () {
      this.style.display = 'none';
    };
    if (img.src.includes('.html')) {
      img.style.display = 'none';
    }
  });
}

const BannerBgEffect = (() => {
  // Shared variables
  let resizeTimer;
  const hexBgElements = new Map(); // Track elements and their data
  const easingValue = 0.08;

  // Create and cache the hex grid only when needed
  function createHexGrid(hexBg) {
    // Get element data
    const boxDimension = parseInt(
      hexBg.getAttribute('data-box-dimension') || '130',
      10
    );
    const rect = hexBg.getBoundingClientRect();
    const height = rect.height;
    const width = rect.width;

    // Clear existing content
    hexBg.innerHTML = '';

    // Calculate grid dimensions
    const rows = Math.ceil(height / boxDimension);
    const columns = Math.ceil(width / boxDimension);

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Create grid with fewer DOM operations
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');

      for (let j = 0; j < columns; j++) {
        const column = document.createElement('div');
        column.classList.add('col');
        row.appendChild(column);
      }

      fragment.appendChild(row);
    }

    // Append all elements at once
    hexBg.appendChild(fragment);

    // Store element data
    if (!hexBgElements.has(hexBg)) {
      const elementData = {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        isHovering: false,
        animationFrameId: null,
        isBgEffect: hexBg.classList.contains('bgEffect'),
      };
      hexBgElements.set(hexBg, elementData);
    }

    // Reset gradient position
    resetGradient(hexBg);
  }

  // Optimize animation frame handling
  function updateGradientPositions() {
    hexBgElements.forEach((data, element) => {
      if (!data.isHovering && !isMoving(data)) {
        data.animationFrameId = null;
        return;
      }

      // Calculate new position with easing
      data.currentX += (data.targetX - data.currentX) * easingValue;
      data.currentY += (data.targetY - data.currentY) * easingValue;

      // Batch style updates with transform instead of CSS variables when possible
      element.style.setProperty('--x', `${data.currentX}px`);
      element.style.setProperty('--y', `${data.currentY}px`);

      // Continue animation if needed
      if (data.isHovering || isMoving(data)) {
        data.animationFrameId = requestAnimationFrame(() =>
          updateGradientPositions()
        );
      } else {
        data.animationFrameId = null;
      }
    });
  }

  function isMoving(data) {
    const distanceX = Math.abs(data.currentX - data.targetX);
    const distanceY = Math.abs(data.currentY - data.targetY);
    return distanceX > 0.5 || distanceY > 0.5;
  }

  function moveGradient(event, element) {
    const data = hexBgElements.get(element);
    if (!data) return;

    // Calculate position relative to the element
    const rect = element.getBoundingClientRect();
    data.targetX = event.clientX - rect.left;
    data.targetY = event.clientY - rect.top;
    data.isHovering = true;

    // Start animation loop if not already running
    if (!data.animationFrameId) {
      data.animationFrameId = requestAnimationFrame(() =>
        updateGradientPositions()
      );
    }
  }

  function resetGradient(element) {
    const data = hexBgElements.get(element);
    if (!data) return;

    const rect = element.getBoundingClientRect();
    const gradX = parseFloat(element.getAttribute('data-gradX') || '0.5');
    const gradY = parseFloat(element.getAttribute('data-gradY') || '0.5');

    // Set target to specified position
    data.targetX = rect.width * gradX;
    data.targetY = rect.height * gradY;
    data.isHovering = false;

    // Set size once instead of repeatedly
    const size =
      element.getAttribute('data-gradSize') || `${rect.height * 1.2}px`;
    element.style.setProperty('--size', size);

    // Ensure animation continues until we reach the target
    if (!data.animationFrameId) {
      data.animationFrameId = requestAnimationFrame(() =>
        updateGradientPositions()
      );
    }
  }

  // Setup and init function
  function init() {
    // Remove any existing listeners from previous inits
    cleanup();

    // Find and initialize all hex backgrounds
    const hexBgs = document.querySelectorAll('.hexBg');

    hexBgs.forEach((hexBg) => {
      createHexGrid(hexBg);

      const data = hexBgElements.get(hexBg);
      if (!data || !data.isBgEffect) return;

      // Use event delegation with passive option for better performance
      const parentElement = hexBg.parentElement;
      parentElement.addEventListener('mouseleave', () => resetGradient(hexBg), {
        passive: true,
      });
      parentElement.addEventListener(
        'mousemove',
        (e) => moveGradient(e, hexBg),
        { passive: true }
      );
    });

    // Handle resize with debounce
    window.addEventListener('resize', debounceResize);
  }

  // Clean up function to remove event listeners
  function cleanup() {
    // Remove existing event listeners to prevent duplicates
    hexBgElements.forEach((data, element) => {
      const parentElement = element.parentElement;
      if (parentElement) {
        parentElement.removeEventListener('mouseleave', () =>
          resetGradient(element)
        );
        parentElement.removeEventListener('mousemove', (e) =>
          moveGradient(e, element)
        );
      }

      // Cancel any pending animations
      if (data.animationFrameId) {
        cancelAnimationFrame(data.animationFrameId);
        data.animationFrameId = null;
      }
    });

    // Clear element cache
    hexBgElements.clear();
  }

  // Debounce resize handler to avoid excessive recalculations
  function debounceResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      init();
    }, 250); // Wait 250ms after resize stops
  }

  // Return public API
  return {
    init,
    cleanup,
  };
})();

function AlignBleedOut() {
  const bleedOutRightWrapper =
    document.querySelector('.bleedOutRight') ?? false;
  if (!bleedOutRightWrapper) return;

  const siblingContainer =
    bleedOutRightWrapper.parentElement.querySelector('.container');

  const computedStyles = window.getComputedStyle(siblingContainer);
  bleedOutRightWrapper.style.marginInlineStart =
    computedStyles.marginInlineStart;
  bleedOutRightWrapper.style.paddingInlineStart =
    computedStyles.paddingInlineStart;
}

function InitializeSliders() {
  const padingUnits = 'max(10%,6rem)';

  //timelineSliders
  const dateSlider =
    document.querySelector('.timelineSliders .dateSlider') ?? false;
  const imgSlider =
    document.querySelector('.timelineSliders .imgSlider') ?? false;
  if (dateSlider && imgSlider) {
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 4,
      updateOnMove: true,
      focus: 'center',
      padding: { right: padingUnits },
      breakpoints: {
        800: {
          perPage: 2,
        },
        600: {
          perPage: 1,
        },
      },
    };
    const dateSliderr = new Splide(dateSlider, sliderOptions);
    const imgSliderr = new Splide(imgSlider, {
      ...sliderOptions,
      gap: '2rem',
    });
    imgSliderr.sync(dateSliderr);
    dateSliderr.mount();
    imgSliderr.mount();

    imgSliderr.on('click', (Slide, e) => {
      const index = Slide.index;
      imgSliderr.go(index);
      dateSliderr.go(index);
    });
  }

  const newsSlider = document.querySelector('.newsSlider') ?? false;
  if (newsSlider) {
    const prevBtn = newsSlider.parentElement.querySelector('button[data-prev]');
    const nextBtn = newsSlider.parentElement.querySelector('button[data-next]');
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 3,
      updateOnMove: true,
      focus: 'center',
      gap: '3rem',
      start: 2,
      padding: { left: padingUnits, right: padingUnits },
      breakpoints: {
        800: {
          perPage: 2,
        },
        600: {
          perPage: 1,
        },
      },
    };

    const slider = new Splide(newsSlider, sliderOptions);
    slider.mount();
    prevBtn.addEventListener('click', () => {
      slider.go('<');
    });
    nextBtn.addEventListener('click', () => {
      slider.go('>');
    });
  }
  const bgImgSlider = document.querySelector('.bgImgSlider') ?? false;
  if (bgImgSlider) {
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 3,
      updateOnMove: true,
      focus: 'center',
      gap: '1.5rem',
      type: 'loop',
      autoplay: true,
      padding: { left: padingUnits, right: padingUnits },
      breakpoints: {
        800: {
          perPage: 2,
        },
        600: {
          perPage: 1,
        },
      },
    };
    const slider = new Splide(bgImgSlider, sliderOptions);
    slider.mount();
  }
  const logosSlider = document.querySelector('.logos-slider');
  if (logosSlider) {
    const logosSliderr = new Splide(logosSlider, {
      type: 'slide',
      autoWidth: true,
      gap: '1rem',
      pagination: false,
      arrows: false,
    });
    const Components = logosSliderr.Components;
    logosSliderr.on('resized', function () {
      const isOverflow = Components.Layout.isOverflow();
      const list = Components.Elements.list;
      const lastSlide = Components.Slides.getAt(logosSliderr.length - 1);

      if (lastSlide) {
        // Toggles `justify-content: center`
        list.style.justifyContent = isOverflow ? '' : 'center';

        // Remove the last margin
        if (!isOverflow) {
          lastSlide.slide.style.marginRight = '';
        }
      }
    });

    logosSliderr.mount();
  }
}

function CurtainOpener() {
  const curtains = document.querySelectorAll('.curtain');

  curtains.forEach((curtain) => {
    const images = curtain.querySelectorAll('img[loading="lazy"]');

    // If no images, process immediately
    if (images.length === 0) {
      positionCurtain(curtain);
      return;
    }

    // Track loaded images
    let loadedCount = 0;

    // For each image
    images.forEach((img) => {
      // If already complete, increment counter
      if (img.complete) {
        loadedCount++;
        // If all images are loaded, position the curtain
        if (loadedCount === images.length) {
          positionCurtain(curtain);
        }
      } else {
        // Add load event for images still loading
        img.addEventListener('load', () => {
          loadedCount++;
          // If all images are loaded, position the curtain
          if (loadedCount === images.length) {
            positionCurtain(curtain);
          }
        });
      }
    });
  });
}

// Helper function to handle the positioning logic
function positionCurtain(curtain) {
  // Get original position and dimensions
  const originalTop = curtain.offsetTop;
  const curtainHeight = curtain.offsetHeight;

  // Calculate distance from bottom of document
  const documentHeight =
    document.documentElement.getBoundingClientRect().height;
  const fromBottom = documentHeight - (originalTop + curtainHeight);
  // Add margin to previous element to maintain document flow
  if (curtain.previousElementSibling) {
    curtain.previousElementSibling.style.marginBlockEnd = curtainHeight + 'px';
  }

  // Set position fixed with the bottom value
  curtain.style.position = 'fixed';
  curtain.style.bottom = fromBottom + 'px';
  curtain.style.top = 'auto'; // Clear any top value
  curtain.style.marginInline = 'auto'; // Clear any top value
  curtain.style.insetInline = '0'; // Clear any top value
}

function GsapImgParallax() {
  gsap.utils.toArray('.parallax-image-container').forEach(function (container) {
    let image = container.querySelector('img');

    gsap.to(image, {
      y: () => image.offsetHeight * 1.2 - container.offsetHeight,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        scrub: true,
        pin: false,
        start: 'top bottom', // when container enters viewport
        end: 'bottom top', // when it leaves
        markers: false,
        invalidateOnRefresh: true,
      },
    });
  });
}
