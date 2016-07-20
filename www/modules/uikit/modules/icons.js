(function(){
	var app = angular.module('uikit-icons', []);
	
	//Icons pack
	app.directive("uiIcons", function(){
		return {
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/icons.svg'
		};
	});
	//Individual icon load
	app.directive("icon", function(){
		return {
			scope: true,
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/icon.html',
			link: function(scope, elem, attrs) {
	            var img = attrs.img;
	            var type = attrs.type;
				var color = attrs.color;
				var size = attrs.size;
				if(!type){
					var type = '';
				}else{
					type = "-"+type;
				}
				if(!size){
					size = "icon";
				}else{
					size = "icon-"+size;
				}
				if(!color){
					var color = 'aquarium';
					}

				var svg = "modules/uikit/svg/icons/"+color+'/'+img+type+'.svg';
	            scope.svg = svg;
	            scope.size = size;
        	}
		};
	});
	
})();