var App = Backbone.Controller.extend({

	loaded: false,

	scrollerPosition: 0,
	
	routes: {
		"": "index",
		"post/:id": "post",
		"more": "more",
		"reload": "reload"
	},

	state: null,

	currentId: null,

	initialize: function() {

		var self = this;
		this.cache = new Cache("titles", 100);
		this.contentCache = new Cache('content', 10);

		_.bindAll(this, "index", "_addTitles", "_older", "_newer", "_reload", "_more");

		//views
		this.notice = new Notice;
		this.header = new Header;
		this.header.bind('reload', this._reload);
		this.zoom = new Zoom;

		//Footer 
		this.footer = new Footer;
		this.footer.render();

		this.titleListView = new TitleListView(this.footer);
		this.titleListView.bind('more', this._more);

		this.postView = new PostView(this.footer);
		this.postView.bind('older', this._older);
		this.postView.bind('newer', this._newer);

		this.postView.hide();

		this.zoom.bind("zoomChanged", function zoomChanged (value) {
			//notify changes for currently visible items
			self.titleListView.zoom();
			self.postView.zoom();
		});

		//models
		tc = this.titleCollection = new TitleCollection(this.cache);
		this.contentCollection = new ContentCollection(this.contentCache);

		//this is done to fix the scrollLength issue 
		setInterval(function() {
			scrollView.refresh();
		}, 500);
	},

	index: function() {

		var self = this;
		this.postView.hide();
		this.header.trigger('home');

		this.titleListView.show();

		if(this.loaded) {

			//scroll scroller to the old position
			scrollView.scrollTo(0, scrollerPosition, 50);

		} else {
			
			//first time loading

			//check the cache
			var items = this.cache.getAll();
			if(items.length > 0) {
				
				console.log('loading from the cache');
				var posts = [];
				items.forEach(function(item) {
					posts.push(new Title(item));
				});

				self._addTitles('bottom', posts);
			} else {
				
				console.log('loading from the network');
				this.titleCollection.latest(null, 10, function(err, items) {

					self._addTitles('bottom', items);
				});
			}

			//indicate whether the list has been loaded or not
			self.loaded = true;
				
		}

		if(scrollView) scrollView.refresh();
	},

	post: function(id) {

		//save the scroller position
		scrollerPosition = scrollView.y;

		this.header.trigger('post');

		var self = this;
		this.titleListView.hide();
		this.postView.show();

		//show the loading icon
		this.notice.show();
		this.titleCollection.get(id, function(err, title) {
			
			if(title) {
				self.postView.setTitle(title);
				self.contentCollection.get(id, collectionRecieved);
				
				//set the currentId
				currentId = id;
			} else {

				//hide the loading at the error
				self.notice.hide();

				//send the view to the index
				location.href = '#';
			}
		});

		function collectionRecieved(err, content) {

			//hide the loading
			self.postView.setContent(content);
			self.notice.hide();
			scrollView.refresh();
			scrollView.scrollTo(0,0,100);
		};
	}, 

	_more: function() {
		
		var self = this;

		this.notice.show();
		
		var oldestId = (this.state)? this.state.oldest: 0;
		this.titleCollection.olderThan(oldestId, 10, function(err, titles) {
			
			self.notice.hide();
			self._addTitles("bottom", titles);
			location.href = "#";
		});
	},

	/**
		Get the latest items from the server
	*/
	_reload: function() {
		
		var self = this;

		this.notice.show();
		var newestId = (self.state)? self.state.newest: 0;
		this.titleCollection.latest(newestId, 10, function(err, items) {

			self.notice.hide();
			if(items.length > 0) {

				var receivedMinId = items[items.length -1].get('id');

				//has a gap between received latest and the listed latest
				if(receivedMinId - newestId > 1) {

					//clear the list
					self.titleListView.clear();
					self.state = null;
				}

				self._addTitles('top', items);	
			}

		});
	},

	_older: function() {
		
		console.log('calling older');
		var title = this.cache.next(currentId);
		if(title) {
			location.href = '#post/' + title.id;
		} else {
			location.href = "#";
		}
	},

	_newer: function() {
		
		console.log('calling newer');
		var title = this.cache.previous(currentId);
		if(title) {
			location.href = '#post/' + title.id;
		} else {
			location.href = "#";
		}
	},

	/**
		@param direction - Show the direction to add
			top - add values to the top
			bottom - add values to the bottom
	*/
	_addTitles: function(direction, titles) {
		
		//if if received an empty titles
		if(titles.length <= 0) {
			return;
		}

		if(this.state == null) {
			//initialize the state at the first
			this.state = {
				newest: titles[0].get('id'),
				oldest: titles[titles.length -1].get('id')
			};
		} else {
			//updatie the state
			this.state.newest = (this.state.newest < titles[0].get('id'))? titles[0].get('id'): this.state.newest;
			this.state.oldest = (this.state.oldest > titles[titles.length -1].get('id'))?  titles[titles.length -1].get('id'): this.state.oldest;
		}
		
		if(direction == "bottom") {
			
			for(var lc = 0; lc < titles.length; lc++) {
				this.titleListView.append(titles[lc]);	
			}
		} else if(direction == "top") {
			
			for(var lc = titles.length -1 ; lc >= 0; lc--) {
				this.titleListView.prepend(titles[lc]);	
			}
		}

		console.log(this.state);
	}
});


$(function() {
	var app = new App;
	Backbone.history.start();
});

