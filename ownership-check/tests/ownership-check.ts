import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";

import { Program } from "@coral-xyz/anchor";
import { OwnershipCheck } from "../target/types/ownership_check";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

describe("ownership-check", () => {
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.OwnershipCheck as Program<OwnershipCheck>;

  const creator = web3.Keypair.generate();
  console.log("creator address:" + creator.publicKey);
  const hacker = web3.Keypair.generate();
  console.log("hacker address:" + hacker.publicKey);

  let mint;
  let creatorTokenAccount;

  before("Fund the users!", async () => {
    await airdrop(provider.connection, creator.publicKey);
    await airdrop(provider.connection, hacker.publicKey);

    mint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      9
    );
    creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      mint,
      creator.publicKey
    );
    console.log("create token account address:" + creatorTokenAccount.address);
    await mintTo(
      provider.connection,
      creator,
      mint,
      creatorTokenAccount.address,
      creator,
      1000
    );
  });

  // x x x x x x x x x x x x x x x x x x x x x
  // | | | | | | | | | | | | | | | | | | | | |
  //           ADD YOUR CODE BELOW
  // | | | | | | | | | | | | | | | | | | | | |
  // v v v v v v v v v v v v v v v v v v v v v

  it("Insecure Owner v1", async () => {
    let transactionSignerture = await program.methods
      .insecureLogBalanceV1()
      .accounts({
        tokenAccountOwner: hacker.publicKey,
        tokenAccount: creatorTokenAccount.address,
        mint: mint,
      })
      .signers([hacker])
      .rpc({ commitment: "confirmed" });
    console.log("Transaction Signerture:", transactionSignerture);
  });

  it("Insecure Owner v2", async () => {
    let transactionSignerture = await program.methods
      .insecureLogBalanceV2()
      .accounts({
        tokenAccountOwner: hacker.publicKey,
        tokenAccount: creatorTokenAccount.address,
        mint: mint,
      })
      .signers([hacker])
      .rpc({ commitment: "confirmed" });
    console.log("Transaction Signerture:", transactionSignerture);
  });

  it("Secure Owner v1 unhappy path", async () => {
    try {
      await program.methods
        .insecureLogBalanceV2()
        .accounts({
          tokenAccountOwner: hacker.publicKey,
          tokenAccount: creatorTokenAccount.address,
          mint: mint,
        })
        .signers([hacker])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      const err = anchor.AnchorError.parse(error.logs);
      console.log(err.error.errorCode.code);
    }
  });

  it("Secure Owner v1 happy path", async () => {
    let transactionSignerture = await program.methods
      .insecureLogBalanceV2()
      .accounts({
        tokenAccountOwner: creator.publicKey,
        tokenAccount: creatorTokenAccount.address,
        mint: mint,
      })
      .signers([creator])
      .rpc({ commitment: "confirmed" });
    console.log("Transaction Signerture:", transactionSignerture);
  });

  it("Secure Owner v2 unhappy path", async () => {
    try {
      await program.methods
        .insecureLogBalanceV2()
        .accounts({
          tokenAccountOwner: hacker.publicKey,
          tokenAccount: creatorTokenAccount.address,
          mint: mint,
        })
        .signers([hacker])
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      const err = anchor.AnchorError.parse(error.logs);
      console.log(err.error.errorCode.code);
    }
  });

  it("Secure Owner v2 happy path", async () => {
    let transactionSignerture = await program.methods
      .insecureLogBalanceV2()
      .accounts({
        tokenAccountOwner: creator.publicKey,
        tokenAccount: creatorTokenAccount.address,
        mint: mint,
      })
      .signers([creator])
      .rpc({ commitment: "confirmed" });
    console.log("Transaction Signerture:", transactionSignerture);
  });
});
// ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
// | | | | | | | | | | | | | | | | | | | | |
//           ADD YOUR CODE ABOVE
// | | | | | | | | | | | | | | | | | | | | |
// x x x x x x x x x x x x x x x x x x x x x
export async function airdrop(
  connection: any,
  address: any,
  amount = 500_000_000_000
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}
