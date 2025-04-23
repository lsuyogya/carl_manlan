export const AnimateByElements = () => {
  const byTxt = new SplitType('[data-by]', { types: 'lines, words, chars' });
  const lineParents = Array.from(
    document.querySelectorAll('[data-by] .line')
  ).map((line) => line.parentElement);
  const uniqueLineParents = Array.from(new Set(lineParents));
  console.log('animateByElements parents:', uniqueLineParents);

  uniqueLineParents.forEach((parent) => {
    const parentTl = gsap.timeline({
      scrollTrigger: {
        trigger: parent,
        start: 'top 90%',
      },
    });
    const animateBy = parent.getAttribute('data-by') ?? '.char';
    gsap.set(parent.querySelectorAll(animateBy), {
      y: 50,
      opacity: 0,
    });
    console.log('animateByElements animateBy:', animateBy);
    parentTl.to(parent.querySelectorAll(animateBy), {
      y: 0,
      opacity: 1,
      stagger: 0.05,
      delay: 0.2,
      duration: 1,
    });
  });
};

// Function to handle animations for elements with [data-scrub-by] attribute
export const AnimateScrubByElements = () => {
  const scrubByTxt = new SplitType('[data-scrub-by]', {
    types: 'lines, words, chars',
  });
  const lineParents = Array.from(
    document.querySelectorAll('[data-scrub-by] .line')
  ).map((line) => line.parentElement);
  const uniqueLineParents = Array.from(new Set(lineParents));
  console.log('animateScrubByElements parents:', uniqueLineParents);

  uniqueLineParents.forEach((parent) => {
    const animateBy = parent.getAttribute('data-scrub-by') ?? '.char';
    const elements = parent.querySelectorAll(animateBy);
    const section = parent.closest('section') || parent;
    const needsPin = section.closest('.pin-spacer') ? false : true;

    gsap.set(elements, {
      y: 50,
      opacity: 0,
    });

    const parentTl = gsap.timeline({
      scrollTrigger: {
        trigger: parent,
        start: 'center bottom',
        end: 'center 40%',
        pin: false,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        markers: false,
      },
    });

    parentTl.to(elements, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      ease: 'power1.out',
      duration: 2,
    });
    parentTl.to(elements, { duration: 2 });
  });
};
