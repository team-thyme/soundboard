import { useCallback, useSyncExternalStore } from 'react';
import { TypedEventTarget } from 'typescript-event-target';

export enum Theme {
    Default = 'default',
    Cirkeltrek = 'cirkeltrek',
    DefaultClassic = 'default-classic',
}

interface PreferencesRecord {
    theme: Theme;
    volume: number;
}

type Serialize<R> = {
    [K in keyof R]: (value: R[K]) => string;
};
type Deserialize<R> = {
    [K in keyof R]: (value: string) => R[K] | null;
};

class ChangeEvent<
    K extends keyof PreferencesRecord = keyof PreferencesRecord,
    V extends PreferencesRecord[K] = PreferencesRecord[K],
> extends Event {
    constructor(
        public readonly key: K,
        public readonly value: V,
    ) {
        super('change');
    }

    is<K2 extends K>(key: K2): this is ChangeEvent<K2, PreferencesRecord[K2]> {
        return this.key === key;
    }
}

interface PreferencesEvents {
    change: ChangeEvent;
}

class Preferences extends TypedEventTarget<PreferencesEvents> {
    private readonly preferences: PreferencesRecord;

    private static readonly NAMESPACE = 'soundboard.preferences';

    constructor() {
        super();
        this.preferences = {
            theme: Preferences.getPersistedPreference('theme') ?? Theme.Default,
            volume: Preferences.getPersistedPreference('volume') ?? 100,
        };

        window.addEventListener('storage', (event) => {
            if (event.key?.startsWith(`${Preferences.NAMESPACE}.`)) {
                const key = event.key.slice(Preferences.NAMESPACE.length + 1);
                if (!this.isPreferenceKey(key)) {
                    return;
                }

                const value = event.newValue;
                if (value === null) {
                    return;
                }

                const deserializedValue = Preferences.deserialize[key](value);
                if (deserializedValue === null) {
                    return;
                }

                this.setPreference(key, deserializedValue, false);
            }
        });
    }

    /**
     * Check if the given key is a valid preference key.
     */
    private isPreferenceKey<K extends keyof PreferencesRecord>(
        key: string,
    ): key is K {
        return key in this.preferences;
    }

    /**
     * Serializers for persisting preferences to localStorage.
     */
    private static serialize: Serialize<PreferencesRecord> = {
        theme(value) {
            return value;
        },
        volume(value) {
            return value.toString();
        },
    };

    /**
     * Deserializers for reading persisted preferences from localStorage.
     */
    private static deserialize: Deserialize<PreferencesRecord> = {
        theme(value) {
            return Object.values(Theme).find((v) => v === value) ?? null;
        },
        volume(value) {
            const volume = parseInt(value, 10);
            if (Number.isNaN(volume)) {
                return null;
            }
            return volume;
        },
    };

    private static getPersistedPreference<K extends keyof PreferencesRecord>(
        key: K,
    ): PreferencesRecord[typeof key] | null {
        const value = localStorage.getItem(`${this.NAMESPACE}.${key}`);
        if (value === null) {
            return null;
        }
        return this.deserialize[key](value);
    }

    private static setPersistedPreference<K extends keyof PreferencesRecord>(
        key: K,
        value: PreferencesRecord[K],
    ): void {
        localStorage.setItem(
            `${this.NAMESPACE}.${key}`,
            this.serialize[key](value),
        );
    }

    getPreference<K extends keyof PreferencesRecord>(
        key: K,
    ): PreferencesRecord[K] {
        return this.preferences[key];
    }

    setPreference<K extends keyof PreferencesRecord>(
        key: K,
        value: PreferencesRecord[K],
        persist = true,
    ): void {
        this.preferences[key] = value;
        this.dispatchTypedEvent('change', new ChangeEvent(key, value));
        if (persist) {
            Preferences.setPersistedPreference(key, value);
        }
    }
}

export const preferences = new Preferences();

/**
 * React hook to use a preference from the preferences store.
 */
export function usePreference<K extends keyof PreferencesRecord>(
    key: K,
): [PreferencesRecord[K], (value: PreferencesRecord[K]) => void] {
    const value = useSyncExternalStore(
        (onStoreChange) => {
            function handlePreferenceChange(event: ChangeEvent) {
                if (event.is(key)) {
                    onStoreChange();
                }
            }

            preferences.addEventListener('change', handlePreferenceChange);
            return () =>
                preferences.removeEventListener(
                    'change',
                    handlePreferenceChange,
                );
        },
        () => preferences.getPreference(key),
    );

    const setValue = useCallback((value: PreferencesRecord[K]) => {
        preferences.setPreference(key, value);
    }, []);

    return [value, setValue];
}
