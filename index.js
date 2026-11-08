/**
 * Host half of the Adaptive CS Tutor.
 *
 * The browser half owns the learning workspace. This half keeps the model
 * credential on the Host and exposes authenticated, plugin-scoped routes:
 *
 *   GET  /plugins/cs-tutor/status  -> which model the tutor will use
 *   POST /plugins/cs-tutor/chat    -> server-sent events from the default model
 *   POST /plugins/cs-tutor/ingest  -> public Bilibili metadata and subtitles
 *   POST /plugins/cs-tutor/extract -> text from a dropped document
 *
 * No session is created and no tool is exposed: the tutor is a focused,
 * single-purpose conversation inside the plugin panel.
 */

import { crawlBilibili, extractFile } from './ingest.js'

const ROUTE_BASE = '/plugins/cs-tutor'
const MAX_BODY_BYTES = 512 * 1024
const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_MESSAGES = 24
const MAX_TOTAL_CHARS = 60_000
const MAX_MESSAGE_CHARS = 12_000

/** The non-negotiable teaching contract, derived from the requested tutor role. */
const TUTOR_PROMPT = [
  '你是“AI 自适应编程学习导师”，一名计算机科学教育专家、编程导师和自适应学习系统。',
  '你的任务不是替学习者总结材料或代写作业，而是把视频、课程资料、作业、教材或知识主题转化为问题驱动的个性化学习流程。',
  '',
  '## 最终目标',
  '让学习者真正理解计算机科学的概念、原理和逻辑，并能在没有 AI 帮助时独立解决问题、编写程序、迁移应用。评价始终以“能否独立完成”为准。',
  '',
  '## 教学原则',
  '1. 问题驱动：先通过问题判断水平，再决定教学内容和深度。',
  '2. 主动学习：让学习者思考、回答、推导、写代码；不要用大段讲解替代他的思考。',
  '3. 循序渐进：根据回答调整难度，每次只推进一个明确步骤。',
  '4. 理解优先：不要只教语法记忆或代码套用，要解释为什么、执行时发生了什么、与已有知识如何联系。',
  '5. 独立实践：最终必须用无提示的独立任务检验掌握程度。',
  '6. 诚实反馈：准确指出知识漏洞；不要为了鼓励而降低标准。',
  '',
  '## 固定流程（按当前阶段执行，但允许根据证据回退）',
  '阶段 1 材料获取与分析：提取核心知识点、定义和原理、例题/作业/代码、依赖关系、易混概念和常见错误，并区分必须掌握与拓展内容。若只有视频链接而没有字幕或转写文本，必须明确说明你无法观看视频，请学习者提供字幕、转写或可访问资料；绝不假装看过视频。',
  '阶段 2 知识地图：按逻辑关系而非视频时间顺序组织；输出学习目标、前置知识及可能缺口、核心知识地图、重点难点（必须掌握/需要理解/容易出错/拓展学习）、原始题目清单。原材料题目不足时才生成练习，并标注“AI 生成题目”。',
  '阶段 3 诊断：先提出 1 道或少量覆盖概念理解、原理推导、代码阅读、实际应用的题，等待回答；不要提前给答案。根据回答判断完全掌握/基本理解/部分理解/完全不理解，并决定下一步。正确答案不等于真正理解，要结合解释和推理过程判断。',
  '阶段 4 自适应教学：针对漏洞，按“问题引入 → 直观理解 → 正式原理 → 代码演示 → 代码追踪 → 即时检验 → 迁移应用”展开。类比只能辅助理解，不能代替严谨定义。异步演示代码要短、完整、可运行，并逐步解释关键部分。答错时先诊断错误原因，不要立即公布完整答案。',
  '阶段 5 编程实践：优先让学习者自己写。按 Level 1 代码理解、Level 2 代码补全、Level 3 独立实现、Level 4 综合应用选择任务。遇到困难时依次给思路提示、局部提示、关键知识解释；只有明确要求完整示例或多轮引导仍无法推进时才给完整参考代码。之后分析逻辑、语法、边界条件和复杂度，区分语法/逻辑/算法/概念/边界错误。使用 C/C++ 时给符合标准的代码并说明语言版本要求。',
  '阶段 6 独立掌握度检验：包含概念解释、原理分析、代码阅读、独立编程、迁移应用；不要提前泄露答案。按理解深度和独立完成程度评 A/B/C/D，不能只看正确率。',
  '阶段 7 学习记录与复习：输出本次知识点、已掌握/未掌握内容、思维误区、编程实践情况；记录错题、错误原因和对应知识点；更新个人知识地图；安排间隔复习，并用新题检验而不是重复原讲解。',
  '',
  '## 交互规则',
  '- 每次回复只推进一个明确的教学步骤，并以一个具体问题结尾，等待学习者回答；不要一次把整个课程讲完。',
  '- 学习者回答后，先评价答案和推理，再决定下一步；正确时不要重复已掌握内容，错误时先诊断原因。',
  '- 鼓励学习者用自己的话解释（费曼学习法）。对于复杂知识，允许多轮讨论和推导。',
  '- 不要为了凑流程增加无意义题目；学习者要求跳过时可跳过，但保留必要的掌握度检验。',
  '- 不替学习者完成作业；不编造材料内容、时间戳、题目来源或运行结果。',
  '',
  '## 输出格式',
  '- 默认使用简体中文；学习者明确要求其他语言时再切换。',
  '- 使用 Markdown。代码块标注语言；公式 Surround 用纯文本或 LaTeX 均可。',
  '- 每次正文控制在 600～900 字（代码和题目清单除外），避免信息过载。',
  '- 不要展示内部推理过程，不要使用“作为 AI”之类的套话。',
  '- 结尾必须是一个清晰、可回答的问题；如果确实不需要提问，说明下一阶段并请学习者确认。',
].join('\n')

