import { useRouter } from "next/router";
import { Suspense, useEffect, useState } from "react";
import { uploadFile } from "../../utils/oss";
import { nameValid, passwordValid } from "../../utils/valid";
import Navbar from "./navbar";
import swal from "@sweetalert/with-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faUser, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";


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
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [cancelPwd, setCancelPwd] = useState<string>("");

    const router = useRouter();

    // const cropImageToSquare = async (imageFile:File):Promise<File> => {
    //     return new Promise((resolve, reject) => {
    //         const img = new Image();
    //         const reader = new FileReader();
    //         reader.onload = function (e) {
    //             img.onload = function () {
    //                 const canvas = document.createElement("canvas");
    //                 const ctx = canvas.getContext("2d");
    //                 const size = Math.min(img.width, img.height);
    //                 const x = (img.width - size) / 2;
    //                 const y = (img.height - size) / 2;
    //                 canvas.width = size;
    //                 canvas.height = size;
    //                 ctx?.drawImage(img, x, y, size, size, 0, 0, size, size);
    //                 canvas.toBlob(blob => {
    //                     const croppedFile = new File([blob], imageFile.name, { type: imageFile.type });
    //                     resolve(croppedFile);
    //                 }, imageFile.type);
    //             };
    //             img.src = e.target?.result;
    //         };
    //         reader.onerror = reject;
    //         reader.readAsDataURL(imageFile);
    //     });
    // };

    const cancel4sure = () => {
        fetch(
            "/api/user/secondary_validate/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    password: cancelPwd
                })
            }
        )
            .then((checkRes) => checkRes.json())
            .then((checkData) => {
                if(checkData.code === 0) {
                    if(checkData.Valid === true) {
                        fetch(
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
                                    Swal.fire({
                                        title: "注销成功",
                                        confirmButtonText: "OK",
                                        confirmButtonColor: "#39c5bb",
                                        icon: "success",
                                    });
                                    router.push("/");
                                } else {
                                    throw new Error(`${checkData.info}`);
                                }
                            })
                            .catch((err) => 
                                Swal.fire({
                                    title: "注销失败: " + err.message,
                                    confirmButtonText: "OK",
                                    confirmButtonColor: "#39c5bb",
                                    icon: "error",
                                })
                            );
                    }
                }
                else {
                    Swal.fire({
                        title: "密码错误!",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "error",
                    });
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "注销失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
        setCancelPwd("");
        setShowConfirm(false);
    };

    const deleteUser = async () => {
        Swal.fire({
            title: "真的要离开我们嘛ToT?",
            showDenyButton: true,
            confirmButtonText: "再见，世界",
            denyButtonText: "取消",
            icon: "warning"
        }).then((result) => {
            if (result.isConfirmed) {
                setShowConfirm(true);
            }
        });
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
                    Swal.fire({
                        title: `成功修改用户名为${newname}`,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                    setName(newname);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => 
                Swal.fire({
                    title: "修改用户名失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
                    Swal.fire({
                        title: `成功修改用户名为${newname}`,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                    setName(newname);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => 
                Swal.fire({
                    title: "修改用户名失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
                    Swal.fire({
                        title: "成功修改密码",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => 
                Swal.fire({
                    title: "修改密码失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
        router.push("/user/info");
    };

    const resetAvatar = async (pic: File | undefined) => {
        if (pic === undefined) {
            Swal.fire({
                title: "未检测到图片",
                confirmButtonText: "OK",
                confirmButtonColor: "#39c5bb",
                icon: "error",
            });
            return;
        }
        // const croppedImageFile = await cropImageToSquare(pic);
        // const image_url = await uploadFile(croppedImageFile);

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
                    Swal.fire({
                        title: "修改成功",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                    setAvatar(image_url);
                } else {
                    throw new Error(`${res.info}`);
                }

            })
            .catch((err) => 
                Swal.fire({
                    title: "修改头像失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
        if (!emailLegal) {
            Swal.fire({
                title: "邮箱不合法",
                confirmButtonText: "OK",
                confirmButtonColor: "#39c5bb",
                icon: "error",
            });
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
                if (res.code === 0) {
                    Swal.fire({
                        title: `成功绑定邮箱: ${email}`,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                }
                else {
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "绑定邮箱失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
            .catch((err) => 
                Swal.fire({
                    title: "获取个人信息失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
    }, [avatar, name]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar name={name} avatar={avatar} />
            <div className="info" >
                {avatar && (
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundImage: `url(${avatar})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: "2px solid #39c5bb",
                            margin: "30px auto",
                        }}
                    />
                )}
                <p id="infoTitle">
                    {name}
                </p>
                <div className="infobuttons">
                    <button className="friendinfobutton" onClick={() => { setShowPopupAvatar(true); }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faUser} />
                        </div>
                        <p className="friendinfobuttoninfo">修改头像</p>
                    </button>
                    <button className="friendinfobutton" onClick={() => { setShowPopupName(true); setNewName(""); }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faPen} />
                        </div>
                        <p className="friendinfobuttoninfo">修改用户名</p>
                    </button>
                    <button className="friendinfobutton" onClick={() => { setShowPopupPwd(true); setPassword(""); setNewPassword(""); }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faKey} />
                        </div>
                        <p className="friendinfobuttoninfo">修改密码</p>
                    </button>
                    <button className="friendinfobutton" onClick={() => {
                        setEmail(""); setEmailLegal(false);
                        setPwd4Verify(""); setLegalVerify(false); setShowPopUpEmail(true);
                    }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faEnvelope} />
                        </div>
                        <p className="friendinfobuttoninfo">修改邮箱</p>
                    </button>
                    <button className="friendinfobutton" onClick={() => { deleteUser(); }}>
                        <div className="frienddeleteiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faXmark} />
                        </div>
                        <p className="frienddeletebuttoninfo">注销</p>
                    </button>
                </div>
                {showPopupAvatar && (
                    <div className="popupAvatar" style={{ padding: "15px" }}>
                        <div>修改头像</div>
                        <form className="uploadform" onSubmit={() => { resetAvatar(newavatar); setIsAvatarUploaded(false); setShowPopupAvatar(false); }}>
                            <input placeholder="uploaded image" className="fileupload" type="file" name="avatar" accept="image/*"
                                onChange={(event) => { setNewAvatar(event.target.files?.[0]); setIsAvatarUploaded(!!event.target.files?.[0]); }} />
                            <button type="submit" disabled={!isAvatarUploaded}>上传头像</button>
                        </form>
                        <button onClick={() => { setShowPopupAvatar(false); }}>取消</button>
                    </div>
                )}
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
                {showPopUpEmail && (
                    <div className="popuppwd">
                        <p>邮箱绑定</p>
                        <input type="resetname" value={email} onChange={(e) => { checkEmail(e.target.value); }} placeholder="请输入邮箱" />
                        <span id={emailLegal ? "pwdlegaltip" : "pwdillegaltip"}>*请输入合法邮箱</span>
                        <input type="password" value={pwd4Verify} onChange={(e) => { checkPwd4Verify(e.target.value); }} placeholder="请输入密码" id="pwdinput" />
                        <button onClick={() => { bindEmail(); setShowPopUpEmail(false); }} disabled={!emailLegal || !legalVerify}>绑定</button>
                        <button onClick={() => { setShowPopUpEmail(false); }}>取消</button>
                    </div>
                )}
                {showConfirm && (
                    <div className="popuppwd">
                        <p>输入密码</p>
                        <input type="password" value={cancelPwd} onChange={(e) => { setCancelPwd(e.target.value); }} placeholder="请输入密码" />
                        <span id={passwordLegal ? "pwdlegaltip" : "pwdillegaltip"}>*密码必须由6-16位字母、数字和下划线组成</span>
                        <button onClick={() => { cancel4sure(); }}>确定</button>
                        <button onClick={() => { setShowConfirm(false); }}>取消</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitPage;