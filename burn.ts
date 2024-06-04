import { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { TokenStandard, createAndMint,mintV1 } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { Connection, PublicKey, Keypair, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import { createBurnCheckedInstruction, createMint,TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import secret from './guideSecret.json';
const QuickConnection  = 'https://blissful-few-daylight.solana-mainnet.quiknode.pro/9c3deabd9684d01e01ce9a95957eb601491523f3/'
const umi = createUmi(QuickConnection);
const SOLANA_CONNECTION = new Connection(QuickConnection);
const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret))
const userWalletSigner = createSignerFromKeypair(umi, userWallet);


const MINT_ADDRESS = ''; // USDC-Dev from spl-token-faucet.com | replace with the mint you would like to burn
const MINT_DECIMALS = 8; // Value for USDC-Dev from spl-token-faucet.com | replace with the no. decimals of mint you would like to burn
const BURN_QUANTITY = 19999999; // Number of tokens to burn (feel free to replace with any number - just make sure you have enough)


(async () => {

        console.log(`Attempting to burn ${BURN_QUANTITY} [${MINT_ADDRESS}] tokens from Owner Wallet: ${WALLET.publicKey.toString()}`);
        // Step 1 - Fetch Associated Token Account Address
        console.log(`Step 1 - Fetch Token Account`);
        const account = await getAssociatedTokenAddress(new PublicKey(MINT_ADDRESS), WALLET.publicKey);
        console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);
    
    
        // Step 2 - Create Burn Instructions
        console.log(`Step 2 - Create Burn Instructions`);
        const burnIx = createBurnCheckedInstruction(
        account, // PublicKey of Owner's Associated Token Account
        new PublicKey(MINT_ADDRESS), // Public Key of the Token Mint Address
        WALLET.publicKey, // Public Key of Owner's Wallet
        BURN_QUANTITY * (10**MINT_DECIMALS), // Number of tokens to burn
        MINT_DECIMALS // Number of Decimals of the Token Mint
        );
        console.log(`    ✅ - Burn Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log(`Step 3 - Fetch Blockhash`);
        const { blockhash, lastValidBlockHeight } = await SOLANA_CONNECTION.getLatestBlockhash('finalized');
        console.log(`    ✅ - Latest Blockhash: ${blockhash}`);


        // Step 4 - Assemble Transaction
        console.log(`Step 4 - Assemble Transaction`);
        const messageV0 = new TransactionMessage({
        payerKey: WALLET.publicKey,
        recentBlockhash: blockhash,
        instructions: [burnIx]
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([WALLET]);
        console.log(`    ✅ - Transaction Created and Signed`);

        // Step 5 - Execute & Confirm Transaction 
        console.log(`Step 5 - Execute & Confirm Transaction`);
        const txid = await SOLANA_CONNECTION.sendTransaction(transaction);
        console.log("    ✅ - Transaction sent to network");
        const confirmation = await SOLANA_CONNECTION.confirmTransaction({
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight
        });
        if (confirmation.value.err) { throw new Error("    ❌ - Transaction not confirmed.") }
        console.log('🔥 SUCCESSFUL BURN!🔥', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);

})()

