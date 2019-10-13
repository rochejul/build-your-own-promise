const MyPromiseStateEnum = {
    IDLE: 'idle',
    REJECTED: 'rejected',
    RESOLVED: 'resolved'
};

class MyPromise {
    constructor(handler) {
        this.state = MyPromiseStateEnum.IDLE;
        this.value = undefined;
        this._promises = [];

        setImmediate(() => handler(this._resolve.bind(this), this._reject.bind(this)) );
    }

    _digest() {
        if (this.state === MyPromiseStateEnum.IDLE) {
            return;
        }

        this._promises.forEach(({ callback, resolve, reject }) => {
            try {
                const value = callback(this.value);

                if (value instanceof MyPromise) {
                    if (value.state === MyPromiseStateEnum.REJECTED) {
                        value.catch(reject);

                    } else {
                        value
                            .then(resolve)
                            .catch(reject);
                    }

                } else if (value instanceof Error) {
                    reject(value);
                } else {
                    resolve(value);
                }

            } catch (err) {
                reject(err);
            }
        });

        this._promises = [];
    }

    _reject(err) {
        if (this.state === MyPromiseStateEnum.IDLE) {
            this.state = MyPromiseStateEnum.REJECTED;
            this.value = err;
        }

        this._digest();
    }

    _resolve(value) {
        if (this.state === MyPromiseStateEnum.IDLE) {
            this.state = MyPromiseStateEnum.RESOLVED;
            this.value = value;
        }

        this._digest();
    }

    catch(callback) {
        return new MyPromise((resolve, reject) => {
            this._promises.push({ callback, resolve, reject });
            this._digest();
        });
    }

    then(callback) {
        return new MyPromise((resolve, reject) => {
            this._promises.push({ callback, resolve, reject });
            this._digest();
        });
    }

    static all(promises) {
        if (Array.isArray(promises)) {
            return new MyPromise((resolve, reject) => {
                let inProgress = 0;
                let countAchieved = 0;
                const promisesCount = promises.length;
                const results = [ ];
                results.length = promisesCount;

                function waitPromise(promise, index) {
                    inProgress++;
                    promise
                        .then((value) => {
                            results[index] = value;
                            inProgress--;
                            countAchieved++;

                            if (inProgress === 0 && countAchieved === promisesCount) {
                                resolve(results);
                            }
                        })
                        .catch(reject);
                }

                for (let i = 0; i < promisesCount; ++i) {
                    const promise = promises[i];

                    if (promise instanceof MyPromise) {
                        waitPromise(promise, i);

                    } else if (promise instanceof Error) {
                        reject(promise);
                        break;
                    } else {
                        results[i] = promise;
                        countAchieved++;
                    }
                }

                if (inProgress === 0) {
                    resolve(results);
                }
            });
        }

        return MyPromise.resolve();
    }

    static race(promises) {
        if (Array.isArray(promises)) {
            return new MyPromise((resolve, reject) => {
                const promisesCount = promises.length;
                const results = [ ];
                results.length = promisesCount;

                for (let i = 0; i < promisesCount; ++i) {
                    const promise = promises[i];

                    if (promise instanceof MyPromise) {
                        promise
                            .then(resolve)
                            .catch(reject);

                    } else if (promise instanceof Error) {
                        reject(promise);
                        break;
                    } else {
                        resolve(promise);
                    }
                }
            });
        }

        return MyPromise.resolve();
    }

    static reject(err) {
        return new MyPromise((resolve, reject) => reject(err));
    }

    static resolve(value) {
        return new MyPromise((resolve) => resolve(value));
    }
}

module.exports.MyPromise = MyPromise;
