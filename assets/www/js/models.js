var Title = Backbone.Model.extend({
	defaults: {
		name: "the name",
		blog: "the blog",
		timestamp: new Date().getTime(),
		url: "",
		id: null
	}
});

var Content = Backbone.Model.extend({
	defaults: {
		text: "the name",
		url: "the blog",
		id: null
	}
});

var Post = Backbone.Model.extend({
	defaults: {
		name: "the name",
		blog: "the blog",
		timestamp: new Date().getTime(),
		url: "",
		text: "",
		id: null,
		nextId: null,
		previousId: null
	}
});

var API_HOST = "http://apihost.com:port";

function TitleCollection(cache) {

	/**
		@param maxId - maximum id you have in the list
	*/
	this.latest = function(maxId, count, callback) {

		maxId = (maxId)? maxId: 0;
		var uri = cacheFix(API_HOST + '/title/latest/' + maxId + '/' + count);
		console.log(uri);

		$.get(uri, function(data, statusCode) {
			
			console.log("============: " + JSON.stringify(statusCode));
			var response = JSON.parse(data);
			var posts = [];
			response.forEach(function(item) {
				posts.push(new Title(item));
			});

			//add to cache
			for(var lc=response.length -1; lc >=0; lc--) {

				var item = response[lc];
				cache.unshift(item.id, item);
			}
			
			if(callback) callback(null, posts);
		});

	};

	this.get = function(id, callback) {

		var cachedItem = cache.get(id);
		if(cachedItem) {
			//getting from the cache

			if(callback) callback(null, new Title(cachedItem));
		} else {

			//getting from the network
			var uri = API_HOST + '/title/' + id;
			console.log(uri);
			$.get(uri, function(data) {
				
				var response = JSON.parse(data);
			
				if(callback) callback(null, new Title(response));
			});	
		}
	};

	this.newerThan = function(id, count, callback) {
		

	};

	this.olderThan = function(id, count, callback) {
		
		id = (id)? id: 0;
		var uri = cacheFix(API_HOST + '/title/olderThan/' + id + '/' + count);
		console.log(uri);
		$.get(uri, function(data) {
			
			var response = JSON.parse(data);
			var posts = [];
			response.forEach(function(item) {

				var post = new Title(item);
				posts.push(post);
				//add to cache
				cache.push(item.id, item);
			});
			
			if(callback) callback(null, posts);
		});
	};
};

function ContentCollection(cache) {
	
	this.get = function(id, callback) {
		
		var cachedContent = cache.get(id);
		if(cachedContent) {
			
			console.info('loading content from cache');
			if(callback) callback(null, new Content(cachedContent));
		} else {

			console.info('loading content from network');
			var uri = API_HOST + '/content/' + id;
			console.log(uri);
			$.get(uri, function(data) {
				
				var response = JSON.parse(data);
				if(response) {
					
					var convertedText = ""
					//sometimes this cause errors when converting.
					//so we dont need to break the code afterwise
					try {
						response.text = akuru.convert(response.text, 'derana');
					} catch(ex) {
						response.text = "Invalid HTML";	
					}

					cache.unshift(id, response);
					if(callback) callback(null, new Content(response));
				} else {
					if(callback) callback(null, 'No Internet');
				}
			
			});
		}
			
	};
}

function cacheFix(url) {
	return url + '?' + new Date().getTime();
}