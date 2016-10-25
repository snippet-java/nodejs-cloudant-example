var express = require('express');
var hogan = require('hogan-express');
var http = require('http');
var path = require('path');
//DynamicRoutes = require('dynamic-routes'),
var app = express();

var bodyParser = require('body-parser');

var Cloudant = require('cloudant');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', hogan);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
})); 
app.use(express.static(path.join(__dirname, 'public')));

var services = JSON.parse(process.env.VCAP_SERVICES) || {};

var cloudantCreds = {};
for (var serviceName in services) {
	if (serviceName.indexOf("cloudantNoSQLDB") > -1) {
		cloudantCreds = services[serviceName][0]['credentials'];
	}
}
var config = require("./config.json");

var cloudant = Cloudant({
	account : cloudantCreds.username || config.cloudant.username || "", 
	password : cloudantCreds.password || config.cloudant.password || ""
});

var db = cloudant.db.use(config.cloudant.dbName);

app.get(["/createdb"], function(req, res) {
	var name = req.query.dbname || config.cloudant.dbName || "";
	cloudant.db.create(name, function(err, data) {
		if (err) {
			var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
			res.render('template.html', str);
			return;
		}
		
		db = cloudant.db.use(name);

		var str = {out : "data:\n\n" + JSON.stringify(data, null, 4)};
		res.render('template.html', str);
	});
})

app.get(["/create","/insert","/add"], function(req, res) {
	var doc = {
		"name" : "John",
		"studentId" : "ID#" + Math.floor(Math.random()*10000)
	}
	for (var key in req.query) {
		doc[key] = req.query[key]
	}
	db.insert(doc, function(err, data) {
		if (err) {
			var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
			res.render('template.html', str);
			return;
		}

		var str = {out : "doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
		res.render('template.html', str);
	});
})

app.get(["/list"], function(req, res) {
	db.list(function(err, data) {
		if (err) {
			var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
			res.render('template.html', str);
			return;
		}
		
		var str = {out : "data:\n\n" + JSON.stringify(data, null, 4)};
		res.render('template.html', str);
	});
})

app.get(["/read"], function(req, res) {
	var _id = req.query._id || req.query.id || "";
	if (_id != "") {
		db.get(_id, function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}

			var str = {out : "data:\n\n" + JSON.stringify(data, null, 4)};
			res.render('template.html', str);
		});
	} else {
		db.list(function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}
			
			var doc = data.rows[Math.floor(data.rows.length*Math.random())];
			db.get(doc.id, function(err, data) {
				if (err) {
					var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
					res.render('template.html', str);
					return;
				}

				var str = {out : "doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
				res.render('template.html', str);
			});
		});
	}
})

app.get(["/update","/modify"], function(req, res) {
	var _id = req.query._id || req.query.id || "";
	if (_id != "") {
		db.get(_id, function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}
			
			var doc = data;
			for (var key in req.query) {
				doc[key] = req.query[key]
			}
			db.insert(doc, function(err, data) {
				if (err) {
					var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
					res.render('template.html', str);
					return;
				}
	
				var str = {out : "doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
				res.render('template.html', str);
			});
		});
	} else {
		db.list(function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}
			
			var doc = data.rows[Math.floor(data.rows.length*Math.random())];
			db.get(doc.id, function(err, data) {
				if (err) {
					var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
					res.render('template.html', str);
					return;
				}
				
				var doc = data;
				for (var key in req.query) {
					doc[key] = req.query[key]
				}
				db.insert(doc, function(err, data) {
					if (err) {
						var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
						res.render('template.html', str);
						return;
					}
		
					var str = {out : "doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
					res.render('template.html', str);
				});
			});
		});
	}
})


app.get(["/delete","/destroy","/remove"], function(req, res) {
	var _id = req.query._id || req.query.id || "";

	if (_id != "") {
		db.get(_id, function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}
			
			var doc = data;
			db.destroy(doc._id, doc._rev, function(err, data) {
				if (err) {
					var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
					res.render('template.html', str);
					return;
				}
	
				var str = {out : "deleted doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
				res.render('template.html', str);
			});
		});
	} else {
		db.list(function(err, data) {
			if (err) {
				var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
				res.render('template.html', str);
				return;
			}
			
			var doc = data.rows[Math.floor(data.rows.length*Math.random())];
			db.get(doc.id, function(err, data) {
				if (err) {
					var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
					res.render('template.html', str);
					return;
				}
				
				var doc = data;
				db.destroy(doc._id, doc._rev, function(err, data) {
					if (err) {
						var str = {out : "error:\n\n" + JSON.stringify(err, null, 4)};
						res.render('template.html', str);
						return;
					}
		
					var str = {out : "deleted doc:\n\n" + JSON.stringify(doc, null, 4) + "\n\ndata:\n\n" + JSON.stringify(data, null, 4)};
					res.render('template.html', str);
				});
			});
		});
	}
})

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

require("cf-deployment-tracker-client").track();