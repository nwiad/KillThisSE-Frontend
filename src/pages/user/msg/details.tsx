import { faUserCheck,  faArrowDown, faArrowsUpToLine, faBell, faBellSlash, faKey, faNoteSticky, faPenToSquare, faUserGroup, faUserMinus, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MsgMetaData } from "../../../utils/type";

interface memberMetaData {
    id: number,
    name: string,
    avatar: string,
    is_admin: boolean,
    is_owner: boolean,
    chosen: boolean
}

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
    chosen: boolean;
}

interface requestMetaData {
    invitation_id: number,
    inviter_id: number,
    inviter_name: string,
    inviter_avatar: string,
    invitee_id: number,
    invitee_name: string,
    invitee_avatar: string
}

interface detailProps {
    chatID: string,
    chatName: string,
    myID: string,
    group: string,
    sticked: string
    silent: string,
    validation: string
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
    const [members, setMembers] = useState<memberMetaData[]>();
    const [notice, setNotice] = useState<string>("");
    const [showPopUpMembers, setShowPopUpMembers] = useState<boolean>(false);
    const [showPopUpNoticeBoard, setShowPopUpNoticeBoard] = useState<boolean>(false);
    const [showPopUpNotice, setShowPopUpNotice] = useState<boolean>(false);
    const [silent, setSilent] = useState<boolean>(props.silent === "1");
    const [top, setTop] = useState<boolean>(props.sticked === "1");
    const [validation, setValidation] = useState<boolean>(props.validation === "1");
    const [newNotice, setNewNOtice] = useState<string>("");

    const [otherFriends, setOtherFriends] = useState<Friend[]>();
    const [invitees, setInvitees] = useState<number[]>([]);
    const [showInvite, setShowInvite] = useState<boolean>(false);
    const [showRemove, setShowRemove] = useState<boolean>(false);
    const [removed, setRemoved] = useState<number[]>([]);

    const [myFriends, setMyFriends] = useState<Friend[]>();
    const [groupName, setGroupName] = useState<string>("");
    const [who, setWho] = useState<number>();

    const [showReq, setShowReq] = useState<boolean>(false);
    const [requests, setRequests] = useState<requestMetaData[]>();

    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [records, setRecords] = useState<MsgMetaData[]>();
    const [refreshingRecords, setRefreshingRecords] = useState<boolean>(true);

    const selectRef = useRef<HTMLSelectElement>(null);
    const [sender, setSender] = useState<number>();
    const [content, setContent] = useState<string>();

    const [showSenders, setShowSenders] = useState<boolean>(false);
    const [showContentInput, setShowContentInput] = useState<boolean>(false);

    const [newContent, setNewContent] = useState<string>("");

    const [displaySelect, setDisplaySelect] = useState<boolean>(true);

    const [whoseAvatar, setWhoseAvatar] = useState<string>();
    const [myAvatar, setMyAvatar] = useState<string>();
    const [myName, setMyname] = useState<string>();

