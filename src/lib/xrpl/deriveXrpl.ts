import { getXrplWalletFromWeb3AuthPrivKey } from "./getXrplWallet";

/**
 * Returns only the XRPL classic address (r...) from the deterministically derived wallet.
 */
export async function deriveXrplAddressFromWeb3AuthPrivKey(
  privKeyHexNo0x: string
) {
  const wallet = await getXrplWalletFromWeb3AuthPrivKey(privKeyHexNo0x);
  return wallet.classicAddress;
}