import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Server } from "miragejs";
import { useRouter } from "next/router";
import ChatScreen from "../pages/user/msg/chat";
import { Socket } from "../utils/websocket";

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

jest.mock("../utils/websocket", () => {
    return {
        Socket: jest.fn(),
    };
});

describe("ChatScreen", () => {
    let server: any;

    beforeEach(() => {
        server = new Server({
            environment: "test",
            routes() {
                this.post("/api/user/get_profile/", (schema, request) => {
                    return {
                        id: 1,
                    };
                });
            },
        });
        
        (useRouter as jest.Mock).mockReturnValue({
            query: { id: "1" },
            isReady: true,
        });
    });

    afterEach(() => {
        server.shutdown();
        jest.clearAllMocks();
    });

    it("should send a message when the 'Enter' key is pressed", async () => {
        const sendMock = jest.fn();
        (Socket as jest.Mock).mockImplementation(() => {
            return {
                send: sendMock,
                destroy: jest.fn(),
            };
        });

        render(<ChatScreen />);

        const input = screen.getByPlaceholderText("请输入内容");
        fireEvent.change(input, { target: { value: "Test message" } });

        fireEvent.keyDown(input, { key: "Enter" });

        await waitFor(() => expect(sendMock).toHaveBeenCalledTimes(1));
    });

    it("should send a message when the '发送' button is clicked", async () => {
        const sendMock = jest.fn();
        (Socket as jest.Mock).mockImplementation(() => {
            return {
                send: sendMock,
                destroy: jest.fn(),
            };
        });

        render(<ChatScreen />);

        const input = screen.getByPlaceholderText("请输入内容");
        fireEvent.change(input, { target: { value: "Test message" } });

        const sendButton = screen.getByText("发送");
        userEvent.click(sendButton);

        await waitFor(() => expect(sendMock).toHaveBeenCalledTimes(1));
    });
});