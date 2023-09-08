/*! UAClientHints.js
    Parse & serialize user-agent client hints (UA-CH) HTTP headers
    https://github.com/faisalman/ua-client-hints-js
    Author: Faisal Salman <f@faisalman.com>
    MIT License */
const FIELD_TYPE = {
    Boolean: 'sf-boolean',
    List: 'sf-list',
    String: 'sf-string'
};
const UACH_MAP = {
    architecture: {
        field: 'Sec-CH-UA-Arch',
        type: FIELD_TYPE.String
    },
    bitness: {
        field: 'Sec-CH-UA-Bitness',
        type: FIELD_TYPE.String
    },
    brands: {
        field: 'Sec-CH-UA',
        type: FIELD_TYPE.List
    },
    formFactor: {
        field: 'Sec-CH-UA-Form-Factor',
        type: FIELD_TYPE.String
    },
    fullVersionList: {
        field: 'Sec-CH-UA-Full-Version-List',
        type: FIELD_TYPE.List
    },
    mobile: {
        field: 'Sec-CH-UA-Mobile',
        type: FIELD_TYPE.Boolean
    },
    model: {
        field: 'Sec-CH-UA-Model',
        type: FIELD_TYPE.String
    },
    platform: {
        field: 'Sec-CH-UA-Platform',
        type: FIELD_TYPE.String
    },
    platformVersion: {
        field: 'Sec-CH-UA-Platform-Version',
        type: FIELD_TYPE.String
    },
    wow64: {
        field: 'Sec-CH-UA-WOW64',
        type: FIELD_TYPE.Boolean
    }
};
export class UAClientHints {
    constructor() {
        this.uaCHData = {
            architecture: null,
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
        return this;
    }
    getValues(fields) {
        let values = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.uaCHData.hasOwnProperty(prop)) {
                values[prop] = this.uaCHData[prop];
            }
        }
        return values;
    }
    getValuesAsHeaders(fields) {
        let values = {};
        let props = fields || Object.keys(UACH_MAP);
        for (const prop of props) {
            if (this.uaCHData.hasOwnProperty(prop)) {
                const { field, type } = UACH_MAP[prop];
                values[field] = this.serializeHeader(this.uaCHData[prop], type);
            }
        }
        return values;
    }
    setValues(values) {
        for (const key in values) {
            if (this.uaCHData.hasOwnProperty(key)) {
                const val = values[key];
                if (this.isValidType(val, UACH_MAP[key].type)) {
                    this.uaCHData[key] = val;
                }
            }
            ;
        }
        return this;
    }
    setValuesFromHeaders(headers) {
        if (Object.keys(headers).some(prop => prop.startsWith('sec-ch-ua'))) {
            for (const key in UACH_MAP) {
                const { field, type } = UACH_MAP[key];
                const headerField = field.toLowerCase();
                if (headers.hasOwnProperty(headerField)) {
                    this.uaCHData[key] = this.parseHeader(headers[headerField], type);
                }
            }
        }
        return this;
    }
    parseHeader(str, type) {
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
                    const match = /\\?\"(.+)?\\?\".+\\?\"(.+)?\\?\"/.exec(brands);
                    return {
                        brand: match ? match[1] : null,
                        version: match ? match[2] : null
                    };
                });
            case FIELD_TYPE.String:
                return str.replace(/\s*\\?\"\s*/g, '');
            default:
                return null;
        }
    }
    serializeHeader(data, type) {
        if (!data) {
            return '';
        }
        switch (type) {
            case FIELD_TYPE.Boolean:
                return data ? '?1' : '?0';
            case FIELD_TYPE.List:
                if (!data.some(val => typeof val === 'string')) {
                    return data.map(browser => `"${browser.brand}"; v="${browser.version}"`).join(', ');
                }
                return data.join(', ');
            case FIELD_TYPE.String:
                return `"${data}"`;
            default:
                return '';
        }
    }
    isValidType(data, type) {
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
