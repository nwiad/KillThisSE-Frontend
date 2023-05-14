import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { nameValid, passwordValid } from "../utils/valid";
import { transform } from "../utils/youdao";

const test = async () => {
    transform("http://killthisse-avatar.oss-cn-beijing.aliyuncs.com/1683988188865recording.mp3")
        .then((res) => console.log("测试测试"+res))
        .catch((err) => alert("调用失败"));
};

const InitLoginPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);
    const [pwdLogin, setPWdLogin] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [emailLegal, setEmailLegal] = useState<boolean>(false);
    const [emailCode, setEmailCode] = useState<string>("");
    const [emailCodeLegal, setEmailCodeLegal] = useState<boolean>(false);
    const [wait, setWait] = useState<boolean>(false);
    const [countDown, setCountDown] = useState<number>(60);

    const timer = useRef<NodeJS.Timer | undefined>(undefined);

    const setVerificationTimeout = () => {
        setWait(true);
        setCountDown(60);
        timer.current = setInterval(() => {
            setCountDown((countDown) => (countDown - 1));
        }, 1000);
        setTimeout(() => {
            setWait(false);
            clearInterval(timer.current);
        }, 60000);
    };

    const router = useRouter();
    useEffect(() => {
        test();
    },[]);

    const userLogin = () => {
        fetch(
            "/api/user/login/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    name: name,
                    password: password,
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {alert(err);});
    };

    const checkName = (name_: string) => {
        setName(name_);
        setNameLegal(nameValid(name_));
    };

    const checkPassword = (password_: string) => {
        setPassword(password_);
        setPasswordLegal(passwordValid(password_));
    };

    const sendEmailVerificationCode = () => {
        fetch(
            "/api/user/send_email_for_login/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    email: email,
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    alert("成功发送验证码");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {alert(err);});
    };

    const checkEmail = (address: string) => {
        setEmail(address);
        const legalAddress: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailLegal(legalAddress.test(address));
    };

    const checkEmailCode = (code: string) => {
        setEmailCode(code);
        setEmailCodeLegal(code.length === 6);
    }; 

    const loginWithEmail = () => {
        fetch(
            "/api/user/login_with_email/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    email: email,
                    code_input: emailCode
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {alert(err);});
    };

    return (
        <div style={{padding: 12}}>
            <ul className="indexbar">
                <li>
                    <Link href="/">
                        KillthisSE IM
                    </Link>
                </li>
                <li onClick={() => { setPWdLogin(true); }}>
                    账号密码登陆    
                </li>
                <li onClick={() => { setPWdLogin(false); }}>
                    邮箱验证登陆    
                </li> 
            </ul>
            { pwdLogin ? (
                <div id="main" style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                    <img src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                    <input
                        id="usernameinput"
                        type="text"
                        placeholder="用户名"
                        value={name}
                        onChange={(e) => checkName(e.target.value)}
                    />
                    <input
                        id="pwdinput"
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => {checkPassword(e.target.value);}}
                    />
                    <button onClick={userLogin} disabled={!nameLegal || !passwordLegal}>
                        登录
                    </button>
                    <button onClick={() => router.push("/register")}>
                        注册新用户
                    </button>
                </div>
            ) : (
                <div id="main" style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                    <img src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                    <input
                        id="usernameinput"
                        type="text"
                        placeholder="邮箱"
                        value={email}
                        onChange={(e) => checkEmail(e.target.value)}
                    />
                    <input
                        id="pwdinput"
                        type="usernameinput"
                        placeholder="验证码"
                        value={emailCode}
                        onChange={(e) => {checkEmailCode(e.target.value);}}
                    />
                    {
                        wait ? (
                            <button disabled={true}>
                                {`${countDown}秒后方可重新发送`}
                            </button>
                        ) : (
                            <button onClick={() => { setVerificationTimeout(); sendEmailVerificationCode(); }} disabled={!emailLegal}>
                                发送验证码
                            </button>
                        )
                    }
                    <button onClick={() => { loginWithEmail(); }} disabled={!emailCodeLegal}>
                        登录
                    </button>
                    <button onClick={() => router.push("/register")}>
                        注册新用户
                    </button>
                </div>
            )}   
        </div>
    );
};

export default InitLoginPage;