

var fs = require('fs');
var request = require('request');

var zz = {};
zz.p =  function(t){  console.log(t);}
zz.pb = function(t){ zz.p('############################################################################');  zz.p('');  zz.p(t); }
zz.pe = function(){zz.p('');}




zz.extend = function(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}



zz.save2 = function(dir, obj){

	
	
	fs.writeFile(dir,    JSON.stringify(obj), 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
	
	
   zz.p(' ----- '+dir.toUpperCase() + " SAVED!");
   zz.p('');
	
	}); 

		
	
	
	
	
}

//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
zz.savetocurrent = function(data){
	
		
	fs.writeFile('./client/current.json',    JSON.stringify(data), 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
	
	
   zz.p(' ----- current json' + " SAVED!");
   zz.p('');
	
	}); 
	
}


///////////////////////////////////
zz.save = function(dir, obj){

	
	//var dir = 'client/coindb/'+dir;
	fs.writeFile(dir,    JSON.stringify(obj), 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
	
	
   zz.p(' ----- '+dir.toUpperCase() + " SAVED!");
   zz.p('');
	
	}); 

		
	
	
	
	
}

//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------


zz.load = function(dir){ return JSON.parse(fs.readFileSync('client/'+dir+'.json', 'utf8') ); };

//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------


zz.gettimestamp = function() {return Math.round((new Date()).getTime() / 1000);}




//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
zz.loadapi = function(url,dothis){
	
	
	
	 request.get(url,  function (error, response, body) {
		
		
		if (!error && response.statusCode == 200) {

			var data = JSON.parse(body);
			dothis(data);
			
			
		}else{
			
			
			
		}

		
	/////

	});

	
}


//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var starttime = zz.gettimestamp();
zz.datafeed = {starttime:starttime,data:{}};
zz.request = request;



exports.zz = zz;
