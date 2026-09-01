import styles from "./CoverageLedger.module.css";

type Asset = {
  symbol: string;
  name: string;
  dotColor: string;
  price: string;
  change: string;
  changeDirection: "up" | "down";
  side: "UP" | "DOWN";
  odds: string;
};

const ASSETS: Asset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    dotColor: "#f7931a",
    price: "$97,412",
    change: "−1.8% / 24h",
    changeDirection: "down",
    side: "DOWN",
    odds: "0.54",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    dotColor: "#627eea",
    price: "$3,614",
    change: "+0.6% / 24h",
    changeDirection: "up",
    side: "UP",
    odds: "0.51",
  },
  {
    symbol: "SOL",
    name: "Solana",
    dotColor: "#9945ff",
    price: "$189.20",
    change: "+3.2% / 24h",
    changeDirection: "up",
    side: "UP",
    odds: "0.58",
  },
];

export function CoverageLedger() {
  return (
    <div className={styles.ledger}>
      <div className={styles.head}>
        <span className={styles.title}>Today&apos;s coverage</span>
        <span className={styles.stamp}>Oracle live</span>
      </div>

      {ASSETS.map((asset) => (
        <div className={styles.row} key={asset.symbol}>
          <div className={styles.asset}>
            <span className={styles.dot} style={{ background: asset.dotColor }} />
            <span className={styles.sym}>
              {asset.symbol}
              <small>{asset.name}</small>
            </span>
          </div>
          <div className={styles.price}>
            {asset.price}
            <span className={`${styles.chg} ${styles[asset.changeDirection]}`}>
              {asset.change}
            </span>
          </div>
          <span className={`${styles.pill} ${styles[asset.side.toLowerCase()]}`}>
            {asset.side} {asset.odds}
          </span>
        </div>
      ))}

      <div className={styles.foot}>
        <span>Priced via Pyth pull oracle</span>
        <span className={styles.pulse}>
          <span className={styles.pulseDot} />
          updated 4s ago
        </span>
      </div>
    </div>
  );
}
