import { useRouter } from "next/router";
import Link from 'next/link';

const Navbar = ({cookie} : {cookie:string|string[]|undefined}) => {
    
    const router = useRouter();

    if (typeof cookie === 'string') {
        document.cookie = cookie;
    } else {
      alert('Cookie not found');
    }

    const userLogout = () => {
        fetch(
            "api/user/logout",
            {
                method:"DELETE",
                credentials: 'include',
            }
        )
            .then((res) => {
                if(res.ok){
                    router.push("/")
                }   else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <nav style={{padding: 12}}>
            <ul className="navbar">
                <li className="navbar_ele_r" onClick={() => {router.push(`/user/?cookie=${document.cookie}`)}}>
                        消息
                </li>
                <li className="navbar_ele_r" onClick={() => {router.push(`/user/friendindex?cookie=${document.cookie}`)}}>
                        好友
                </li>
                <li className="navbar_ele_l" onClick={() => {router.push(`/user/info?cookie=${document.cookie}`)}}>
                        个人中心
                </li>
                <li className="navbar_ele_l" onClick={() => {userLogout; router.push(`/`)}}>
                        登出
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;