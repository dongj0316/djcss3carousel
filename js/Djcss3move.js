;
(function(w, d, afactory) {
    var factory = afactory(w, d);

    w.DJ = w.DJ || {};

    w.DJ.css3move = w.DJ.css3move || factory;

})(this, document, function(w, d) {
    "use strict";
    var transit = supportCss3('transition'),
        transf = supportCss3('transform'),
        isSupport = !!transit && !!transf;

    var Djcss3move = function(s) {
        this.elem = s.nodeType === 1 ? s : {};
        //唯一ID
        this.elem.uniqueId = this.elem.uniqueId || Math.random();
    }

    Djcss3move.prototype = {
        timers:{},
        isend:true,
        css3animate:function(s, speedType, speed, callBack) {
            if(Object.prototype.toString.call(s) !== '[object Object]' || !isSupport) return false;
            var pos = this.getXYZ(),
                len = arguments.length,
                _t = this,
                ag1,ag2,ag3;
            for(var i=1;i<len;i++) {
                if(typeof(arguments[i]) === 'string') ag1 = arguments[i];
                if(typeof(arguments[i]) === 'number') ag2 = arguments[i];
                if(typeof(arguments[i]) === 'function') ag3 = arguments[i];
            }
            speedType = ag1 || 'ease-out';
            speed = ag2/1000 || .3;
            callBack = ag3 || false;
            s.x = this.fillPercent(s.x === undefined ? pos.x : s.x);
            s.y = this.fillPercent(s.y === undefined ? pos.y : s.y);
            s.z = this.fillPercent(s.z === undefined ? pos.z : s.z);

            if(this.targetTest(s, pos)) return false;

            this.isend = false;

            clearInterval(this.timers[this.elem.uniqueId]);
            // 设置过渡和属性
            this.elem.style[transit] = "all " + speed + 's ' + speedType;
            this.elem.style[transf] = 'translate3d('+ s.x +','+ s.y +','+ s.z +')';
            // callBack回调，火狐下很诡异！setTimeout时间设置太接近speed的时候，有误差
            this.timers[this.elem.uniqueId] = setTimeout(function(){
                _t.isend = true;
                callBack && callBack.call(_t.elem, _t);
            },speed*1000 + 50);
        },
        fillPercent:function(n) {
            if(/%$/.test(n)) return n;
            return n + 'px';
        },
        targetTest:function(a, b) {
            var k = 0,n = 0;
            for(var i in b) {
                n++;
                if(a[i] === b[i]) k++;
            }
            return k === n;
        },
        getXYZ:function() {
            var at = this.getStyle(this.elem, transf).split(','),
                len = at.length,
                // z轴变换值是0时，除了多数浏览器获取到的是2d值
                ism3d = len === 6 ? false : true;
            return {
                x:len === 1 ? 0 : ism3d ? +at[12] : +at[4],
                y:len === 1 ? 0 : ism3d ? +at[13] : +at[5].replace(/\)/g,''),
                z:len === 1 ? 0 : ism3d ? +at[14] : 0
            };
        },
        getStyle:function(obj, attr) {
            return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
        }
    };

    //对外接口
    return function(el) {
        return new Djcss3move(el);
    };
});

function supportCss3(style) {
    var prefix = ['webkit', 'Moz', 'o', 'ms'],i,
        humpString = [],
        htmlStyle = document.documentElement.style,
        _toHumb = function(string) {
            return string.replace(/-(\w)/g, function($0, $1) {
                return $1.toUpperCase();
            });
        };
    humpString.push(_toHumb(style));
    for (i in prefix)
        humpString.push(_toHumb(prefix[i] + '-' + style));
    for (i in humpString)
        if (humpString[i] in htmlStyle) return humpString[i];
    return false;
}