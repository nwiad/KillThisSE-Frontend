import { render } from "@testing-library/react";
import { useState } from "react";
import { uploadFile } from "../utils/oss";

describe("uploadFile", () => {
    it("should upload file and return image url", async () => {
        const file = new File(["test"], "test.png", { type: "image/png" });
        const imageUrl = "../src/imgs/1.jpg";

        // Mock ali-oss client and put method
        const putMock = jest.fn().mockResolvedValue({ url: imageUrl });
        jest.mock("ali-oss", () => ({
            __esModule: true,
            default: jest.fn(() => ({
                put: putMock,
            })),
        }));

        // Render component that calls uploadFile function
        const TestComponent = () => {
            const [uploadedImageUrl, setUploadedImageUrl] = useState("");
            const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                    const url = await uploadFile(file);
                    setUploadedImageUrl(url);
                }
            };
            return (
                <div>
                    <input type="file" onChange={handleFileUpload} />
                    {uploadedImageUrl && <img src={uploadedImageUrl} alt="uploaded image" />}
                </div>
            );
        };
        render(<TestComponent />);
        });
});
