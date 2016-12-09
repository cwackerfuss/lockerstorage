# TreeLockr.js

TreeLockr helps you manage a global state tree and simultaneously syncs all changes to Local Storage.

  - Mutable -- you mutate a single object rather than creating a fresh copy on every update like Redux does. There may be an option to produce an immutable state tree in the future, but it's mutable by default for now so the library works with rudimentary data binding engines like Rivets.
  - Small API
  - Allows you to save any javascript types: strings, objects, arrays, integers, etc.

## Installation
#### -- *This section under construction*
Create a singleton assigned to a variable of your choice (for this example let's use `Store`), then run `.getInitialStore(*your_config*)`, where `*your_config*` is an object with your initial state tree assigned to the key `initialState`.
~~~~
var stateConfig = {
  initialState: {
    user: {
      firstName: 'Tony'
    },
    cartItems: []
  }
};
(function() {
  Store = TreeLockr()
  Store.getInitialStore(stateConfig)
})()
~~~~
After running the `getInitialStore` method, `Store.data` will contain the global state of your application. You can `console.log(Store.data)` to see that this is true.

## API Guide
### `ref`
Returns a reference to the query's state location.
Accepts an array whose items are keypaths. You can either pass a string or an integer. An integer is only used for arrays to indicate an index. **Note:** the actual data object is returned inside `.data`.
~~~~
var potato = Store.ref( ['user', 'firstName'] )
console.log(potato.data)  // <-- "Tony"
~~~~


### `set`
Write or replace data to a defined path.
Accepts two arguments. The first is the same path you would define in `.ref()` above, and the second is the value with which you wish to update that location.
~~~~
Store.set(['user'], {
  firstName: 'Greg'
})
~~~~
You can also create a new location at a defined path. For instance, if `address` is not currently defined in your state, you can write it with:
~~~~
Store.set(['user', 'address'], {
  city: 'Minneapolis',
  state: 'Minnesota'
})
~~~~

### `push`
Generates a new child location **in an array**. It won't work if the object isn't an array. Helpful if you need to loop through an enumerable data set.
~~~~
var item = {
  product: 'Bathing Suit',
  cost: '35.99'
}
Store.push(['cartItems'], item)
~~~~

### `remove`
Remove data from a specific location
This is a curried function, so you must pass two sets of `()`'s when you call it. The first `()` contains an argument that is the key which you wish to delete, and the second `()` contains the path to the parent of that key.
~~~~
// this removes the item at index 0 of 'cartItems'
Store.remove(0)(['cartItems'])

// this removes anything inside of 'user.address'
Store.remove('address')(['user'])
~~~~
....
....

And so concludes the API guide.
