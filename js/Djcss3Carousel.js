;
(function(w, d) {
    "use strict";
    var transit = supportCss3('transition'),
        transf = supportCss3('transform'),
        isSupport = !!transit && !!transf;

    ;
    (function(w, d, afactory) {
        var factory = afactory(w, d);

        w.DJ = w.DJ || {};

        w.DJ.css3move = w.DJ.css3move || factory;
    })(w, d, function(w, d) {
        var Djcss3move = function(s) {
            this.elem = s.nodeType === 1 ? s : {};
            //唯一ID
            this.elem.uniqueId = this.elem.uniqueId || Math.random();
        }

        Djcss3move.prototype = {
            timers: {},
            isend: true,
            css3animate: function(s, speedType, speed, callBack) {
                if (Object.prototype.toString.call(s) !== '[object Object]' || !isSupport) return false;
                var pos = this.getXYZ(),
                    len = arguments.length,
                    _t = this,
                    ag1, ag2, ag3;
                for (var i = 1; i < len; i++) {
                    if (typeof(arguments[i]) === 'string') ag1 = arguments[i];
                    if (typeof(arguments[i]) === 'number') ag2 = arguments[i];
                    if (typeof(arguments[i]) === 'function') ag3 = arguments[i];
                }
                speedType = ag1 || 'ease-out';
                speed = ag2 / 1000 || .3;
                callBack = ag3 || false;
                s.x = this.fillPercent(s.x === undefined ? pos.x : s.x);
                s.y = this.fillPercent(s.y === undefined ? pos.y : s.y);
                s.z = this.fillPercent(s.z === undefined ? pos.z : s.z);

                if (this.targetTest(s, pos)) return false;

                this.isend = false;

                clearInterval(this.timers[this.elem.uniqueId]);
                // 设置过渡和属性
                this.elem.style[transit] = "all " + speed + 's ' + speedType;
                this.elem.style[transf] = 'translate3d(' + s.x + ',' + s.y + ',' + s.z + ')';
                // callBack回调，火狐下很诡异！setTimeout时间设置太接近speed的时候，有误差
                this.timers[this.elem.uniqueId] = setTimeout(function() {
                    _t.isend = true;
                    callBack && callBack.call(_t.elem, _t);
                }, speed * 1000 + 50);
            },
            fillPercent: function(n) {
                if (/%$/.test(n)) return n;
                return n + 'px';
            },
            targetTest: function(a, b) {
                var k = 0,
                    n = 0;
                for (var i in b) {
                    n++;
                    if (a[i] === b[i]) k++;
                }
                return k === n;
            },
            getXYZ: function() {
                var at = this.getStyle(this.elem, transf).split(','),
                    len = at.length,
                    // z轴变换值是0时，除了多数浏览器获取到的是2d值
                    ism3d = len === 6 ? false : true;
                return {
                    x: len === 1 ? 0 : ism3d ? +at[12] : +at[4],
                    y: len === 1 ? 0 : ism3d ? +at[13] : +at[5].replace(/\)/g, ''),
                    z: len === 1 ? 0 : ism3d ? +at[14] : 0
                };
            },
            getStyle: function(obj, attr) {
                return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
            }
        };

        //对外接口
        return function(el) {
            return new Djcss3move(el);
        };
    });

    ;
    (function(w, d, factory) {
        var fn = factory(w, d);

        w.DJ = w.DJ || {};

        w.DJ.Carousel = w.DJ.Carousel || fn;
    })(w, d, function(w, d) {

        var Djcarousel = function(s) {
            this.s = s;
            this.elem = s.element.nodeType === 1 ? s.element : {};
            this.children = this.elem.children;
            // 使用css3过渡或者兼容的movejs
            this.amtElem = isSupport ? DJ.css3move(this.elem) : DJ.move(this.elem);
            // 上一个兄弟节点
            this.prev = this.elem.parentNode.children[0];
            this.len = this.children.length;
            // 底部容器
            this.btwrap = this.elem.parentNode.children[2];
            this.btns = this.btwrap.children;
            // 左右按钮
            this.lrwrap = this.elem.parentNode.children[3];
            this.lrs = this.lrwrap.children;
            // 定时器
            this.timer = null;
        }

        Djcarousel.prototype = {
            init: function() {
                var _t = this,
                    resizetimer = null;
                // 轮播图宽度
                this.w = this.elem.offsetWidth;
                // 初始显示位置
                this.nowIndex = 1;
                this.isstop = false;
                this.s.openBtn = !!this.s.openBtn || false;
                this.s.openlrBtn = !!this.s.openlrBtn || false;
                this.s.duration = !isNaN(this.s.duration) ? this.s.duration : 300;
                this.s.overShowlr = !!this.s.overShowlr || false;
                this.s.overStop = !!this.s.overStop || false;
                this.s.autoPlayTime = !isNaN(this.s.autoPlayTime) ? this.s.autoPlayTime : 4000;
                this.s.callBack = typeof(this.s.callBack) === 'function' ? this.s.callBack : !1;
                // 添加底部按钮
                if (this.s.openBtn) this.addBtns();
                // 复制头和尾
                this.cphl();
                // 定位
                this.setPos();
                // 初始加载第一张和最后一张
                this.show(this.children[1]);
                this.show(this.children[0]);
                this.show(this.children[this.len - 2]);
                this.show(this.children[this.len - 1]);
                // 底部按钮
                this.s.openBtn && this.addEvent(this.btwrap, 'click', function(e) {
                    _t.btnsClick(e);
                });
                // 左右按钮
                this.s.openlrBtn && this.addEvent(this.lrwrap, 'click', function(e) {
                    _t.lrClick(e);
                });
                // mouse over/out
                if (this.s.overShowlr || this.s.overStop) {
                    this.addEvent(this.elem.parentNode, 'mouseover', function(ev) {
                        var e = ev || window.event;
                        if (contains(e, this)) {
                            if (_t.s.openlrBtn && _t.s.overShowlr) _t.lrwrap.style.display = 'block';
                            if (_t.s.overStop) {
                                clearInterval(_t.timer);
                                _t.isstop = true;
                            }
                        }
                    })
                    this.addEvent(this.elem.parentNode, 'mouseout', function(ev) {
                        var e = ev || window.event;
                        if (contains(e, this)) {
                            if (_t.s.openlrBtn && _t.s.overShowlr) _t.lrwrap.style.display = 'none';
                            if (_t.s.overStop) {
                                _t.autoPlay();
                                _t.isstop = false;
                            }
                        }
                    })
                }
                // 不支持css3的窗口resize的时候重新获取宽度值
                !isSupport && this.addEvent(w, 'resize', function() {
                    if (_t.w === _t.elem.offsetWidth) return false;
                    clearInterval(_t.timer);
                    clearInterval(resizetimer);
                    _t.isstop = true;
                    _t.w = _t.elem.offsetWidth;
                    _t.elem.style.left = -_t.w * _t.nowIndex + 'px';
                    resizetimer = setTimeout(function() {
                        _t.autoPlay();
                        _t.isstop = false;
                    }, 300);
                });
                this.autoPlay();
                return this;
            },
            autoPlay: function() {
                var _t = this;
                clearInterval(this.timer);
                this.timer = setTimeout(function() {
                    _t.carouselGo(1);
                }, this.s.autoPlayTime);
            },
            // 左右按钮
            lrClick: function(ev) {
                var e = ev || window.event,
                    target = e.target || e.srcElement,
                    dir;
                if (target.nodeName.toLowerCase() === 'span') {
                    dir = target.getAttribute('data-dir');
                    clearInterval(this.timer);
                    this.carouselGo(dir);
                }
            },
            carouselGo: function(dir) {
                var _t = this,
                    ww = this.elem.offsetWidth,
                    nowposx = isSupport ? this.amtElem.getXYZ().x : parseInt(getStyle(this.elem, 'left'));
                this.oldIndex = this.nowIndex;
                this.removeClass(this.btns[this.getIndex()], 'carouselactive');
                this.nowIndex += +dir;
                // 无缝处理
                this.nowIndex = this.nowIndex >= this.len ? this.len - 1 : this.nowIndex < 0 ? 0 : this.nowIndex;
                // nowposx可能是小数，存在误差，我测试都小于2
                if (nowposx < -(this.len - 2) * ww && Math.abs((nowposx + (this.len - 2) * ww)) > 2 && dir == '1') {
                    this.setScrollPos(isSupport ? (nowposx / ww + this.len - 2) * 100 + '%' : nowposx + (this.len - 2) * ww);
                    this.nowIndex = this.getIndex() + 2;
                } else if (nowposx > -ww && dir === '-1') {
                    this.setScrollPos(isSupport ? (nowposx / ww + 2 - this.len) * 100 + '%' : nowposx + (2 - this.len) * ww);
                    this.nowIndex = this.getIndex();
                }
                isSupport ? this.amtElem.css3animate({ "x": -this.nowIndex + '00%' }, this.s.duration, function() {
                    !_t.isstop && _t.autoPlay();
                    _t.s.callBack && _t.s.callBack.call(_t.elem, _t.getIndex(), _t.nowIndex, _t.oldIndex);
                }) : this.amtElem.animate({ "left": -this.nowIndex * ww }, 'easeOut', this.s.duration, function() {
                    !_t.isstop && _t.autoPlay();
                    _t.s.callBack && _t.s.callBack.call(_t.elem, _t.getIndex(), _t.nowIndex, _t.oldIndex);
                });
                this.show(this.children[this.nowIndex]);
                this.addClass(this.btns[this.getIndex()], 'carouselactive')
            },
            //底部按钮
            btnsClick: function(ev) {
                var e = ev || window.event,
                    _t = this,
                    target = e.target || e.srcElement,
                    index;
                if (target.nodeName.toLowerCase() === 'span') {
                    index = +target.innerHTML;
                    if (index === this.getIndex()) return false;
                    this.oldIndex = this.nowIndex;
                    this.addClass(target, 'carouselactive').removeClass(this.btns[this.getIndex()], 'carouselactive');
                    this.nowIndex = index + 1;
                    isSupport ? this.amtElem.css3animate({ "x": -this.nowIndex + '00%' }, this.s.duration, function() {
                        _t.s.callBack && _t.s.callBack.call(_t.elem, _t.getIndex(), _t.nowIndex, _t.oldIndex);
                    }) : this.amtElem.animate({ "left": -this.nowIndex * this.w }, 'easeOut', this.s.duration, function() {
                        _t.s.callBack && _t.s.callBack.call(_t.elem, _t.getIndex(), _t.nowIndex, _t.oldIndex);
                    });
                    this.show(this.children[this.nowIndex]);
                }
            },
            // 定位轮播元素
            setPos: function() {
                for (var i = 0; i < this.len; i++) this.children[i].style.left = i + '00%';
                if (isSupport) this.elem.style[transf] = 'translate3d(-100%,0,0)';
                else this.elem.style.left = -this.w + 'px';
                this.btns[0].className = 'carouselactive';
            },
            setScrollPos: function(x) {
                if (isSupport) {
                    this.elem.style[transit] = 'none';
                    this.elem.style[transf] = 'translate3d(' + x + ',0,0)';
                } else this.elem.style.left = x + 'px';
            },
            // 添加底部按钮
            addBtns: function() {
                var str = '';
                for (var i = 0; i < this.len; i++) str += '<span>' + i + '</span>';
                this.btwrap.innerHTML = str;
            },
            // 复制头和尾
            cphl: function() {
                var lt = this.children[this.len - 1].cloneNode(true),
                    hd = this.children[0].cloneNode(true);
                this.elem.insertBefore(lt, this.children[0]);
                this.elem.appendChild(hd);
                this.len = this.children.length;
            },
            // 减少加载，不滚到对应位置不加载图片
            show: function(obj) {
                var sn = obj.getAttribute('data-showed'),
                    oC, img, src;
                // 有设置过图片return
                if (sn === '1') return false;
                oC = obj.children[0].children[0];
                src = oC.getAttribute('data-src');
                img = new Image();
                img.onload = function() {
                    obj.setAttribute('data-showed', 1);
                    oC.src = src;
                }
                img.src = src;
            },
            addEvent: function(o, type, fn) {
                if (o.addEventListener) o.addEventListener(type, fn, false);
                else o.attachEvent('on' + type, fn);
            },
            hasClass: function(o, cl) {
                return o.className.match(new RegExp('(\\s+|^)' + cl + '(\\s+|$)'));
            },
            addClass: function(o, cl) {
                if (!this.hasClass(o, cl))
                    o.className = o.className === '' ? cl : o.className + ' ' + cl;
                return this;
            },
            removeClass: function(o, cl) {
                if (this.hasClass(o, cl))
                    o.className = o.className.replace(new RegExp('(\\s+|^)' + cl + '(\\s+|$)'), ' ').replace(/^\s|\s$/g, '');
                return this;
            },
            getIndex: function() {
                return this.nowIndex - 1 < 0 ? this.len - 3 : this.nowIndex - 1 > this.len - 3 ? 0 : this.nowIndex - 1;
            }
        };

        return function(s) {
            return new Djcarousel(s).init();
        }
    });

    function getStyle(obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
    }
    // 属性检测，返回当前版本支持的属性，加前缀并转驼峰
    function supportCss3(style) {
        var prefix = ['webkit', 'Moz', 'o', 'ms'],
            i,
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

    // JQ真强大，度娘上给答案又不正确又copy的人真JB多啊，IE9以下就不支持contains
    // 处理mouseover、mouseout多次触发
    function contains(e, a) {
        var docElem = d.documentElement,
            rnative = /^[^{]+\{\s*\[native \w/,
            related = e.relatedTarget,
            result = rnative.test(docElem.contains) || docElem.compareDocumentPosition ?
            function(a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a,
                    bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (
                    adown.contains ?
                    adown.contains(bup) :
                    a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                ));
            } :
            function(a, b) {
                if (b) {
                    while ((b = b.parentNode)) {
                        if (b === a) {
                            return true;
                        }
                    }
                }
                return false;
            };
        return !related || (related !== this && !result(a, related));
    }
})(this, document);
