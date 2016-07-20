(function(){
	var app = angular.module('uikit-switches', []);
	
	app.directive("uiFlip", function(){
		return {
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/switch-flip.html',
			link: function(scope, elem, attrs) {
	            //console.log(attrs);
	            var id = attrs.switchId;
	            elem.find('input').attr('id' , id);
	            elem.find('label').attr('for', id);
        	}
		};
	});
	app.directive("uiSwitch", function(){
		return {
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/switch.html',
			link: function(scope, elem, attrs) {
	            //console.log(attrs);
	            var id = attrs.switchId;
	            elem.find('input').attr('id' , id);
	            elem.find('label').attr('for', id);
        	}
		};
	});
	app.directive("uiRadio", function(){
		return {
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/radio.html',
			link: function(scope, elem, attrs) {
	            //console.log(attrs);
	            var id = attrs.radioId;
	            var name = attrs.radioName;
	            var label = attrs.radioLabel;
	            elem.find('input').attr('id' , id);
	            elem.find('label').attr('for', id);
	            elem.find('input').attr('name', name);

	            if(label != "" || label != null){
	            	elem.find('.radio-label').append(label);
	            }
        	}
		};
	});
	app.directive("uiCheckbox", function(){
		return {
			restrict: 'E',
			templateUrl: 'modules/uikit/templates/checkbox.html',
			link: function(scope, elem, attrs) {
	            //console.log(attrs);
	            var id = attrs.checkboxId;
	            var name = attrs.checkboxName;
	            var label = attrs.checkboxLabel;
	            elem.find('input').attr('id' , id);
	            elem.find('label').attr('for', id);
	            elem.find('input').attr('name', name);

	            if(label != "" || label != null){
	            	elem.find('.radio-label').append(label);
	            }
        	}
		};
	});
	
})();