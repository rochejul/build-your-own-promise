describe('Promise - ', () => {
    const MyPromise = require('../index');

    it('Object should exist', () => {
        expect(MyPromise).toBeDefined();
    });

    describe('instance - ', () => {
        describe('and the method "then" ', () => {
            it('should exist', () => {
                expect(MyPromise.prototype.then).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(
                    new MyPromise((resolve) => resolve(42))
                    .then(() => 44) instanceof MyPromise
                ).toBeTruthy();
            });

            const variousReturnedData = [
                [
                    'undefined',
                    () => undefined,
                    undefined
                ],
                [
                    'null',
                    () => null,
                    null
                ],
                [
                    'string',
                    (value) => String(value),
                    '42'
                ],
                [
                    'number',
                    (value) => value + 2,
                    44
                ],
                [
                    'array',
                    () => [42],
                    [42]
                ],
                [
                    'object',
                    (value) => ({ value }),
                    { value: 42 }
                ],
                [
                    'promise',
                    () => Promise.resolve('aaa'),
                    'aaa'
                ]
            ];

            it.each(variousReturnedData)('should return a resolved promise when (%s)', (name, handler, expected) => {
                return new MyPromise((resolve) => resolve(42))
                    .then(handler)
                    .then((val) => {
                        expect(expected).toEqual(val);
                    });
            });

            it('should return each time the first resolved value', () => {
                return new MyPromise((resolve) => {
                    resolve(42);
                    resolve(35);
                })
                .then((val) => {
                    expect(42).toEqual(val);
                });
            });
        });

        describe('and the method "catch" ', () => {
            it('should exist', () => {
                expect(MyPromise.prototype.catch).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(new MyPromise((resolve, reject) => reject(new Error('an error')))
                .catch((err) => err) instanceof MyPromise).toBeTruthy();
            });

            const variousReturnedData = [
                [
                    'throw exception',
                    function ()  {
                        throw new Error('an error - throw exception') 
                    },
                    'an error - throw exception'
                ],
                [
                    'promise',
                    () => MyPromise.reject(new Error('an error - promise')),
                    'an error - promise'
                ]
            ];

            it.each(variousReturnedData)('should return a rejected promise when (%s)', (name, handler, expected) => {
                return new MyPromise((resolve, reject) => reject(new Error('an error')))
                    .catch(() => handler())
                    .then(() => expect(true).toBe(false))
                    .catch((e) => expect(e.message).toBe(expected));
            });

            it('should return each time the first resolved value', () => {
                return new MyPromise((resolve, reject) => {
                    reject(new Error('an error'));
                    reject(new Error('an error bis'));
                })
                .then(() => expect(true).toBe(false))
                .catch((e) => expect(e.message).toBe('an error'));
            });

            it('should return a resolved promise otherwise', () => {
                return new MyPromise((resolve, reject) => reject(new Error('an error')))
                    .catch(() => 42)
                    .then((value) => expect(value).toBe(42))
                    .catch(() => expect(true).toBe(false));
            });
        });
    });

    describe('static - ', () => {
        describe('and the method "resolve" ', () => {
            it('should exist', () => {
                expect(MyPromise.resolve).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(
                    MyPromise.resolve(42) instanceof MyPromise
                ).toBeTruthy();
            });

            it('should return a resolved promise', () => {
                return MyPromise
                    .resolve(42)
                    .then((val) => {
                        expect(val).toEqual(42);
                    });
            });
        });

        describe('and the method "reject" ', () => {
            it('should exist', () => {
                expect(MyPromise.reject).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(
                    MyPromise.reject(new Error('an error occurred')) instanceof MyPromise
                ).toBeTruthy();
            });

            it('should return a rejected promise', () => {
                return MyPromise
                    .reject(new Error('an error occurred'))
                    .then(() => {
                        expect(true).toBe(false);
                    })
                    .catch((e) => {
                        expect(e.message).toBe('an error occurred');
                    });
            });
        });

        describe('and the method "all" ', () => {
            it('should exist', () => {
                expect(MyPromise.all).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(
                    MyPromise.all([]) instanceof MyPromise
                ).toBeTruthy();
            });

            it('should return a resolved promise if all provided promises are resolved', () => {
                return  MyPromise.all([
                        MyPromise.resolve(42),
                        25,
                        new MyPromise((resolve) => {
                            setTimeout(() => resolve(33), 500);
                        })
                    ])
                    .then((values) => {
                        expect(values).toEqual([42, 25, 33]);
                    });
            });

            it('should return a rejected promise if one provided promise is rejected', () => {
                return MyPromise
                    .all([
                        MyPromise.resolve(42),
                        25,
                        new MyPromise((resolve, reject) => {
                            setTimeout(() => reject(new Error('an error occurred')), 500);
                        })
                    ])
                    .then(() => {
                         // Fail test if above expression doesn't throw anything.
                        expect(true).toBe(false);
                    })
                    .catch((e) => {
                        expect(e.message).toBe('an error occurred');
                    });
            });
        });

        describe('and the method "race" ', () => {
            it('should exist', () => {
                expect(MyPromise.race).toBeDefined();
            });

            it('should return a Promise', () => {
                expect(
                    MyPromise.race([]) instanceof MyPromise
                ).toBeTruthy();
            });

            it('should return a resolved promise if the first achieved promise is resolved', () => {
                return MyPromise
                    .race([
                        new MyPromise((resolve) => {
                            setTimeout(() => resolve(42), 350);
                        }),
                        new MyPromise((resolve) => {
                            setTimeout(() => resolve(25), 150);
                        }),
                        new MyPromise((resolve) => {
                            setTimeout(() => resolve(33), 500);
                        })
                    ])
                    .then((value) => {
                        expect(value).toEqual(25);
                    });
            });

            it('should return a rejected promise if the first achieved promise is rejected', () => {
                return MyPromise
                    .race([
                        new MyPromise((resolve, reject) => {
                            setTimeout(() => reject(new Error('an error occurred - 1')), 350);
                        }),
                        new MyPromise((resolve, reject) => {
                            setTimeout(() => reject(new Error('an error occurred - 2')), 150);
                        }),
                        new MyPromise((resolve, reject) => {
                            setTimeout(() => reject(new Error('an error occurred - 3')), 500);
                        })
                    ])
                    .then(() => {
                         // Fail test if above expression doesn't throw anything.
                        expect(true).toBe(false);
                    })
                    .catch((e) => {
                        expect(e.message).toBe('an error occurred - 2');
                    });
            });
        });
    });
});
