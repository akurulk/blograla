/*
	Cache which maintain a list as an cache with a limit in the localstorage
	We can add and remove items to the cache 
	It will be cleared to the limited when intitiating the app
*/
function Cache(namespace, limit) {
		
	retainOnly(limit);

	this.push = function(key, value) {
		
		if(!getItem(key)) {
			//do not add to the index if this is already exists
			var index = readIndex();
			index.push(key);
			writeIndex(index);
		}

		setItem(key, value);
	};

	this.unshift = function(key, value) {
		
		if(!getItem(key)) {
			//do not add to the index if this is already exists
			var index = readIndex();
			index.unshift(key);
			writeIndex(index);	
		}

		setItem(key, value);
	};

	this.get = function(key) {
		
		return getItem(key);
	};

	this.getAll = function() {
		
		var index = readIndex();
		var items = [];

		index.forEach(function(key) {
			
			items.push(getItem(key));
		});

		return items;
	};

	this.clear = function() {
		
		var index = readIndex();

		index.forEach(function(item) {
			
			removeItem(item);
		});

		writeIndex([]);
	};

	this.next = function(key) {
	
		var index = readIndex();
		var lc = index.indexOf(key);
		if(lc >= 0) {
			return this.get(index[lc+1]);
		} else {
			return null;
		}
	};

	this.previous = function(key) {
	
		var index = readIndex();
		var lc = index.indexOf(key);
		if(lc > 0) {
			return this.get(index[lc-1]);
		} else {
			return null;
		}	
	};

	function readIndex() {
		
		var str = getItem('index');
		if(str) {
			return JSON.parse(str);	
		} else {
			return [];
		}
	}

	function writeIndex(index) {
		
		setItem("index", JSON.stringify(index));
	}

	function retainOnly(count) {
		
		var index = readIndex();
		if(index.length > count) {
			
			//remove items
			for(var lc=count; lc<index.length; lc++) {
				
				removeItem(index[lc]);
			}

			//shrink the index
			index =  index.slice(0, count);
			writeIndex(index);
		}
	}

	function setItem(key, value) {
		
		localStorage.setItem(namespace + "::" + key, JSON.stringify(value));
	}

	function getItem(key) {
		
		var str = localStorage.getItem(namespace + "::" + key);
		if(str) {
			return JSON.parse(str);
		} else {
			return null;
		}
	}

	function removeItem(key) {
		
		localStorage.removeItem(namespace + "::" + key);	
	}
};