import { useRouter } from "next/router";
import { useEffect } from "react";
import MsgBar from "./msg/msgbar";

const InitPage = () => {
    
    const router = useRouter();

    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        localStorage.setItem("myID", router.query.id as string);
    }, [router]);

    return (
        <div>
            <MsgBar />
        </div>
    );
};

export default InitPage;