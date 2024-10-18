"use client";

export class ControlsEventTarget extends EventTarget {
  constructor() {
    super();
  }

  onMove() {
    this.dispatchEvent(new CustomEvent("moved"));
  }
}
