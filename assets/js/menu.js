export function setHeaderHeight() {
  const topHeader = document.querySelector('.topHeader');
  const headerHeight = topHeader.getBoundingClientRect().height;
  document
    .querySelector('body')
    .style.setProperty('--headerHeight', `${headerHeight}px`);
}

export function setScrollPos() {
  let animationFrameId;
  if (lenis) {
    lenis.on('scroll', () => {
      requestAnimationFrame(() => {
        const body = document.querySelector('body');
        body.style.setProperty('--scrollY', lenis.scroll);
      });
    });
  } else {
    document.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        const body = document.querySelector('body');
        body.style.setProperty('--scrollY', window.scrollY);
      });
    });
  }
}

export function stickyHeader() {
  let prevScrollY = 0;
  const pageHeight = window.innerHeight;
  const header = document.querySelector('header');
  const makeSticy = () => {
    header.classList.add('show');
    header.classList.remove('hide');
  };

  const resetSticy = () => {
    header.classList.add('hide');
    header.classList.remove('show');
  };

  lenis.on('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 10) {
      header.classList.add('bg-dark');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-dark');
      header.classList.add('bg-transparent');
    }

    if (scrollY < pageHeight) {
      prevScrollY = scrollY;
      return;
    }
    header.classList.add('bg-dark');

    if (scrollY > prevScrollY) {
      resetSticy();
      prevScrollY = scrollY;
      return;
    }

    makeSticy();
    prevScrollY = scrollY;
  });
}

//Submenu Open CLose Animation
export function handleSubmenuAnimation() {
  const details = document.querySelectorAll('.menuBlock details');

  details.forEach((detail) => {
    const backBtn = detail.querySelector('.goback');
    const content = detail.closest('.content');
    backBtn.addEventListener('click', () => {
      //   detail.removeAttribute('open');
      content.style.transform = 'translateX(0%)';
      setTimeout(() => {
        detail.removeAttribute('open');
      }, 300);
    });

    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      content.style.transform = 'translateX(-100%)';
    });
  });
}
