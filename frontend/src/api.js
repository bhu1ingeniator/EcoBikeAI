const API = "http://localhost:8080/api";

export async function getJson(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function postJson(path, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}