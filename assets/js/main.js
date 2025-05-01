import { AnimateByElements, AnimateScrubByElements } from "./TimelineText.js";
import {
  setHeaderHeight,
  setScrollPos,
  stickyHeader,
  handleSubmenuAnimation,
} from "./menu.js";

window.addEventListener("load", async () => {
  featherInit();
  lenisInit();
  await RemoveLoader();
  BannerBgEffect.init();
  //menu
  setHeaderHeight();
  setScrollPos();
  stickyHeader();
  handleSubmenuAnimation();
  //menu-end
  AlignBleedOut();
  InitializeSliders();
  HideBrokenImg();
  AnimateByElements();
  AnimateScrubByElements();
  CurtainOpener();
  GsapImgParallax();
  verticalTimelineInit();
  window.addEventListener("resize", setHeaderHeight);
  window.addEventListener("resize", BannerBgEffect.init);
  window.addEventListener("resize", AlignBleedOut);
  window.addEventListener("resize", CurtainOpener);
});

function featherInit() {
  if (feather) feather.replace();
}

function lenisInit() {
  if (Lenis && gsap) {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    window.lenis = lenis; // Expose Lenis instance globally for debugging
    // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);
  }
}

function RemoveLoader() {
  window.scrollTo({ top: 0 });
  return new Promise((resolve) => {
    const loader = document.getElementById("loader");
    if (!loader) return;

    let loopCounter = 0;

    const animationIterationHandler = () => {
      if (loopCounter < 1) {
        loopCounter++;
        return;
      }

      // Apply styles and resolve the promise after a brief delay to allow the styles to be applied
      loader.classList.add("loaded");
      // Resolve the promise after styles are applied
      resolve();
    };

    loader
      .querySelector(".loader")
      .addEventListener("animationiteration", animationIterationHandler);
  });
}

function HideBrokenImg() {
  document.querySelectorAll("img").forEach(function (img) {
    img.onerror = function () {
      this.style.display = "none";
    };
    if (img.src.includes(".html")) {
      img.style.display = "none";
    }
  });
}

