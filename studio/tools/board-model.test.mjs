#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelPath = path.resolve(__dirname, '..', 'plays', 'board-model.js');

function loadBoardModel() {
  const context = { console };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath });
  return context.StudioBoardModel;
}

const board = loadBoardModel();

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const catalog = {
  DIVISIONS: {
    Product: { functions: ['Insight', 'Definition'] },
    PlaymakerStudio: { functions: ['Operations'] },
  },
  RUNGS: [
    { slug: 'frame-the-problem', division: 'Product', function: 'Insight', prio: 'core' },
    { slug: 'write-the-one-pager', division: 'Product', function: 'Definition', prio: 'core' },
  ],
  appearsOnBoard(play) {
    return play.prio !== 'parked';
  },
};

function baseCard(overrides = {}) {
  return {
    id: 'wo-frame-the-problem-testing',
    type: 'testing',
    status: 'open',
    division: 'Product',
    function: 'Insight',
    play: 'frame-the-problem',
    priority: board.defaultPriority('testing'),
    source: 'test',
    created: '2026-06-23',
    checklist: [{ text: 'Run the campaign', done: false }],
    ...overrides,
  };
}

test('legacy empty stage normalizes to backlog', () => {
  const stages = board.normalizeStages({ empty: ['frame-the-problem'], live: [] });
  assert.deepEqual(plain(stages.backlog), ['frame-the-problem']);
  assert.deepEqual(plain(Object.keys(stages)), plain(board.STAGE_KEYS));
});

test('duplicate testing cards for a play are rejected', () => {
  const errors = board.validateCards(
    [
      baseCard(),
      baseCard({ id: 'wo-frame-the-problem-testing-2' }),
    ],
    { boardSlugs: ['frame-the-problem'], catalog },
  );
  assert(errors.some(error => error.includes('has 2 testing cards')));
});

test('testing cards must link a play', () => {
  const card = baseCard({ id: 'wo-system-testing' });
  delete card.play;
  const errors = board.validateCards([card], { boardSlugs: ['frame-the-problem'], catalog });
  assert(errors.some(error => error.includes('must link a play')));
});

test('system-level Bug and Improvement cards are accepted', () => {
  const bug = baseCard({
    id: 'wo-product-insight-bug',
    type: 'bug',
    priority: board.defaultPriority('bug'),
    title: 'System catch',
  });
  delete bug.play;
  delete bug.checklist;
  const improvement = baseCard({
    id: 'wo-product-insight-improvement',
    type: 'improvement',
    priority: board.defaultPriority('improvement'),
    title: 'System improvement',
  });
  delete improvement.play;
  delete improvement.checklist;
  const errors = board.validateCards([bug, improvement], { boardSlugs: ['frame-the-problem'], catalog });
  assert.equal(errors.length, 0);
});

test('work-order status changes do not mutate play stages', () => {
  const stages = {
    backlog: ['write-the-one-pager'],
    sourced: [],
    designed: [],
    built: [],
    proven: [],
    live: ['frame-the-problem'],
  };
  const originalStages = structuredClone(stages);
  const cards = [baseCard()];
  const nextCards = board.updateCardStatus(cards, 'wo-frame-the-problem-testing', 'in-progress');
  assert.equal(nextCards[0].status, 'in-progress');
  assert.deepEqual(stages, originalStages);
});

test('play stage moves do not mutate work-order statuses', () => {
  const cards = [baseCard({ status: 'in-progress' })];
  const nextStages = board.moveSlugBetweenStages(
    { backlog: ['write-the-one-pager'], sourced: [], designed: [], built: [], proven: [], live: ['frame-the-problem'] },
    'write-the-one-pager',
    'sourced',
  );
  assert.deepEqual(plain(nextStages.sourced), ['write-the-one-pager']);
  assert.equal(cards[0].status, 'in-progress');
});

test('Bug default priority sorts above Improvement', () => {
  assert(board.defaultPriority('bug') < board.defaultPriority('improvement'));
});

test('per-play type/status facets filter cards', () => {
  const cards = [
    baseCard({ id: 'wo-frame-the-problem-testing', type: 'testing', status: 'open' }),
    baseCard({ id: 'wo-frame-the-problem-bug', type: 'bug', status: 'done', priority: 10, title: 'Fixed' }),
    baseCard({ id: 'wo-write-the-one-pager-bug', type: 'bug', status: 'open', play: 'write-the-one-pager', function: 'Definition', priority: 10, title: 'Other play' }),
  ];
  delete cards[1].checklist;
  delete cards[2].checklist;
  const filtered = board.filterCards(cards, { play: 'frame-the-problem', type: 'bug', status: 'done' });
  assert.deepEqual(plain(filtered.map(card => card.id)), ['wo-frame-the-problem-bug']);
});

test('wont-do status and lifecycle fields validate', () => {
  const errors = board.validateCards(
    [
      baseCard({
        archived: false,
        pinned: true,
        status: 'wont-do',
        terminalAt: '2026-06-24',
      }),
    ],
    { boardSlugs: ['frame-the-problem'], catalog },
  );
  assert.equal(errors.length, 0);
});

