const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return url.toString();
  }

  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOpts } = options ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      ...fetchOpts,
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOpts } = options ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      ...fetchOpts,
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(fetchOpts.headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  }

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOpts } = options ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      ...fetchOpts,
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
    return res.json();
  }

  /**
   * Stream SSE response for AI chat
   */
  async streamSSE(
    path: string,
    body: unknown,
    onChunk: (text: string) => void,
    onDone?: () => void
  ): Promise<void> {
    const res = await fetch(this.buildUrl(path), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`SSE ${path} failed: ${res.status}`);
    if (!res.body) throw new Error("No response body for SSE");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
          } catch {
            // Plain text chunk
            onChunk(data);
          }
        }
      }
    }

    onDone?.();
  }
}

export const api = new ApiClient(API_URL);
