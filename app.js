const ASSETS = [
  { symbol: "BTCUSDT", name: "Bitcoin", short: "BTC" },
  { symbol: "ETHUSDT", name: "Ethereum", short: "ETH" },
  { symbol: "BNBUSDT", name: "BNB", short: "BNB" },
  { symbol: "SOLUSDT", name: "Solana", short: "SOL" },
  { symbol: "XRPUSDT", name: "XRP", short: "XRP" },
  { symbol: "ADAUSDT", name: "Cardano", short: "ADA" },
  { symbol: "DOGEUSDT", name: "Dogecoin", short: "DOGE" },
  { symbol: "AVAXUSDT", name: "Avalanche", short: "AVAX" },
  { symbol: "LINKUSDT", name: "Chainlink", short: "LINK" },
  { symbol: "TRXUSDT", name: "TRON", short: "TRX" }
];

const UPCOMING_EVENTS = [
  {
    title: "Crypto Valley Conference",
    date: "2026-05-28",
    location: "Rotkreuz, Switzerland",
    impact: "Institutional, regulation, infrastructure, and enterprise blockchain themes can influence mid-term sentiment.",
    url: "https://www.cryptovalleyconference.com/"
  },
  {
    title: "Web3 Summit 2026",
    date: "2026-06-18",
    endDate: "2026-06-19",
    location: "Funkhaus Berlin",
    impact: "Developer and infrastructure narratives around privacy, sovereignty, and usability can affect L1/L2 ecosystems.",
    url: "https://web3summit.com/"
  },
  {
    title: "Global Blockchain Show Riyadh",
    date: "2026-06-29",
    endDate: "2026-06-30",
    location: "Riyadh, Saudi Arabia",
    impact: "Regional Web3 investment, enterprise blockchain, AI, and policy discussions may shift attention toward infrastructure assets.",
    url: "https://www.globalblockchainshow.com/riyadh"
  }
];

const state = {
  selectedSymbol: "BTCUSDT",
  interval: "5m",
  paused: false,
  tickers: new Map(),
  previousPrices: new Map(),
  chartRows: [],
  news: [],
  alerts: JSON.parse(localStorage.getItem("crypto-alerts") || "[]"),
  lastRefresh: null,
  chartViewKey: "",
  latestAnalysis: null,
  lastNewsRefresh: null
};

const el = {
  refreshStatus: document.querySelector("#refreshStatus"),
  refreshButton: document.querySelector("#refreshButton"),
  pauseButton: document.querySelector("#pauseButton"),
  assetList: document.querySelector("#assetList"),
  assetCount: document.querySelector("#assetCount"),
  totalVolume: document.querySelector("#totalVolume"),
  volumeLeader: document.querySelector("#volumeLeader"),
  topMover: document.querySelector("#topMover"),
  topMoverDetail: document.querySelector("#topMoverDetail"),
  spikeCount: document.querySelector("#spikeCount"),
  spikeDetail: document.querySelector("#spikeDetail"),
  newsSentiment: document.querySelector("#newsSentiment"),
  newsSentimentDetail: document.querySelector("#newsSentimentDetail"),
  selectedPair: document.querySelector("#selectedPair"),
  selectedName: document.querySelector("#selectedName"),
  decisionScore: document.querySelector("#decisionScore"),
  tradeAction: document.querySelector("#tradeAction"),
  riskRatio: document.querySelector("#riskRatio"),
  exitTrigger: document.querySelector("#exitTrigger"),
  confidenceTag: document.querySelector("#confidenceTag"),
  strategyCard: document.querySelector("#strategyCard"),
  patternList: document.querySelector("#patternList"),
  alertSymbol: document.querySelector("#alertSymbol"),
  alertForm: document.querySelector("#alertForm"),
  alertDirection: document.querySelector("#alertDirection"),
  alertPrice: document.querySelector("#alertPrice"),
  alertList: document.querySelector("#alertList"),
  clearAlerts: document.querySelector("#clearAlerts"),
  newsList: document.querySelector("#newsList"),
  newsUpdated: document.querySelector("#newsUpdated"),
  leaderboardList: document.querySelector("#leaderboardList"),
  strengthMatrix: document.querySelector("#strengthMatrix"),
  riskHeatmap: document.querySelector("#riskHeatmap"),
  portfolioMix: document.querySelector("#portfolioMix"),
  leaderboardUpdated: document.querySelector("#leaderboardUpdated"),
  resetChart: document.querySelector("#resetChart"),
  rrForm: document.querySelector("#rrForm"),
  rrEntry: document.querySelector("#rrEntry"),
  rrStop: document.querySelector("#rrStop"),
  rrTarget: document.querySelector("#rrTarget"),
  rrMultiple: document.querySelector("#rrMultiple"),
  rrAccount: document.querySelector("#rrAccount"),
  rrRisk: document.querySelector("#rrRisk"),
  rrBadge: document.querySelector("#rrBadge"),
  rrOutput: document.querySelector("#rrOutput"),
  useSignalLevels: document.querySelector("#useSignalLevels"),
  setTargetFromRatio: document.querySelector("#setTargetFromRatio"),
  setStopFromRatio: document.querySelector("#setStopFromRatio"),
  impactSummary: document.querySelector("#impactSummary"),
  topNewsList: document.querySelector("#topNewsList"),
  eventList: document.querySelector("#eventList"),
  marketNewsUpdated: document.querySelector("#marketNewsUpdated"),
  topNewsUpdated: document.querySelector("#topNewsUpdated"),
  eventUpdated: document.querySelector("#eventUpdated"),
  chartTime: document.querySelector("#chartTime"),
  chartOpen: document.querySelector("#chartOpen"),
  chartHigh: document.querySelector("#chartHigh"),
  chartLow: document.querySelector("#chartLow"),
  chartClose: document.querySelector("#chartClose")
};

const tradingChart = {
  chart: null,
  candleSeries: null,
  ma20Series: null,
  ma50Series: null,
  volumeSeries: null
};

