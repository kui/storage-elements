// @flow

import StorageBinder from "./storage-binder";
import * as ah from "./area-handler";

import type { BindeeElement } from "./storage-binder";

interface AreaSelect extends HTMLSelectElement {
  area: string;
}

interface InternalAreaSelect extends AreaSelect {
}

export function mixinAreaSelect<T: HTMLSelectElement>(c: Class<T>): Class<T & AreaSelect> {
  // $FlowFixMe Force cast to the returned type.
  return class extends c {
    binder: StorageBinder;

    get area(): ah.Area { return getAttr(this, "area"); }
    set area(v: any) { this.setAttribute("area", v); }

    constructor() {
      super();
    }

    createdCallback() {
      this.binder = new StorageBinder(generateBindee(this));
      observeValue(this, async () => {
        writeArea(this);
        await this.binder.submit();
      });
    }

    attachedCallback() {
      if (this.length === 0) addAllHandlers(this);
      this.binder.doAutoTask();
      writeArea(this);
    }

    static get observedAttributes() { return ["area"]; }
    attributeChangedCallback(attrName: string) {
      switch (attrName) {
      case "area":
        this.binder.init();
        this.binder.doAutoTask();
        break;
      }
    }

    sync() {
      if (!this.binder) return Promise.resolve();
      return this.binder.sync();
    }
  };
}

const mixedSelect = mixinAreaSelect(HTMLSelectElement);
export default class HTMLAreaSelectElement extends mixedSelect {
  static get extends() { return "select"; }
}

function generateBindee(self: InternalAreaSelect): BindeeElement {
  return {
    getArea: () => self.area,
    getInterval: () => 700,
    isAutoSync: () => true,
    isAutoLoad: () => false,
    getNames: () => [self.name],
    getElements: () => [self],
  };
}

function observeValue(self: InternalAreaSelect, onChange: () => Promise<void>) {
  let value = self.value;
  (async () => {
    while (true) {
      await waitAnimationFrame();
      if (self.value === value) continue;
      value = self.value;
      await onChange();
    }
  })();
}

function waitAnimationFrame() {
  return new Promise((r) => requestAnimationFrame(r));
}

function writeArea(self: InternalAreaSelect) {
  const form = self.form;
  if (form == null) return;
  form.setAttribute("area", self.value);
}

function addAllHandlers(self: InternalAreaSelect) {
  for (const [area] of ah.listHandlers()) {
    const o = document.createElement("option");
    o.innerHTML = area;
    self.appendChild(o);
  }
}

function getAttr(self: HTMLElement, name: string): string {
  const v = self.getAttribute(name);
  return v ? v : "";
}
