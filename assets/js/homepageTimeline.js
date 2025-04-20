document.addEventListener("DOMContentLoaded", function () {
  const txt = new SplitType(".txtAppear", { types: "lines, words, chars" });

  const lineParents = Array.from(document.querySelectorAll(".line")).map(
    (line) => line.parentElement
  );
  const uniqueLineParents = Array.from(new Set(lineParents));
  console.log(uniqueLineParents);

  uniqueLineParents.forEach((parent) => {
    // Create a separate timeline for each parent
    const parentTl = gsap.timeline({
      scrollTrigger: {
        trigger: parent,
        start: "top 90%",
      },
    });

    const animateBy = parent.getAttribute("data-by") ?? ".char";
    console.log(animateBy); //logs .char, .word
    // Add the animation to this specific parent's timeline
    parentTl.to(parent.querySelectorAll(animateBy), {
      y: 0,
      stagger: 0.05,
      delay: 0.2,
      duration: 0.1,
    });
  });
});
