import { render, screen } from '@testing-library/react';
import FriendBar from '../pages/user/friendbar';

describe('FriendBar', () => {
    beforeEach(() => {
        // Reset the fetch and useRouter functions before each test
        global.fetch = jest.requireActual('node-fetch');
        jest.clearAllMocks();
        jest.unmock('next/router');
      });

    it('sends correct request to backend API', async () => {
        const mockedFetch = jest.spyOn(global, 'fetch');
        const cookie = 'testcookie';
        render(<FriendBar cookie={cookie} />);

        // Expect to send a request to the backend API with the correct URL and parameters
        expect(mockedFetch).toHaveBeenCalledWith('/api/friends?cookie=testcookie');

        // Restore the original fetch function
        mockedFetch.mockRestore();
  });

  it('renders friend list correctly', async () => {
    // Mock the fetch function to return a list of friends
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ friends: [
        { id: 1, name: 'Alice', avatar: 'alice.jpg' },
        { id: 2, name: 'Bob', avatar: 'bob.jpg' },
      ] }), {
        headers: { 'Content-type': 'application/json' },
        status: 200,
      })
    );

    const cookie = 'testcookie';
    render(<FriendBar cookie={cookie} />);

    // Expect to render the friend list with the correct names and avatars
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    expect(screen.getByAltText('Alice')).toHaveAttribute('src', 'alice.jpg');
    expect(screen.getByAltText('Bob')).toHaveAttribute('src', 'bob.jpg');
  });

    it('redirects to login page if user is not logged in', async () => {
        // Mock the useRouter function to return a pathname of '/login'
        jest.mock('next/router', () => ({
        useRouter: () => ({ pathname: '/login' }),
        }));

        const cookie = "null";
        render(<FriendBar cookie={cookie} />);

        // Expect to redirect to the login page
        expect(await screen.findByText('Please log in to see your friends.')).toBeInTheDocument();
  });

    it('renders friend list', async () => {
        // Mock the fetch function to return a fixed list of friends
        global.fetch = jest.fn().mockResolvedValue(
          new Response(JSON.stringify({ friends: [{ id: 1, name: 'Alice', avatar: 'alice.jpg' }] }), {
            headers: { 'Content-type': 'application/json' },
            status: 200,
          })
        );
    // Render the component
    render(<FriendBar cookie="testcookie" />);

    // Expect to see the friend list
    const friendList = await screen.findByRole('list', { name: 'friend list' });
    expect(friendList).toBeInTheDocument();
    
    // Expect to see the friend's name and avatar
    const friendName = screen.getByText(/Alice/);
    expect(friendName).toBeInTheDocument();
    const friendAvatar = screen.getByAltText(/Alice's avatar/);
    expect(friendAvatar).toBeInTheDocument();

    // Restore the original fetch function  
    global.fetch = jest.requireActual('node-fetch');
  });

  it('navigates to search friend page when clicking "添加新好友"', () => {
    // Mock the useRouter function
    const useRouterMock = jest.fn();
    useRouterMock.mockReturnValue({
      push: jest.fn(),
    });
    jest.mock('next/router', () => ({ useRouter: useRouterMock }));

    // Render the component
    render(<FriendBar cookie="testcookie" />);

    // Click the "添加新好友" button
    const addButton = screen.getByText('+ 添加新好友');
    addButton.click();

    // Expect to navigate to search friend page
    expect(useRouterMock().push).toHaveBeenCalledWith('/user/searchfriend?cookie=testcookie');

    // Restore the original useRouter function
    jest.unmock('next/router');
  });

  it('navigates to accept friend page when clicking "收到的好友邀请"', () => {
    // Mock the useRouter function
    const useRouterMock = jest.fn();
    useRouterMock.mockReturnValue({
      push: jest.fn(),
    });
    jest.mock('next/router', () => ({ useRouter: useRouterMock }));

    // Render the component
    render(<FriendBar cookie="testcookie" />);

    // Click the "收到的好友邀请" button
    const inviteButton = screen.getByText('收到的好友邀请');
    inviteButton.click();

    // Expect to navigate to accept friend page
    expect(useRouterMock().push).toHaveBeenCalledWith('/user/acceptfriend?cookie=testcookie');

    // Restore the original useRouter function
    jest.unmock('next/router');
  });
});