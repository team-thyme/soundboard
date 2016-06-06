import store2 from 'store2';
import EventEmitter from 'events';

const STORE_NAMESPACE = 'soundboard';

const DEFAULT_SETTINGS = {
  theme: 'default',
};

class SettingsManager extends EventEmitter {

  store;

  constructor() {
    // Init store with namespace
    this.store = store2.namespace(STORE_NAMESPACE);
    // Set default settings, without overwrite
    this.store.setAll(DEFAULT_SETTINGS, false);
  }

  set(key, value, overwrite = true) {
    this.emit(key, value);
    return this.store.set(key, value, overwrite);
  }

  get(key) {
    return this.store.get(key);
  }

  getAll() {
    return this.store.getAll();
  }

  setAll(settings) {
    Object.keys(settings).forEach((key) => {
      this.emit(key, settings[key]);
    });

    this.store.setAll(settings);
  }

}

export default SettingsManager;
