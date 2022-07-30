export const Data = Symbol("data");

type RRFile = {
  name: string;
  [Data]: Blob | string;
  type?: string;
};

function isRRFile(
  o: Record<string | symbol, Blob | string | number | boolean | null>,
): o is RRFile {
  return typeof o[Data] !== "undefined";
}

export interface RROptions {
  query?: Record<string, number | string>;
  header?: HeadersInit;

  https?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | {
    custom: string;
  };

  form?: Record<
    string,
    | string
    | number
    | Blob
    | RRFile
    | Record<string, string | number | null | boolean>
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
  let contentType = {};
  let body: BodyInit | null = null;
  if (typeof userBody !== "undefined") {
    body = userBody;
  } else if (form) {
    for (const o of Object.values(form)) {
      if (typeof o === "object") {
        if (o instanceof Blob) {
          console.log(
            "[RR] Detected blob, switched content type to multipart/form-data",
          );
          formType = "form";
        } else if (isRRFile(o)) {
          console.log(
            "[RR] Detected RR-File, switched content type to multipart/form-data",
          );
          formType = "form";
        } else {
          if (formType === "urlencoded") {
            console.log(
              "[RR] Object is not supported in urlencoded form, switching to application/json",
            );
          }
          formType === "json";
        }
      }
    }

    if (formType === "urlencoded") {
      contentType = { "content-type": "application/x-www-form-urlencoded" };
      body = Object.entries(form).map(([k, v]) => {
        if (typeof v === "object") {
          throw new Error(`${k}: Object is not supported in urlencoded form`);
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      }).join("&");
    } else if (formType === "form") {
      body = new FormData();
      for (const key in form) {
        const value = form[key];
        if (value instanceof Blob) {
          body.append(key, value);
        } else if (typeof value === "object") {
          const file = value as RRFile;
          body.append(
            key,
            file[Data].slice(0, -1, file.type),
            file.name,
          );
        } else {
          body.append(key, String(value));
        }
      }
      console.log("[RR]", body);
    } else if (formType === "json") {
      contentType = { "content-type": "application/json" };
      body = JSON.stringify(form);
    }
  }

  const response = await fetch(url, {
    method: typeof method === "object" ? method.custom : method,
    headers: {
      ...contentType,
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
