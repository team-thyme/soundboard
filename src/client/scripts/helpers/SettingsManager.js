import store2 from 'store2';

const STORE_NAMESPACE = 'soundboard';

class SettingsManager {

  store;

  constructor() {
    this.store = store2.namespace(STORE_NAMESPACE);
  }

  set(key, val, overwrite = true) {
    return this.store.set(key, val, overwrite);
  }

  get(key, alt) {
    return this.store.get(key, alt);
  }

}

export default SettingsManager;
