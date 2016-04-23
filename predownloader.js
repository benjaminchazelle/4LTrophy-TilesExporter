//Cet outil segmente une séléction (dans selection.json) créer à partir de TilesSelecter plusieurs zones pour faciliter le téléchargement 

fs = require("fs");

polygonMap = JSON.parse(fs.readFileSync("selection.json").toString());

zoom = 10; //Pour quel niveau de zoom ?

AREA_LIMIT = 1000; //Le nombre maximum de tuiles par zones. Ce paramètre ne change rien au résultat, il permet simplement de gérer la segmentation du téléchargement. 

Array.prototype.get = function (index) {
	
	var i = parseInt(index) % this.length;

	if(i < 0)
		i += this.length;
	
	return this[i];
	
	}
	
function checkRightAngles(_polygon) {
	
	var collection = {};
	
	for(var i = 0, l = _polygon.length; i < l; i++) {
		
		var u = _polygon.get(i - 1);
		var v = _polygon.get(i);
		var w = _polygon.get(i + 1);
		
		if(v.x in collection) {
			if(v.y in collection[v.x]) {
				console.log("Erreur: plusieurs sommets en un même point");
				console.log(v, "#" + i, "#" + collection[v.x][v.y])
				return false;
			}
			else
				collection[v.x][v.y] = i;
		}
		else {
			collection[v.x] = {};
			collection[v.x][v.y] = i;
		}

		if(!(u.y == v.y && v.x == w.x) && !(u.x == v.x && v.y == w.y)) {
		
			console.log("Erreur: Angle non droit détécté");
			console.log(u);
			console.log(v);
			console.log(w);
		
			return false;
			}
		
		}
	
	return true;
	
	}

function optimizePolygon(_polygon) {
	
	var new_polygon = [_polygon.get(0), _polygon.get(1)];
	
	for(var i = 2, l = _polygon.length; i < l; i++) {
		
		var u = new_polygon.get(-2);
		var v = new_polygon.get(-1);
		var w = _polygon.get(i);

		same = 	v.x == w.x && v.y == w.y;
		
		if(!same) {

			if((u.x == v.x && v.y == w.y) || (u.y == v.y && v.x == w.x)) {
				
				new_polygon.push(w);

				}
			else if(u.x == v.x && v.x == w.x && w.y != v.y) {
				
				v.y = w.y;

				}
			else if(u.y == v.y && v.y == w.y && w.x != v.x) {
				
				v.x = w.x;
	
				}			
			
			}
	
		}
		
	return new_polygon;

}
	
function getTopLeftVertex(_polygon) {
	
	var topLeftVertex = _polygon.get(0);
	var topLeftVertex_index = 0;
	
	for(var i = 1, l = _polygon.length; i < l; i++) {
		
		var v = _polygon.get(i);
		
		if(v.y < topLeftVertex.y || (v.y == topLeftVertex.y && v.x < topLeftVertex.x)) {
			topLeftVertex = v;	
			topLeftVertex_index = i;
			}
		
		}
		
	return topLeftVertex_index;
	
	}
	
function setClockwiseDeclaration(_polygon) {
	
	topLeftVertex_index = getTopLeftVertex(_polygon);
	
	a = _polygon.get(topLeftVertex_index);
	b = _polygon.get(topLeftVertex_index + 1);
	
	if(a.x == b.x) {
		_polygon.reverse();
		return true;
		}
		
	return false;
			
	}	
		
