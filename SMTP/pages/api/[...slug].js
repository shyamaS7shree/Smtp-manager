import { baseUrl } from "./common/http";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { slug, ...queryParams } = req.query;
  const path = slug ? (Array.isArray(slug) ? slug.join("/") : slug) : "";
  let targetUrl = `${baseUrl}/${path}`;

  const queryString = new URLSearchParams(queryParams).toString();
  if (queryString) {
    targetUrl += `?${queryString}`;
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };

    // Forward the authorization token
    if (req.headers.authorization) {
      fetchOptions.headers["Authorization"] = req.headers.authorization;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    console.log(`🔀 Proxying ${req.method} request to: ${targetUrl}`);

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error(`💥 Proxy Error for ${targetUrl}:`, error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error (Proxy)",
      error: error.message,
    });
  }
}
