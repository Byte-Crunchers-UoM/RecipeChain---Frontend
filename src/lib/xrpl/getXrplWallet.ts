import { Wallet } from "xrpl";

/**
 * Deterministically derive the same XRPL wallet from the same Web3Auth private key.
 * We hash the Web3Auth private key -> take first 16 bytes -> Wallet.fromEntropy(entropy16)
 */
export async function getXrplWalletFromWeb3AuthPrivKey(
  privKeyHexNo0x: string
) {
  const bytes = Uint8Array.from(Buffer.from(privKeyHexNo0x, "hex"));

  const hashBuf = await crypto.subtle.digest("SHA-256", bytes);
  const hash = new Uint8Array(hashBuf);

  const entropy16 = hash.slice(0, 16); // Wallet.fromEntropy needs 16 bytes
  const wallet = Wallet.fromEntropy(entropy16);

  return wallet;
}