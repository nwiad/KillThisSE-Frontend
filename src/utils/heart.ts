export class Heart {
    HEART_TIMEOUT: NodeJS.Timeout|undefined; // 心跳计时器
    timeout: number;
  
    constructor () {
        this.timeout = 5000;
    }
    // 重置
    reset () {
        clearInterval(this.HEART_TIMEOUT);
        return this;
    }
    /**
     * 启动心跳
     * @param {Function} cb 回调函数
     */
    start (cb: Function) {
        this.HEART_TIMEOUT = setInterval(() => {
            cb();
        }, this.timeout);
    }
}