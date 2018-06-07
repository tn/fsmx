import Log from './log'

/**
 * @param {String} initial
 * @param {Object} actions
 * @param {Object} events
 * @param {Boolean} log
 */
export default ({
  initial,
  actions,
  events = {},
  log = false
}) => {
  if (!initial) {
    throw new Error('No initial state defined')
  }

  if (typeof initial !== 'string') {
    throw new TypeError('Initial state should be string')
  }

  if (!actions) {
    throw new Error('No actions defined')
  }

  function mixin (target) {
    target.prototype.initial = initial
    target.prototype.state = initial
    target.prototype.events = events
    target.prototype.schema = []
    
    Object.keys(actions).forEach(action => {
      target.prototype.schema.push({
        from: actions[action].from,
        to: actions[action].to
      })
      
      target.prototype[action] = async () => {
        await target.prototype._transit(actions[action].from, actions[action].to)
      }
    })

    return () => {
      return new target()
    }
  }

  @mixin
  class Fsmx {
    @Log('transit', log)
    async _transit (from, to) {
      if (this.can(to)) {
        await this._emit('onLeaveState', from, to)
        this.state = to
        await this._emit('onEnterState', from, to)
      } else {
        throw new Error('Can\'t transit to target')
      }
    }

    @Log('emit', log)
    async _emit (event, ...params) {
      if (typeof this.events[event] === 'function') {
        await this.events[event](...params)
      }
    }

    @Log('can', log)
    can (stateName) {
      let found = this.schema.find(s => {
        let fromMatch = typeof s.from === 'string' ? s.from === this.state : s.from.includes(this.state)
        let toMatch = s.to === stateName
        return fromMatch && toMatch
      })

      return found ? true : false
    }

    @Log('is', log)
    is (stateName) {
      return this.state === stateName
    }

    @Log('reset', log)
    reset () {
      this.state = this.initial
    }

    get state () {
      return this._state
    }

    set state (stateName) {
      this._state = stateName
    }
  }

  return new Fsmx()
}
