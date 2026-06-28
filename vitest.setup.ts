import React from "react";
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000/api";
process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID = "test-web3auth-client-id";
process.env.NEXT_PUBLIC_XRPL_EXPLORER_BASE_URL = "https://testnet.xrpl.org/accounts";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("next/image", () => ({
  default: (props: any) => {
    const { src, alt, fill, priority, unoptimized, ...rest } = props;

    return React.createElement("img", {
      ...rest,
      src: typeof src === "string" ? src : src?.src || "",
      alt: alt || ""
    });
  }
}));

vi.mock("next/link", () => ({
  default: (props: any) => {
    const { href, children, ...rest } = props;

    return React.createElement(
      "a",
      {
        ...rest,
        href: typeof href === "string" ? href : String(href || "#")
      },
      children
    );
  }
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

Object.defineProperty(window.URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "blob:test-preview-url")
});

Object.defineProperty(window.URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn()
});

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  value: vi.fn()
});

try {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: {
      ...window.location,
      href: "",
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn()
    }
  });
} catch {
  vi.stubGlobal("location", {
    href: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  });
}