test('terminalAt is set on terminal status and cleared on reopen', () => {
  const open = baseCard();
  const done = board.normalizeCardStatusTransition(open, { ...open, status: 'done' }, { now: '2026-06-24' });
  assert.equal(done.status, 'done');
  assert.equal(done.terminalAt, '2026-06-24');

  const wontDo = board.normalizeCardStatusTransition(done, { ...done, status: 'wont-do' }, { now: '2026-07-01' });
  assert.equal(wontDo.status, 'wont-do');
  assert.equal(wontDo.terminalAt, '2026-06-24');

  const reopened = board.normalizeCardStatusTransition(wontDo, { ...wontDo, status: 'in-progress' }, { now: '2026-07-02' });
  assert.equal(reopened.status, 'in-progress');
  assert.equal(Object.hasOwn(reopened, 'terminalAt'), false);
});

test('legacy terminal cards without terminalAt use created when resaved terminal-to-terminal', () => {
  const legacyDone = baseCard({ status: 'done' });
  const wontDo = board.normalizeCardStatusTransition(legacyDone, { ...legacyDone, status: 'wont-do' }, { now: '2026-06-24' });
  assert.equal(wontDo.status, 'wont-do');
  assert.equal(wontDo.terminalAt, '2026-06-23');
});

test('inArchive derives membership at a fixed date', () => {
  const now = '2026-06-24';
  assert.equal(board.inArchive(baseCard({ status: 'done', terminalAt: '2026-06-18' }), { now }), false);
  assert.equal(board.inArchive(baseCard({ status: 'done', terminalAt: '2026-06-17' }), { now }), true);
  assert.equal(board.inArchive(baseCard({ status: 'done', created: '2026-06-17' }), { now }), true);
  assert.equal(board.inArchive(baseCard({ status: 'done', created: '2026-06-18' }), { now }), false);
  assert.equal(board.inArchive(baseCard({ archived: true, status: 'open' }), { now }), true);
  assert.equal(board.inArchive(baseCard({ pinned: true, status: 'wont-do', terminalAt: '2026-06-01' }), { now }), false);
  assert.equal(board.inArchive(baseCard({ pinned: true, status: 'wont-do', created: '2026-06-01' }), { now }), false);
  assert.equal(board.inArchive(baseCard({ archived: true, pinned: true, status: 'wont-do', terminalAt: '2026-06-01' }), { now }), true);
});

test('normalizeGraduatedAt preserves, stamps, and reports stale dates', () => {
  const normalized = board.normalizeGraduatedAt(
    { 'frame-the-problem': '2026-06-01', stale: '2026-06-02' },
    ['frame-the-problem', 'write-the-one-pager'],
    { now: '2026-06-24' },
  );
  assert.deepEqual(plain(normalized.graduatedAt), {
    'frame-the-problem': '2026-06-01',
    'write-the-one-pager': '2026-06-24',
  });
  assert(normalized.errors.some(error => error.includes('stale slug stale')));
});

test('mergeCardsById replaces moved status and remains idempotent', () => {
  const bug = baseCard({
    id: 'wo-frame-the-problem-bug',
    priority: board.defaultPriority('bug'),
    status: 'open',
    title: 'Bug card',
    type: 'bug',
  });
  delete bug.checklist;
  const existing = [baseCard(), bug];
  const merged = board.mergeCardsById(
    existing,
    [baseCard({ status: 'done' })],
    { now: '2026-06-24' },
  );
  assert.deepEqual(plain(merged.map(card => card.id)), ['wo-frame-the-problem-testing', 'wo-frame-the-problem-bug']);
  assert.equal(merged.filter(card => card.id === 'wo-frame-the-problem-testing').length, 1);
  assert.equal(merged[0].status, 'done');
  assert.equal(merged[0].terminalAt, '2026-06-24');

  const repeated = board.mergeCardsById(merged, [merged[0]], { now: '2026-06-25' });
  assert.deepEqual(plain(repeated), plain(merged));
});

test('graduate removes a play from active board and restore moves it to live', () => {
  const state = {
    ready: ['frame-the-problem', 'write-the-one-pager'],
    stages: {
      backlog: ['write-the-one-pager'],
      sourced: [],
      designed: [],
      built: [],
      proven: [],
      live: ['frame-the-problem'],
    },
    graduated: [],
  };
  const graduated = board.graduatePlay(state, 'frame-the-problem');
  assert.deepEqual(plain(board.boardSlugs(graduated.stages)), ['write-the-one-pager']);
  assert.deepEqual(plain(graduated.ready), ['write-the-one-pager']);
  assert.deepEqual(plain(graduated.graduated), ['frame-the-problem']);
  assert(board.isDateOnly(graduated.graduatedAt['frame-the-problem']));

  const repeatedGraduate = board.graduatePlay(graduated, 'frame-the-problem');
  assert.deepEqual(plain(repeatedGraduate.graduated), ['frame-the-problem']);
  assert.deepEqual(plain(repeatedGraduate.graduatedAt), plain(graduated.graduatedAt));

  const restored = board.restoreGraduatedPlay(repeatedGraduate, 'frame-the-problem');
  assert.deepEqual(plain(restored.graduated), []);
  assert.deepEqual(plain(restored.graduatedAt), {});
  assert.deepEqual(plain(restored.stages.live), ['frame-the-problem']);

  const repeatedRestore = board.restoreGraduatedPlay(restored, 'frame-the-problem');
  assert.deepEqual(plain(repeatedRestore.stages.live), ['frame-the-problem']);
});
