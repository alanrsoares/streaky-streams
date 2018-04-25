import BaseStream from "./BaseStream";

export default class DOMStream extends BaseStream {
  eventName: string;
  target: HTMLElement;
  subscription: ?EventListener;

  constructor(eventName: string, target: HTMLElement) {
    super();

    this.eventName = eventName;
    this.target = target;
    this.subscription = null;
  }

  subscribe(fn: (SyntheticEvent<EventTarget>) => void) {
    this.subscription = this.handleSubscription(fn);
    this.target.addEventListener(this.eventName, this.subscription);
    return this;
  }

  unsubscribe() {
    this.target.removeEventListener(this.eventName, this.subscription);
    return this;
  }
}
