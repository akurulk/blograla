
/**
	Simple HashMap with namespaces
*/
function HashMap(namespace) {
	
	this.put = function(key, value) {
		setItem(key, value);
	};

	this.get = function(key) {
		return getItem(key);
	};

	this.remove = function(key) {
		removeItem(key);
	};

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
}