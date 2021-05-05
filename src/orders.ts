import { Wallet } from "./wallet";

export enum EOrderAction {
  SELL,
  BUY,
}

export interface IOrder {
  action: EOrderAction;
  amount: number;
  price: number;
  stopPrice: number;
}

export class Orders {
  private orders: IOrder[] = [];
  private trades: IOrder[] = [];

  constructor(private readonly wallet: Wallet) {}

  getOrders(action: EOrderAction) {
    return this.orders.filter((order) => {
      return order.action === action;
    });
  }

  getStopPrice(action: EOrderAction, price: number) {
    if (action === EOrderAction.BUY) {
      return price - price * 0.05;
    } else {
      return price * 1.05;
    }
  }

  addOrder(action: EOrderAction, amount: number, price: number) {
    if (action === EOrderAction.SELL) {
      console.log(`PLACE SELL ORDER @ ${amount} ${price}`);
      this.wallet.dec("ETH", amount);
    } else if (action === EOrderAction.BUY) {
      console.log(`PLACE BUY ORDER @ ${amount} ${price}`);
      this.wallet.dec("USD", amount * price);
    }

    const stopPrice = this.getStopPrice(action, price);
    this.orders.push({ action, amount, price, stopPrice });
  }

  cancelOrder(action: EOrderAction, price: number) {
    this.orders = this.orders.reduce<IOrder[]>((prev, next) => {
      if (next.action === action && next.price === price) {
        if (next.action === EOrderAction.SELL) {
          this.wallet.inc("ETH", next.amount);
        } else if (next.action === EOrderAction.BUY) {
          this.wallet.inc("USD", next.amount * next.price);
        }

        return prev;
      }

      return [...prev, next];
    }, []);
  }

  cancelStopPriceOrders(price: number) {
    this.orders = this.orders.reduce<IOrder[]>((prev, next) => {
      if (next.action === EOrderAction.SELL && next.stopPrice <= price) {
        this.wallet.inc("ETH", next.amount);
        return prev;
      } else if (next.action === EOrderAction.BUY && next.stopPrice >= price) {
        this.wallet.inc("USD", next.amount * next.price);
        return prev;
      }

      return [...prev, next];
    }, []);
  }

  addTrade(order: IOrder) {
    // Update ballance of the wallet
    if (order.action === EOrderAction.SELL) {
      console.log(
        `FILLED SELL ORDER @ ${order.price} ${order.amount} (ETH - ${
          order.amount
        } USD + ${order.amount * order.price})`
      );
      this.wallet.inc("USD", order.amount * order.price);
    } else if (order.action === EOrderAction.BUY) {
      console.log(
        `FILLED BUY ORDER @ ${order.price} ${order.amount} (ETH + ${
          order.amount
        } USD - ${order.amount * order.price})`
      );
      this.wallet.inc("ETH", order.amount);
    }

    this.trades.push(order);
  }

  fulfil(price: number) {
    // If price has reached target price of order, create a new trade and remove order
    this.orders = this.orders.reduce<IOrder[]>((prev, next) => {
      const buyOrderExecuted =
        next.action === EOrderAction.SELL && price >= next.price;
      const sellOrderExecuted =
        next.action === EOrderAction.BUY && price <= next.price;

      if (sellOrderExecuted || buyOrderExecuted) {
        this.addTrade(next);
        return prev;
      }

      return [...prev, next];
    }, []);
  }
}
