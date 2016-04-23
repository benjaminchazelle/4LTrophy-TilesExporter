request = require("request")
fs = require("fs")

// Cet outil télécharge l'ensemble des tuiles d'une collection de zones (générées via predownloader.js) pour un niveau donnée

zoom = 10; // le niveau de zoom doit être identique à celui que vous aviez choisis dans le predownloader

function mkdir(p) {
if(!fs.existsSync(p + ""))
	fs.mkdirSync(p + "");
}

mkdir(zoom);

areas = JSON.parse(fs.readFileSync("areas.json").toString());

function getAreaValue(area) {
	return Math.abs(area.beta.x - area.alpha.x + 1) * (area.beta.y - area.alpha.y + 1);
}

function loop() {

console.log("");
console.log(areas.length, "zones restantes");

if(areas.length > 0) {
	
	area = areas[0];
	
	counter = getAreaValue(area);
	
	console.log(counter, "tuiles dans la zone courante", new Date());
	
	for(var x = area.alpha.x; x <= area.beta.x; x++) {
		
		mkdir(zoom + "/" + x);
		
		for(var y = area.alpha.y; y <= area.beta.y; y++) {

			request('http://a.tile.osm.org/'+zoom+'/'+x+'/'+y+'.png', function (error, response, body) {
					if (!error && response.statusCode == 200) {
						counter--;
						
					if(counter == 0) {
						areas = areas.slice(1);
						fs.writeFileSync("areas.json", JSON.stringify(areas));
						setTimeout(function() {loop();}, 1000);
						}
					}
					else {
						console.log("Erreur sur cette zone");
					}
				}).pipe(fs.createWriteStream(zoom + "/" + x + "/" + y + ".png"));
				
			} //y
		} //x
		
	} //again ?
} //loop

loop();
