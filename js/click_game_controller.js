var gameObj = function (){
	let l_partida = null;
	if (sessionStorage.idPartida && localStorage.partides){
		let arrayPartides = JSON.parse(localStorage.partides);
		if (sessionStorage.idPartida < arrayPartides.length)
			l_partida = arrayPartides[sessionStorage.idPartida];
	}
	var vueInstance = new Vue({
		el: "#game_id",
		data: {
			username:'',
			day: 1
		},
		created: function(){
			if (l_partida){
				this.username = l_partida.username;
				this.day = l_partida.day
			}
			else{
				this.username = localStorage.getItem("username","unknown");
				this.day = localStorage.getItem("day",1);
			}
			//sessionStorage.clear();
			console.log(this.username);
		}
	});
	return {};
}();






