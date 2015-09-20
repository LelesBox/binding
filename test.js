/**
 * Created by li_xiaoliang on 2015/8/18.
 */
var binding = require(".");
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
        items: [1, 2, 3]
    }
})