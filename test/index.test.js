import test from 'ava'
import fsm from '../src/index'

test('Check initial params', t => {
  try {
    fsm({})
  } catch (e) {
    t.true(e instanceof Error)
    t.regex(e.message, /No initial state defined/)
  }

  try {
    fsm({
      initial: 123
    })
  } catch (e) {
    t.true(e instanceof TypeError)
    t.regex(e.message, /Initial state should be string/)
  }

  try {
    fsm({
      initial: 'foo',
    })
  } catch (e) {
    t.true(e instanceof Error)
    t.regex(e.message, /No actions defined/)
  }
})

test.beforeEach(async (t) => {
  t.context.data = fsm({
    initial: 'initial',
    actions: {
      waitForCmd: {from: ['initial', 'end', 'error'], to: 'wait'},
      listenForCmd: {from: 'wait', to: 'listen'},
      collectData: {from: 'listen', to: 'calculate'},
      giveAnswer: {from: 'calculate', to: 'speak'},
      endCmd: {from: 'speak', to: 'end'},
      wrongWay: {from: 'calculate', to: 'error'}
    },
    events: {
      onLeaveState: async function onLeaveState () {
  
      },
      onEnterState: async function onEnterState () {

      },
    }
  })
})

// Functions
test('Methods should be available', t => {
  t.true(typeof t.context.data.can === 'function')
  t.true(typeof t.context.data.is === 'function')
  t.true(typeof t.context.data.reset === 'function')
  t.true(typeof t.context.data._transit === 'function')
  t.true(typeof t.context.data._emit === 'function')
})

test('should create states schema', t => {
  t.true(Array.isArray(t.context.data.schema))
  t.is(t.context.data.schema.length, 6)
})

test('should define events', t => {
  t.true(typeof t.context.data.events.onLeaveState === 'function')
  t.true(typeof t.context.data.events.onEnterState === 'function')
})

test('should return initial value', t => {
  t.is(t.context.data.initial, 'initial')
  t.is(t.context.data.state, 'initial')
})

test('should can check state', t => {
  t.true(typeof t.context.data.can('wait') === 'boolean')
  t.is(t.context.data.can('wait'), true)
})

test('should can check current state', t => {
  t.true(typeof t.context.data.is('initial') === 'boolean')
  t.is(t.context.data.is('initial'), true)
})

test('should transit to another state', async t => {
  await t.context.data.waitForCmd()
  t.is(t.context.data.state, 'wait')

  await t.context.data.listenForCmd()
  t.is(t.context.data.state, 'listen')

  await t.context.data.collectData()
  t.is(t.context.data.state, 'calculate')

  await t.context.data.wrongWay()
  t.is(t.context.data.state, 'error')

  await t.context.data.waitForCmd()
  t.is(t.context.data.state, 'wait')

  await t.context.data.listenForCmd()
  t.is(t.context.data.state, 'listen')

  await t.context.data.collectData()
  t.is(t.context.data.state, 'calculate')

  await t.context.data.giveAnswer()
  t.is(t.context.data.state, 'speak')

  await t.context.data.endCmd()
  t.is(t.context.data.state, 'end')

  await t.context.data.waitForCmd()
  t.is(t.context.data.state, 'wait')
})

test('should reset fsm', async t => {
  await t.context.data.waitForCmd()
  t.is(t.context.data.state, 'wait')
  await t.context.data.reset()
  t.is(t.context.data.state, 'initial')
})

test('should return error if transit can\'t possible', async t => {
  try {
    await t.context.data._transit('kek', 'pek')
  } catch (e) {
    t.true(e instanceof Error)
    t.regex(e.message, /Can't transit to target/)
  }
})

test('should trigger event on state leave', async t => {
  let f1 = fsm({
    initial: 'initial',
    actions: {
      start: {from: 'initial', to: 'start'},
      end: {from: 'start', to: 'end'}
    },
    events: {
      async onLeaveState (from, to) {
        t.is(from, 'initial')
        t.is(to, 'start')
      }
    },
  })

  await f1.start()
  t.is(f1.state, 'start')
})

test('should trigger event on state enter', async t => {
  let f2= fsm({
    initial: 'initial',
    actions: {
      start: {from: 'initial', to: 'start'},
      end: {from: 'start', to: 'end'}
    },
    events: {
      async onEnterState(from, to) {
        t.is(from, 'initial')
        t.is(to, 'start')
      }
    }
  })

  await f2.start()
  t.is(f2.state, 'start')
})

test.todo('should return empty history on init')
test.todo('should can back from history')
test.todo('should can forward from history')
test.todo('should can clear the history')
test.todo('should return error if history is empty')
test.todo('should clean history if limit has been reached')