function initTradingChart() {
  const chartNode = document.querySelector("#priceChart");
  if (!window.LightweightCharts || !chartNode) {
    chartNode.textContent = "Chart library unavailable. Live market data will keep updating.";
    return;
  }

  tradingChart.chart = LightweightCharts.createChart(chartNode, {
    autoSize: true,
    layout: {
      background: { color: "#080d0f" },
      textColor: "#a8b4b5",
      fontFamily: getComputedStyle(document.documentElement).fontFamily
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.04)" },
      horzLines: { color: "rgba(255,255,255,0.052)" }
    },
    rightPriceScale: {
      borderColor: "#2c363b",
      scaleMargins: { top: 0.08, bottom: 0.24 }
    },
    timeScale: {
      borderColor: "#2c363b",
      timeVisible: true,
      secondsVisible: true,
      rightOffset: 6,
      barSpacing: 9,
      tickMarkFormatter: (time) => formatAxisTime(time)
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: {
        color: "rgba(95, 201, 221, 0.72)",
        width: 1,
        style: LightweightCharts.LineStyle.Solid,
        labelBackgroundColor: "#14242a"
      },
      horzLine: {
        color: "rgba(95, 201, 221, 0.72)",
        width: 1,
        style: LightweightCharts.LineStyle.Solid,
        labelBackgroundColor: "#14242a"
      }
    },
    localization: {
      priceFormatter: (price) => formatChartPrice(price),
      timeFormatter: (time) => formatChartDateTime(time)
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true
    }
  });

  tradingChart.candleSeries = tradingChart.chart.addCandlestickSeries({
    upColor: "#4fd18b",
    downColor: "#ff6868",
    borderUpColor: "#4fd18b",
    borderDownColor: "#ff6868",
    wickUpColor: "#4fd18b",
    wickDownColor: "#ff6868"
  });
  tradingChart.ma20Series = tradingChart.chart.addLineSeries({
    color: "#f6bf4f",
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false
  });
  tradingChart.ma50Series = tradingChart.chart.addLineSeries({
    color: "#a994ff",
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false
  });
  tradingChart.volumeSeries = tradingChart.chart.addHistogramSeries({
    color: "rgba(95, 201, 221, 0.34)",
    priceFormat: { type: "volume" },
    priceScaleId: "volume"
  });
  tradingChart.chart.priceScale("volume").applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 }
  });

  tradingChart.chart.subscribeCrosshairMove((param) => {
    const candle = param?.seriesData?.get(tradingChart.candleSeries);
    if (candle) {
      updateChartHud(candle, param.time);
      return;
    }
    updateChartHud(state.chartRows.at(-1));
  });

  const resizeChart = () => {
    const rect = chartNode.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      tradingChart.chart.resize(Math.floor(rect.width), Math.floor(rect.height));
    }
  };
  new ResizeObserver(resizeChart).observe(chartNode);
  window.addEventListener("resize", resizeChart);
  requestAnimationFrame(resizeChart);
}

function getPricePrecision(value) {
  const number = Math.abs(Number(value || 0));
  if (number >= 1000) return { precision: 2, minMove: 0.01 };
  if (number >= 100) return { precision: 3, minMove: 0.001 };
  if (number >= 1) return { precision: 4, minMove: 0.0001 };
  return { precision: 6, minMove: 0.000001 };
}

function formatChartPrice(value) {
  const number = Number(value || 0);
  const { precision } = getPricePrecision(number);
  return number.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
}

