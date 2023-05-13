import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { uploadFile } from "../../utils/oss";
import { nameValid, passwordValid } from "../../utils/valid";
import Navbar from "./navbar";


const InitPage = () => {
    const [name, setName] = useState<string>("");
    const [newname, setNewName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>();
    const [newavatar, setNewAvatar] = useState<File>();
    const [password, setPassword] = useState<string>("");
    const [newMail, setNewMail] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [newpassword, setNewPassword] = useState<string>("");
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);
    const [showPopupAvatar, setShowPopupAvatar] = useState(false);
    const [showPopupName, setShowPopupName] = useState(false);
    const [showPopupPwd, setShowPopupPwd] = useState(false);
    const [showPopupMail, setShowPopupMail] = useState(false);
    const [isAvatarUploaded, setIsAvatarUploaded] = useState(false);
    const [showPopUpEmail, setShowPopUpEmail] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [emailLegal, setEmailLegal] = useState<boolean>(false);
    const [pwd4Verify, setPwd4Verify] = useState<string>("");
    const [legalVerify, setLegalVerify] = useState<boolean>(false);

    const router = useRouter();

    const deleteUser = async () => {
        await fetch(
            "/api/user/cancel_account/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                if (res.ok) {
                    alert("注销成功");
                } else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/");
    };

    const checkName = (name_: string) => {
        setNewName(name_);

        setNameLegal(nameValid(name_));
    };

    const checkNewPassword = (password_: string) => {
        setNewPassword(password_);

        setPasswordLegal(passwordValid(password_));
    };

    function isEmail(input: string): boolean {
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegExp.test(input);
    }

    const resetName = async () => {
        await fetch(
            "/api/user/reset_name/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: newname,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.code === 0) {
                    alert(`成功修改用户名为${newname}`);
                    setName(newname);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
        router.push("/user/info");
    };

    const resetMail = async () => {
        await fetch(
            "/api/user/reset_name/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: newname,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.code === 0) {
                    alert(`成功修改用户名为${newname}`);
                    setName(newname);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
        router.push("/user/info");
    };

    const resetPassword = async () => {
        await fetch(
            "/api/user/reset_password/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    old_pwd: password,
                    new_pwd: newpassword,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.code === 0) {
                    alert("成功修改密码");
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
        router.push("/user/info");
    };

    const resetAvatar = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到图片");
            return;
        }
        const image_url = await uploadFile(pic);

        await fetch(
            "/api/user/reset_avatar/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    avatar: image_url,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.code === 0) {
                    alert("修改成功");
                    setAvatar(image_url);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => alert(err));
        router.push("/user/info");
    };

    const checkEmail = (address: string) => {
        setEmail(address);
        const legalAddress: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailLegal(legalAddress.test(address));
    };

    const checkPwd4Verify = (pwd: string) => {
        setPwd4Verify(pwd);
        setLegalVerify(passwordValid(pwd));
    };

    const bindEmail = async () => {
        if(!emailLegal) {
            alert("邮箱不合法");
            return;
        }
        await fetch(
            "/api/user/reset_email/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    password: pwd4Verify,
                    email: email
                })
            }                
        )
            .then((res) => res.json())
            .then((res) => {
                if(res.code === 0) {
                    alert(`成功绑定邮箱: ${email}`);
                }
                else {
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        fetch(
            "/api/user/get_profile/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setName(data.name);
                setAvatar(data.avatar);

            })
            .catch((err) => alert(err));
    }, [avatar, name]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "100px auto" }}>
                {avatar && (
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundImage: `url(${avatar})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: "2px solid #ccc",
                            margin: "50px auto",
                        }}
                    />
                )}
                <p id="infoTitle">
                    {name}
                </p>
                <button className="resetName" onClick={() => { setShowPopupAvatar(true); }}>
                    修改头像
                </button>
                {showPopupAvatar && (
                    <div className="popup">
<<<<<<< HEAD
                        <form onSubmit={() => { resetAvatar(newavatar); setIsAvatarUploaded(false); setShowPopupAvatar(false); }}>
                            <input placeholder="uploaded image" className="fileupload" type="file" name="avatar" accept="image/*"
=======
                        <div>修改头像</div>
                        <form onSubmit={() => { resetAvatar(newavatar); setIsAvatarUploaded(false);  setShowPopupAvatar(false);  }}>
                            <input placeholder = "uploaded image" className="fileupload" type="file" name="avatar" accept="image/*" 
>>>>>>> 5fc196571971d88b3d1bda7e0cb04129ffdb802b
                                onChange={(event) => { setNewAvatar(event.target.files?.[0]); setIsAvatarUploaded(!!event.target.files?.[0]); }} />
                            <button type="submit" disabled={!isAvatarUploaded}>上传头像</button>
                        </form>
                        <button onClick={() => { setShowPopupAvatar(false); }}>取消</button>
                    </div>
                )}
                <button className="resetName" onClick={() => { setShowPopupName(true); setNewName(""); }}>
                    修改用户名
                </button>
                {showPopupName && (
                    <div className="popup">
                        <p>修改用户名</p>
                        <input
                            type="text"
                            value={newname}
                            onChange={(e) => { checkName(e.target.value); }}
                            placeholder="请输入新的用户名"
                            id="usernameinput" />
                        <span id={nameLegal ? "usernamelegaltip" : "usernameillegaltip"}>*用户名必须由3-16位字母、数字和下划线组成</span>
                        <button onClick={() => { resetName(); setShowPopupName(false); }} disabled={!nameLegal}>保存</button>
                        <button onClick={() => { setShowPopupName(false); }}>取消</button>
                    </div>
                )}
                <button className="resetName" onClick={() => { setShowPopupPwd(true); setPassword(""); setNewPassword(""); }}>
                    修改密码
                </button>
                {showPopupPwd && (
                    <div className="popuppwd">
                        <p>修改密码</p>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); }} placeholder="请输入原密码" />
                        <input type="password" value={newpassword} onChange={(e) => { checkNewPassword(e.target.value); }} placeholder="请输入新的密码" id="pwdinput" />
                        <span id={passwordLegal ? "pwdlegaltip" : "pwdillegaltip"}>*密码必须由6-16位字母、数字和下划线组成</span>
                        <button onClick={() => { resetPassword(); setShowPopupPwd(false); }}>保存</button>
                        <button onClick={() => { setShowPopupPwd(false); }}>取消</button>
                    </div>
                )}
<<<<<<< HEAD
                <button className="resetName" onClick={() => { setShowPopupMail(true); setMail(""); setNewMail(""); }}>
                    修改邮箱
                </button>
                {showPopupMail && (
                    <div className="popup">
                        <input
                            type="text"
                            value={newMail}
                            onChange={(e) => { setNewMail(e.target.value); }}
                            placeholder="请输入新的邮箱"
                            id="usernameinput" />
                        <span id={isEmail(newMail) ? "usernamelegaltip" : "usernameillegaltip"}>*请输入正确的邮箱</span>
                        <button onClick={() => { resetMail(); setShowPopupMail(false); }} disabled={!isEmail(newMail)}>保存</button>
                        <button onClick={() => { setShowPopupMail(false); }}>取消</button>
                    </div>
                )}
                <button className="delete" onClick={() => { deleteUser(); }}>
=======
                <button className="resetName" onClick={() => { setEmail(""); setEmailLegal(false); 
                    setPwd4Verify(""); setLegalVerify(false); setShowPopUpEmail(true); }}>
                    邮箱绑定
                </button>
                {showPopUpEmail && (
                    <div className="popuppwd">
                        <p>邮箱绑定</p>
                        <input type="resetname" value={email} onChange={(e) => { checkEmail(e.target.value); }} placeholder="请输入邮箱" />
                        <span id={emailLegal ? "pwdlegaltip" : "pwdillegaltip"}>*请输入合法邮箱</span>
                        <input type="password" value={pwd4Verify} onChange={(e) => { checkPwd4Verify(e.target.value); }} placeholder="请输入密码" id="pwdinput" />
                        <button onClick={() => { bindEmail();  setShowPopUpEmail(false); }} disabled={!emailLegal || !legalVerify}>绑定</button>
                        <button onClick={() => { setShowPopUpEmail(false); }}>取消</button>
                    </div>
                )}
                <button className="delete" onClick={() => {deleteUser();}}>
>>>>>>> 5fc196571971d88b3d1bda7e0cb04129ffdb802b
                    注销本用户
                </button>
            </div>
        </div>
    );
};

export default InitPage;