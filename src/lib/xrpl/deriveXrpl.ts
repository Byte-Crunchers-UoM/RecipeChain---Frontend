import { Wallet } from "xrpl";

/**
 * Deterministically derive XRPL wallet from Web3Auth private key.
 * We hash the private key -> take 16 bytes entropy -> Wallet.fromEntropy(entropy)
 * This ensures stable output across logins.
 */
export async function deriveXrplAddressFromWeb3AuthPrivKey(privKeyHexNo0x: string) {
  const bytes = Uint8Array.from(Buffer.from(privKeyHexNo0x, "hex"));

  // sha256(privateKey) to get uniform bytes
  const hashBuf = await crypto.subtle.digest("SHA-256", bytes);
  const hash = new Uint8Array(hashBuf);

  const entropy16 = hash.slice(0, 16); // 16 bytes required by Wallet.fromEntropy
  const wallet = Wallet.fromEntropy(entropy16);

  return wallet.classicAddress; // r...
}