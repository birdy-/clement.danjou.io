---
title: Migrate from Angular 1.x
date: 2016-01-23 15:59:08
tags:
  - javascript
  - angular
  - react
categories:
  - Development
thumbnail: /images/migrateAngular.jpg
---

For 2 years, we developed a web application based on Angular 1.x. It worked like a charm. This web application is still maintained and gets new features every weeks.

Since Angular 1.x will be deprecated and it’s very hard to hire web developer nowadays, we wanted to move on. React ? Ember ? Angular 2 ? We chose React, but I guess that those samples of code would work with another framework/lib.
When you have a web application which is used, you can’t start a new project from scratch. You need to migrate, part by part, your code to a new library. It was our goal for this change and this is the story of how we made it.

Prepare the path
================
Our Angular application was built with Grunt, a concat and an uglify. That’s all. Our first step was to use Browserify with Grunt. It allowed us to require some packages. If you don’t use Browserify or webpack, this is a mandatory first step. Maybe it could be possible with another package format like AMD.

Migrate services
================
One big issue with Angular when it comes to ‘migration’ is its own patterns: factories, services, directives, … I can’t use services in React. On the other hand, I can use javascript in services. Yes, obvious.
Our first step was to migrate all things we need as native javascript. ‘Things we need’ means: objects we need in Angular and in React. Our services for API calls became nice ES6 objects. Same for tools and everything which could be useful. These new free libraries had been extracted in a nice repositories. ‘npm install our-shiny-api-libraries’ is possible now. We just require these libraries in our old Angular services.

Migrate async libraries
-----------------------
If you have some services who make $http calls, you will encounter some issues. $https is not $q which isn’t an ES6 Promise. So you have to fake it.
ES6 Promises can’t cancel, ES6 Promises always return the same result as param.
{% codeblock lang:javascript %}
// Promise example
myES6Promise.then(function (myResults) {
 console.log(myResults); // "Rabbit"
 return "Fox";
});
myES6Promise.then(function (myResults) {
  console.log(myResults); // "Rabbit"
});
// $q example
myAngularPromise.then(function (myResults) {
 console.log(myResults); // "Rabbit"
 return "Fox";
});
myAngularPromise.then(function (myResults) {
  console.log(myResults); // "Fox"
});
{% endcodeblock %}
$q works like that: if a function in “then” returns a value, it will be the new value sent as param for the next then. ES6 Promises don’t work like that and we didn’t want to make our new-shiny-es6-leet-api-libraries works like that. On the other hand, we had plenty of code which relied on this feature in our angular controllers.

So we made a wrapper. Our wrapper extends our API ES6 Class and rewrite on the fly the promise returned by the Api class.

{% codeblock lang:javascript %}
export default class ApiWrapper extends Api {
  constructor ($q, ...args) {
    //ApiWrapper receives $q and sent the rest to Api class.
    super(...args);
    this.$q = $q;
  }
  wrapMethod (method, …args) {
    // Method is the method to wrap, and we received the rest of arguments for this method
    // We call the "nice" API with their args
    var apiPromise = super[method](…args);
    // First we "wrap" this ES6 Promise in $q
    var promise = this.$q.when(apiPromise);
    // Then we fake a $http object. Our old code used to use success and error methods but they aren't implemented in $q
    promise.success = (callback) => {
      promise.then(function(response) {
        callback(response.data, response.status, response.headers);
      });
      return promise;
    }
    promise.error = (callback) => {
      promise.then(null, function(response) {
        callback(response.data, response.status, response.headers);
      });
      return promise;
    }
    // We use cancelable-promise to allow a promise to be canceled
    promise.cancel = () => {
      apiPromise.cancel();
      promiseFinished = true;
    }
    return promise;
 }
{% endcodeblock %}
With this, we faked a $http promise. The cancel is not implemented in ES6 Promises, we made a simple cancelable-promise for this (based on ES6 Promises).
Now we can override our method (since ApiWrapper extends our Api class)
{% codeblock lang:javascript %}
get (...args) {
  return this.wrapMethod('get', ...args);
}
{% endcodeblock %}
You have to keep in mind two things: protractor and Interceptors. Protractor failed with this since Protractor doesn’t wait $q, but only $http and $timeout. To avoid this issues, we made an ugly fix inside our wrapper.
{% codeblock lang:javascript %}
var promiseFinished = false;
// We make the first "then" for our promise. It sets if the promise is finished.
// To get $timeout, we added a parameter in our ApiWrapper constructor (like $q)

promise.then(() => { promiseFinished = true; }, () => { promiseFinished = true; });
// Then, we poll 'til our promise is finished
var polling = () => {
 this.$timeout(() => {
   if (!promiseFinished) {
     polling();
   }
 }, 1000);
};
polling();
{% endcodeblock %}
For interceptors, we made a function to add interceptors. For this, we needed to update our angular code.

Let’s go
========
Now we have our core libraries available through Angular and through React. Now we can start React. For this we used ngReact which includes React component inside a directive.

Everything worked like a charm… if you use the Angular router. The main issue with Angular router is it will try to do someting when route change: you’ll have some blink effect each time you change URL. So, we decided to have a full React app inside AngularJS: react, redux, of course, but also redux-router.
Manage two routers in one app

If you have a route called “products” used in React.
* You have to declare this route in Angular
* You have to declare this route in React

It’s not hard work and it allows you to have a fully autonomous React app. Now, if you want to avoid these blink effects, you have to trick Angular’s router. On each controller which instantiates your React component, you have to notify angular’s router that you don’t want him to handle URL change.

For this, we use a simple trick found on StackOverflow: when URL change, we reset current route to the last route. Angular thinks that nothing happened. The rule is as follow: if current URL is React and next is React, do nothing. How to know if it’s react or not ? We use some simple regexp but I’m sure we can do something smarter.
{% codeblock lang:javascript %}
angular.module('myapp').factory('reactRouting', function ($route, $location, $rootScope) {
var reactRoutes = [
  /\/my-react-route-1\/([0-9]+)/i,
  /\/my-react-route-2\/products/i
];
if (cancel) {
  cancel();
}

var lastRoute = $route.current;
cancel = $rootScope.$on('$locationChangeSuccess', function (angularEvent, newUrl, oldUrl) {
  var keepRoute = reactRoutes.some(function (regexp) {
    if (oldUrl.match(regexp) && newUrl.match(regexp)) {
      return true;
    }
  });
  if (keepRoute) {
    $route.current = lastRoute;
  }
});
});
{% endcodeblock %}
This factory is used in our ReactController.
Conclusion
==========
Using React inside Angular is easier than we thought at start. The main issues come from shared libraries. If you heavily used Angular paradigms, it can be painful, but everything was Javascript at start.
