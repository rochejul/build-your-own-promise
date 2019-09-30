# Build your own promise

Create our own promise implementation

## What is a Promise?

### Introduction

The first specification was published in 2007 through the Dojo framework.

A promise is a functional object used:

* For handling with async code
* For composition
* For chaining
* To be sure to run once the code
* To ease error management

Promise is used now as a base object for fetch or service worker API.

### First usage - fight the callback hell (or christmas tree)

Here an old (but classical) code:

````js
asyncFunction1(function(err, result) {
  asyncFunction2(function(err, result) {
    asyncFunction3(function(err, result) {
      asyncFunction4(function(err, result) {
        asyncFunction5(function(err, result) {
          // do something useful 
        });
      });
    });
  });
});
````

As we can see:

* Hard to read
* Hard to compose
* Hard to deal with errors
* ...


Same code with Promise

````js
asyncFunction1()
    .then(asyncFunction2)
    .then(asyncFunction3)
    .then(asyncFunction4)
    .then(asyncFunction5)
    .then((result) => {
        // do something useful
    })
    .catch(console.error);

````

### Second usage - run parallel asynchronous code

````js
Promise
    .all([
        asyncFunction1(),
        asyncFunction2()
    ])
    .then(([ result1, result2 ]) => {
        // do something useful
    });
````

## Promise API

### Instantiate a Promise

Use of "new" where we will provide a callback with two handlers:

1. resolve: handler to call when we fulfill the promise
2. reject: handler to call when we reject the promise

resolve or reject could be called many time: only the first call of one of the two handlers will be taken.

````js
function asyncFunc() {
   return new Promise( (resolve, reject) => {
      if (Math.round(Math.random()) === 1) {
          resolve(); // You can pass a value

      } else {
          reject(); // You can pass an exception
      }
   });
}
````

### Chaining

Each static and instance methods return a new Promise instance.

A Promise instance offers two methods:

* then
* catch

In both cases, we provide one handler.

* in then, we receive the value of the fulfilled promise
* in catch, we receive the error of the rejected promise

In both cases,

* if the handler raises an exception or return a rejected promise, the promise method will return a rejected promise and so only the catch method will be called
* otherwise, the promise method will return a fulfilled promise (if no value provided, undefined will be the value)

````js
asyncFunction1()
    .then((result) => {
        return Promise.all([
            asyncFunction2(),
            'test',
            result + 3
        ]);
    })
    .catch((err) => {
        console.error('An error occurred:', err);
    })
    .then(() => {
        console.info('Finished');
    });

````

### Static methods

#### Promise.resolve

Return a fulfilled promise.

````js
function asyncFunc() {
   if (aCondition) {
       return Promise.resolve(42);
   } 

   return new Promise( (resolve, reject) => {
      if (Math.round(Math.random()) === 1) {
          resolve(); // You can pass a value

      } else {
          reject(); // You can pass an exception
      }
   });
}
````

#### Promise.reject

Return a rejected promise.

````js
function asyncFunc() {
   if (aCondition) {
       return Promise.reject(new Error('an error occurred'));
   } 

   return new Promise( (resolve, reject) => {
      if (Math.round(Math.random()) === 1) {
          resolve(); // You can pass a value

      } else {
          reject(); // You can pass an exception
      }
   });
}
````

#### Promise.all

We will specify an array of promises.
The method "then" will be called only if all promises are fulfilled. And so an array of results is provided
Otherwise, "catch" will be called

````js
    Promise
        .all([
            request1(),
            request2()
        ])
        .then((results) => {
            // All required data are fetched
        })
        .catch(console.error);
````

#### Promise.race

We will specify an array of promises.
The first settled promise (fulfilled or rejected) will be taken and so the "then" method is called if the settled promise is fulfilled, "catch" otherwise.

````js
    Promise
        .race([
            searchOnEngine1(myTerms),
            searchOnEngine2(myTerms)
        ])
        .then((suggestions) => {
            // Do something
        })
        .catch(console.error);
````

## Promise, in ES2017

#### async / await

Syntaxes to simplify the usage of promise.

Instead of:

````js
function asyncFunc() {
   return new Promise( (resolve, reject) => {
      if (Math.round(Math.random()) === 1) {
          resolve(42); // You can pass a value

      } else {
          reject(new Error('gasp')); // You can pass an exception
      }
   });
}
````

We have

````js
async function asyncFunc() {
   if (Math.round(Math.random()) === 1) {
      return 42
   }

   throw new Error('gasp');
}
````

And to use it:

````js
(async function() {
    try {
        const result = await asyncFunc();
        // Do something

    } catch (err) {
        console.error(err);
    }
})();
````

Nota bene: "await" could be called only into an async function

## Promise, in ES2019

### "finally" instance method

Execute a code, regardless of whether everything went smoothly or there was an error.

````js
let connection;

db
    .open()
    .then(conn => {
        connection = conn;
        return connection.select({ name: 'Jane' });
    })
    .then(result => {
        // Process result
        // Use `connection` to make more queries
    })
    ···
    .catch(error => {
        // handle errors
    })
    .finally(() => {
        connection.close();
    });
````

### "allSettled" static method

A promise is "settled" when the promise is fulfilled or rejected.

"allSettled" means we will specify an array of promise and we will have all promises results and states, regardless or the fulfilled or rejected state.

````js
// First use case - collect rejected promises (to trigger them again later)
const promises = [ fetch('index.html'), fetch('https://does-not-exist/') ];

const results = await Promise.allSettled(promises);
const errors = results
  .filter(p => p.status === 'rejected')
  .map(p => p.reason);


  // Another use case - we call all requests and we don't care of the state of the requests
  Promise
    .allSettled(requests)
    .finally(() => {
        console.log('All requests are completed: either failed or succeeded, I don’t care');
        removeLoadingIndicator();
    });

````

## Resources

### Specifications

* https://tc39.github.io/ecma262/#sec-promise-objects
* https://www.w3.org/2001/tag/doc/promises-guide
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* https://promisesaplus.com/

### Toolings, slides, articles & players

* http://bevacqua.github.io/promisees/
* http://tdd.github.io/dotjs-async/
* https://www.promisejs.org/
* https://github.com/sindresorhus/promise-fun
* https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
* http://slow-burgers.joostlubach.com/promise