const BannerBgEffect = (() => {
  // Shared variables
  let resizeTimer;
  const hexBgElements = new Map(); // Track elements and their data
  const easingValue = 0.08;
  const MOVEMENT_THRESHOLD = 0.5; // Threshold for detecting movement
  let animationRunning = false; // Global animation state tracker

  // Create and cache the hex grid only when needed
  function createHexGrid(hexBg) {
    // Get element data
    const boxDimension = parseInt(
      hexBg.getAttribute("data-box-dimension") || "130",
      10
    );
    const rect = hexBg.getBoundingClientRect();
    const height = rect.height;
    const width = rect.width;

    // Calculate grid dimensions
    const rows = Math.ceil(height / boxDimension);
    const columns = Math.ceil(width / boxDimension);

    // Only rebuild if necessary
    const existingRows = hexBg.querySelectorAll(".row").length;
    const existingCols =
      hexBg.querySelector(".row")?.querySelectorAll(".col").length || 0;

    if (existingRows === rows && existingCols === columns) {
      // Grid already exists with correct dimensions
      resetGradient(hexBg);
      return;
    }

    // Clear existing content
    hexBg.innerHTML = "";

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Create all row and column elements at once to minimize DOM operations
    const rowElements = [];
    const columnElements = [];

    for (let i = 0; i < rows; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      rowElements.push(row);

      for (let j = 0; j < columns; j++) {
        const column = document.createElement("div");
        column.classList.add("col");
        columnElements.push({ column, rowIndex: i });
      }
    }

    // Append all columns to their respective rows
    columnElements.forEach(({ column, rowIndex }) => {
      rowElements[rowIndex].appendChild(column);
    });

    // Append all rows to the fragment
    rowElements.forEach((row) => fragment.appendChild(row));

    // Append all elements at once
    hexBg.appendChild(fragment);

    // Store element data
    const elementData = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      isHovering: false,
      needsUpdate: true,
      isBgEffect: hexBg.classList.contains("bgEffect"),
      lastUpdateTime: 0,
    };

    hexBgElements.set(hexBg, elementData);

    // Set up the gradient
    resetGradient(hexBg);
  }

  // Single global animation loop for all elements
  function updateAllGradientPositions(timestamp) {
    // Limit updates to 60fps
    const timeSinceLastFrame = timestamp - (lastGlobalUpdateTime || 0);
    if (timeSinceLastFrame < 16) {
      // ~60fps
      animationRunning = true;
      requestAnimationFrame(updateAllGradientPositions);
      return;
    }

    lastGlobalUpdateTime = timestamp;
    let needsMoreFrames = false;

    // Only process if we're on a device that should show the effect
    if (window.innerWidth > 1000) {
      hexBgElements.forEach((data, element) => {
        // Skip elements that don't need updates
        if (!data.isHovering && !isMoving(data) && !data.needsUpdate) {
          return;
        }

        // Calculate new position with easing
        const prevX = data.currentX;
        const prevY = data.currentY;

        data.currentX += (data.targetX - data.currentX) * easingValue;
        data.currentY += (data.targetY - data.currentY) * easingValue;

        // Check if we've made enough movement to warrant a DOM update
        const deltaX = Math.abs(prevX - data.currentX);
        const deltaY = Math.abs(prevY - data.currentY);

        if (deltaX > 0.1 || deltaY > 0.1 || data.needsUpdate) {
          // Round to 2 decimal places to reduce floating point issues
          const roundedX = Math.round(data.currentX * 100) / 100;
          const roundedY = Math.round(data.currentY * 100) / 100;

          // Batch style updates with transform instead of CSS variables
          element.style.setProperty("--x", `${roundedX}px`);
          element.style.setProperty("--y", `${roundedY}px`);

          data.needsUpdate = false;
        }

        // Check if this element needs more animation frames
        if (data.isHovering || isMoving(data)) {
          needsMoreFrames = true;
        }
      });
    }

    // Only continue animation if there's still movement needed
    if (needsMoreFrames) {
      animationRunning = true;
      requestAnimationFrame(updateAllGradientPositions);
    } else {
      animationRunning = false;
    }
  }

  let lastGlobalUpdateTime = 0;

  function isMoving(data) {
    const distanceX = Math.abs(data.targetX - data.currentX);
    const distanceY = Math.abs(data.targetY - data.currentY);
    return distanceX > MOVEMENT_THRESHOLD || distanceY > MOVEMENT_THRESHOLD;
  }

  function moveGradient(event, element) {
    const data = hexBgElements.get(element);
    if (!data) return;

    // Calculate position relative to the element
    const rect = element.getBoundingClientRect();
    data.targetX = event.clientX - rect.left;
    data.targetY = event.clientY - rect.top;
    data.isHovering = true;
    data.needsUpdate = true;

    // Start global animation loop if not already running
    if (!animationRunning) {
      animationRunning = true;
      requestAnimationFrame(updateAllGradientPositions);
    }
  }

  // Use a throttled event handler for mousemove
  function throttledMoveHandler(element) {
    let lastExecution = 0;
    const THROTTLE_DELAY = 16; // 60fps in ms

    return function (event) {
      const now = performance.now();
      if (now - lastExecution > THROTTLE_DELAY) {
        lastExecution = now;
        moveGradient(event, element);
      }
    };
  }

  function resetGradient(element) {
    const data = hexBgElements.get(element);
    if (!data) return;

    const rect = element.getBoundingClientRect();
    const gradX = parseFloat(element.getAttribute("data-gradX") || "0.5");
    const gradY = parseFloat(element.getAttribute("data-gradY") || "0.5");

    // Set target to specified position
    data.targetX = rect.width * gradX;
    data.targetY = rect.height * gradY;
    data.isHovering = false;
    data.needsUpdate = true;

    // Set size once instead of repeatedly
    const size =
      element.getAttribute("data-gradSize") || `${rect.height * 1.2}px`;
    element.style.setProperty("--size", size);

    // Ensure animation continues until we reach the target
    if (!animationRunning && isMoving(data)) {
      animationRunning = true;
      requestAnimationFrame(updateAllGradientPositions);
    }
  }

  // Element cache for event handlers to prevent memory leaks
  const elementHandlers = new WeakMap();

  // Setup and init function
  function init() {
    // Remove any existing listeners from previous inits
    cleanup();

    // Find and initialize all hex backgrounds
    const hexBgs = document.querySelectorAll(".hexBg");

    hexBgs.forEach((hexBg) => {
      createHexGrid(hexBg);

      const data = hexBgElements.get(hexBg);
      if (!data || !data.isBgEffect) return;

      // Create cached event handlers for this element
      const parentElement = hexBg.parentElement;
      if (parentElement) {
        const handlers = {
          mouseleave: () => resetGradient(hexBg),
          mousemove: throttledMoveHandler(hexBg),
        };

        // Store handlers for cleanup
        elementHandlers.set(hexBg, {
          parent: parentElement,
          handlers,
        });

        // Add event listeners
        parentElement.addEventListener("mouseleave", handlers.mouseleave, {
          passive: true,
        });

        parentElement.addEventListener("mousemove", handlers.mousemove, {
          passive: true,
        });
      }
    });

    // Handle resize with debounce
    window.addEventListener("resize", debounceResize);
  }

  // Clean up function to remove event listeners
  function cleanup() {
    // Cancel any pending animations
    if (animationRunning) {
      animationRunning = false;
    }

    // Clear timeout if any
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    // Remove existing event listeners to prevent duplicates
    hexBgElements.forEach((_, element) => {
      const handlerData = elementHandlers.get(element);
      if (handlerData) {
        const { parent, handlers } = handlerData;
        parent.removeEventListener("mouseleave", handlers.mouseleave);
        parent.removeEventListener("mousemove", handlers.mousemove);
      }
    });

    // Clear element caches
    hexBgElements.clear();
    // Note: We don't clear elementHandlers as it's a WeakMap
    // that will garbage collect automatically
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
    document.querySelector(".bleedOutRight") ?? false;
  if (!bleedOutRightWrapper) return;

  const siblingContainer =
    bleedOutRightWrapper.parentElement.querySelector(".container");

  const computedStyles = window.getComputedStyle(siblingContainer);
  bleedOutRightWrapper.style.marginInlineStart =
    computedStyles.marginInlineStart;
  bleedOutRightWrapper.style.paddingInlineStart =
    computedStyles.paddingInlineStart;
}

function InitializeSliders() {
  const padingUnits = "max(10%,6rem)";

  //timelineSliders
  const dateSlider =
    document.querySelector(".timelineSliders .dateSlider") ?? false;
  const imgSlider =
    document.querySelector(".timelineSliders .imgSlider") ?? false;
  if (dateSlider && imgSlider) {
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 4,
      updateOnMove: true,
      focus: "center",
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
      gap: "2rem",
    });
    imgSliderr.sync(dateSliderr);
    dateSliderr.mount();
    imgSliderr.mount();

    imgSliderr.on("click", (Slide, e) => {
      const index = Slide.index;
      imgSliderr.go(index);
      dateSliderr.go(index);
    });
  }

  const newsSlider = document.querySelector(".newsSlider") ?? false;
  if (newsSlider) {
    const prevBtn = newsSlider.parentElement.querySelector("button[data-prev]");
    const nextBtn = newsSlider.parentElement.querySelector("button[data-next]");
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 3,
      updateOnMove: true,
      focus: "center",
      gap: "3rem",
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
    prevBtn.addEventListener("click", () => {
      slider.go("<");
    });
    nextBtn.addEventListener("click", () => {
      slider.go(">");
    });
  }
  const bgImgSlider = document.querySelector(".bgImgSlider") ?? false;
  if (bgImgSlider) {
    const sliderOptions = {
      arrows: false,
      pagination: false,
      perPage: 3,
      updateOnMove: true,
      focus: "center",
      gap: "1.5rem",
      type: "loop",
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
  const logosSlider = document.querySelector(".logos-slider");
  if (logosSlider) {
    const logosSliderr = new Splide(logosSlider, {
      type: "slide",
      autoWidth: true,
      gap: "1rem",
      pagination: false,
      arrows: false,
    });
    const Components = logosSliderr.Components;
    logosSliderr.on("resized", function () {
      const isOverflow = Components.Layout.isOverflow();
      const list = Components.Elements.list;
      const lastSlide = Components.Slides.getAt(logosSliderr.length - 1);

      if (lastSlide) {
        // Toggles `justify-content: center`
        list.style.justifyContent = isOverflow ? "" : "center";

        // Remove the last margin
        if (!isOverflow) {
          lastSlide.slide.style.marginRight = "";
        }
      }
    });

    logosSliderr.mount();
  }
}

function CurtainOpener() {
  const curtains = document.querySelectorAll(".curtain");

  curtains.forEach((curtain) => {
    const images = curtain.querySelectorAll("img");

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
        img.addEventListener("load", () => {
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
  curtain.style.position = "initial";
  curtain.style.bottom = "unset";
  curtain.style.top = "unset"; // Clear any top value
  // Get original position and dimensions
  const originalTop = curtain.offsetTop;
  const curtainHeight = curtain.offsetHeight;

  // Calculate distance from bottom of document
  const documentHeight =
    document.documentElement.getBoundingClientRect().height;
  const fromBottom = documentHeight - (originalTop + curtainHeight);
  // Add margin to previous element to maintain document flow
  if (curtain.previousElementSibling) {
    curtain.previousElementSibling.style.marginBlockEnd = curtainHeight + "px";
  }

  // Set position fixed with the bottom value
  curtain.style.position = "fixed";
  curtain.style.position = "fixed";
  curtain.style.bottom = fromBottom + "px";
  curtain.style.top = "auto"; // Clear any top value
  curtain.style.marginInline = "auto"; // Clear any top value
  curtain.style.insetInline = "0"; // Clear any top value
}

function GsapImgParallax() {
  gsap.utils.toArray(".parallax-image-container").forEach(function (container) {
    let image = container.querySelector("img");

    gsap.to(image, {
      y: () => image.offsetHeight * 1.2 - container.offsetHeight,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        scrub: true,
        pin: false,
        start: "top bottom", // when container enters viewport
        end: "bottom top", // when it leaves
        markers: false,
        invalidateOnRefresh: true,
      },
    });
  });
}

async function verticalTimelineInit() {
  const verticalTimelineElement =
    document.querySelector(".verticalTimeline") ?? false;
  if (!verticalTimelineElement) return;
  const { verticalTimeline } = await import("./utilFunctions.js");
  verticalTimeline({ verticalTimeline: verticalTimelineElement });
  window.addEventListener("resize", () => {
    verticalTimeline({ verticalTimeline: verticalTimelineElement });
  });
}
