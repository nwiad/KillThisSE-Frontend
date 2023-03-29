import { time } from "console";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX } from "../../constants/string";
import { request } from "../../utils/network";
import { UserMetaData } from "../../utils/type";

const User_list = () => {

    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [userList, setUserList] = useState<UserMetaData[]>([]); 

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        fetchList();
    }, [router, query]);

    const fetchList = () => {
        setRefreshing(true);
        request("/api/users", "GET")
            .then((res) => {
                setUserList(res.users.map((val: any) => ({ ...val, name: val.name })));
                setRefreshing(false);
            })
            .catch((err) => {
                alert(FAILURE_PREFIX + err);
                setRefreshing(false);
            });
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style={{ padding: 12 }}>
            {userList.length === 0 ? (
                <p> Empty list. </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>{
                    userList.map(x => 
                        <div style={{ padding: 12 }} key={x.user_id}>
                            <div> Name: {x.name} </div>
                        </div>
                    )
                }</div>
            )}
        </div>
    );
};

export default User_list;
