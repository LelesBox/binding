/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by li_xiaoliang on 2015/8/18.
	 */
	var binding = __webpack_require__(1);
	binding({
	    id: "example1",
	    data: {
	        text: ""
	    },
	    clickText: function () {
	        this.text++;
	    }
	})
	
	binding({
	    id: "example2",
	    data: {
	        left: "",
	        right: "",
	        sum: ""
	    },
	    sum: function () {
	        this.sum = parseInt(this.left) + parseInt(this.right);
	    },
	    multiply: function (data) {
	        this.sum *= data;
	    }
	})
	
	binding({
	    id: "example3",
	    data: {
	        data: ""
	    }
	})
	
	binding({
	    id: "example5",
	    data: {
	        ctn: ""
	    },
	    inputChanged: function (name, newvalue, oldvalue) {
	        this.callbind("example6", "data", {ctn: newvalue});
	    },
	    test: function (data) {
	        console.log("I AM TEST　" + data)
	    }
	})
	
	binding({
	    id: "example6",
	    data: {
	        ctn: ""
	    },
	    inputChanged: function (name, newvalue, oldvalue) {
	        //调用实例的data对象
	        this.callbind("example5", "data", {ctn: newvalue});
	        //也可以这么调用实例的方法，
	        this.callbind("example5", "test", [newvalue]);
	    }
	})
	
	
	binding({
	    id: "example7",
	    data: {
	        text: "TEST"
	    }
	})
	
	
	//测试 _bind
	binding({
	    id: "example-1",
	    data: {
	        text: ""
	    },
	    clickText: function () {
	        this.text++;
	    }
	})
	
	binding({
	    id: "example8",
	    data: {
	        items: [1, 2, 3],
	        itemObjs: [{a: 1}, {a: 2}, {a: 'a'}]
	    },
	    itemClick: function (n) {
	        console.log(n);
	        this.items.push(1);
	    }
	})

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by li_xiaoliang on 2015/9/20.
	 */
	var binding = __webpack_require__(2);
	
	module.exports = binding;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by li_xiaoliang on 2015/7/25.
	 */
	var observe = __webpack_require__(3);
	
	var binding = function (args) {
	    //用于标识binding中文本节点的id
	    var textnodeid = 0;
	    //保存存在变量的文本节点
	    var textnodes = {};
	    //文本变量和对应的nodeid，
	    var textVariables = {};
	    //_class表达式
	    var classFuncs = {};
	    //由于中文的输入法对导致监听oninput事件时触发事件，所以需要在输入input时数据保存到data上下文但是不触发observe更新，所以这里需要一个指示flag
	    var inputing = false;
	    var _binding = function (args) {
	        this.args = args;
	        this.obserData(args);
	        args.data["callbind"] = this.callbind;
	        var top = document.getElementById(args.id);
	        //   遍历节点
	        this.traversalAndMount(top);
	        //    执行初始化操作init
	        if (args.init) {
	            args.init.apply(args.data);
	        }
	    }
	
	    _binding.prototype = {
	        //挂载方法
	        mount: function (element, args) {
	            for (var i = 0, d; d = element.attributes[i++];) {
	                //找到特性属性，以_开头
	                if (startWith(d.name, "_")) {
	                    //因为repeat模式下的特点，_bind对象不能转化Wie{{}}形式，所以先查找repeat对象，在转换_bind值
	                    if (d.name === "_repeat") {
	                        this._repeat(element, d.value, args);
	                    }
	                    if (d.name === "_bind") {
	                        if (d.value.indexOf("'") > -1 || d.value.indexOf('"') > -1 || /^[0-9]*$/.test(d.value))
	                            element.innerHTML = d.value.replace(/'/g, "");
	                        else
	                            element.innerHTML = "{{" + d.value + "}}"
	                    }
	                    if (d.name === "_click") {
	                        this._click(element, d.value, args);
	                    }
	                    if (d.name == "_class") {
	                        var express = d.value.split(",");
	                        this._class(element, express);
	                    }
	                    if (d.name == "_model") {
	                        this._model(element, d.value)
	                    }
	                    if (d.name == "_change") {
	                        this._change(element, d, args);
	                    }
	                    //使用select元素时，这个值绑定选定的option值
	                    if (d.name == "_selected") {
	                        this._selected(element, d.value)
	                    }
	                }
	            }
	            //查找{{}}文字节点，
	            for (var j = 0, node; node = element.childNodes[j++];) {
	                if (node.nodeType === 3 && node.data.trim() !== "") {
	                    textnodes[textnodeid] = {};
	                    textnodes[textnodeid]["node"] = node;
	                    //保存此node下的文本变量
	                    var matchs = [];
	                    var t = "''";
	                    var offset = 0;
	                    var text = "";
	                    node.data = node.data.replace(/\n/g, "");
	                    node.data = node.data.replace(/{{(.*?)}}/g, function (match, value, index, str) {
	                        //保存可以动态更新的变量
	                        //保存变量对应的nodeid
	                        //双花括号里可能是'a'或者是数字，这种情况下直接显示它们
	                        if (value.indexOf("'") > -1 || /^[0-9]*$/.test(value)) {
	                            return value.replace(/'/g, "");
	                        } else if (args.data[value] != undefined) {
	                            if (!textVariables[value]) {
	                                textVariables[value] = [];
	                            }
	                            dupArrayByAdd(matchs, value);
	                            t = t + "+'" + str.substring(offset, index) + "'+" + value;
	                            dupArrayByAdd(textVariables[value], textnodeid);
	                            offset = index + match.length;
	                            text = str;
	                            return args.data[value];
	                        } else {
	                            return match;
	                        }
	                    })
	                    t = t + "+'" + text.substring(offset, text.length) + "'";
	                    var tt = new Function(matchs.join(","), "return " + t);
	                    textnodes[textnodeid]["func"] = tt;
	                    textnodes[textnodeid]["params"] = matchs;
	                    textnodeid++;
	                }
	            }
	        },
	        _click: function (element, value, args) {
	            //    解析字符串，获取函数名和方法参数，判断参数是变量还是字符串
	            var funcName = value.substr(0, value.indexOf("("));
	            var paramStr = value.substring(value.indexOf("(") + 1, value.length - 1);
	            var params = paramStr.split(",");
	            element.onclick = function (event) {
	                //不冒泡
	                if (event.stopPropagation) {
	                    event.stopPropagation();
	                } else {
	                    event.cancelBubble = true;
	                }
	                var p = [];
	                for (var j = 0, param; param = params[j++];) {
	                    //如果符合字符串，则去掉单引号后把该字符串push进数组，否则是变量
	                    //如果是字符
	                    if (param.indexOf("'") > -1) {
	                        p.push(param.substr(1, param.length - 2));
	                    }
	                    //数字
	                    else if (/^[0-9]*$/.test(param)) {
	                        p.push(parseInt(param));
	                    }
	                    else {
	                        p.push(args.data[param]);
	                    }
	                }
	                args[funcName].apply(args.data, p);
	            }
	        },
	        _class: function (element, express) {
	            //解析_class表达式  red:1+2==3 左边类，右边表达式
	            for (var j = 0, str; str = express[j++];) {
	                var _class = str.substr(0, str.indexOf(":"));
	                var exs = str.substring(str.indexOf(":") + 1);
	                //扫描表达式，查找args里的参数，并当做参数传入表达式
	                var ps = this.extractParam(exs);
	                if (ps.length > 0) {
	                    var pstr = ps.join(",");
	                    var func = new Function(pstr, "return " + exs);
	                    //初始化样式
	                    var params = [];
	                    for (var i = 0; i < ps.length; i++) {
	                        params.push(args.data[ps[i]]);
	                    }
	                    var result = func.apply(null, params);
	                    result ? addClass(element, _class) : removeClass(element, _class);
	                    //存入binding.classFuncs
	                    if (!classFuncs[pstr]) {
	                        classFuncs[pstr] = [];
	                    }
	                    classFuncs[pstr].push({
	                        _element: element,
	                        _class: _class,
	                        _func: func,
	                        _params: ps
	                    });
	                } else {
	                    //    无参数，可是你为什么要写一个无参数的表达式呢？(还真需要)
	                    //    在repeat标签的时候，class表达式的变量被确定，所以在这里是无参数
	                    var func = new Function("return " + exs);
	                    var result = func();
	                    result ? addClass(element, _class) : removeClass(element, _class);
	                }
	            }
	        },
	        //从表达式里抽取现有的参数
	        extractParam: function (express) {
	            var params = [];
	            for (var s in args.data) {
	                //获取非函数变量
	                if (args.data.hasOwnProperty(s) && !isFunction(args.data[s])) {
	                    //匹配一个变量
	                    var rgx = new RegExp("(^|\\W)(" + s + "(\\.\\w+)*(?!'))(\\W|$)", "g");
	                    if (rgx.test(express)) {
	                        params.push(s);
	                    }
	                }
	            }
	            return params;
	        },
	        //监听字符串，主要在处理{{文本}}
	        obserData: function (args) {
	            //监听双向等绑定文本
	            observe(args.data, function (name, newvalue, oldvalue) {
	                var tv = textVariables[name];
	                if (tv) {
	                    for (var i = tv.length - 1; i > -1; i--) {
	                        var textnode = textnodes[tv[i]];
	                        //如果是input类型
	                        if (textnode.type == "input") {
	                            //textnode.node.value = "";
	                            if (!inputing)
	                                textnode.node.value = args.data[textnode.variable];
	                        } else {
	                            var params = [];
	                            for (var j = 0; j < textnode.params.length; j++) {
	                                params.push(args.data[textnode.params[j]]);
	                            }
	                            textnode.node.data = textnode.func.apply(null, params);
	                        }
	                    }
	                    //    同时暴露该事件
	                    if (args["inputChanged"]) {
	                        args["inputChanged"].apply(args.data, [name, newvalue, oldvalue]);
	                    }
	                }
	            })
	            //    监听_class中变量的变化导致class的变化
	            observe(args.data, function (name, value, oldvale) {
	                if (classFuncs[name] && classFuncs[name].length > 0) {
	                    forEach(classFuncs[name], function (index, item, arr) {
	                        var params = [];
	                        for (var i = 0; i < item._params.length; i++) {
	                            params.push(args.data[item._params[i]]);
	                        }
	                        var result = item._func.apply(null, params);
	                        result ? addClass(item._element, item._class) : removeClass(item._element, item._class);
	                    })
	                }
	            })
	        },
	        _model: function (element, prop) {
	            var self = this;
	            //初始化input值
	            element.value = self.args.data[prop] || "";
	            //    监听输入时间
	            var regx = /( *)/g;
	            element.oninput = function (evt) {
	                inputing = true;
	                self.args.data[prop] = this.value;
	                inputing = false;
	            }
	            //    增加点击事件，用于阻止事件冒泡
	            element.onclick = function (event) {
	                if (event.stopPropagation) {
	                    event.stopPropagation();
	                } else {
	                    event.cancelBubble = true;
	                }
	            }
	
	            var nodeid = textnodeid++;
	            textnodes[nodeid] = {node: element, type: "input", variable: prop};
	            if (!textVariables[prop]) {
	                textVariables[prop] = [];
	            }
	            dupArrayByAdd(textVariables[prop], nodeid);
	        },
	        _change: function (element, d, args) {
	            var str = d.value;
	            var funcName = str.substr(0, str.indexOf("("));
	            var paramStr = str.substring(str.indexOf("(") + 1, str.length - 1);
	            var params = paramStr.split(",");
	            element.onchange = function (event) {
	                //不冒泡
	                if (event) {
	                    if (event.stopPropagation) {
	                        event.stopPropagation();
	                    } else {
	                        event.cancelBubble = true;
	                    }
	                }
	                var p = [];
	                for (var j = 0, param; param = params[j++];) {
	                    //如果符合字符串，则去掉单引号后把该字符串push进数组，否则是变量
	                    //如果是字符
	                    if (param.indexOf("'") > -1) {
	                        p.push(param.substr(1, param.length - 2));
	                    }
	                    //数字
	                    else if (/^[0-9]*$/.test(param)) {
	                        p.push(parseInt(param));
	                    }
	                    else {
	                        p.push(args.data[param]);
	                    }
	                }
	                if (args[funcName]) {
	                    args[funcName].apply(args.data, p);
	                }
	            }
	        },
	        _selected: function (element, value) {
	            //由于监听事件还未开始，所以这里设置不会反应到前台，所以需要实现一个
	            //等待事件触发队列，等待监听开始时去扫描等待序列并逐个触发它们，明天做
	            this.args.data.data = 2;
	            var self = this;
	            //初始化
	            self.args.data[value] = element.options[element.options.selectedIndex].value;
	            element.onchange = function () {
	                self.args.data[value] = this.options[this.options.selectedIndex].value;
	            }
	        },
	        _repeat: function (element, value, args) {
	            var iteration = value.substring(0, value.indexOf("in") - 1);
	            value = value.substring(value.indexOf("in") + 3);
	            var clone = element.cloneNode(true);
	            var parent = element.parentNode.cloneNode(true);
	            var target;
	            //因为要在dom外操作节点，所以需要找到clone父节点的repeat节点进行操作
	            for (var i = 0, len = parent.children.length; i < len; i++) {
	                if (hasAttribute(parent.children[i], "_repeat")) {
	                    target = parent.children[i];
	                    break;
	                }
	            }
	            clone.removeAttribute("_repeat");
	            //创建评论节点替代目标节点，这个节点的作用用于定位，好让循环出来的数据插入它之前
	            var start_comment = document.createComment("_repeat start");
	            var end_comment = document.createComment("_repeat end");
	            parent.replaceChild(end_comment, target);
	            parent.insertBefore(start_comment, end_comment);
	            var outer = clone.outerHTML;
	
	            function renderRepeat(element, parent, outer, arg, mark) {
	                var rgx = new RegExp("(^|\\W)(" + iteration + "(\\.\\w+)*(?!'))(\\W|$)", "g");
	                var _html = "";
	                for (var i = 0; i < arg.length; i++) {
	                    _html += outer.replace(rgx, function (val, item1, item2, item3, index, str) {
	                        var func = new Function(iteration, "return " + item2);
	                        return val.replace(new RegExp(item2, "g"), StringToAttrValue(func(arg[i])));
	                    }) + "\n";
	                }
	                var _element = innerHTMLToElement(_html);
	                if (_element.length) {
	                    for (var i = 0, len = _element.length; i < len; i++) {
	                        this.traversalAndMount(_element[0]);
	                        parent.insertBefore(_element[0], mark);
	                    }
	                }
	                element.parentNode.parentNode.replaceChild(parent, element.parentNode);
	            }
	
	            var self = this;
	            renderRepeat.call(self, element, parent, outer, args.data[value], end_comment);
	
	            //监听数组变化
	            observe(args.data[value], function (name, newval, oldval) {
	                var parent = element.parentNode.cloneNode(true);
	                //    找到被插入的标记，这里是一个comment 内容为 _repeat start
	                var end_comment;
	                for (var i = 0, len = parent.children.length; i < len; i++) {
	                    if (parent.children[i].nodeType === 8 && parent.children[i].nodeValue === "_repeat end") {
	                        end_comment = parent.children[i];
	                        break;
	                    }
	                }
	                renderRepeat.call(self, element, parent, outer, args.data[value], end_comment);
	            })
	        },
	        //用于binding之间的通信
	        callbind: function (name, funcname, params) {
	            if (funcname === "data") {
	                for (var s in params) {
	                    binding.binds[name].args.data[s] = params[s];
	                }
	            } else {
	                binding.binds[name].args[funcname].apply(binding.binds[name].args.data, params);
	            }
	        },
	        //    遍历节点并挂载方法
	        traversalAndMount: function (element) {
	            var alldoms = [];
	            alldoms.push(element);
	            //子节点
	            var d;
	            //非递归版的遍历方法
	            while (d = alldoms.shift()) {
	                this.mount(d, this.args);
	                //如果节点带repeat，则其子节点不去处理单独处理
	                if (hasAttribute(d, "_repeat"))
	                    continue
	                var length = d.children.length;
	                if (length > 0) {
	                    while (length--) {
	                        //如果这些元素以后用不上的话，没必要保存，遍历过后的元素直接置为null
	                        alldoms.push(d.children[length]);
	                    }
	                }
	            }
	        }
	    }
	    var _b = new _binding(args);
	    binding.binds[args.id] = _b;
	    return binding.binds[args.id];
	}
	//保存binding实例，用作在binding之间的通信
	binding.binds = {};
	//测试代码。用于获取内部的数据用于外部测试
	binding.test = {};
	
	function startWith(target, str, ignorCase) {
	    var start_str = target.substr(0, str.length);
	    return ignorCase ? start_str.toLowerCase() === str.toLowerCase() : start_str === str;
	}
	function isFunction(obj) {
	    return Object.prototype.toString.call(obj) == '[object Function]';
	}
	function forEach(obj, callback) {
	    for (var i = 0, d; d = obj[i++];) {
	        callback(i, d, obj);
	    }
	}
	function hasClass(obj, cls) {
	    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}
	function addClass(obj, cls) {
	    if (!hasClass(obj, cls)) {
	        obj.className == "" ? obj.className = cls : obj.className += " " + cls;
	    }
	}
	function removeClass(obj, cls) {
	    if (hasClass(obj, cls)) {
	        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
	        obj.className = obj.className.replace(reg, " ");
	        obj.className = obj.className.replace(/  /g, "");
	    }
	}
	//在添加进数组时进行去重
	function dupArrayByAdd(arr, value) {
	    for (var i = arr.length - 1; i > -1; i--) {
	        if (value == arr[i]) {
	            return
	        }
	    }
	    arr.push(value);
	}
	//判断该节点是否包含属性
	function hasAttribute(elelemet, attr) {
	    for (var i = 0; i < elelemet.attributes.length; i++) {
	        if (elelemet.attributes[i].name == attr)
	            return true;
	    }
	    return false;
	}
	//innerHTML转化为element,特例是innerHTML是一系列的li 返回的话应该是数组
	function innerHTMLToElement(html) {
	    var _element = document.createElement("div");
	    _element.innerHTML = html;
	    if (_element.children.length > 0)
	        return _element.children;
	    else
	        return _element.firstChild;
	}
	//字符串添加单引号，数字不管
	function StringToAttrValue(obj) {
	    if (typeof obj === "string")
	        return "'" + obj + "'";
	    else
	        return obj;
	}
	//遍历节点，挂载方法
	function mount(element, args, mount) {
	    var alldoms = [];
	    alldoms.push(element);
	    //子节点
	    var d;
	    //非递归版的遍历方法
	    while (d = alldoms.shift()) {
	        mount(d, args);
	        //如果节点带repeat，则其子节点不去处理单独处理
	        if (hasAttribute(d, "_repeat"))
	            continue
	        var length = d.children.length;
	        if (length > 0) {
	            while (length--) {
	                //如果这些元素以后用不上的话，没必要保存，遍历过后的元素直接置为null
	                alldoms.push(d.children[length]);
	            }
	        }
	    }
	}
	module.exports = binding;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/* observejs --- By dnt http://kmdjs.github.io/
	 * Github: https://github.com/kmdjs/observejs
	 * MIT Licensed.
	 */
	;
	(function (win) {
	    var observe = function (target, arr, callback) {
	        var _observe = function (target, arr, callback) {
	            if (!target.$observer) {
	                target.$observer = this;
	            }
	            var $observer = target.$observer;
	            var eventPropArr = [];
	            //监听数组操作方法
	            if (observe.isArray(target)) {
	                if (target.length === 0) {
	                    target.$observeProps = {};
	                    target.$observeProps.$observerPath = "#";
	                }
	                $observer.mock(target);
	            }
	            //监听对象属性变化
	            for (var prop in target) {
	                if (target.hasOwnProperty(prop)) {
	                    //支持只有两个参数
	                    if (callback) {
	                        if (observe.isArray(arr) && observe.isInArray(arr, prop)) {
	                            eventPropArr.push(prop);
	                            $observer.watch(target, prop);
	                        } else if (observe.isString(arr) && prop == arr) {
	                            eventPropArr.push(prop);
	                            $observer.watch(target, prop);
	                        }
	                    } else {
	                        eventPropArr.push(prop);
	                        $observer.watch(target, prop);
	                    }
	                }
	            }
	            $observer.target = target;
	            if (!$observer.propertyChangedHandler) {
	                $observer.propertyChangedHandler = [];
	            }
	            var propChanged = callback ? callback : arr;
	            $observer.propertyChangedHandler.push({
	                all: !callback,
	                propChanged: propChanged,
	                eventPropArr: eventPropArr
	            });
	        }
	        _observe.prototype = {
	            "onPropertyChanged": function (prop, value, oldValue, target, path) {
	                if (value !== oldValue && this.propertyChangedHandler) {
	                    var rootName = observe._getRootName(prop, path);
	                    for (var i = 0, len = this.propertyChangedHandler.length; i < len; i++) {
	                        var handler = this.propertyChangedHandler[i];
	                        if (handler.all || observe.isInArray(handler.eventPropArr, rootName) || rootName.indexOf("Array-") === 0) {
	                            handler.propChanged.call(this.target, prop, value, oldValue, path);
	                        }
	                    }
	                }
	                if (prop.indexOf("Array-") !== 0 && typeof value === "object") {
	                    this.watch(target, prop, target.$observeProps.$observerPath);
	                }
	            },
	            "mock": function (target) {
	                var self = this;
	                observe.methods.forEach(function (item) {
	                    target[item] = function () {
	                        var old = Array.prototype.slice.call(this, 0);
	                        var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
	                        if (new RegExp("\\b" + item + "\\b").test(observe.triggerStr)) {
	                            for (var cprop in this) {
	                                if (this.hasOwnProperty(cprop) && !observe.isFunction(this[cprop])) {
	                                    self.watch(this, cprop, this.$observeProps.$observerPath);
	                                }
	                            }
	                            //todo
	                            self.onPropertyChanged("Array-" + item, this, old, this, this.$observeProps.$observerPath);
	                        }
	                        return result;
	                    };
	                });
	            },
	            "watch": function (target, prop, path) {
	                if (prop === "$observeProps" || prop === "$observer") return;
	                if (observe.isFunction(target[prop])) return;
	                if (!target.$observeProps) target.$observeProps = {};
	                if (path !== undefined) {
	                    target.$observeProps.$observerPath = path;
	                } else {
	                    target.$observeProps.$observerPath = "#";
	                }
	                var self = this;
	                var currentValue = target.$observeProps[prop] = target[prop];
	                Object.defineProperty(target, prop, {
	                    get: function () {
	                        return this.$observeProps[prop];
	                    },
	                    set: function (value) {
	                        var old = this.$observeProps[prop];
	                        this.$observeProps[prop] = value;
	                        self.onPropertyChanged(prop, value, old, this, target.$observeProps.$observerPath);
	                    }
	                });
	                if (typeof currentValue == "object") {
	                    if (observe.isArray(currentValue)) {
	                        this.mock(currentValue);
	                        if (currentValue.length === 0) {
	                            if (!currentValue.$observeProps) currentValue.$observeProps = {};
	                            if (path !== undefined) {
	                                currentValue.$observeProps.$observerPath = path;
	                            } else {
	                                currentValue.$observeProps.$observerPath = "#";
	                            }
	                        }
	                    }
	                    for (var cprop in currentValue) {
	                        if (currentValue.hasOwnProperty(cprop)) {
	                            this.watch(currentValue, cprop, target.$observeProps.$observerPath + "-" + prop);
	                        }
	                    }
	                }
	            }
	        }
	        return new _observe(target, arr, callback)
	    }
	    observe.methods = ["concat", "every", "filter", "forEach", "indexOf", "join", "lastIndexOf", "map", "pop", "push", "reduce", "reduceRight", "reverse", "shift", "slice", "some", "sort", "splice", "unshift", "toLocaleString", "toString", "size"]
	    observe.triggerStr = ["concat", "pop", "push", "reverse", "shift", "sort", "splice", "unshift", "size"].join(",")
	    observe.isArray = function (obj) {
	        return Object.prototype.toString.call(obj) === '[object Array]';
	    }
	    observe.isString = function (obj) {
	        return typeof obj === "string";
	    }
	    observe.isInArray = function (arr, item) {
	        for (var i = arr.length; --i > -1;) {
	            if (item === arr[i]) return true;
	        }
	        return false;
	    }
	    observe.isFunction = function (obj) {
	        return Object.prototype.toString.call(obj) == '[object Function]';
	    }
	    observe.twoWay = function (objA, aProp, objB, bProp) {
	        if (typeof objA[aProp] === "object" && typeof objB[bProp] === "object") {
	            observe(objA, aProp, function (name, value) {
	                objB[bProp] = this[aProp];
	            })
	            observe(objB, bProp, function (name, value) {
	                objA[aProp] = this[bProp];
	            })
	        } else {
	            observe(objA, aProp, function (name, value) {
	                objB[bProp] = value;
	            })
	            observe(objB, bProp, function (name, value) {
	                objA[aProp] = value;
	            })
	        }
	    }
	    observe._getRootName = function (prop, path) {
	        if (path === "#") {
	            return prop;
	        }
	        return path.split("-")[1];
	    }
	
	    observe.add = function (obj, prop, value) {
	        obj[prop] = value;
	        var $observer = obj.$observer;
	        $observer.watch(obj, prop);
	    }
	    Array.prototype.size = function (length) {
	        this.length = length;
	    }
	
	    if (typeof module != 'undefined' && module.exports && this.module !== module) {
	        module.exports = observe
	    }
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (observe), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	    }
	    else {
	        win.observe = observe
	    }
	    ;
	})(Function('return this')());
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map