import { time } from "console";
import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX,CREATE_USER_FAILURE_PERFIX } from "../constants/string";
import { request } from "../utils/network";
import { nameValid, passwordValid } from "../utils/valid";
import { title } from "process";
import { randomInt } from "crypto";

const InitRegisterPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);

    const router = useRouter();

    const saveUser = () => {
        fetch(
            "api/user/register",
            {
                method:"POST",
                body:JSON.stringify({
                    name: name,
                    password: password,
                })
            }
        )
            .then((res) => {
                if(res.ok){
                    alert(CREATE_USER_SUCCESS)
                    router.push("/")
                } else {
                    throw new Error(`Request failed with status ${res.status}`);

                }
            })
            .catch((err) => alert(CREATE_USER_FAILURE_PERFIX + err));
    };

    const checkName = (name_: string) => {
        setName(name_);

        setNameLegal(nameValid(name_));
    };

    const checkPassword = (password_: string) => {
        setPassword(password_);

        setPasswordLegal(passwordValid(password_));
    };

    return (
        <div style={{padding: 12}}>
            <ul className="registerbar">
                <li>
                    <Link href="/">
                        返回到登录界面
                    </Link>
                </li>
            </ul>
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                <p id="title">欢迎，新的杀软er</p>
                <p id="info">请在下方填写您的注册信息</p>
                <input
                    id="usernameinput"
                    type="text"
                    placeholder="用户名"
                    value={name}
                    onChange={(e) => checkName(e.target.value)}
                />
                <span id={nameLegal? "usernamelegaltip":"usernameillegaltip"}>*用户名必须由3-16位字母、数字和下划线组成</span>
                <input
                    id="pwdinput"
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => checkPassword(e.target.value)}
                />
                <span id={passwordLegal? "pwdlegaltip":"pwdillegaltip"}>*密码必须由6-16位字母、数字和下划线组成</span>
                <button onClick={saveUser} disabled={!nameLegal || !passwordLegal}>
                    注册新用户
                </button>
            </div>
        </div>
    );
};

export default InitRegisterPage;