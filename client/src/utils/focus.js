export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const getFocusableElements = (container) => {
  if (!container?.querySelectorAll) return [];

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => element.offsetParent !== null || element === document.activeElement);
};

export const getNextFocusableIndex = (currentIndex, totalCount, direction) => {
  if (totalCount <= 0) return currentIndex;

  return (currentIndex + direction + totalCount) % totalCount;
};
