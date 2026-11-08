export function observePreviewLayout(host: HTMLElement, panel: HTMLElement): () => void {
  const update = (): void => {
    const viewport = window.visualViewport;
    const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
    const height = Math.max(0, bottom - Math.max(0, panel.getBoundingClientRect().top));
    const value = `${height}px`;
    if (host.style.getPropertyValue("--cgc-available-height") !== value) {
      host.style.setProperty("--cgc-available-height", value);
    }
  };
  const observer = new ResizeObserver(update);
  observer.observe(panel);
  if (host.parentElement) observer.observe(host.parentElement);
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);
  window.visualViewport?.addEventListener("resize", update);
  window.visualViewport?.addEventListener("scroll", update);
  update();
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
    window.visualViewport?.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("scroll", update);
  };
}
