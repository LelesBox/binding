/**
 * Created by li_xiaoliang on 2015/7/25.
 */

var binding = function (args) {

    var _binding = function (args) {
        this.args = args;
        args.data["callbind"] = this.callbind;
        console.log(args.data);
        var top = document.getElementById(args.id);
        //   遍历节点
        var alldoms = [];
        alldoms.push(top);
        //子节点
        var d;
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
    }

    _binding.prototype = {
        mount: function (element, args) {
            for (var i = 0, d; d = element.attributes[i++];) {
                //查找文字节点，
                for (var j = 0, node; node = element.childNodes[j++];) {
                    if (node.nodeType === 3 && node.data.trim() !== "") {
                        var matchs = [];
                        node.data = node.data.replace(/{{(.*?)}}/g, function (match, value, index, str) {
                            //保存可以动态更新的变量
                            matchs.push(value);
                            //判断当前的args.data[value]是否为"",这种情况要单独做处理
                            var s = str.substr(index, match.length);
                            console.log(s)
                            if (args.data[value] == "") {
                                if (!binding.textVariables[value])
                                    binding.textVariables[value] = [];
                                //    保存
                                binding.textVariables[value].push({
                                    node: node,
                                    index: index
                                })
                            }
                            console.log(arguments)
                            return args.data[value];
                        })
                        if (matchs.length > 0) {
                            this.obserStr(node, matchs, args);
                        }
                    }
                }
                if (startWith(d.name, "_")) {
                    if (d.name === "_bind") {
                        //初始化
                        element.innerText = args.data[d.value];
                        //监听data属性变化
                        observe(args.data, [d.value], function (name, value, oldvalue) {
                            element.innerText = value;
                        })
                    }
                    if (d.name === "_click") {
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
                            //    遍历，如果带‘’则认为是字符串，如果没有则认为是变量
                            var p = [];
                            for (var j = 0, param; param = params[j++];) {
                                //如果符合字符串，则去掉单引号后把该字符串push进数组，否则是变量
                                if (param.indexOf("'") > -1) {
                                    p.push(param.substr(1, param.length - 2));
                                } else {
                                    p.push(args.data[param]);
                                }
                            }
                            args[funcName].apply(args.data, p);
                        }
                    }
                    if (d.name == "_class") {
                        var express = d.value.split(",");
                        this._class(element, express);
                    }
                    if (d.name == "_model") {
                        this._model(element, d.value)
                    }
                }
            }
        },
        _class: function (element, express) {
            //匹配一个变量
            for (var j = 0, str; str = express[j++];) {
                var _class = str.substr(0, str.indexOf(":"));
                var exs = str.substring(str.indexOf(":") + 1);
                //扫描表达式，查找args里的参数，并当做参数传入表达式
                var ps = this.extractParam(exs);
                if (ps.length > 0) {
                    var pstr = ps.join(",");
                    var func = new Function(pstr, "return " + exs);
                    var aps = [];
                    for (var k = 0, m; m = ps[k++];) {
                        aps.push(args.data[m]);
                    }
                    var result = func.apply(null, aps);
                    console.log(result);
                    //存入binding.classFuncs
                    if (!binding.classFuncs[pstr]) {
                        binding.classFuncs[pstr] = [];
                    }
                    binding.classFuncs[pstr].push({_class: _class, _func: func});
                    //    监控参数
                    observe(args.data, ps, function (name, value, oldvale) {
                        var pt = ps.join(",");
                        var aps = [];
                        for (var k = 0, m; m = ps[k++];) {
                            aps.push(args.data[m]);
                        }
                        forEach(binding.classFuncs[pt], function (index, item, arr) {
                            console.log(item)
                            var result = item._func.apply(null, aps);
                            console.log("class 要改变啦" + result)
                            console.log(element.className="asd")
                        })
                    })
                } else {
                    //    无参数，可是你为什么要写一个无参数的表达式呢，JJ酸

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
        obserStr: function (node, matchs, args) {
            observe(args.data, matchs, function (name, newvalue, oldvalue) {
                //判断改变之前的值oldvalue是否是"",如果是则替换位置,使用过后删除它，防止下次再为“”时，push数据出现重复
                if (oldvalue == "") {
                    for (var i = 0, d; d = binding.textVariables[name][i++];) {
                        d.node.data = d.node.data.slice(0, d.index) + newvalue + d.node.data.slice(d.index, d.node.data.length);
                    }
                    delete binding.textVariables[name];
                } else {
                    node.data = node.data.replace(new RegExp(oldvalue, "g"), function (match, index, str) {
                        if (newvalue == "") {
                            if (!binding.textVariables[name])
                                binding.textVariables[name] = [];
                            //    保存
                            binding.textVariables[name].push({
                                node: node,
                                index: index
                            })
                        }
                        return newvalue;
                    })
                }
            })
        },
        _model: function (element, prop) {
            var self = this;
            //初始化input值
            element.value = self.args.data[prop] || "";
            //    监听输入时间
            element.oninput = function (evt) {
                self.args.data[prop] = this.value;
                console.log(this.value + "  " + prop);
            }
            //    增加点击事件，用于阻止事件冒泡
            element.onclick = function (event) {
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            }
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
binding.binds = {};
binding.classFuncs = {};
//解决疑难杂症的最简单暴力方法是在多放一个观察对象。
//这里保存的文本变量所在文本的位置，以方便动态更新是可以替换，为什么使用这种方式，因为单纯的替换以前的字符
//会造成一种情况那就是当以前字符是空字符串时("")，替换就会有问题，所以正则替换这种方法不可行，所以只能再开启一个
//上帝模式，用于保存状态，当有更新时对比保存的状态和现在的状态去更新数据
binding.textVariables = {};

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
function addClass(element,classname){

}
function removeClass(element,classname){

}



var test = binding({
    id: "test",
    data: {
        y: "路人甲",
        pa: 2,
        count: 123
    },
    changeColor: function (y) {
        this.count++;
        console.log("changeColor" + y);
    },
    //使用bind把上下文文传递过去
    aClick: function (x) {
        this.count = this.count + 2;
        console.log("aClick" + x);
        //注入id为test1的实例，调用change方法，传入[]参数
        this.callbind("test1", "change", ["I am LeeBox Do You HEAR ME?"]);
    }
})


var test1 = binding({
    id: "test1",
    data: {
        kaka: ""
    },
    change: function (y) {
        this.kaka++;
        console.log(y);
    },
    //使用bind把上下文文传递过去
    bClick: function (x) {
        //this.kaka++;
        this.callbind("test", "aClick", [this.kaka++]);
        //this.callbind("test", "data", {count: this.kaka++});
    },
    init: function () {
        //this.kaka = 10086;
    }
})