import { TypedEventTarget } from "typescript-event-target";

interface ControlsEvents {
  moved: CustomEvent;
}

export class ControlsEventTarget extends TypedEventTarget<ControlsEvents> {
  onMove() {
    this.dispatchTypedEvent("moved", new CustomEvent("moved"));
  }
}
