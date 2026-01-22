import { TextDecoder, TextEncoder } from "node:util";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof global.document === "undefined") {
  GlobalRegistrator.register();
}

// Add missing globals for React 19 / TL
if (typeof global.TextEncoder === "undefined") {
  Object.defineProperty(global, "TextEncoder", {
    value: TextEncoder,
    writable: true,
  });
  Object.defineProperty(global, "TextDecoder", {
    value: TextDecoder,
    writable: true,
  });
}

// Mock ResizeObserver which is often needed and missing in happy-dom/jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver
    implements globalThis.ResizeObserver
  {
    observe(_target: Element, _options?: ResizeObserverOptions): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
  };
}
