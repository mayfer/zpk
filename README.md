# Zeropack

## A simple React-like Front-end Javascript library that avoids Webpack &amp; browserify


Zeropack is a lightweight and complete UI library for those who dislike Webpack and Browserify.

### Motivation for the project

Most simplified React-like frameworks (such as Preact or choo) still assume the use of bundlers like Webpack or Browserify to compile the project; leading to additional complexity and time spent configuring and optimizing such tools.

Zeropack is a single-file UI component library that works directly in the browser, without needing any bundling or transpiling.

#### Goals:
* Make it easy to keep a project's initial download size tiny, even as it grows. Lazy-loading of all HTML/CSS/JS as needed
* Avoid bundling. All code should run out-of-the-box on modern browsers.
* Achieve full browser compatibility while still using ES6 syntax
* Have a good templating method that automatically sanitizes strings to avoid XSS
* Only update the DOM elements that have changed upon render().

#### Solutions:
* require.js for lazy-loading modules &amp; managing dependencies
* morphdom.js for DOM diffing
* ES6 tagged template literals for component HTML &amp; CSS
* global-define.js for importing UI components on the server for server-side rendering
* babel.js for transpiling ES6 code to ES5 for IE compatibility



#### Example:
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

                    init_client({parent}) {
                        this.attach_to({parent_elem: parent});
                        this.load_css();

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

                class ParentComponent extends Component {
                    constructor({parent}) {
                        super({parent});
                        this.child_component = new ChildComponent({state: {number: 1}, parent: this.element});
                    }

                    template() {
                        return tmpl`
                            <div>
                                This is the parent component
                                <div>
                                    ${this.child_component}
                                </div>
                            </div>
                        `
                    }

                }

                return ParentComponent;
            });
        </script>

        <script type="text/javascript">

            require(["ParentComponent"], function(ParentComponent){
                var component = new ParentComponent({
                    parent: document.querySelector('body'),
                });
            })
        
        </script>
    </body>
</html>
```

