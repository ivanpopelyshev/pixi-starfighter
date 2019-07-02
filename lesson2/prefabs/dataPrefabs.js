export default {
	
	ufo : {
		view : "ufo",
		firerate : 2,//2, //persecs
		firemode: "onetime",
		bulletspeed : 10,
		bulletdamage : 1,
		bulettype : "dot",
		guns : [
			{
				offset : {x : 0, y : -60},
				dir : {x : 0, y : 1}
			}
		],
		size : 1
	},

	ufoBig :  {
		view : "ufo",
		firerate : 1,//1,
		firemode : "sequential",
		bulletspeed : 10,
		bulletdamage : 3,
		bulettype : "dot",
		guns : [
			{
				offset : {x : -120, y : 0},
				dir : {x : 0, y : 1}
			},
			{
				offset : {x : 120, y : 0},
				dir : {x : 0, y : 1}
			}
		],
		size : 2
	}
};
