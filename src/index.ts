///////////////////////////////////////////////////////////////////
/*! UAClientHints.js
    Parse & serialize user-agent client hints (UA-CH) HTTP headers
    https://github.com/faisalman/ua-client-hints-js
    Author: Faisal Salman <f@faisalman.com>
    MIT License */
///////////////////////////////////////////////////////////////////

const FIELD_TYPE = {
    Boolean : 'sf-boolean',
    List    : 'sf-list',
    String  : 'sf-string'
} as const;

const UACH_MAP = {
    architecture : {
        field   : 'Sec-CH-UA-Arch', 
        type    : FIELD_TYPE.String
    },
    bitness : {
        field   : 'Sec-CH-UA-Bitness', 
        type    : FIELD_TYPE.String
    },
    brands : {
        field   : 'Sec-CH-UA', 
        type    : FIELD_TYPE.List
    },
    formFactor : {
        field   : 'Sec-CH-UA-Form-Factor', 
        type    : FIELD_TYPE.String
    },
    fullVersionList : {
        field   : 'Sec-CH-UA-Full-Version-List', 
        type    : FIELD_TYPE.List
    },
    mobile : {
        field   : 'Sec-CH-UA-Mobile', 
        type    : FIELD_TYPE.Boolean
    },
    model : {
        field   : 'Sec-CH-UA-Model', 
        type    : FIELD_TYPE.String
    },
    platform : {
        field   : 'Sec-CH-UA-Platform',
        type    : FIELD_TYPE.String
    }, 
    platformVersion : {
        field   : 'Sec-CH-UA-Platform-Version', 
        type    : FIELD_TYPE.String
    },
    wow64 : {
        field   : 'Sec-CH-UA-WOW64',
        type    : FIELD_TYPE.Boolean
    }
} as const;

type UACHBrowser = {
    brand: string | null,
    version: string | null
};
type UACHDataType = boolean | string | string[] | UACHBrowser[] | null | undefined;
type UACHDataField = keyof typeof UACH_MAP;
type UACHHeaderType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];
type UACHHeaderField = Lowercase<typeof UACH_MAP[keyof typeof UACH_MAP]['field']>;

export class UAClientHints {

    private uaCHData: Record<UACHDataField, UACHDataType> = {
        architecture : null,
        bitness: null,
        brands: null,
        formFactor: null,
        fullVersionList: null,
        mobile: null,
        model: null,
        platform: null,
        platformVersion: null,
        wow64: null
    };

    constructor () {
        return this;
    }

    getValues(fields?: UACHDataField[]): Partial<Record<string, UACHDataType>> {
        let values: any = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.uaCHData.hasOwnProperty(prop)) {
                values[prop] = this.uaCHData[<UACHDataField>prop];
            }
        }
        return values;
    }

    getValuesAsHeaders(fields?: UACHDataField[]): Partial<Record<UACHHeaderField, string>> {
        let values: any = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.uaCHData.hasOwnProperty(prop)) {
                const { field, type } = UACH_MAP[<UACHDataField>prop];
                values[field] = this.serializeHeader(this.uaCHData[<UACHDataField>prop], type);
            }
        }
        return values;
    }

    setValues(values?: Partial<Record<string, UACHDataType>>): UAClientHints {
        for (const key in values) {
            if (this.uaCHData.hasOwnProperty(key)) {
                const val = values[key];
                if (this.isValidType(val, UACH_MAP[<UACHDataField>key].type)) {
                    this.uaCHData[<UACHDataField>key] = val; 
                }
            };
        }
        return this;
    }

    setValuesFromHeaders(headers: Partial<Record<UACHHeaderField, string>>): UAClientHints {
        if(Object.keys(headers).some(prop => prop.startsWith('sec-ch-ua'))) {
            for (const key in UACH_MAP) {
                const { field, type } = UACH_MAP[<UACHDataField>key];
                const headerField = <UACHHeaderField>field.toLowerCase();
                if (headers.hasOwnProperty(headerField)) {
                    this.uaCHData[<UACHDataField>key] = this.parseHeader(headers[headerField], type);
                }
            }
        }
        return this;
    }

    private parseHeader(str: string | undefined, type: UACHHeaderType): UACHDataType {
        if (!str) {
            return null;
        }
        switch (type) {
            case FIELD_TYPE.Boolean:
                return /\?1/.test(str);
            case FIELD_TYPE.List:
                if (!str.includes(';')) {
                    return str.split(',').map(str => str.trim().replace(/\\?\"/g, ''));
                }
                return str.split(',')
                            .map(brands => {
                                const match = /\\?\"(.+)?\\?\".+\\?\"(.+)?\\?\"/.exec(brands)
                                return {
                                    brand : match ? match[1] : null,
                                    version : match ? match[2] : null
                                };
                });
            case FIELD_TYPE.String:
                return str.replace(/\s*\\?\"\s*/g, '');
            default:
                return null;
        }
    }

    private serializeHeader(data: UACHDataType | undefined, type: UACHHeaderType): string {
        if (!data) {
            return '';
        }
        switch (type) {
            case FIELD_TYPE.Boolean:
                return data ? '?1' : '?0';
            case FIELD_TYPE.List:
                if (!(<any[]>data).some(val => typeof val === 'string')) {
                    return (<UACHBrowser[]>data).map(browser => `"${browser.brand}"; v="${browser.version}"`).join(', ');
                }
                return (<string[]>data).join(', ');
            case FIELD_TYPE.String:
                return `"${data}"`;
            default:
                return '';
        }
    }

    private isValidType(data: UACHDataType, type: UACHHeaderType): boolean {
        switch (type) {
            case FIELD_TYPE.Boolean:
                return typeof data === 'boolean';
            case FIELD_TYPE.List:
                return Array.isArray(data);
            case FIELD_TYPE.String:
                return typeof data === 'string';
            default:
                return false;
        }
    }
}