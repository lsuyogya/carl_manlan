document.addEventListener('DOMContentLoaded', () => {
  BannerBgEffect();
  alignBleedOut();
  initializeSliders();
  hideBrokenImg();
  window.addEventListener('resize', BannerBgEffect);
  window.addEventListener('resize', alignBleedOut);
});

function hideBrokenImg() {
  document.querySelectorAll('img').forEach(function (img) {
    img.onerror = function () {
      this.style.display = 'none';
    };
    if (img.src.includes('.html')) {
      img.style.display = 'none';
    }
  });
}

function BannerBgEffect() {
  const hexBgs = document.querySelectorAll('.hexBg');

  // Clear any existing content first to prevent duplication on resize
  hexBgs.forEach((hexBg) => {
    hexBg.innerHTML = '';

    const boxDimension = 130;
    const rect = hexBg.getBoundingClientRect();
    const height = rect.height;
    const width = rect.width;

    const rows = Math.ceil(height / boxDimension);
    const columns = Math.ceil(width / boxDimension);

    // Create grid
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');

      for (let j = 0; j < columns; j++) {
        const column = document.createElement('div');
        column.classList.add('col');
        row.appendChild(column);
      }

      hexBg.appendChild(row);
    }
    // Set initial gradient position (center of element)
    resetGradient(hexBg);

    if (hexBg.classList.contains('.bgEffect')) return;
    // Event handlers
    parentElement = hexBg.parentElement;
    parentElement.addEventListener('mouseleave', () => {
      resetGradient(hexBg);
    });

    parentElement.addEventListener('mousemove', (e) => {
      moveGradient(e, hexBg);
    });
  });
}

// Add these variables at the top of your script or in an appropriate scope
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
let isHovering = false;
let animationFrameId = null;
const easing = 0.08; // Adjust for smoother/slower or faster/less smooth

function moveGradient(event, element) {
  // Calculate position relative to the element
  const rect = element.getBoundingClientRect();
  targetX = event.clientX - rect.left;
  targetY = event.clientY - rect.top;
  isHovering = true;

  // Start animation loop if not already running
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(() =>
      updateGradientPosition(element)
    );
  }
}

function resetGradient(element) {
  const rect = element.getBoundingClientRect();
  // Set target to right edge when not hovering
  targetX = rect.width * element.getAttribute('data-gradX');
  targetY = rect.height * element.getAttribute('data-gradY');
  isHovering = false;

  element.style.setProperty('--size', `${rect.height * 1.2}px`);
  // Ensure animation continues until we reach the target
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(() =>
      updateGradientPosition(element)
    );
  }
}

function updateGradientPosition(element) {
  // Calculate new position with easing (lerp)

  currentX = currentX + (targetX - currentX) * easing;
  currentY = currentY + (targetY - currentY) * easing;

  // Apply the new position
  element.style.setProperty('--x', `${currentX}px`);
  element.style.setProperty('--y', `${currentY}px`);

  // Continue animation if still hovering or if we haven't reached the target
  const distanceX = Math.abs(currentX - targetX);
  const distanceY = Math.abs(currentY - targetY);
  const isMoving = distanceX > 0.5 || distanceY > 0.5;

  if (isHovering || isMoving) {
    animationFrameId = requestAnimationFrame(() =>
      updateGradientPosition(element)
    );
  } else {
    animationFrameId = null;
  }
}

function alignBleedOut() {
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

function initializeSliders() {
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
  const prevBtn = newsSlider.parentElement.querySelector('button[data-prev]');
  const nextBtn = newsSlider.parentElement.querySelector('button[data-next]');
  if (newsSlider) {
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

  const logosSlider = new Splide('.logos-slider', {
    type: 'slide',
    autoWidth: true,
    gap: '1rem',
    pagination: false,
    arrows: false,
  });
  const Components = logosSlider.Components;
  logosSlider.on('resized', function () {
    const isOverflow = Components.Layout.isOverflow();
    const list = Components.Elements.list;
    const lastSlide = Components.Slides.getAt(logosSlider.length - 1);

    if (lastSlide) {
      // Toggles `justify-content: center`
      list.style.justifyContent = isOverflow ? '' : 'center';

      // Remove the last margin
      if (!isOverflow) {
        lastSlide.slide.style.marginRight = '';
      }
    }
  });

  logosSlider.mount();
}
