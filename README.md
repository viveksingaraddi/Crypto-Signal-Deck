# Crypto Signal Deck

A minimal, data-driven crypto trading dashboard that tracks major cryptocurrency pairs, renders live candlestick charts, scans market structure, compares assets, and surfaces market-moving news and events.

> This project is an educational signal dashboard, not financial advice. Crypto markets are volatile. Always validate signals independently and use responsible risk management.

## Features

- Live major-crypto watchlist for BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, LINK, and TRX.
- Auto-refreshing market data every 5 seconds.
- Draggable and zoomable candlestick chart powered by Lightweight Charts.
- MA20, MA50, and volume overlays.
- Multi-interval chart controls: 1m, 5m, 15m, and 1h.
- Comparative dashboards:
  - Signal leaderboard
  - Relative strength
  - Risk heatmap
  - Adaptive portfolio mix
- AI-style decision engine using trend, RSI, volatility, breakout position, news sentiment, and volume context.
- Pattern scanner for breakout pressure, compression ranges, pullbacks, overbought extensions, and bearish stacks.
- Risk/reward planner for entry, stop-loss, take-profit, account size, risk percent, and R multiple.
- Price alerts stored locally in the browser.
- Market News Radar with:
  - Top live crypto headlines
  - Headline pressure summary
  - Market-impact fallback from live price action
  - Upcoming event and conference catalysts

## Data Sources

The app runs fully in the browser and uses public endpoints:

- Binance public market APIs for tickers and candlestick data.
- CryptoCompare news API.
- GDELT public document API.
- CoinDesk and Cointelegraph RSS feeds through a public RSS JSON proxy.

If a news feed is unavailable because of network or CORS limits, the dashboard falls back to live market-impact summaries generated from current ticker movement and volume.

## Getting Started

This is a static frontend project. No build step is required.

### Option 1: Open Directly

Open `index.html` in a browser.

### Option 2: Run a Local Server

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## How The Signal Engine Works

The decision engine combines several lightweight indicators:

- Moving-average trend alignment
- RSI momentum and overbought/oversold pressure
- Recent support and resistance
- Breakout proximity
- Short-term volatility
- 24-hour price and volume context
- Headline sentiment keywords

The result is shown as a score, suggested action, risk allocation, stop level, target level, and confidence estimate.

## Risk/Reward Tool

The risk tool helps calculate:

- Setup direction
- R multiple
- Risk amount
- Position size
- Notional exposure
- Stop-loss move
- Take-profit move

Use `Use signal` to load current dashboard levels, then adjust the desired R multiple with `Set target` or `Set stop`.

## Limitations

- Public APIs may rate-limit or reject requests.
- Browser CORS policy may block some feeds.
- Signals are heuristic and should not be treated as guaranteed predictions.
- No trades are executed by this app.
- No backend storage is used; alerts are stored in local browser storage.

## License

MIT
