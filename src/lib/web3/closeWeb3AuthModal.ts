import type { Web3Auth } from "@web3auth/modal";

type Web3AuthWithOptionalModals = Web3Auth & {
  modal?: {
    closeModal?: () => void;
  };
  logoutModal?: {
    closeModal?: () => void;
  };
};

export async function closeWeb3AuthModal(
  web3Auth: Web3Auth | null | undefined
) {
  const instance = web3Auth as Web3AuthWithOptionalModals | null | undefined;

  try {
    instance?.modal?.closeModal?.();
  } catch {
    // ignore
  }

  try {
    instance?.logoutModal?.closeModal?.();
  } catch {
    // ignore
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 200);
  });

  if (typeof document !== "undefined") {
    const selectors = [
      '[data-testid="w3a-modal"]',
      '[class*="w3a-modal"]',
      '[class*="web3auth-modal"]',
      '[class*="w3a-container"]',
      '[class*="web3auth-container"]',
      '[class*="w3a-overlay"]',
      '[class*="web3auth-overlay"]',
      '[class*="modal-container"]',
      '[class*="backdrop"]',
      '[role="dialog"]',
    ];

    const nodes = new Set<HTMLElement>();

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        if (node instanceof HTMLElement) {
          nodes.add(node);
        }
      });
    });

    nodes.forEach((node) => {
      node.style.display = "none";
      node.style.visibility = "hidden";
      node.style.opacity = "0";
      node.style.pointerEvents = "none";
      node.setAttribute("aria-hidden", "true");
    });

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}