(function( factory ) {
	"use strict";
	var observerModule;

	if ( window.respimage ) {
		observerModule = factory( window.respimage );
		factory = function() {return observerModule;};
	}
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		require( [ "../../respimage" ], factory );
	} else if ( typeof module === "object" && typeof exports === "object" ) {
		module.exports = factory( require("../../respimage") );
	} else if ( !window.respimage ) {
		throw( "you need to include respimage" );
	}

}( function( respimage ) {
	"use strict";

	var ri = respimage._;
	var oldConfig = respimage.config;
	var cfg = ri.cfg;
	var extraCfgs = {
		lowbandwidth: {
			greed: 1.6,
			tHigh: 0.6,
			tLow: 1.1,
			xQuant: ri.DPR > 1 ? 0.85 : 0.95,
			tLazy: 2
		}
	};
	var change = function(val, config){
		var prop;
		for ( prop in config ) {
			if ( val ) {
				cfg[prop] *= config[prop];
			} else {
				cfg[prop] /= config[prop];
			}
		}
	};

	if(cfg.lowbandwidth){
		change(true, extraCfgs.lowbandwidth);
	}

	respimage.config = function(name, value){
		if (extraCfgs[name]) {
			value = !!value;
			if( value != cfg[name] ) {
				change(value, extraCfgs[name]);
			}
		}

		return oldConfig.apply(this, arguments);
	};

	if ( ri.DPR > 1.2 ) {
		(function(){

			var regSTypes = /gif|png|svg/;
			var regSext = /\.gif|\.png|\.svg/;
			var isSharpType = function(set){
				return regSTypes.test(set.type || '') || regSext.test(set.srcset || set.src || '');
			};
			extraCfgs.constrainDPI =  {
				tHigh: 0.9,
				xQuant: 0.97,
				greed: 1.1
			};


			ri.getX = function(candidates){
				var set = candidates[0].set;
				var ret = ri.DPR * cfg.xQuant;
				if (cfg.constrainDPI && !isSharpType(set)) {
					ret *= 0.87;
					if ( ret > 1.6 ) {
						ret = 1.6;
					}
				}
				return ret;
			};

			cfg.constrainDPI = true;
			change(true, extraCfgs.constrainDPI);
		})();
	}

}));
