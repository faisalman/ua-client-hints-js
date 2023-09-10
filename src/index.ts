///////////////////////////////////////////////////////////////////
/*! UAClientHints.js 0.1.2
    Parse & serialize user-agent client hints (UA-CH) HTTP headers
    https://github.com/faisalman/ua-client-hints-js
    Author: Faisal Salman <f@faisalman.com>
    MIT License */
///////////////////////////////////////////////////////////////////

/// <reference types="user-agent-data-types" />

export enum FIELD_TYPE {
    Boolean = 'sf-boolean',
    List    = 'sf-list',
    String  = 'sf-string'
};

export const UACH_MAP = {
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

export type UACHDataType = boolean | string | string[] | NavigatorUABrandVersion[] | null | undefined;
export type UACHDataField = keyof typeof UACH_MAP;
export type UACHHeaderType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];
export type UACHHeaderField = Lowercase<typeof UACH_MAP[keyof typeof UACH_MAP]['field']>;

export class UAClientHints {

    private architecture?: string = undefined;
    private bitness?: string = undefined;
    private brands?: NavigatorUABrandVersion[] = undefined;
    private formFactor?: string[] = undefined;
    private fullVersionList?: NavigatorUABrandVersion[] = undefined;
    private mobile?: boolean = undefined;
    private model?: string = undefined;
    private platform?: string = undefined;
    private platformVersion?: string = undefined;
    private wow64?: boolean = undefined;

    getValues(fields?: UACHDataField[]): UADataValues {
        let values: any = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.hasOwnProperty(prop)) {
                values[prop] = this[<UACHDataField>prop];
            }
        }
        return values;
    }

    getValuesAsHeaders(fields?: UACHDataField[]): Partial<Record<UACHHeaderField, string>> {
        let values: any = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.hasOwnProperty(prop)) {
                const { field, type } = UACH_MAP[<UACHDataField>prop];
                values[field] = this.serializeHeader(this[<UACHDataField>prop], type);
            }
        }
        return values;
    }

    setValues(values?: UADataValues): UAClientHints {
        for (const key in values) {
            if (this.hasOwnProperty(key)) {
                const val = values[<UACHDataField>key];
                if (this.isValidType(val, UACH_MAP[<UACHDataField>key].type)) {
                    this[<UACHDataField>key] = val as any; 
                }
            };
        }
        return this;
    }

    setValuesFromUAParser(uap: UAParser.IResult): UAClientHints {
        const arch = /(x86|arm).*(64)/.exec(uap.cpu.architecture || '');
        if (arch) {
            this.architecture = arch[1];
            if (arch[2] == '64') {
                this.bitness = '64';
            }
        }
        switch (uap.device.type) {
            case 'mobile':
                this.formFactor = ['Mobile'];
                this.mobile = true;
                break;
            case 'tablet':
                this.formFactor = ['Tablet'];
                break;
        }
        if (uap.device.model) {
            this.model = uap.device.model;
        }
        if (uap.os.name) {
            this.platform = uap.os.name;
            if (uap.os.version) {
                this.platformVersion = uap.os.version;
            }
        }
        if (uap.browser.name) {
            const brands = [{ brand : uap.browser.name, version : uap.browser.version || '' }];
            this.brands = brands;
            this.fullVersionList = brands;
        }
        return this;
    }

    setValuesFromHeaders(headers: Record<string, string>): UAClientHints {
        if(Object.keys(headers).some(prop => prop.startsWith('sec-ch-ua'))) {
            for (const key in UACH_MAP) {
                const { field, type } = UACH_MAP[<UACHDataField>key];
                const headerField = <UACHHeaderField>field.toLowerCase();
                if (headers.hasOwnProperty(headerField)) {
                    this[<UACHDataField>key] = this.parseHeader(headers[headerField], type) as any;
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
                                    brand : match ? match[1] : '',
                                    version : match ? match[2] : ''
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
                    return (<NavigatorUABrandVersion[]>data).map(browser => `"${browser.brand}"; v="${browser.version}"`).join(', ');
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