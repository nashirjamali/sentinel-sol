import { Button } from "@/components/Button/Button";
import { CoverageLedger } from "@/components/CoverageLedger/CoverageLedger";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.eyebrow}>Devnet · Solana</div>

        <h1 className={styles.headline}>
          Insure your position, <em>not your luck.</em>
        </h1>

        <p className={styles.lede}>
          Sentinels is a parametric price-insurance market for BTC, ETH, and SOL.
          Take a DOWN or UP position, back it 1:1 in USDC, and let the Pyth oracle
          settle it — no claims, no counterparty, no leverage.
        </p>

        <div className={styles.actions}>
          <Button href="#connect" variant="fill">
            Launch App
          </Button>
          <Button href="/docs/program-spec" variant="text">
            Read the program spec
          </Button>
        </div>

        <div className={styles.seal}>
          <div className={styles.ring}>
            <div className={styles.ringInner}>1:1</div>
          </div>
          <p className={styles.sealCopy}>
            <strong>Fully collateralized, always.</strong>
            <br />
            Every UP is backed by an equal DOWN, locked in a program vault
            the moment it&apos;s minted.
          </p>
        </div>
      </div>

      <CoverageLedger />
    </section>
  );
}
