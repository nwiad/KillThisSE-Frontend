/**
 * @note 本文件是一个网络请求 wrapper 示例，其作用是将所有网络请求汇总到一个函数内处理
 *       我们推荐你在大作业中也尝试写一个网络请求 wrapper，本文件可以用作参考
 */

import axios, { AxiosError, AxiosResponse } from "axios";

const network = axios.create({
    baseURL: "",
});

enum NetworkErrorType {
    CORRUPTED_RESPONSE,
    UNKNOWN_ERROR,
}

export class NetworkError extends Error {
    type: NetworkErrorType;
    message: string;

    constructor(
        _type: NetworkErrorType,
        _message: string,
    ) {
        super();

        this.type = _type;
        this.message = _message;
    }

    toString(): string { return this.message; }
    valueOf(): Object { return this.message; }
}

export const request = async (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any,
) => {
    const response = await network.request({ method, url, data })
        .catch((err: AxiosError) => {
            // @note: 这里的错误处理显然是极其粗糙的，大作业中你可以根据组内约定的 API 文档细化错误处理

            throw new NetworkError(
                NetworkErrorType.UNKNOWN_ERROR,
                `[${err.response?.status}] ` + (err.response?.data as any).info,
            );
        });

    if (response?.data.code === 0) {
        return { ...response.data, code: undefined };
    } else {
        // @note: 这里的错误处理显然是极其粗糙的，大作业中你可以根据组内约定的 API 文档细化错误处理

        throw new NetworkError(
            NetworkErrorType.UNKNOWN_ERROR,
            response?.data.info,
        );
    }
};