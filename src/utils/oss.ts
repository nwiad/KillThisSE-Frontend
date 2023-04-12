import OSS from "ali-oss";

let image_url = "default url";

const client = new OSS({
    region: "oss-cn-beijing",
    accessKeyId: "LTAI5t6NTAE8KKKAn9UjcjBj",
    accessKeySecret: "AvXwtoklDuAiEuyt8KbvbBAd3OvxFh",
    bucket: "killthisse-avatar"
});

const put = async (name: string, file: File) => {
    try {
        var fileName = new Date().getTime() + name;
        let result = await client.put(fileName, file);
        image_url = result.url;
    } catch (e) {
        alert("上传失败");
    }
};

export const uploadFile = async (file: File) => {
    let param = new FormData();
    param.append("file", file, file.name);
    await put(file.name,file);
    return image_url;
};