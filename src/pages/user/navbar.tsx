import { useRouter } from "next/router";
import Link from 'next/link';

function Navbar() {
    
    const router = useRouter();
    const cookie = router.query.cookie;

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
            <ul>
                <li>
                    <Link href={`/user/?cookie=${document.cookie}`}>
                        消息
                    </Link>
                </li>
                <li>
                    <Link href={`/user/friends?cookie=${document.cookie}`}>
                        好友
                    </Link>
                </li>
                <li className="logout">
                    <Link href={`/user/info?cookie=${document.cookie}`}>
                        个人中心
                    </Link>
                </li>
                <li className="logout">
                    <Link href="/" onClick={userLogout}>
                        登出
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;