function ChazelleSaugues(_polygon) {
	
	var e=0;

	_polygon = optimizePolygon(_polygon);
	
	if(_polygon.length < 4 || !checkRightAngles(_polygon))
		return [];
	
	setClockwiseDeclaration(_polygon);
		
	var progression = true;
	
	var sommet_courant = 0;

	var result = [];
	
	vertex_issue = _polygon.length;

	while (progression) {

		var a = _polygon.get(sommet_courant + 0);
		var b = _polygon.get(sommet_courant + 1);
		var c = _polygon.get(sommet_courant + 2);
		var d = _polygon.get(sommet_courant + 3);
		
		sommet_courant++;
		
		pattern_U	  = (b.y == c.y && (a.y < b.y && d.y < c.y) );
		pattern_U_inv = (b.y == c.y && (a.y > b.y && d.y > c.y) );
		
		pattern_C	  = (b.x == c.x && (a.x > b.x && d.x > c.x) );
		pattern_C_inv = (b.x == c.x && (a.x < b.x && d.x < c.x) );
		
		ab_sup_pattern_U = Math.abs(b.y-a.y) > Math.abs(d.y-c.y);
		ab_sup_pattern_C = Math.abs(b.x-a.x) > Math.abs(d.x-c.x);
		
		ab_eq_pattern_U = Math.abs(b.y-a.y) == Math.abs(d.y-c.y);
		ab_eq_pattern_C = Math.abs(b.x-a.x) == Math.abs(d.x-c.x);
		
		pattern_ok = pattern_U || pattern_U_inv || pattern_C || pattern_C_inv;
		
		if((pattern_U) && a.x < d.x)
			continue;
		if((pattern_U_inv) && a.x > d.x)
			continue;
		if((pattern_C) && a.y < d.y)
			continue;
		if((pattern_C_inv) && a.y > d.y)
			continue;
		
		//forme U
		if(pattern_U){
			
			if(ab_sup_pattern_U) {
				phi = {x : a.x, y : d.y};
				alpha = d;
				beta = b;
				}
			else {
				phi = {x : d.x, y : a.y};
				alpha = phi;
				beta = b;
				}
			}
			
		else if(pattern_U_inv) {
			
			if(ab_sup_pattern_U) {
				phi = {x : a.x, y : d.y};
				alpha = b;
				beta = d;
				}
			else {
				phi = {x : d.x, y : a.y};
				alpha = b;
				beta = phi;
				}
			}
		
		//forme C
		else if(pattern_C) {
			
			if(ab_sup_pattern_C) {
				phi = {x : d.x, y : a.y};
				alpha = c;
				beta = phi;
				}
			else {
				phi = {x : a.x, y : d.y};
				alpha = c;
				beta = a;
				}
			}
			
		else if(pattern_C_inv) {
			
			if(ab_sup_pattern_C) {
				phi = {x : d.x, y : a.y};
				alpha = phi;
				beta = c;
				}
			else {
				phi = {x : a.x, y : d.y};
				alpha = a;
				beta = c;
				}
			}
		
		
		//condition aucun point dans le rectangle a découper
		if(pattern_ok) {
			
			inner = false;
			
			for(i=0;i<_polygon.length;i++) {
			
				if(_polygon[i] == a || _polygon[i] == b || _polygon[i] == c || _polygon[i] == d)
					continue;
					
				if(alpha.x <= _polygon[i].x && _polygon[i].x <= beta.x && alpha.y <= _polygon[i].y && _polygon[i].y <= beta.y ) {
					inner = true;
					break;	
					}
				}
				
				if(!inner){
				
					new_polygon = [];
					
					for(i=0;i<_polygon.length;i++) {
						
						if((pattern_U || pattern_U_inv)) {
							
							if(ab_sup_pattern_U) {
								
								if(_polygon[i] == b)
									new_polygon.push(phi);
								else if (_polygon[i] != c && _polygon[i] != d)
									new_polygon.push(_polygon[i]);
								
								}
							else if(ab_eq_pattern_U) {
								
								if (_polygon[i] != a && _polygon[i] != b && _polygon[i] != c && _polygon[i] != d)
										new_polygon.push(_polygon[i]);
								}
							else {
								
								if(_polygon[i] == a)
									new_polygon.push(phi);
								else if (_polygon[i] != b && _polygon[i] != c)
									new_polygon.push(_polygon[i]);
								}

							}
						else if((pattern_C || pattern_C_inv)) {
							
							
							
							if(ab_sup_pattern_C) {
								
								if(_polygon[i] == b)
									new_polygon.push(phi);
								else if (_polygon[i] != c && _polygon[i] != d)
									new_polygon.push(_polygon[i]);
								}
							else if(ab_eq_pattern_C) {
								
								if (_polygon[i] != a && _polygon[i] != b && _polygon[i] != c && _polygon[i] != d)
										new_polygon.push(_polygon[i]);
								}
							else {
								
								if(_polygon[i] == a)
									new_polygon.push(phi);
								else if (_polygon[i] != b && _polygon[i] != c)
									new_polygon.push(_polygon[i]);
								}

							}
						
						}
						
					result.push({"alpha": alpha, "beta": beta});
					
					_polygon = new_polygon;
					
					vertex_issue = _polygon.length;

					sommet_courant-=2;
					}
			}
		
		vertex_issue--;
		
		if(_polygon.length == 0 || vertex_issue < 0)
			progression = false;
		
		}

	return result;
	}

function long2tile(lon,_zoom) { return (Math.floor((lon+180)/360*Math.pow(2,_zoom))); }
function lat2tile(lat,_zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,_zoom))); }

selection_success = checkRightAngles(polygonMap);

function getAreaValue(area) {
	
	return Math.abs(area.beta.x - area.alpha.x) * (area.beta.y - area.alpha.y);
}

function subdiviseArea(baseArea) {
	
	var AreaBucket = [];
	
	if(getAreaValue(baseArea) > AREA_LIMIT) {
		
		var w = Math.abs(baseArea.beta.x - baseArea.alpha.x);
		var h = Math.abs(baseArea.beta.y - baseArea.alpha.y);
		
		if(w > h) {
			var am = Math.floor(w/2);
			var mb = w - am;
			
			var left = {alpha : {x : baseArea.alpha.x, y : baseArea.alpha.y}, beta : {x : (baseArea.alpha.x + am), y : baseArea.beta.y}};
			var right = {alpha : {x : (baseArea.alpha.x + am), y : baseArea.alpha.y}, beta : {x : baseArea.beta.x, y : baseArea.beta.y}};

			AreaBucket = AreaBucket.concat(subdiviseArea(left));
			AreaBucket = AreaBucket.concat(subdiviseArea(right));
		}
		else {
			var am = Math.floor(h/2);
			var mb = h - am;
			
			var top = {alpha : {x : baseArea.alpha.x, y : baseArea.alpha.y}, beta : {x : baseArea.beta.x, y : baseArea.alpha.y + am}};
			var bottom = {alpha : {x : baseArea.alpha.x, y : baseArea.alpha.y + am}, beta : {x : baseArea.beta.x, y : baseArea.beta.y}};

			AreaBucket = AreaBucket.concat(subdiviseArea(top));
			AreaBucket = AreaBucket.concat(subdiviseArea(bottom));
		}
		

		
	}
	else {
		AreaBucket.push(baseArea);
	}

	return AreaBucket;
	
}


if(!selection_success) {
	console.log("Séléction incorrecte !");
}
else {
	
	for(var  i = 0; i < polygonMap.length; i++) {

		polygonMap[i].x = long2tile(polygonMap[i].x, zoom);
		polygonMap[i].y = lat2tile(polygonMap[i].y, zoom);
		
	}	

	polygonMap = optimizePolygon(polygonMap);

	convert_success = checkRightAngles(polygonMap)

	if(!convert_success) {
		console.log("Conversion impossible pour cette séléction à ce niveau de zoom");
	}
	else {
		
		areasMap = ChazelleSaugues(polygonMap);
		sum = 0;
		
		areasCollection = [];
		
		for(var  i = 0; i < areasMap.length; i++) {

			sum += getAreaValue(areasMap[i]);
			
			areasCollection = areasCollection.concat(subdiviseArea(areasMap[i]));
			

		}
		
					console.log(sum, "tuiles à télécharger");
					console.log(areasCollection.length, "zones");
					
		fs.writeFileSync("areas.json", JSON.stringify(areasCollection));
		
	}
	
}


