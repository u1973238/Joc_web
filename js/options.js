var options = function(){
	// Aquí dins hi ha la part privada de l'objecte
	var options_data = {
		dificulty:"hard"
	};
	var load = function(){
		var json = localStorage.getItem("config") || '{""dificulty":"hard"}';
		options_data = JSON.parse(json);
	};
	var save = function(){
		localStorage.setItem("config", JSON.stringify(options_data));
	};
	load();
	var vue_instance = new Vue({
		el: "#options_id",
		data: {
			dificulty: "normal"
		},
		created: function(){
			this.dificulty = options_data.dificulty;
		},
		watch: {
			//no cal res
		},
		methods: { 
			discard: function(){
				this.dificulty = options_data.dificulty;
			},
			save: function(){
				options_data.dificulty = this.dificulty;
				save();
				loadpage("../");
			}
		}
	});
	return {
		// Aquí dins hi ha la part pública de l'objecte
		getOptionsString: function (){
			return JSON.stringify(options_data);
		},
		getDificulty: function (){
			return options_data.dificulty;
		}
	}; 
}();



