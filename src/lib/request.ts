'server only'

const checkEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}

const getApiUrl = (): string => {
  return checkEnv('NEXT_PUBLIC_PAYLOAD_URL')
}

const getApiSecret = (): string => {
  return checkEnv('API_SECRET')
}

const fetchWrapper = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, init)

  const json = await response.json()

  if (!response.ok) {
    throw new Error(
      `Request failed, status: ${response.status}, error: ${JSON.stringify(json.errors)}`,
    )
  }

  return json as T
}

export interface RequestOptions {
  isAuthRequired?: boolean
  throttle?: number
}

export default async function requestApi<T>(
  path: string,
  init?: RequestInit,
  options: RequestOptions = {},
): Promise<T> {
  const API_URL = getApiUrl()
  const API_SECRET = getApiSecret()

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (options.isAuthRequired !== false) {
    defaultHeaders['Authorization'] = `users API-Key ${API_SECRET}`
  }

  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
  }

  if (process.env.NODE_ENV === 'development') {
    mergedInit.cache = 'no-store'
    delete mergedInit.next
  }

  if (options.throttle && options.throttle > 0 && process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, options.throttle))
  }

  return fetchWrapper<T>(API_URL + path, mergedInit)
}
