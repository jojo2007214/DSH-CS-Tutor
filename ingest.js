/**
 * Ingest helpers for the Adaptive CS Tutor.
 *
 * Two jobs, both on the Host so the browser never needs a third-party parser:
 *
 *  - Bilibili: resolve a video URL, fetch public metadata and any public
 *    subtitle track, and turn it into a structured learning brief. Video and
 *    audio streams are deliberately not downloaded.
 *  - Files: extract text from plain text, DOCX, PPTX, and (best effort) PDF.
 */

import { inflateRawSync, inflateSync } from 'node:zlib'

const BROWSER_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  referer: 'https://www.bilibili.com/',
  accept: 'application/json, text/plain, */*',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'html', 'htm',
  'c', 'h', 'hpp', 'cpp', 'cc', 'cxx', 'py', 'java', 'js', 'mjs', 'ts', 'tsx', 'jsx',
  'go', 'rs', 'sql', 'yaml', 'yml', 'toml', 'ini', 'log',
])

function clock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (value) => String(value).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15_000) {
  if (typeof fetch !== 'function') throw new Error('当前运行环境不支持网络抓取。')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted) throw new Error('抓取超时，请检查网络。')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJson(url, headers = BROWSER_HEADERS, timeoutMs = 15_000) {
  const response = await fetchWithTimeout(url, { headers, redirect: 'follow' }, timeoutMs)
  if (!response.ok) throw new Error(`抓取失败：HTTP ${response.status}`)
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('抓取到的内容不是 JSON，可能被网站风控拦截。')
  }
}

