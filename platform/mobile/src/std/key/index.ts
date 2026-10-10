let sequence = 0;

const held = new Map<string, string>();

class Key {

    attempt ( scope: string ): string {

        sequence += 1;

        return `${ scope }-${ Date.now().toString(36) }-${ sequence.toString(36) }`;

    }
    hold ( scope: string ): string {

        const kept = held.get(scope);

        if ( kept ) return kept;

        const minted = this.attempt(scope);

        held.set(scope, minted);

        return minted;

    }
    release ( scope: string ) {

        held.delete(scope);

    }

}

export const key = new Key();
