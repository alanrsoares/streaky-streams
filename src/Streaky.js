// @flow

import DOMStream from "./DOMStream";

export default class Stream {
  static fromEvent(eventName: string, target: HTMLElement) {
    return new DOMStream(eventName, target);
  }
}
