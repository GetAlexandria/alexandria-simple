(function attachStudioBoardModel(global) {
  'use strict';

  const STAGE_KEYS = ['backlog', 'sourced', 'designed', 'built', 'proven', 'live'];
  const LEGACY_STAGE_ALIASES = { empty: 'backlog' };
  const STAGE_DEFS = [
    { key: 'backlog', title: 'Backlog', gate: '<b>Work pool.</b> Named and waiting for source material or the next Director pull.' },
    { key: 'sourced', title: 'Sourced', gate: '<b>Source material gathered.</b> The grounding is in hand, put to work.' },
    { key: 'designed', title: 'Designed', gate: '<b>The logic is drawn.</b> The section 4 move graph: doers, contracts, bounce edges.' },
    { key: 'built', title: 'Built', gate: '<b>Workflow + fixtures built.</b> The workflow package authored, and its fixtures authored and chosen.' },
    { key: 'proven', title: 'Proven', gate: '<b>Runs on its fixtures and holds.</b> A real factory run against its fixtures passes the proof spec.' },
    { key: 'live', title: 'Live', gate: '<b>Registered: users can run it.</b> Live in Alexandria Next, ax-runnable.' },
  ];
  const STATUS_DEFS = [
    { key: 'open', title: 'Open' },
    { key: 'in-progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
    { key: 'wont-do', title: "Won't Do" },
  ];
  const STATUS_KEYS = STATUS_DEFS.map(status => status.key);
  const TERMINAL_STATUS_KEYS = ['done', 'wont-do'];
  const DEFAULT_ARCHIVE_WINDOW_DAYS = 7;
  const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const CARD_TYPES = ['testing', 'improvement', 'bug'];
  const TYPE_LABELS = {
    testing: 'Testing',
    improvement: 'Improvement',
    bug: 'Bug',
  };
  const DEFAULT_PRIORITIES = {
    bug: 10,
    testing: 15,
    improvement: 20,
  };
  const REQUIRED_CARD_FIELDS = ['id', 'type', 'status', 'division', 'function', 'priority', 'source', 'created'];
  const ALLOWED_CARD_FIELDS = [
    'id',
    'type',
    'status',
    'division',
    'function',
    'play',
    'priority',
    'source',
    'created',
    'terminalAt',
    'archived',
    'pinned',
    'title',
    'detail',
    'checklist',
  ];

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function normalizeStageKey(key) {
    return LEGACY_STAGE_ALIASES[key] || key;
  }

  function emptyStageState() {
    return Object.fromEntries(STAGE_KEYS.map(key => [key, []]));
  }

  function toSet(values) {
    if (!values) return null;
    return values instanceof Set ? values : new Set(values);
  }

  function isDateOnly(value) {
    return typeof value === 'string' && DATE_ONLY_PATTERN.test(value);
  }

  function dateOnlyFrom(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (isDateOnly(value)) return value;
    return new Date(value || Date.now()).toISOString().slice(0, 10);
  }

  function utcDay(value) {
    if (value instanceof Date) {
      return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    }
    if (!isDateOnly(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  }

  function isTerminalStatus(status) {
    return TERMINAL_STATUS_KEYS.includes(status);
  }

  function isTerminalCard(card) {
    return Boolean(card && isTerminalStatus(card.status));
  }

  function normalizeStages(stages, options = {}) {
    const normalized = emptyStageState();
    const allowed = toSet(options.allowedSlugs);
    const placed = new Set();
    if (stages && typeof stages === 'object' && !Array.isArray(stages)) {
      for (const [rawKey, slugs] of Object.entries(stages)) {
        const key = normalizeStageKey(rawKey);
        if (!STAGE_KEYS.includes(key) || !Array.isArray(slugs)) continue;
        for (const slug of slugs) {
          if (typeof slug !== 'string' || !slug) continue;
          if (allowed && !allowed.has(slug)) continue;
          if (placed.has(slug)) continue;
          normalized[key].push(slug);
          placed.add(slug);
        }
      }
    }
    if (Array.isArray(options.includeMissingSlugs)) {
      const target = STAGE_KEYS.includes(options.defaultStage) ? options.defaultStage : 'backlog';
      for (const slug of options.includeMissingSlugs) {
        if (typeof slug !== 'string' || !slug) continue;
        if (allowed && !allowed.has(slug)) continue;
        if (!placed.has(slug)) {
          normalized[target].push(slug);
          placed.add(slug);
        }
      }
    }
    return normalized;
  }

  function boardSlugs(stages) {
    if (!stages || typeof stages !== 'object') return [];
    const slugs = [];
    for (const key of STAGE_KEYS) {
      const list = stages[key];
      if (Array.isArray(list)) slugs.push(...list);
    }
    return slugs;
  }

  function validateCanonicalStages(stages, options = {}) {
    const errors = [];
    if (!stages || typeof stages !== 'object' || Array.isArray(stages)) {
      return ['stages must be an object'];
    }
    const keys = Object.keys(stages);
    const missing = STAGE_KEYS.filter(key => !keys.includes(key));
    const extra = keys.filter(key => !STAGE_KEYS.includes(key));
    if (missing.length || extra.length) {
      errors.push(`stages keys must be exactly ${STAGE_KEYS.join(', ')}`);
    }
    const allowed = toSet(options.allowedSlugs);
    const seen = new Set();
    for (const key of STAGE_KEYS) {
      const slugs = stages[key];
      if (!Array.isArray(slugs)) {
        errors.push(`${key} must be a list`);
        continue;
      }
      for (const slug of slugs) {
        if (typeof slug !== 'string' || !slug) {
          errors.push(`${key} contains a non-string slug`);
          continue;
        }
        if (seen.has(slug)) errors.push(`duplicate slug ${slug}`);
        seen.add(slug);
        if (allowed && !allowed.has(slug)) errors.push(`unknown board slug ${slug}`);
      }
    }
    if (options.requireAllSlugs && allowed) {
      for (const slug of allowed) {
        if (!seen.has(slug)) errors.push(`board slug ${slug} is missing from stages`);
      }
    }
    return errors;
  }

  function defaultPriority(type) {
    return DEFAULT_PRIORITIES[type] || 50;
  }

  function validateChecklist(card, errors, index) {
    if (card.type === 'testing') {
      if (!Array.isArray(card.checklist)) {
        errors.push(`card ${index + 1} testing checklist must be a list`);
        return;
      }
      card.checklist.forEach((item, itemIndex) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          errors.push(`card ${index + 1} checklist item ${itemIndex + 1} must be an object`);
          return;
        }
        const itemKeys = Object.keys(item);
        const extra = itemKeys.filter(key => key !== 'text' && key !== 'done');
        if (extra.length) errors.push(`card ${index + 1} checklist item ${itemIndex + 1} has unknown fields: ${extra.join(', ')}`);
        if (typeof item.text !== 'string' || !item.text.trim()) {
          errors.push(`card ${index + 1} checklist item ${itemIndex + 1} text must be a string`);
        }
        if (typeof item.done !== 'boolean') {
          errors.push(`card ${index + 1} checklist item ${itemIndex + 1} done must be a boolean`);
        }
      });
      return;
    }
    if (hasOwn(card, 'checklist')) errors.push(`card ${index + 1} checklist is only allowed on testing cards`);
  }

  function validateCards(cards, options = {}) {
    const errors = [];
    if (!Array.isArray(cards)) return ['cards must be a list'];

    const ids = new Set();
    const testingByPlay = new Map();
    const boardSlugSet = toSet(options.boardSlugs);
    const cardPlaySlugSet = toSet(options.cardPlaySlugs || options.boardSlugs);
    const requiredTestingSlugSet = options.requireTestingForBoardSlugs === true
      ? boardSlugSet
      : toSet(options.requireTestingForBoardSlugs);
    const playsBySlug = options.catalog
      ? Object.fromEntries(options.catalog.RUNGS.map(play => [play.slug, play]))
      : {};

    cards.forEach((card, index) => {
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        errors.push(`card ${index + 1} must be an object`);
        return;
      }

      const extra = Object.keys(card).filter(key => !ALLOWED_CARD_FIELDS.includes(key));
      if (extra.length) errors.push(`card ${index + 1} has unknown fields: ${extra.join(', ')}`);

      for (const field of REQUIRED_CARD_FIELDS) {
        if (!hasOwn(card, field)) errors.push(`card ${index + 1} is missing ${field}`);
      }

      if (typeof card.id !== 'string' || !card.id.trim()) {
        errors.push(`card ${index + 1} id must be a string`);
      } else if (ids.has(card.id)) {
        errors.push(`duplicate card id ${card.id}`);
      } else {
        ids.add(card.id);
      }

      if (!CARD_TYPES.includes(card.type)) errors.push(`card ${card.id || index + 1} type must be one of ${CARD_TYPES.join(', ')}`);
      if (!STATUS_KEYS.includes(card.status)) errors.push(`card ${card.id || index + 1} status must be one of ${STATUS_KEYS.join(', ')}`);
      if (typeof card.division !== 'string' || !card.division.trim()) errors.push(`card ${card.id || index + 1} division must be a string`);
      if (typeof card.function !== 'string' || !card.function.trim()) errors.push(`card ${card.id || index + 1} function must be a string`);
      if (!Number.isInteger(card.priority)) errors.push(`card ${card.id || index + 1} priority must be an integer`);
      if (typeof card.source !== 'string' || !card.source.trim()) errors.push(`card ${card.id || index + 1} source must be a string`);
      if (typeof card.created !== 'string' || !DATE_ONLY_PATTERN.test(card.created)) {
        errors.push(`card ${card.id || index + 1} created must be YYYY-MM-DD`);
      }
      if (hasOwn(card, 'terminalAt') && !isDateOnly(card.terminalAt)) {
        errors.push(`card ${card.id || index + 1} terminalAt must be YYYY-MM-DD when present`);
      }
      if (hasOwn(card, 'archived') && typeof card.archived !== 'boolean') {
        errors.push(`card ${card.id || index + 1} archived must be a boolean when present`);
      }
      if (hasOwn(card, 'pinned') && typeof card.pinned !== 'boolean') {
        errors.push(`card ${card.id || index + 1} pinned must be a boolean when present`);
      }
      if (hasOwn(card, 'title') && (typeof card.title !== 'string' || !card.title.trim())) {
        errors.push(`card ${card.id || index + 1} title must be a non-empty string when present`);
      }
      if (hasOwn(card, 'detail') && typeof card.detail !== 'string') {
        errors.push(`card ${card.id || index + 1} detail must be a string when present`);
      }
      if (hasOwn(card, 'play')) {
        if (typeof card.play !== 'string' || !card.play.trim()) {
          errors.push(`card ${card.id || index + 1} play must be a non-empty string when present`);
        } else if (cardPlaySlugSet && !cardPlaySlugSet.has(card.play)) {
          errors.push(`card ${card.id || index + 1} links unknown board play ${card.play}`);
        }
      }

      if (card.type === 'testing') {
        if (!card.play) {
          errors.push(`testing card ${card.id || index + 1} must link a play`);
        } else {
          testingByPlay.set(card.play, (testingByPlay.get(card.play) || 0) + 1);
        }
      }

      if (options.catalog) {
        const division = options.catalog.DIVISIONS[card.division];
        if (!division) {
          errors.push(`card ${card.id || index + 1} declares unknown division ${card.division}`);
        } else if (!division.functions.includes(card.function)) {
          errors.push(`card ${card.id || index + 1} declares ${card.division} / ${card.function}, but that function is not in the division`);
        }
        if (card.play) {
          const play = playsBySlug[card.play];
          if (!play) {
            errors.push(`card ${card.id || index + 1} links unknown play ${card.play}`);
          } else {
            if (typeof options.catalog.appearsOnBoard === 'function' && !options.catalog.appearsOnBoard(play)) {
              errors.push(`card ${card.id || index + 1} links play ${card.play}, which is not board-visible`);
            }
            if (play.division !== card.division || play.function !== card.function) {
              errors.push(`card ${card.id || index + 1} filing must match ${card.play}: ${play.division} / ${play.function}`);
            }
          }
        }
      }

      validateChecklist(card, errors, index);
    });

    for (const [play, count] of testingByPlay) {
      if (count > 1) errors.push(`play ${play} has ${count} testing cards`);
    }

    if (requiredTestingSlugSet) {
      for (const slug of requiredTestingSlugSet) {
        const count = testingByPlay.get(slug) || 0;
        if (count !== 1) errors.push(`play ${slug} must have exactly one testing card`);
      }
    }

    return errors;
  }

  function sortCards(cards) {
    return [...cards].sort((left, right) => {
      const priority = left.priority - right.priority;
      if (priority) return priority;
      const created = String(left.created || '').localeCompare(String(right.created || ''));
      if (created) return created;
      return String(left.id).localeCompare(String(right.id));
    });
  }

  function filterCards(cards, filters = {}) {
    return sortCards(cards).filter(card => {
      if (filters.play && card.play !== filters.play) return false;
      if (filters.type && card.type !== filters.type) return false;
      if (filters.status && card.status !== filters.status) return false;
      return true;
    });
  }

  function updateCardStatus(cards, id, status) {
    if (!STATUS_KEYS.includes(status)) throw new Error(`unknown card status ${status}`);
    return cards.map(card => (card.id === id ? normalizeCardStatusTransition(card, { ...card, status }) : card));
  }

  function updateCard(cards, nextCard) {
    return cards.map(card => (card.id === nextCard.id ? { ...nextCard } : card));
  }

  function moveSlugBetweenStages(stages, slug, stage, beforeSlug = null) {
    if (!STAGE_KEYS.includes(stage)) throw new Error(`unknown stage ${stage}`);
    const next = normalizeStages(stages);
    for (const key of STAGE_KEYS) next[key] = next[key].filter(item => item !== slug);
    const list = next[stage];
    const index = beforeSlug ? list.indexOf(beforeSlug) : -1;
    if (index >= 0) list.splice(index, 0, slug);
    else list.push(slug);
    return next;
  }

  function normalizeCardStatusTransition(existingCard, nextCard, options = {}) {
    if (!nextCard || typeof nextCard !== 'object') return nextCard;
    if (!STATUS_KEYS.includes(nextCard.status)) throw new Error(`unknown card status ${nextCard.status}`);
    const next = { ...nextCard };
    const today = dateOnlyFrom(options.now);
    const existingWasTerminal = isTerminalCard(existingCard);
    const nextIsTerminal = isTerminalCard(next);

    if (!nextIsTerminal) {
      delete next.terminalAt;
      return next;
    }
    if (isDateOnly(next.terminalAt)) return next;
    if (existingWasTerminal) {
      if (isDateOnly(existingCard.terminalAt)) next.terminalAt = existingCard.terminalAt;
      else if (isDateOnly(next.created)) next.terminalAt = next.created;
      else next.terminalAt = today;
      return next;
    }
    next.terminalAt = today;
    return next;
  }

  function mergeCardsById(existingCards = [], postedCards = [], options = {}) {
    const byId = new Map();
    const order = [];
    for (const card of Array.isArray(existingCards) ? existingCards : []) {
      if (!card || typeof card !== 'object' || typeof card.id !== 'string') continue;
      byId.set(card.id, { ...card });
      order.push(card.id);
    }
    for (const postedCard of Array.isArray(postedCards) ? postedCards : []) {
      if (!postedCard || typeof postedCard !== 'object' || typeof postedCard.id !== 'string') continue;
      const existing = byId.get(postedCard.id);
      byId.set(postedCard.id, normalizeCardStatusTransition(existing, postedCard, options));
      if (!order.includes(postedCard.id)) order.push(postedCard.id);
    }
    return order.flatMap(id => {
      const card = byId.get(id);
      return card ? [card] : [];
    });
  }

  function archiveDateForTerminalCard(card) {
    if (!isTerminalCard(card)) return null;
    if (isDateOnly(card.terminalAt)) return card.terminalAt;
    if (isDateOnly(card.created)) return card.created;
    return null;
  }

  function inArchive(card, options = {}) {
    if (!card || typeof card !== 'object') return false;
    if (card.archived === true) return true;
    if (!isTerminalCard(card) || card.pinned === true) return false;
    const nowDay = utcDay(options.now || new Date());
    const terminalDay = utcDay(archiveDateForTerminalCard(card));
    if (nowDay == null || terminalDay == null) return false;
    const windowDays = Number.isFinite(options.windowDays) ? options.windowDays : DEFAULT_ARCHIVE_WINDOW_DAYS;
    const ageDays = Math.floor((nowDay - terminalDay) / 86_400_000);
    return ageDays >= windowDays;
  }

  function partitionCardsByArchive(cards, options = {}) {
    const active = [];
    const archived = [];
    for (const card of Array.isArray(cards) ? cards : []) {
      if (inArchive(card, options)) archived.push(card);
      else active.push(card);
    }
    return { active, archived };
  }

  function normalizeGraduatedSlugs(value, options = {}) {
    const errors = [];
    if (value == null) return { errors, graduated: [] };
    if (!Array.isArray(value)) return { errors: ['graduated must be a list'], graduated: [] };
    const allowed = toSet(options.allowedSlugs);
    const seen = new Set();
    const graduated = [];
    value.forEach((slug, index) => {
      if (typeof slug !== 'string' || !slug) {
        errors.push(`graduated item ${index + 1} must be a non-empty string`);
        return;
      }
      if (seen.has(slug)) {
        errors.push(`duplicate graduated slug ${slug}`);
        return;
      }
      seen.add(slug);
      if (allowed && !allowed.has(slug)) errors.push(`unknown graduated slug ${slug}`);
      graduated.push(slug);
    });
    return { errors, graduated };
  }

  function normalizeGraduatedAt(value, graduated, options = {}) {
    const errors = [];
    const graduatedList = Array.isArray(graduated) ? graduated : [];
    const graduatedSet = new Set(graduatedList);
    const today = dateOnlyFrom(options.now);
    const source = value == null ? {} : value;
    const sourceDates = new Map();

    if (source && typeof source === 'object' && !Array.isArray(source)) {
      for (const [slug, date] of Object.entries(source)) {
        if (typeof slug !== 'string' || !slug) {
          errors.push('graduatedAt keys must be non-empty slugs');
          continue;
        }
        if (!isDateOnly(date)) {
          errors.push(`graduatedAt ${slug} must be YYYY-MM-DD`);
          continue;
        }
        sourceDates.set(slug, date);
        if (!graduatedSet.has(slug)) errors.push(`graduatedAt has stale slug ${slug}`);
      }
    } else {
      errors.push('graduatedAt must be an object');
    }

    const graduatedAt = {};
    for (const slug of graduatedList) {
      graduatedAt[slug] = sourceDates.get(slug) || today;
    }
    return { errors, graduatedAt };
  }

  function graduatePlay(board, slug) {
    if (typeof slug !== 'string' || !slug) throw new Error('graduate slug must be a non-empty string');
    const stages = normalizeStages(board && board.stages);
    for (const key of STAGE_KEYS) stages[key] = stages[key].filter(item => item !== slug);
    const graduated = Array.from(new Set([...(Array.isArray(board && board.graduated) ? board.graduated : []), slug]));
    const normalizedAt = normalizeGraduatedAt(board && board.graduatedAt, graduated);
    return {
      ...(board || {}),
      ready: Array.isArray(board && board.ready) ? board.ready.filter(item => item !== slug) : [],
      stages,
      graduated,
      graduatedAt: normalizedAt.graduatedAt,
    };
  }

  function restoreGraduatedPlay(board, slug, stage = 'live', beforeSlug = null) {
    if (typeof slug !== 'string' || !slug) throw new Error('restore slug must be a non-empty string');
    if (!STAGE_KEYS.includes(stage)) throw new Error(`unknown stage ${stage}`);
    const stages = moveSlugBetweenStages(board && board.stages, slug, stage, beforeSlug);
    const graduated = (Array.isArray(board && board.graduated) ? board.graduated : []).filter(item => item !== slug);
    const normalizedAt = normalizeGraduatedAt(board && board.graduatedAt, graduated);
    return {
      ...(board || {}),
      stages,
      graduated,
      graduatedAt: normalizedAt.graduatedAt,
    };
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70);
  }

  function createCardId(type, scope, title, existingIds) {
    const used = toSet(existingIds) || new Set();
    const base = `wo-${slugify(scope || 'system')}-${slugify(type)}-${slugify(title || 'card') || 'card'}`;
    let id = base;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    return id;
  }

  function parseChecklist(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^\[(x|X| )\]\s*(.+)$/);
        if (match) return { done: match[1].toLowerCase() === 'x', text: match[2].trim() };
        return { done: false, text: line };
      });
  }

  function checklistToText(checklist) {
    if (!Array.isArray(checklist)) return '';
    return checklist.map(item => `[${item.done ? 'x' : ' '}] ${item.text}`).join('\n');
  }

  function testingCardForPlay(play, created, source = 'seed:testing-card') {
    return {
      id: `wo-${play.slug}-testing`,
      type: 'testing',
      status: 'open',
      division: play.division,
      function: play.function,
      play: play.slug,
      priority: defaultPriority('testing'),
      source,
      created,
      title: 'Testing campaign',
      detail: 'Priority-ordered checklist to raise this play past its first smoke.',
      checklist: [
        { text: 'Define the next proof campaign beyond the first smoke.', done: false },
        { text: 'Run the fixtures or dry-run set and record the read-out.', done: false },
        { text: 'Close residual risks or file follow-up Bug/Improvement cards.', done: false },
      ],
    };
  }

  function ensureTestingCards(cards, boardSlugList, playsBySlug, created) {
    const next = [...cards];
    const testing = new Set(next.filter(card => card.type === 'testing' && card.play).map(card => card.play));
    for (const slug of boardSlugList) {
      const play = playsBySlug[slug];
      if (!play || testing.has(slug)) continue;
      next.push(testingCardForPlay(play, created, 'board:auto-testing-card'));
      testing.add(slug);
    }
    return sortCards(next);
  }

  const api = {
    STAGE_KEYS,
    LEGACY_STAGE_ALIASES,
    STAGE_DEFS,
    STATUS_KEYS,
    STATUS_DEFS,
    TERMINAL_STATUS_KEYS,
    DEFAULT_ARCHIVE_WINDOW_DAYS,
    CARD_TYPES,
    TYPE_LABELS,
    DEFAULT_PRIORITIES,
    REQUIRED_CARD_FIELDS,
    ALLOWED_CARD_FIELDS,
    normalizeStageKey,
    emptyStageState,
    normalizeStages,
    isDateOnly,
    isTerminalStatus,
    isTerminalCard,
    validateCanonicalStages,
    boardSlugs,
    defaultPriority,
    validateCards,
    sortCards,
    filterCards,
    updateCardStatus,
    updateCard,
    moveSlugBetweenStages,
    normalizeCardStatusTransition,
    mergeCardsById,
    archiveDateForTerminalCard,
    inArchive,
    partitionCardsByArchive,
    normalizeGraduatedSlugs,
    normalizeGraduatedAt,
    graduatePlay,
    restoreGraduatedPlay,
    slugify,
    createCardId,
    parseChecklist,
    checklistToText,
    testingCardForPlay,
    ensureTestingCards,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.StudioBoardModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
