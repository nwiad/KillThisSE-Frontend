import Picker from "@emoji-mart/react";
import { faFaceSmile, faFile, faFileAudio, faImage, faPaperPlane, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { uploadFile } from "../../../utils/oss";
import { MsgMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import Navbar from "../navbar";
import MsgBar from "./msgbar";


const ChatScreen = () => {
    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [msgList, setMsgList] = useState<MsgMetaData[]>([]);
    const [myID, setID] = useState<number>(-1);
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
    let mediaRecorder: MediaRecorder;
    
    const socket = useRef<Socket>();

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

    const sendPublic = (isImg?: boolean, isFile?: boolean, isVideo?: boolean) => {
        if(message === "") {
            return;
        }
        socket.current!.send(JSON.stringify({
            message: message, token: localStorage.getItem("token"),
            isImg: false, isFile: false, isVideo: false
        }));
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



    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = async () => {
        await new Promise(resolve => {
            mediaRecorder.addEventListener("dataavailable", e => {
                if (e.data && e.data.size > 0) {
                    const audioURL = URL.createObjectURL(e.data);
                    setAudioURL(audioURL);
                    resolve(audioURL);
                }
            });
            mediaRecorder.stop();
        });
        setRecording(false);
    };

    const blobToFile = (blob: Blob, name: string): File => {
        return new File([blob], name, { type: blob.type, lastModified: Date.now() });
    };

    
    const sendAudio = async () => {
        const audioBlob = await (await fetch(audioURL)).blob();
        const audioUrl = await uploadFile(blobToFile(audioBlob,"recording.ogg")); // 类型“Blob”的参数不能赋给类型“File”的参数。
    
        socket.current!.send(JSON.stringify({
            message: audioUrl,
            token: localStorage.getItem("token"),
            is_audio: true
        }));
    };
    
    const handleRecording = async () => {
        if (recording) {
            const audioURL = await stopRecording();
            console.log("Recording stopped, audio URL:", audioURL);
            setRecording(false);
        } else {
            startRecording();
            setRecording(true);
        }
    };
    

    // 功能：消息右键菜单
    function msgContextMenu(event: ReactMouseEvent<HTMLElement, MouseEvent>, msg_id: number, msg_body: string) {
        event.preventDefault();

        const contextMenu = document.createElement("ul");
        contextMenu.className = "msgContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        const deleteItem = document.createElement("li");
        deleteItem.className = "ContextMenuLi";
        deleteItem.innerHTML = "撤回";
        deleteItem.addEventListener("click", () => {
            //TODO
        });
        contextMenu.appendChild(deleteItem);

        const translateItem = document.createElement("li");
        translateItem.className = "ContextMenuLi";
        translateItem.innerHTML = "翻译";
        translateItem.addEventListener("click", () => {
            
        });
        contextMenu.appendChild(translateItem);

        document.body.appendChild(contextMenu);

        function hideContextMenu() {
            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }

        document.addEventListener("mousedown", hideContextMenu);
        document.addEventListener("click", hideContextMenu);
    }

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        const options: Options = {
            url: suffix+`${router.query.id}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                setMsgList(JSON.parse(event.data).messages.map((val: any) => ({ ...val })));
            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        return cleanUp;
    }, [router, query]);

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

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <MsgBar />

            <div ref={chatBoxRef} id="msgdisplay" style={{ display: "flex", flexDirection: "column" }}>
                <div>{router.query.name}</div>
                {msgList.map((msg) => (
                    <div key={msg.msg_id} className="msg">
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>
                        <div className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}
                            onContextMenu={(event) => {
                                msgContextMenu(event, msg.msg_id, msg.msg_body);
                            }}>
                            <p className="sendername">{msg.sender_name}</p>
                            <p className="sendername">{msg.create_time}</p>
                            {msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
                                (msg.is_video === true ? <a id="videoLink" href={msg.msg_body} title="下载视频" >
                                    <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E8%A7%86%E9%A2%91_%E7%BC%A9%E5%B0%8F.png" alt="📹"
                                        style={{ width: "100%", height: "auto" }} />
                                </a> :
                                    (msg.is_file === true ? <a id="fileLink" href={msg.msg_body} title="下载文件" >
                                        <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E6%96%87%E4%BB%B6%E5%A4%B9-%E7%BC%A9%E5%B0%8F.png" alt="📁"
                                            style={{ width: "100%", height: "auto" }} />
                                    </a> :
                                        <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"}
                                            dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                        ></p>))
                            }
                        </div>
                    </div>
                ))}
            </div>
            <div className="inputdisplay">
                <input
                    className="msginput"
                    id="msginput"
                    type="text"
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => { setInput(e.target.value); setMsg(e.target.value); }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            sendPublic();
                            setInput("");
                        }
                    }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
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
                    <button className="sendbutton" onClick={() => {handleRecording();}}>
                        <FontAwesomeIcon className="Icon" icon={faFileAudio} />
                        {recording ? "Stop Recording" : "Start Recording"}
                    </button>
                    <button className="send-button" onClick={sendAudio}>
                        Send Audio!!!
                    </button>
                    <audio src={audioURL} controls />

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