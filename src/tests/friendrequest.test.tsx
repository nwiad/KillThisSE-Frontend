import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import InitPage from "../pages/user/friendrequest";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockRouter = { push: jest.fn() };

describe("InitPage component", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("fetches friend requests and displays them", async () => {
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
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ code: 0, requests: mockRequests }),
      })
    );

    render(<InitPage />);

    await waitFor(() => {
      expect(screen.getByText(/John/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    });
  });
});