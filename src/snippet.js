var parameters = {
  username: '313d6562-626e-4edc-855f-528c7bba73e3-bluemix',
  password: '38fdea42f285bd146e7a7d2baa15f91dc486dababd609a1c61e3b2a2452aa55a',
  dbName: 'pet' + Math.floor(Math.random()*1000)
};

//Main function
//Output will be reflected via console.log function
function process(req_parameters, callback) {
	
	var Cloudant = require('cloudant');
	
	var cloudant = Cloudant({
		account:req_parameters.username, 
		password:req_parameters.password
	});

	console.log("Creating database '" + req_parameters.dbName  + "'");
	cloudant.db.create(req_parameters.dbName, function(err, data) {
		if (err) {
			console.log("Error:", err);
			return;
		}
		
		console.log("data:", data);
	});	
}


//Allows Execution of this process
//will run if only called directly
if (require.main === module) {
	process(parameters,null);
} else {

//	name of the unit for logging and servlet path also
	var unitpath = "";

//	Template for making above code available
//	as service via superglue routine
	var superglue = require('../lib/superglue.js');
	module.exports = {
			path: '/'+unitpath,
			priority: 1,

			init: function (app) {
				// something to do initially
			},
			GET:  function(req, res) {superglue.GET(req,res,parameters,unitpath)},
			POST: function(req, res) {superglue.POST(req,res,process)}
	}
}