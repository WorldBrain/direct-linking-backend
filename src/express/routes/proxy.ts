import { createProxyServer } from 'http-proxy'

export function proxyGetRequest({}) {
  const proxyServer = createProxyServer({})
  return function handleProxyGetRequest({req, res}) {
    const opts = {
      prependPath: true,
      ignorePath: true,
      changeOrigin: true,
      secure: false
    }

    proxyServer.web(req, res, opts, err => {
      if (err) console.error('PROXY ERROR', err)
    })
  }
}
