import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { nameValid, passwordValid } from "../utils/valid";
import { transform } from "../utils/youdao";
import { faKey, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { voiceService } from "../utils/youdao";
import swal from "@sweetalert/with-react";

const test = async () => {
    voiceService("http://killthisse-avatar.oss-cn-beijing.aliyuncs.com/1684060999727recording.wav")
        .then((res) => console.log("测试测试" + res))
        .catch((err) => swal("调用失败", {
            button: {
                className: "swal-button"
            },
            icon: "error"
        }));
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
    const [fadeIn, setFadeIn] = useState<boolean>(false);

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

    const [text, setText] = useState("");
    const message = "欢迎使用KillthisSE IM。";

    useEffect(() => {
        let currentIndex = -1;
        const intervalId = setInterval(() => {
            currentIndex++;

            setText((prevText) => prevText + message[currentIndex]);

            if (currentIndex + 1 === message.length) {
                clearInterval(intervalId);
            }
        }, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const router = useRouter();
    // useEffect(() => {
    //     test();
    // },[]);

    const userLogin = () => {
        fetch(
            "/api/user/login/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: name,
                    password: password,
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((res) => {
                if (res.code === 0) {
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else {
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => { swal("登陆失败: " + err, {
                button: {
                    className: "swal-button"
                },
                icon: "error"
            }); });
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
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((res) => {
                if (res.code === 0) {
                    swal("成功发送验证码", {
                        button: {
                            className: "swal-button"
                        },
                        icon: "success"
                    });
                } else {
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => { swal("发送验证码失败: " + err, {
                button: {
                    className: "swal-button"
                },
                icon: "error"
            }); });
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
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                    code_input: emailCode
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((res) => {
                if (res.code === 0) {
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else {
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => { swal("登陆失败: " + err, {
                button: {
                    className: "swal-button"
                },
                icon: "error"
            }); });
    };

    return (
        <div style={{ padding: 12 }}>
            <div className={fadeIn ? "blank" : "entry"} onClick={() => { setFadeIn(true); }}>
                <p className="entrytitle">{text}</p>
            </div>
            <div className={fadeIn ? "fadein" : "blank"}>
                <ul className={fadeIn ? "indexbar" : "blank"}>
                    <li className="hometitle">
                        <Link href="/">
                            KillthisSE IM
                        </Link>
                    </li>
                    <li className="loginbarli" onClick={() => { setPWdLogin(true); }}>
                        <FontAwesomeIcon icon={faKey} />
                    </li>
                    <li className="loginbarli" onClick={() => { setPWdLogin(false); }}>
                        <FontAwesomeIcon icon={faEnvelope} />
                    </li>
                </ul>
                {pwdLogin ? (
                    <div className="info" style={{ display: "flex", flexDirection: "column", margin: "100px auto" }}>
                        <img style={{borderRadius:"50%"}} src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                        <input
                            id="usernameinput"
                            type="text"
                            placeholder="用户名"
                            value={name}
                            style={{margin:"10px auto"}}
                            onChange={(e) => checkName(e.target.value)}
                        />
                        <input
                            id="pwdinput"
                            type="password"
                            placeholder="密码"
                            value={password}
                            style={{margin:"30px auto"}}
                            onChange={(e) => { checkPassword(e.target.value); }}
                        />
                        <button onClick={userLogin} disabled={!nameLegal || !passwordLegal} style={{margin:"30px auto"}}>
                            登录
                        </button>
                        <a className="newuser" onClick={() => router.push("/register")}>
                            注册新用户
                        </a>
                    </div>
                ) : (
                    <div className="info" style={{ display: "flex", flexDirection: "column", margin: "100px auto" }}>
                        <img style={{borderRadius:"50%"}} src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                        <input
                            id="usernameinput"
                            type="text"
                            placeholder="邮箱"
                            value={email}
                            style={{margin:"10px auto"}}
                            onChange={(e) => checkEmail(e.target.value)}
                        />
                        <input
                            id="pwdinput"
                            type="usernameinput"
                            placeholder="验证码"
                            value={emailCode}
                            style={{margin:"10px auto"}}
                            onChange={(e) => { checkEmailCode(e.target.value); }}
                        />
                        {
                            wait ? (
                                <button disabled={true} style={{margin:"10px auto"}}>
                                    {`${countDown}秒后方可重新发送`}
                                </button>
                            ) : (
                                <button style={{margin:"10px auto"}} onClick={() => { setVerificationTimeout(); sendEmailVerificationCode(); }} disabled={!emailLegal}>
                                    发送验证码
                                </button>
                            )
                        }
                        <button onClick={() => { loginWithEmail(); }} disabled={!emailCodeLegal} style={{margin:"20px auto"}}>
                            登录
                        </button>
                        <a  className="newuser" onClick={() => router.push("/register")}>
                            注册新用户
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitLoginPage;