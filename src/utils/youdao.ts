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
            console.log(data);
            return data.translation[0];
        }
    });
    return "[Unknown text]";
};