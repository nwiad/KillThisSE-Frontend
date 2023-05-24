import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import { act } from "react-dom/test-utils";
import { default as InitPage } from "../pages/user/friend/friendrequest";
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
const mockEmptyRequests = [];
global.fetch = jest.fn();


describe("InitPage component display request list", () => {
    beforeAll(() => {
        window.alert = jest.fn();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    beforeEach(() => {
        (fetch as jest.Mock).mockImplementation((url) => {
            if (url === "/api/user/get_profile/") {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ code: 0, user_id: 123 }),
                });
            }
            if (url === "/api/user/get_friend_requests/") {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ code: 0, requests: mockRequests }),
                });
            }
            if (url === "/api/user/search_friend_by_id") {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ code: 0, name: "Friend" }),
                });
            }
            if (url === "/api/user/get_or_create_private_conversation/") {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({ code: 0, conversation_id: 456 }),
                });
            }
            if (url === "/api/user/respond_friend_request/") {
                return Promise.resolve({
                    json: () => Promise.resolve({ code: 0 }),
                });
            }
            return Promise.reject(new Error("Invalid URL"));
        });
    });    

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("does not display friend requests when there are no requests", async () => {
        // Arrange
        (fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve({ code: 0, requests: mockEmptyRequests }),
            })
        );

        // Act
        act(() => {
            render(<InitPage />);
        });

        // Assert
        await waitFor(() => {
            expect(screen.queryByText(/John/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Alice/i)).not.toBeInTheDocument();
        });
    });
});
