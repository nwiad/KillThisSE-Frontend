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