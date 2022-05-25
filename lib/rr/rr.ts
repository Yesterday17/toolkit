export interface RROptions {
  query?: Record<string, number | string>;
  header?: HeadersInit;

  https?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | {
    custom: string;
  };

  form?: Record<
    string,
    string | number | Blob | { name: string; data: Blob; type?: string }
  >;
  formType?: "urlencoded" | "form" | "json";
  body?: BodyInit;
  userAgent?: string;
  redirect?: RequestRedirect;
}

export default async function rr(
  base: string,
  {
    query,
    header,
    https = false,
    method = "GET",
    form,
    formType = "urlencoded",
    body: userBody,
    userAgent =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
    redirect = "error",
  }: RROptions,
) {
  // construct url
  const protocol = https ? "https" : "http";
  const urlQuery = query
    ? "?" +
      Object.entries(query).map(([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
      ).join("&")
    : "";
  const url = `${protocol}://${base}${urlQuery}`;

  // construct body
  let contentType = "";
  let body: BodyInit | null = null;
  if (typeof userBody !== "undefined") {
    body = userBody;
  } else if (form) {
    if (formType === "urlencoded") {
      contentType = "application/x-www-form-urlencoded";
      body = Object.entries(form).map(([k, v]) => {
        if (typeof v === "object") {
          throw new Error(`${k}: Blob is not supported in urlencoded form`);
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      }).join("&");
    } else if (formType === "form") {
      contentType = "multipart/form-data";
      body = new FormData();
      for (const key in form) {
        const value = form[key];
        if (value instanceof Blob) {
          body.append(key, value);
        } else if (typeof value === "object") {
          body.append(key, value.data.slice(0, -1, value.type), value.name);
        } else {
          body.append(key, String(value));
        }
      }
    } else if (formType === "json") {
      contentType = "application/json";
      body = JSON.stringify(form);
    }
  }

  const response = await fetch(url, {
    method: typeof method === "object" ? method.custom : method,
    headers: {
      "content-type": contentType,
      "user-agent": userAgent,
      ...header,
    },
    body,
    redirect,
  });
  return response;
}

export function gg(base: string, options?: RROptions) {
  return rr(base, { ...options, method: "GET" });
}

export function pp(base: string, options?: RROptions) {
  return rr(base, { ...options, method: "POST" });
}

export function dd(base: string, options?: RROptions) {
  return rr(base, { ...options, method: "DELETE" });
}
