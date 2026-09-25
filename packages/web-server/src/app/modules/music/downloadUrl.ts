export const toDownloadUrl = (raw: string, port: number, virtualPrefix: string, proxyPath: string) => {
  const path = raw.startsWith(virtualPrefix) ? raw.slice(virtualPrefix.length) : raw
  const prefix = `${proxyPath}/`
  const relative = path.startsWith(`.${prefix}`) ? path.slice(1) : path
  if (relative.startsWith(prefix)) {
    const name = relative.slice(prefix.length)
    if (!/^[\w.]{1,128}$/.test(name)) throw new Error('Music source returned an invalid URL')
    return `http://127.0.0.1:${port}${prefix}${name}`
  }
  if (raw.startsWith(virtualPrefix)) throw new Error('Music source returned an invalid URL')
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error()
    return url.toString()
  } catch {
    throw new Error('Music source returned an invalid URL')
  }
}
