# UAClientHints.js
Parse & serialize user-agent client hints (UA-CH) HTTP headers

```sh
npm i ua-client-hints-js
```

## Methods

```js
setValuesFromHeaders(headers:object): UAClientHints
```

```js
setValuesFromUAParser(iresult:object): UAClientHints
```

```js
setValues(data:object): UAClientHints
```

```js
getValues([fields:string[]]): object
```

```js
getValuesAsHeaders([fields:string[]]): object
```

## Code Example

### From HTTP Headers

```js
import { UAClientHints } from 'ua-client-hints-js';

/* 
    Suppose we're in a server having this client hints data:

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
    };
*/

const ch = new UAClientHints();
ch.setValuesFromHeaders(req.headers);

const chData1 = ch.getValues(['architecture', 'bitness', 'mobile']);
console.log(chData1);
/*
    {
        "architecture": "arm",
        "bitness": "64",
        "mobile": true
    }
*/

const chData2 = ch.getValues();
console.log(chData2);
/*
    {
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
    }
*/

ch.setValues({
    'wow64' : true,
    'formFactor' : 'Automotive'
});

const headersData1 = ch.getValuesAsHeaders();
console.log(headersData1);
/*
    {
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
    };
*/

const headersData2 = ch.getValuesAsHeaders(['brand', 'mobile', 'model']);
console.log(headersData2);
/*
    {
        'Sec-CH-UA' : '"Chromium"; v="93", "Google Chrome"; v="93", " Not;A Brand"; v="99"',
        'Sec-CH-UA-Mobile' : '?1',
        'Sec-CH-UA-Model' : '"Pixel 99"'
    };
*/
```

### From [UAParser.js](https://github.com/faisalman/ua-parser-js)

```js
import { UAClientHints } from 'ua-client-hints-js';
import { UAParser } from 'ua-parser-js';

const ua = 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537';
const uap = new UAParser(ua).getResult();

const ch = new UAClientHints();
ch.setValuesFromUAParser(uap);

const chData = ch.getValues();
console.log(chData);
/*
{
    architecture: null,
    bitness: null,
    brands: [
        {
            brand: 'IEMobile', 
            version: '11.0'
        } 
    ],
    formFactor: ['Mobile'],
    fullVersionList: [
        { 
            brand: 'IEMobile', 
            version: '11.0'
        }
    ],
    mobile: true,
    model: 'Lumia 635',
    platform: 'Windows Phone',
    platformVersion: '8.1',
    wow64: null
};
*/

const chHeaders = ch.getValuesAsHeaders();
console.log(chHeaders);
/*
{
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
}
*/
```

# License

MIT License

Copyright (c) 2023 Faisal Salman <<f@faisalman.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.