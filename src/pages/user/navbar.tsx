import { useRouter } from "next/router";

const Navbar = () => {
    
    const router = useRouter();

    const userLogout = () => {

        fetch(
            "api/user/logout/",
            {
                method:"POST",
                credentials: "include",
            }
        )
            .then((res) => {
                if(res.ok){
                    router.push("/");
                    document.cookie = "session=logout; path=/;";
                }   else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <nav style={{padding: 12}}>
            <ul className="navbar">
                <li className="navbar_ele_r" onClick={() => {router.push("/user/");}}>
                        消息
                </li>
                <li className="navbar_ele_r" onClick={() => {router.push("/user/friendindex");}}>
                        好友
                </li>
                <li className="navbar_ele_l" onClick={() => {router.push("/user/info");}}>
                        个人中心
                </li>
                <li className="navbar_ele_l" onClick={() => {userLogout(); router.push("/");}}>
                        登出
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;