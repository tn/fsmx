type FsmxEvent = (from: string, to: string) => void

interface IFsmxEvents {
  onLeaveState?: FsmxEvent
  onEnterState?: FsmxEvent
}

interface IFsmxSchemaItem {
  from: string | string[]
  to: string
}

type FsmxInitialState = string
type FsmxActions = {
  [key: string]: { from: string | string[], to: string }
}

interface FsmxInitialOptions {
  initial: FsmxInitialOptions
  actions: FsmxActions
  events?: IFsmxEvents
}

const errors = {
  noInitialState: 'No initial state defined',
  invalidTypeOfState: 'Initial state should be string',
  noActions: 'No actions defined',
  cantTransit: 'Can\'t transit to target'
}

class Fsmx {
  initial: FsmxInitialState
  events: IFsmxEvents
  schema: IFsmxSchemaItem[]

  state: string = null

  constructor (options: FsmxInitialOptions) {
    if (!options.initial) {
      throw new Error(errors.noInitialState)
    }

    if (typeof options.initial !== 'string') {
      throw new TypeError(errors.invalidTypeOfState)
    }

    if (!options.actions || !Object.keys(options.actions).length) {
      throw new Error(errors.noActions)
    }

    this.initial = options.initial
    this.state = this.initial
    this.events = options.events
    this.schema = []

    this.buildSchema(options.actions)
  }

  public async transit (from: string | string[], to: string) {
    if (this.can(to)) {
      await this.emit('onLeaveState', from, to)
      this.state = to
      await this.emit('onEnterState', from, to)
    } else {
      throw new Error(errors.cantTransit)
    }
  }

  private async emit (event: string, ...params: any) {
    if (typeof this.events[event] === 'function') {
      await this.events[event](...params)
    }
  }

  private buildSchema (actions: FsmxActions) {
    Object.keys(actions).forEach(action => {
      this.schema.push({
        from: actions[action].from,
        to: actions[action].to
      })

      this[action] = async () => {
        await this.transit(actions[action].from, actions[action].to)
      }
    })
  }

  public can (stateName: string) {
    const found = this.schema.find(s => {
      const fromMatch = typeof s.from === 'string' ? s.from === this.state : s.from.includes(this.state)
      const toMatch = s.to === stateName
      return fromMatch && toMatch
    })

    return found ? true : false
  }

  public is (stateName: string) {
    return this.state === stateName
  }

  public reset () {
    this.state = this.initial
  }
}

export default Fsmx
