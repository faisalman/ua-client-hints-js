/*! UAClientHints.js
    Parse & serialize user-agent client hints (UA-CH) HTTP headers
    https://github.com/faisalman/ua-client-hints-js
    Author: Faisal Salman <f@faisalman.com>
    MIT License */
declare const UACH_MAP: {
    readonly architecture: {
        readonly field: "Sec-CH-UA-Arch";
        readonly type: "sf-string";
    };
    readonly bitness: {
        readonly field: "Sec-CH-UA-Bitness";
        readonly type: "sf-string";
    };
    readonly brands: {
        readonly field: "Sec-CH-UA";
        readonly type: "sf-list";
    };
    readonly formFactor: {
        readonly field: "Sec-CH-UA-Form-Factor";
        readonly type: "sf-string";
    };
    readonly fullVersionList: {
        readonly field: "Sec-CH-UA-Full-Version-List";
        readonly type: "sf-list";
    };
    readonly mobile: {
        readonly field: "Sec-CH-UA-Mobile";
        readonly type: "sf-boolean";
    };
    readonly model: {
        readonly field: "Sec-CH-UA-Model";
        readonly type: "sf-string";
    };
    readonly platform: {
        readonly field: "Sec-CH-UA-Platform";
        readonly type: "sf-string";
    };
    readonly platformVersion: {
        readonly field: "Sec-CH-UA-Platform-Version";
        readonly type: "sf-string";
    };
    readonly wow64: {
        readonly field: "Sec-CH-UA-WOW64";
        readonly type: "sf-boolean";
    };
};
type UACHBrowser = {
    brand: string | null;
    version: string | null;
};
type UACHDataType = boolean | string | string[] | UACHBrowser[] | null | undefined;
type UACHDataField = keyof typeof UACH_MAP;
type UACHHeaderField = Lowercase<typeof UACH_MAP[keyof typeof UACH_MAP]['field']>;
export declare class UAClientHints {
    private uaCHData;
    constructor();
    getValues(fields?: UACHDataField[]): Partial<Record<string, UACHDataType>>;
    getValuesAsHeaders(fields?: UACHDataField[]): Partial<Record<UACHHeaderField, string>>;
    setValues(values?: Partial<Record<string, UACHDataType>>): UAClientHints;
    setValuesFromHeaders(headers: Partial<Record<UACHHeaderField, string>>): UAClientHints;
    private parseHeader;
    private serializeHeader;
    private isValidType;
}
export {};
