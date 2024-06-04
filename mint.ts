import { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { TokenStandard, createAndMint,mintV1 } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

import secret from './guideSecret.json';
const QuickConnection  = 'https://blissful-few-daylight.solana-mainnet.quiknode.pro/9c3deabd9684d01e01ce9a95957eb601491523f3/'
const umi = createUmi(QuickConnection);
const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

console.log(userWalletSigner.publicKey)

const metadata = {
    name: "Meeky Mouse",
    symbol: "$MEEK",
    uri: "https://successful-my-fish.quicknode-ipfs.com/ipfs/QmcdraE5U2BnVVJ7KvE1jUe8WirEVT6N1en6w2nbFaQ128",
};

const mint = generateSigner(umi);
umi.use(signerIdentity(userWalletSigner));
umi.use(mplCandyMachine())

createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 2,
    amount: 10000000000000_00,
    tokenOwner: userWallet.publicKey,
    tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi).then(() => {
    console.log("Successfully minted 2 Billion tokens (", mint.publicKey, ")");
});
