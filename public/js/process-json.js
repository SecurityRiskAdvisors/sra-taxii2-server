import './renderjson.js'

var source = JSON.parse(document.getElementById("raw_json").innerText);

document.getElementById("json-tree").appendChild(
  renderjson//.set_show_by_default(true)
            //.set_show_to_level(2)
            //.set_sort_objects(true)
            .set_icons('+', '-')
            .set_max_string_length(100)
    (source));
