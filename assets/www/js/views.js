var Header = Backbone.View.extend({

	initialize: function() {
		
		this.el = $('#header');
		_.bindAll(this, "home", "reload", "_home", "_post");
		$("#title", this.el).tap(this.home);	
		$("#reload", this.el).tap(this.reload);
		$("#home", this.el).tap(this.home);	

		this.bind('home', this._home);
		this.bind('post', this._post);
	},

	_home: function() {
		$('#reload', this.el).show();
		$('#home', this.el).hide();
	},

	_post: function() {
		$('#reload', this.el).hide();
		$('#home', this.el).show();
	},

	home: function() {
		
		location.href = "#";
	},

	reload: function() {
		
		this.trigger('reload');
	}
});

var Zoom = Backbone.View.extend({

	initialize: function() {
		_.bindAll(this, "zoomOut", "zoom");
		this.el = $('#header #zoom');

		$(this.el).tap(this.zoom);
		// $('#plus', this.el).tap(this.zoomIn);
		// $("#minus", this.el).tap(this.zoomOut);
	},

	zoomOut: function(message) {

		var zoom = new HashMap('zoom');
		var value = zoom.get("current");

		if(value && value > 1) {
			zoom.put("old", value);
			zoom.put("current", --value);
		}

		this.trigger("zoomChanged", value);
	},

	zoom: function() {
		
		var zoom = new HashMap('zoom');
		var value = zoom.get("current");
		zoom.put("old", value);

		if(!value) {
			zoom.put("current", 2);
		} else if(value < 4) {
			zoom.put("current", ++value);
		} else {
			zoom.put("current", 1);
		}

		this.trigger("zoomChanged", value);
	}
});

var Notice = Backbone.View.extend({

	initialize: function() {
		this.el = $('#notice');
	},

	show: function(message) {

		$("#message", this.el).html(akuru.convert(message || ""));
		$(this.el).show();
	},

	hide: function() {
		$("#message", this.el).html("");
		$(this.el).hide();
	}
});

var TitleView = Backbone.View.extend({
	
	initialize: function() {
		
		_.bindAll(this, "getDateString", "select", "zoom");
		this.el = $($('#templateItems #title').html());
		this.el.tap(this.select);

		this.zoom();
	},

	render: function() {

		$(this.el).attr('id', this.model.get('id'));
		
		try{
			$("#name", this.el).html(akuru.convert(this.model.get('name')));
			$("#blog", this.el).html(akuru.convert(this.model.get('blogName')));
		} catch(ex) {
			console.error('error when akuru converting title: ' +  JSON.stringify(this.model.toJSON()));
			throw ex;
		}

		$("#date", this.el).html(this.getDateString(this.model.get('timestamp')));

		return this;
	},

	getDateString: function(timestamp) {
		
		var d = new Date();
		d.setTime(timestamp);

		return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
	},

	select: function() {
		window.location.href = '#post/' + this.model.get('id');
	},

	zoom: function() {
		var zoom = new HashMap('zoom');
		var value = zoom.get("current");
		var old = zoom.get("old");

		$(this.el).removeClass("x4");
		$(this.el).removeClass("x3");
		$(this.el).removeClass("x2");
		$(this.el).removeClass("x1");

		if(value) {
			//has a zoom value saved use it
			$(this.el).addClass("x" + value);
		} else {
			 //otherwise use the default of x1
			$(this.el).addClass('x2');
		}
	}
});

var TitleListView = Backbone.View.extend({

	initialize: function(footer) {

		_.bindAll(this, 'onRate', 'onShare');
		this.menu = new HomeMenu;

		this.menu.bind('rate', this.onRate);
		this.menu.bind('share', this.onShare);
		this.footer = footer;
		_.bindAll(this, 'clear', 'onLoadMore');
		this.el = $('#content #titles');
		this.clear();

		$('#loadMore', this.el).tap(this.onLoadMore);
	},

	prepend: function(titleModel) {
		
		try{
			var titleView = new TitleView({model: titleModel});
			$("#content", this.el).prepend(titleView.render().el);
		} catch(ex) {}
	},

	append: function(titleModel) {
	
		try {
			var titleView = new TitleView({model: titleModel});
			$("#content", this.el).append(titleView.render().el);
		} catch(ex) {}
	},

	show: function() {
		console.log(this.menu);
		this.footer.render(this.menu);
		$(this.el).show();
	},

	hide: function() {
		$(this.el).hide();
	},

	clear: function() {
		$("#content", this.el).html("");
	},

	onLoadMore: function() {
		this.trigger('more');
	},

	onShare: function() {
		
		window.plugins.share.show({
		    subject: "Blog Rala - Sinhala Blog Reader",
		    text: 'Wow! Great Sinhala Blog Reader. Blog Rala - http://goo.gl/oIcha'},
		    function() {}, // Success function
		    function() {alert('Share failed')} // Failure function
		);
	},

	onRate: function() {
		
		window.plugins.webintent.startActivity({
			action: WebIntent.ACTION_VIEW,
			url: 'http://goo.gl/oIcha'}, 
			function() {}, 
			function() {alert('Failed to open URL via Android Intent')}
		);
	},

	zoom: function() {
		
		var zoom = new HashMap('zoom');
		var value = zoom.get("current");
		var old = zoom.get("old");

		$("#content .title", this.el).removeClass("x4");
		$("#content .title", this.el).removeClass("x3");
		$("#content .title", this.el).removeClass("x2");
		$("#content .title", this.el).removeClass("x1");

		if(value) {
			//has a zoom value saved, apply it for existing added titles
			$("#content .title", this.el).addClass("x" + value);
		} else {
			$("#content .title", this.el).addClass("x2");
		}
	}
});

var PostView = Backbone.View.extend({
	

	initialize: function(footer) {

		var self = this;

		
		_.bindAll(this, "getDateString", "clear", "onOlder", "onNewer", "onShare", "onView", "zoom");
		this.el = $($('#templateItems #post').html());
		$('#content #post').html(this.el);

		$(this.el).swipeRight(this.onNewer);
		$(this.el).swipeLeft(this.onOlder);			

		this.footer = footer;
		this.menu = new PostViewMenu();
		this.menu.bind('older', this.onOlder);
		this.menu.bind('newer', this.onNewer);
		this.menu.bind('share', this.onShare);
		this.menu.bind('view', this.onView);

		this.zoom();
	},

	setTitle: function(model) {

		this.clear();

		//set the current title
		this.title = model;

		$(this.el).attr('id', model.get('id'));
		
		try{
			$("#name", this.el).html(akuru.convert(model.get('name')));
			$("#blog", this.el).html(akuru.convert(model.get('blogName')));	
		} catch(ex) {
			console.error('error when akuru converting title: ' +  JSON.stringify(this.model.toJSON()));
		}

		$("#date", this.el).html(this.getDateString(model.get('timestamp')));

		$("#pagination", this.el).hide();
	},

	/**
		Content has been converted earlier in the model for akuru
	*/
	setContent: function(content) {
		
		this.content = content;

		$("#text", this.el).html(content.get('text'));
		
		//set the text size as same
		//$("#text .akuru-converted", this.el).css('font-size', '22px');
		
		//set the image size displayed in the screen
		//use lazy fix as timeout :)
		setTimeout(function() {
			
			$("#text img", this.el).each(function() {
			
				var domImage = $(this);
				var currWidth = domImage.width();
				var currHeight = domImage.height();
				var scrollWidth = scrollView.scrollerW - 30; //minus 30 for paddings

				//only for images which are greater than scroll size
				if(currWidth > scrollWidth ) {
					var scale = scrollWidth/currWidth;
					domImage.width( currWidth * scale);
					domImage.height(currHeight * scale);
				}

			});

		}, 2000);

		$("#pagination", this.el).show();
	},

	setPagination: function(newer, older) {
		
		this.newer = newer;
		this.older = older;
	},

	getDateString: function(timestamp) {
		
		var d = new Date();
		d.setTime(timestamp);

		return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
	},

	onOlder: function() {
		// if(this.older != null) {
		// 	location.href = '#post/' + this.older;		
		// }

		this.trigger('older');
	},

	onNewer: function() {
		
		// if(this.newer != null) {
		// 	location.href = '#post/' + this.newer;
		// }

		this.trigger('newer');
	},

	onView: function() {
	
		window.plugins.webintent.startActivity({
			action: WebIntent.ACTION_VIEW,
			url: this.content.get('url')}, 
			function() {}, 
			function() {alert('Failed to open URL via Android Intent')}
		);	
	},

	onShare: function() {

		var title = this.title.toJSON();
		window.plugins.share.show({
		    subject: this.content.get('url'),
		    text: this.content.get('url') + ' via http://bit.ly/blograla'},
		    function() {}, // Success function
		    function() {alert('Share failed')} // Failure function
		);
	},

	show: function() {
		this.footer.render(this.menu);
		$(this.el).show();
	},

	hide: function() {
		$(this.el).hide();
	},

	clear: function() {
		
		delete this.newer;
		delete this.older;

		$(this.el).attr('id', null);
		$("#name", this.el).html("");
		$("#blog", this.el).html("");
		$("#date", this.el).html("");
		$("#text", this.el).html("");
	},

	zoom: function() {

		var zoom = new HashMap('zoom');
		var value = zoom.get("current");

		$(this.el).removeClass("x4");
		$(this.el).removeClass("x3");
		$(this.el).removeClass("x2");
		$(this.el).removeClass("x1");

		$(".title", this.el).removeClass("x4");
		$(".title", this.el).removeClass("x3");
		$(".title", this.el).removeClass("x2");
		$(".title", this.el).removeClass("x1");

		if(value) {
			//has a zoom value saved use it
			$(this.el).addClass("x" + value);
			$(".title", this.el).addClass("x" + value);
		} else {
			 //otherwise use the default of x1
			$(this.el).addClass('x2');
			$(".title", this.el).addClass('x2');
		}
	}
});

//Menus

var PostViewMenu = Backbone.View.extend({

	initialize: function() {

		_.bindAll(this, '_tap');

		this.el = $('#postViewMenu');
		$('#newer', this.el).tap(this._tap('newer'));
		$('#view', this.el).tap(this._tap('view'));
		$('#share', this.el).tap(this._tap('share'));
		$('#older', this.el).tap(this._tap('older'));

	},

	_tap: function(event) {
	
		var self = this;
		return function() {
			var item = this;
			$(item).removeClass('menu_normal');
			$(item).addClass('menu_tap');

			setTimeout(function() {
				
				$(item).removeClass('menu_tap');
				$(item).addClass('menu_normal');

				self.trigger(event);
			}, 100);
		}	
	},

	render: function() {
		return this;	
	},

	show: function(message) {

		$(this.el).show();
	},

	hide: function() {
		$(this.el).hide();
	}
});

var HomeMenu = Backbone.View.extend({

	initialize: function() {

		_.bindAll(this, '_tap');

		this.el = $('#homeMenu');
		$('#rate', this.el).tap(this._tap('rate'));
		$('#share', this.el).tap(this._tap('share'));

	},

	_tap: function(event) {
	
		var self = this;
		return function() {
			var item = this;
			$(item).removeClass('menu_normal');
			$(item).addClass('menu_tap');

			setTimeout(function() {
				
				$(item).removeClass('menu_tap');
				$(item).addClass('menu_normal');

				self.trigger(event);
			}, 100);
		}	
	},

	render: function() {
		return this;	
	},

	show: function(message) {

		$(this.el).show();
	},

	hide: function() {
		$(this.el).hide();
	}
});

//Footer

var Footer = Backbone.View.extend({

	initialize: function() {

		this.postViewMenu = new PostViewMenu();
		this.el = $('#footer');
	},

	render: function(view) {

		if(view) {
			$(this.el).html(view.render().el);
			view.show();	
		}
		return this;	
	},

	clear: function() {
		$(this.el).html('');
	},

	show: function(message) {

		$(this.el).show();
	},

	hide: function() {
		$(this.el).hide();
	}
});