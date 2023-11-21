import chalk from "chalk";
import * as fs from "fs";
import * as util from "util";
import * as path from "path";

let LOGFILE = path.join(__dirname, "../../../../logs/debug.log");

if (!fs.existsSync(LOGFILE)) {
  LOGFILE = path.join(__dirname, "../../../logs/debug.log");
}

class Logger {
  constructor() {}

  private static log_file = fs.createWriteStream(LOGFILE, { flags: "w" });

  static getDateTime() {
    const date: Date = new Date();
    return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
  }

  static intro(...args: any) {
    console.log(...args);
  }

  static log(...args: any) {
    const msg = `[${this.getDateTime()} | Senses] - `;

    console.log(msg, ...args);

    this.log_file.write(util.format(msg, ...args) + "\n");
  }

  static warning(...args: any) {
    const msg = `[${this.getDateTime()} | Senses] - `;

    console.log(chalk.yellow(msg, ...args));

    this.log_file.write(util.format(msg, ...args) + "\n");
  }

  static error(...args: any) {
    const msg = `[${this.getDateTime()} | Senses] - `;

    console.log(chalk.red(msg, ...args));

    this.log_file.write(util.format(msg, ...args) + "\n");
  }

  private static pad(n: string | number) {
    return ("0" + n).slice(-2);
  }
}

export default Logger;
