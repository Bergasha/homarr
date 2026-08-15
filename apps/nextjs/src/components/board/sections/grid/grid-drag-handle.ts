export const observeGridDragHandle = (
  container: HTMLElement,
  selector: string,
  bind: (element: HTMLElement | null) => void,
) => {
  let boundHandle: HTMLElement | null = null;
  const syncHandle = () => {
    const handle = container.querySelector<HTMLElement>(selector);
    if (handle === boundHandle) return;
    boundHandle = handle;
    bind(handle);
  };

  syncHandle();
  const observer = new MutationObserver(syncHandle);
  observer.observe(container, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    bind(null);
  };
};
