document.addEventListener('DOMContentLoaded', () => {
  BannerBgEffect();
  window.addEventListener('resize', BannerBgEffect);
});

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
  targetX = rect.width * 0.8;
  targetY = rect.height * 0.6;
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
