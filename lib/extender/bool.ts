declare global {
  interface Boolean {
    /**
     * true  -> 1
     * false -> 0
     */
    num(): number;
    /**
     * true  -> "true"
     * false -> "false"
     */
    str(): string;
  }
}

Boolean.prototype.num = function () {
  return Number(this);
};

Boolean.prototype.str = function () {
  return String(this);
};
