import fetch from "node-fetch";

export enum ESymbol {
  ETHUSDT = "ETH:USDT",
}

export type SubscriberCallback = (orderbook: number[][]) => void;

export class OrderBook {
  private orderbook: { [k: string]: number[][] } = {};
  private subscribers: { [k: string]: SubscriberCallback[] } = {};

  constructor() {}

  /**
   * Start watching specified symbol
   */
  async watch(symbol: ESymbol, precision: string, length: number) {
    const url = `https://api.stg.deversifi.com/market-data/book/${symbol}/${precision}/${length}`;

    const interval = setInterval(async () => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      this.orderbook[symbol] = await response.json();

      this.notifySubscribers(symbol);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }

  /**
   * Notify each subscriber if specified symbol about orderbook update
   */
  notifySubscribers(symbol: ESymbol) {
    if (this.subscribers[symbol] !== undefined) {
      this.subscribers[symbol].forEach((subscriber: SubscriberCallback) => {
        subscriber(this.orderbook[symbol]);
      });
    }
  }

  /**
   * Subscribe to updates of orderbook of specified symbol
   */
  subscribe(symbol: ESymbol, cb: SubscriberCallback) {
    if (!this.subscribers[symbol]) {
      this.subscribers[symbol] = [];
    }

    this.subscribers[symbol].push(cb);

    // Return function that unsubscribes specified subcriber from events
    return () => {
      this.subscribers[symbol] = this.subscribers[symbol].filter(
        (subscriber: SubscriberCallback) => {
          return subscriber === cb;
        }
      );
    };
  }
}
