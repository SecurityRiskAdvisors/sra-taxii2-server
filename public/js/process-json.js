import './renderjson.js'

var source = JSON.parse(document.getElementById("raw_json").innerText);

document.getElementById("json-tree").appendChild(
  renderjson//.set_show_by_default(true)
            //.set_show_to_level(2)
            //.set_sort_objects(true)
            .set_icons('+', '-')
            .set_max_string_length(100)
    (source));


var location = window.location.href.split("?")[0];		//the current address, sans search terms
if(location.endsWith("/")){
	location = location.substring(0, location.length - 1)
}
var links = {};											//linktext: href pairs

if(location.endsWith("apiroot1")){						//special apiroot case
	var lnk = location + "/collections";
	links[lnk] = lnk;
}

function find_linkables(obj,links)						//find info for links involving id and name
{
	for(var key in obj){
		if(key == "title" && "id" in obj){
			var linkDest = location;
			if(location.endsWith("collections")){
				linkDest += "/" + obj["id"];
			}
			links["Objects for " + obj["title"] + " collection"] = linkDest + "/objects";
			links["Manifest for " + obj["title"] + " collection"] = linkDest + "/manifest";
		}
		else if(typeof(obj[key]) == "object"){
			find_linkables(obj[key], links);
		}
	}
}

find_linkables(source, links);

for(var key in links){									//append special links
	var a = document.createElement("a");
	a.href = links[key];
	a.appendChild(document.createTextNode(key));
	document.body.appendChild(a);
	document.body.appendChild(document.createElement("br"));
}