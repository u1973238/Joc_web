function platform_game(){
	let name = prompt("User name");

	localStorage.setItem("username", name);

	loadpage("./html/platform.html");
}
/*
function exit (){
	if (name != ""){
		alert("Leaving " + name + "'s game");
	}
	name = "";
}
*/
function options(){
	loadpage("./html/options.html");
}

function load(){
	loadpage("./html/load.html");
}

function imgAnim(logo)
{
	logo.src = "./resources/logo_anim.gif"
}

function imgStill(logo)
{
	logo.src = "./resources/logo.svg"
}