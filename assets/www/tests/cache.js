test('push and unshift', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.unshift('ccc', "300");

	var all = c.getAll();
	
	deepEqual(all, ["300", "100", "200"]);
	c.clear();
});

test('getting an value', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");

	deepEqual(c.get('abc'), "100");
	c.clear();
});

test('getting value after clear', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.clear();

	deepEqual(c.get('abc'), null);
	c.clear();
});

test('getting next value', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.push('ccc', "300");

	var c2 = new Cache("a", 10);

	deepEqual(c2.next('abc'), "200");
	deepEqual(c2.next('ccc'), null);
	deepEqual(c2.next('3e3e3'), null);
	c.clear();
});

test('getting previous value', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.push('ccc', "300");

	deepEqual(c.previous('abc'), null);
	deepEqual(c.previous('bbc'), "100");
	deepEqual(c.previous('abcsds'), null);
	c.clear();
});

test('autoclean', function() {
	
	var c = new Cache("a", 2);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.push('ccc', "300");

	var c2 = new Cache("a", 2);
	deepEqual(c.getAll(), ["100", "200"]);
	c.clear();
});

test('re-add again', function() {
	
	var c = new Cache("a", 10);
	c.push('abc', "100");
	c.push('bbc', "200");
	c.push('abc', "400");

	deepEqual(c.getAll(), ["400", "200"]);
	c.clear();
});

test('namespaces', function() {
	
	var c = new Cache("a", 2);
	c.push('abc', "100");
	c.push('bbc', "200");

	var c2 = new Cache("b", 2);
	c2.push("aaa", "1200");

	c.clear();

	equal(c2.get('aaa'), "1200");
	c2.clear();
});