/** One concrete instruction per stage, appended to the fixed contract. */
const STAGE_GUIDE = {
  0: '准备阶段：帮助学习者明确材料、目标和当前水平。若信息不足，先问一个最关键的问题，不要开始长篇讲解。',
  1: '材料获取与分析：确认你实际能访问的材料；无法访问时明确说明并索取字幕/转写/正文。然后提取知识点、依赖、难点和原始题目。',
  2: '建立知识地图：按逻辑关系组织，给出学习目标、前置知识、核心地图、重点难点和原始题目清单。题目不足时才生成并标注 AI 生成题目。',
  3: '问题驱动诊断：只提出 1 道或少量诊断题，覆盖概念、推导、代码阅读或应用；等待回答，不要给答案。',
  4: '自适应教学：针对一个具体漏洞，按七步结构展开，但一次只走一小步；用短代码和代码追踪推动学习者预测。',
  5: '编程实践：给出一个难度匹配的编程任务。先只给需求和输入输出，让学习者独立写；不要一上来给完整答案。',
  6: '独立掌握度检验：设计无提示的检验，不要泄露答案；根据解释深度和独立完成程度给出 A/B/C/D。',
  7: '学习总结与复习：总结已掌握/未掌握、思维误区和实践情况，记录错题，更新知识地图，并安排有间隔的复习。',
}

/** Resolve the provider/model the tutor should use, preferring the profile default. */
function resolveSelection(ctx) {
  const defaults = ctx.get('agentDefaultModel')
  if (defaults !== undefined) {
    try {
      const selection = defaults.currentSelection()
      if (selection !== undefined && typeof selection.provider === 'string' && typeof selection.model === 'string') {
        return selection
      }
    } catch {
      // Fall through to the first advertised provider.
    }
  }
  return undefined
}

async function resolveModel(ctx) {
  const llm = ctx.get('llm')
  if (llm === undefined) throw new Error('当前 DSH profile 没有加载 LLM 服务。')
  const preferred = resolveSelection(ctx)
  if (preferred !== undefined) return preferred

  const providers = llm.listProviders()
  for (const provider of providers) {
    const models = await llm.listModels(provider.id)
    if (models.length > 0) return { provider: provider.id, model: models[0].id }
  }
  throw new Error('没有可用的模型提供方，请先在设置中配置模型。')
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

/**
 * Apply the Host's own browser-trust checks to this route. A request that the
 * connection service rejects never reaches the model.
 */
function rejectUntrusted(ctx, req, res) {
  const connection = ctx.get('connection')
  if (connection === undefined || typeof connection.requestRejection !== 'function') return false
  let rejection
  try {
    rejection = connection.requestRejection({ headers: req.headers })
  } catch {
    sendJson(res, 403, { ok: false, error: '请求来源无法验证。' })
    return true
  }
  if (rejection === undefined) return false
  sendJson(res, rejection, { ok: false, error: '请求未通过浏览器认证。' })
  return true
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('请求体过大。')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') throw new Error('请求体为空。')
  let value
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('请求体不是合法 JSON。')
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('请求体格式不正确。')
  return value
}

async function readRawBody(req, limit = MAX_FILE_BYTES) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error(`文件超过 ${Math.round(limit / 1024 / 1024)} MB 限制。`)
    chunks.push(chunk)
  }
  if (size === 0) throw new Error('文件内容为空。')
  return Buffer.concat(chunks)
}

function cleanBrief(input) {
  const source = input !== null && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const read = (key, max) => (typeof source[key] === 'string' ? source[key].trim().slice(0, max) : '')
  return {
    topic: read('topic', 240),
    goal: read('goal', 240),
    level: read('level', 120),
    language: read('language', 80),
  }
}

function normalizeMessages(input) {
  if (!Array.isArray(input)) throw new Error('messages 必须是数组。')
  const messages = []
  let total = 0
  for (const item of input.slice(-MAX_MESSAGES)) {
    if (item === null || typeof item !== 'object') continue
    const role = item.role === 'assistant' ? 'assistant' : item.role === 'user' ? 'user' : undefined
    if (role === undefined) continue
    const content = typeof item.content === 'string' ? item.content.trim() : ''
    if (content === '') continue
    const clipped = content.slice(0, MAX_MESSAGE_CHARS)
    if (total + clipped.length > MAX_TOTAL_CHARS) break
    total += clipped.length
    messages.push({ role, content: clipped })
  }
  while (messages.length > 0 && messages[0].role !== 'user') messages.shift()
  if (messages.length === 0) throw new Error('没有可发送的用户消息。')
  return messages
}

function buildSystemPrompt(stage, brief) {
  const guide = STAGE_GUIDE[stage] ?? STAGE_GUIDE[0]
  const profile = [
    brief.topic === '' ? '' : `学习主题：${brief.topic}`,
    brief.goal === '' ? '' : `学习目标：${brief.goal}`,
    brief.level === '' ? '' : `自评水平：${brief.level}`,
    brief.language === '' ? '' : `编程语言：${brief.language}`,
  ].filter((line) => line !== '')
  return [
    TUTOR_PROMPT,
    '',
    '## 当前教学阶段',
    guide,
    '',
    '## 学习者档案',
    profile.length === 0 ? '学习者尚未填写档案；如需要，先问一个最关键的问题。' : profile.join('\n'),
    '',
    '## 本轮要求',
    '先判断学习者上一条消息处于哪个教学步骤，再只推进下一步。不要重复已经确认掌握的内容；不要一次输出多个阶段。',
    '如果这是对话的第一条回复，先用两三句话说明你准备如何开始，然后提出第一个诊断或确认问题。',
  ].join('\n')
}

function streamChat(ctx, res, stage, brief, messages) {
  const llm = ctx.get('llm')
  if (llm === undefined) {
    sendJson(res, 503, { ok: false, error: '当前 DSH profile 没有加载 LLM 服务。' })
    return
  }

  const abort = new AbortController()
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  })
  const send = (payload) => {
    if (res.writableEnded === false && res.destroyed === false) res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }
  const close = () => abort.abort()
  res.on('close', close)

  void (async () => {
    try {
      const selection = await resolveModel(ctx)
      send({ type: 'start', provider: selection.provider, model: selection.model })
      const requestMessages = messages.map((message, index) =>
        message.role === 'assistant'
          ? {
              role: 'assistant',
              id: `cs-tutor-history-${index}`,
              time: Date.now(),
              source: { kind: 'model', provider: selection.provider, model: selection.model },
              content: [{ type: 'text', text: message.content }],
            }
          : {
              role: 'user',
              content: [{ type: 'text', text: message.content }],
            },
      )
      const stream = llm.stream({
        provider: selection.provider,
        model: selection.model,
        ...(selection.reasoningEffort ? { reasoningEffort: selection.reasoningEffort } : {}),
        system: buildSystemPrompt(stage, brief),
        messages: requestMessages,
        maxTokens: 4096,
        signal: abort.signal,
      })
      for await (const chunk of stream) {
        if (chunk.type === 'text-delta') {
          send({ type: 'delta', text: chunk.text })
        } else if (chunk.type === 'usage') {
          send({ type: 'usage', usage: chunk.usage })
        } else if (chunk.type === 'finish') {
          if (chunk.reason.kind === 'error') {
            send({ type: 'error', message: chunk.reason.failure.message })
          } else if (chunk.reason.kind === 'aborted') {
            send({ type: 'aborted' })
          }
        }
      }
      send({ type: 'done' })
    } catch (error) {
      if (abort.signal.aborted) send({ type: 'aborted' })
      else send({ type: 'error', message: error instanceof Error ? error.message : String(error) })
    } finally {
      res.off('close', close)
      if (res.writableEnded === false && res.destroyed === false) res.end()
    }
  })()
}

export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() => {
    const offStatus = ctx.webServer.register({
      kind: 'exact',
      path: `${ROUTE_BASE}/status`,
      handler: async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { ok: false, error: '只支持 GET。' })
          return
        }
        if (rejectUntrusted(ctx, req, res)) return
        try {
          const selection = await resolveModel(ctx)
          sendJson(res, 200, {
            ok: true,
            ready: true,
            provider: selection.provider,
            model: selection.model,
            reasoningEffort: selection.reasoningEffort ?? null,
          })
        } catch (error) {
          sendJson(res, 200, {
            ok: false,
            ready: false,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      },
    })

    const offChat = ctx.webServer.register({
      kind: 'exact',
      path: `${ROUTE_BASE}/chat`,
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: '只支持 POST。' })
          return
        }
        if (rejectUntrusted(ctx, req, res)) return
        try {
          const body = await readJsonBody(req)
          const stage = Number.isInteger(body.stage) && body.stage >= 0 && body.stage <= 7 ? body.stage : 0
          const brief = cleanBrief(body.brief)
          const messages = normalizeMessages(body.messages)
          streamChat(ctx, res, stage, brief, messages)
        } catch (error) {
          if (res.headersSent === false) {
            sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
          } else if (res.writableEnded === false) {
            res.end()
          }
        }
      },
    })

    const offIngest = ctx.webServer.register({
      kind: 'exact',
      path: `${ROUTE_BASE}/ingest`,
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: '只支持 POST。' })
          return
        }
        if (rejectUntrusted(ctx, req, res)) return
        try {
          const body = await readJsonBody(req)
          if (typeof body.url !== 'string' || body.url.trim() === '') throw new Error('缺少视频链接。')
          const result = await crawlBilibili(body.url)
          sendJson(res, 200, result)
        } catch (error) {
          sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
      },
    })

    const offExtract = ctx.webServer.register({
      kind: 'exact',
      path: `${ROUTE_BASE}/extract`,
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: '只支持 POST。' })
          return
        }
        if (rejectUntrusted(ctx, req, res)) return
        try {
          const rawName = String(req.headers['x-filename'] ?? 'file.txt')
          let name = rawName
          try {
            name = decodeURIComponent(rawName)
          } catch {
            // Keep the raw header when it is not URI-encoded.
          }
          const buffer = await readRawBody(req)
          const result = extractFile(name, buffer)
          sendJson(res, 200, result)
        } catch (error) {
          sendJson(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
      },
    })

    return () => {
      offStatus()
      offChat()
      offIngest()
      offExtract()
    }
  }, 'cs-tutor: host routes')
}
