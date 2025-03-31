export class Option<T> {
    private internalValue: T | null;

    private constructor(v: T | null) {
        this.internalValue = v;
    }

    static some<T>(v: T): Option<T> {
        return new Option(v);
    }

    static none<T>(): Option<T> {
        return new Option<T>(null);
    }

    static wrap<T>(v: T | undefined): Option<T> {
        if (v === undefined) {
            return new Option<T>(null);
        } else {
            return new Option<T>(v);
        }
    }

    unwrap(): T | null {
        return this.internalValue;
    }

    run<U, BindArgs extends Array<any>, Bind extends (_: Option<T>, ...args: BindArgs) => Option<U>>(
        transform: Bind,
        ...bindArgs: BindArgs
    ): Option<U> {
        return transform(this, ...bindArgs);
    }

    isSome(): boolean {
        return this.internalValue !== null;
    }

    isNone(): boolean {
        return this.internalValue === null;
    }
}
