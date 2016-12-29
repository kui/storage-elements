import * as u from "./utils";
import * as ah from "./area-handler";

declare interface NamableHTMLElement extends HTMLElement {
  name?: string;
}
declare interface FormComponentElement extends HTMLElement {
  name: string;

  value?: string;
  type?: string;
  checked?: boolean;

  // <select> element
  options?: HTMLOptionsCollection;
  length?: number;

  // <option> element
  selected?: boolean;
}

declare class Object {
  static entries<K, V>(o: { [key: K]: V }): Array<[K, V]>
}

// See https://www.w3.org/TR/html5/infrastructure.html#htmloptionscollection
declare class HTMLOptionsCollection extends HTMLCollection<HTMLOptionElement> {
}

type Name = string

// TODO use Map<string, Array<string>>
declare type Values = { [key: Name]: Array<string> };
// TODO use Map<string, Array<?{ newValue: ?string, oldValue: ?string }>>
declare type ValueChanges = { [key: Name]: Array<?[?string, ?string]> };

declare type FormElements = u.MultiValueMap<Name, FormComponentElement>;

export default class HTMLStorageFormElement extends HTMLFormElement {
  values: Values;
  syncTask: ?number;
  formElements: FormElements;
  scanIntervalMillis: number;
  scanTask: ?u.CancellablePromise<void>;

  constructor() {
    super();
  }

  createdCallback() {
    this.values = {};
    this.formElements = new u.MultiValueMap();
    this.scanIntervalMillis = 700;

    this.addEventListener("submit", (event) => {
      event.preventDefault();
      this.store();
    });
    this.startPeriodicalScan();
  }

  async attachedCallback() {
    await this.scanFormComponents();
    this.startPeriodicalScan();
  }

  detachedCallback() {
    if (this.storageSyncTask != null)
      clearTimeout(this.storageSyncTask);
    this.stopPeriodicalScan();
  }

  async startPeriodicalScan() {
    if (this.scanTask != null) return;
    while (true) { // this loop will break by stopPeriodicalScan()
      this.scanTask = u.sleep(this.scanIntervalMillis);
      await this.scanTask;
      await this.scanFormComponents();
    }
  }

  stopPeriodicalScan() {
    if (this.scanTask == null) return;
    this.scanTask.cancell();
    this.scanTask = null;
  }

  async scanFormComponents() {
    const currentElements: Set<FormComponentElement> =
          new Set(Array.from(this.elements).filter((e: NamableHTMLElement) => e.name));
    const added = u.subtractSet(currentElements, this.getFormElementSet());
    this.formElements = Array.from(currentElements).reduce((map: FormElements, e) => {
      const name: string = e.name;
      map.add(name, e);
      return map;
    }, new u.MultiValueMap());

    if (added.size === 0) return;

    added.forEach(this.initComponent, this);

    const addedNames: Array<string> = Array.from(added).map(e => e.name);
    await this.load(addedNames);
    await this.store(addedNames);
  }

  getFormElementSet(): Set<FormComponentElement> {
    return Array.from(this.formElements.values())
      .reduce((set, elements) => {
        elements.forEach(set.add, set);
        return set;
      }, new Set());
  }

  initComponent(e: FormComponentElement) {
    console.debug("initComponent: %o", e);
    // set some of event listener
  }

  /// partial load if `names` was provided
  async load(names?: Array<string>) {
    console.debug("load: %o", names == null ? "all" : names);

    const storageValues = await this.readStorageAll();
    console.debug("read stored values: %o", storageValues);

    const storageChanges =  this.diffValues(storageValues, this.values);
    console.debug("stored value changes: %o", storageChanges);

    // Write/Update all
    if (names == null) {
      this.values = storageValues;
      this.writeForm(storageChanges);
      return;
    }

    // partial load
    // Write/Update values specified by "names"
    const subChanges = {};
    for (const n of names) {
      this.values[n] = storageValues[n];
      subChanges[n] = storageChanges[n];
    }
    this.writeForm(subChanges);
  }

  /// partial store if `names` was provided
  async store(names?: Array<string>) {
    console.debug("store: %o", names == null ? "all" : names);

    const formValues = this.readFormAll();
    console.debug("read form values: %o", formValues);

    const formChanges = this.diffValues(formValues, this.values);
    console.debug("form changes: %o", formChanges);

    // Store/Update all
    if (names == null) {
      this.values = formValues;
      await this.writeStorage(formChanges);
      return;
    }

    // partial store
    // Store/Update values specified by "names"
    const subChanges = {};
    for (const n of names) {
      this.values[n] = formValues[n];
      subChanges[n] = formChanges[n];
    }
    await this.writeStorage(subChanges);
  }

