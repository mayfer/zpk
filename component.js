
define(function(require, exports) {
    const morphdom = require('./morphdom-umd.min');

    // jquery .on function equivalent
    function delegate(el, evt, sel, handler) {
        if (typeof sel === "function") {
            handler = sel;
            el.addEventListener(evt, handler);
        } else {
            el.addEventListener(evt, function(event) {
                var t = event.target;
                while (t && t !== this) {
                    if (t.matches(sel)) {
                        handler.call(t, event);
                    }
                    t = t.parentNode;
                }
            });
        }
    }

    function htmlentities(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    };

    class HTMLTemplate {
        constructor(html) {
            this.html = html;
        }
    }

    function tmpl(strings, ...values) {
        let str = '';

        if(Array.isArray(strings)) {
            // support array of templates being bassed
            strings.forEach( (s, i) => {
                if(strings[i] instanceof Component) {
                    strings[i] = strings[i].template().html;
                } else if(strings[i] instanceof HTMLTemplate) {
                    strings[i] = strings[i].html;
                }
            });
        } else {
            // support only a single argument being passed
            strings = [strings];
        }

        strings.forEach((string, i) => {
            let value = values[i];
            if(value instanceof HTMLTemplate) {
                str += `${string}${(value.html || '')}`;
            } else {
                str += `${string}${htmlentities(String(value || ''))}`;
            }
        });
        return new HTMLTemplate(str);
    }

    class Component {
        constructor({state={}, parent}) {
            this.namespace = this.constructor.name;
            this.state = state;
            if(parent) {
                this.init_client({parent});
            }
        }

        string_to_element(htmlString) {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();

            if(div.childNodes.length > 1) throw new Error("Components must only have one top level element");
            // Change this to div.childNodes to support multiple top-level nodes
            return div.firstChild;
        }

        template() {
            tmpl`<div>Template placeholder</div>`;
        }

        html() {
            return this.template().html;
        }

        render_diff(...args) {
            return morphdom(...args);
        }

        attach_to({parent_elem, replace_elem}) {
            let component_element = this.string_to_element(this.html());
            if(parent_elem) {
                let existing_elem = component_element.id ? document.getElementById(component_element.id) : parent_elem.getElementsByClassName(component_element.className)[0];
                if(existing_elem) {
                    this.element = this.render_diff(existing_elem, component_element);
                } else {
                    parent_elem.appendChild(component_element);
                    this.element = component_element;
                }
            } else if(replace_elem) {
                this.element = this.render_diff(replace_elem, component_element);
            }
            return this.element;
        }
        
        render() {
            if(this.element === undefined) {
                throw new Error("Component has not been attached to the document yet");
            }
            this.render_diff(this.element, this.html(), {
                onBeforeElUpdated: function(from, to) {
                    if(from.getAttribute("norender") !== null) return false;
                }
            });
        }

        css() {
            return ``
        }

        add_css_namespace(parentSelector, css) {
            if(!css) css = this.css();
            const reg = /^([ ]*)([a-zA-Z0-9,.:>_ -]+?)\s?\{/gm;
            return css.replace(reg, "$1" + parentSelector + " $2 {");
        };

        init_client({parent}) {
            this.attach_to({parent_elem: parent});
            this.load_css();
            
        }

        load_css() {
            var css = this.css(),
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            style.id = "css-"+this.constructor.name;
            if (style.styleSheet){
              // This is required for IE8 and below.
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }

        load_remote_css(path) {
            let id = path.replace(/[^a-zA-Z0-9_-]+/g, '_');
            if(!document.querySelector('link#'+id)) {
                let head = document.head;
                let link = document.createElement("link");

                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = path;
                link.id = id;

                head.appendChild(link);
            }
        }

        on(eventname, selector, callback) {
            if(!this.element) throw new Error("Component has not been attached to DOM");
            //debugger
            //var ns_eventname = eventname + "." + this.namespace;
            var ns_eventname = eventname;
            //$(this.element).on(ns_eventname, selector, callback);
            delegate(this.element, ns_eventname, selector, callback);
        }

        find(selector) {
            return this.element.querySelector(selector);
        }
    }

    return { Component, tmpl };
});
