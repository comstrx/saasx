export type ApiErrorFields = Record<string, string[]>;

type ApiErrorInit = {
    status: number;
    code: string;
    message: string;
    fields?: ApiErrorFields;
};

export class ApiError extends Error {

    readonly status: number;
    readonly code: string;
    readonly fields?: ApiErrorFields;

    constructor ({ status, code, message, fields }: ApiErrorInit) {

        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.fields = fields;

        Object.setPrototypeOf(this, new.target.prototype);

    }
    get isNetwork () {

        return this.status === 0;

    }
    get isAuth () {

        return this.status === 401;

    }
    get isValidation () {

        return this.status === 422 && !!this.fields;

    }
    get isServer () {

        return this.status >= 500;

    }

}
export function isApiError ( value: unknown ): value is ApiError {

    return value instanceof ApiError;

}