  diffValues(newValues: Values, oldValues: Values): ValueChanges {
    const names: Array<string> = u.dedup(Object.keys(newValues).concat(Object.keys(oldValues)));
    return names.reduce((result: ValueChanges, name: string): ValueChanges => {
      if (newValues[name] == null) newValues[name] = [];
      if (oldValues[name] == null) oldValues[name] = [];
      result[name] = [];
      const len = Math.max(newValues[name].length, oldValues[name].length);
      for (let i = 0; i < len; i++) {
        const newValue = newValues[name][i];
        const oldValue = oldValues[name][i];
        result[name][i] = newValue === oldValue ? null : [newValue, oldValue];
      }
      return result;
    }, {});
  }

  async readStorageAll(): Promise<Values> {
    // start all data fatching at first
    const ps = this.getNames().reduce((values, name): { [key: string]: Promise<Array<string>> } => {
      values[name] = this.readStorageByName(name);
      return values;
    }, {});

    // resolve promises
    const result = {};
    for (const [name, promise] of Object.entries(ps)) {
      result[name] = await promise;
    }

    return result;
  }

  async readStorageByName(name: string): Promise<Array<string>> {
    const v = await this.getAreaHandler().read(name);
    return v == null ? [] : [v];
  }

  writeForm(changes: ValueChanges) {
    for (const [name, changeArray] of Object.entries(changes)) {
      const change = changeArray[0];
      const [newValue] = change == null ? [] : change;
      const elements = this.formElements.get(name);

      if (elements == null) continue;

      console.debug("write to form: name=%s, value=%s, elements=%o", name, newValue, elements);

      elements.forEach((e) => {
        if (e.type === "checkbox" || e.type === "radio") {
          e.checked = newValue === e.value;
          return;
        }

        if (e.value != null) {
          if (newValue == null) return;
          e.value = newValue;
          return;
        }

        console.error("Unsupported element: %o", e);
      });
    }
  }

  async writeStorage(changes: ValueChanges) {
    const handler = this.getAreaHandler();
    const promises = Object.entries(changes).map(async ([name, chageArray]) => {
      const c = chageArray[0];
      if (c == null) return;
      const [newValue] = c;

      console.debug("write to storage: name=%s, value=%s", name, newValue);

      if (newValue == null) {
        await handler.removeItem(name);
      } else {
        await handler.write(name, newValue);
      }
    });
    await Promise.all(promises);
  }

  readFormAll(): Values {
    return Array.from(this.formElements.flattenValues())
      .reduce((items: Values, element) => {
        if (element.value == null) return items;

        const n = element.name;
        if (items[n] == null) items[n] = [];

        if (element.type === "checkbox" || element.type === "radio") {
          if (element.checked) items[n].unshift(element.value);
          return items;
        }

        // expand a <select> element to <option> elements.
        if (element.options != null) {
          const vals = items[n];
          for (const opt of element.options) {
            if (!opt.selected) continue;
            vals.unshift(opt.value);
          }
          return items;
        }

        items[n].unshift(element.value);
        return items;
      }, {});
  }

  getNames(): Array<string> {
    return Array.from(this.formElements.flattenValues())
      .reduce((names, e) => {
        names.unshift(e.name);
        return names;
      }, []);
  }

  getAreaHandler(): ah.AreaHandler {
    const a: ?ah.Area = this.getArea();
    if (!a) throw Error("\"area\" attribute is required");

    const h = ah.findHandler(a);
    if (!h) throw Error(`Unsupported area: "${a}"`);
    return h;
  }

  getArea(): ?ah.Area {
    const a = this.getAttribute("area");
    if (a) return a;
    return null;
  }

  async sync(): Promise<void> {
    const d = this.getSyncDelay();
    if (d == null) return Promise.reject(Error("Require positive integer value 'sync-delay' attribute"));
    if (d <= 0) return Promise.reject(Error(`Require positive number for "sync-delay": ${d}`));

    await u.sleep(d);

    if (!this.isAutoSyncEnabled()) {
      return;
    }

    return this.store();
  }

  isAutoSyncEnabled(): boolean {
    return this.hasAttribute("sync") && this.getSyncDelay() !== null;
  }

  getSyncDelay() {
    const a = this.getAttribute("sync-delay");
    if (!a) return null;
    const d = parseInt(a);
    if (d <= 0) return null;
    return d;
  }

  async periodicalSync() {
    while (this.isAutoSyncEnabled()) {
      await this.sync();
    }
  }

  static get observedAttributes() {
    return [
      "sync",
      "sync-delay",
      // "area",
    ];
  }

  attributeChangedCallback(attrName: string) {
    if (attrName === "sync" ||
        attrName === "sync-delay") {
      this.startSync();
    }
  }
}
