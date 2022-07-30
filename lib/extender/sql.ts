declare global {
  interface String {
    spaceTo(to: string): string;
    spaceToTab(): string;
    spaceToComment(): string;
  }
}

String.prototype.spaceTo = function (to) {
  return this.replaceAll(" ", to);
};

String.prototype.spaceToTab = function () {
  return this.spaceTo("\t");
};

String.prototype.spaceToComment = function () {
  return this.spaceTo("/**/");
};
