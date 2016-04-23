request = require("request")
fs = require("fs")

//Ce script télécharge les 5 premiers niveaux de zoom d'OSM (au delà, le volume est trop important, il doit être segmenter via predownloader.js et downloader.js)

for(var z = 0; z < 5; z++) {
	
	fs.mkdirSync(z + "");
	
	max = Math.pow(2, z) - 1;
	
	for(var x = 0; x <= max; x++) {
		
		fs.mkdirSync(z + "/" + x);
		
		for(var y = 0; y <= max; y++) {
			
			request('http://a.tile.osm.org/'+z+'/'+x+'/'+y+'.png').pipe(fs.createWriteStream(z + "/" + x + "/" + y + ".png"))
			
		}
	}
}

