import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import "regenerator-runtime/runtime";
import InitPage from "../pages/user/info";

// Mock the router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

jest.mock('node-fetch', () => {
    return jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          name: "Test User",
          avatar: "test-avatar.png",
        }),
      })
    );
  });
  

describe("InitPage component", () => {

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
        (global as any).fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    name: "Mock User",
                    avatar: "mock_avatar.png",
                }),
            })
        ) as jest.MockedFunction<typeof fetch>;

        // 模拟数据
        fetch.mockImplementation(() =>
          Promise.resolve({
            json: () => Promise.resolve({
              name: "Test User",
              avatar: "test-avatar.png",
            }),
          })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the component without errors", () => {
        render(<InitPage />);
        expect(screen.getByText(/修改头像/i)).toBeInTheDocument();
        expect(screen.getByText(/修改用户名/i)).toBeInTheDocument();
        expect(screen.getByText(/修改密码/i)).toBeInTheDocument();
        expect(screen.getByText(/注销本用户/i)).toBeInTheDocument();
    });

    // it("allows user to upload avatar file", async () => {
    //     render(<InitPage />);
    //     fireEvent.change(screen.getByPlaceholderText(/uploaded image/i), {
    //         target: { files: [new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })] },
    //     });
    //     expect(screen.getByDisplayValue(/chucknorris\.png/i)).toBeInTheDocument();
    //     fireEvent.submit(screen.getByText(/上传头像/i).closest("form") as HTMLElement);
    //     expect(await screen.findByText(/已提交/i)).toBeInTheDocument();
    // });

    // it("validates and updates username", async () => {
    //     render(<InitPage />);
    //     fireEvent.click(screen.getByText(/修改用户名/i));
    //     fireEvent.change(screen.getByPlaceholderText(/请输入新的用户名/i), { target: { value: "invalid name" } });
    //     expect(screen.getByText(/\*用户名必须由3-16位字母、数字和下划线组成/i)).toBeInTheDocument();
    //     expect(screen.getByRole("button", { name: /保存/i })).toBeDisabled();

    //     fireEvent.change(screen.getByPlaceholderText(/请输入新的用户名/i), { target: { value: "newusername" } });
    //     expect(screen.queryByText(/\*用户名必须由3-16位字母、数字和下划线组成/i)).not.toBeInTheDocument();
    //     expect(screen.getByRole("button", { name: /保存/i })).not.toBeDisabled();

    //     fireEvent.submit(screen.getByText(/保存/i).closest("form") as HTMLElement);
    //     expect(await screen.findByText(/成功修改用户名为newusername/i)).toBeInTheDocument();
    // });

    // it("validates and updates password", async () => {
    //     render(<InitPage />);
    //     fireEvent.click(screen.getByText(/修改密码/i));
    //     fireEvent.change(screen.getByPlaceholderText(/请输入原密码/i), { target: { value: "wrongpassword" } });
    //     fireEvent.change(screen.getByPlaceholderText(/请输入新的密码/i), { target: { value: "invalid" } });
    //     expect(screen.getByText(/\*密码必须由6-16位字母、数字和下划线组成/i)).toBeInTheDocument();
    //     expect(screen.getByRole("button", { name: /保存/i })).toBeDisabled();

    //     fireEvent.change(screen.getByPlaceholderText(/请输入新的密码/i), { target: { value: "new_password123" } });
    //     expect(screen.queryByText(/\*密码必须由6-16位字母、数字和下划线组成/i)).not.toBeInTheDocument();
    //     expect(screen.getByRole("button", { name: /保存/i })).not.toBeDisabled();

    //     fireEvent.submit(screen.getByText(/保存/i).closest("form") as HTMLElement);
    //     expect(await screen.findByText(/成功修改密码/i)).toBeInTheDocument();
    // });

    // it("allows user to delete account", async () => {
    //     render(<InitPage />);
    //     jest.spyOn(window, "confirm").mockImplementation(() => true);
    //     fireEvent.click(screen.getByText(/注销本用户/i));
    //     expect(await screen.findByText(/注销成功/i)).toBeInTheDocument();
    // });
});

