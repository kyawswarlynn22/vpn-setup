interface OutlineKey {
  id: string;
  name: string;
  password: string;
  port: number;
  method: string;
  accessUrl: string;
  dataLimit?: { bytes: number };
}

interface OutlineUsage {
  bytesTransferredByUserId: Record<string, number>;
}

async function outlineFetch(apiUrl: string, path: string, options: RequestInit = {}) {
  const url = `${apiUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Outline API error (${res.status}): ${text}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export async function createKey(apiUrl: string): Promise<OutlineKey> {
  return outlineFetch(apiUrl, "/access-keys", { method: "POST" });
}

export async function listKeys(apiUrl: string): Promise<{ accessKeys: OutlineKey[] }> {
  return outlineFetch(apiUrl, "/access-keys", { method: "GET" });
}

export async function getKey(apiUrl: string, keyId: string): Promise<OutlineKey> {
  return outlineFetch(apiUrl, `/access-keys/${keyId}`, { method: "GET" });
}

export async function renameKey(apiUrl: string, keyId: string, name: string): Promise<void> {
  await outlineFetch(apiUrl, `/access-keys/${keyId}/name`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteKey(apiUrl: string, keyId: string): Promise<void> {
  await outlineFetch(apiUrl, `/access-keys/${keyId}`, { method: "DELETE" });
}

export async function getDataUsage(apiUrl: string): Promise<OutlineUsage> {
  return outlineFetch(apiUrl, "/metrics/transfer", { method: "GET" });
}

export async function setDataLimit(apiUrl: string, keyId: string, bytes: number): Promise<void> {
  await outlineFetch(apiUrl, `/access-keys/${keyId}/data-limit`, {
    method: "PUT",
    body: JSON.stringify({ limit: { bytes } }),
  });
}

export async function removeDataLimit(apiUrl: string, keyId: string): Promise<void> {
  await outlineFetch(apiUrl, `/access-keys/${keyId}/data-limit`, {
    method: "DELETE",
  });
}
