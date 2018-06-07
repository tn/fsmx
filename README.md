# FSMX
Simple Finite State Machine based on async/await events and actions

## Documentation
### Setup
```
import fsmx from 'fsmx'

const fsm = fsmx({
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
        async onLeaveState (from, to) {
            // do something asynchronous
        },
        async onEnterState (from, to) {
            // do something asynchronous
        }
    },
    log: true
})
```

### Initial parameters
| Name           | Type          | Default   | Required |
|----------------|---------------|-----------|----------|
| initial        | String        | undefined | yes      |
| actions        | Object        | undefined | yes      |
| actions[].from | Array, String | -         | yes      |
| actions[].to   | String        | -         | yes      |
| events         | Object        | {}        | no       |
| log            | Boolean       | false     | no       |

### Methods
`fsm.is('initial')` - check the current state
`fsm.can('wait')` - check possibility to transition to some state from the current state
`fsm.reset()` - reset the current state to initial
```
// Calling actions to transition between states
(async () => {
    await fsm.waitForCmd()
    await fsm.listenForCmd()
    // ...
})()
```

## Scripts
`npm start` - development
`npm test` - tests
`npm run test:watch` - tests with watch flag
`npm run build` - build
