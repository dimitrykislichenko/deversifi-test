export class Wallet {
  private balances: { [k: string]: number } = {};

  constructor() {
    setInterval(() => {
      this.printBalance();
    }, 30000);
  }

  inc(symbol: string, amount: number) {
    if (this.balances[symbol] === undefined) {
      this.balances[symbol] = 0;
    }

    this.balances[symbol] += amount;
  }

  dec(symbol: string, amount: number) {
    if (this.balances[symbol] === undefined) {
      throw new Error("Insufficient balance");
    }

    this.balances[symbol] -= amount;
  }

  getBalance(symbol: string) {
    return this.balances[symbol] || 0;
  }

  getTotalBalance() {
    return this.balances;
  }

  printBalance() {
    console.log("=".repeat(40));
    console.log(" Current balance:");
    const balance = this.getTotalBalance();
    Object.keys(balance).forEach((symbol: any) => {
      console.log(` ${symbol}:\t${balance[symbol]}`);
    });
    console.log("=".repeat(40));
  }
}
