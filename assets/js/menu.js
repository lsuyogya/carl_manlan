document.addEventListener('DOMContentLoaded', () => {
  setHeaderHeight();
  document.addEventListener('resize', setHeaderHeight);
});

function setHeaderHeight() {
  const topHeader = document.querySelector('.topHeader');
  const headerHeight = topHeader.getBoundingClientRect().height;
  document
    .querySelector('body')
    .style.setProperty('--headerHeight', `${headerHeight}px`);
}
