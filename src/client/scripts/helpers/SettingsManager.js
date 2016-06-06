import store2 from 'store2';
import { EventEmitter } from 'events';

const STORE_NAMESPACE = 'soundboard';

class SettingsManager {

  store;

  eventEmitter;

  constructor() {
    this.store = store2.namespace(STORE_NAMESPACE);
    this.eventEmitter = new EventEmitter();
  }

  set(key, value, overwrite = true) {
    this.eventEmitter.emit(key, value);
    return this.store.set(key, value, overwrite);
  }

  get(key, alt) {
    return this.store.get(key, alt);
  }

  getAll() {
    return {
      theme: this.store.get('theme', 'default'),
    };
  }

  setAll(settings) {
    Object.keys(settings).forEach((key) => {
      this.eventEmitter.emit(key, settings[key]);
    });

    this.store.setAll(settings);
  }

  on(key, callback) {
    this.eventEmitter.on(key, callback);
  }

}

export default SettingsManager;
