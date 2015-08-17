/**
 * Created by li_xiaoliang on 2015/7/25.
 */

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
        args.data["callbind"] = this.callbind;
        var top = document.getElementById(args.id);
        //   遍历节点
        var alldoms = [];
        alldoms.push(top);
        //子节点
        var d;
        //非递归版的遍历方法
        while (d = alldoms.shift()) {
            this.mount(d, args);
            var length = d.children.length;
            if (length > 0) {
                while (length--) {
                    //如果这些元素以后用不上的话，没必要保存，遍历过后的元素直接置为null
                    alldoms.push(d.children[length]);
                }
            }
        }
        //    执行初始化操作init
        if (args.init) {
            args.init.apply(args.data);
        }
        //    监听所有data数据
        this.obserData(args);
    }

    _binding.prototype = {
        //挂载方法
        mount: function (element, args) {
            //查找文字节点，
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
                        if (!textVariables[value]) {
                            textVariables[value] = [];
                        }
                        if (args.data[value] != undefined) {
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
            for (var i = 0, d; d = element.attributes[i++];) {
                //找到特性属性，以_开头
                if (startWith(d.name, "_")) {
                    if (d.name === "_bind") {

                    }
                    if (d.name === "_click") {
                        this._click(element, d, args);
                    }
                    if (d.name == "_class") {
                        var express = d.value.split(",");
                        this._class(element, express);
                    }
                    if (d.name == "_model") {
                        this._model(element, d.value)
                    }
                    if (d.name == "_change") {
                        this._change(element, d.value);
                    }
                    //使用select元素时，这个值绑定选定的option值
                    if (d.name == "_selected") {
                        this._selected(element, d.value)
                    }
                }
            }
        },
        _click: function (element, d, args) {
            //    解析字符串，获取函数名和方法参数，判断参数是变量还是字符串
            var str = d.value;
            var funcName = str.substr(0, str.indexOf("("));
            var paramStr = str.substring(str.indexOf("(") + 1, str.length - 1);
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
                    else if (parseInt(param) != NaN) {
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
                    //    无参数，可是你为什么要写一个无参数的表达式呢？
                }
            }
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
        //从表达式里抽取现有的参数
        extractParam: function (express) {
            var params = [];

            for (var s in args.data) {
                //获取非函数变量
                if (args.data.hasOwnProperty(s) && !isFunction(args.data[s])) {
                    //匹配一个变量
                    var rstr = "(^|\\W)(" + s + "(?!'))(\\W|$)";
                    var rgx = new RegExp(rstr);
                    if (rgx.test(express)) {
                        params.push(s);
                    }
                }
            }
            return params;
        },
        //监听字符串，主要在处理{{文本}}
        obserData: function (args) {
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
        _change: function (element, value) {
            console.log(element.options);
            element.onchange = function () {
                //    TODO
            }
        },
        _selected: function (element, value) {
            //由于监听事件还未开始，所以这里设置不会反应到前台，所以需要实现一个
            //等待事件触发队列，等待监听开始时去扫描等待序列并逐个触发它们，明天做
            this.args.data.data=2;
            var self = this;
            //初始化
            self.args.data[value] = element.options[element.options.selectedIndex].value;
            element.onchange = function () {
                self.args.data[value] = this.options[this.options.selectedIndex].value;
            }
            console.log(this.args.data)
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
        console.log(data)
        this.sum *= data;
    }
})

binding({
    id: "example3",
    data: {
        data: "1"
    }
})

binding({
    id: "vm1",
    data: {
        a: 0,
        b: 1,
        c: 1,
        count: ""
    },
    init: function () {
        //this.count = "I AM VIEWMODEL";
    },
    addCount: function () {
        this.a++;
        this.b++;
        this.c++;
        //this.count = (new Date()).toLocaleString();
    },
    callbindTest: function (a) {
        this.a = a;
    }
})

binding({
    id: "vm2",
    data: {
        a: 0,
        b: 1,
        c: 1
    },
    callBind: function (a) {
        this.a++;
        this.b++;
        this.c++;
        this.callbind("vm1", "callbindTest", [3]);
    }
})

