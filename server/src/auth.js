import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const COOKIE_NAME = 'sprinklers_auth'
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export function createAuth(config) {
  const trustIps = new Set(config.trustIps || [])

  function isTrustedIp(req) {
    return trustIps.has(req.ip)
  }

  function hasValidCookie(req) {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token || !config.jwtSecret) return false
    try {
      jwt.verify(token, config.jwtSecret)
      return true
    } catch {
      return false
    }
  }

  return {
    cookieParser: cookieParser(),

    requireAuth(req, res, next) {
      if (isTrustedIp(req)) return next()
      if (hasValidCookie(req)) return next()
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'unauthorized' })
      }
      return res.redirect('/login.html')
    },

    async loginHandler(req, res) {
      const { password } = req.body || {}
      if (!password || !config.passwordHash || !config.jwtSecret) {
        return res.status(401).json({ error: 'unauthorized' })
      }
      let ok = false
      try {
        ok = await argon2.verify(config.passwordHash, password)
      } catch {
        ok = false
      }
      if (!ok) return res.status(401).json({ error: 'unauthorized' })

      const token = jwt.sign({ sub: 'user' }, config.jwtSecret, { expiresIn: '30d' })
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: req.secure,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE_MS,
      })
      res.json({ ok: true })
    },

    logoutHandler(req, res) {
      res.clearCookie(COOKIE_NAME)
      res.json({ ok: true })
    },
  }
}
