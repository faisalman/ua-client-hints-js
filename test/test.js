const { UAClientHints } = require('../dist/cjs');
const assert = require('assert');
const UAParser = require('ua-parser-js');

describe('UAClientHints', () => {
    describe('Assign client hints values from UA-CH headers into a JS object', () => {

        const req = {
            headers : {
                'sec-ch-ua' : '"Chromium";v="93", "Google Chrome";v="93", " Not;A Brand";v="99"',
                'sec-ch-ua-full-version-list' : '"Chromium";v="93.0.1.2", "Google Chrome";v="93.0.1.2", " Not;A Brand";v="99.0.1.2"',
                'sec-ch-ua-arch' : '"arm"',
                'sec-ch-ua-bitness' : '"64"',
                'sec-ch-ua-mobile' : '?1',
                'sec-ch-ua-model' : '"Pixel 99"',
                'sec-ch-ua-platform' : '"Linux"',
                'sec-ch-ua-platform-version' : '"13"'
            }
        };
            
        const ch = new UAClientHints();
        ch.setValuesFromHeaders(req.headers);
        
        it('Parse values from header', () => {
            const chData1 = ch.getValues(['architecture', 'bitness', 'mobile']);

            assert.deepEqual(chData1, {
                "architecture": "arm",
                "bitness": "64",
                "mobile": true
            });
            
            const chData2 = ch.getValues();

            assert.deepEqual(chData2, {
                "architecture": "arm",
                "bitness": "64",
                "brands": [
                    {
                        "brand": "Chromium",
                        "version": "93"
                    },
                    {
                        "brand": "Google Chrome",
                        "version": "93"
                    },
                    {
                        "brand": " Not;A Brand",
                        "version": "99"
                    }
                ],
                "fullVersionList": [
                    {
                        "brand": "Chromium",
                        "version": "93.0.1.2"
                    },
                    {
                        "brand": "Google Chrome",
                        "version": "93.0.1.2"
                    },
                    {
                        "brand": " Not;A Brand",
                        "version": "99.0.1.2"
                    }
                ],
                "mobile": true,
                "model": "Pixel 99",
                "platform": "Linux",
                "platformVersion": "13",
                "wow64": null,
                "formFactor": null
            });
        });
        
        it('Serialize values to header', () => {

            ch.setValues({
                'wow64' : true,
                'formFactor' : 'Automotive'
            });
        
            const headersData1 = ch.getValuesAsHeaders();
            assert.deepEqual(headersData1, {
                'Sec-CH-UA' : '"Chromium"; v="93", "Google Chrome"; v="93", " Not;A Brand"; v="99"',
                'Sec-CH-UA-Full-Version-List' : '"Chromium"; v="93.0.1.2", "Google Chrome"; v="93.0.1.2", " Not;A Brand"; v="99.0.1.2"',
                'Sec-CH-UA-Arch' : '"arm"',
                'Sec-CH-UA-Bitness' : '"64"',
                'Sec-CH-UA-Mobile' : '?1',
                'Sec-CH-UA-Model' : '"Pixel 99"',
                'Sec-CH-UA-Platform' : '"Linux"',
                'Sec-CH-UA-Platform-Version' : '"13"',
                'Sec-CH-UA-WOW64' : '?1',
                'Sec-CH-UA-Form-Factor' : '"Automotive"'
            });
            
            const headersData2 = ch.getValuesAsHeaders(['brands', 'mobile', 'model']);
            assert.deepEqual(headersData2, {
                'Sec-CH-UA' : '"Chromium"; v="93", "Google Chrome"; v="93", " Not;A Brand"; v="99"',
                'Sec-CH-UA-Mobile' : '?1',
                'Sec-CH-UA-Model' : '"Pixel 99"'
            });
        });
    });

    describe('Rearrange data from UAParser getResult() into a client hints structure', () => {

        it('Map values from UAParser', () => {

            const ua = 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537';
            const uap = UAParser(ua);
            const ch2 = new UAClientHints();
            ch2.setValuesFromUAParser(uap);            
            const ch2Data = ch2.getValues();
            assert.deepEqual(ch2Data, {
                architecture: null,
                bitness: null,
                brands: [ { brand: 'IEMobile', version: '11.0' } ],
                formFactor: [ 'Mobile' ],
                fullVersionList: [ { brand: 'IEMobile', version: '11.0' } ],
                mobile: true,
                model: 'Lumia 635',
                platform: 'Windows Phone',
                platformVersion: '8.1',
                wow64: null
            });
            const headersData2 = ch2.getValuesAsHeaders();
            assert.deepEqual(headersData2, {
                'Sec-CH-UA-Arch': '',
                'Sec-CH-UA-Bitness': '',
                'Sec-CH-UA': '"IEMobile"; v="11.0"',
                'Sec-CH-UA-Form-Factor': '"Mobile"',
                'Sec-CH-UA-Full-Version-List': '"IEMobile"; v="11.0"',
                'Sec-CH-UA-Mobile': '?1',
                'Sec-CH-UA-Model': '"Lumia 635"',
                'Sec-CH-UA-Platform': '"Windows Phone"',
                'Sec-CH-UA-Platform-Version': '"8.1"',
                'Sec-CH-UA-WOW64': ''
            });
        });
    });
});