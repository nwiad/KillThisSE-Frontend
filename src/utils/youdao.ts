import axios from "axios";
import { createHash } from "crypto";
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

// 有道语音转文字
export const transform = async(queryString: string):Promise<string> =>{
    const YOUDAO_URL = "https://openapi.youdao.com/asrapi";
    const APP_KEY = "3c60ebd01606a5ca";
    const APP_SECRET = "RpS8mnChMx9pILX2TyhK69iyCPqnibrV";
    const audio_file_path = queryString;
    const lang_type = "zh-CHS";
    const extension = audio_file_path.slice(audio_file_path.lastIndexOf(".") + 1);
    if (extension !== "wav") {
        console.log("不支持的音频类型");
        process.exit(1);
    }
    const q = Buffer.from(audio_file_path).toString("base64");
    const salt = (new Date).getTime().toString();
    const curtime = Math.floor(Date.now() / 1000).toString();
    const signStr = APP_KEY + truncate(q) + salt + curtime + APP_SECRET;
    const sign = CryptoJS.SHA256(signStr).toString(CryptoJS.enc.Hex);

    let output = "[Unknown text]]";
    
    const data = {
        appKey: APP_KEY,
        q: q,
        salt: salt,
        sign: sign,
        signType: "v2",
        langType: lang_type,
        rate: 16000,
        format: "wav",
        channel: 1,
        type: 1,
        curtime: curtime,
    };
    
    console.log("2222222222222222222");
    await $.ajax({
        url: YOUDAO_URL,
        type: "post",
        data: data,
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
            console.log(data);
            output = data.result[0];
        }
    });
    return output;
};

export const voiceService = async (queryString: string): Promise<string> => {
    // 科大讯飞 API 信息
    const APPID = "038eada2";
    const APIKey = "b3ba0a78054695b9f9b9205be91e7baf";
    let output = "[Unknown text]]";
    const url = "https://raasr.xfyun.cn/v2/api/xxx";
    const audioBase64 = Buffer.from(queryString).toString("base64");
    // 构造请求头
    const curTime = Math.floor(Date.now() / 1000).toString();
    const param = { engine_type: "sms16k", aue: "raw" };
    const paramBase64 = Buffer.from(JSON.stringify(param)).toString("base64");
    const checkSum = createHash("md5").update(APIKey + curTime + paramBase64).digest("hex");

    const headers = {
        "X-Appid": APPID,
        "X-CurTime": curTime,
        "X-Param": paramBase64,
        "X-CheckSum": checkSum,
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    };

    // 请求体
    const data = {
        audio: audioBase64
    };

    // 发送请求
    try {
        const response = await axios.post(url, data, { headers: headers });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`Error: ${error}`);
        return output;
    }
};