    const [showSecondValid, setShowSecondValid] = useState<boolean>(false);
    const [showPwdInput, setShowPwdInput] = useState<boolean>(false);
    const [pwd, setPwd] = useState<string>("");

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
                        console.log("群成员", data.members);
                        setMembers(data.members.map((member: any) => ({ ...member })));
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
            fetch(
                "/api/user/get_group_invitations/",
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
                        setRequests(data.invitations.map((invitation: any) => ({ ...invitation })));
                    }
                    else {
                        throw new Error(`拉取入群邀请: ${data.info}`);
                    }
                })
                .catch((err) => alert("拉取入群邀请: " + err));
        }
        // }
        // else if (props.group === "0") {
        //     setRefreshing(false);
        // }
    }, [props]);

    useEffect(() => {
        const getOtherFriends = () => {
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
                            avatar: friend.avatar,
                            chosen: false
                        }));
                        // TODO: 筛选
                        let newArray: Friend[] = [];
                        friends.forEach((friend: Friend) => {
                            if (!alreadyInGroup(friend.user_id)) {
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
            for (let admin of admins!) {
                if (admin.id === friend_id) {
                    return true;
                }
            }
            for (let memeber of members!) {
                if (memeber.id === friend_id) {
                    return true;
                }
            }
            return false;
        };
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
            console.log("不是我的锅");
            // setRefreshing(false);
        }
        else if (props.group === "0") {
            fetch(
                "/api/user/get_friend_by_conversation/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        conversation: props.chatID
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        console.log("对方是：" + data.friend.user_id);
                        setWho(data.friend.user_id);
                        setWhoseAvatar(data.friend.avatar);
                        setMyAvatar(data.user.avatar);
                        setMyname(data.user.name);
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
                            .then((data_2) => {
                                if (data_2.code === 0) {
                                    const friends = data_2.friends.map((friend: Friend) => ({
                                        user_id: friend.user_id,
                                        name: friend.name,
                                        avatar: friend.avatar
                                    }));
                                    const friendsButOppo: Friend[] = [];
                                    friends.forEach((friend: Friend) => {
                                        if (friend.user_id !== data.friend.user_id) {
                                            friendsButOppo.push(friend);
                                        }
                                    });
                                    setMyFriends(friendsButOppo);
                                } else {
                                    throw new Error(`${data.info}`);
                                }
                            })
                            .catch((err) => alert(err));
                    }
                    else {
                        throw new Error(`聊天获取对方id: ${data.info}`);
                    }
                })
                .catch((err) => alert(err));
            // setRefreshing(false);
        }
    }, [owner, admins, members, props]);

    useEffect(() => {
        if (props.group === "1") {
            if (otherFriends !== undefined && requests !== undefined) {
                setRefreshing(false);
            }
        }
        else if(props.group === "0") {
            if(myFriends !== undefined && who !== undefined && whoseAvatar !== undefined) {
                setRefreshing(false);
            }
        }
    }, [myFriends, otherFriends, props, who, requests, whoseAvatar]);

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

    // 邀请新成员（能不能改成列表啊）
    const invite = () => {
        fetch(
            hasPermit ? "/api/user/admin_invite_member/" : "/api/user/invite_member_to_group/",
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
                    alert(hasPermit ? "已拉取入群" : "已发送邀请");
                    console.log("邀请：", invitees);
                    router.push(`/user/msg/chat?id=${props.chatID}&name=${props.chatName}&group=${props.group}&sticked=${top ? 1 : 0}&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const startGroup = () => {
        console.log("拉取建群的人: ", invitees);
        fetch(
            "/api/user/create_group_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    members: invitees,
                    name: groupName
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    alert("成功创建群聊");
                    router.push(`/user/msg/chat?id=${props.chatID}&name=${props.chatName}&group=${props.group}&sticked=${top ? 1 : 0}&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const closeInvite = () => {
        setShowInvite(false);
        setInvitees([]);
        setGroupName("");
    };

    const closeRemove = () => {
        setShowRemove(false);
        setRemoved([]);
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
        if (props.group === "0") {
            setInvitees((memberList) => [...memberList, who!]);
        }
    };

    const addOrRemoveSuckers = (id: number) => {
        console.log("被选中移除的", removed);
        const index = removed.indexOf(id);
        if (index !== -1) {
            let newArray = [...removed];
            newArray.splice(index, 1);
            setRemoved(newArray);
        }
        else {
            setRemoved((memeberList) => [...memeberList, id]);
        }
    };

    const remove = () => {
        console.log("members", members);
        console.log("removed", removed);
        fetch(
            "/api/user/remove_member_from_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: props.chatID,
                    members: removed
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("已移除成员");
                    console.log("移除：", removed);
                    router.push(`/user/msg/chat?id=${props.chatID}&name=${props.chatName}&group=${props.group}&sticked=${top ? 1 : 0}&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const makeOrUnmakeTop = (isTop: boolean) => {
        const sticky = isTop ? "False" : "True";
        fetch(
            "/api/user/set_sticky_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    conversation: props.chatID,
                    sticky: sticky
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log(isTop ? "取消置顶" : "设为置顶");
                    setTop(!isTop);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const setOrUnsetValidation = (validated: boolean) => {
        const valid = validated ? "False" : "True";
        if(validated) {
            setShowPwdInput(true);
        }
        else {
            fetch(
                "/api/user/set_validation/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        conversation: props.chatID,
                        valid: "True"
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if(data.code === 0) {
                        setValidation(true);
                        setShowSecondValid(false);
                        alert("成功设置二次验证");
                    }
                    else {
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => alert("设置二次验证: "+err));
        }
    };

    const checkPwd = (password: string) => {
        fetch(
            "/api/user/secondary_validate/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    password: password
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if(data.code === 0) {
                    if(data.Valid) {
                        console.log("二级密码正确");
                        setValidation(false);
                        fetch(
                            "/api/user/set_validation/",
                            {
                                method: "POST",
                                credentials: "include",
                                body: JSON.stringify({
                                    token: localStorage.getItem("token"),
                                    conversation: props.chatID,
                                    valid: "False"
                                })
                            }
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                if(data.code === 0) {
                                    setShowSecondValid(false);
                                    alert("解除二次验证"); 
                                }
                                else {
                                    throw new Error(`${data.info}`);
                                }
                            })
                            .catch((err) => alert("解除二次验证: "+err));
                    }
                    else {
                        alert("密码错误");
                    }
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert("检查二级密码: "+err));
    };

    const makeOrUnmakeSilent = (isSilent: boolean) => {
        const silent = isSilent ? "False" : "True";
        fetch(
            "/api/user/set_silent_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    conversation: props.chatID,
                    silent: silent
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log(isSilent ? "取消免打扰" : "设为免打扰");
                    setSilent(!isSilent);
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        if(top === undefined && silent === undefined && validation !== undefined) {
            return;
        }
        router.push(`/user/msg/chat?id=${props.chatID}&name=${props.chatName}&group=${props.group}&sticked=${top ? 1 : 0}&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`);
    }, [top, silent, validation]);

    const deleteFriend = () => {
        fetch(
            "/api/user/del_friend",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    friend_user_id: who
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    alert("删除成功");
                    router.push("/user");
                }
                else {
                    throw new Error(`从详情页删除好友: ${data.info}`);
                }
            })
            .catch((err) => alert("从详情页删除好友: " + err));
    };

    const dismissOrQuit = () => {
        if (props.myID === owner?.id.toString()) {  // 群主解散群聊
            fetch(
                "/api/user/dismiss_group_conversation/",
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
                        alert("解散成功");
                        router.push("/user");
                    }
                    else {
                        throw new Error(`解散群聊: ${data.info}`);
                    }
                })
                .catch((err) => alert("解散群聊: " + err));
        }
        else {  // 非群主退出群聊
            fetch(
                "/api/user/leave_group_conversation/",
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
                        alert("已退出群聊");
                        router.push("/user");
                    }
                    else {
                        throw new Error(`退出群聊${data.info}`);
                    }
                })
                .catch((err) => alert("退出群聊" + err));
        }
    };

    const flushRequests = () => {
        fetch(
            "/api/user/get_group_invitations/",
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
                    setRequests(data.invitations.map((invitation: any) => ({ ...invitation })));
                }
                else {
                    throw new Error(`拉取入群邀请: ${data.info}`);
                }
            })
            .catch((err) => alert("拉取入群邀请: " + err));
    };

    const consent = (invitation_id: number) => {
        fetch(
            "/api/user/respond_group_invitation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    invitation: invitation_id,
                    group: props.chatID,
                    response: "accept"
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("同意进群邀请");
                    flushRequests();
                }
                else {
                    throw new Error(`同意进群邀请: ${data.info}`);
                }
            })
            .catch((err) => alert("同意进群邀请" + err));
    };

    const reject = (invitation_id: number) => {
        fetch(
            "/api/user/respond_group_invitation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    invitation: invitation_id,
                    group: props.chatID,
                    response: "reject"
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("拒绝进群邀请");
                    flushRequests();
                }
                else {
                    throw new Error(`拒绝进群邀请: ${data.info}`);
                }
            })
            .catch((err) => alert("拒绝进群邀请" + err));
    };

    const openFilter = () => {
        setShowFilter(true);
        setRefreshingRecords(true);
        setSender(undefined);
        setContent(undefined);
        fetch(
            "/api/user/query_all_records/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    conversation: props.chatID
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if(data.code === 0) {
                    console.log("获取聊天记录成功");
                    // message是后端发过来的消息们
                    // 消息列表
                    console.log(data.messages);
                    setRecords(data.messages
                        // 如果这个人的id在删除列表里，就不显示消息
                        .filter((val: any) => !val.delete_members?.some((user: any) => user === props.myID))
                        .map((val: any) => ({ ...val }))
                    );
                }
                else {
                    throw new Error(`获取全部聊天记录失败: ${data.info}`);
                }
            })
            .catch(((err) => alert("获取聊天记录: "+err)));
    };

    useEffect(() => {
        if(records !== undefined) {
            console.log("records: ", records);
            setRefreshingRecords(false);
        }
    }, [records]);

    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msgBody.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    const closeFilter = () => {
        setShowFilter(false);
        setRefreshingRecords(true);
    };

    const handleSelect = (value: string) => {
        if(value === "filter_by_sender") {  // 按发送者筛选
            setShowSenders(true);
        }
        else if(value === "filter_by_image" || value === "filter_by_video" || value === "filter_by_audio" || value === "filter_by_file") {
            // 按类型筛选
            const type = value.slice(10);
            console.log("按类型筛选: ", type);
            fetch(
                "/api/user/query_by_type/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        conversation: props.chatID,
                        type: type
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if(data.code === 0) {
                        console.log(`根据类型${type}筛选成功`);
                        setRecords(data.messages
                            // 如果这个人的id在删除列表里，就不显示消息
                            .filter((val: any) => !val.delete_members?.some((user: any) => user === props.myID))
                            .map((val: any) => ({ ...val }))
                        );
                    }
                    else {
                        throw new Error(`根据类型${type}筛选失败: ${data.info}`);
                    }
                })
                .catch((err) => alert(`根据类型${type}筛选失败: `+err));
        }
        else if(value === "filter_by_content") {  // 按内容筛选
            setShowContentInput(true);
        }
        else {
            return;
        }
        setDisplaySelect(false);
    };

    useEffect(() => {
        if(sender !== undefined) {
            console.log("按发送者筛选: ",sender);
            fetch(
                "/api/user/query_by_sender/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        conversation: props.chatID,
                        sender: sender
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if(data.code === 0) {
                        console.log("根据发送者筛选成功: ",data.messages);
                        setRecords(data.messages
                            // 如果这个人的id在删除列表里，就不显示消息
                            .filter((val: any) => !val.delete_members?.some((user: any) => user === props.myID))
                            .map((val: any) => ({ ...val }))
                        );
                    }
                    else {
                        throw new Error(`根据发送者筛选失败: ${data.info}` );
                    }
                })
                .catch((err) => alert("根据发送者筛选失败: "+err));
        }
    }, [sender, props]);

    useEffect(() => {
        if(content !== undefined) {
            fetch(
                "/api/user/query_by_content/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        conversation: props.chatID,
                        content: content
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if(data.code === 0) {
                        console.log(`根据类型${content}筛选成功`);
                        setRecords(data.messages
                            // 如果这个人的id在删除列表里，就不显示消息
                            .filter((val: any) => !val.delete_members?.some((user: any) => user === props.myID))
                            .map((val: any) => ({ ...val }))
                        );
                    }
                    else {
                        throw new Error(`根据内容${content}筛选失败: ${data.info}`);
                    }
                })
                .catch((err) => alert(`根据类型${content}筛选失败: `+err));
        }
    }, [content, props]);

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
                        <FontAwesomeIcon className="adminicon" icon={faKey} onClick={() => {setShowSecondValid(true);}} />
                        <p className="admininfo">二级密码</p>
                    </div>
                    <div className="adminbutton" onClick={() => { makeOrUnmakeSilent(silent); }}>
                        <FontAwesomeIcon className="adminicon" icon={silent ? faBell : faBellSlash} />
                        <p className="admininfo">{silent ? "解除免打扰" : "设为免打扰"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { makeOrUnmakeTop(top); }}>
                        <FontAwesomeIcon className="adminicon" icon={top ? faArrowDown : faArrowsUpToLine} />
                        <p className="admininfo">{top ? "取消置顶" : "置顶"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setShowInvite(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserPlus} />
                        <p className="admininfo">邀请</p>
                    </div>
                    {hasPermit && <div className="adminbutton" onClick={() => { setShowRemove(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserMinus} />
                        <p className="admininfo">移除成员</p>
                    </div>}
                    {hasPermit && <div className="adminbutton" onClick={() => { setShowReq(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserCheck} />
                        <p className="admininfo">入群请求</p>
                    </div>}
                    <div className="adminbutton" onClick={() => { dismissOrQuit(); }}>
                        <FontAwesomeIcon className="quiticon" icon={faXmark} />
                        <p className="admininfo">{props.myID === owner?.id.toString() ? "解散群聊" : "退出"}</p>
                    </div>
                    {hasPermit && <div className="adminbutton" onClick={() => { setShowReq(true); }}>
                        <FontAwesomeIcon className="quiticon" icon={faUserPlus} />
                        <p className="admininfo">入群请求</p>
                    </div>}
                    <div className="adminbutton" onClick={() => { openFilter(); setDisplaySelect(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faNoteSticky} />
                        <p className="admininfo">筛选消息</p>
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
            {/* 邀请 */}
            {showInvite && (
                <div className="popup" style={{ padding: "20px", height: "auto" }}>
                    <ul className="startgroupchoice">
                        {otherFriends?.map((item) => (
                            <div className="startgroupchoicebox" key={item.user_id} style={{ backgroundColor: `${item.chosen ? "#0660e9" : "white"}` }} onClick={() => { item.chosen = !item.chosen; addOrRemoveGroupMember(item.user_id); }}>
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
                    <button onClick={() => { invite(); closeInvite(); }} disabled={invitees.length === 0}>
                        完成
                    </button>
                </div>
            )}
            {/* 踢人 */}
            {(hasPermit && showRemove) && (
                <div className="popup" style={{ padding: "20px", height: "auto" }}>
                    <ul className="startgroupchoice">
                        {/* 只有群主可以移除管理员 */}
                        {(props.myID === owner?.id.toString()) && admins?.map((item) => ((
                            <div className="startgroupchoicebox" key={item.id} style={{ backgroundColor: `${item.chosen ? "#0660e9" : "white"}` }} onClick={() => { item.chosen = !item.chosen; addOrRemoveSuckers(item.id); }}>
                                <li
                                    className="navbar_ele_info"
                                    style={{ display: "flex", width: "100%" }}>
                                    <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                    <p style={{ color: "black" }}>{item.name}</p>
                                </li>
                            </div>
                        )))}
                        {/* 管理员和群主都可以移除其他成员 */}
                        {members?.map((item) => ((
                            <div className="startgroupchoicebox" key={item.id} style={{ display: "flex", flexDirection: "row" }}>
                                <input
                                    type="checkbox"
                                    className="startgroupcheckbox"
                                    onClick={() => { addOrRemoveSuckers(item.id); }}
                                />
                                <li
                                    className="navbar_ele_info"
                                    style={{ display: "flex", width: "100%" }}>
                                    <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                    <p style={{ color: "black" }}>{item.name}</p>
                                </li>
                            </div>
                        )))}
                    </ul>
                    <button onClick={() => { closeRemove(); }}>
                        取消
                    </button>
                    <button onClick={() => { remove(); closeRemove(); }} disabled={removed.length === 0}>
                        完成
                    </button>
                </div>
            )}
            {/* 处理入群请求 */}
            {(hasPermit && showReq) && (
                <div className="popup" style={{ padding: "20px", height: "auto", width: "auto" }}>
                    <ul className="startgroupchoice">
                        {requests?.map((item) => (
                            <div className="startgroupchoicebox" key={item.invitation_id} style={{ backgroundColor: "white", border: "0" }}>
                                <li
                                    className="navbar_ele_info"
                                    style={{ display: "flex", width: "100%" }}>
                                    <img className="sender_avatar" src={`${item.invitee_avatar}`} alt="oops" />
                                    <p style={{ color: "black" }}>{item.invitee_name}</p>
                                </li>
                                <button className="accept" onClick={() => { consent(item.invitation_id); }} style={{fontSize:"15px", border:"0", margin: "auto 10px"}}>同意</button>
                                <button className="reject" onClick={() => { reject(item.invitation_id); }} style={{fontSize:"15px", border:"0", margin: "auto 10px"}}>拒绝</button>
                            </div>
                        ))}
                    </ul>
                    <button onClick={() => { setShowReq(false); router.push(`/user/msg/chat?id=${props.chatID}&name=${props.chatName}&group=${props.group}&sticked=${top ? 1 : 0}&silent=${silent ? 1 : 0}&validation=${validation ? 1 : 0}`); }}>
                        返回
                    </button>
                </div>
            )}
            {/* 查看聊天记录 */}
            {showFilter && (
                refreshingRecords ? (
                    <div className="popup" style={{padding: "20px", height: "auto"}}>
                        正在加载聊天记录......
                        <button onClick={() => { closeFilter(); }}>
                            取消
                        </button>
                    </div>
                ) : (
                    <div className="popup" style={{padding: "20px", height: "auto"}}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {records?.length === 0 && (
                                <div className="msg">
                                    无相关记录
                                </div>
                            )}
                            {records?.map((msg) => (
                                <div key={msg.msg_id} className={msg.chosen?"msgchosen":"msg"}>
                                    <div className={msg.sender_id.toString() !== props.myID ? "msgavatar" : "mymsgavatar"}>
                                        <img className="sender_avatar" src={msg.sender_avatar} />
                                    </div>
                                    <div id={`msg${msg.msg_id}`} className={msg.sender_id.toString() !== props.myID ? "msgmain" : "mymsgmain"}>
                                        <p className={msg.sender_id.toString() !== props.myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
                                        {msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
                                            (msg.is_video === true ? <a id="videoLink" href={msg.msg_body} title="下载视频" >
                                                <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E8%A7%86%E9%A2%91_%E7%BC%A9%E5%B0%8F.png" alt="📹"
                                                    style={{ width: "100%", height: "auto" }} />
                                            </a> :
                                                (msg.is_file === true ? <a id="fileLink" href={msg.msg_body} title="下载文件" >
                                                    <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E6%96%87%E4%BB%B6%E5%A4%B9-%E7%BC%A9%E5%B0%8F.png" alt="📁"
                                                        style={{ width: "100%", height: "auto" }} />
                                                </a> :
                                                    (msg.is_audio === true ? <a>
                                                        {<audio src={msg.msg_body} controls />}
                                                    </a> :
                                                        <p className={msg.sender_id.toString() !== props.myID ? "msgbody" : "mymsgbody"}
                                                            dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                                        ></p>)))
                                        }
                                        <p className={msg.sender_id.toString() !== props.myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        { displaySelect && <div className="multidisplay">
                            <select name="filter_by" ref={selectRef} onChange={(e) => handleSelect(e.target.value)}>
                                <option value={"filter_all"}>
                                    全部
                                </option>
                                <option value={"filter_by_sender"}>
                                    发送者
                                </option>
                                <option value={"filter_by_image"}>
                                    图片
                                </option>
                                <option value={"filter_by_video"}>
                                    视频
                                </option>
                                <option value={"filter_by_audio"}>
                                    语音
                                </option>
                                <option value={"filter_by_file"}>
                                    文件
                                </option>
                                <option value={"filter_by_content"}>
                                    内容
                                </option>                                                                
                            </select>
                        </div>}
                        <button onClick={() => { closeFilter(); }}>
                            返回
                        </button>
                    </div>
                ))}
            {showSenders && (
                <p className="members">
                    {/* <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowSenders(false); }} /> */}
                    <div className="membersort">
                        <div key={0} className="member" onClick={() => { setSender(owner?.id); setShowSenders(false); }}>
                            <img className="sender_avatar" style={{ borderColor: "#0660e9" }} src={`${owner?.avatar}`} alt="oops" />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "30px" }}>{owner?.name}</p>
                            <p className="owner">群主</p>
                        </div>
                    </div>
                    <div className="membersort">
                        {admins?.map((admin) => (
                            <div key={admin.id} className="member" onClick={() => { setSender(admin.id); setShowSenders(false); }}>
                                <img className="sender_avatar" src={`${admin?.avatar}`} alt="oops" />
                                <p style={{ color: "black", margin: "auto 10px", fontSize: "25px" }}>{admin?.name}</p>
                                <p className="admin">管理员</p>
                            </div>
                        ))}
                    </div>
                    <div className="membersort">
                        {members?.map((member) => (
                            <div key={member.id} className="member" onClick={() => { setSender(member.id); setShowSenders(false); }}>
                                <img className="sender_avatar" src={`${member?.avatar}`} alt="oops" />
                                <p style={{ color: "black", margin: "auto 10px" }}>{member?.name}</p>
                            </div>
                        ))}
                    </div>
                </p>
            )}
            {showContentInput && (
                <div className="popup">
                    <input
                        placeholder="输入检索内容"
                        onChange={(e) => { setNewContent(e.target.value); }}
                    />
                    <button onClick={() => { setShowContentInput(false); setNewContent(""); }}>
                        取消
                    </button>
                    <button onClick={() => { setContent(newContent); setShowContentInput(false); setNewContent(""); }} disabled={newContent.length === 0}>
                        完成
                    </button>
                </div>
            )}
            {showSecondValid && (
                <div className="popup">
                    <button onClick={() => { setOrUnsetValidation(validation); }}>
                        {validation ? "解除二次验证" : "开启二次验证"}
                    </button>
                    {/* <button onClick={() => { submitNotice(); setNotice(newNotice); closeNoticeBoard(); }} disabled={newNotice.length === 0}>
                        完成
                    </button> */}
                </div>
            )}
            {showPwdInput && (
                <div className="popup">
                    <input
                        placeholder="输入本账号的登录密码"
                        onChange={(e) => { setPwd(e.target.value); }}
                    />
                    <button onClick={() => { setShowPwdInput(false); setPwd(""); }}>
                        取消
                    </button>
                    <button onClick={() => { checkPwd(pwd); setShowPwdInput(false); setPwd(""); }} disabled={pwd.length !== 6}>
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
                    <div className="adminbutton" onClick={() => { makeOrUnmakeSilent(silent); }}>
                        <FontAwesomeIcon className="adminicon" icon={silent ? faBell : faBellSlash} />
                        <p className="admininfo">{silent ? "解除免打扰" : "设为免打扰"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { makeOrUnmakeTop(top); }}>
                        <FontAwesomeIcon className="adminicon" icon={top ? faArrowDown : faArrowsUpToLine} />
                        <p className="admininfo">{top ? "取消置顶" : "置顶"}</p>
                    </div>
                    <div className="adminbutton" onClick={() => { setShowInvite(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faUserPlus} />
                        <p className="admininfo">邀请好友建立群聊</p>
                    </div>
                    <div className="adminbutton" onClick={() => { deleteFriend(); }}>
                        <FontAwesomeIcon className="quiticon" icon={faXmark} />
                        <p className="admininfo">删除好友</p>
                    </div>
                    <div className="adminbutton" onClick={() => { openFilter(); setDisplaySelect(true); }}>
                        <FontAwesomeIcon className="adminicon" icon={faNoteSticky} />
                        <p className="admininfo">筛选消息</p>
                    </div>
                </div>
            </div>
            {showInvite && (
                <div className="popup">
                    <ul className="startgroupchoice">
                        <input onChange={(e) => setGroupName(e.target.value)} placeholder="群聊名称" />
                        {myFriends?.map((item) => (
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
                    <button onClick={() => { startGroup(); closeInvite(); }} disabled={invitees.length === 0 || groupName.length === 0}>
                        完成
                    </button>
                </div>
            )}
            {/* 查看聊天记录 */}
            {showFilter && (
                refreshingRecords ? (
                    <div className="popup" style={{padding: "20px", height: "auto"}}>
                        正在加载聊天记录......
                        <button onClick={() => { closeFilter(); }}>
                            取消
                        </button>
                    </div>
                ) : (
                    <div className="popup" style={{padding: "20px", height: "auto"}}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {records?.length === 0 && (
                                <div className="msg">
                                    无相关记录
                                </div>
                            )}
                            {records?.map((msg) => (
                                <div key={msg.msg_id} className={msg.chosen?"msgchosen":"msg"}>
                                    <div className={msg.sender_id.toString() !== props.myID ? "msgavatar" : "mymsgavatar"}>
                                        <img className="sender_avatar" src={msg.sender_avatar} />
                                    </div>
                                    <div id={`msg${msg.msg_id}`} className={msg.sender_id.toString() !== props.myID ? "msgmain" : "mymsgmain"}>
                                        <p className={msg.sender_id.toString() !== props.myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
                                        {msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
                                            (msg.is_video === true ? <a id="videoLink" href={msg.msg_body} title="下载视频" >
                                                <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E8%A7%86%E9%A2%91_%E7%BC%A9%E5%B0%8F.png" alt="📹"
                                                    style={{ width: "100%", height: "auto" }} />
                                            </a> :
                                                (msg.is_file === true ? <a id="fileLink" href={msg.msg_body} title="下载文件" >
                                                    <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E6%96%87%E4%BB%B6%E5%A4%B9-%E7%BC%A9%E5%B0%8F.png" alt="📁"
                                                        style={{ width: "100%", height: "auto" }} />
                                                </a> :
                                                    (msg.is_audio === true ? <a>
                                                        {<audio src={msg.msg_body} controls />}
                                                    </a> :
                                                        <p className={msg.sender_id.toString() !== props.myID ? "msgbody" : "mymsgbody"}
                                                            dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                                        ></p>)))
                                        }
                                        <p className={msg.sender_id.toString() !== props.myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        { displaySelect && <div className="multidisplay">
                            <select name="filter_by" ref={selectRef} onChange={(e) => handleSelect(e.target.value)}>
                                <option value={"filter_all"}>
                                    全部
                                </option>
                                <option value={"filter_by_sender"}>
                                    发送者
                                </option>
                                <option value={"filter_by_image"}>
                                    图片
                                </option>
                                <option value={"filter_by_video"}>
                                    视频
                                </option>
                                <option value={"filter_by_audio"}>
                                    语音
                                </option>
                                <option value={"filter_by_file"}>
                                    文件
                                </option>
                                <option value={"filter_by_content"}>
                                    内容
                                </option>                                                                
                            </select>
                        </div>}
                        <button onClick={() => { closeFilter(); }}>
                            返回
                        </button>
                    </div>
                ))}
            {showSenders && (
                <p className="members">
                    <div className="membersort">
                        <div key={0} className="member" onClick={() => { setSender(parseInt(props.myID)); setShowSenders(false); }}>
                            <img className="sender_avatar" style={{ borderColor: "#0660e9" }} src={`${myAvatar}`} alt="oops" />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "30px" }}>{myName}</p>
                            <p className="owner">我</p>
                        </div>
                    </div>
                    <div className="membersort">
                        <div key={1} className="member" onClick={() => { setSender(who); setShowSenders(false); }}>
                            <img className="sender_avatar" style={{ borderColor: "#0660e9" }} src={`${myAvatar}`} alt="oops" />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "30px" }}>{props.chatName}</p>
                        </div>
                    </div>
                </p>
            )}
            {showContentInput && (
                <div className="popup">
                    <input
                        placeholder="输入检索内容"
                        onChange={(e) => { setNewContent(e.target.value); }}
                    />
                    <button onClick={() => { setShowContentInput(false); setNewContent(""); }}>
                        取消
                    </button>
                    <button onClick={() => { setContent(newContent); setShowContentInput(false); setNewContent(""); }} disabled={newContent.length === 0}>
                        完成
                    </button>
                </div>
            )}
        </div>
    ));
};

export default DetailsPage;