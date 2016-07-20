//obj merge
window.mergeObj = function(a, b){
  for (var attrname in b) { a[attrname] = b[attrname]; }
  return a;
}
//obj clone
window.cloneObj = function(a){
  return JSON.parse(JSON.stringify(a));
}
//now
window.now = function(){
  var now = new Date();
  now = Math.round(now.getTime() / 1000);
  return now;
}


// public/core.js
var app = angular.module('app', [  
  'ui.router',
  'ngCookies',
  'ngAnimate', 
  'ngSanitize',
  'angular-md5',
  'pascalprecht.translate',
  'ngMaterial',
  '720kb.tooltips'
  ])

.config(['$compileProvider', function(/*$compileProvider*/) {
    // Wait angular.js#9515 fix to disable debug info.
    // https://github.com/angular/angular.js/issues/9515
    //$compileProvider.debugInfoEnabled(false); // Remove debug info (angularJS >= 1.3)
}])

.config(function(tooltipsConfigProvider) {
    tooltipsConfigProvider.options({
        size: 'small',
        side: 'bottom'
    })
})

.config(function($mdThemingProvider) {})
.run(function($rootScope) {
    $rootScope.$on('$stateChangeSuccess',function(){
    $("html, body").animate({ scrollTop: 0 }, 200);
})



  $rootScope.online = navigator.onLine ? 'online' : 'offline';
    
  $rootScope.$apply();
 
  if (window.addEventListener) {
    window.addEventListener("online", function() {
      $rootScope.online = "online";
      $rootScope.$apply();
    }, true);
    window.addEventListener("offline", function() {
      $rootScope.online = "offline";
      $rootScope.$apply();
    }, true);
  } else {
    document.body.ononline = function() {
      $rootScope.online = "online";
      $rootScope.$apply();
    };
    document.body.onoffline = function() {
      $rootScope.online = "offline";
      $rootScope.$apply();
    };
  }
})
.config(function($translateProvider) {
      $translateProvider.useStaticFilesLoader({
        prefix: 'language/',
        suffix: '.json'
      });
      $translateProvider.preferredLanguage("en");
      $translateProvider.fallbackLanguage("en");
})

.config(function($stateProvider, 
  $urlRouterProvider,
                    
                    $controllerProvider,
                    $compileProvider,
                    $filterProvider,
                    $provide
                    
                    ) {



app.register = {
  controller : $controllerProvider.register,
  directive  : $compileProvider.directive,
  filter     : $filterProvider.register,
  factory    : $provide.factory,
  service    : $provide.service
};

$stateProvider
.state('main', {
  url: '/main',
  views: {
    'main': {
      templateUrl: 'modules/main/template.html',

      resolve:{
        
      }
    }
 }
});

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main');

  });

  // Below is the code to allow cross domain request from web server through angular.js
  app.config(['$httpProvider', function($httpProvider) {
    
    $httpProvider.defaults.useXDomain = true;
     $httpProvider.interceptors.push('tokenInterceptor');
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]);