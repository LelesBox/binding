/**
 * Created by li_xiaoliang on 2015/7/25.
 */

var binding = function (args) {

    var _binding = function (args) {
        this.args = args;

        if (args.inject) {
            //_binding.bind(args.inject);
        }
        console.log(this);
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
    }
    _binding.prototype = {
        mount: function (element, args) {
            var self = this;
            for (var i = 0, d; d = element.attributes[i++];) {
                //查找文字节点，
                var regx = /{{(.*?)}}/g;
                for (var j = 0, node; node = element.childNodes[j++];) {
                    if (node.nodeType === 3 && node.data.trim() !== "") {
                        var matchs = [];
                        node.data = node.data.replace(/{{(.*?)}}/g, function (match, value, index, str) {
                            matchs.push(value);
                            return args.data[value];
                        })
                        if (matchs.length > 0) {
                            self.obserStr(node, matchs, args);
                        }
                    }
                }

                if (startWith(d.name, "_")) {
                    if (d.name === "_bind") {
                        //初始化
                        element.innerText = args.data[d.value];
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
                }
            }
        },
        obserStr: function obserStr(node, matchs, args) {
            observe(args.data, matchs, function (name, value, oldvalue) {
                node.data = node.data.replace(new RegExp(oldvalue, "g"), function (match, value, index, str) {
                    return args.data[name];
                })
            })
        },
        on: function (funcname, params) {
            //var self = this;
            if (funcname === "data") {
                for (var s in params) {
                    this.args.data[s] = params[s];
                }
            } else {
                this.args[funcname].apply(this.args.data, params);
            }
        },
        binds: function () {

        }
    }
    var _b = new _binding(args);
    binding.binds.push({id: args.id, context: _b});
    return _b;
}
binding.binds = [];

function startWith(target, str, ignorCase) {
    var start_str = target.substr(0, str.length);
    return ignorCase ? start_str.toLowerCase() === str.toLowerCase() : start_str === str;
}


var test = binding({
    id: "test",
    data: {
        y: "路人甲",
        pa: 2,
        count: 123,
    },
    changeColor: function (y) {
        this.count += y;
        console.log("changeColor" + y);
    },
    //使用bind把上下文文传递过去
    aClick: function (x) {
        this.count = this.count + 2;
        console.log("aClick" + x);
    }
})


var test1 = binding({
    id: "test1",
    data: {
        kaka: 1,
        test: test
    },
    change: function (y) {
        this.kaka++;
        console.log(y);
    },
    //使用bind把上下文文传递过去
    bClick: function (x) {
        this.test.on("aClick", [this.kaka++]);
        this.test.on("data", {count: this.kaka++});
    },
    init: function () {

    }
})

//console.log(s.keys)
//s[0] = 5;
//console.log("2"+=2)