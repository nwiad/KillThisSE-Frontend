import { useRouter } from "next/router";
import FriendBar from "./friendbar";
import { useEffect, useState } from "react";

interface Group {
    group_id: number;
    group_name: string;
    admin_id: number;
}

const InitPage = () => {

    const router = useRouter();
    const id = router.query.id;
    const [showPopupGrouptoAdd, setShowPopupGrouptoAdd] = useState(false);
    const [groupsList, setGroupsList] = useState<Group[]>([]);

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
            .catch((err) => alert(err));
    }, []);

    const sendDelete = async () => {
        await fetch(
            "/api/user/del_friend/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    friend_user_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("成功");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };

    const addtoGroup = async (groupID:number) => {
        alert(groupID);
        await fetch(
            "/api/user/add_friend_to_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    group_id: groupID,
                    friend_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("成功");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };

    return (
        <div>
            <FriendBar />
            <button className="addtoGroup" onClick={() => { setShowPopupGrouptoAdd(true) }}>
                加入分组
            </button>
            {showPopupGrouptoAdd && (
                <div className="popupGrouptoAdd">
                    <ul>
                        <li id="title">
                            请选择需要加入的分组
                        </li>
                        {groupsList?.map((item: Group) => (
                            <li key={item.group_id} onClick={() => {addtoGroup(item.group_id) }}>
                                {item.group_name}
                            </li>
                        ))}
                        <li onClick={() => { setShowPopupGrouptoAdd(false)}}>
                            取消
                        </li>
                    </ul>
                </div>
            )}
            <button className="deleteFriend" onClick={() => { sendDelete(); }}>
                删除此好友
            </button>
        </div>
    );
};

export default InitPage;