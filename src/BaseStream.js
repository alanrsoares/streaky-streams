export default class BaseStream {
  constructor() {
    this.debounceTimeout = 0;
    this.debounceId = null;

    this.middlewares = [];
    this.middlewareMap = {
      map(event, middleware) {
        if (!event.complete) {
          return {
            value: middleware.fn(event.value),
            complete: false
          };
        }

        return event;
      },
      filter(eventt, middleware) {
        if (middleware.fn(event.value)) {
          return event;
        }

        return {
          ...event,
          complete: true
        };
      },
      reduce(event, middleware) {
        if (!event.complete) {
          const next =
            middleware.ctx === undefined ? middleware.seed : middleware.ctx;

          middleware.ctx = middleware.fn(next, event.value);

          return {
            value: middleware.ctx,
            complete: false
          };
        }

        return event;
      }
    };
  }

  registerMiddleware(config) {
    this.middlewares.push(config);
    return this;
  }

  handleSubscription = handler => value => {
    this.subscriptionHandler = handler;

    const runSub = () => {
      const nextEvent = this.middlewares.reduce(
        (acc, middleware) =>
          this.middlewareMap[middleware.type](acc, middleware),
        { value, complete: false }
      );

      if (!nextEvent.complete) {
        return this.subscriptionHandler(nextEvent.value);
      }
    };

    if (this.debounceTimeout) {
      window.clearTimeout(this.debounceId);
      this.debounceId = window.setTimeout(runSub, this.debounceTimeout);
    } else {
      runSub();
    }
  };

  map(fn) {
    return this.registerMiddleware({ type: "map", fn });
  }

  filter(fn) {
    return this.registerMiddleware({ type: "filter", fn });
  }

  reduce(fn) {
    return this.registerMiddleware({ type: "reduce", fn, seed, ctx: null });
  }

  debounce(time) {
    this.debounceTimeout = time;
    return this;
  }

  throttle(time) {
    return this.reduce(
      ({ last }, value) => {
        const now = Date.now();
        const elapsed = now - last;

        return !elapsed || elapsed > time
          ? { last: now, elapsed: 0, value }
          : { last, elapsed, value };
      },
      { last: 0, elapsed: 0, value: null }
    )
      .filter(ctx => !ctx.elapsed)
      .map(ctx => ctx.value);
  }
}
