import { useEffect, useState } from "react";
import { faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import swal from "@sweetalert/with-react";
import Swal from "sweetalert2";

interface chatBarProps {
    name: string,
    chat_id: string,
    is_group: boolean,
    my_id: number
}

interface memberMetaData {
    id: number,
    name: string,
    avatar: string,
    is_admin: boolean,
    is_owner: boolean
}

const ChatBar = (props: chatBarProps) => {
    const [showPopUpInfo, setShowPopUpInfo] = useState<boolean>(false);
    // myID = props.my_id 我的id
    const [owner, setOwner] = useState<memberMetaData>();
    const [admins, setAdmins] = useState<memberMetaData[]>();
    const [members, setMemers] = useState<memberMetaData[]>();
    const [notice, setNotice] = useState<string>("");
    const [showPopUpNoticeBoard, setShowPopUpNoticeBoard] = useState<boolean>(false);
    const [newNotice, setNewNOtice] = useState<string>("");

    useEffect(() => {
        if (props.is_group === true) {
            // 获取群成员
            fetch(
                "/api/user/get_group_members/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chat_id
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        setMemers(data.members.map((member: any) => ({ ...member })));
                    }
                    else {
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => 
                    Swal.fire({
                        title: "获取群聊成员: " + err.message,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "error",
                    })
                );
            // 获取管理员（不含群主）
            fetch(
                "/api/user/get_group_administrators/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chat_id
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        setAdmins(data.administrators.map((admin: any) => ({ ...admin })));
                    }
                    else {
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => 
                    Swal.fire({
                        title: "获取管理员: " + err.message,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "error",
                    })
                );
            // 获取群主
            fetch(
                "/api/user/get_group_owner/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chat_id
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    if (data.code === 0) {
                        setOwner(data.owner);
                    }
                    else {
                        console.log(localStorage.getItem("token"));
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => 
                    Swal.fire({
                        title: "获取群主: " + err.message,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "error",
                    })
                );
            // 获取群公告
            fetch(
                "/api/user/get_group_announcement/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chat_id
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        setNotice(data.Announcement);
                    }
                    else {
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => 
                    Swal.fire({
                        title: "获取群公告: " + err.message,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "error",
                    })
                );
        }

    }, [props]);

    const submitNotice = () => {
        console.log(owner);
        fetch(
            "/api/user/set_group_announcement/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: props.chat_id,
                    announcement: newNotice
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    Swal.fire({
                        title: "设置群公告成功",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "设置群公告: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
    };

    const closeNoticeBoard = () => {
        setShowPopUpNoticeBoard(false);
        setNewNOtice("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", float: "right" }}>
            <div className="chatname">{props.name}</div>
            <button className="chatinfobutton" onClick={() => { setShowPopUpInfo(true); }}>
                <FontAwesomeIcon className="Icon" icon={faCircleInfo} />
            </button>
            {showPopUpInfo && (
                <div className="popup">
                    <button onClick={() => { setShowPopUpInfo(false); closeNoticeBoard(); }}>返回</button>
                    {props.is_group &&
                        <div>
                            <p> 群公告: {notice} </p>
                            {
                                (props.my_id === owner!.id) ? (
                                    <button disabled={props.my_id !== owner!.id} onClick={() => { setShowPopUpNoticeBoard(true); }}>
                                        设置/修改群公告
                                    </button>
                                ) : (
                                    <button disabled={true} onClick={() => { setShowPopUpNoticeBoard(true); }}>
                                        仅群主和管理员可设置/修改群公告
                                    </button>
                                )
                            }
                        </div>}
                </div>
            )}
            {showPopUpNoticeBoard && (
                <div className="popup">
                    <input
                        placeholder="输入群公告"
                        onChange={(e) => { setNewNOtice(e.target.value); }}
                    />
                    <button onClick={() => { closeNoticeBoard(); }}>
                        取消
                    </button>
                    <button onClick={() => { submitNotice(); setNotice(newNotice); closeNoticeBoard(); }} disabled={newNotice.length === 0}>
                        完成
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatBar;