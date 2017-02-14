# djcss3carousel
* css3高性能PC端自适应轮播图，兼容古老浏览器
* 原则：尽量减少DOM操作，比如自适应，什么宽度高度交给浏览器去做嘛，为什么要用js去操控它们呢？容器内的第一个img标签是必要的，需要放一个初始显示的loading图片，比如加载中gif图，宽高比例和轮播图片一样就行

### 调用方法
```
var oD = document.getElementById('djcarousel');
DJ.Carousel({
	element:oD,
	// 是否开启底部按钮
	openBtn:true,
	// 是否开启左右按钮
	openlrBtn:true,
	// 移入显示左右按钮，需要开启左右按钮，设置请用css先隐藏
	overShowlr:true,
	// 移入暂停轮播
	overStop:true,
	// 动画过渡时间
	duration:400,
	// 自动播放间隔时间
	autoPlayTime:5000,
	// 回调
	callBack:function(i, nowindex, oldindex) {
		// console.log(i, nowindex, oldindex);
		// i，真实索引
		// nowindex，包含所有节点的当前显示的索引
		// oldindex，包含所有节点的上一个显示的索引
	}
});
```
