import { useRouter } from "next/router";
import FriendBar from "./friendbar";
import { useEffect, useState } from "react";
import { faMessage, faUserXmark, faUserTag , faXmark} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import swal from "@sweetalert/with-react";
import Swal from "sweetalert2";

interface Group {
    group_id: number;
    group_name: string;
    admin_id: number;
}

const InitPage = () => {

    const router = useRouter();
    const query = router.query;
    const [friendID, setFriendID] = useState<string>();
    const [friendName, setFriendName] = useState<string>();
    const [friendAvatar, setFriendAvatar] = useState<string>();
    const [showPopupGrouptoAdd, setShowPopupGrouptoAdd] = useState(false);
    const [groupsList, setGroupsList] = useState<Group[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(true);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        setFriendID(router.query.id as string);
        setFriendName(router.query.name as string);
        setFriendAvatar(router.query.avatar as string);
    }, [router, query]);

    useEffect(() => {
        fetch(
            "/api/user/get_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    const groups = data.groups.map((group: Group) => ({
                        group_id: group.group_id,
                        group_name: group.group_name,
                        admin_id: group.admin_id
                    }));
                    setGroupsList(groups);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "获取群组: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
    }, []);

    const sendDelete = async () => {
        await fetch(
            "/api/user/del_friend/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: friendID, // id
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    Swal.fire({
                        title: "删除好友成功",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "删除好友: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
        router.push("/user/friend/friendindex");
    };

    const addtoGroup = async (groupID: number) => {
        await fetch(
            "/api/user/add_friend_to_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    group_id: groupID,
                    friend_id: friendID, // id
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    Swal.fire({
                        title: "将好友加入分组成功",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#39c5bb",
                        icon: "success",
                    });
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "将好友加入分组: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
        router.push("/user/friend/friendindex");
    };
    const startChat = async () => {
        await fetch(
            "/api/user/get_or_create_private_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend: friendID, // id
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("成功发起会话");
                    const chatID = data.conversation_id;
                    const silent = data.silent;
                    const validation = data.validation;
                    router.push(`/user/msg/chat?id=${chatID}&name=${friendName}&group=0&sticked=0&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "创建私聊:" + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
        router.push("/user/friend/friendindex");
    };

    useEffect(() => {
        console.log(friendID, friendName);
        if (friendID !== undefined && friendName !== undefined) {
            setRefreshing(false);
        }
    }, [friendID, friendName]);

    return refreshing ? (
        <p>正在加载好友信息</p>
    ) : (
        <div>
            {showPopupGrouptoAdd && (
                <div className="popup" style={{ padding: "20px", height: "auto", width: "auto" }}>
                    <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowPopupGrouptoAdd(false); }} />
                    <p>请选择需要加入的分组</p>
                    {groupsList?.map((item: Group) => (
                        <div className="member" style={{ textAlign: "center", height: "50px",  }} key={item.group_id} onClick={() => { addtoGroup(item.group_id); }}>
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "25px", textAlign: "center"  }}> {item.group_name}</p>
                        </div>
                    ))}
                </div>
            )
            }
            <FriendBar />
            <div className="friendinfodisplay">
                <img className="friendinfoavatar" src={`${friendAvatar}`} alt="oops" />
                <p className="friendinfoname">{friendName}</p>
                <div className="friendinfobuttondisplay">
                    <button className="friendinfobutton" onClick={() => { startChat(); }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faMessage} />
                        </div>
                        <p className="friendinfobuttoninfo">发消息</p>
                    </button>
                    <button className="friendinfobutton" onClick={() => { setShowPopupGrouptoAdd(true); }}>
                        <div className="friendinfoiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faUserTag} />
                        </div>
                        <p className="friendinfobuttoninfo">加入分组</p>
                    </button>

                    <button className="friendinfobutton" onClick={() => { sendDelete(); }}>
                        <div className="frienddeleteiconbg">
                            <FontAwesomeIcon className="friendinfoicon" icon={faUserXmark} />
                        </div>
                        <p className="frienddeletebuttoninfo">删除好友</p>
                    </button>
                </div>
            </div>
        </div >
    );
};

export default InitPage;