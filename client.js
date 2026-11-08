window.__ModuleLoader__.load({
  id: '@local/dsh-cs-tutor',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const STORE_KEY = 'dsh.cs-tutor.v1'
    const STATUS_URL = '/plugins/cs-tutor/status'
    const CHAT_URL = '/plugins/cs-tutor/chat'
    const INGEST_URL = '/plugins/cs-tutor/ingest'
    const EXTRACT_URL = '/plugins/cs-tutor/extract'
    const MAX_FILE_BYTES = 12 * 1024 * 1024
    const TEXT_FILE_EXTENSIONS = new Set([
      'txt', 'md', 'markdown', 'csv', 'tsv', 'json',
      'c', 'h', 'hpp', 'cpp', 'cc', 'cxx', 'py', 'java', 'js', 'mjs', 'ts', 'tsx', 'jsx',
      'go', 'rs', 'sql', 'yaml', 'yml', 'toml', 'ini', 'log',
    ])
    const REVIEW_DAYS = [1, 3, 7, 14, 30]

    const zh = {
      nav: '编程导师',
      'app.title': 'AI 自适应编程导师',
      'app.subtitle': '先诊断，再教学。目标是让你离开 AI 也能独立解决问题。',
      'rail.new': '新的学习',
      'rail.projects': '学习单元',
      'rail.stages': '教学阶段',
      'rail.local': '对话与记录只保存在本机浏览器。',
      'stage.0': '准备',
      'stage.1': '材料分析',
      'stage.2': '知识地图',
      'stage.3': '诊断',
      'stage.4': '自适应教学',
      'stage.5': '编程实践',
      'stage.6': '独立检验',
      'stage.7': '总结复习',
      'stageHint.0': '确认材料、目标与当前水平',
      'stageHint.1': '提取知识点、前置关系与易错点',
      'stageHint.2': '按逻辑关系组织知识',
      'stageHint.3': '先出诊断题，等你回答',
      'stageHint.4': '七步讲解，一次只走一小步',
      'stageHint.5': '从代码理解到综合应用',
      'stageHint.6': '无提示检验，评 A/B/C/D',
      'stageHint.7': '错题、知识地图与间隔复习',
      'tab.chat': '导师对话',
      'tab.map': '学习地图',
      'tab.journal': '学习记录',
      'model.loading': '检查模型…',
      'model.ready': '模型就绪',
      'model.offline': '模型未就绪',
      'model.retry': '重试',
      'onboard.eyebrow': 'AI 自适应编程学习导师',
      'onboard.title': '先诊断，再教学。',
      'onboard.desc': '把 B 站课程、课件、作业或一个知识主题交给导师。它会先建立知识地图，用问题判断你的水平，再安排讲解、编程训练和独立检验。',
      'onboard.material': '学习材料',
      'onboard.materialPh': '粘贴 B 站链接、视频字幕、课件正文、作业题目，或教材章节…也可以把文件拖到这里。',
      'onboard.topic': '学习主题（可选）',
      'onboard.topicPh': '例如：C 语言指针与内存模型',
      'onboard.goal': '学习目标',
      'onboard.level': '当前水平',
      'onboard.language': '编程语言',
      'onboard.start': '开始学习',
      'onboard.sample': '填入示例',
      'onboard.privacy': '对话与学习记录只保存在当前浏览器，不写入会话日志。',
      'onboard.how': '导师如何工作',
      'onboard.how1': '提取知识点、前置关系和容易混淆的概念',
      'onboard.how2': '用少量诊断题判断你真正会什么',
      'onboard.how3': '按你的回答调整讲解深度，不套用固定进度',
      'onboard.how4': '最后用无提示任务检验独立完成能力',
      'onboard.videoNote': 'B 站链接会自动抓取公开标题、简介和分P目录；公开字幕抓不到时，导师会请你补充字幕或转写，不会假装看过视频。',
      'onboard.link': 'B 站视频链接',
      'onboard.linkPh': '粘贴 BV 号或视频链接，自动抓取标题、简介和分P目录',
      'onboard.crawl': '抓取视频信息',
      'onboard.crawling': '正在抓取视频信息…',
      'onboard.crawlOk': '已抓取公开字幕，共 {n} 字符。',
      'onboard.crawlNoSub': '已抓取标题、简介和分P目录；没有公开字幕，请补充字幕或转写。',
      'onboard.crawlFailed': '抓取失败：{msg}',
      'onboard.crawlEmpty': '抓取结果没有可用的材料。',
      'onboard.crawlHint': '自动抓取公开标题、简介和分P目录，不下载视频流；公开字幕通常需要登录或 UP 主开启。',
      'onboard.import': '导入文件',
      'onboard.importing': '正在解析文件…',
      'onboard.importingFile': '正在解析 {name}…',
      'onboard.drop': '松开以导入文件',
      'onboard.dropHint': '支持 txt / md / csv / json / html / docx / pptx / pdf，单个文件不超过 12 MB',
      'onboard.importOk': '已导入 {n} 个文件。',
      'onboard.importWarn': '{name}：{msg}',
      'onboard.importFailed': '{name} 导入失败：{msg}',
      'onboard.fileTooBig': '{name} 超过 12 MB，已跳过。',
      'onboard.urlMissing': '请先填写 B 站链接或 BV 号。',
      'onboard.needMaterial': '请至少填写学习材料、B 站链接或学习主题。',
      'onboard.emptyFile': '文件中没有可提取的文本。',
      'onboard.textTruncated': '文本过长，已截断到 60,000 字符。',
      'onboard.extractHint': '文件只在本地 Host 解析，不会上传到第三方。',
      'goal.exam': '通过考试',
      'goal.homework': '完成作业',
      'goal.foundation': '打牢基础',
      'goal.interview': '准备面试',
      'level.zero': '零基础',
      'level.fuzzy': '学过但模糊',
      'level.can': '能写代码',
      'level.advanced': '想进阶',
      'lang.c': 'C',
      'lang.cpp': 'C++',
      'lang.python': 'Python',
      'lang.java': 'Java',
      'lang.other': '其他 / 暂不确定',
      'chat.emptyTitle': '导师已就位',
      'chat.emptyDesc': '从材料分析开始，或直接在下方描述你想解决的问题。',
      'chat.start': '开始材料分析',
      'chat.placeholder': '回答导师的问题，或粘贴你的代码…（Enter 发送，Shift+Enter 换行）',
      'chat.send': '发送',
      'chat.stop': '停止',
      'chat.code': '插入代码块',
      'chat.copy': '复制',
      'chat.copied': '已复制',
      'chat.you': '你',
      'chat.tutor': '导师',
      'chat.thinking': '导师正在思考…',
      'chat.stopped': '已停止生成。你可以修改问题后重新发送。',
      'chat.error': '导师服务返回错误',
      'chat.retry': '重试',
      'quick.analyze': '分析材料',
      'quick.map': '建知识地图',
      'quick.diagnose': '诊断我',
      'quick.teach': '讲解',
      'quick.practice': '编程练习',
      'quick.mastery': '独立检验',
      'quick.summary': '总结复习',
      'map.title': '学习地图',
      'map.brief': '学习简报',
      'map.edit': '编辑简报',
      'map.save': '保存',
      'map.cancel': '取消',
      'map.material': '材料',
      'map.goal': '目标',
      'map.level': '水平',
      'map.language': '语言',
      'map.roadmap': '阶段路线',
      'map.knowledge': '导师产出的知识地图',
      'map.empty': '导师还没有生成知识地图。完成材料分析后，它会出现在这里。',
      'map.generate': '生成知识地图',
      'journal.title': '学习记录',
      'journal.mastery': '掌握等级',
      'journal.masteryHint': '根据独立检验的表现选择；不能只看正确率。',
      'journal.notes': '错题与笔记',
      'journal.emptyNotes': '还没有记录。把暴露出的误区、错题或关键理解记下来。',
      'journal.addNote': '添加记录',
      'journal.notePh': '写下错误原因、对应知识点，或一句自己的解释…',
      'journal.type.concept': '概念',
      'journal.type.error': '错题',
      'journal.type.gain': '掌握',
      'journal.review': '间隔复习',
      'journal.due': '下次复习',
      'journal.noReview': '还没有安排复习。完成学习后，按 1/3/7/14/30 天间隔巩固。',
      'journal.complete': '完成本次复习',
      'journal.export': '导出学习记录',
      'journal.delete': '删除这个学习单元',
      'journal.deleteConfirm': '确定删除这个学习单元及其全部对话和记录吗？',
      'journal.startReview': '开始间隔复习',
      'journal.reviewDone': '已记录本次复习。',
      'journal.reviewInDays': '每 {n} 天',
      'journal.dueToday': '今天该复习',
      'journal.nextOn': '下次：{date}',
      'mastery.A': 'A · 能解释、能独立实现、能迁移',
      'mastery.B': 'B · 理解原理，常规任务可完成',
      'mastery.C': 'C · 基本理解，独立解决问题不足',
      'mastery.D': 'D · 存在重要概念漏洞',
      'project.untitled': '未命名学习',
      'project.due': '待复习',
      'common.copy': '复制',
      'common.copied': '已复制',
      'common.close': '关闭',
      'common.delete': '删除',
      'common.save': '保存',
      'common.edit': '编辑',
      'common.cancel': '取消',
      'common.noteDelete': '删除记录',
      'model.error': '无法连接导师服务',
      'model.noModel': '模型尚未配置，请先在设置中登录或选择模型。',
      'export.done': '学习记录已导出',
    }

    const en = {
      nav: 'CS Tutor',
      'app.title': 'Adaptive CS Tutor',
      'app.subtitle': 'Diagnosis first. The goal is independence without AI help.',
      'rail.new': 'New learning unit',
      'rail.projects': 'Learning units',
      'rail.stages': 'Teaching stages',
      'rail.local': 'Conversations and records stay in this browser.',
      'stage.0': 'Setup',
      'stage.1': 'Material analysis',
      'stage.2': 'Knowledge map',
      'stage.3': 'Diagnosis',
      'stage.4': 'Adaptive lesson',
      'stage.5': 'Coding practice',
      'stage.6': 'Mastery check',
      'stage.7': 'Review & record',
      'stageHint.0': 'Confirm material, goal, and current level',
      'stageHint.1': 'Extract concepts, dependencies, and misconceptions',
      'stageHint.2': 'Organize by logical dependency, not video order',
      'stageHint.3': 'Ask a few diagnostic questions first',
      'stageHint.4': 'Seven-step teaching, one small step at a time',
      'stageHint.5': 'From code reading to independent implementation',
      'stageHint.6': 'Unprompted check graded A/B/C/D',
      'stageHint.7': 'Errors, knowledge map, and spaced review',
      'tab.chat': 'Tutor chat',
      'tab.map': 'Learning map',
      'tab.journal': 'Learning record',
      'model.loading': 'Checking model…',
      'model.ready': 'Model ready',
      'model.offline': 'Model not ready',
      'model.retry': 'Retry',
      'onboard.eyebrow': 'ADAPTIVE PROGRAMMING TUTOR',
      'onboard.title': 'Diagnose first. Teach second.',
      'onboard.desc': 'Bring a Bilibili course, slides, homework, or a topic. The tutor builds a knowledge map, diagnoses your level with questions, then adapts lessons, coding practice, and independent checks.',
      'onboard.material': 'Learning material',
      'onboard.materialPh': 'Paste a Bilibili link, transcript, slide text, homework prompt, or textbook section… You can also drop files here.',
      'onboard.topic': 'Topic (optional)',
      'onboard.topicPh': 'e.g. C pointers and the memory model',
      'onboard.goal': 'Goal',
      'onboard.level': 'Current level',
      'onboard.language': 'Programming language',
      'onboard.start': 'Start learning',
      'onboard.sample': 'Fill sample',
      'onboard.privacy': 'Conversations and records stay in this browser; nothing is written to the session log.',
      'onboard.how': 'How the tutor works',
      'onboard.how1': 'Extracts concepts, prerequisites, and misconceptions',
      'onboard.how2': 'Uses a few diagnostic questions to find what you really know',
      'onboard.how3': 'Adjusts depth to your answers instead of the video timeline',
      'onboard.how4': 'Ends with an unprompted task that tests independence',
      'onboard.videoNote': 'A Bilibili link fetches the public title, description, and part list automatically. If no public subtitles are available the tutor asks for a transcript instead of pretending to have watched the video.',
      'onboard.link': 'Bilibili link',
      'onboard.linkPh': 'Paste a BV id or video URL to fetch the title, description, and part list',
      'onboard.crawl': 'Fetch video info',
      'onboard.crawling': 'Fetching video info…',
      'onboard.crawlOk': 'Fetched public subtitles ({n} characters).',
      'onboard.crawlNoSub': 'Fetched title, description, and part list; no public subtitles. Add a transcript.',
      'onboard.crawlFailed': 'Fetch failed: {msg}',
      'onboard.crawlEmpty': 'The fetch returned no usable material.',
      'onboard.crawlHint': 'Fetches public title, description, and part list; it does not download video. Public subtitles often require login or an uploader-enabled track.',
      'onboard.import': 'Import file',
      'onboard.importing': 'Parsing file…',
      'onboard.importingFile': 'Parsing {name}…',
      'onboard.drop': 'Drop to import files',
      'onboard.dropHint': 'txt / md / csv / json / html / docx / pptx / pdf, up to 12 MB each',
      'onboard.importOk': 'Imported {n} file(s).',
      'onboard.importWarn': '{name}: {msg}',
      'onboard.importFailed': '{name} failed: {msg}',
      'onboard.fileTooBig': '{name} exceeds 12 MB and was skipped.',
      'onboard.urlMissing': 'Enter a Bilibili link or BV id first.',
      'onboard.needMaterial': 'Add material, a Bilibili link, or a topic first.',
      'onboard.emptyFile': 'The file contains no extractable text.',
      'onboard.textTruncated': 'Text was truncated to 60,000 characters.',
      'onboard.extractHint': 'Files are parsed on the local Host and are not uploaded to a third party.',
      'goal.exam': 'Pass an exam',
      'goal.homework': 'Finish homework',
      'goal.foundation': 'Build foundations',
      'goal.interview': 'Prepare for interviews',
      'level.zero': 'Beginner',
      'level.fuzzy': 'Learned but rusty',
      'level.can': 'Can write code',
      'level.advanced': 'Advanced',
      'lang.c': 'C',
      'lang.cpp': 'C++',
      'lang.python': 'Python',
      'lang.java': 'Java',
      'lang.other': 'Other / not sure',
      'chat.emptyTitle': 'Your tutor is ready',
      'chat.emptyDesc': 'Start with material analysis, or describe the problem you want to solve.',
      'chat.start': 'Analyze the material',
      'chat.placeholder': 'Answer the tutor, or paste your code… (Enter to send, Shift+Enter for a newline)',
      'chat.send': 'Send',
      'chat.stop': 'Stop',
      'chat.code': 'Insert code block',
      'chat.copy': 'Copy',
      'chat.copied': 'Copied',
      'chat.you': 'You',
      'chat.tutor': 'Tutor',
      'chat.thinking': 'Tutor is thinking…',
      'chat.stopped': 'Generation stopped. Edit your message and send again.',
      'chat.error': 'Tutor service error',
      'chat.retry': 'Retry',
      'quick.analyze': 'Analyze material',
      'quick.map': 'Build map',
      'quick.diagnose': 'Diagnose me',
      'quick.teach': 'Teach',
      'quick.practice': 'Coding task',
      'quick.mastery': 'Mastery check',
      'quick.summary': 'Wrap up',
      'map.title': 'Learning map',
      'map.brief': 'Learning brief',
      'map.edit': 'Edit brief',
      'map.save': 'Save',
      'map.cancel': 'Cancel',
      'map.material': 'Material',
      'map.goal': 'Goal',
      'map.level': 'Level',
      'map.language': 'Language',
      'map.roadmap': 'Stage roadmap',
      'map.knowledge': 'Knowledge map from the tutor',
      'map.empty': 'No knowledge map yet. It appears here after material analysis.',
      'map.generate': 'Generate knowledge map',
      'journal.title': 'Learning record',
      'journal.mastery': 'Mastery level',
      'journal.masteryHint': 'Choose from independent-check performance; accuracy alone is not enough.',
      'journal.notes': 'Errors and notes',
      'journal.emptyNotes': 'Nothing recorded yet. Capture misconceptions, errors, or a key explanation in your own words.',
      'journal.addNote': 'Add record',
      'journal.notePh': 'Write the error cause, the concept involved, or your own explanation…',
      'journal.type.concept': 'Concept',
      'journal.type.error': 'Error',
      'journal.type.gain': 'Mastered',
      'journal.review': 'Spaced review',
      'journal.due': 'Next review',
      'journal.noReview': 'No review scheduled. After a unit, review at 1/3/7/14/30-day intervals.',
      'journal.complete': 'Complete this review',
      'journal.export': 'Export learning record',
      'journal.delete': 'Delete this learning unit',
      'journal.deleteConfirm': 'Delete this learning unit, its conversation, and all records?',
      'journal.startReview': 'Start spaced review',
      'journal.reviewDone': 'Review recorded.',
      'journal.reviewInDays': 'Every {n} days',
      'journal.dueToday': 'Due today',
      'journal.nextOn': 'Next: {date}',
      'mastery.A': 'A · Explains, implements independently, transfers',
      'mastery.B': 'B · Understands principles and routine tasks',
      'mastery.C': 'C · Basic understanding, weak independent solving',
      'mastery.D': 'D · Important conceptual gaps remain',
      'project.untitled': 'Untitled unit',
      'project.due': 'Due',
      'common.copy': 'Copy',
      'common.copied': 'Copied',
      'common.close': 'Close',
      'common.delete': 'Delete',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.cancel': 'Cancel',
      'common.noteDelete': 'Delete record',
      'model.error': 'Cannot reach the tutor service',
      'model.noModel': 'No model is configured. Sign in or choose a model in Settings first.',
      'export.done': 'Learning record exported',
    }

    const STAGES = [
      { n: 0, title: 'stage.0', hint: 'stageHint.0' },
      { n: 1, title: 'stage.1', hint: 'stageHint.1' },
      { n: 2, title: 'stage.2', hint: 'stageHint.2' },
      { n: 3, title: 'stage.3', hint: 'stageHint.3' },
      { n: 4, title: 'stage.4', hint: 'stageHint.4' },
      { n: 5, title: 'stage.5', hint: 'stageHint.5' },
      { n: 6, title: 'stage.6', hint: 'stageHint.6' },
      { n: 7, title: 'stage.7', hint: 'stageHint.7' },
    ]

    function uid(prefix) {
      return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    }

    function normalizeProject(value) {
      const project = value !== null && typeof value === 'object' ? value : {}
      const brief = project.brief !== null && typeof project.brief === 'object' ? project.brief : {}
      const read = (key) => (typeof brief[key] === 'string' ? brief[key] : '')
      const messages = Array.isArray(project.messages)
        ? project.messages
            .filter((message) => message !== null && typeof message === 'object' && typeof message.role === 'string')
            .map((message) => ({
              id: typeof message.id === 'string' ? message.id : uid('m'),
              role: message.role === 'user' ? 'user' : 'assistant',
              content: typeof message.content === 'string' ? message.content : '',
              time: typeof message.time === 'number' ? message.time : Date.now(),
              streaming: message.streaming === true,
              error: typeof message.error === 'string' && message.error !== '' ? message.error : undefined,
              stopped: message.stopped === true,
            }))
        : []
      const notes = Array.isArray(project.notes)
        ? project.notes
            .filter((note) => note !== null && typeof note === 'object' && typeof note.text === 'string')
            .map((note) => ({
              id: typeof note.id === 'string' ? note.id : uid('note'),
              type: note.type === 'error' || note.type === 'gain' || note.type === 'concept' ? note.type : 'concept',
              text: note.text,
              time: typeof note.time === 'number' ? note.time : Date.now(),
            }))
        : []
      const review = project.review !== null && typeof project.review === 'object' ? project.review : {}
      return {
        id: String(project.id),
        title: typeof project.title === 'string' && project.title.trim() !== '' ? project.title : '未命名学习',
        createdAt: typeof project.createdAt === 'number' ? project.createdAt : Date.now(),
        updatedAt: typeof project.updatedAt === 'number' ? project.updatedAt : Date.now(),
        brief: {
          material: read('material'),
          topic: read('topic'),
          goal: read('goal'),
          level: read('level'),
          language: read('language'),
        },
        stage: Number.isInteger(project.stage) && project.stage >= 0 && project.stage <= 7 ? project.stage : 0,
        messages,
        notes,
        mapText: typeof project.mapText === 'string' ? project.mapText : '',
        mastery: project.mastery === 'A' || project.mastery === 'B' || project.mastery === 'C' || project.mastery === 'D' ? project.mastery : null,
        review: {
          step: Number.isInteger(review.step) && review.step >= 0 ? review.step : 0,
          dueAt: typeof review.dueAt === 'number' ? review.dueAt : null,
          lastAt: typeof review.lastAt === 'number' ? review.lastAt : null,
        },
      }
    }

    function loadStore() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY)
        if (raw === null) return { version: 1, projects: [], activeId: null }
        const parsed = JSON.parse(raw)
        if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.projects)) {
          return { version: 1, projects: [], activeId: null }
        }
        return {
          version: 1,
          projects: parsed.projects
            .filter((project) => project !== null && typeof project === 'object' && typeof project.id === 'string')
            .map(normalizeProject),
          activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
        }
      } catch {
        return { version: 1, projects: [], activeId: null }
      }
    }

    function saveStore(store) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
      } catch {
        // A full quota or a disabled storage API must not break the tutor.
      }
    }

    function truncate(text, max) {
      const value = String(text ?? '')
      return value.length > max ? `${value.slice(0, max)}…` : value
    }

    function fill(text, vars) {
      let value = String(text ?? '')
      for (const [key, replacement] of Object.entries(vars)) {
        value = value.split(`{${key}}`).join(String(replacement))
      }
      return value
    }

    function extensionOf(name) {
      const match = /\.([a-z0-9]+)$/i.exec(String(name ?? ''))
      return match === null ? '' : match[1].toLowerCase()
    }

    function isTextFile(name) {
      return TEXT_FILE_EXTENSIONS.has(extensionOf(name))
    }

    function deriveTitle(material, topic, fallback) {
      if (topic.trim() !== '') return truncate(topic.trim(), 48)
      const first = material.trim().split(/\r?\n/).find((line) => line.trim() !== '')
      if (first === undefined) return fallback
      const trimmed = first.trim()
      try {
        const url = new URL(trimmed)
        if (url.hostname.includes('bilibili.com')) return 'B 站课程'
        return truncate(`${url.hostname}${url.pathname === '/' ? '' : url.pathname}`, 48)
      } catch {
        return truncate(trimmed, 48)
      }
    }

    function createProject(form, t) {
      const now = Date.now()
      return {
        id: uid('unit'),
        title: deriveTitle(form.material, form.topic, t('project.untitled')),
        createdAt: now,
        updatedAt: now,
        brief: {
          material: form.material.trim(),
          topic: form.topic.trim(),
          goal: form.goal,
          level: form.level,
          language: form.language,
        },
        stage: 0,
        messages: [],
        notes: [],
        mapText: '',
        mastery: null,
        review: { step: 0, dueAt: null, lastAt: null },
      }
    }

    function analysisPrompt(project, t) {
      const brief = project.brief
      const lines = ['【本单元学习简报】']
      if (brief.topic !== '') lines.push(`学习主题：${brief.topic}`)
      if (brief.goal !== '') lines.push(`学习目标：${brief.goal}`)
      if (brief.level !== '') lines.push(`当前水平：${brief.level}`)
      if (brief.language !== '') lines.push(`编程语言：${brief.language}`)
      if (brief.material !== '') lines.push('', '材料如下：', brief.material)
      lines.push(
        '',
        '请开始第一阶段：材料获取与分析。',
        '先确认你实际能访问哪些材料。如果只有视频链接、没有字幕或转写，请明确说明无法观看，并要求我提供字幕、转写或可访问的正文；不要假装已经看过视频。',
        '然后提取核心知识点、前置知识、依赖关系、易混概念和原始题目，并区分必须掌握与拓展内容。',
      )
      return lines.join('\n')
    }

    function quickPrompt(action, project, t) {
      switch (action) {
        case 'analyze':
          return analysisPrompt(project, t)
        case 'map':
          return '请进入第二阶段：建立知识地图。基于目前已经确认的材料和信息，输出：1. 本节学习目标；2. 前置知识及可能缺口；3. 按逻辑关系组织的核心知识地图；4. 重点与难点（必须掌握/需要理解/容易出错/拓展学习）；5. 原始题目清单（不足时才标注 AI 生成题目）。不要直接开始讲解。'
        case 'diagnose':
          return '请进入第三阶段：问题驱动诊断。先只给我 1 道诊断题，覆盖概念理解、原理推导、代码阅读或实际应用中的一个方面。不要给答案，等我回答后再评价并决定下一步。'
        case 'teach':
          return '请进入第四阶段：自适应教学。根据我目前暴露出的最薄弱点，选择一个具体知识点，按“问题引入 → 直观理解 → 正式原理 → 代码演示 → 代码追踪 → 即时检验 → 迁移应用”展开。一次只推进一小步，先不要一次讲完。'
        case 'practice':
          return '请进入第五阶段：编程实践。先根据我的水平判断适合 Level 1～4 中的哪一级，然后给出一个难度匹配的任务。先只给需求和输入输出要求，让我独立编写；不要一上来给完整答案。'
        case 'mastery':
          return '请进入第六阶段：独立掌握度检验。设计一组无提示检验，包含概念解释、原理分析、代码阅读、独立编程和迁移应用。不要提前泄露答案；等我完成后，再根据理解深度和独立完成程度给出 A/B/C/D。'
        case 'summary':
          return '请进入第七阶段：学习总结与复习。输出：1. 本次学习的知识点；2. 已掌握和尚未掌握的内容；3. 暴露出的思维误区；4. 编程实践完成情况；5. 错题与漏洞记录；6. 更新后的个人知识地图；7. 下一步学习计划和间隔复习安排。不要机械按原视频进度推进。'
        default:
          return ''
      }
    }

    /** Serve one SSE response, invoking `onEvent` for each decoded JSON frame. */
    async function consumeSSE(response, onEvent) {
      if (response.body === null) throw new Error('响应没有可读取的正文。')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let boundary = buffer.indexOf('\n\n')
        while (boundary >= 0) {
          const frame = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          for (const line of frame.split('\n')) {
            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (payload === '') continue
            try {
              onEvent(JSON.parse(payload))
            } catch {
              // Ignore malformed frames; a broken frame must not kill the stream.
            }
          }
          boundary = buffer.indexOf('\n\n')
        }
      }
    }

    function copyText(text, onDone) {
      const finish = () => {
        if (typeof onDone === 'function') onDone()
      }
      if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(finish, finish)
        return
      }
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        area.remove()
      } catch {
        // Copy is a convenience; failure leaves the text selectable.
      }
      finish()
    }

    function formatDate(value, locale) {
      try {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(value))
      } catch {
        return new Date(value).toLocaleDateString()
      }
    }

    function timeLabel(value, locale) {
      try {
        return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
      } catch {
        return ''
      }
    }

    function reviewDue(project) {
      return typeof project.review?.dueAt === 'number' && project.review.dueAt <= Date.now()
    }

    function sanitizeFilename(name) {
      return name.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 60) || 'learning-record'
    }

    function exportMarkdown(project, t, locale) {
      const lines = [
        `# ${project.title}`,
        '',
        `- ${t('map.goal')}: ${project.brief.goal || '—'}`,
        `- ${t('map.level')}: ${project.brief.level || '—'}`,
        `- ${t('map.language')}: ${project.brief.language || '—'}`,
        `- ${t('journal.mastery')}: ${project.mastery || '—'}`,
        '',
        `## ${t('map.material')}`,
        '',
        project.brief.material || '—',
        '',
        `## ${t('tab.chat')}`,
        '',
      ]
      for (const message of project.messages) {
        if (typeof message.content !== 'string' || message.content.trim() === '') continue
        lines.push(`### ${message.role === 'user' ? t('chat.you') : t('chat.tutor')}`, '', message.content, '')
      }
      lines.push(`## ${t('journal.notes')}`, '')
      if (project.notes.length === 0) lines.push('—')
      for (const note of project.notes) {
        lines.push(`- [${note.type}] ${note.text}`)
      }
      lines.push('', `_${formatDate(Date.now(), locale)}_`)
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${sanitizeFilename(project.title)}.md`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    }

    const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g

    function renderInline(text, prefix) {
      const nodes = []
      let lastIndex = 0
      let match
      let index = 0
      INLINE_PATTERN.lastIndex = 0
      while ((match = INLINE_PATTERN.exec(text)) !== null) {
        if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
        const token = match[0]
        const key = `${prefix}-i${index++}`
        if (token.startsWith('**') && token.endsWith('**')) {
          nodes.push(h('strong', { key }, token.slice(2, -2)))
        } else if (token.startsWith('`') && token.endsWith('`')) {
          nodes.push(h('code', { key, className: 'ct-inlineCode' }, token.slice(1, -1)))
        } else if (token.startsWith('[')) {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          if (link !== null && /^(https?:|#)/.test(link[2])) {
            nodes.push(h('a', { key, href: link[2], target: '_blank', rel: 'noreferrer noopener' }, link[1]))
          } else {
            nodes.push(token)
          }
        } else {
          nodes.push(h('em', { key }, token.slice(1, -1)))
        }
        lastIndex = match.index + token.length
      }
      if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
      return nodes
    }

    function splitTableRow(row) {
      let value = row.trim()
      if (value.startsWith('|')) value = value.slice(1)
      if (value.endsWith('|')) value = value.slice(0, -1)
      return value.split('|').map((cell) => cell.trim())
    }

    function isTableSeparator(line) {
      return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line)
    }

    function CodeBlock(props) {
      const [copied, setCopied] = React.useState(false)
      const tr = typeof props.t === 'function' ? props.t : (key) => key
      const copy = () => {
        copyText(props.text, () => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }
      return h(
        'div',
        { className: 'ct-code' },
        h(
          'div',
          { className: 'ct-codeHead' },
          h('span', { className: 'ct-codeLang' }, props.lang || 'code'),
          h(
            'button',
            { type: 'button', className: 'ct-iconBtn ct-codeCopy', onClick: copy, 'aria-label': tr('common.copy') },
            h(Icon, { name: copied ? 'check' : 'copy', size: 13 }),
            h('span', null, copied ? tr('common.copied') : tr('common.copy')),
          ),
        ),
        h('pre', { className: 'ct-codePre' }, h('code', null, props.text)),
      )
    }

    function renderMarkdown(source, t) {
      const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n')
      const nodes = []
      let i = 0
      let key = 0
      while (i < lines.length) {
        const line = lines[i]
        if (line.trim() === '') {
          i += 1
          continue
        }

        const fence = /^\s*```([\w+#.-]*)\s*$/.exec(line)
        if (fence !== null) {
          const lang = fence[1]
          i += 1
          const body = []
          while (i < lines.length && /^\s*```\s*$/.test(lines[i]) === false) {
            body.push(lines[i])
            i += 1
          }
          i += 1
          nodes.push(h(CodeBlock, { key: `code-${key++}`, lang, text: body.join('\n'), t }))
          continue
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(line)
        if (heading !== null) {
          const level = Math.min(heading[1].length + 2, 6)
          nodes.push(h(`h${level}`, { key: `h-${key++}` }, renderInline(heading[2], `h-${key}`)))
          i += 1
          continue
        }

        if (/^\s*>\s?/.test(line)) {
          const quote = []
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
            quote.push(lines[i].replace(/^\s*>\s?/, ''))
            i += 1
          }
          nodes.push(h('blockquote', { key: `q-${key++}` }, renderMarkdown(quote.join('\n'), t)))
          continue
        }

        if (/^\s*[-*+]\s+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
            i += 1
          }
          nodes.push(
            h(
              'ul',
              { key: `ul-${key++}` },
              items.map((item, index) => h('li', { key: `li-${index}` }, renderInline(item, `li-${key}-${index}`))),
            ),
          )
          continue
        }

        if (/^\s*\d+[.)]\s+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
            i += 1
          }
          nodes.push(
            h(
              'ol',
              { key: `ol-${key++}` },
              items.map((item, index) => h('li', { key: `li-${index}` }, renderInline(item, `li-${key}-${index}`))),
            ),
          )
          continue
        }

        if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
          const header = splitTableRow(line)
          i += 2
          const rows = []
          while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
            rows.push(splitTableRow(lines[i]))
            i += 1
          }
          nodes.push(
            h(
              'div',
              { key: `table-${key++}`, className: 'ct-tableWrap' },
              h(
                'table',
                null,
                h('thead', null, h('tr', null, header.map((cell, index) => h('th', { key: `th-${index}` }, renderInline(cell, `th-${index}`))))),
                h(
                  'tbody',
                  null,
                  rows.map((row, rowIndex) =>
                    h(
                      'tr',
                      { key: `tr-${rowIndex}` },
                      row.map((cell, cellIndex) => h('td', { key: `td-${cellIndex}` }, renderInline(cell, `td-${rowIndex}-${cellIndex}`))),
                    ),
                  ),
                ),
              ),
            ),
          )
          continue
        }

        const paragraph = []
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          /^\s*```/.test(lines[i]) === false &&
          /^(#{1,6})\s+/.test(lines[i]) === false &&
          /^\s*>\s?/.test(lines[i]) === false &&
          /^\s*[-*+]\s+/.test(lines[i]) === false &&
          /^\s*\d+[.)]\s+/.test(lines[i]) === false &&
          !(lines[i].includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
        ) {
          paragraph.push(lines[i])
          i += 1
        }
        if (paragraph.length === 0) {
          i += 1
          continue
        }
        nodes.push(h('p', { key: `p-${key++}` }, renderInline(paragraph.join('\n'), `p-${key}`)))
      }
      return nodes
    }

    function iconChildren(name) {
      switch (name) {
        case 'plus':
          return [h('path', { key: 'a', d: 'M8 3v10M3 8h10' })]
        case 'send':
          return [h('path', { key: 'a', d: 'M14 2 7.5 8.5M14 2l-4 12-3.2-5.2L2 6l12-4Z' })]
        case 'stop':
          return [h('rect', { key: 'a', x: '5', y: '5', width: '6', height: '6', rx: '1' })]
        case 'copy':
          return [
            h('rect', { key: 'a', x: '5.5', y: '5.5', width: '8', height: '8', rx: '1.5' }),
            h('path', { key: 'b', d: 'M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2' }),
          ]
        case 'check':
          return [h('path', { key: 'a', d: 'm3 8.5 3 3 7-7' })]
        case 'trash':
          return [
            h('path', { key: 'a', d: 'M3 5h10M6.5 5V3.5h3V5M5 5l.7 8.5h4.6L11 5' }),
            h('path', { key: 'b', d: 'M7 7.5v4M9 7.5v4' }),
          ]
        case 'download':
          return [h('path', { key: 'a', d: 'M8 2v8M5 7.5 8 10.5l3-3M3 14h10' })]
        case 'refresh':
          return [h('path', { key: 'a', d: 'M13 8a5 5 0 1 1-1.7-3.75M13 2v4h-4' })]
        case 'code':
          return [h('path', { key: 'a', d: 'M6 5 2 8l4 3M10 5l4 3-4 3' })]
        case 'warning':
          return [
            h('path', { key: 'a', d: 'M8 2.5 14.5 13h-13L8 2.5Z' }),
            h('path', { key: 'b', d: 'M8 6v3.5M8 11.5v.5' }),
          ]
        case 'calendar':
          return [
            h('rect', { key: 'a', x: '2.5', y: '4', width: '11', height: '9.5', rx: '1.5' }),
            h('path', { key: 'b', d: 'M5 2.5V5M11 2.5V5M2.5 7h11' }),
          ]
        case 'close':
          return [h('path', { key: 'a', d: 'M4 4l8 8M12 4l-8 8' })]
        case 'edit':
          return [h('path', { key: 'a', d: 'm3 13 .8-3.2L11 2.6l2.4 2.4-7.2 7.2L3 13Z' })]
        case 'book':
          return [
            h('path', { key: 'a', d: 'M2.5 3.5h3.7A2.8 2.8 0 0 1 9 6.3v7.2a2.4 2.4 0 0 0-2.3-1.8H2.5v-8.2Z' }),
            h('path', { key: 'b', d: 'M13.5 3.5H9.8A2.8 2.8 0 0 0 7 6.3v7.2a2.4 2.4 0 0 1 2.3-1.8h4.2V3.5Z' }),
          ]
        case 'spark':
          return [h('path', { key: 'a', d: 'm11.5 2 .8 2.2L14.5 5l-2.2.8-.8 2.2-.8-2.2L8.5 5l2.2-.8L11.5 2Z' })]
        case 'user':
          return [
            h('circle', { key: 'a', cx: '8', cy: '5.5', r: '2.5' }),
            h('path', { key: 'b', d: 'M3 14c.4-2.4 2.4-3.8 5-3.8s4.6 1.4 5 3.8' }),
          ]
        case 'bot':
          return [
            h('rect', { key: 'a', x: '3', y: '4.5', width: '10', height: '8', rx: '2' }),
            h('path', { key: 'b', d: 'M8 2v2.5M6 8h.01M10 8h.01M6 10.5h4' }),
          ]
        case 'arrow':
          return [h('path', { key: 'a', d: 'M3 8h10M9 4l4 4-4 4' })]
        default:
          return [h('circle', { key: 'a', cx: '8', cy: '8', r: '5' })]
      }
    }

    function Icon(props) {
      return h(
        'svg',
        {
          width: props.size ?? 16,
          height: props.size ?? 16,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: props.strokeWidth ?? 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          style: { display: 'block', flex: '0 0 auto' },
        },
        iconChildren(props.name),
      )
    }

    function useLocaleRevision(ctx) {
      return React.useSyncExternalStore(
        (callback) => ctx.locale.subscribe(callback),
        () => ctx.locale.getSnapshot().revision,
        () => 0,
      )
    }

    function useModelStatus() {
      const [status, setStatus] = React.useState({ loading: true, ready: false, error: '' })
      const refresh = React.useCallback(() => {
        let cancelled = false
        setStatus({ loading: true, ready: false, error: '' })
        fetch(STATUS_URL, { headers: { accept: 'application/json' }, credentials: 'same-origin' })
          .then(async (response) => {
            const body = await response.json().catch(() => ({}))
            if (cancelled) return
            if (!response.ok) {
              setStatus({ loading: false, ready: false, error: body.error || `HTTP ${response.status}` })
              return
            }
            setStatus({
              loading: false,
              ready: body.ready === true,
              provider: body.provider,
              model: body.model,
              error: body.ready === true ? '' : body.error || '',
            })
          })
          .catch((error) => {
            if (!cancelled) setStatus({ loading: false, ready: false, error: error instanceof Error ? error.message : String(error) })
          })
        return () => {
          cancelled = true
        }
      }, [])
      React.useEffect(() => refresh(), [refresh])
      return [status, refresh]
    }

    function usePersistentStore() {
      const [store, setStore] = React.useState(loadStore)
      const storeRef = React.useRef(store)
      storeRef.current = store
      React.useEffect(() => {
        const timer = window.setTimeout(() => saveStore(store), 250)
        return () => window.clearTimeout(timer)
      }, [store])
      React.useEffect(() => () => saveStore(storeRef.current), [])
      return [store, setStore]
    }

    function SidebarGlyph(props) {
      const size = props.size ?? 18
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 64 64',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 3.2,
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', { d: 'M13 13.5h15.5c4.4 0 7.5 3.2 7.5 7.6V51c0-4.4-3.1-7.5-7.5-7.5H13V13.5Z' }),
        h('path', { d: 'M51 13.5H35.5c-4.4 0-7.5 3.2-7.5 7.6V51c0-4.4 3.1-7.5 7.5-7.5H51V13.5Z' }),
        h('path', { d: 'm47.2 20.2 1.9 4.2 4.2 1.9-4.2 1.9-1.9 4.2-1.9-4.2-4.2-1.9 4.2-1.9 1.9-4.2Z', fill: 'currentColor', stroke: 'none', opacity: '.9' }),
      )
    }

    function SidebarIcon(props) {
      return h(
        'span',
        {
          className: 'ct-sidebarIcon',
          'data-active': props.active === true ? '' : undefined,
          title: 'AI CS Tutor',
        },
        h(SidebarGlyph, { size: Math.max(16, Math.round((props.size ?? 18) * 0.95)) }),
      )
    }

    function EmptyChat(props) {
      return h(
        'div',
        { className: 'ct-emptyChat' },
        h('div', { className: 'ct-emptyIcon' }, h(Icon, { name: 'book', size: 26 })),
        h('h2', null, props.t('chat.emptyTitle')),
        h('p', null, props.t('chat.emptyDesc')),
        h(
          'button',
          { type: 'button', className: 'ct-primary', onClick: props.onStart },
          h(Icon, { name: 'spark', size: 15 }),
          props.t('chat.start'),
        ),
      )
    }

    function Onboarding(props) {
      const { t } = props
      const [form, setForm] = React.useState({
        material: '',
        topic: '',
        goal: t('goal.foundation'),
        level: t('level.fuzzy'),
        language: t('lang.c'),
      })
      const [link, setLink] = React.useState('')
      const [problem, setProblem] = React.useState('')
      const [notice, setNotice] = React.useState(null)
      const [busyKind, setBusyKind] = React.useState(null)
      const [dragActive, setDragActive] = React.useState(false)
      const fileInputRef = React.useRef(null)
      const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

      const crawlLink = async (raw) => {
        const value = String(raw ?? '').trim()
        if (value === '') {
          setNotice({ kind: 'error', text: t('onboard.urlMissing') })
          return null
        }
        setBusyKind('crawl')
        setNotice({ kind: 'info', text: t('onboard.crawling') })
        try {
          const response = await fetch(INGEST_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ url: value }),
          })
          const body = await response.json().catch(() => ({}))
          if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`)
          if (typeof body.material !== 'string' || body.material.trim() === '') throw new Error(t('onboard.crawlEmpty'))
          setForm((current) => ({
            ...current,
            material: body.material,
            topic: current.topic.trim() === '' ? body.title || '' : current.topic,
          }))
          setNotice({
            kind: body.hasSubtitle === true ? 'success' : 'warn',
            text: body.hasSubtitle === true
              ? fill(t('onboard.crawlOk'), { n: body.subtitleChars ?? 0 })
              : t('onboard.crawlNoSub'),
          })
          setProblem('')
          return body
        } catch (error) {
          setNotice({
            kind: 'error',
            text: fill(t('onboard.crawlFailed'), { msg: error instanceof Error ? error.message : String(error) }),
          })
          return null
        } finally {
          setBusyKind(null)
        }
      }

      const importFiles = async (fileList) => {
        const files = Array.from(fileList ?? []).filter((file) => file instanceof File)
        if (files.length === 0) return
        setBusyKind('file')
        const appended = []
        const warnings = []
        for (const file of files) {
          if (file.size > MAX_FILE_BYTES) {
            warnings.push(fill(t('onboard.fileTooBig'), { name: file.name }))
            continue
          }
          setNotice({ kind: 'info', text: fill(t('onboard.importingFile'), { name: file.name }) })
          try {
            let text = ''
            let warning = ''
            if (isTextFile(file.name)) {
              const rawText = await file.text()
              text = rawText
              if (rawText.length > 60000) {
                text = rawText.slice(0, 60000)
                warning = t('onboard.textTruncated')
              }
            } else {
              const response = await fetch(EXTRACT_URL, {
                method: 'POST',
                headers: {
                  'content-type': 'application/octet-stream',
                  'x-filename': encodeURIComponent(file.name),
                },
                credentials: 'same-origin',
                body: file,
              })
              const body = await response.json().catch(() => ({}))
              if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`)
              text = body.text
              warning = body.warning
            }
            text = String(text ?? '').trim()
            if (text === '') throw new Error(t('onboard.emptyFile'))
            appended.push(`--- 文件：${file.name} ---\n${text}`)
            if (warning) warnings.push(fill(t('onboard.importWarn'), { name: file.name, msg: warning }))
          } catch (error) {
            warnings.push(fill(t('onboard.importFailed'), { name: file.name, msg: error instanceof Error ? error.message : String(error) }))
          }
        }
        if (appended.length > 0) {
          setForm((current) => ({
            ...current,
            material: [current.material.trim(), ...appended].filter((part) => part !== '').join('\n\n'),
          }))
          setNotice({
            kind: warnings.length > 0 ? 'warn' : 'success',
            text: warnings.length > 0 ? warnings.join(' ') : fill(t('onboard.importOk'), { n: appended.length }),
          })
        } else if (warnings.length > 0) {
          setNotice({ kind: 'error', text: warnings.join(' ') })
        }
        setBusyKind(null)
      }

      const submit = async (event) => {
        event.preventDefault()
        if (busyKind !== null) return
        let material = form.material.trim()
        const linkOnly = /^(https?:\/\/)?(www\.)?(bilibili\.com|b23\.tv)\S*$/i.test(material) || /^BV[0-9A-Za-z]{10}$/i.test(material) || /^av\d+$/i.test(material)
        if (material === '' || linkOnly) {
          const candidate = link.trim() || material
          if (candidate !== '') {
            const result = await crawlLink(candidate)
            if (result !== null) material = result.material
          }
        }
        if (material === '' && form.topic.trim() === '') {
          setProblem(t('onboard.needMaterial'))
          return
        }
        setProblem('')
        props.onCreate({ ...form, material: material.slice(0, 60000) })
      }

      const pickFiles = () => {
        if (busyKind === null) fileInputRef.current?.click()
      }

      const onDrop = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDragActive(false)
        if (event.dataTransfer?.files) void importFiles(event.dataTransfer.files)
      }

      const onDragOver = (event) => {
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
        setDragActive(true)
      }

      const onDragLeave = (event) => {
        event.preventDefault()
        const target = event.relatedTarget
        if (target instanceof Node && event.currentTarget.contains(target)) return
        setDragActive(false)
      }

      const fillSample = () => {
        setForm({
          material: '【示例课程资料】C 语言程序设计，第 6 讲：指针\n\n1. 变量在内存中有地址；& 取地址，* 解引用。\n2. 指针变量保存地址，本身也占内存。\n3. 指针与数组：数组名在多数表达式中退化为首元素地址。\n4. 常见错误：未初始化指针、越界访问、返回局部变量地址。\n5. 练习：写一个函数，用指针交换两个整数。',
          topic: 'C 语言指针与内存模型',
          goal: t('goal.exam'),
          level: t('level.fuzzy'),
          language: t('lang.c'),
        })
        setLink('')
        setProblem('')
        setNotice(null)
      }

      return h(
        'div',
        {
          className: 'ct-onboard',
          onDragEnter: onDragOver,
          onDragOver,
          onDragLeave,
          onDrop,
        },
        h(
          'div',
          { className: 'ct-onboardIntro' },
          h('span', { className: 'ct-eyebrow' }, h(Icon, { name: 'spark', size: 14 }), t('onboard.eyebrow')),
          h('h1', null, t('onboard.title')),
          h('p', { className: 'ct-onboardDesc' }, t('onboard.desc')),
          h(
            'div',
            { className: 'ct-how' },
            h('h2', null, t('onboard.how')),
            h('ol', null, [t('onboard.how1'), t('onboard.how2'), t('onboard.how3'), t('onboard.how4')].map((line, index) => h('li', { key: index }, line))),
          ),
          h('p', { className: 'ct-videoNote' }, h(Icon, { name: 'warning', size: 14 }), h('span', null, t('onboard.videoNote'))),
        ),
        h(
          'form',
          {
            className: 'ct-form',
            onSubmit: submit,
          },
          dragActive
            ? h(
                'div',
                { className: 'ct-dropOverlay', 'aria-hidden': 'true' },
                h(Icon, { name: 'download', size: 26 }),
                h('strong', null, t('onboard.drop')),
                h('span', null, t('onboard.dropHint')),
              )
            : null,
          h(
            'div',
            { className: 'ct-formHead' },
            h('div', null, h('h2', null, t('onboard.material')), h('p', null, t('onboard.privacy'))),
            h('button', { type: 'button', className: 'ct-ghost ct-small', onClick: fillSample }, t('onboard.sample')),
          ),
          h(
            'div',
            { className: 'ct-field' },
            h('label', { htmlFor: 'ct-link' }, t('onboard.link')),
            h(
              'div',
              { className: 'ct-linkRow' },
              h('input', {
                id: 'ct-link',
                type: 'text',
                value: link,
                placeholder: t('onboard.linkPh'),
                onChange: (event) => setLink(event.target.value),
              }),
              h(
                'button',
                {
                  type: 'button',
                  className: 'ct-ghost ct-small',
                  disabled: busyKind !== null,
                  onClick: () => void crawlLink(link.trim() || form.material),
                },
                h(Icon, { name: 'refresh', size: 13 }),
                busyKind === 'crawl' ? t('onboard.crawling') : t('onboard.crawl'),
              ),
            ),
            h('p', { className: 'ct-formHint' }, t('onboard.crawlHint')),
          ),
          h(
            'div',
            { className: 'ct-field' },
            h(
              'div',
              { className: 'ct-fieldHead' },
              h('label', { htmlFor: 'ct-material' }, t('onboard.material')),
              h(
                'button',
                { type: 'button', className: 'ct-ghost ct-small', disabled: busyKind !== null, onClick: pickFiles },
                h(Icon, { name: 'plus', size: 13 }),
                busyKind === 'file' ? t('onboard.importing') : t('onboard.import'),
              ),
            ),
            h('textarea', {
              id: 'ct-material',
              rows: 6,
              value: form.material,
              placeholder: t('onboard.materialPh'),
              onChange: (event) => update('material', event.target.value),
            }),
            h('p', { className: 'ct-formHint' }, t('onboard.extractHint')),
            h('input', {
              ref: fileInputRef,
              type: 'file',
              multiple: true,
              className: 'ct-fileInput',
              accept: '.txt,.md,.markdown,.csv,.tsv,.json,.html,.htm,.docx,.pptx,.pdf,.c,.h,.hpp,.cpp,.cc,.cxx,.py,.java,.js,.mjs,.ts,.tsx,.jsx,.go,.rs,.sql,.yaml,.yml,.toml,.ini,.log',
              onChange: (event) => {
                if (event.target.files) void importFiles(event.target.files)
                event.target.value = ''
              },
            }),
          ),
          notice === null
            ? null
            : h('p', { className: 'ct-notice', 'data-kind': notice.kind }, notice.text),
          h(
            'label',
            { className: 'ct-field' },
            h('span', null, t('onboard.topic')),
            h('input', {
              type: 'text',
              value: form.topic,
              placeholder: t('onboard.topicPh'),
              onChange: (event) => update('topic', event.target.value),
            }),
          ),
          h(
            'div',
            { className: 'ct-formGrid' },
            h(
              'label',
              { className: 'ct-field' },
              h('span', null, t('onboard.goal')),
              h(
                'select',
                { value: form.goal, onChange: (event) => update('goal', event.target.value) },
                [t('goal.exam'), t('goal.homework'), t('goal.foundation'), t('goal.interview')].map((value) => h('option', { key: value, value }, value)),
              ),
            ),
            h(
              'label',
              { className: 'ct-field' },
              h('span', null, t('onboard.level')),
              h(
                'select',
                { value: form.level, onChange: (event) => update('level', event.target.value) },
                [t('level.zero'), t('level.fuzzy'), t('level.can'), t('level.advanced')].map((value) => h('option', { key: value, value }, value)),
              ),
            ),
            h(
              'label',
              { className: 'ct-field' },
              h('span', null, t('onboard.language')),
              h(
                'select',
                { value: form.language, onChange: (event) => update('language', event.target.value) },
                [t('lang.c'), t('lang.cpp'), t('lang.python'), t('lang.java'), t('lang.other')].map((value) => h('option', { key: value, value }, value)),
              ),
            ),
          ),
          problem === '' ? null : h('p', { className: 'ct-formError' }, problem),
          h(
            'button',
            { type: 'submit', className: 'ct-primary ct-submit', disabled: busyKind !== null },
            h(Icon, { name: 'arrow', size: 16 }),
            t('onboard.start'),
          ),
          h('p', { className: 'ct-formFoot' }, h(Icon, { name: 'book', size: 13 }), t('onboard.privacy')),
        ),
      )
    }

    function MessageBubble(props) {
      const { message, t, locale } = props
      const [copied, setCopied] = React.useState(false)
      if (message.role === 'user') {
        return h(
          'div',
          { className: 'ct-msg ct-msgUser' },
          h(
            'div',
            { className: 'ct-bubble ct-bubbleUser' },
            h('div', { className: 'ct-userText' }, message.content),
            h('div', { className: 'ct-msgMeta ct-msgMetaUser' }, `${t('chat.you')} · ${timeLabel(message.time, locale)}`),
          ),
        )
      }
      const empty = typeof message.content !== 'string' || message.content.trim() === ''
      const copy = () => {
        copyText(message.content, () => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }
      return h(
        'div',
        { className: 'ct-msg' },
        h('div', { className: 'ct-avatar' }, h(Icon, { name: 'bot', size: 16 })),
        h(
          'div',
          { className: 'ct-bubble' },
          h('div', { className: 'ct-msgMeta' }, `${t('chat.tutor')} · ${timeLabel(message.time, locale)}`),
          empty && message.streaming === true
            ? h(
                'div',
                { className: 'ct-thinking', 'aria-live': 'polite' },
                h('span', { className: 'ct-dot' }),
                h('span', { className: 'ct-dot' }),
                h('span', { className: 'ct-dot' }),
                h('span', null, t('chat.thinking')),
              )
            : h('div', { className: 'ct-md' }, renderMarkdown(message.content, t)),
          message.streaming === true && empty === false ? h('span', { className: 'ct-caret', 'aria-hidden': 'true' }) : null,
          message.error ? h('div', { className: 'ct-msgError' }, h(Icon, { name: 'warning', size: 14 }), h('span', null, message.error)) : null,
          message.stopped === true ? h('div', { className: 'ct-msgStopped' }, t('chat.stopped')) : null,
          empty === false && message.streaming !== true
            ? h(
                'div',
                { className: 'ct-msgActions' },
                h(
                  'button',
                  { type: 'button', className: 'ct-iconBtn', onClick: copy, 'aria-label': t('chat.copy') },
                  h(Icon, { name: copied ? 'check' : 'copy', size: 13 }),
                  h('span', null, copied ? t('chat.copied') : t('chat.copy')),
                ),
              )
            : null,
        ),
      )
    }

    function Composer(props) {
      const { draft, setDraft, busy, onSend, onStop, t } = props
      const areaRef = React.useRef(null)
      React.useEffect(() => {
        const area = areaRef.current
        if (area === null) return
        area.style.height = '0px'
        area.style.height = `${Math.min(190, Math.max(44, area.scrollHeight))}px`
      }, [draft])
      const insertCode = () => {
        const area = areaRef.current
        if (area === null) return
        const start = area.selectionStart ?? draft.length
        const end = area.selectionEnd ?? draft.length
        const selected = draft.slice(start, end)
        const next = `${draft.slice(0, start)}\n\`\`\`c\n${selected}\n\`\`\`\n${draft.slice(end)}`
        setDraft(next)
        window.setTimeout(() => {
          area.focus()
          const position = start + 6 + selected.length
          area.setSelectionRange(position, position)
        }, 0)
      }
      const keyDown = (event) => {
        if (event.key === 'Enter' && event.shiftKey === false && event.nativeEvent.isComposing !== true) {
          event.preventDefault()
          if (!busy) onSend()
        }
      }
      return h(
        'div',
        { className: 'ct-composerWrap' },
        h(
          'div',
          { className: 'ct-composer' },
          h('textarea', {
            ref: areaRef,
            rows: 1,
            value: draft,
            placeholder: t('chat.placeholder'),
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: keyDown,
            'aria-label': t('chat.placeholder'),
          }),
          h(
            'div',
            { className: 'ct-composerBar' },
            h(
              'button',
              { type: 'button', className: 'ct-iconBtn ct-composerTool', onClick: insertCode, title: t('chat.code') },
              h(Icon, { name: 'code', size: 14 }),
              h('span', null, t('chat.code')),
            ),
            h('span', { className: 'ct-composerHint' }, busy ? t('chat.thinking') : 'Enter ↵ / Shift+Enter'),
            busy
              ? h(
                  'button',
                  { type: 'button', className: 'ct-stopBtn', onClick: onStop },
                  h(Icon, { name: 'stop', size: 13 }),
                  t('chat.stop'),
                )
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'ct-sendBtn',
                    onClick: onSend,
                    disabled: draft.trim() === '',
                    'aria-label': t('chat.send'),
                  },
                  h(Icon, { name: 'send', size: 16 }),
                ),
          ),
        ),
        h('p', { className: 'ct-disclaimer' }, t('rail.local')),
      )
    }

    function ChatTab(props) {
      const { project, busy, t, locale, onSend, onStop, onQuick, onStart } = props
      const [draft, setDraft] = React.useState('')
      const scrollRef = React.useRef(null)
      const pinnedRef = React.useRef(true)
      const messages = project.messages

      React.useEffect(() => {
        const node = scrollRef.current
        if (node === null || pinnedRef.current === false) return
        node.scrollTop = node.scrollHeight
      }, [messages, busy])

      const onScroll = () => {
        const node = scrollRef.current
        if (node === null) return
        pinnedRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 96
      }

      const send = () => {
        if (draft.trim() === '' || busy) return
        const value = draft
        setDraft('')
        onSend(project, value, project.stage)
      }

      const quick = (action) => {
        if (busy) return
        onQuick(action, project)
      }

      return h(
        'div',
        { className: 'ct-chatTab' },
        h(
          'div',
          { className: 'ct-transcript', ref: scrollRef, onScroll, role: 'log', 'aria-live': 'polite' },
          messages.length === 0
            ? h(EmptyChat, { t, onStart })
            : messages.map((message) => h(MessageBubble, { key: message.id, message, t, locale })),
        ),
        h(
          'div',
          { className: 'ct-quickBar', role: 'toolbar', 'aria-label': t('rail.stages') },
          ['analyze', 'map', 'diagnose', 'teach', 'practice', 'mastery', 'summary'].map((action) =>
            h(
              'button',
              {
                key: action,
                type: 'button',
                className: 'ct-chip',
                disabled: busy,
                onClick: () => quick(action),
              },
              t(`quick.${action}`),
            ),
          ),
        ),
        h(Composer, { draft, setDraft, busy, onSend: send, onStop, t }),
      )
    }

    function BriefEditor(props) {
      const { project, t, onSave, onCancel } = props
      const [form, setForm] = React.useState(project.brief)
      const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
      return h(
        'form',
        {
          className: 'ct-briefEditor',
          onSubmit: (event) => {
            event.preventDefault()
            onSave(form)
          },
        },
        h(
          'label',
          { className: 'ct-field' },
          h('span', null, t('map.material')),
          h('textarea', { rows: 5, value: form.material, onChange: (event) => update('material', event.target.value) }),
        ),
        h(
          'div',
          { className: 'ct-formGrid' },
          h(
            'label',
            { className: 'ct-field' },
            h('span', null, t('map.goal')),
            h('input', { type: 'text', value: form.goal, onChange: (event) => update('goal', event.target.value) }),
          ),
          h(
            'label',
            { className: 'ct-field' },
            h('span', null, t('map.level')),
            h('input', { type: 'text', value: form.level, onChange: (event) => update('level', event.target.value) }),
          ),
          h(
            'label',
            { className: 'ct-field' },
            h('span', null, t('map.language')),
            h('input', { type: 'text', value: form.language, onChange: (event) => update('language', event.target.value) }),
          ),
        ),
        h(
          'div',
          { className: 'ct-formActions' },
          h('button', { type: 'button', className: 'ct-ghost', onClick: onCancel }, t('map.cancel')),
          h('button', { type: 'submit', className: 'ct-primary' }, t('map.save')),
        ),
      )
    }

    function MapTab(props) {
      const { project, t, locale, onQuick, onSaveBrief } = props
      const [editing, setEditing] = React.useState(false)
      return h(
        'div',
        { className: 'ct-tabBody' },
        h(
          'section',
          { className: 'ct-card' },
          h(
            'div',
            { className: 'ct-cardHead' },
            h('h2', null, t('map.brief')),
            h(
              'button',
              { type: 'button', className: 'ct-ghost ct-small', onClick: () => setEditing((value) => !value) },
              h(Icon, { name: editing ? 'close' : 'edit', size: 13 }),
              editing ? t('map.cancel') : t('map.edit'),
            ),
          ),
          editing
            ? h(BriefEditor, {
                project,
                t,
                onCancel: () => setEditing(false),
                onSave: (brief) => {
                  onSaveBrief(brief)
                  setEditing(false)
                },
              })
            : h(
                'dl',
                { className: 'ct-brief' },
                h('div', null, h('dt', null, t('map.material')), h('dd', null, truncate(project.brief.material, 1200) || '—')),
                h('div', null, h('dt', null, t('map.goal')), h('dd', null, project.brief.goal || '—')),
                h('div', null, h('dt', null, t('map.level')), h('dd', null, project.brief.level || '—')),
                h('div', null, h('dt', null, t('map.language')), h('dd', null, project.brief.language || '—')),
              ),
        ),
        h(
          'section',
          { className: 'ct-card' },
          h('div', { className: 'ct-cardHead' }, h('h2', null, t('map.roadmap'))),
          h(
            'ol',
            { className: 'ct-roadmap' },
            STAGES.filter((stage) => stage.n > 0).map((stage) => {
              const state = project.stage === stage.n ? 'current' : project.stage > stage.n ? 'done' : 'todo'
              return h(
                'li',
                { key: stage.n, 'data-state': state },
                h('span', { className: 'ct-roadDot' }, state === 'done' ? h(Icon, { name: 'check', size: 12 }) : stage.n),
                h('div', null, h('strong', null, t(stage.title)), h('span', null, t(stage.hint))),
              )
            }),
          ),
        ),
        h(
          'section',
          { className: 'ct-card' },
          h('div', { className: 'ct-cardHead' }, h('h2', null, t('map.knowledge'))),
          project.mapText.trim() === ''
            ? h(
                'div',
                { className: 'ct-cardEmpty' },
                h(Icon, { name: 'book', size: 22 }),
                h('p', null, t('map.empty')),
                h(
                  'button',
                  { type: 'button', className: 'ct-primary', onClick: () => onQuick('map', project) },
                  t('map.generate'),
                ),
              )
            : h('div', { className: 'ct-md' }, renderMarkdown(project.mapText, t)),
        ),
      )
    }

    function JournalTab(props) {
      const { project, t, locale, onAddNote, onDeleteNote, onMastery, onReview, onExport, onDelete } = props
      const [noteType, setNoteType] = React.useState('error')
      const [noteText, setNoteText] = React.useState('')
      const addNote = (event) => {
        event.preventDefault()
        if (noteText.trim() === '') return
        onAddNote(noteType, noteText.trim())
        setNoteText('')
      }
      const review = project.review ?? { step: 0, dueAt: null, lastAt: null }
      const intervals = REVIEW_DAYS
      const interval = intervals[Math.min(review.step ?? 0, intervals.length - 1)]
      return h(
        'div',
        { className: 'ct-tabBody' },
        h(
          'section',
          { className: 'ct-card' },
          h('div', { className: 'ct-cardHead' }, h('h2', null, t('journal.mastery'))),
          h('p', { className: 'ct-muted' }, t('journal.masteryHint')),
          h(
            'div',
            { className: 'ct-mastery' },
            ['A', 'B', 'C', 'D'].map((grade) =>
              h(
                'button',
                {
                  key: grade,
                  type: 'button',
                  className: 'ct-masteryBtn',
                  'data-active': project.mastery === grade ? '' : undefined,
                  onClick: () => onMastery(grade),
                },
                h('strong', null, grade),
                h('span', null, t(`mastery.${grade}`)),
              ),
            ),
          ),
        ),
        h(
          'section',
          { className: 'ct-card' },
          h('div', { className: 'ct-cardHead' }, h('h2', null, t('journal.review'))),
          review.dueAt === null
            ? h(
                'div',
                { className: 'ct-reviewEmpty' },
                h('p', { className: 'ct-muted' }, t('journal.noReview')),
                h('button', { type: 'button', className: 'ct-ghost', onClick: onReview }, h(Icon, { name: 'calendar', size: 14 }), t('journal.startReview')),
              )
            : h(
                'div',
                { className: 'ct-review' },
                h(
                  'div',
                  { className: 'ct-reviewDate' },
                  h(Icon, { name: 'calendar', size: 16 }),
                  h('div', null, h('strong', null, t('journal.due')), h('span', null, formatDate(review.dueAt, locale))),
                  reviewDue(project) ? h('span', { className: 'ct-dueBadge' }, t('journal.dueToday')) : null,
                ),
                h(
                  'div',
                  { className: 'ct-reviewMeta' },
                  h('span', null, t('journal.reviewInDays').replace('{n}', String(interval))),
                  h(
                    'button',
                    { type: 'button', className: 'ct-ghost ct-small', onClick: onReview },
                    t('journal.complete'),
                  ),
                ),
              ),
        ),
        h(
          'section',
          { className: 'ct-card' },
          h('div', { className: 'ct-cardHead' }, h('h2', null, t('journal.notes')), h('span', { className: 'ct-count' }, String(project.notes.length))),
          h(
            'form',
            { className: 'ct-noteForm', onSubmit: addNote },
            h(
              'div',
              { className: 'ct-noteTypes', role: 'group' },
              ['concept', 'error', 'gain'].map((type) =>
                h(
                  'button',
                  {
                    key: type,
                    type: 'button',
                    className: 'ct-noteType',
                    'data-active': noteType === type ? '' : undefined,
                    'data-type': type,
                    onClick: () => setNoteType(type),
                  },
                  t(`journal.type.${type}`),
                ),
              ),
            ),
            h('textarea', {
              rows: 3,
              value: noteText,
              placeholder: t('journal.notePh'),
              onChange: (event) => setNoteText(event.target.value),
            }),
            h(
              'button',
              { type: 'submit', className: 'ct-primary ct-small', disabled: noteText.trim() === '' },
              h(Icon, { name: 'plus', size: 13 }),
              t('journal.addNote'),
            ),
          ),
          project.notes.length === 0
            ? h('p', { className: 'ct-muted ct-notesEmpty' }, t('journal.emptyNotes'))
            : h(
                'ul',
                { className: 'ct-notes' },
                project.notes
                  .slice()
                  .reverse()
                  .map((note) =>
                    h(
                      'li',
                      { key: note.id, 'data-type': note.type },
                      h(
                        'div',
                        { className: 'ct-noteHead' },
                        h('span', { className: 'ct-noteTag' }, t(`journal.type.${note.type}`)),
                        h('span', { className: 'ct-noteTime' }, formatDate(note.time, locale)),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'ct-iconBtn ct-noteDelete',
                            onClick: () => onDeleteNote(note.id),
                            'aria-label': t('common.noteDelete'),
                          },
                          h(Icon, { name: 'trash', size: 13 }),
                        ),
                      ),
                      h('p', null, note.text),
                    ),
                  ),
              ),
        ),
        h(
          'div',
          { className: 'ct-journalActions' },
          h('button', { type: 'button', className: 'ct-ghost', onClick: onExport }, h(Icon, { name: 'download', size: 14 }), t('journal.export')),
          h('button', { type: 'button', className: 'ct-danger', onClick: onDelete }, h(Icon, { name: 'trash', size: 14 }), t('journal.delete')),
        ),
      )
    }

    function Rail(props) {
      const { store, active, t, onSelect, onNew, onStage } = props
      const projects = store.projects.slice().sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      return h(
        'aside',
        { className: 'ct-rail', 'aria-label': t('app.title') },
        h(
          'div',
          { className: 'ct-brand' },
          h('span', { className: 'ct-brandMark' }, h(SidebarGlyph, { size: 24 })),
          h('div', null, h('strong', null, t('app.title')), h('span', null, 'adaptive tutor')),
        ),
        h(
          'button',
          { type: 'button', className: 'ct-newBtn', onClick: onNew },
          h(Icon, { name: 'plus', size: 15 }),
          t('rail.new'),
        ),
        projects.length === 0
          ? null
          : h(
              'div',
              { className: 'ct-railSection' },
              h('div', { className: 'ct-railTitle' }, t('rail.projects')),
              h(
                'div',
                { className: 'ct-projects' },
                projects.map((project) =>
                  h(
                    'button',
                    {
                      key: project.id,
                      type: 'button',
                      className: 'ct-project',
                      'data-active': project.id === active?.id ? '' : undefined,
                      onClick: () => onSelect(project.id),
                    },
                    h('span', { className: 'ct-projectTitle' }, project.title),
                    h(
                      'span',
                      { className: 'ct-projectMeta' },
                      `${t('stage.' + project.stage)}`,
                      reviewDue(project) ? h('em', { className: 'ct-dueBadge' }, t('project.due')) : null,
                    ),
                  ),
                ),
              ),
            ),
        active === null || active === undefined
          ? null
          : h(
              'div',
              { className: 'ct-railSection ct-railStages' },
              h('div', { className: 'ct-railTitle' }, t('rail.stages')),
              h(
                'ol',
                { className: 'ct-stageList' },
                STAGES.map((stage) => {
                  const state = active.stage === stage.n ? 'current' : active.stage > stage.n ? 'done' : 'todo'
                  return h(
                    'li',
                    { key: stage.n, 'data-state': state },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'ct-stageBtn',
                        onClick: () => onStage(stage.n),
                        'aria-current': state === 'current' ? 'step' : undefined,
                      },
                      h('span', { className: 'ct-stageNum' }, state === 'done' ? h(Icon, { name: 'check', size: 11 }) : stage.n),
                      h('span', null, h('strong', null, t(stage.title)), h('em', null, t(stage.hint))),
                    ),
                  )
                }),
              ),
            ),
        h('p', { className: 'ct-railFoot' }, h(Icon, { name: 'book', size: 12 }), t('rail.local')),
      )
    }

    function TutorPage(props) {
      const { ctx, t } = props
      useLocaleRevision(ctx)
      const locale = ctx.locale.getSnapshot().active.startsWith('zh') ? 'zh-CN' : 'en-US'
      const [store, setStore] = usePersistentStore()
      const [tab, setTab] = React.useState('chat')
      const [busy, setBusy] = React.useState(false)
      const [activeModel, setActiveModel] = React.useState(null)
      const [status, refreshStatus] = useModelStatus()
      const abortRef = React.useRef(null)
      const active = store.projects.find((project) => project.id === store.activeId) ?? null
      const activeRef = React.useRef(active)
      activeRef.current = active

      const updateProject = React.useCallback((id, updater) => {
        setStore((current) => ({
          ...current,
          projects: current.projects.map((project) => {
            if (project.id !== id) return project
            const patch = typeof updater === 'function' ? updater(project) : updater
            return { ...project, ...patch, updatedAt: Date.now() }
          }),
        }))
      }, [setStore])

      const patchMessage = React.useCallback(
        (projectId, messageId, patch) => {
          updateProject(projectId, (project) => ({
            messages: project.messages.map((message) => (message.id === messageId ? { ...message, ...patch } : message)),
          }))
        },
        [updateProject],
      )

      const send = React.useCallback(
        async (project, text, stage) => {
          if (project === null || project === undefined) return
          if (typeof text !== 'string' || text.trim() === '') return
          if (busyRef.current === true) return
          const content = text.trim()
          const userMessage = { id: uid('m'), role: 'user', content, time: Date.now() }
          const assistantId = uid('m')
          const stageNumber = Number.isInteger(stage) ? stage : project.stage
          const history = project.messages
            .filter((message) => typeof message.content === 'string' && message.content.trim() !== '' && message.error !== true)
            .map((message) => ({ role: message.role, content: message.content }))
          updateProject(project.id, (current) => ({
            stage: stageNumber,
            messages: [
              ...current.messages,
              userMessage,
              { id: assistantId, role: 'assistant', content: '', time: Date.now(), streaming: true },
            ],
          }))
          setBusy(true)
          busyRef.current = true
          const controller = new AbortController()
          abortRef.current = controller
          let full = ''
          let streamError = ''
          let stopped = false
          try {
            const response = await fetch(CHAT_URL, {
              method: 'POST',
              headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
              credentials: 'same-origin',
              signal: controller.signal,
              body: JSON.stringify({
                stage: stageNumber,
                brief: project.brief,
                messages: [...history, { role: 'user', content }],
              }),
            })
            if (!response.ok) {
              const body = await response.json().catch(() => ({}))
              throw new Error(body.error || `${t('chat.error')} (HTTP ${response.status})`)
            }
            await consumeSSE(response, (event) => {
              if (event.type === 'start') {
                setActiveModel({ provider: event.provider, model: event.model })
              } else if (event.type === 'delta' && typeof event.text === 'string') {
                full += event.text
                patchMessage(project.id, assistantId, { content: full })
              } else if (event.type === 'error') {
                streamError = typeof event.message === 'string' ? event.message : t('chat.error')
              } else if (event.type === 'aborted') {
                stopped = true
              }
            })
            if (stopped === false && streamError !== '') throw new Error(streamError)
          } catch (error) {
            if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
              stopped = true
            } else {
              streamError = error instanceof Error ? error.message : String(error)
            }
          } finally {
            if (streamError === '' && stopped === false && full.trim() === '') {
              streamError = t('chat.error')
            }
            patchMessage(project.id, assistantId, {
              content: full,
              streaming: false,
              stopped,
              error: streamError !== '' ? streamError : undefined,
            })
            if (streamError === '' && stopped === false && stageNumber <= 2 && full.trim() !== '') {
              updateProject(project.id, { mapText: full })
            }
            setBusy(false)
            busyRef.current = false
            abortRef.current = null
          }
        },
        [patchMessage, t, updateProject],
      )

      const busyRef = React.useRef(false)

      React.useEffect(
        () => () => {
          if (abortRef.current !== null) abortRef.current.abort()
        },
        [],
      )

      const create = (form) => {
        const project = createProject(form, t)
        setStore((current) => ({ ...current, projects: [project, ...current.projects], activeId: project.id }))
        setTab('chat')
        window.setTimeout(() => {
          void send(project, analysisPrompt(project, t), 1)
        }, 0)
      }

      const sendAnalysis = (project) => {
        void send(project, analysisPrompt(project, t), 1)
      }

      const quick = (action, project) => {
        const prompt = quickPrompt(action, project, t)
        const stageByAction = { analyze: 1, map: 2, diagnose: 3, teach: 4, practice: 5, mastery: 6, summary: 7 }
        void send(project, prompt, stageByAction[action] ?? project.stage)
      }

      const stop = () => {
        if (abortRef.current !== null) abortRef.current.abort()
      }

      const selectProject = (id) => {
        if (busyRef.current) return
        setStore((current) => ({ ...current, activeId: id }))
        setTab('chat')
      }

      const newProject = () => {
        if (busyRef.current) return
        setStore((current) => ({ ...current, activeId: null }))
        setTab('chat')
      }

      const setStage = (stage) => {
        if (active === null || busyRef.current) return
        updateProject(active.id, { stage })
      }

      const addNote = (type, text) => {
        if (active === null) return
        updateProject(active.id, (project) => ({
          notes: [...project.notes, { id: uid('note'), type, text, time: Date.now() }],
        }))
      }

      const deleteNote = (id) => {
        if (active === null) return
        updateProject(active.id, (project) => ({ notes: project.notes.filter((note) => note.id !== id) }))
      }

      const setMastery = (grade) => {
        if (active === null) return
        updateProject(active.id, { mastery: active.mastery === grade ? null : grade })
      }

      const review = () => {
        if (active === null) return
        const current = active.review ?? { step: 0, dueAt: null, lastAt: null }
        const nextStep = current.dueAt === null ? 0 : Math.min((current.step ?? 0) + 1, REVIEW_DAYS.length - 1)
        const days = REVIEW_DAYS[nextStep]
        updateProject(active.id, {
          review: { step: nextStep, lastAt: Date.now(), dueAt: Date.now() + days * 86_400_000 },
        })
      }

      const removeProject = () => {
        if (active === null) return
        if (window.confirm(t('journal.deleteConfirm')) === false) return
        setStore((current) => {
          const projects = current.projects.filter((project) => project.id !== active.id)
          return { ...current, projects, activeId: projects[0]?.id ?? null }
        })
        setTab('chat')
      }

      const saveBrief = (brief) => {
        if (active === null) return
        updateProject(active.id, {
          brief,
          title: deriveTitle(brief.material, brief.topic, t('project.untitled')),
        })
      }

      const modelLabel = (() => {
        if (status.loading) return t('model.loading')
        if (status.ready === false) return t('model.offline')
        const model = activeModel ?? status
        return model.model ?? t('model.ready')
      })()

      if (active === null) {
        return h(
          'div',
          { className: 'ct-root' },
          h(Rail, {
            store,
            active,
            t,
            onSelect: selectProject,
            onNew: newProject,
            onStage: () => {},
          }),
          h(
            'main',
            { className: 'ct-main' },
            h(Onboarding, { t, onCreate: create }),
          ),
        )
      }

      return h(
        'div',
        { className: 'ct-root' },
        h(Rail, {
          store,
          active,
          t,
          onSelect: selectProject,
          onNew: newProject,
          onStage: setStage,
        }),
        h(
          'main',
          { className: 'ct-main' },
          h(
            'header',
            { className: 'ct-header' },
            h(
              'div',
              { className: 'ct-headerMain' },
              h(
                'div',
                { className: 'ct-titleRow' },
                h('h1', null, active.title),
                h('span', { className: 'ct-stageBadge' }, `${t('stage.' + active.stage)}`),
              ),
              h('p', null, t('app.subtitle')),
            ),
            h(
              'div',
              { className: 'ct-headerActions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'ct-model',
                  'data-ready': status.ready === true ? '' : undefined,
                  onClick: refreshStatus,
                  title: status.error || modelLabel,
                },
                h('span', { className: 'ct-modelDot' }),
                h('span', null, modelLabel),
                h(Icon, { name: 'refresh', size: 12 }),
              ),
              h(
                'select',
                {
                  className: 'ct-mobileStage',
                  value: active.stage,
                  onChange: (event) => setStage(Number(event.target.value)),
                  'aria-label': t('rail.stages'),
                },
                STAGES.map((stage) => h('option', { key: stage.n, value: stage.n }, `${stage.n}. ${t(stage.title)}`)),
              ),
            ),
          ),
          h(
            'nav',
            { className: 'ct-tabs', role: 'tablist', 'aria-label': t('app.title') },
            [
              ['chat', 'tab.chat'],
              ['map', 'tab.map'],
              ['journal', 'tab.journal'],
            ].map(([id, label]) =>
              h(
                'button',
                {
                  key: id,
                  type: 'button',
                  role: 'tab',
                  'aria-selected': tab === id ? 'true' : 'false',
                  className: 'ct-tab',
                  'data-active': tab === id ? '' : undefined,
                  onClick: () => setTab(id),
                },
                t(label),
              ),
            ),
            h('span', { className: 'ct-tabsSpacer' }),
            h('span', { className: 'ct-localeTag' }, t('stageHint.' + active.stage)),
          ),
          tab === 'chat'
            ? h(ChatTab, {
                project: active,
                busy,
                t,
                locale,
                onSend: send,
                onStop: stop,
                onQuick: quick,
                onStart: () => sendAnalysis(active),
              })
            : tab === 'map'
              ? h(MapTab, { project: active, t, locale, onQuick: quick, onSaveBrief: saveBrief })
              : h(JournalTab, {
                  project: active,
                  t,
                  locale,
                  onAddNote: addNote,
                  onDeleteNote: deleteNote,
                  onMastery: setMastery,
                  onReview: review,
                  onExport: () => exportMarkdown(active, t, locale),
                  onDelete: removeProject,
                }),
        ),
      )
    }

    const CSS = `
      .ct-root {
        height: 100%;
        min-height: 0;
        display: flex;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font-family: var(--dsh-font-family-text, inherit);
        overflow: hidden;
      }
      .ct-root *, .ct-root *::before, .ct-root *::after { box-sizing: border-box; }
      .ct-root button, .ct-root input, .ct-root textarea, .ct-root select { font: inherit; color: inherit; }
      .ct-root button { cursor: pointer; }
      .ct-root button:disabled { cursor: not-allowed; opacity: .45; }
      .ct-root :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }

      .ct-rail {
        width: 252px;
        flex: 0 0 252px;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px 14px 14px;
        border-right: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1);
        overflow-y: auto;
      }
      .ct-brand { display: flex; align-items: center; gap: 10px; padding: 2px 4px 4px; }
      .ct-brandMark {
        width: 38px; height: 38px; border-radius: 11px;
        display: grid; place-items: center;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent);
      }
      .ct-brand strong { display: block; font-size: 13px; letter-spacing: .01em; }
      .ct-brand span { display: block; margin-top: 2px; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .ct-newBtn {
        display: flex; align-items: center; justify-content: center; gap: 7px;
        width: 100%; padding: 9px 12px; border-radius: 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-2);
        font-size: 12.5px; font-weight: 600;
      }
      .ct-newBtn:hover { border-color: var(--dsw-alias-border-l2); }
      .ct-railSection { display: flex; flex-direction: column; gap: 7px; min-height: 0; }
      .ct-railStages { flex: 1 0 auto; }
      .ct-railTitle { padding: 0 4px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .ct-projects { display: flex; flex-direction: column; gap: 3px; max-height: 188px; overflow-y: auto; }
      .ct-project {
        width: 100%; text-align: left; border: 1px solid transparent; border-radius: 8px;
        background: transparent; padding: 7px 9px; display: flex; flex-direction: column; gap: 3px;
      }
      .ct-project:hover { background: var(--dsw-alias-bg-layer-2); }
      .ct-project[data-active] { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent); }
      .ct-projectTitle { font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ct-projectMeta { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
      .ct-stageList { list-style: none; margin: 0; padding: 0 0 0 2px; display: flex; flex-direction: column; gap: 1px; }
      .ct-stageList li { position: relative; }
      .ct-stageBtn {
        width: 100%; display: flex; gap: 9px; align-items: flex-start; text-align: left;
        padding: 5px 4px; border: 0; border-radius: 7px; background: transparent;
      }
      .ct-stageBtn:hover { background: var(--dsw-alias-bg-layer-2); }
      .ct-stageNum {
        width: 19px; height: 19px; flex: 0 0 19px; border-radius: 999px;
        display: grid; place-items: center; margin-top: 1px;
        font-size: 10px; font-weight: 700;
        border: 1px solid var(--dsw-alias-border-l2);
        color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-base);
      }
      .ct-stageBtn strong { display: block; font-size: 11.5px; font-weight: 600; line-height: 1.35; }
      .ct-stageBtn em { display: block; margin-top: 1px; font-size: 10px; line-height: 1.35; font-style: normal; color: var(--dsw-alias-label-secondary); }
      .ct-stageList li[data-state='done'] .ct-stageNum { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, transparent); }
      .ct-stageList li[data-state='current'] .ct-stageNum { color: var(--dsw-alias-bg-base); background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
      .ct-stageList li[data-state='current'] .ct-stageBtn strong { color: var(--dsw-alias-brand-primary); }
      .ct-stageList li[data-state='todo'] .ct-stageBtn { opacity: .72; }
      .ct-railFoot { display: flex; gap: 6px; align-items: flex-start; margin: auto 0 0; padding: 10px 4px 0; border-top: 1px solid var(--dsw-alias-border-l1); font-size: 10px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }

      .ct-main { flex: 1 1 auto; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--dsw-alias-bg-base); }
      .ct-header {
        flex: 0 0 auto; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
        padding: 18px 24px 10px;
      }
      .ct-headerMain { min-width: 0; }
      .ct-titleRow { display: flex; align-items: center; gap: 9px; min-width: 0; }
      .ct-titleRow h1 { margin: 0; font-size: 18px; line-height: 1.3; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ct-stageBadge {
        flex: 0 0 auto; padding: 2px 7px; border-radius: 999px;
        font-size: 10px; font-weight: 600;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent);
      }
      .ct-headerMain p { margin: 4px 0 0; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .ct-headerActions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
      .ct-model {
        display: inline-flex; align-items: center; gap: 6px; max-width: 220px;
        padding: 5px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
        font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ct-model:hover { border-color: var(--dsw-alias-border-l2); }
      .ct-model span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; }
      .ct-modelDot { width: 6px; height: 6px; border-radius: 999px; background: var(--dsw-alias-state-warn-primary); flex: 0 0 auto; }
      .ct-model[data-ready] .ct-modelDot { background: var(--dsw-alias-state-success-primary); }
      .ct-mobileStage { display: none; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; padding: 5px 7px; font-size: 11px; }

      .ct-tabs { flex: 0 0 auto; display: flex; align-items: center; gap: 2px; padding: 0 24px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .ct-tab { padding: 8px 10px; border: 0; border-bottom: 2px solid transparent; background: transparent; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .ct-tab:hover { color: var(--dsw-alias-label-primary); }
      .ct-tab[data-active] { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-brand-primary); font-weight: 600; }
      .ct-tabsSpacer { flex: 1 1 auto; }
      .ct-localeTag { max-width: 330px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: var(--dsw-alias-label-secondary); }

      .ct-chatTab { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
      .ct-transcript { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 18px 24px 8px; }
      .ct-msg { display: flex; gap: 9px; max-width: 880px; margin: 0 auto 18px; align-items: flex-start; }
      .ct-msgUser { justify-content: flex-end; }
      .ct-avatar {
        width: 26px; height: 26px; flex: 0 0 26px; border-radius: 8px; display: grid; place-items: center;
        color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent);
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
      }
      .ct-bubble { min-width: 0; max-width: calc(100% - 38px); border-radius: 12px; }
      .ct-bubbleUser {
        max-width: min(78%, 660px);
        padding: 10px 13px;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, var(--dsw-alias-bg-layer-1));
        border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
      }
      .ct-msgMeta { font-size: 10px; margin-bottom: 4px; color: var(--dsw-alias-label-secondary); }
      .ct-msgMetaUser { margin: 5px 0 0; text-align: right; }
      .ct-userText { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13px; line-height: 1.62; }
      .ct-md { font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
      .ct-md > :first-child { margin-top: 0; }
      .ct-md > :last-child { margin-bottom: 0; }
      .ct-md p { margin: 0 0 .65em; white-space: pre-wrap; }
      .ct-md h3, .ct-md h4, .ct-md h5, .ct-md h6 { margin: 1.05em 0 .45em; line-height: 1.4; letter-spacing: -.005em; }
      .ct-md h3 { font-size: 16px; }
      .ct-md h4 { font-size: 14.5px; }
      .ct-md h5, .ct-md h6 { font-size: 13.5px; }
      .ct-md ul, .ct-md ol { margin: .3em 0 .7em; padding-left: 1.35em; }
      .ct-md li { margin: .16em 0; }
      .ct-md strong { font-weight: 650; }
      .ct-md em { color: var(--dsw-alias-label-secondary); }
      .ct-md a { color: var(--dsw-alias-brand-primary); text-decoration: underline; text-underline-offset: 2px; }
      .ct-md blockquote {
        margin: .6em 0; padding: 2px 0 2px 11px;
        border-left: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent);
        color: var(--dsw-alias-label-secondary);
      }
      .ct-inlineCode {
        padding: 1px 4px; border-radius: 4px;
        font-family: var(--dsh-font-family-code, ui-monospace, monospace);
        font-size: .9em;
        background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l1);
      }
      .ct-tableWrap { overflow-x: auto; margin: .5em 0 .8em; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; }
      .ct-tableWrap table { border-collapse: collapse; width: 100%; font-size: 12px; }
      .ct-tableWrap th, .ct-tableWrap td { padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); text-align: left; vertical-align: top; }
      .ct-tableWrap th { background: var(--dsw-alias-bg-layer-2); font-weight: 600; }
      .ct-tableWrap tr:last-child td { border-bottom: 0; }
      .ct-code { margin: .65em 0; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
      .ct-codeHead { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 7px 5px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .ct-codeLang { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .ct-codeCopy { font-size: 10px; }
      .ct-codePre { margin: 0; padding: 10px 12px; overflow-x: auto; }
      .ct-codePre code { font-family: var(--dsh-font-family-code, ui-monospace, monospace); font-size: 12px; line-height: 1.6; white-space: pre; }
      .ct-thinking { display: flex; align-items: center; gap: 5px; min-height: 24px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .ct-dot { width: 4px; height: 4px; border-radius: 999px; background: currentColor; animation: ct-pulse 1.2s ease-in-out infinite; }
      .ct-dot:nth-child(2) { animation-delay: .15s; }
      .ct-dot:nth-child(3) { animation-delay: .3s; }
      .ct-dot:nth-child(4) { margin-left: 3px; }
      @keyframes ct-pulse { 0%, 100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-1px); } }
      .ct-caret { display: inline-block; width: 6px; height: 14px; margin-left: 2px; vertical-align: -2px; background: var(--dsw-alias-brand-primary); animation: ct-blink 1s steps(2) infinite; }
      @keyframes ct-blink { 50% { opacity: 0; } }
      .ct-msgError { display: flex; gap: 6px; align-items: flex-start; margin-top: 7px; padding: 7px 9px; border-radius: 7px; font-size: 11.5px; color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 22%, transparent); }
      .ct-msgStopped { margin-top: 6px; font-size: 11px; color: var(--dsw-alias-state-warn-primary); }
      .ct-msgActions { display: flex; gap: 6px; margin-top: 5px; opacity: .55; }
      .ct-msg:hover .ct-msgActions { opacity: 1; }

      .ct-iconBtn {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 5px; border: 1px solid transparent; border-radius: 5px;
        background: transparent; color: var(--dsw-alias-label-secondary); font-size: 10.5px;
      }
      .ct-iconBtn:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }

      .ct-emptyChat { max-width: 520px; margin: 8vh auto 0; text-align: center; padding: 0 16px; }
      .ct-emptyIcon { width: 54px; height: 54px; margin: 0 auto 14px; border-radius: 16px; display: grid; place-items: center; color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent); }
      .ct-emptyChat h2 { margin: 0 0 7px; font-size: 19px; letter-spacing: -.01em; }
      .ct-emptyChat p { margin: 0 0 16px; font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }

      .ct-quickBar { flex: 0 0 auto; display: flex; gap: 6px; overflow-x: auto; padding: 6px 24px 8px; scrollbar-width: none; }
      .ct-quickBar::-webkit-scrollbar { display: none; }
      .ct-chip { flex: 0 0 auto; padding: 4px 9px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font-size: 11px; }
      .ct-chip:hover:not(:disabled) { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
      .ct-composerWrap { flex: 0 0 auto; padding: 0 24px 14px; max-width: 928px; width: 100%; margin: 0 auto; }
      .ct-composer { border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 9px 10px 7px; transition: border-color .12s ease; }
      .ct-composer:focus-within { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 60%, var(--dsw-alias-border-l2)); }
      .ct-composer textarea { display: block; width: 100%; min-height: 44px; max-height: 190px; resize: none; border: 0; outline: 0; background: transparent; font-size: 13px; line-height: 1.6; padding: 1px 2px 4px; }
      .ct-composer textarea::placeholder { color: var(--dsw-alias-label-secondary); }
      .ct-composerBar { display: flex; align-items: center; gap: 8px; }
      .ct-composerTool { flex: 0 0 auto; }
      .ct-composerHint { flex: 1 1 auto; font-size: 9.5px; color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ct-sendBtn { width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 0; display: grid; place-items: center; color: var(--dsw-alias-bg-base); background: var(--dsw-alias-brand-primary); }
      .ct-sendBtn:hover:not(:disabled) { filter: brightness(1.06); }
      .ct-stopBtn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); font-size: 11px; }
      .ct-disclaimer { margin: 5px 0 0; text-align: center; font-size: 9.5px; color: var(--dsw-alias-label-secondary); }

      .ct-tabBody { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 18px 24px 28px; }
      .ct-tabBody > * { max-width: 860px; margin-left: auto; margin-right: auto; }
      .ct-card { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; padding: 15px 16px; margin-bottom: 12px; }
      .ct-cardHead { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
      .ct-cardHead h2 { margin: 0; font-size: 13.5px; letter-spacing: .01em; }
      .ct-count { min-width: 18px; padding: 1px 6px; border-radius: 999px; text-align: center; font-size: 10px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
      .ct-brief { margin: 0; display: grid; gap: 9px; }
      .ct-brief > div { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 10px; align-items: start; }
      .ct-brief dt { font-size: 10.5px; color: var(--dsw-alias-label-secondary); padding-top: 1px; }
      .ct-brief dd { margin: 0; font-size: 12px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
      .ct-briefEditor { display: flex; flex-direction: column; gap: 9px; }
      .ct-formGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .ct-formActions { display: flex; justify-content: flex-end; gap: 7px; }
      .ct-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .ct-field > span, .ct-field > label { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
      .ct-field input, .ct-field textarea, .ct-field select, .ct-briefEditor input, .ct-briefEditor textarea, .ct-briefEditor select, .ct-noteForm textarea {
        width: 100%; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px;
        background: var(--dsw-alias-bg-base); padding: 7px 9px; font-size: 12px; line-height: 1.55;
        outline: 0; resize: vertical;
      }
      .ct-field input:focus, .ct-field textarea:focus, .ct-field select:focus, .ct-briefEditor input:focus, .ct-briefEditor textarea:focus, .ct-noteForm textarea:focus { border-color: var(--dsw-alias-brand-primary); }
      .ct-roadmap { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
      .ct-roadmap li { display: flex; gap: 8px; align-items: flex-start; padding: 7px 8px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); }
      .ct-roadmap li[data-state='current'] { border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent); }
      .ct-roadmap li[data-state='done'] { opacity: .72; }
      .ct-roadDot { width: 20px; height: 20px; flex: 0 0 20px; border-radius: 999px; display: grid; place-items: center; font-size: 10px; font-weight: 700; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }
      .ct-roadmap li[data-state='current'] .ct-roadDot { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
      .ct-roadmap li[data-state='done'] .ct-roadDot { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, transparent); }
      .ct-roadmap strong { display: block; font-size: 11.5px; }
      .ct-roadmap span { display: block; margin-top: 1px; font-size: 10px; color: var(--dsw-alias-label-secondary); line-height: 1.35; }
      .ct-cardEmpty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 9px; padding: 20px 12px; color: var(--dsw-alias-label-secondary); }
      .ct-cardEmpty p { margin: 0; max-width: 440px; font-size: 11.5px; line-height: 1.55; }
      .ct-muted { margin: 0 0 10px; font-size: 11.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
      .ct-mastery { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
      .ct-masteryBtn { text-align: left; padding: 8px 9px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); display: flex; flex-direction: column; gap: 3px; }
      .ct-masteryBtn strong { font-size: 15px; line-height: 1; }
      .ct-masteryBtn span { font-size: 9.5px; line-height: 1.35; color: var(--dsw-alias-label-secondary); }
      .ct-masteryBtn:hover { border-color: var(--dsw-alias-border-l2); }
      .ct-masteryBtn[data-active] { border-color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent); }
      .ct-reviewEmpty { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
      .ct-reviewDate { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 8px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); }
      .ct-reviewDate div { display: flex; flex-direction: column; gap: 2px; }
      .ct-reviewDate strong { font-size: 10.5px; color: var(--dsw-alias-label-secondary); font-weight: 500; }
      .ct-reviewDate span { font-size: 13px; }
      .ct-reviewMeta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
      .ct-dueBadge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 999px; font-size: 9.5px; font-style: normal; color: var(--dsw-alias-state-warn-primary); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, transparent); }
      .ct-noteForm { display: flex; flex-direction: column; gap: 7px; padding: 9px; margin-bottom: 12px; border-radius: 9px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); }
      .ct-noteTypes { display: flex; gap: 5px; }
      .ct-noteType { padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); background: transparent; font-size: 10px; color: var(--dsw-alias-label-secondary); }
      .ct-noteType[data-active] { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
      .ct-noteType[data-type='error'][data-active] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent); }
      .ct-noteType[data-type='gain'][data-active] { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent); }
      .ct-noteForm > button { align-self: flex-end; }
      .ct-notes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
      .ct-notes li { padding: 8px 9px; border-radius: 8px; border-left: 3px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); }
      .ct-notes li[data-type='error'] { border-left-color: var(--dsw-alias-state-error-primary); }
      .ct-notes li[data-type='gain'] { border-left-color: var(--dsw-alias-state-success-primary); }
      .ct-notes li[data-type='concept'] { border-left-color: var(--dsw-alias-brand-primary); }
      .ct-noteHead { display: flex; align-items: center; gap: 6px; }
      .ct-noteTag { font-size: 9.5px; color: var(--dsw-alias-label-secondary); }
      .ct-noteTime { flex: 1 1 auto; font-size: 9.5px; color: var(--dsw-alias-label-secondary); }
      .ct-noteDelete { padding: 1px 3px; }
      .ct-notes p { margin: 5px 0 0; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
      .ct-notesEmpty { margin: 2px 0 0; }
      .ct-journalActions { display: flex; justify-content: space-between; gap: 8px; padding: 2px 2px 0; }
      .ct-danger { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 7px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 28%, transparent); background: transparent; color: var(--dsw-alias-state-error-primary); font-size: 11px; }
      .ct-danger:hover { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }

      .ct-primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 12px; border-radius: 8px; border: 0; background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); font-size: 12px; font-weight: 600; }
      .ct-primary:hover:not(:disabled) { filter: brightness(1.06); }
      .ct-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 10px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
      .ct-ghost:hover:not(:disabled) { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
      .ct-small { padding: 4px 8px; font-size: 10.5px; }

      .ct-onboard { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(340px, .98fr); gap: 34px; align-items: center; padding: 40px 44px; max-width: 1120px; margin: 0 auto; width: 100%; }
      .ct-onboardIntro { max-width: 470px; justify-self: end; }
      .ct-eyebrow { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--dsw-alias-brand-primary); }
      .ct-onboardIntro h1 { margin: 12px 0 12px; font-size: clamp(30px, 3.4vw, 42px); line-height: 1.12; letter-spacing: -.035em; }
      .ct-onboardDesc { margin: 0 0 22px; font-size: 13px; line-height: 1.72; color: var(--dsw-alias-label-secondary); }
      .ct-how { padding: 12px 14px; border-radius: 11px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
      .ct-how h2 { margin: 0 0 7px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
      .ct-how ol { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
      .ct-how li { font-size: 11.5px; line-height: 1.5; }
      .ct-videoNote { display: flex; gap: 6px; align-items: flex-start; margin: 12px 0 0; font-size: 10.5px; line-height: 1.5; color: var(--dsw-alias-state-warn-primary); }
      .ct-form { width: 100%; max-width: 460px; justify-self: start; padding: 18px; border-radius: 14px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); box-shadow: 0 10px 36px -24px color-mix(in srgb, var(--dsw-alias-label-primary) 40%, transparent); display: flex; flex-direction: column; gap: 11px; position: relative; }
      .ct-formHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .ct-formHead h2 { margin: 0 0 3px; font-size: 14px; }
      .ct-formHead p { margin: 0; font-size: 9.5px; line-height: 1.4; color: var(--dsw-alias-label-secondary); max-width: 290px; }
      .ct-fieldHead { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .ct-fieldHead label { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
      .ct-linkRow { display: flex; align-items: stretch; gap: 6px; }
      .ct-linkRow input { flex: 1 1 auto; min-width: 0; }
      .ct-linkRow button { flex: 0 0 auto; white-space: nowrap; }
      .ct-formHint { margin: 0; font-size: 9.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
      .ct-fileInput { display: none; }
      .ct-notice { margin: 0; padding: 7px 9px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l1); font-size: 10.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-base); }
      .ct-notice[data-kind='success'] { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 28%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent); }
      .ct-notice[data-kind='warn'] { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 28%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent); }
      .ct-notice[data-kind='error'] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 28%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }
      .ct-dropOverlay { position: absolute; inset: 8px; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1.5px dashed var(--dsw-alias-brand-primary); border-radius: 10px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, var(--dsw-alias-brand-primary)); color: var(--dsw-alias-brand-primary); text-align: center; padding: 16px; pointer-events: none; }
      .ct-dropOverlay strong { font-size: 14px; }
      .ct-dropOverlay span { font-size: 10px; line-height: 1.45; color: var(--dsw-alias-label-secondary); max-width: 280px; }
      .ct-formError { margin: 0; padding: 6px 8px; border-radius: 6px; font-size: 11px; color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }
      .ct-submit { width: 100%; margin-top: 2px; padding: 9px 12px; }
      .ct-formFoot { display: flex; align-items: center; gap: 5px; margin: 0; font-size: 9.5px; color: var(--dsw-alias-label-secondary); }

      .ct-sidebarIcon { display: grid; place-items: center; color: var(--dsw-alias-label-secondary); }
      .ct-sidebarIcon[data-active] { color: var(--dsw-alias-brand-primary); }

      @media (max-width: 1180px) {
        .ct-rail { width: 218px; flex-basis: 218px; }
        .ct-onboard { gap: 24px; padding: 30px 28px; }
        .ct-main .ct-header { padding-left: 18px; padding-right: 18px; }
        .ct-main .ct-tabs { padding-left: 18px; padding-right: 18px; }
        .ct-main .ct-transcript { padding-left: 18px; padding-right: 18px; }
        .ct-main .ct-quickBar { padding-left: 18px; padding-right: 18px; }
        .ct-main .ct-composerWrap { padding-left: 18px; padding-right: 18px; }
      }
      @media (max-width: 980px) {
        .ct-onboard { grid-template-columns: 1fr; gap: 22px; align-items: start; }
        .ct-onboardIntro { justify-self: start; max-width: 640px; }
        .ct-onboardIntro h1 { font-size: 34px; }
        .ct-form { justify-self: start; max-width: 640px; }
        .ct-localeTag { display: none; }
      }
      @media (max-width: 820px) {
        .ct-rail { display: none; }
        .ct-mobileStage { display: block; }
        .ct-header { padding-top: 14px; }
        .ct-headerMain p { display: none; }
        .ct-model { max-width: 140px; }
        .ct-formGrid { grid-template-columns: 1fr; }
        .ct-roadmap { grid-template-columns: 1fr; }
        .ct-mastery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ct-onboard { padding: 24px 18px; }
        .ct-onboardIntro h1 { font-size: 30px; }
        .ct-tabBody { padding: 14px 16px 22px; }
        .ct-journalActions { flex-direction: column; align-items: stretch; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ct-root *, .ct-root *::before, .ct-root *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
      }
    `

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register('cs-tutor', { zh, en }), 'cs-tutor: locale')
      const t = ctx.locale.bind('cs-tutor')
      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.dataset.plugin = '@local/dsh-cs-tutor'
        tag.dataset.pluginCss = 'cs-tutor/panel.css'
        tag.textContent = CSS
        document.head.appendChild(tag)
        return () => tag.remove()
      }, 'cs-tutor: styles')

      function LiveSidebarIcon(props) {
        useLocaleRevision(ctx)
        return h(SidebarIcon, props)
      }

      function LiveTutorPage(props) {
        return h(TutorPage, { ...props, ctx, t })
      }

      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: 'cs-tutor',
                order: 12,
                label: () => t('nav'),
              },
              LiveSidebarIcon,
            ),
          ),
        'cs-tutor: sidebar entry',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: 'cs-tutor',
              },
              LiveTutorPage,
            ),
          ),
        'cs-tutor: main panel',
      )
    }

    return {
      inject: ['slots', 'layout', 'locale'],
      apply,
    }
  },
})
