import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import { act } from "react-dom/test-utils";
import InitPage from "../pages/user/friend/friendrequest";

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

const mockRouter = { push: jest.fn() };
const mockRequests = [
    {
        user_id: 1,
        name: "John",
        avatar: "http://example.com/avatar.jpg",
    },
    {
        user_id: 2,
        name: "Alice",
        avatar: "http://example.com/avatar2.jpg",
    },
];
const mockRequests2 = [
    {
        user_id: 1,
        name: "John",
        avatar: "http://example.com/avatar.jpg",
    },
];

global.fetch = jest.fn();

describe("InitPage component display request list", () => {
    beforeAll(() => {
        window.alert = jest.fn();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    beforeEach(() => {
        (fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({ code: 0, requests: mockRequests }),
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("displays friend requests when there are requests", async () => {   
        // Act
        act(()=>{
            render(<InitPage />);
        });
        // Assert
        await waitFor(() => {
            expect(screen.getByText(/John/i)).toBeInTheDocument();
            expect(screen.getByText(/Alice/i)).toBeInTheDocument();
        });
    });

    it("does not display friend requests when there are no requests", async () => {    
        // Act
        act(()=>{
            render(<InitPage />);
        });
    
        // Assert
        await waitFor(() => {
            expect(screen.queryByText(/John/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Alice/i)).not.toBeInTheDocument();
        });
    });
});

describe("InitPage component about yes or no", () => {
    beforeAll(() => {
        window.alert = jest.fn();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        // 模拟 fetch 请求
        global.fetch = jest.fn().mockImplementation((url, options) => {
            if (url === "/api/user/get_friend_requests/") {
                return Promise.resolve({
                    json: () => Promise.resolve({ code: 0, requests: mockRequests2 }),
                });
            } 
            else if (url === "/api/user/respond_friend_request/") {
                return Promise.resolve({
                    json: () => Promise.resolve({ code: 0 }),
                });
            } 
            else {
                return Promise.reject(new Error("Invalid URL"));
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("sends respond when accept is clicked", async () => {
        act(() => {
            render(<InitPage />);
        });

        await waitFor(() => {
            expect(screen.getByText(/John/i)).toBeInTheDocument();
        });

        const acceptButton = screen.getByText(/同意/i);

        act(() => {
            fireEvent.click(acceptButton);
        });

        // 等待 sendRespond 函数完成
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        // 断言 sendRespond 函数发送的请求参数是否符合预期
        expect(global.fetch).toHaveBeenCalledWith(
            "/api/user/respond_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    response: "accept",
                    friend_user_id: 1,
                }),
            }
        );
    });

    it("sends respond when reject is clicked", async () => {
        act(() => {
            render(<InitPage />);
        });

        await waitFor(() => {
            expect(screen.getByText(/John/i)).toBeInTheDocument();
        });

        const rejectButton = screen.getByText(/拒绝/i);

        act(() => {
            fireEvent.click(rejectButton);
        });

        // 等待 sendRespond 函数完成
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        // 断言 sendRespond 函数发送的请求参数是否符合预期
        expect(global.fetch).toHaveBeenCalledWith(
            "/api/user/respond_friend_request/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    response: "reject",
                    friend_user_id: 1,
                }),
            }
        );
    });
});


