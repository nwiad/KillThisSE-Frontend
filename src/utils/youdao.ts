// import { TranslationQuery } from "./type";
// export interface TranslationQuery {
//     q: string,
//     from: string,
//     to: string,
//     appKey: string,
//     salt: string,
//     sign: string,
//     signType: string,
//     curtime: string
// };
import CryptoJS from "crypto-js";


const truncate = (str: string) => {
    const len = str.length;
    if(len <= 20) {
        return str;
    }
    return str.substring(0, 10) + len + str.substring(len-10, len);
};

export const translate = (queryString: string): string => {

    console.log("translating");
    // 检查是否utf-8格式

    const appID = "263b55a60eb72468";
    const appKey = "gAHu7w50W9nXcReKEDfXQPorkbyExVH9";
    const salt = (new Date).getTime();
    const curtime = Math.round(new Date().getTime()/1000);
    const encodeStr = appID + truncate(queryString) + salt + curtime + appKey;
    const sign = CryptoJS.SHA256(encodeStr).toString(CryptoJS.enc.Hex);
    const query = JSON.stringify({
        q: queryString,
        from: "auto",
        to: "zh-CHS",
        appKey: appID,
        salt: salt,
        sign: sign,
        signType: "v3",
        curtime: curtime
    });

    let output = "";

    fetch(
        "https://openapi.youdao.com/api",
        {
            method: "POST",
            body: query
        }
    )
        .then((res) => res.json())
        .then((data) => {
            output =  data.errCode + " " + data.translation;
        })
        .catch((err) => {
            return err;
        });
    
    return output;
};