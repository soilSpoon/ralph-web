import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { TextDecoder, TextEncoder } from "util";

GlobalRegistrator.register();

// Add missing globals for React 19 / TL
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock ResizeObserver which is often needed and missing in happy-dom/jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