function normalizeBilibiliUrl(input) {
  const text = String(input ?? '').trim()
  const directBv = /(?:^|\s)(BV[0-9A-Za-z]{10})(?:\s|$)/.exec(text)
  if (directBv !== null && /^https?:\/\//i.test(text) === false) {
    return new URL(`https://www.bilibili.com/video/${directBv[1]}`)
  }
  const directAv = /(?:^|\s)av(\d+)(?:\s|$)/i.exec(text)
  if (directAv !== null && /^https?:\/\//i.test(text) === false) {
    return new URL(`https://www.bilibili.com/video/av${directAv[1]}`)
  }
  const link = /https?:\/\/[^\s"'<>]+/i.exec(text)
  if (link === null) throw new Error('没有找到有效的 B 站链接或 BV 号。')
  let url
  try {
    url = new URL(link[0])
  } catch {
    throw new Error('链接格式不正确。')
  }
  const host = url.hostname.toLowerCase()
  const allowed = host === 'bilibili.com' || host.endsWith('.bilibili.com') || host === 'b23.tv' || host.endsWith('.b23.tv')
  if (allowed === false) throw new Error('目前只支持 B 站链接（bilibili.com / b23.tv）。')
  return url
}

function videoIds(text) {
  const bvid = /BV[0-9A-Za-z]{10}/.exec(text)
  const aid = /\/av(\d+)/i.exec(text) ?? /[?&]aid=(\d+)/i.exec(text)
  return { bvid: bvid === null ? undefined : bvid[0], aid: aid === null ? undefined : aid[1] }
}

export async function crawlBilibili(input) {
  const url = normalizeBilibiliUrl(input)
  let ids = videoIds(url.href)

  if (ids.bvid === undefined && ids.aid === undefined) {
    const response = await fetchWithTimeout(url.href, { headers: BROWSER_HEADERS, redirect: 'follow' }, 15_000)
    const finalUrl = new URL(response.url || url.href)
    ids = videoIds(finalUrl.href)
    if (response.body !== null) await response.body.cancel().catch(() => {})
    if (ids.bvid === undefined && ids.aid === undefined) throw new Error('无法从短链接中解析出视频编号。')
  }

  const api = ids.bvid !== undefined
    ? `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(ids.bvid)}`
    : `https://api.bilibili.com/x/web-interface/view?aid=${encodeURIComponent(ids.aid)}`
  const payload = await fetchJson(api)
  if (payload.code !== 0 || payload.data === undefined) {
    throw new Error(payload.message || 'B 站没有返回视频信息。')
  }
  const data = payload.data
  const bvid = typeof data.bvid === 'string' ? data.bvid : ids.bvid
  const pages = Array.isArray(data.pages) ? data.pages : []

  const subtitleSections = []
  let subtitleChars = 0
  let subtitleNote = ''
  const pagesToTry = pages.slice(0, 10)
  for (const page of pagesToTry) {
    if (subtitleChars > 45_000) {
      subtitleNote = '字幕较长，已截断。'
      break
    }
    try {
      const player = await fetchJson(
        `https://api.bilibili.com/x/player/v2?bvid=${encodeURIComponent(bvid)}&cid=${encodeURIComponent(page.cid)}`,
      )
      if (player.code !== 0) continue
      const tracks = player.data?.subtitle?.subtitles
      if (Array.isArray(tracks) === false || tracks.length === 0) continue
      const chosen = tracks.find((track) => /zh|cn/i.test(`${track.lan ?? ''} ${track.lan_doc ?? ''}`)) ?? tracks[0]
      if (typeof chosen?.subtitle_url !== 'string') continue
      const subtitleUrl = chosen.subtitle_url.startsWith('//') ? `https:${chosen.subtitle_url}` : chosen.subtitle_url
      const subtitle = await fetchJson(subtitleUrl)
      const body = Array.isArray(subtitle.body) ? subtitle.body : []
      const lines = body
        .map((item) => `[${clock(item.from)}] ${String(item.content ?? '').trim()}`)
        .filter((line) => line.length > 4)
      if (lines.length === 0) continue
      const section = `### P${page.page} ${page.part ?? ''}\n${lines.join('\n')}`
      if (subtitleChars + section.length > 60_000) {
        subtitleNote = '字幕较长，已截断。'
        break
      }
      subtitleSections.push(section)
      subtitleChars += section.length
    } catch {
      // One page without a public subtitle track must not fail the whole crawl.
    }
  }

  const hasSubtitle = subtitleSections.length > 0
  const lines = [
    '【B 站课程抓取】',
    `标题：${data.title ?? '（无标题）'}`,
    `UP 主：${data.owner?.name ?? '（未知）'}`,
    `链接：https://www.bilibili.com/video/${bvid ?? ''}`,
    `总时长：${clock(data.duration)}`,
    `简介：${data.desc?.trim() || '（无简介）'}`,
    '',
    '【分P目录】',
    ...(pages.length === 0
      ? ['（没有分P信息）']
      : pages.map((page) => `P${page.page} ${page.part ?? ''}（${clock(page.duration)}）`)),
  ]
  if (hasSubtitle) {
    lines.push('', '【公开字幕/转写】', subtitleSections.join('\n\n'))
  } else {
    lines.push(
      '',
      '【注意】未获取到公开字幕或转写。B 站字幕通常需要登录，或由 UP 主开启；请把字幕、转写或课程正文粘贴到材料中。',
    )
  }
  if (subtitleNote !== '') lines.push('', `（${subtitleNote}）`)

  return {
    ok: true,
    kind: 'bilibili',
    title: data.title ?? 'B 站课程',
    material: lines.join('\n').slice(0, 60_000),
    hasSubtitle,
    subtitleChars,
    pages: pages.length,
    warning: hasSubtitle
      ? (subtitleNote === '' ? '' : subtitleNote)
      : '未获取到公开字幕；已抓取标题、简介和分P目录，请补充字幕或转写。',
  }
}

function decodeXml(text) {
  return String(text)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function stripHtml(text) {
  return decodeXml(
    String(text)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function decodeText(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) return buffer.subarray(2).toString('utf16le')
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) return buffer.subarray(3).toString('utf8')
  return buffer.toString('utf8')
}

function extensionOf(name) {
  const match = /\.([a-z0-9]+)$/i.exec(String(name ?? ''))
  return match === null ? '' : match[1].toLowerCase()
}

/** Minimal ZIP reader: central directory + stored/deflate entries. */
function readZipEntries(buffer) {
  if (buffer.length < 22) throw new Error('文件太小，不是有效的 ZIP/DOCX/PPTX。')
  let eocd = -1
  const start = Math.max(0, buffer.length - 65_557)
  for (let offset = buffer.length - 22; offset >= start; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      eocd = offset
      break
    }
  }
  if (eocd === -1) throw new Error('ZIP 目录损坏，无法解析该文档。')
  const total = buffer.readUInt16LE(eocd + 10)
  let offset = buffer.readUInt32LE(eocd + 16)
  const entries = new Map()
  for (let index = 0; index < total; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) break
    const method = buffer.readUInt16LE(offset + 10)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const uncompressedSize = buffer.readUInt32LE(offset + 24)
    const nameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const localOffset = buffer.readUInt32LE(offset + 42)
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8')
    entries.set(name, { method, compressedSize, uncompressedSize, localOffset })
    offset += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

function readZipEntry(buffer, entry) {
  if (entry.uncompressedSize > 24 * 1024 * 1024) throw new Error('文档内部条目过大，已拒绝解析。')
  const offset = entry.localOffset
  if (offset + 30 > buffer.length || buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new Error('ZIP 条目损坏。')
  }
  const nameLength = buffer.readUInt16LE(offset + 26)
  const extraLength = buffer.readUInt16LE(offset + 28)
  const dataStart = offset + 30 + nameLength + extraLength
  const dataEnd = dataStart + entry.compressedSize
  if (dataEnd > buffer.length) throw new Error('ZIP 条目超出文件范围。')
  const data = buffer.subarray(dataStart, dataEnd)
  if (entry.method === 0) return data
  if (entry.method === 8) return inflateRawSync(data)
  throw new Error('该文档使用了不支持的压缩算法。')
}

function extractDocx(buffer) {
  const entries = readZipEntries(buffer)
  const entry = entries.get('word/document.xml')
  if (entry === undefined) throw new Error('DOCX 中找不到 word/document.xml。')
  const xml = readZipEntry(buffer, entry).toString('utf8')
  const text = xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
  return decodeXml(text).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function extractPptx(buffer) {
  const entries = readZipEntries(buffer)
  const slides = [...entries.keys()]
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => Number(/slide(\d+)/.exec(a)?.[1] ?? 0) - Number(/slide(\d+)/.exec(b)?.[1] ?? 0))
  if (slides.length === 0) throw new Error('PPTX 中找不到幻灯片。')
  const chunks = []
  for (const name of slides) {
    const entry = entries.get(name)
    if (entry === undefined) continue
    const xml = readZipEntry(buffer, entry).toString('utf8')
    const text = xml
      .replace(/<a:br[^>]*\/>/g, '\n')
      .replace(/<\/a:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
    const page = Number(/slide(\d+)/.exec(name)?.[1] ?? chunks.length + 1)
    const content = decodeXml(text).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    if (content !== '') chunks.push(`【第 ${page} 页】\n${content}`)
  }
  return chunks.join('\n\n').trim()
}

function decodePdfString(value) {
  return value.replace(/\\([nrtbf()\\]|[0-7]{1,3}|\r?\n)/g, (_, code) => {
    switch (code) {
      case 'n': return '\n'
      case 'r': return '\r'
      case 't': return '\t'
      case 'b': return '\b'
      case 'f': return '\f'
      case '(': return '('
      case ')': return ')'
      case '\\': return '\\'
      default:
        if (/^[0-7]{1,3}$/.test(code)) return String.fromCharCode(Number.parseInt(code, 8))
        return ''
    }
  })
}

function decodePdfHex(value) {
  let hex = value.replace(/\s+/g, '')
  if (hex.length % 2 === 1) hex += '0'
  const bytes = Buffer.from(hex, 'hex')
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = Buffer.alloc(bytes.length - 2)
    for (let index = 2; index + 1 < bytes.length; index += 2) {
      swapped[index - 2] = bytes[index + 1]
      swapped[index - 1] = bytes[index]
    }
    return swapped.toString('utf16le')
  }
  return bytes.toString('latin1')
}

function pdfContentText(content) {
  const out = []
  const pattern = /\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>|\bT[Jj]\b|\bTd\b|\bTD\b|\bT\*\b|\bET\b/g
  let match
  while ((match = pattern.exec(content)) !== null) {
    const token = match[0]
    if (token.startsWith('(')) out.push(decodePdfString(token.slice(1, -1)))
    else if (token.startsWith('<')) out.push(decodePdfHex(token.slice(1, -1)))
    else if (token === 'Td' || token === 'TD' || token === 'T*' || token === 'ET') out.push('\n')
  }
  return out.join('')
}

function decodeAscii85(input) {
  const bytes = []
  let group = []
  const pushGroup = (length) => {
    let value = 0
    for (let index = 0; index < 5; index += 1) value = value * 85 + (group[index] ?? 84)
    const decoded = [
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    ]
    for (let index = 0; index < length; index += 1) bytes.push(decoded[index])
  }
  for (const char of input) {
    if (char === '~') break
    if (/\s/.test(char)) continue
    if (char === 'z' && group.length === 0) {
      bytes.push(0, 0, 0, 0)
      continue
    }
    const code = char.charCodeAt(0)
    if (code < 33 || code > 117) continue
    group.push(code - 33)
    if (group.length === 5) {
      pushGroup(4)
      group = []
    }
  }
  if (group.length > 0) pushGroup(group.length - 1)
  return Buffer.from(bytes)
}

function extractPdf(buffer) {
  const raw = buffer.toString('latin1')
  const chunks = []
  const streamPattern = /stream\r?\n([\s\S]*?)endstream/g
  let match
  while ((match = streamPattern.exec(raw)) !== null) {
    const dictStart = raw.lastIndexOf('<<', match.index)
    const dict = dictStart === -1 ? '' : raw.slice(dictStart, match.index)
    let data = Buffer.from(match[1].replace(/\r?\n$/, ''), 'latin1')
    try {
      if (/ASCII85Decode/.test(dict)) data = decodeAscii85(data.toString('latin1'))
      if (/FlateDecode/.test(dict)) data = inflateSync(data)
      else if (/LZWDecode|DCTDecode|JPXDecode|CCITTFaxDecode/.test(dict)) continue
    } catch {
      continue
    }
    const text = pdfContentText(data.toString('latin1'))
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    if (text.length > 0) chunks.push(text)
  }
  return chunks.join('\n\n').trim()
}

export function extractFile(name, buffer) {
  const ext = extensionOf(name)
  if (TEXT_EXTENSIONS.has(ext)) {
    let text = decodeText(buffer)
    if (ext === 'html' || ext === 'htm') text = stripHtml(text)
    return {
      ok: true,
      kind: ext,
      text: text.trim().slice(0, 60_000),
      warning: text.trim().length > 60_000 ? '文本过长，已截断到 60,000 字符。' : '',
    }
  }
  if (ext === 'docx') {
    const text = extractDocx(buffer)
    return { ok: true, kind: 'docx', text: text.slice(0, 60_000), warning: text === '' ? 'DOCX 中没有可提取的文字。' : '' }
  }
  if (ext === 'pptx') {
    const text = extractPptx(buffer)
    return { ok: true, kind: 'pptx', text: text.slice(0, 60_000), warning: text === '' ? 'PPTX 中没有可提取的文字。' : '' }
  }
  if (ext === 'pdf') {
    const text = extractPdf(buffer)
    const warning = text.length < 40
      ? 'PDF 文本提取结果很少，可能是扫描件或使用了特殊字体编码；请粘贴正文或先做 OCR。'
      : 'PDF 为基础文本提取，复杂排版、公式或扫描页可能缺失。'
    return { ok: true, kind: 'pdf', text: text.slice(0, 60_000), warning }
  }
  if (ext === 'doc' || ext === 'ppt') {
    throw new Error('旧版 .doc/.ppt 二进制格式暂不支持，请另存为 .docx/.pptx 或粘贴正文。')
  }
  throw new Error(`暂不支持 .${ext || '未知'} 文件；支持 txt/md/csv/json/html/docx/pptx/pdf 及常见代码文件。`)
}