function formatChartDateTime(time) {
  const unix = typeof time === "number" ? time : time?.timestamp;
  if (!unix) return "--";
  return new Date(unix * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatAxisTime(time) {
  const unix = typeof time === "number" ? time : time?.timestamp;
  if (!unix) return "";
  const date = new Date(unix * 1000);
  const options = state.interval === "1h"
    ? { month: "short", day: "numeric", hour: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" };
  return date.toLocaleString([], options);
}

function updateChartHud(candle, explicitTime) {
  if (!candle) return;
  const time = explicitTime || Math.floor((candle.time || 0) / 1000);
  el.chartTime.textContent = formatChartDateTime(time);
  el.chartOpen.textContent = formatChartPrice(candle.open);
  el.chartHigh.textContent = formatChartPrice(candle.high);
  el.chartLow.textContent = formatChartPrice(candle.low);
  el.chartClose.textContent = formatChartPrice(candle.close);
  el.chartClose.className = candle.close >= candle.open ? "positive" : "negative";
}

function formatMoney(value) {
  const number = Number(value || 0);
  if (number >= 1000) return `$${number.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (number >= 1) return `$${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${number.toLocaleString(undefined, { maximumFractionDigits: 5 })}`;
}

function formatCompact(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2 })}`;
}

function pct(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function assetMeta(symbol) {
  return ASSETS.find((asset) => asset.symbol === symbol) || ASSETS[0];
}

function movingAverage(values, period) {
  return values.map((_, index) => {
    if (index < period - 1) return null;
    const slice = values.slice(index - period + 1, index + 1);
    return slice.reduce((sum, item) => sum + item, 0) / period;
  });
}

function rsi(values, period = 14) {
  if (values.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let index = values.length - period; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function volatility(values) {
  const returns = values.slice(1).map((value, index) => (value - values[index]) / values[index]);
  if (!returns.length) return 0;
  const mean = returns.reduce((sum, item) => sum + item, 0) / returns.length;
  const variance = returns.reduce((sum, item) => sum + (item - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

function scoreMarket(rows, newsScore) {
  const closes = rows.map((row) => row.close);
  const last = closes.at(-1) || 0;
  const ma20 = movingAverage(closes, 20).at(-1) || last;
  const ma50 = movingAverage(closes, 50).at(-1) || ma20;
  const currentRsi = rsi(closes);
  const vol = volatility(closes.slice(-40));
  const recentHigh = Math.max(...rows.slice(-36).map((row) => row.high));
  const recentLow = Math.min(...rows.slice(-36).map((row) => row.low));
  const trend = ((last - ma50) / ma50) * 100;
  const momentum = ((last - (closes.at(-10) || last)) / (closes.at(-10) || last)) * 100;
  let score = 0;

  if (last > ma20) score += 18;
  else score -= 12;
  if (ma20 > ma50) score += 18;
  else score -= 18;
  if (currentRsi > 72) score -= 20;
  else if (currentRsi > 55) score += 12;
  else if (currentRsi < 32) score += 8;
  else if (currentRsi < 42) score -= 8;
  if (last > recentHigh * 0.995) score += 12;
  if (last < recentLow * 1.01) score -= 12;
  score += Math.max(-18, Math.min(18, momentum * 4));
  score += newsScore * 8;
  score -= Math.max(0, vol - 1.4) * 4;

  const bounded = Math.round(Math.max(-100, Math.min(100, score)));
  const riskPercent = Math.max(0, Math.min(12, (bounded + 20) / 10));
  const stop = last * (1 - Math.max(0.018, vol / 100 * 2.3));
  const target = last * (1 + Math.max(0.03, vol / 100 * 3.2));

  let action = "Hold / wait";
  if (bounded >= 62) action = "Buy small";
  if (bounded >= 76) action = "Buy / add";
  if (bounded <= -42) action = "Avoid";
  if (bounded <= -62) action = "Reduce / exit";

  return {
    score: bounded,
    action,
    riskPercent,
    stop,
    target,
    rsi: currentRsi,
    trend,
    volatility: vol,
    support: recentLow,
    resistance: recentHigh
  };
}

function detectPatterns(rows) {
  if (rows.length < 60) return [];
  const closes = rows.map((row) => row.close);
  const last = closes.at(-1);
  const ma20 = movingAverage(closes, 20).at(-1);
  const ma50 = movingAverage(closes, 50).at(-1);
  const recent = rows.slice(-30);
  const high = Math.max(...recent.map((row) => row.high));
  const low = Math.min(...recent.map((row) => row.low));
  const rangePct = ((high - low) / last) * 100;
  const patterns = [];

  if (last > high * 0.992 && ma20 > ma50) {
    patterns.push(["Breakout pressure", "Price is pressing the recent range high while the fast average is above the slow average.", "positive"]);
  }
  if (rangePct < 2.2) {
    patterns.push(["Compression range", "Recent candles are tightening. A larger move can follow once price leaves the range.", "neutral"]);
  }
  if (last > ma50 && last < ma20 * 1.006 && last > ma20 * 0.985) {
    patterns.push(["Trend pullback", "Price is near the 20-period average while the broader trend remains constructive.", "positive"]);
  }
  if (rsi(closes) > 72) {
    patterns.push(["Overbought extension", "RSI is elevated. Profit-taking risk rises even when the trend is strong.", "negative"]);
  }
  if (last < ma20 && ma20 < ma50) {
    patterns.push(["Bearish stack", "Price and moving averages are aligned downward. New long entries need extra confirmation.", "negative"]);
  }
  return patterns.slice(0, 4);
}

function scoreNews() {
  const positive = ["etf", "approval", "adoption", "partnership", "rally", "record", "inflow", "upgrade", "bull"];
  const negative = ["hack", "lawsuit", "ban", "outflow", "crash", "fraud", "probe", "exploit", "bear"];
  let score = 0;
  getNewsItems().slice(0, 8).forEach((item) => {
    const title = `${item.title || ""} ${item.body || ""}`.toLowerCase();
    positive.forEach((word) => {
      if (title.includes(word)) score += 1;
    });
    negative.forEach((word) => {
      if (title.includes(word)) score -= 1;
    });
  });
  return Math.max(-3, Math.min(3, score));
}

function getNewsItems() {
  const items = Array.isArray(state.news)
    ? state.news
    : Array.isArray(state.news?.Data)
      ? state.news.Data
      : Array.isArray(state.news?.News)
        ? state.news.News
        : [];
  return items
    .map(normalizeNewsItem)
    .filter((item) => item.title)
    .sort((a, b) => b.impactScore - a.impactScore || b.publishedAt - a.publishedAt);
}

function normalizeNewsItem(item) {
  const title = item.title || item.name || "";
  const body = item.body || item.description || item.summary || "";
  const source = item.source || item.source_info?.name || item.domain || "Crypto news";
  const url = item.url || item.link || "#";
  const publishedAt = item.publishedAt || item.published_on * 1000 || Date.parse(item.pubDate || item.published || "") || Date.now();
  return {
    title,
    body,
    source,
    url,
    publishedAt,
    impactScore: getImpactScore(`${title} ${body}`)
  };
}

function getImpactScore(text) {
  const lower = String(text || "").toLowerCase();
  const highImpact = ["etf", "sec", "fed", "rate", "inflation", "cpi", "hack", "exploit", "lawsuit", "approval", "ban", "tariff", "liquidation", "reserve", "stablecoin", "institutional", "blackrock", "binance", "coinbase"];
  const mediumImpact = ["upgrade", "partnership", "mainnet", "airdrop", "regulation", "rwa", "tokenization", "staking", "treasury", "mining", "whale", "conference", "summit"];
  let score = 0;
  highImpact.forEach((word) => {
    if (lower.includes(word)) score += 3;
  });
  mediumImpact.forEach((word) => {
    if (lower.includes(word)) score += 1;
  });
  return score;
}

function formatNewsTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Live";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderAssets() {
  const rows = ASSETS.map((asset) => {
    const ticker = state.tickers.get(asset.symbol);
    const price = Number(ticker?.lastPrice || 0);
    const change = Number(ticker?.priceChangePercent || 0);
    const active = asset.symbol === state.selectedSymbol ? "active" : "";
    const tone = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
    return `
      <button class="asset-row ${active}" data-symbol="${asset.symbol}">
        <span class="asset-main">
          <strong>${asset.name}</strong>
          <span>${asset.short} / USDT</span>
        </span>
        <span class="asset-price">
          <strong>${price ? formatMoney(price) : "--"}</strong>
          <span class="${tone}">${pct(change)}</span>
        </span>
      </button>
    `;
  }).join("");
  el.assetList.innerHTML = rows;
  el.assetCount.textContent = `${ASSETS.length} pairs`;
}

function renderOverview(spikes) {
  const tickers = [...state.tickers.values()];
  const totalVolume = tickers.reduce((sum, ticker) => sum + Number(ticker.quoteVolume || 0), 0);
  const volumeLeader = [...tickers].sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))[0];
  const topMover = [...tickers].sort((a, b) => Math.abs(Number(b.priceChangePercent)) - Math.abs(Number(a.priceChangePercent)))[0];
  const sentiment = scoreNews();
  const label = sentiment > 1 ? "Positive" : sentiment < -1 ? "Negative" : "Neutral";

  el.totalVolume.textContent = formatCompact(totalVolume);
  el.volumeLeader.textContent = volumeLeader ? `${volumeLeader.symbol} leads volume` : "Waiting for market data";
  el.topMover.textContent = topMover ? topMover.symbol.replace("USDT", "") : "--";
  el.topMoverDetail.textContent = topMover ? `${pct(topMover.priceChangePercent)} over 24h` : "No ticker yet";
  el.spikeCount.textContent = `${spikes.length} active`;
  el.spikeDetail.textContent = spikes[0] ? `${spikes[0].symbol.replace("USDT", "")} moved ${pct(spikes[0].move)}` : "No sudden 5-second spikes";
  el.newsSentiment.textContent = label;
  el.newsSentiment.className = sentiment > 1 ? "positive" : sentiment < -1 ? "negative" : "neutral";
  el.newsSentimentDetail.textContent = `${getNewsItems().length} recent headlines scanned`;
}

function getComparativeAnalysis() {
  const tickers = ASSETS.map((asset) => {
    const ticker = state.tickers.get(asset.symbol);
    const price = Number(ticker?.lastPrice || 0);
    const change = Number(ticker?.priceChangePercent || 0);
    const high = Number(ticker?.highPrice || price);
    const low = Number(ticker?.lowPrice || price);
    const volume = Number(ticker?.quoteVolume || 0);
    const tradeCount = Number(ticker?.count || 0);
    const range = price ? ((high - low) / price) * 100 : 0;
    const liquidityScore = Math.min(100, Math.log10(volume + 1) * 8);
    const momentumScore = Math.max(-40, Math.min(40, change * 6));
    const riskPenalty = Math.max(0, range - 5) * 3;
    const participation = Math.min(20, Math.log10(tradeCount + 1) * 3);
    const score = Math.round(Math.max(0, Math.min(100, 48 + momentumScore + liquidityScore * 0.22 + participation - riskPenalty)));
    const allocation = score >= 68 ? Math.min(14, Math.max(3, score / 8)) : score >= 52 ? Math.min(6, score / 14) : Math.max(0, score / 30);

    return {
      ...asset,
      price,
      change,
      high,
      low,
      volume,
      tradeCount,
      range,
      liquidityScore,
      momentumScore,
      score,
      allocation
    };
  });

  return tickers.sort((a, b) => b.score - a.score);
}

function renderComparisons() {
  const analysis = getComparativeAnalysis();
  if (!analysis.length || !el.leaderboardList) return;
  const maxMove = Math.max(1, ...analysis.map((item) => Math.abs(item.change)));
  const maxRange = Math.max(1, ...analysis.map((item) => item.range));
  const maxVolume = Math.max(1, ...analysis.map((item) => item.volume));
  const totalAllocation = analysis.reduce((sum, item) => sum + item.allocation, 0) || 1;

  el.leaderboardUpdated.textContent = state.lastRefresh ? state.lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live";
  el.leaderboardList.innerHTML = analysis.slice(0, 5).map((item) => {
    const tone = item.change > 0 ? "positive" : item.change < 0 ? "negative" : "neutral";
    return `
      <article class="rank-item">
        <div class="rank-topline">
          <strong>${item.short}</strong>
          <span class="${tone}">${item.score}/100 signal</span>
        </div>
        <div class="bar-track"><div class="bar-fill ${tone}" style="width:${item.score}%"></div></div>
        <span class="matrix-label">${pct(item.change)} 24h, ${formatCompact(item.volume)} volume</span>
      </article>
    `;
  }).join("");

  el.strengthMatrix.innerHTML = analysis.map((item) => {
    const tone = item.change > 0 ? "positive" : item.change < 0 ? "negative" : "neutral";
    const width = Math.max(6, Math.min(100, Math.abs(item.change) / maxMove * 100));
    return `
      <div class="matrix-row">
        <strong>${item.short}</strong>
        <div class="bar-track"><div class="bar-fill ${tone}" style="width:${width}%"></div></div>
        <span class="${tone}">${pct(item.change)}</span>
      </div>
    `;
  }).join("");

  el.riskHeatmap.innerHTML = analysis.map((item) => {
    const heat = Math.max(18, Math.min(92, item.range / maxRange * 92));
    const alpha = (0.15 + heat / 130).toFixed(2);
    const color = item.range > 8 ? `rgba(255, 104, 104, ${alpha})` : item.range > 4 ? `rgba(246, 191, 79, ${alpha})` : `rgba(79, 209, 139, ${alpha})`;
    return `
      <div class="heat-tile" style="background:${color}">
        <strong>${item.short}</strong>
        <span>${item.range.toFixed(2)}% range</span>
        <span>${Math.round(item.volume / maxVolume * 100)}% liquidity</span>
      </div>
    `;
  }).join("");

  el.portfolioMix.innerHTML = analysis.slice(0, 6).map((item) => {
    const weight = item.allocation / totalAllocation * 100;
    const cappedWeight = Math.max(4, Math.min(100, weight));
    return `
      <article class="allocation-item">
        <div class="allocation-topline">
          <strong>${item.short}</strong>
          <span>${weight.toFixed(1)}% model weight</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${cappedWeight}%"></div></div>
        <span class="matrix-label">${item.score >= 68 ? "Momentum candidate" : item.score >= 52 ? "Watchlist size" : "Defensive / tiny exposure"}</span>
      </article>
    `;
  }).join("");
}

function renderChart() {
  const closes = state.chartRows.map((row) => row.close);
  if (!tradingChart.chart || !state.chartRows.length) return;
  const lastClose = closes.at(-1) || 0;
  const priceFormat = getPricePrecision(lastClose);
  const candleData = state.chartRows.map((row) => ({
    time: Math.floor(row.time / 1000),
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close
  }));
  const ma20 = movingAverage(closes, 20)
    .map((value, index) => value ? { time: Math.floor(state.chartRows[index].time / 1000), value } : null)
    .filter(Boolean);
  const ma50 = movingAverage(closes, 50)
    .map((value, index) => value ? { time: Math.floor(state.chartRows[index].time / 1000), value } : null)
    .filter(Boolean);
  const volumeData = state.chartRows.map((row) => ({
    time: Math.floor(row.time / 1000),
    value: row.volume,
    color: row.close >= row.open ? "rgba(79, 209, 139, 0.28)" : "rgba(255, 104, 104, 0.28)"
  }));

  tradingChart.candleSeries.applyOptions({
    priceFormat: {
      type: "price",
      precision: priceFormat.precision,
      minMove: priceFormat.minMove
    }
  });
  tradingChart.ma20Series.applyOptions({
    priceFormat: {
      type: "price",
      precision: priceFormat.precision,
      minMove: priceFormat.minMove
    }
  });
  tradingChart.ma50Series.applyOptions({
    priceFormat: {
      type: "price",
      precision: priceFormat.precision,
      minMove: priceFormat.minMove
    }
  });
  tradingChart.candleSeries.setData(candleData);
  tradingChart.ma20Series.setData(ma20);
  tradingChart.ma50Series.setData(ma50);
  tradingChart.volumeSeries.setData(volumeData);
  updateChartHud(state.chartRows.at(-1));
  const viewKey = `${state.selectedSymbol}-${state.interval}`;
  if (state.chartViewKey !== viewKey) {
    tradingChart.chart.timeScale().fitContent();
    state.chartViewKey = viewKey;
  }
  requestAnimationFrame(() => {
    const node = document.querySelector("#priceChart");
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      tradingChart.chart.resize(Math.floor(rect.width), Math.floor(rect.height));
    }
  });
}

function renderStrategy() {
  const asset = assetMeta(state.selectedSymbol);
  const newsSignal = scoreNews();
  const analysis = scoreMarket(state.chartRows, newsSignal);
  const patterns = detectPatterns(state.chartRows);
  const confidence = Math.min(94, Math.max(36, 50 + Math.abs(analysis.score) * 0.45 + patterns.length * 4));
  state.latestAnalysis = analysis;

  el.selectedPair.textContent = state.selectedSymbol;
  el.selectedName.textContent = asset.name;
  el.decisionScore.textContent = `${analysis.score}/100`;
  el.decisionScore.className = analysis.score > 55 ? "positive" : analysis.score < -40 ? "negative" : "neutral";
  el.tradeAction.textContent = analysis.action;
  el.riskRatio.textContent = `${analysis.riskPercent.toFixed(1)}% max`;
  el.exitTrigger.textContent = formatMoney(analysis.stop);
  el.confidenceTag.textContent = `${Math.round(confidence)}% confidence`;
  el.strategyCard.innerHTML = `
    <h3>${analysis.action} ${asset.short}</h3>
    <p>Current model score is ${analysis.score}/100. The engine weighs moving-average trend, RSI, volatility, breakout position, 24h market flow, and headline sentiment before suggesting a position size.</p>
    <div class="strategy-level">
      <div><span>Entry zone</span><strong>${formatMoney(analysis.support)} - ${formatMoney(analysis.resistance)}</strong></div>
      <div><span>Stop / exit</span><strong>${formatMoney(analysis.stop)}</strong></div>
      <div><span>Target</span><strong>${formatMoney(analysis.target)}</strong></div>
    </div>
    <p>Suggested ratio: keep exposure near ${analysis.riskPercent.toFixed(1)}% of portfolio for this signal, split entries into thirds, and exit early if price closes below the stop, RSI rolls over from overbought, or negative news pressure increases.</p>
  `;

  el.patternList.innerHTML = patterns.length
    ? patterns.map(([title, body, tone]) => `
      <article class="stack-item">
        <span class="stack-kicker ${tone}">${tone}</span>
        <h3>${title}</h3>
        <p>${body}</p>
      </article>
    `).join("")
    : `<article class="stack-item"><span class="stack-kicker neutral">Neutral</span><h3>No clean pattern</h3><p>The market is mixed. Wait for a confirmed range break or moving-average alignment.</p></article>`;
  syncRiskRewardDefaults(false);
}

function renderNews() {
  const impactWords = ["ETF", "SEC", "Fed", "inflation", "hack", "exchange", "regulation", "liquidation", "adoption"];
  const newsItems = getNewsItems();
  const fallbackItems = newsItems.length ? [] : generateMarketImpactFeed();
  el.newsUpdated.textContent = newsItems.length ? "Updated" : "Market feed";
  el.newsList.innerHTML = newsItems.slice(0, 6).map((item) => {
    const title = item.title || "Crypto headline";
    const impact = impactWords.find((word) => title.toLowerCase().includes(word.toLowerCase())) || "Market";
    const source = item.source || "Crypto news";
    const url = item.url || "#";
    const date = formatNewsTime(item.publishedAt);
    return `
      <article class="news-item">
        <div class="news-meta"><span>${source}</span><span>${date}</span></div>
        <h3><a href="${url}" target="_blank" rel="noreferrer">${title}</a></h3>
        <p>${impact} impact: monitor whether this headline changes volume, funding mood, or risk appetite around the selected asset.</p>
      </article>
    `;
  }).join("") || fallbackItems.map((item) => `
    <article class="news-item">
      <div class="news-meta"><span>${item.source}</span><span>Live</span></div>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderMarketNewsDashboard() {
  const newsItems = getNewsItems();
  const fallback = generateMarketImpactFeed();
  const impactItems = newsItems.length ? newsItems : fallback.map((item) => ({
    title: item.title,
    body: item.body,
    source: item.source,
    url: "#",
    publishedAt: Date.now(),
    impactScore: 1
  }));
  const highImpactCount = newsItems.filter((item) => item.impactScore >= 3).length;
  const dominant = impactItems[0];
  const eventItems = getUpcomingEvents();

  el.marketNewsUpdated.textContent = state.lastNewsRefresh
    ? state.lastNewsRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Live scan";
  el.topNewsUpdated.textContent = newsItems.length ? `${newsItems.length} scanned` : "Market fallback";
  el.eventUpdated.textContent = `${eventItems.length} upcoming`;

  el.impactSummary.innerHTML = `
    <article class="impact-card">
      <span>Headline pressure</span>
      <strong class="${highImpactCount ? "neutral" : "positive"}">${highImpactCount ? `${highImpactCount} active` : "Calm"}</strong>
      <p>${highImpactCount ? "Market-moving keywords are present. Watch fast volume changes and avoid oversized entries around breaking news." : "No high-impact headline cluster detected from available feeds. Market-derived signals remain the main driver."}</p>
    </article>
    <article class="impact-card">
      <span>Top catalyst</span>
      <h3>${dominant?.title || "No live headline available"}</h3>
      <p>${dominant?.body || "The dashboard is still watching live market impact and will refresh headlines automatically."}</p>
    </article>
    <article class="impact-card">
      <span>Upcoming catalyst window</span>
      <strong>${eventItems[0] ? daysUntil(eventItems[0].date) : "--"} days</strong>
      <p>${eventItems[0] ? `${eventItems[0].title} may shift attention toward ${eventItems[0].impact}` : "No upcoming events configured."}</p>
    </article>
  `;

  el.topNewsList.innerHTML = impactItems.slice(0, 5).map((item) => `
    <article class="news-item">
      <div class="news-meta">
        <span>${item.source}</span>
        <span>${formatNewsTime(item.publishedAt)}</span>
      </div>
      <h3>${item.url && item.url !== "#" ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>` : item.title}</h3>
      <p>${item.body || "Potential price impact depends on whether this headline confirms with volume, liquidation data, and trend structure."}</p>
    </article>
  `).join("");

  el.eventList.innerHTML = eventItems.map((event) => `
    <article class="event-item">
      <span class="event-date">${formatEventDate(event)}</span>
      <h3><a href="${event.url}" target="_blank" rel="noreferrer">${event.title}</a></h3>
      <p>${event.location}</p>
      <p>${event.impact}</p>
    </article>
  `).join("");
}

function getUpcomingEvents() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return UPCOMING_EVENTS
    .filter((event) => new Date(`${event.endDate || event.date}T23:59:59`) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function daysUntil(dateText) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateText}T00:00:00`);
  return Math.max(0, Math.ceil((date - today) / 86400000));
}

function formatEventDate(event) {
  const start = new Date(`${event.date}T00:00:00`);
  const end = event.endDate ? new Date(`${event.endDate}T00:00:00`) : null;
  const startText = start.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  if (!end) return startText;
  const endText = end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  return `${startText} - ${endText}`;
}

function generateMarketImpactFeed() {
  const tickers = [...state.tickers.values()];
  const movers = [...tickers].sort((a, b) => Math.abs(Number(b.priceChangePercent)) - Math.abs(Number(a.priceChangePercent)));
  const volume = [...tickers].sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume));
  const selected = state.tickers.get(state.selectedSymbol);
  const items = [];

  if (movers[0]) {
    const move = Number(movers[0].priceChangePercent);
    items.push({
      source: "Market impact",
      title: `${movers[0].symbol.replace("USDT", "")} leads the 24h move at ${pct(move)}`,
      body: Math.abs(move) > 4
        ? "A large move can attract momentum traders, but it also raises reversal risk. Watch volume confirmation before chasing."
        : "The move is moderate. It matters most if volume expands and the chart breaks a nearby range."
    });
  }

  if (volume[0]) {
    items.push({
      source: "Liquidity scan",
      title: `${volume[0].symbol.replace("USDT", "")} has the heaviest tracked volume`,
      body: "High quote volume usually gives cleaner entries and exits. Prioritize liquid pairs when signals are similar."
    });
  }

  if (selected) {
    const change = Number(selected.priceChangePercent);
    items.push({
      source: "Selected asset",
      title: `${state.selectedSymbol.replace("USDT", "")} is ${pct(change)} over 24h`,
      body: change >= 0
        ? "Positive daily drift supports trend-following setups, but wait for a defined stop and avoid oversizing."
        : "Negative daily drift asks for patience. Favor smaller entries or wait for support to reclaim."
    });
  }

  return items;
}

function parseInputNumber(input) {
  return Number(String(input?.value || "").replace(/,/g, ""));
}

function setInputNumber(input, value) {
  if (!input || !Number.isFinite(value)) return;
  const precision = value >= 1000 ? 2 : value >= 1 ? 4 : 6;
  input.value = Number(value).toFixed(precision).replace(/\.?0+$/, "");
}

function syncRiskRewardDefaults(force = false) {
  if (!state.latestAnalysis || !state.chartRows.length) return;
  const last = state.chartRows.at(-1)?.close;
  if (force || !el.rrEntry.value) setInputNumber(el.rrEntry, last);
  if (force || !el.rrStop.value) setInputNumber(el.rrStop, state.latestAnalysis.stop);
  if (force || !el.rrTarget.value) setInputNumber(el.rrTarget, state.latestAnalysis.target);
  renderRiskReward();
}

function getRiskReward() {
  const entry = parseInputNumber(el.rrEntry);
  const stop = parseInputNumber(el.rrStop);
  const target = parseInputNumber(el.rrTarget);
  const account = parseInputNumber(el.rrAccount);
  const riskPercent = parseInputNumber(el.rrRisk);
  const riskPerUnit = Math.abs(entry - stop);
  const rewardPerUnit = Math.abs(target - entry);
  const ratio = riskPerUnit ? rewardPerUnit / riskPerUnit : 0;
  const riskAmount = account * (riskPercent / 100);
  const positionUnits = riskPerUnit ? riskAmount / riskPerUnit : 0;
  const notional = positionUnits * entry;
  const stopPct = entry ? ((stop - entry) / entry) * 100 : 0;
  const targetPct = entry ? ((target - entry) / entry) * 100 : 0;

  return { entry, stop, target, account, riskPercent, ratio, riskAmount, positionUnits, notional, stopPct, targetPct };
}

function renderRiskReward() {
  const rr = getRiskReward();
  const valid = rr.entry > 0 && rr.stop > 0 && rr.target > 0 && rr.account > 0 && rr.riskPercent > 0;
  const direction = rr.target >= rr.entry ? "Long" : "Short";
  const ratioTone = rr.ratio >= 2 ? "positive" : rr.ratio >= 1.2 ? "neutral" : "negative";
  el.rrBadge.textContent = valid ? `${rr.ratio.toFixed(2)}R` : "--";
  el.rrBadge.className = ratioTone;
  el.rrOutput.innerHTML = valid ? `
    <div><span>Setup</span><strong>${direction} ${rr.ratio.toFixed(2)}R</strong></div>
    <div><span>Risk amount</span><strong>${formatMoney(rr.riskAmount)}</strong></div>
    <div><span>Position size</span><strong>${rr.positionUnits.toLocaleString(undefined, { maximumFractionDigits: 5 })} units</strong></div>
    <div><span>Notional</span><strong>${formatMoney(rr.notional)}</strong></div>
    <div><span>Stop move</span><strong class="${rr.stopPct < 0 ? "negative" : "positive"}">${pct(rr.stopPct)}</strong></div>
    <div><span>Target move</span><strong class="${rr.targetPct < 0 ? "negative" : "positive"}">${pct(rr.targetPct)}</strong></div>
  ` : `
    <div><span>Status</span><strong>Enter valid levels</strong></div>
    <div><span>Tip</span><strong>Use signal levels, then adjust R</strong></div>
  `;
}

function setTargetFromRatio() {
  const entry = parseInputNumber(el.rrEntry);
  const stop = parseInputNumber(el.rrStop);
  const multiple = parseInputNumber(el.rrMultiple) || 2;
  if (!entry || !stop) return;
  const risk = Math.abs(entry - stop);
  const target = stop < entry ? entry + risk * multiple : entry - risk * multiple;
  setInputNumber(el.rrTarget, target);
  renderRiskReward();
}

function setStopFromRatio() {
  const entry = parseInputNumber(el.rrEntry);
  const target = parseInputNumber(el.rrTarget);
  const multiple = parseInputNumber(el.rrMultiple) || 2;
  if (!entry || !target || multiple <= 0) return;
  const reward = Math.abs(target - entry);
  const risk = reward / multiple;
  const stop = target > entry ? entry - risk : entry + risk;
  setInputNumber(el.rrStop, stop);
  renderRiskReward();
}

function renderAlerts(triggered = []) {
  el.alertSymbol.innerHTML = ASSETS.map((asset) => `<option value="${asset.symbol}">${asset.short}</option>`).join("");
  el.alertList.innerHTML = [
    ...triggered.map((item) => ({ ...item, triggered: true })),
    ...state.alerts
  ].slice(0, 8).map((alert, index) => `
    <article class="stack-item">
      <span class="stack-kicker ${alert.triggered ? "positive" : "neutral"}">${alert.triggered ? "Triggered" : "Watching"}</span>
      <h3>${alert.symbol.replace("USDT", "")} ${alert.direction} ${formatMoney(alert.price)}</h3>
      <p>${alert.triggered ? "Condition matched during the latest refresh." : "This alert is checked every 5 seconds against live ticker prices."}</p>
      ${alert.triggered ? "" : `<button class="text-button" data-remove-alert="${index}">Remove</button>`}
    </article>
  `).join("") || `<article class="stack-item"><span class="stack-kicker neutral">None</span><h3>No custom alerts</h3><p>Add target prices above to automate your watchlist.</p></article>`;
}

function renderAll(spikes = [], triggered = []) {
  renderAssets();
  renderOverview(spikes);
  renderComparisons();
  renderChart();
  renderStrategy();
  renderMarketNewsDashboard();
  renderNews();
  renderAlerts(triggered);
  el.refreshStatus.textContent = state.lastRefresh ? `Live ${state.lastRefresh.toLocaleTimeString()}` : "Live";
}

async function fetchTickers() {
  const symbols = encodeURIComponent(JSON.stringify(ASSETS.map((asset) => asset.symbol)));
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
  if (!response.ok) throw new Error("Ticker request failed");
  const data = await response.json();
  const spikes = [];

  data.forEach((ticker) => {
    const price = Number(ticker.lastPrice);
    const previous = state.previousPrices.get(ticker.symbol);
    if (previous) {
      const move = ((price - previous) / previous) * 100;
      if (Math.abs(move) >= 0.18) spikes.push({ symbol: ticker.symbol, move, price });
    }
    state.previousPrices.set(ticker.symbol, price);
    state.tickers.set(ticker.symbol, ticker);
  });

  return spikes.sort((a, b) => Math.abs(b.move) - Math.abs(a.move));
}

async function fetchChart() {
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${state.selectedSymbol}&interval=${state.interval}&limit=120`);
  if (!response.ok) throw new Error("Chart request failed");
  const data = await response.json();
  state.chartRows = data.map((row) => ({
    time: row[0],
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5])
  }));
}

async function fetchNews() {
  const news = [];
  try {
    const gdeltUrl = "https://api.gdeltproject.org/api/v2/doc/doc?query=bitcoin%20OR%20cryptocurrency%20OR%20ethereum%20OR%20stablecoin&mode=ArtList&format=json&maxrecords=12&sort=HybridRel&timespan=1d";
    const response = await fetch(gdeltUrl);
    if (!response.ok) throw new Error("GDELT request failed");
    const data = await response.json();
    news.push(...(data.articles || []).map((article) => ({
      title: article.title,
      body: article.seendate ? `Seen ${article.seendate}. Source domain: ${article.domain || "news source"}.` : "",
      url: article.url,
      published: article.seendate,
      source: article.domain || "GDELT"
    })));
  } catch (error) {
    console.warn("GDELT live news unavailable; trying crypto feeds.", error);
  }

  try {
    const response = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
    if (!response.ok) throw new Error("News request failed");
    const data = await response.json();
    const cryptoCompareNews = Array.isArray(data.Data)
      ? data.Data
      : Array.isArray(data.Data?.Data)
        ? data.Data.Data
        : Array.isArray(data.Data?.News)
          ? data.Data.News
          : [];
    news.push(...cryptoCompareNews);
  } catch (error) {
    console.warn("CryptoCompare news unavailable; trying RSS feeds.", error);
  }

  const rssFeeds = [
    { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
    { source: "Cointelegraph", url: "https://cointelegraph.com/rss" }
  ];

  await Promise.all(rssFeeds.map(async (feed) => {
    try {
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`${feed.source} RSS request failed`);
      const data = await response.json();
      if (Array.isArray(data.items)) {
        news.push(...data.items.map((item) => ({
          title: item.title,
          body: item.description?.replace(/<[^>]*>/g, "").trim() || "",
          url: item.link,
          pubDate: item.pubDate,
          source: feed.source
        })));
      }
    } catch (error) {
      console.warn(`${feed.source} RSS unavailable.`, error);
    }
  }));

  state.news = dedupeNews(news).slice(0, 24);
  state.lastNewsRefresh = new Date();
}

function parseRssFeed(xml, source) {
  const documentXml = new DOMParser().parseFromString(xml, "text/xml");
  return [...documentXml.querySelectorAll("item")].slice(0, 10).map((item) => ({
    title: item.querySelector("title")?.textContent?.trim() || "",
    body: item.querySelector("description")?.textContent?.replace(/<[^>]*>/g, "").trim() || "",
    url: item.querySelector("link")?.textContent?.trim() || "#",
    pubDate: item.querySelector("pubDate")?.textContent?.trim() || "",
    source
  }));
}

function dedupeNews(news) {
  const seen = new Set();
  return news.filter((item) => {
    const key = String(item.title || item.name || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function checkAlerts() {
  const triggered = [];
  state.alerts = state.alerts.filter((alert) => {
    const ticker = state.tickers.get(alert.symbol);
    const price = Number(ticker?.lastPrice || 0);
    const hit = alert.direction === "above" ? price >= alert.price : price <= alert.price;
    if (hit) triggered.push(alert);
    return !hit;
  });
  if (triggered.length) localStorage.setItem("crypto-alerts", JSON.stringify(state.alerts));
  return triggered;
}

async function refresh({ includeNews = false } = {}) {
  if (state.paused) return;
  try {
    const [spikes] = await Promise.all([
      fetchTickers(),
      fetchChart(),
      includeNews ? fetchNews() : Promise.resolve()
    ]);
    state.lastRefresh = new Date();
    renderAll(spikes, checkAlerts());
  } catch (error) {
    el.refreshStatus.textContent = "Retrying data";
    console.error(error);
  }
}

function bindEvents() {
  el.assetList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-symbol]");
    if (!row) return;
    state.selectedSymbol = row.dataset.symbol;
    refresh({ includeNews: false });
  });

  document.querySelectorAll("[data-interval]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-interval]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.interval = button.dataset.interval;
      refresh({ includeNews: false });
    });
  });

  el.resetChart.addEventListener("click", () => {
    if (!tradingChart.chart) return;
    tradingChart.chart.timeScale().fitContent();
  });

  el.refreshButton.addEventListener("click", () => refresh({ includeNews: true }));
  el.pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    document.body.classList.toggle("paused", state.paused);
    el.pauseButton.innerHTML = `<span data-icon="${state.paused ? "play" : "pause"}" data-fallback="${state.paused ? ">" : "||"}"></span>`;
    if (window.lucide) lucide.createIcons();
    el.refreshStatus.textContent = state.paused ? "Paused" : "Resuming";
    if (!state.paused) refresh({ includeNews: true });
  });

  el.alertForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const price = Number(el.alertPrice.value);
    if (!price) return;
    state.alerts.unshift({
      symbol: el.alertSymbol.value,
      direction: el.alertDirection.value,
      price,
      createdAt: Date.now()
    });
    state.alerts = state.alerts.slice(0, 12);
    localStorage.setItem("crypto-alerts", JSON.stringify(state.alerts));
    el.alertPrice.value = "";
    renderAlerts();
  });

  el.alertList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-alert]");
    if (!button) return;
    state.alerts.splice(Number(button.dataset.removeAlert), 1);
    localStorage.setItem("crypto-alerts", JSON.stringify(state.alerts));
    renderAlerts();
  });

  el.clearAlerts.addEventListener("click", () => {
    state.alerts = [];
    localStorage.removeItem("crypto-alerts");
    renderAlerts();
  });

  [el.rrEntry, el.rrStop, el.rrTarget, el.rrMultiple, el.rrAccount, el.rrRisk].forEach((input) => {
    input.addEventListener("input", renderRiskReward);
  });
  el.useSignalLevels.addEventListener("click", () => syncRiskRewardDefaults(true));
  el.setTargetFromRatio.addEventListener("click", setTargetFromRatio);
  el.setStopFromRatio.addEventListener("click", setStopFromRatio);
}

function init() {
  bindEvents();
  initTradingChart();
  renderAssets();
  renderAlerts();
  renderRiskReward();
  if (window.lucide) lucide.createIcons();
  refresh({ includeNews: true });
  setInterval(() => refresh({ includeNews: false }), 5000);
  setInterval(() => refresh({ includeNews: true }), 60000);
}

init();
