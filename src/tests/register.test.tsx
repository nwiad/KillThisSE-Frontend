import { assert } from "console";
import { nameValid, passwordValid } from "../utils/valid";

const TEST_TIMES = 100;

const chars = "a/bcd{ef~gh`ijkl、m——n#opq?rs$tu!vwx;yzAB>CD$E^FGH%IJK,LM&NOP@QRS}TUV*WX[]YZ01|23=4+5)67(89_-";

const charsLen = chars.length;

const validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

const randomString = (): string => {
    const length = Math.round(Math.random() * 50);
    let str = "";
    for(let i = 0; i < length; i++) {
        str += chars.charAt(Math.random() * charsLen);
    }
    return str;
};

const naiveValidation = (str: string, type: "name"|"pwd"): boolean => {
    const length = str.length;
    let minLen = (type === "name") ? 3 : 6;
    let maxLen = 16;
    if(length < minLen || length > maxLen) {
        return false;
    }
    for(let i = 0; i < length; i++) {
        if(validChars.indexOf(str.charAt(i)) === -1) {
            return false;
        }
    }
    return true;
}

it("Name and password validation test in registration.", () => {
    for(let test = 0; test < TEST_TIMES; test++) {
        const name = randomString();
        const pwd = randomString();
        const nameIsValid = naiveValidation(name, "name");
        const pwdIsValid = naiveValidation(pwd, "pwd");
        if(nameIsValid) {
            expect(nameValid(name)).toBeTruthy();
        }
        else {
            expect(nameValid(name)).toBeFalsy();
        }
        if(pwdIsValid) {
            expect(passwordValid(pwd)).toBeTruthy();
        }
        else {
            expect(passwordValid(pwd)).toBeFalsy();
        }
    }
});