import CryptoJS from "crypto-js";
import $ from "jquery";

const truncate = (str: string) => {
    const len = str.length;
    if(len <= 20) {
        return str;
    }
    return str.substring(0, 10) + len + str.substring(len-10, len);
};

const isUTF8 = (str: string) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encoded = encoder.encode(str);

    return decoder.decode(encoded) === str;
};

// 翻译
export const translate = async (queryString: string): Promise<string> => {

    console.log("translation begins");
    // 检查是否utf-8格式
    // console.log("检查格式", isUTF8(queryString));
    if(!isUTF8(queryString)) {
        return "[仅能翻译UTF-8格式的文本]";
    }
    const appID = "263b55a60eb72468";
    const appKey = "gAHu7w50W9nXcReKEDfXQPorkbyExVH9";
    const salt = (new Date).getTime().toString();
    const curtime = Math.round(new Date().getTime()/1000);
    const encodeStr = appID + truncate(queryString) + salt + curtime + appKey;
    const sign = CryptoJS.SHA256(encodeStr).toString(CryptoJS.enc.Hex);

    let output = "[Unknown text]]";

    await $.ajax({
        url: "https://openapi.youdao.com/api",
        type: "post",
        dataType: "jsonp",
        data: {
            q: queryString,
            appKey: appID,
            salt: salt,
            from: "auto",
            to: "zh-CHS",
            sign: sign,
            signType: "v3",
            curtime: curtime,
        },
        success: function (data) {
            console.log("success", data);
            output =  data.translation[0];
        }
    });
    return output;
};

// 语音转文字
export const transform = async (queryString: string): Promise<string> => {

    console.log("transform begins");
    const appID = "3c60ebd01606a5ca";
    const appKey = "RpS8mnChMx9pILX2TyhK69iyCPqnibrV";
    const salt = (new Date).getTime().toString();
    const curtime = Math.round(new Date().getTime()/1000);
    const encodeStr = appID + truncate(queryString) + salt + curtime + appKey;
    const sign = CryptoJS.SHA256(encodeStr).toString(CryptoJS.enc.Hex);

    await $.ajax({
        url: "https://openapi.youdao.com/asrapi",
        type: "post",
        dataType: "jsonp",
        data: {
            q: queryString,
            langType: "zh-CHS",
            appKey: appID,
            salt: salt,
            sign: sign,
            signType: "v3",
            curtime: curtime,
            format: "mp3",
            rate: 16000,
            channel: 1,
            type: "1",
        },
        success: function (data) {
            console.log(data);
            return data.result[0];
        }
    });
    return "[Unknown text]";
};