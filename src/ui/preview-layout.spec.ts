// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { observePreviewLayout } from "./preview-layout";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("observePreviewLayout", () => {
  it("uses the viewport space below the panel and updates on resize", () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        disconnect = disconnect;
      }
    );
    vi.stubGlobal("innerHeight", 800);
    const host = document.createElement("div");
    const panel = document.createElement("div");
    document.body.appendChild(host);
    host.appendChild(panel);
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ top: 120 } as DOMRect);
    const stop = observePreviewLayout(host, panel);
    expect(host.style.getPropertyValue("--cgc-available-height")).toBe("680px");
    expect(observe).toHaveBeenCalledWith(panel);
    expect(observe).toHaveBeenCalledWith(document.body);
    vi.stubGlobal("innerHeight", 500);
    window.dispatchEvent(new Event("resize"));
    expect(host.style.getPropertyValue("--cgc-available-height")).toBe("380px");
    stop();
    expect(disconnect).toHaveBeenCalledOnce();
    vi.stubGlobal("innerHeight", 400);
    window.dispatchEvent(new Event("resize"));
    expect(host.style.getPropertyValue("--cgc-available-height")).toBe("380px");
  });

  it("clamps an offscreen panel to zero available height", () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      }
    );
    vi.stubGlobal("innerHeight", 500);
    const host = document.createElement("div");
    const panel = document.createElement("div");
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ top: 600 } as DOMRect);
    const stop = observePreviewLayout(host, panel);
    expect(host.style.getPropertyValue("--cgc-available-height")).toBe("0px");
    stop();
  });
});
