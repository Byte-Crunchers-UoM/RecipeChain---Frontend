import type { IWeb3Auth } from "@web3auth/modal";

export async function getWeb3AuthPrivateKey(web3auth: IWeb3Auth) {
  if (!web3auth?.provider) throw new Error("Web3Auth provider not available. Call connect() first.");
  const privKey = (await web3auth.provider.request({
    method: "private_key",
  })) as string;

  if (!privKey) throw new Error("Failed to get Web3Auth private key");
  return privKey.startsWith("0x") ? privKey.slice(2) : privKey;
}