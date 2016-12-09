---
title: How to scale React applications
date: 2016-12-09 18:00:15
tags:
  - javascript
  - react
categories:
  - Development
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
│   └── reducer
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

Import and link your module
===========================

Your module needs to export some stuff: a route ? a reducer ? a component ? It depends of the purpose of your module.

Add your route
--------------


Add your own reducer
--------------------
So, this module needs to communicate with the app. The app handles the store, so the module needs to get a place there. For this, I wrote a small library.

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


With `redux`, you need to link your reducer to the store.


Handle dependencies
===================
