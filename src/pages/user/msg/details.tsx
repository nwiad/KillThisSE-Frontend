import { faPenToSquare, faArrowDown, faArrowsUpToLine, faBell, faBellSlash, faKey, faNoteSticky, faUserGroup, faUserMinus, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isDisabled } from "@testing-library/user-event/dist/utils";

interface memberMetaData {
    id: number,
    name: string,
    avatar: string,
    is_admin: boolean,
    is_owner: boolean
}

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

interface detailProps {
    chatID: string,
    chatName: string,
    myID: string,
    group: string
}

const DetailsPage = (props: detailProps) => {
    const router = useRouter();
    const query = router.query;
    // const [chatID, setChatID] = useState<string>();
    // const [chatName, setChatName] = useState<string>();
    // const [isGroup, setIsGroup] = useState<string>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    // const [myID, setID] = useState<string>();
    const [hasPermit, setHasPermit] = useState<boolean>();

    const [owner, setOwner] = useState<memberMetaData>();
    const [admins, setAdmins] = useState<memberMetaData[]>();
    const [members, setMemers] = useState<memberMetaData[]>();
    const [notice, setNotice] = useState<string>("");
    const [showPopUpMembers, setShowPopUpMembers] = useState<boolean>(false);
    const [showPopUpNoticeBoard, setShowPopUpNoticeBoard] = useState<boolean>(false);
    const [showPopUpNotice, setShowPopUpNotice] = useState<boolean>(false);
    const [remind, setRemind] = useState<boolean>(false);
    const [top, setTop] = useState<boolean>(false);
    const [newNotice, setNewNOtice] = useState<string>("");

    const [otherFriends, setOtherFriends] = useState<Friend[]>();
    const [invitees, setInvitees] = useState<number[]>([]);
    const [showInvite, setShowInvite] = useState<boolean>(false);
    const [showRemove, setShowRemove] = useState<boolean>(false);
    const [removed, setRemoved] = useState<number[]>([]);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // setChatID(query.id as string);
        // setChatName(query.name as string);
        // setIsGroup(query.group as string);
        // setID(query.myID as string);
        console.log(router.query.id);
    }, [router, query]);

    useEffect(() => {
        // console.log("group?", isGroup);
        // if (chatID !== undefined && chatName !== undefined && isGroup !== undefined && myID !== undefined) {
        if (props.group === "1") {
            // 获取群成员
            fetch(
                "/api/user/get_group_members/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chatID
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
                .catch((err) => alert(err));
            // 获取管理员（不含群主）
            fetch(
                "/api/user/get_group_administrators/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chatID
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
                .catch((err) => alert(err));
            // 获取群主
            fetch(
                "/api/user/get_group_owner/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chatID
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        setOwner(data.owner);
                    }
                    else {
                        console.log(localStorage.getItem("token"));
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => alert(err));
            // 获取群公告
            fetch(
                "/api/user/get_group_announcement/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        group: props.chatID
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
                .catch((err) => alert(err));
        }
        // }
        else if (props.group === "0") {
            setRefreshing(false);
        }
    }, [props]);

    useEffect(() => {
        const checkPermission = () => {
            if (owner?.id.toString() === props.myID) {
                return true;
            }
            admins?.forEach((admin) => {
                if (admin.id.toString() === props.myID) {
                    return true;
                }
            });
            return false;
        };
        if (props.group === "1" && owner !== undefined && admins !== undefined && members !== undefined) {
            console.log("聊天详情刷新");
            getOtherFriends();
            setHasPermit(checkPermission());
            setRefreshing(false);
        }
        else if (props.group === "0") {
            setRefreshing(false);
        }
    }, [owner, admins, members, props]);

    const closeNoticeBoard = () => {
        setShowPopUpNoticeBoard(false);
        setNewNOtice("");
    };

    const submitNotice = () => {
        console.log(owner);
        fetch(
            "/api/user/set_group_announcement/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: props.chatID,
                    announcement: newNotice
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    alert("设置群公告成功");
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    // 获取好友列表
    const getOtherFriends = async () => {
        await fetch(
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
                    // TODO: 筛选
                    let newArray: Friend[] = [];
                    friends.forEach((friend: Friend) => {
                        if(!alreadyInGroup(friend.user_id)) {
                            newArray.push(friend);
                        }
                    });
                    setOtherFriends(newArray);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    // 筛选不在群里的好友
    const alreadyInGroup = (friend_id: number): boolean => {
        if (owner?.id === friend_id) {
            return true;
        }
        for(let admin of admins!) {
            if(admin.id === friend_id) {
                return true;
            }
        }
        for(let memeber of members!) {
            if(memeber.id === friend_id) {
                return true;
            }
        }
        return false;
    };

    // 邀请新成员（能不能改成列表啊）
    const invite = () => {
        fetch(
            "/api/user/invite_member_to_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: props.chatID,
                    invitee: invitees
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("已发送邀请");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const closeInvite = () => {
        setShowInvite(false);
        setInvitees([]);
    };

    const closeRemove = () => {
        setShowRemove(false);
    };

    const addOrRemoveGroupMember = (id: number) => {
        const index = invitees.indexOf(id);
        if (index !== -1) {
            let newArray = [...invitees];
            newArray.splice(index, 1);
            setInvitees(newArray);
        }
        else {
            setInvitees((memeberList) => [...memeberList, id]);
        }
    };

    const remove = () => {
        // TODO
        fetch(
            "/api",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: props.chatID,
                })
            }
        );
    };

    return refreshing ? (
        <div style={{ padding: 12 }}>
            <p>Loading...</p>
        </div>
    ) : (props.group === "1" ? (
        <div style={{ padding: 12 }}>
            <div id="detaildisplay">
                <p className="chatname"> {props.chatName}</p>
                <div className="groupadminbuttons">
                    <div className="adminbutton" onClick={() => { setShowPopUpMembers(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserGroup} />
                        <p className="admininfo">群成员</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setShowPopUpNotice(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faNoteSticky} />
                        <p className="admininfo">群公告</p>
                    </div>
                    <div className="adminbutton">
                        <FontAwesomeIcon className="adminicon" icon={faKey} />
                        <p className="admininfo">二级密码</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setRemind(!remind); }}>
                        <FontAwesomeIcon className="adminicon" icon={remind ? faBellSlash : faBell} />
                        <p className="admininfo">{remind ? "免打扰" : "解除免打扰"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setTop(!top); }}>
                        <FontAwesomeIcon className="adminicon" icon={top ? faArrowDown : faArrowsUpToLine} />
                        <p className="admininfo">{top ? "取消置顶" : "置顶"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setShowInvite(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserPlus} />
                        <p className="admininfo">邀请</p>
                    </div>
                    { hasPermit &&  <div className="adminbutton" onClick={() => { setShowRemove(true); } }>
                        <FontAwesomeIcon className="adminicon" icon={faUserMinus} />
                        <p className="admininfo">移除成员</p>
                    </div>}
                    <div className="adminbutton">
                        <FontAwesomeIcon className="quiticon" icon={faXmark} />
                        <p className="admininfo">退出</p>
                    </div>
                </div>

            </div>
            {showPopUpMembers && (
                <p className="members">
                    <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowPopUpMembers(false); }} />
                    <div className="membersort">
                        <div key={0} className="member">
                            <img className="sender_avatar" style={{ borderColor: "#0660e9" }} src={`${owner?.avatar}`} alt="oops" />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "30px" }}>{owner?.name}</p>
                            <p className="owner">群主</p>
                        </div>
                    </div>
                    <div className="membersort">
                        {admins?.map((admin) => (
                            <div key={admin.id} className="member">
                                <img className="sender_avatar" src={`${admin?.avatar}`} alt="oops" />
                                <p style={{ color: "black", margin: "auto 10px", fontSize: "25px" }}>{admin?.name}</p>
                                <p className="admin">管理员</p>
                            </div>
                        ))}
                    </div>
                    <div className="membersort">
                        {members?.map((member) => (
                            <div key={member.id} className="member">
                                <img className="sender_avatar" src={`${member?.avatar}`} alt="oops" />
                                <p style={{ color: "black", margin: "auto 10px" }}>{member?.name}</p>
                            </div>
                        ))}
                    </div>
                </p>
            )}
            {showPopUpNotice && (
                <div className="members">
                    <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowPopUpNotice(false); }} />
                    <p className="notice"> {notice} </p>
                    {
                        (hasPermit === true) ? (
                            <FontAwesomeIcon className="setnotice" icon={faPenToSquare} onClick={() => { setShowPopUpNoticeBoard(true); }} />
                        ) : (
                            <p className="permittip"> 仅群主和管理员可设置/修改群公告 </p>
                        )
                    }
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
            {showInvite && (
                <div className="popup">
                    <ul className="startgroupchoice">
                        {otherFriends?.map((item) => (
                            <div className="startgroupchoicebox" key={item.user_id} style={{ display: "flex", flexDirection: "row" }}>
                                <input
                                    type="checkbox"
                                    className="startgroupcheckbox"
                                    onClick={() => { addOrRemoveGroupMember(item.user_id); }}
                                />
                                <li
                                    className="navbar_ele_info"
                                    style={{ display: "flex", width: "100%" }}>
                                    <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                    <p style={{ color: "black" }}>{item.name}</p>
                                </li>
                            </div>
                        ))}
                    </ul>
                    <button onClick={() => { closeInvite(); }}>
                        取消
                    </button>
                    <button onClick={() => { invite(); closeInvite(); }} disabled={invitees.length === 0 }>
                        完成
                    </button>
                </div>
            )}
            {showRemove && (
                <div className="popup">
                    {props.myID === owner!.id.toString()}
                    {
                        otherFriends?.map((item) => (
                            <div className="startgroupchoicebox" key={item.user_id} style={{ display: "flex", flexDirection: "row" }}>
                                <input
                                    type="checkbox"
                                    className="startgroupcheckbox"
                                    onClick={() => { addOrRemoveGroupMember(item.user_id); }}
                                />
                                <li
                                    className="navbar_ele_info"
                                    style={{ display: "flex", width: "100%" }}>
                                    <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                    <p style={{ color: "black" }}>{item.name}</p>
                                </li>
                            </div>
                        ))}
                    <button onClick={() => { closeRemove(); }}>
                        取消
                    </button>
                    <button onClick={() => { remove(); closeRemove(); }} disabled={removed.length === 0}>
                        完成
                    </button>
                </div>
            )}
        </div>
    ) : (
        <div style={{ padding: 12 }}>
            <div id="detaildisplay">
                <p className="chatname"> {props.chatName}</p>
                <div className="groupadminbuttons">
                    <div className="adminbutton">
                        <FontAwesomeIcon className="adminicon" icon={faKey} />
                        <p className="admininfo">二级密码</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setRemind(!remind); }}>
                        <FontAwesomeIcon className="adminicon" icon={remind ? faBellSlash : faBell} />
                        <p className="admininfo">{remind ? "免打扰" : "解除免打扰"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setTop(!top); }}>
                        <FontAwesomeIcon className="adminicon" icon={top ?  faArrowDown : faArrowsUpToLine}  />
                        <p className="admininfo">{top ? "取消置顶" : "置顶" }</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setShowInvite(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserPlus} />
                        <p className="admininfo">邀请好友建立群聊</p>
                    </div>
                    <div className="adminbutton">
                        <FontAwesomeIcon className="quiticon" icon={faXmark} />
                        <p className="admininfo">删除好友</p>
                    </div>
                </div>
            </div>
        </div>
    ));
};

export default DetailsPage;