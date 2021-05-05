import { ESymbol, OrderBook } from "./orderbook";
import { EOrderAction, Orders } from "./orders";
import { Wallet } from "./wallet";

export class Bot {
  private orderbook = new OrderBook();
  private orders: Orders;

  constructor(private readonly wallet: Wallet) {
    this.orders = new Orders(wallet);
    this.orderbook.watch(ESymbol.ETHUSDT, "P0", 25);
  }

  onOrderBookUpdated = (orderbook: number[][]) => {
    const bestPrice = orderbook[0][0];
    console.log(`New cycle, best price: ${bestPrice}`);

    this.orders.fulfil(bestPrice);
    this.orders.cancelStopPriceOrders(bestPrice);

    this.placeBuyOrders(bestPrice);

    this.placeSellOrders(bestPrice);
  };

  placeBuyOrders(price: number) {
    const usdAmount = this.wallet.getBalance("USD") / 5;
    const orders = this.orders.getOrders(EOrderAction.BUY).length;
    for (let i = orders; i < 5; i++) {
      const minPrice = price;
      const maxPrice = price - price * 0.05;

      const buyPrice =
        Math.floor((Math.random() * (maxPrice - minPrice) + minPrice) * 1000) /
        1000;

      const ethAmount = usdAmount / buyPrice;
      this.orders.addOrder(EOrderAction.BUY, ethAmount, buyPrice);
    }
  }

  placeSellOrders(price: number) {
    const ethAmount = this.wallet.getBalance("ETH") / 5;
    const orders = this.orders.getOrders(EOrderAction.SELL).length;
    for (let i = orders; i < 5; i++) {
      const minPrice = price * 1.05;
      const maxPrice = price;

      const sellPrice =
        Math.floor((Math.random() * (maxPrice - minPrice) + minPrice) * 1000) /
        1000;

      this.orders.addOrder(EOrderAction.SELL, ethAmount, sellPrice);
    }
  }

  greeting() {
    console.log("Staring Trading");
    this.wallet.printBalance();
  }

  start() {
    this.greeting();
    this.orderbook.subscribe(ESymbol.ETHUSDT, this.onOrderBookUpdated);
  }
}
