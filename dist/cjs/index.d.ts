/*! UAClientHints.js 0.1.1
    Parse & serialize user-agent client hints (UA-CH) HTTP headers
    https://github.com/faisalman/ua-client-hints-js
    Author: Faisal Salman <f@faisalman.com>
    MIT License */
/// <reference types="ua-parser-js" />
declare enum FIELD_TYPE {
    Boolean = "sf-boolean",
    List = "sf-list",
    String = "sf-string"
}
declare const UACH_MAP: {
    readonly architecture: {
        readonly field: "Sec-CH-UA-Arch";
        readonly type: FIELD_TYPE.String;
    };
    readonly bitness: {
        readonly field: "Sec-CH-UA-Bitness";
        readonly type: FIELD_TYPE.String;
    };
    readonly brands: {
        readonly field: "Sec-CH-UA";
        readonly type: FIELD_TYPE.List;
    };
    readonly formFactor: {
        readonly field: "Sec-CH-UA-Form-Factor";
        readonly type: FIELD_TYPE.String;
    };
    readonly fullVersionList: {
        readonly field: "Sec-CH-UA-Full-Version-List";
        readonly type: FIELD_TYPE.List;
    };
    readonly mobile: {
        readonly field: "Sec-CH-UA-Mobile";
        readonly type: FIELD_TYPE.Boolean;
    };
    readonly model: {
        readonly field: "Sec-CH-UA-Model";
        readonly type: FIELD_TYPE.String;
    };
    readonly platform: {
        readonly field: "Sec-CH-UA-Platform";
        readonly type: FIELD_TYPE.String;
    };
    readonly platformVersion: {
        readonly field: "Sec-CH-UA-Platform-Version";
        readonly type: FIELD_TYPE.String;
    };
    readonly wow64: {
        readonly field: "Sec-CH-UA-WOW64";
        readonly type: FIELD_TYPE.Boolean;
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
    private data;
    constructor();
    getValues(fields?: UACHDataField[]): Partial<Record<string, UACHDataType>>;
    getValuesAsHeaders(fields?: UACHDataField[]): Partial<Record<UACHHeaderField, string>>;
    setValues(values?: Partial<Record<string, UACHDataType>>): UAClientHints;
    setValuesFromUAParser(uap: UAParser.IResult): UAClientHints;
    setValuesFromHeaders(headers: Partial<Record<UACHHeaderField, string>>): UAClientHints;
    private parseHeader;
    private serializeHeader;
    private isValidType;
}
export {};
