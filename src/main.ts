import { Bot } from "./bot";
import { Wallet } from "./wallet";

// Create a new wallet with initi value of ETH and USDT
const wallet = new Wallet();
wallet.inc("ETH", 10);
wallet.inc("USD", 20000);

// Create a new bot and start trading
const bot = new Bot(wallet);
bot.start();
