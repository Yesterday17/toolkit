declare interface Number {
  // Number -> binary string
  bin(prefix?: boolean): string;
  // Number -> hex string
  hex(prefix?: boolean): string;
}

Number.prototype.bin = function (prefix = false) {
  return (prefix ? "0b" : "") + this.toString(2);
};

Number.prototype.hex = function (prefix = false) {
  return (prefix ? "0x" : "") + this.toString(16);
};
