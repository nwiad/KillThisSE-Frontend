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
    const [newpassword, setNewPassword] = useState<string>("");
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);
    const [showPopupAvatar, setShowPopupAvatar] = useState(false);
    const [showPopupName, setShowPopupName] = useState(false);
    const [showPopupPwd, setShowPopupPwd] = useState(false);
    const [isAvatarUploaded, setIsAvatarUploaded] = useState(false);

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

    const resetAvatar = async (pic: File|undefined) => {
        if(pic === undefined) {
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
            <Navbar/>
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
                        <form onSubmit={() => { resetAvatar(newavatar); setIsAvatarUploaded(false);  setShowPopupAvatar(false);  }}>
                            <input placeholder = "uploaded image" className="fileupload" type="file" name="avatar" accept="image/*" 
                            onChange={(event) => { setNewAvatar(event.target.files?.[0]); setIsAvatarUploaded(!!event.target.files?.[0]); }} />
                            <button type="submit" disabled={!isAvatarUploaded}>上传头像</button>
                        </form>
                        <button onClick={() => { setShowPopupAvatar(false); }}>取消</button>
                    </div>
                )}
                <button className="resetName" onClick={() => { setShowPopupName(true); setNewName("");}}>
                    修改用户名
                </button>
                {showPopupName && (
                    <div className="popup">
                        <input
                            type="text"
                            value={newname}
                            onChange={(e) => { checkName(e.target.value); }}
                            placeholder="请输入新的用户名"
                            id="usernameinput" />
                        <span id={nameLegal ? "usernamelegaltip" : "usernameillegaltip"}>*用户名必须由3-16位字母、数字和下划线组成</span>
                        <button onClick={() => { resetName(); setShowPopupName(false);}} disabled={!nameLegal}>保存</button>
                        <button onClick={() => { setShowPopupName(false); }}>取消</button>
                    </div>
                )}
                <button className="resetName" onClick={() => { setShowPopupPwd(true); setPassword(""); setNewPassword(""); }}>
                    修改密码
                </button>
                {showPopupPwd && (
                    <div className="popuppwd">
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); }} placeholder="请输入原密码" />
                        <input type="password" value={newpassword} onChange={(e) => { checkNewPassword(e.target.value); }} placeholder="请输入新的密码" id="pwdinput" />
                        <span id={passwordLegal ? "pwdlegaltip" : "pwdillegaltip"}>*密码必须由6-16位字母、数字和下划线组成</span>
                        <button onClick={() => { resetPassword();  setShowPopupPwd(false);  }}>保存</button>
                        <button onClick={() => { setShowPopupPwd(false); }}>取消</button>
                    </div>
                )}
                <button className="delete" onClick={() => {deleteUser();}}>
                    注销本用户
                </button>
            </div>
        </div>
    );
};

export default InitPage;