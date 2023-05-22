import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { all } from "axios";
import { MouseEvent as ReactMouseEvent } from "react";
import { faUserPlus, faEnvelope, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import swal from "@sweetalert/with-react";

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

interface Group {
    group_id: number;
    group_name: string;
    admin_id: number;
    collapsed: boolean;
    friends: Friend[];
}
const FriendBar = () => {
    const [friendsList, setFriendsList] = useState([]);
    const [groupsList, setGroupsList] = useState<Group[]>([]);
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [showPopupNewGroup, setShowPopupNewGroup] = useState(false);
    const [newGroup, setNewGroup] = useState<string>("");
    const [refresh, setRefresh] = useState(false);

    const router = useRouter();
    useEffect(() => {
        fetch(
            "/api/user/get_friends/",
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
                    const friends = data.friends.map((friend: Friend) => ({
                        user_id: friend.user_id,
                        name: friend.name,
                        avatar: friend.avatar
                    }));
                    setFriendsList(friends);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal("获取好友: "+err.message));

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
            .catch((err) => swal("获取群组: "+ err.message));
    }, [refresh]);

    const createNewGroup = async () => {
        await fetch(
            "/api/user/create_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: newGroup,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    swal("成功", {
                        button: {
                            className: "swal-button"
                        },
                        icon: "success"
                    });
                    setRefresh(!refresh);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal("创建群组失败: "+ err.message));
        router.push("/user/friend/friendindex");
    };

    const getGroupInfo = async (id: number) => {
        const foundGroup = groupsList.find(group => group.group_id === id);
        await fetch(
            "/api/user/get_group_friends/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    group_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    if (data.code === 0) {
                        const friends = data.friends.map((friend: Friend) => ({
                            user_id: friend.user_id,
                            name: friend.name,
                            avatar: friend.avatar
                        }));
                        if (foundGroup) foundGroup.friends = friends;
                    }
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal("获取分组好友: "+ err.message));
        router.push("/user/friend/friendindex");
    };

    const deleteGroup = async (group: string) => {
        await fetch(
            "/api/user/del_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: group,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    swal("成功", {
                        button: {
                            className: "swal-button"
                        },
                        icon: "success"
                    });
                    setRefresh(!refresh);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal("删除分组: "+ err.message));
        router.push("/user/friend/friendindex");
    };

    const deleteFriendFromGroup = async (group: number, friend: number) => {
        await fetch(
            "/api/user/del_friend_from_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    group_id: group,
                    friend_id: friend,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    swal("成功", {
                        button: {
                            className: "swal-button"
                        },
                        icon: "success"
                    });
                    setRefresh(!refresh);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => swal("从群组中移除好友: "+ err.message));
        router.push("/user/friend/friendindex");
    };

    function deleteGroupContextMenu(event: ReactMouseEvent<HTMLLIElement, MouseEvent>, group: string) {
        event.preventDefault();

        const contextMenu = document.createElement("div");
        contextMenu.innerHTML = "删除";
        contextMenu.className = "deleteContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        document.body.appendChild(contextMenu);

        function hideContextMenu() {
            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }

        contextMenu.addEventListener("click", () => {
            event.stopPropagation();
            deleteGroup(group);
            hideContextMenu();
        });

        document.addEventListener("click", hideContextMenu);
    }

    function removeFriendContextMenu(event: ReactMouseEvent<HTMLLIElement, MouseEvent>, group: number, friend: number) {
        event.preventDefault();

        const contextMenu = document.createElement("div");
        contextMenu.innerHTML = "从该组中移除此好友";
        contextMenu.className = "msgContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        document.body.appendChild(contextMenu);


        function hideContextMenu() {
            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }
        document.addEventListener("click", hideContextMenu);

        contextMenu.addEventListener("click", () => {
            event.stopPropagation();
            deleteFriendFromGroup(group, friend);
            hideContextMenu();
        });
    }

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            {showPopupNewGroup && (
                <div className="popup">
                    <input
                        type="text"
                        value={newGroup}
                        onChange={(e) => { setNewGroup(e.target.value); }}
                        placeholder="请输入新的分组名"
                        id="usernameinput" />
                    <button onClick={() => { createNewGroup(); setShowPopupNewGroup(false); }} >保存</button>
                    <button onClick={() => { setShowPopupNewGroup(false); }}>取消</button>
                </div>
            )}
            <div>
                <div className="friendbarbuttons">
                    <div className="adminbutton"
                        onClick={() => { router.push("/user/friend/searchfriend"); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserPlus} />
                        <p className="admininfo">添加新好友</p>
                    </div>
                    <div className="adminbutton"
                        onClick={() => { router.push("/user/friend/friendrequest"); }}>
                        <FontAwesomeIcon className="adminicon" icon={faEnvelope} />
                        <p className="admininfo">收到的好友邀请</p>
                    </div>
                    <div className="adminbutton"
                        onClick={() => { setShowPopupNewGroup(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUsers} />
                        <p className="admininfo">新建分组</p>
                    </div>

                </div>
                <ul className="friendlist">
                    <li className="newfriend"
                        onClick={() => { setAllCollapsed(!allCollapsed); }}
                        style={{ padding: 20 , border: 0}}>
                        全部好友
                    </li>
                    {friendsList?.map((item: Friend) => (
                        <li key={item.user_id}
                            className="friendinList"
                            onClick={() => { router.push(`/user/friend/friendinfo?id=${item.user_id}&name=${item.name}&avatar=${item.avatar}`); }}
                            style={{ display: `${allCollapsed ? "block" : "none"}` }}>
                            <img className="friendavatar" src={`${item.avatar}`} alt="oops" />
                            <p>{item.name}</p>
                        </li>
                    ))}
                    {groupsList?.map((item: Group) => (
                        <div key={item.group_id}>
                            <li key={item.group_id} className="friend"
                                style={{borderRadius:"0"}}
                                onClick={() => {
                                    getGroupInfo(item.group_id);
                                    const foundGroup = groupsList.find(group => group.group_id === item.group_id);
                                    if (foundGroup) foundGroup.collapsed = !item.collapsed;
                                }}
                                onContextMenu={(event) => {
                                    deleteGroupContextMenu(event, item.group_name);
                                }}>
                                <p>{item.group_name}</p>
                            </li>
                            {item?.friends?.map((friend: Friend) => (
                                <li key={friend.user_id}
                                    className="friendinList"
                                    onClick={() => { router.push(`/user/friend/friendinfo?id=${friend.user_id}&name=${friend.name}`); }}
                                    style={{ display: `${item.collapsed ? "block" : "none"}` }}
                                    onContextMenu={(event) => {
                                        removeFriendContextMenu(event, item.group_id, friend.user_id);
                                    }}>
                                    <img className="friendavatar" src={`${friend.avatar}`} alt="oops" />
                                    <p>{friend.name}</p>
                                </li>
                            ))}
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FriendBar;