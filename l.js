/**
 * Created by swallow on 2017/5/24.
 */
var l = (function () {
    "use strict";
    //in this code .you should use structure function to create a new function object
    var Modal = function (value) {
        "use strict";
        this._value = typeof value === 'undefined' ? '' : value
        this._listeners = []
    }
    Modal.prototype.set = function (value) {
        "use strict";
        var self = this;
        self._value = value;
        //modal中的值改变时，通知注册过的回调函数
        //按照javascript事件处理的一般机制，我们异步的调用回调函数
        setTimeout(()=> {
            self._listeners.forEach((listener)=> {
                listener.call(self, value)
            })
        })
    }
    Modal.prototype.watch = function (listener) {
        "use strict";
        //注册监听的回调函数
        this._listeners.push(listener)
    }
    Modal.prototype.bind = function (node) {
        var self = this;
        this.watch(function (value) {
            if (node.tagName.toUpperCase() == "INPUT" && !self.inputEvent) {
                node.addEventListener("keyup", function () {
                    var _v = this.value;
                    if (_v != value) {
                        self.set(_v);
                    }
                    self.inputEvent = 1;
                })
                node.value = value;
            } else {
                node.innerHTML = value;
            }
        })
    }
//构建MVC的思路应该是获取到相对应的作用域
    function Controller(controllerName, callback) {
        "use strict";
        var models = {};
        //寻找相对应的控制器
        if (typeof controllerName === 'string') {
            //在页面上找到相对应的controller控制器
            var controller = document.querySelector("[lhy-controller=" + controllerName + "]"),
                $scope = {}, init = eval("(" + controller.getAttribute("init") + ")")
        } else {
            console.log('cannot found this controllerName,please check it again')
        }
        if (!controller) return;
        //将views处理为普通数组
        var views = Array.prototype.slice.call(controller.querySelectorAll('[bind]'), 0)
        views.forEach(function (view) {
            var modalName = view.getAttribute('bind');
            //取出或新建该元素所绑定的modal
            models[modalName] = models[modalName] || new Modal()
            //完成该元素和指定元素的绑定
            models[modalName].bind(view)
            $scope = createVisitors($scope, models[modalName], modalName)
        })
        for (var index in init) {
            $scope[index] = init[index];
        }
        callback.call(this, $scope);
    }

    function createVisitors($scope, model, property) {
        $scope.__defineSetter__(property, function (value) {
            model.set(value)
        })
        return $scope
    }

    return {
        controller: Controller
    }
})()

