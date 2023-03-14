import { BOARD_LENGTH } from "../constants/constants";
import { Board } from "./types";

export const getBlankBoard = (): Board => {
    const board: Board = [];
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            row.push(0);
        }

        board.push(row);
    }

    return board;
};

export const boardToString = (board: Board): string => {
    return board.map((row) => row.join("")).join("");
};

export const stringToBoard = (str: string): Board => {
    if (str.length !== BOARD_LENGTH * BOARD_LENGTH) {
        throw new Error("Invalid parameter");
    }

    const board: Board = [];
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            const val = parseInt(str[i * BOARD_LENGTH + j], 10);
            if (val !== 0 && val !== 1) {
                return getBlankBoard();
            }

            row.push(val);
        }

        board.push(row);
    }

    return board;
};

export const stepBoard = (board: Board): Board => {
    const newBoard: Board = [];

    /**
     * @todo [Step 1] 请在下面两条注释之间的区域填写你的代码完成该游戏的核心逻辑
     * @note 你可以使用命令 yarn test step 来运行我们编写的单元测试与我们提供的参考实现对拍
     */
    // Step 1 BEGIN
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            let upper = (i === 0) ? BOARD_LENGTH - 1 : i - 1; /* In case of overflow & underflow */
            let left = (j === 0) ? BOARD_LENGTH - 1 : j - 1;
            let right = (j === BOARD_LENGTH - 1) ? 0 : j + 1;
            let lower = (i === BOARD_LENGTH - 1) ? 0 : i + 1;
            let neighbors: number = board[upper][left] + board[upper][j] + board[upper][right] + 
                                    board[i][left]  /* The cell itself*/ + board[i][right] + 
                                    board[lower][left] + board[lower][j] + board[lower][right];  
            if (board[i][j] === 1) { // The cell is currently alive
                let new_state : (0 | 1) = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                row.push(new_state);
            }
            else { // The cell is currently dead
                let new_state : (0 | 1) = (neighbors === 3) ? 1 : 0;
                row.push(new_state);
            }
        }
        newBoard.push(row);
    }
    // Step 1 END

    return newBoard;
};

export const flipCell = (board: Board, i: number, j: number): Board => {
    /**
     * @todo [Step 3] 请在下面两条注释之间的区域填写你的代码完成切换细胞状态的任务
     * @note 你可以使用命令 yarn test flip 来运行我们编写的单元测试以检验自己的实现
     */
    // Step 3 BEGIN
    const newBoard: Board = [];
    for (let i = 0; i < BOARD_LENGTH; i++) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; j++) {
            row.push(board[i][j]);
        }
        newBoard.push(row);
    }
    newBoard[i][j] = (board[i][j] === 0 ? 1 : 0);
    return newBoard
    // Step 3 END

    /**
     * @note 该 return 语句是为了在填入缺失代码前也不至于触发 ESLint Error
     */
    throw new Error("This line should be unreachable.");
    return board;
};

export const badFlipCell = (board: Board, i: number, j: number): Board => {
    board[i][j] = board[i][j] === 0 ? 1 : 0;
    return board;
};
