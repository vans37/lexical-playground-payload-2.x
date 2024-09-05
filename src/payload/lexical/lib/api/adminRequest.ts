export default async function adminRequest<T>(
  url: URL | globalThis.Request | string,
  init?: RequestInit,
): Promise<T> {
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
    })

    return await res.json()
  } catch (err) {
    throw new Error(err)
  }
}
