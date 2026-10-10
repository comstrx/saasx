
export type Unsubscribe = () => void;

export function createSignal<T = void> () {

    const listeners = new Set<( value: T ) => void>();

    return {
        get size (): number {

            return listeners.size;

        },
        subscribe ( listener: ( value: T ) => void ): Unsubscribe {

            listeners.add(listener);

            return () => { listeners.delete(listener); };

        },
        emit ( value: T ): void {

            for ( const listener of [...listeners] ) {

                try {

                    listener(value);

                }
                catch {}

            }

        },
    };

}
export function createTopics<K, T = void> () {

    const topics = new Map<K, ReturnType<typeof createSignal<T>>>();

    return {
        subscribe ( key: K, listener: ( value: T ) => void ): Unsubscribe {

            const topic = topics.get(key) ?? createSignal<T>();
            const release = topic.subscribe(listener);

            topics.set(key, topic);

            return () => {

                release();
                if ( !topic.size && topics.get(key) === topic ) topics.delete(key);

            };

        },
        emit ( key: K, value: T ): void {

            topics.get(key)?.emit(value);

        },
    };

}
