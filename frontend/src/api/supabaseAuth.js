const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function assertConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
}

async function request(path, { token, body, method = 'GET' } = {}) {
  assertConfigured()

  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    method,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token || supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.msg || data.message || data.error_description || 'Supabase authentication failed')
  }

  return data
}

function toAuthResult(data) {
  if (!data.access_token || !data.user) {
    throw new Error('Account created. Please confirm your email before signing in.')
  }

  return {
    token: data.access_token,
    user: data.user,
  }
}

export async function signInWithPassword(email, password) {
  const data = await request('/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })

  return toAuthResult(data)
}

export async function signUpWithPassword(name, email, password) {
  const data = await request('/signup', {
    method: 'POST',
    body: {
      email,
      password,
      data: { name, full_name: name },
    },
  })

  return toAuthResult(data)
}

export async function getUser(token) {
  const data = await request('/user', { token })
  return data
}
