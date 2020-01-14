# zpk

## A simple React-like Front-end Javascript library that avoids Webpack &amp; browserify

**zpk.js** is a lightweight and complete UI library for those who dislike Webpack and Browserify.

---

### Motivation for the project

Most simplified React-like frameworks (such as Preact or choo) still assume the use of bundlers like Webpack or Browserify to compile the project; leading to additional complexity and time spent configuring and optimizing such tools.

Zeropack is a single-file UI component library that works directly in the browser, without needing any bundling or transpiling.

### Goals:
* Make it easy to keep a project's initial download size tiny, even as it grows. Lazy-loading of all HTML/CSS/JS as needed
* Avoid bundling. All code should run out-of-the-box on modern browsers.
* Achieve full browser compatibility while still using ES6 syntax
* Have a good templating method that automatically sanitizes strings to avoid XSS
* Only update the DOM elements that have changed upon render().

### Solutions:
* require.js for lazy-loading modules &amp; managing dependencies
* morphdom.js for DOM diffing
* ES6 tagged template literals for component HTML &amp; CSS
* global-define.js for importing UI components on the server for server-side rendering
* babel.js for transpiling ES6 code to ES5 for IE compatibility

---

## Examples

### One-page example:
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8' />
        <title>Zeropack example</title>
    </head>
    <body>
        <script src="./require.min.js"></script>
        <script type="text/javascript">
            define("ChildComponent", function(require, exports) {
                const { Component, tmpl, } = require("./component");
                return class ChildComponent extends Component {

                    template() {
                        return tmpl`
                            <div class='box'>
                                This is a child component
                                <div>
                                    ${this.state.number}
                                </div>
                            </div>
                        `
                    }


                    css() {
                        return ` .box { padding: 50px; border: 5px solid black; } `;
                    }

                    init() {
                        setInterval(() => {
                            this.state.number++;
                            this.render();
                        }, 1000);
                    }
                }
            });
        </script>

        <script type="text/javascript">
            define("ParentComponent", function(require, exports) {
                
                const { Component, tmpl, } = require("./component");
                const ChildComponent = require('ChildComponent');

                return class ParentComponent extends Component {
                    constructor({parent}) {
                        super({parent});
                        this.child_component = new ChildComponent({state: {number: 1}, parent: this.find(".child-container")});
                    }

                    template() {
                        return tmpl`
                            <div>
                                This is the parent component
                                <div class="child-container">
                                    ${this.child_component}
                                </div>
                            </div>
                        `
                    }


                }
            });
        </script>

        <script type="text/javascript">

            require(["ParentComponent"], function(ParentComponent){
                var component = new ParentComponent({ parent: document.querySelector('body') });
            })
        
        </script>
    </body>
</html>

```



### Lazy-loading of components

You can use require.js built-in require function asynchronously:

```javascript
require(["./module_name", function(ModuleName) {
    ...
});
```


### Server-side rendering in node
Put this in your node.js top-level entry point (i.e. `server.js` or `run.js`):
```javascript
require('global-define')({basePath: __dirname+'/client'});
```
And then require the file as you normally would anywhere within the project:
```javascript
const SomeComponent = require("some_component");
const response_html = (new SomeComponent({...})).html();
```



### Prevent component from re-rendering an element
Just add `norender` attribute to any html element.
```html
<div class="bla" norender>
    ...
</div>
```


### Other Component API
Other useful functions you should feel free to use are:

```javascript
Component.load_css()   // loads style sheet onto page (overwrites if already loaded)
                       // load_css() happens automatically in constructor (client-side only)

Component.css()        // returns CSS as string
Component.load_remote_css(path)   // loads style sheet from URL
Component.init()       // blank method that gets called upon DOM init. should be defined by user

Component.add_css_namespace(selector, css)   // returns new css with parent selector added to all css statements
Component.on("event", selector, callback)    // like the jQuery .on()
Component.find("selector")    // like the jQuery .find()

Component.element      // reference to the root DOM element of the component
```



### ES6 to ES5 transpiling for IE support
Make sure you install `npx`, `@babel/preset-env` and `babel-plugin-iife-wrap`. Then run
```bash
npx babel client/ -d client.es5 --presets=@babel/preset-env --plugins=iife-wrap
```
where `client/` is the ES6 directory, and `client.es5` is the target directory. Filenames and file structure remains unchanged.

At this point you can gracefully downgrade to the ES5 code with older browsers by configuring require.js on the browser:
```javascript
function check_es6() {
    "use strict";

    if (typeof Symbol == "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }
    return true;
}

var js_base_url;
if (check_es6()) {
    // regular ES6 folder
    js_base_url = '/client/';
} else {
    // transpiled ES5 folder
    js_base_url = '/client.es5/';
}

requirejs.config({
    baseUrl: js_base_url,
});


```

Warning: you may also need the following polyfills for IE11 support.

You can load them only on browsers that don't support ES6 via require.js:
```javascript
var libs = [];
if (!check_es6()) {
    libs = ["polyfills/regenerator-runtime.min", "polyfills/external-helpers", "polyfills/ie-polyfill"];
}
require(libs, function() {
    // run rest of app
})
```
