import Picker from "@emoji-mart/react";
import { faFaceSmile, faFile, faFileAudio, faImage, faPaperPlane, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useRouter } from "next/router";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { uploadFile } from "../../../utils/oss";
import { MemberMetaData, MsgMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import { transform } from "../../../utils/youdao";
import Navbar from "../navbar";
import DetailsPage from "./details";
import MsgBar from "./msgbar";

const ChatScreen = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosStart, setCursorPosStart] = useState<number | null>(null);
    const [cursorPosEnd, setCursorPosEnd] = useState<number | null>(null);

    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [msgList, setMsgList] = useState<MsgMetaData[]>([]);
    const [memberList, setmemberList] = useState<MemberMetaData[]>([]);
    const [myID, setID] = useState<number>();
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const query = router.query;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // image
    const [newimg, setNewImg] = useState<File>();
    const [isImgUploaded, setIsImgUploaded] = useState(false);
    const [showPopupImg, setShowPopupImg] = useState(false);
    // video
    const [newvideo, setNewVideo] = useState<File>();
    const [isVideoUploaded, setIsVideoUploaded] = useState(false);
    const [showPopupVideo, setShowPopupVideo] = useState(false);
    // file
    const [newfile, setNewFile] = useState<File>();
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [showPopupFile, setShowPopupFile] = useState(false);
    // audio
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");

    // const [mediaRecorder,setmediaRecorder]= useRef<MediaRecorder>(new MediaRecorder(new MediaStream()));
    const mediaRecorder = useRef<MediaRecorder | undefined>();

    const socket = useRef<Socket>();

    const [chatID, setChatID] = useState<string>();
    const [chatName, setChatName] = useState<string>();
    const [isGroup, setIsGroup] = useState<string>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [showPopupMention, setShowPopupMention] = useState(false);
    const [popupMentionPosition, setPopupMentionPosition] = useState({ x: 0, y: 0 });

    const [sticked, setSticked] = useState<string>();
    const [silent, setSilent] = useState<string>();

    // 功能：切换emoji显示
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(showEmojiPicker => !showEmojiPicker);
    };
    // 功能：处理emoji点击
    const handleEmojiClick = (emoji: { native: string; }) => {
        setMsg(inputValue + emoji.native);
        setInput(inputValue + emoji.native);
        setShowEmojiPicker(false);
    };
    useEffect(() => {
        setMsg(inputValue);
    }, [inputValue]);
    const sendPublic = async (isImg?: boolean, isFile?: boolean, isVideo?: boolean) => {
        if (message === "") {
            return;
        }
        // 私聊直接发
        if (isGroup === "false") {
            socket.current!.send(JSON.stringify({
                message: inputValue, token: localStorage.getItem("token"),
                isImg: false, isFile: false, isVideo: false
            }));
        }
        else{
            // 群聊可能有@name
            // 表示该条消息提及了谁
            let mentioned_members = [];
            // message表示消息内容 从中提取是否有@name
            // 如果有，提取出来，然后发送消息
            const all = "全体成员";
            // 有@ 才检查是否有名字
            if(message.includes("@")) {
                console.log("有@");
                if (message.includes(`@${all}`)) {
                    // 如果包含全体成员，将所有用户名添加到提及成员的数组中
                    mentioned_members.push(memberList.map(member => member.user_name));
    
                }
                else //不是全体成员
                    for (let member of memberList){
                        // 检查消息中是否包含用户名
                        if (message.includes(`@${member.user_name}`)) {
                            // 如果包含，将用户名添加到提及成员的数组中
                            mentioned_members.push(member.user_name);
                        }
                    }
            }
            socket.current!.send(JSON.stringify({
                message: inputValue, token: localStorage.getItem("token"),
                isImg: false, isFile: false, isVideo: false,
                mentioned_members: mentioned_members
            }));
        }
    };

    const cleanUp = () => {
        console.log("回收");
        socket.current?.destroy();
    };

    // 功能：发送图片
    const sendPic = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到图片");
            return;
        }
        const image_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: image_url, token: localStorage.getItem("token"),
            is_image: true
        }));
    };

    // 功能：发送视频
    const sendVideo = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到视频文件");
            return;
        }
        const video_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: video_url, token: localStorage.getItem("token"),
            is_video: true
        }));
    };

    // 功能：发送文件
    const sendFile = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到文件");
            return;
        }
        const file_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: file_url, token: localStorage.getItem("token"),
            is_file: true
        }));
    };

    // 功能：创建链接
    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msgBody.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    // 开始/停止录音
    const handleRecording = async () => {
        // 如果正在录音
        if (recording) {
            const audioURL = await stopRecording();
            console.log("Recording stopped, audio URL:", audioURL);
            setRecording(false);
            sendAudio(audioURL);
        } else {
            startRecording();
            setRecording(true);
        }
    };

    // 开始录音
    const startRecording = async () => {
        if (typeof MediaRecorder === "undefined") {
            console.error("浏览器不支持 MediaRecorder API");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!stream) {
                console.error("Failed to obtain audio stream");
                return;
            }
            mediaRecorder.current = new MediaRecorder(stream);
            console.log("Created MediaRecorder", mediaRecorder, "with options", mediaRecorder.current!.stream);
            mediaRecorder.current.start();
            setRecording(true);
        } catch (err) {
            console.error("Failed to start recording: ", err);
        }
    };

    // 停止录音
    const stopRecording = async (): Promise<string> => {
        return new Promise(resolve => {
            if (typeof MediaRecorder === "undefined") {
                console.error("浏览器不支持 MediaRecorder API");
                return;
            }
            if (!mediaRecorder.current) {
                console.error("MediaRecorder is not initialized.");
                return;
            }
            mediaRecorder.current.stop();
            mediaRecorder.current.addEventListener("dataavailable", function onDataAvailable(e) {
                if (!mediaRecorder.current) {
                    console.error("MediaRecorder is not initialized.");
                    return;
                }
                mediaRecorder.current.removeEventListener("dataavailable", onDataAvailable); // 移除之前的事件监听器
                if (e.data && e.data.size > 0) {
                    const audioURL = URL.createObjectURL(e.data);
                    setAudioURL(audioURL);
                    resolve(audioURL);
                }
                else {
                    console.error("Failed to create audio URL from blob.");
                }
            });
            // 关闭音频流 释放麦克风资源
            const tracks = mediaRecorder.current.stream.getTracks();
            tracks.forEach(track => track.stop());
        });
    };

    // blob转file
    const blobToFile = (blob: Blob, name: string): File => {
        return new File([blob], name, { type: blob.type, lastModified: Date.now() });
    };

    // 发送语音
    const sendAudio = async (audioURL: string) => {
        try {
            const audioBlob = await (await fetch(audioURL)).blob();
            const audioFile = blobToFile(audioBlob, "recording.wav");
            const audioUrl = await uploadFile(audioFile);

            if (socket.current) {
                socket.current.send(JSON.stringify({
                    message: audioUrl,
                    token: localStorage.getItem("token"),
                    is_audio: true
                }));
            } else {
                console.error("Socket is not connected.");
            }
        } catch (err) {
            console.error("Failed to send audio: ", err);
        }
    };

    const handleMention = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const input = event.target as HTMLElement;
        const inputRect = input.getBoundingClientRect();
        const popupX = inputRect.left + window.scrollX;
        const popupY = inputRect.bottom + window.scrollY;
        setShowPopupMention(true);
        setPopupMentionPosition({ x: popupX, y: popupY });
    };

    function insertAtCursor(inputBase: HTMLElement | null, textToInsert: string) {
        const input = inputBase as HTMLInputElement;
        const currentValue = input?.value;
        if (cursorPosStart !== null && cursorPosEnd !== null) {
            setInput(currentValue.substring(0, cursorPosStart) + "@"+ textToInsert + currentValue.substring(cursorPosEnd));
            setMsg(currentValue.substring(0, cursorPosStart) + "@"+ textToInsert + currentValue.substring(cursorPosEnd));
        }

    }

    // This could be a button click event or something similar
    // async function forwardMessages() {
    //     // Here you would implement the forwarding of the messages
    //     // This will depend on your application's specific API or mechanism for forwarding messages
    //     // After forwarding, clear the selection
    //     selectedMessages = [];
    //     // And also remove the 'selected' class from the forwarded messages
    //     document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    // }
    // 功能：消息右键菜单
    const msgContextMenu = (event: ReactMouseEvent<HTMLElement, MouseEvent>, user_id: number, msg_id: number, msg_body: string, msg_is_audio: boolean, msg_owner: number, msg_time: string) => {
        event.preventDefault();

        const contextMenu = document.createElement("ul");
        contextMenu.className = "msgContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        // user_id指当前登录的用户
        // msg_owner指消息的发送者
        // 语音消息不能转发
        if (!msg_is_audio) {
            // 只有自己能撤回自己的消息
            if(user_id==msg_owner) {
                const withdrawItem = document.createElement("li");
                withdrawItem.className = "ContextMenuLi";
                withdrawItem.innerHTML = "撤回";
                withdrawItem.addEventListener("click", () => {
                    //TODO
                    // 如果现在时间减去消息时间少于5分钟，可以撤回
                    event.stopPropagation();
                    const now_time_str = new Date();

                    let now_time_use = moment(now_time_str, "ddd MMM DD YYYY HH:mm:ss Z");
                    let msg_time_use = moment(msg_time, "MM-DD HH:mm");

                    // 因为 msg_time 没有年份，需要给它加上
                    msg_time_use.year(now_time_use.year());

                    // 计算时间差，单位为分钟
                    let time_diff = now_time_use.diff(msg_time_use, "minutes");
                    if(time_diff > 5) {
                        alert("该消息发送超过5分钟，不能撤回");
                        return;
                    }
                    socket.current!.send(JSON.stringify({
                        message: msg_body, token: localStorage.getItem("token"),
                        withdraw_msg_id: msg_id
                    }));
                });
                contextMenu.appendChild(withdrawItem);
            }


            // 翻译按钮
            const translateItem = document.createElement("li");
            translateItem.className = "ContextMenuLi";
            translateItem.innerHTML = "翻译";
            translateItem.addEventListener("click", async (event) => {
                event.stopPropagation();
                const target = document.getElementById(`msg${msg_id}`);
                console.log(target!.getElementsByTagName("p").length);
                console.log(target!.getElementsByClassName("translate")[0]);
                if (target!.getElementsByClassName("translate")[0]) {
                    console.log("已经有翻译结果了");
                    return;
                }
                const newElement = document.createElement("p");
                newElement.className = "translate";
                // newElement.innerHTML = await translate(msg_body);  翻译次数有限！！！
                newElement.innerHTML = "翻译结果";
                target?.insertAdjacentElement("beforeend", newElement);
                hideContextMenu();
                console.log(target!.getElementsByClassName("translate").length);

            });
            contextMenu.appendChild(translateItem);

            // 多选
            const multiselectItem = document.createElement("li");
            multiselectItem.className = "ContextMenuLi";
            multiselectItem.innerHTML = "多选";
            // 被选中的消息
            let selectedMessages = [];
            multiselectItem.addEventListener("click", async (event) => {
                event.stopPropagation();
                const target = document.getElementById(`msg${msg_id}`);
                // 把id打包起来
                // // Toggle the selected state of the message
                // if (selectedMessages.includes(msg_id)) {
                //     // Remove the message from the selection if it's already selected
                //     selectedMessages = selectedMessages.filter(id => id !== msg_id);
                //     target.classList.remove('selected');
                // } else {
                //     // Add the message to the selection if it's not selected
                //     selectedMessages.push(msg_id);
                //     target.classList.add('selected');
                // }

                // // For debugging
                // console.log(selectedMessages);
            });
            contextMenu.appendChild(multiselectItem);
        }
        else // 语音消息只能转文字
        {
            console.log("语音消息");
            console.log(msg_body);
            const transformItem = document.createElement("li");
            transformItem.className = "ContextMenuLi";
            transformItem.innerHTML = "语音转文字";

            transformItem.addEventListener("click", async (event) => {
                event.stopPropagation();
                const target = document.getElementById(`msg${msg_id}`);
                console.log(target!.getElementsByTagName("p").length);
                console.log(target!.getElementsByClassName("transform")[0]);

                if (target!.getElementsByClassName("transform")[0]) {
                    console.log("已经转换过了");
                    return;
                }
                const newElement = document.createElement("p");
                newElement.className="transform";
                newElement.innerHTML = await transform(msg_body);
                // newElement.innerHTML = await transform(msg_body);  // 转换次数有限！！！
                // newElement.innerHTML = "转文字结果";
                target?.insertAdjacentElement("beforeend", newElement);
                hideContextMenu();
                console.log("转换结果：" + newElement.innerHTML);
                console.log(target!.getElementsByClassName("transform").length);

            });
            contextMenu.appendChild(transformItem);
        }

        
        // 删除消息记录按钮
        const deleteItem = document.createElement("li");
        deleteItem.className = "ContextMenuLi";
        deleteItem.innerHTML = "删除";
        deleteItem.addEventListener("click", () => {
            event.stopPropagation();
            socket.current!.send(JSON.stringify({
                message: msg_body, token: localStorage.getItem("token"),
                deleted_msg_id: msg_id
            }));
        });
        contextMenu.appendChild(deleteItem);


        document.body.appendChild(contextMenu);

        function hideContextMenu() {
            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }

        // document.addEventListener("mousedown", hideContextMenu);
        document.addEventListener("click", hideContextMenu);
    };

    useEffect(() => {
        console.log("!!!!!!!!!刷新");
        if (!router.isReady || myID === undefined) {
            return;
        }
        setChatID(query.id as string);
        setChatName(query.name as string);
        setIsGroup(query.group as string);
        
        setSticked(query.sticked as string);
        setSilent(query.silent as string);

        const options: Options = {
            url: suffix + `${router.query.id}/${myID}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                let currentUserid = myID;
                console.log("当前用户id: ", currentUserid);
                console.log("isgroup: ", isGroup);
                const messages = JSON.parse(event.data).messages;
                // 消息列表
                setMsgList(messages
                    // 如果这个人的id在删除列表里，就不显示消息
                    .filter((val: any) => !val.delete_members?.some((user: any) => user === currentUserid))
                    .map((val: any) => ({ ...val }))
                );
                
                const memberList = JSON.parse(event.data).members;
                setmemberList(memberList
                    .map((val: any) => ({ ...val }))
                );
                const last_id = messages.length === 0 ? -1 : messages.at(-1).msg_id;
                fetch(
                    "/api/user/set_read_message/",
                    {
                        method:"POST",
                        credentials:"include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: router.query.id,
                            msg_id: last_id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.code === 0) {
                            console.log("设置已读消息成功:", last_id);
                        }
                        else {
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        return cleanUp;
    }, [router, query, myID]);

    useEffect(() => {
        const msgs = document.getElementById("msgdisplay");
        msgs?.scroll(0, msgs?.scrollHeight - msgs?.clientHeight);
    }, [msgList]);

    useEffect(() => {
        fetch(
            "/api/user/get_profile/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setID(data.user_id);
            })
            .catch((err) => alert(err));
    }, []);

    useEffect(() => {
        if (chatID !== undefined && chatName !== undefined && isGroup !== undefined && myID !== undefined && sticked !== undefined) {
            console.log("聊天视窗刷新");
            setRefreshing(false);
        }
        else{
            setRefreshing(true);
        }
    }, [chatID, chatName, isGroup, myID, sticked]);

    return refreshing ? (
        <div></div>
    ):(
        <div style={{ padding: 12 }}>
            <Navbar />
            <MsgBar />
            <DetailsPage myID={myID!.toString()} chatID={chatID!} chatName={chatName!} group={isGroup!} sticked={sticked!} silent={silent!} />
            <div ref={chatBoxRef} id="msgdisplay" style={{ display: "flex", flexDirection: "column" }}>
                {msgList.map((msg) => (
                    <div key={msg.msg_id} className="msg">
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>
                        <div id={`msg${msg.msg_id}`} className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}
                            onContextMenu={(event) => {
                                msgContextMenu(event, myID!, msg.msg_id, msg.msg_body, msg.is_audio, msg.sender_id,msg.create_time);
                            }}>
                            <p className={msg.sender_id !== myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
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
                                            <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"}
                                                dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                            ></p>)))
                            }
                            <p className={msg.sender_id !== myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                        </div>
                    </div>
                ))}
            </div>
            {recording && (
                <div className="popuprecord">
                    <div className="popup-title">
                        &nbsp;&nbsp;正在录音......&nbsp;&nbsp;
                    </div>
                </div>
            )}
            <div className="inputdisplay">
                <input
                    className="msginput"
                    id="msginput"
                    type="text"
                    ref={inputRef}
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => {
                        if (inputRef.current !== null) {
                            setCursorPosStart(inputRef.current.selectionStart);
                            setCursorPosEnd(inputRef.current.selectionEnd);
                        }
                        setInput(e.target.value); setMsg(e.target.value);
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            sendPublic();
                            setInput("");
                        };
                        if (event.key === "@") {
                            setShowPopupMention(true);
                            //验证是否为群聊
                            if(isGroup==="1")
                            {
                                if (inputRef.current !== null) {
                                    const startPos = inputRef.current.selectionStart;
                                    const endPos = inputRef.current.selectionEnd;
                                    Promise.resolve().then(async () => {
                                        await setCursorPosStart(startPos);
                                        await setCursorPosEnd(endPos);
                                        //insertAtCursor(inputRef.current, "@");
                                        setMsg(inputValue);
                                        handleMention(event);
                                    });
                                }
                            }
                        }
                        else {
                            setShowPopupMention(false);
                        }
                    }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                {showPopupMention &&  (
                    <div className="msgContextMenu">
                        {/* TODO:遍历群内好友 */}
                        {memberList.map((member) => (
                            <div key = {member.user_id} className="msg">
                                <li className="ContextMenuLi" onClick={() => {
                                    if (document.getElementById("msginput"))
                                        insertAtCursor(document.getElementById("msginput"), member.user_name);
                                    setMsg(inputValue);
                                    setShowPopupMention(false);
                                }}>
                                    <li>{member.user_name}</li>
                                </li>
                                   
                            </div>
                        ))}
                        <div className="msg">
                            <li className="ContextMenuLi" onClick={() => {
                                if (document.getElementById("msginput"))
                                    insertAtCursor(document.getElementById("msginput"), "全体成员");
                                setMsg(inputValue);
                                setShowPopupMention(false);
                            }}>
                                <li>全体成员</li>
                            </li>
                        </div>
                        <div>
                            <li className="ContextMenuLi">
                                准备@的好友
                            </li>    
                        </div>
                    </div>
                    
                )}
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button className="sendbutton" onClick={() => { toggleEmojiPicker(); }}>
                        <FontAwesomeIcon className="Icon" icon={faFaceSmile} />
                    </button>
                    <button className="sendbutton" onClick={() => { setShowPopupImg(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faImage} />
                    </button>
                    {showPopupImg && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendPic(newimg);
                                setIsImgUploaded(false);
                                setShowPopupImg(false);
                            }}>
                                <input placeholder="uploaded image"
                                    className="fileupload" type="file"
                                    name="avatar" accept="image/*"
                                    onChange={(event) => {
                                        setNewImg(event.target.files?.[0]);
                                        setIsImgUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isImgUploaded}>发送图片</button>
                            </form>
                            <button onClick={() => { setShowPopupImg(false); }}>取消</button>
                        </div>
                    )}
                    <button className="sendbutton" onClick={() => { setShowPopupVideo(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faVideo} />
                    </button>
                    {showPopupVideo && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendVideo(newvideo);
                                setIsVideoUploaded(false);
                                setShowPopupVideo(false);
                            }}>
                                <input placeholder="uploaded video"
                                    className="fileupload" type="file"
                                    name="avatar" accept="video/*"
                                    onChange={(event) => {
                                        setNewVideo(event.target.files?.[0]);
                                        setIsVideoUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isVideoUploaded}>发送视频</button>
                            </form>
                            <button onClick={() => { setShowPopupVideo(false); }}>取消</button>
                        </div>
                    )}
                    <button className="sendbutton" onClick={() => { setShowPopupFile(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faFile} />
                    </button>
                    {showPopupFile && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendFile(newfile);
                                setIsFileUploaded(false);
                                setShowPopupFile(false);
                            }}>
                                <input placeholder="uploaded file"
                                    className="fileupload" type="file"
                                    name="avatar" accept="*"
                                    onChange={(event) => {
                                        setNewFile(event.target.files?.[0]);
                                        setIsFileUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isFileUploaded}>发送文件</button>
                            </form>
                            <button onClick={() => { setShowPopupFile(false); }}>取消</button>
                        </div>
                    )}
                    {/* 发送语音功能 */}
                    <button className="sendbutton" onClick={() => { handleRecording(); }}>
                        <FontAwesomeIcon className="Icon" id={recording ? "notrcd" : "rcd"} icon={faFileAudio} />
                    </button>
                </div>
                <button
                    className="msgbutton"
                    onClick={() => { sendPublic(); setInput(""); }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                > <FontAwesomeIcon className="Icon" icon={faPaperPlane} /> </button>
            </div>
            {showEmojiPicker && (
                <div className="emoji-picker-container" >
                    <Picker
                        onEmojiSelect={(emoji: { native: string }) => {
                            handleEmojiClick(emoji);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatScreen;