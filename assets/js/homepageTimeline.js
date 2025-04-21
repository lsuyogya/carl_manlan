document.addEventListener('DOMContentLoaded', function () {
  const txt = new SplitType('[data-by]', { types: 'lines, words, chars' });

  const lineParents = Array.from(document.querySelectorAll('.line')).map(
    (line) => line.parentElement
  );
  const uniqueLineParents = Array.from(new Set(lineParents));
  console.log(uniqueLineParents);

  uniqueLineParents.forEach((parent) => {
    const animateBy = parent.getAttribute('data-by') ?? '.char';
    const elements = parent.querySelectorAll(animateBy);

    // Find the section that contains this parent
    // Adjust this selector based on your actual HTML structure
    const section = parent.closest('section') || parent;

    // Set initial state - characters start hidden
    gsap.set(elements, {
      y: 50,
      opacity: 0,
    });

    const needsPin = section.closest('.pin-spacer') ? false : true;
    // Create a separate timeline for each parent
    const parentTl = gsap.timeline({
      scrollTrigger: {
        trigger: section, // Pin the entire section
        start: 'top top', // Start when section reaches top of viewport
        end: '+=100%', // Pin for the duration of 1 full viewport height
        pin: needsPin, // Pin the section
        pinSpacing: 'padding', // Creates space in the document for the pinned element
        scrub: 0.5, // Smooth scrubbing
        anticipatePin: 1, // Helps prevent jarring pin start
        markers: false, // Set to true for debugging
      },
    });

    // Add animation that will be tied to scroll progress
    parentTl.to(elements, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      ease: 'power1.out',
      duration: 0.5,
    });
  });
});
