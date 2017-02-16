---
title: How to scale React applications
date: 2017-02-16 18:00:15
tags:
  - javascript
  - react
categories:
  - Development
cover: howToScaleReactApplications.jpg
---

A good start
============
Often, it's easier to get a boilerplate via yeoman or a random git repository. Except the classical issue of the 453 useless dependencies, it will make you work with the "todo-list directory structure".

```
src
├── actions
│ └── product.js
├── containers
│ └── Product.js
├── constants
│ └── product.js
├── components
│ └── List.js
├── reducers
│ └── product.js
└── app.js
```

This structure is great at start, you can have a simple app with few features. Problems begin when you grow from 0 to 50000+ lines of code: if you want to change something, you'll look in 5 directories which include 40 files not related to your work. And it comes the time where naming becomes a pain. I'm pretty sure I'll want another `Product` component or `product` action.

(node_)modules
==============
One solution I tried is to create a directory structure related to features. I gather actions/reducers/components/... related to a feature in one directory, called a module.

```
src
├── modules
│ └── product-list
│   └── actions
│     └── index.js
│   └── components
│     └── List.js
│   └── containers
│     └── Product.js
│   └── reducers
│     └── index.js
│   └── index.js
└── app.js
```

With this structure, each feature has his own actions/reducers/components/... If you need to work on this feature, you have everything within easy reach. Plus, you could package this module as a node module on a private repository.

Import your module
===========================

Your module needs to export some stuff: a route ? a reducer ? a component ? It depends of the purpose of your module.

Add your module's route in your app
-----------------------------------
Since your module exports a route, you can import it in your app. If you're using a `routes.js` file for example which export all routes, you can just import/export this module route in the same file.

```
export { MY_MODULE_ROUTE } from 'modules/my-module';
```

Add your module's reducer in your app
--------------------
Your module needs a place in your app store. For this, I wrote a small library.

```
export const MODULE_REDUCER_KEY = 'module';
export const moduleReducers = {};

export const registerModuleReducer = (moduleName, reducer) => {
  if (!moduleReducers[moduleName]) moduleReducers[moduleName] = reducer;
};

export const getModuleState = (moduleName, state) => (
  state[MODULE_REDUCER_KEY][moduleName]
);
```
With this piece of code, you can link your reducer to the app store. Your module call registerModule, and then can access it through `getModuleState`.

Note: you have to register those reducers before initializing your store. Make sure your module call this function early (in module's `index.js` for example).

When all modules called the register function, you can create the store as follow:

```
import { MODULE_REDUCER_KEY, moduleReducers } from 'utils/modules/reducer';

const appReducer = combineReducers({
  [MODULE_REDUCER_KEY]: combineReducers(moduleReducers),
  anotherReducer1,
  anotherReducer2
});
```

Your store now contains a key 'module' which combines all reducers. Your module can access it through `getModuleState`

```
const mapStateToProps = state => ({
  search: getModuleState('my-module-key', state).search,
});
```

Note: you can also curry the `getModuleState` and get something more elegant

```
const moduleState = getModuleState('my-module-key');

const mapStateToProps = state => ({
  search: moduleState(state).search,
});
```

Conclusion
==========
This is a small article about how to handle large applications. I'll certainly write more articles on this, especially on dependencies.
