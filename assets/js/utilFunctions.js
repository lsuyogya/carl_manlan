export function verticalTimeline({ verticalTimeline }) {
  //expects an element
  const timelineItems = verticalTimeline.querySelectorAll('.timlineItem');
  if (timelineItems.length == 0) return;
  const colCount = window
    .getComputedStyle(timelineItems[0])
    .gridTemplateColumns.split(' ').length;

  timelineItems.forEach((item) => {
    // const tl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: item,
    //   },
    // });
    const imgWrapper = item.querySelector('.imgWrapper');
    const txtWrapper = item.querySelector('.txtWrapper');
    if (colCount == 2) {
      txtWrapper.insertBefore(imgWrapper, txtWrapper.firstChild);
      imgWrapper.style.marginBlockEnd = '1rem';
    } else {
      item.insertBefore(imgWrapper, item.firstChild);
      imgWrapper.style.marginBlockEnd = '0rem';
    }
  });
}
