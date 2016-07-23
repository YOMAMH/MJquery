(function (window) {

    var class2type = {
            '[object Array]': 'array'
        },
        toString = class2type.toString,
        iArray = [],
        push = iArray.push,
        document = window.document;

    // 选择器模块
    var select = (function () {
        var rnative = /^[^{]+\{\s*\[native \w/,
            rquickExpr = /^(?:#([\w-]+)|\.([\w-]+)|(\w+)|(\*?))$/,
            support = {
                getElementsByClassName: rnative.test(document.getElementsByClassName)
            };
// tag
        function getTag(tagName, context, results) {
            results.push.apply(results, context.getElementsByTagName(tagName));
            return results;
        }

// id
        function getId(idName, results) {
            results.push(document.getElementById(idName));
            return results;
        }

// class
        function getClass(className, context, results) {
            if (support.getElementsByClassName) {
                results.push.apply(results, context.getElementsByClassName(className));
            } else {
                each(getTag('*', context), function () {
                    if ((' ' + this.className + ' ').indexOf(' ' + trim(className) + ' ') > -1) results.push(this);
                });
            }
            return results;
        }

// '.d' '#id' 'p' '*' '-'
        function get(selector, context, results) {
            results = results || [];
            context = context || document; // 赋初值
            var match = rquickExpr.exec(selector);
            if (match) { // 如果不为null， 说明selector符合要求
                if (match[1]) results = getId(match[1], results); // id选择器
                else {
                    // 统一类型 为array
                    if (context.nodeType) context = [context]; // 如果为dom结点，就其转换成数组
                    // 如果为字符串，就当做选择器，并获取相应dom元素
                    if (typeof context === 'string') context = get(context);
                    each(context, function () {
                        if (match[2])  results = getClass(match[2], this, results); // 类选择器
                        else if (match[3])  results = getTag(match[3], this, results); // tag（标签）选择器
                        else if (match[4])  results = getTag(match[4], this, results); // 通配符
                    });
                }
            }
            return results;
        }

        function select(selector, context, results) {
            results = results || [];
            each(selector.split(','), function () {
                var res = context;
                each(this.split(' '), function () {
                    res = get(this, res);
                });
                results.push.apply(results, res);
            });
            return results;
        }

        function each(obj, callback) {
            var i, l;
            for (i = 0, l = obj.length; i < l; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) break;
            }
        }

        function trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        }

        return select;
    }());


    // 核心函数
    function MJQ(selector) {
        return new MJQ.fn.init(selector);
    }

    // 核心原型
    /*MJQ.prototype.selector = null;
     MJQ.prototype.init = function (selector) {

     };*/

    MJQ.fn = MJQ.prototype = {
        constructor: MJQ,
        selector: null,
        init: function (selector) {
            // handle: null undefined false ''
            if (!selector)  return this;
            // handle: string
            else if (MJQ.isString(selector)) {
                // html '<p>' :创建dom元素
                if (MJQ.isHTML(selector)) {
                    // var doms = MJQ.parseHTML(selector);
                    // push.apply(this, doms);
                    push.apply(this, MJQ.parseHTML(selector));
                }
                // selector ：使用选择器方法获取到相应的dom元素                    
                else {// this.elements = doms;

                    // var doms = select(selector);
                    //[].push.apply(this, doms);
                    push.apply(this, select(selector));
                    // this.selector = selector;
                }
                return this;
            }
            // handle: function : 就将函数绑定到window的onload事件上
            else if (MJQ.isFunction(selector)) {
                // 1.获取window的onload事件的处理函数
                var oFn = window.onload;
                // 2.如果是函数，那么
                if (MJQ.isFunction(oFn)) {
                    window.onload = function () {
                        oFn();
                        selector();
                    };
                } else {
                    window.onload = selector;
                }
            }
            // handle: MJQ object
            else if (MJQ.isMJQ(selector)) return selector;
            // handle: dom element ：将dom元素转换成MJQ对象，目的为了可以访问到MJQ对象上的方法。
            else if (MJQ.isDOM(selector)) {
                /*  this[0] = selector;
                 this.length = 1;*/
                push.call(this, selector);
                return this;
            }
            // handle: dom array
            else if (MJQ.isLikeArray(selector)) {
                push.apply(this, selector);
                return this;
            }
        },
        each: function (callback) {
            MJQ.each(this,callback);
            return this;
        }
    };
    MJQ.fn.init.prototype = MJQ.fn;
    // 可扩展
    MJQ.extend = MJQ.fn.extend = function (target, source) {
        var k;
        if (source === undefined) {
            for (k in target) {
                this[k] = target[k];
            }
        } else {
            for (k in target) {
                source[k] = target[k];
            }
        }
    };
    // 类型判断
    MJQ.extend({
        isString(obj) {
            return !!obj && typeof obj === 'string';
        },
        isFunction(obj) {
            return !!obj && typeof obj === 'function';
        },
        isWindow(obj) {
            return !!obj && obj.window == window;
        },
        isLikeArray(obj) {
            var length = !!obj && 'length' in obj && obj.length;
            var type = MJQ.type(obj);

            if (type === 'function' || MJQ.isWindow(obj))  return false;

            // {length:1,//...}
            return type === 'array' || length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        },
        isMJQ(obj) {
            return !!obj && 'selector' in obj;
        },
        isDOM(obj) {
            return !!obj && !!obj.nodeType;
        },
        isElement(obj) {
            return !!obj && 'nodeType' in obj && obj.nodeType === 1;
        },
        isHTML(html) {
            var tHtml = MJQ.trim(html);
            return tHtml.charAt(0) === '<' && tHtml.charAt(tHtml.length - 1) === '>' && tHtml.length >= 3;
        }
    });
    // 工具类方法
    MJQ.extend({
        type(obj) {
            if (obj == null) return obj + "";
            var key = toString.call(obj);
            //return class2type[key];
            return key.slice(8, -1);
        },
        each(obj, callback) {
            var i, l;
            if (MJQ.isLikeArray(obj)) {
                for (i = 0, l = obj.length; i < l; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) break;
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) break;
                }
            }
        },
        trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        parseHTML(html) {
            var div;
            div = document.createElement('div');
            div.innerHTML = html;
            return div.children;
        }
    });
    MJQ.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(' '), function () {
        class2type["[object " + this + "]"] = this.toLowerCase();
    });

    // 样式类方法
    MJQ.fn.extend({
        css(cssName, cssValue) {
            if (arguments.length === 1) {
                if (MJQ.type(cssName) === 'object') { // 如果类型为object，那么表示将多个样式包装成对象，统一设置
                    return this.each(function (i, dom) {
                        MJQ.each(cssName, function (c) {
                            // debugger;
                            dom.style[c] = this;
                        });
                    });
                } else { // 否则，就是获取相应的样式值
                    return this.length === 0 ? undefined : this[0].style[cssName];
                    return this.length > 0 ? this[0].style[cssName] : undefined;
                }
                /*
                 var res;
                 this.each(function () {
                 if (MJQ.isElement(this)) {
                 res = this.style[cssName]
                 return false;
                 }
                 });
                 return res;*/
            } else {
                // 1.遍历当前对象上的所有dom
                return this.each(function (i, dom) {
                    dom.style[cssName] = cssValue;// 2.将遍历到的当前MJQ对象上的dom，给其设置样式。
                });
            }
        },
        addClass(className) {
            return this.each(function () {
                // this.className += ' ' + className;
                // this.removeClass(className); // 如果有 就删除 ，之后在重新添加
                this.className = MJQ.trim(this.className + ' ' + MJQ.trim(className));
            });
        },
        removeClass(className) {
            return this.each(function () {
                //var oldC = ' ' + this.className + ' ';
                //this.className = MJQ.trim(oldC.replace(' ' + className + ' ', ' '));
                // 'c f'
                /*var that = this;
                 MJQ.each(className.split(' '), function () { // ['c', 'f']
                 that.className = MJQ.trim((' ' + that.className + ' ').replace(' ' + this + ' ', ' '));
                 });*/

                this.className = MJQ.trim((' ' + this.className + ' ').replace(' ' + className + ' ', ' '));

            });
        }
    });

    // 属性操作
    MJQ.fn.extend({
        // 通用方法
        attr(attrName, attrValue) {
            if (attrValue === undefined) { // get attribute value
                // 直接返回当前对象上第一个dom元素的属性值
                return this.length > 0 ? this[0].getAttribute(attrName) : undefined;
            }
            else { // set some attribute value
                // 遍历每个dom元素
                return this.each(function (i, dom) {
                    // if(MJQ.isElement(dom)) {dom.setAttribute(attrName, attrValue);}
                    // 给每个dom设置属性
                    dom.setAttribute(attrName, attrValue);
                });
            }
        },
        html(html) {
            // get innerHTML string
            if (html === undefined) {
                return this.length > 0 ? this[0].innerHTML : undefined;
            }
            // set innerHTML
            else {
                // 遍历每一个dom,并设置值
                return this.each(function () {
                    this.innerHTML = html;
                });
            }
        },
        // select nodeName SELECT
        val(v) {
            // get value
            // if(this.nodeName === 'SELECT')
            if (v === undefined) {
                return this.length > 0 ? this[0].value : undefined;
            }
            // set value
            else {
                return this.each(function () {
                    this.value = v;
                });
            }
        },
        text(txt) {
            // get text
            if (txt === undefined) {
                return this.length > 0 ? this[0].innerText ? this[0].innerText : this[0].textContent : undefined;

            }
            // set text
            else {
                // 遍历每一个dom，并设置值
                return this.each(function () {
                    // 如果支持innerText
                    if (this.innerText) {
                        this.innerText = txt;
                    } else { // 否则就使用textContent
                        this.textContent = txt;
                    }
                });
            }
        }
    });

    //DOM操作类
    MJQ.fn.extend({

        //appendTo 把遍历到的元素添加到目标元素的所用子节点之后
        appendTo(selector){
            var target = MJQ(selector),
                len = target.length,
                node,
                list = [];

            this.each(function (i,chl) {
                target.each(function (i) {
                    node = i === len -1?chl:node.cloneNode(true);
                    list.push(node);
                    this.appendChild(node);
                });
            });
            return MJQ(list);
        },

        //append 给遍历到的元素添加子节点
        append(selector){
            MJQ(selector).appendTo(this);
            return this;
        },

        //prependTo 把遍历到的元素添加到目标元素的所用子节点之前
        prependTo(selector){
            var target = MJQ(selector),
                len = target.length,
                node,
                that = this,
                list = [],
                firstCl;
            target.each(function (i,dom) {
                firstCl = dom.firstChild;
               that.each(function (i) {
                   node = i ===len -1?this:this.cloneNode(true);
                   list.push(node);
                   dom.insertBefore(node,firstCl);
               });
            });
            return MJQ(list);
        },

        //prepend 给遍历到的元素添到子节点于该元素的所有节点之前
        prepend(selector){
            MJQ(selector).prependTo(this);
            return this;
        },

        //reomve 删除子元素
        remove(){
            this.each(function () {
                this.parentNode.removeChild(this);
            });
        },

        //next 下一个兄弟节点
        next(){
            var nex;
            if(this.length>0){
                 nex = this[0];
                while (nex = nex.nextSibling){
                    if(nex&&nex.nodeType == 1)break;
                }
                return MJQ(nex);
            }
        },

        nextAll(){
            var nex,
                list =[];
            if(this.length>0){
                nex = this[0];
                while (nex = nex.nextSibling){
                    if(nex&&nex.nodeType == 1) list.push(nex);
                }
                return MJQ(list);
            }
        }
    });
    MJQ.each('click dblclick mousedown mouseup mouseenter mouseleave keypress keydown keyup focus blur'
        .split(' '), function (i, type) {
        //  var self = this;  // this 指向上述数组中的每一个元素
        MJQ.fn[type] = function (callback) {
            return this.on(type, callback); // this 指向MJQ对象
        }
    });
    MJQ.extend({
        getFnName(fn) {
            return fn.name || fn.toString().match(/function\s*([\w-]+)\s*\(/)[1];
        }
    });
    //Event事件
    MJQ.fn.extend({

        //click
        click(callback){
            return this.each(function () {
                var self = this;
                this.addEventListener?this.addEventListener('click',callback):this.attachEvent('onclick', function () {
                    callback.call(self);
                });
            });
        },

        dblclick(callback){
            return this.each(function () {
                var self = this;
                this.addEventListener?this.addEventListener('dblclick',callback):this.attachEvent('ondblclick', function () {
                    callback.call(self);
                });
            });
        },

        //通用事件函数
        on(type, callback) {
            return this.each(function () {
                var self = this;
                // 处理兼容
                if (this.addEventListener) { // 如果支持addEventListener
                    this.addEventListener(type, callback, false);
                }
                else if (this.attachEvent) {
                    // {'handle': fn(),'handle1': fn2}
                    // 1.第一次给当前dom元素添加事件，此dom具有‘data-ehdls’属性？
                    var _d = this['data-ehdls'] || {},
                     _h = function () {
                     callback.call(self);
                     },
                     fnName = MJQ.getFnName(callback);
                     if (fnName) _d[fnName] = _h;
                     this['data-ehdls'] = _d;
                     this.attachEvent('on' + type, _h);
                }
            });
        },
        off(type, callback) {
            return this.each(function (i, dom) {
                // 处理兼容性
                if (dom.removeEventListener) {
                    dom.removeEventListener(type, callback);
                }
                else if (dom.detachEvent) {
                    dom.detachEvent('on' + type, this['data-ehdls'][MJQ.getFnName(callback)]);
                    delete this["data-ehdls"][MJQ.getFnName(callback)];
                }
            });
        }

    });

    // animation model
    // easing functions (缓动函数)
    MJQ.easing = {
        // x 当前对象，通常为null；t:经过的时间间隔（time）；b：初始位置 location；c：目标位置 target
        // d：经历总时间 dur
        linear: function (x, t, b, c, d) {
            /* var distance = target - location,
             speed = distance / dur;
             return time * speed;*/
            return (c - b) * t / d;
        },
        minusspeed: function (x, t, b, c, d) {
            return 2 * t * (c - b) / d - (c - b) * t * t / ( d * d);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }
    };

    MJQ.fn.extend({
        animate: function (target, dur, easingName) {
            return this.each(function () {
                var that = this,
                    startTime = +new Date,
                    location = MJQ.getLocations(this, target),
                    distance = MJQ.getDistance(this, target); // + 可以将日期格式转换成毫秒格式
                var timerId = this.timer;
                // if (timerId) return;
                if (!timerId) {
                    var play = function () {
                        var curTime = +new Date,
                            time = curTime - startTime,
                            tween;
                        if (time >= dur) {
                            tween = distance;
                            clearInterval(that.timer);
                            delete that.timer;
                        } else {
                            tween = MJQ.getTweens(time, location, target, dur, easingName);
                            // tween = 2 * time * distance / dur - distance * time * time / ( dur * dur);
                        }
                        MJQ.setStyles(that, location, tween);
                        //that.style.left = location + tween + 'px';
                    };
                    play(); // 避免第一次动画卡顿
                    that.timer = setInterval(play, 20);
                }
            });
        },
        isAnimating: function () {
            return this.length > 0 ? !!this[0].timer : false;
        }
    });


    // 暴漏外部
    window.M = window.MJQ = MJQ;
}(window));
