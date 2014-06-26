var app = angular.module('app', []);

app.controller('appController', function($scope, $http) {

  $scope.contrastRatios = [];
  $scope.foregroundColors = [];
  $scope.backgroundColors = [];

  $scope.views = [
    { ratio: 1.0, label: "All Combinations"},
    { ratio: 4.5, label: "Normal Text (Level AA), 4.5:1"},
    { ratio: 3.0, label: "Large Text (Level AA), 3:1"},
    { ratio: 7.0, label: "Normal Text (Level AAA), 7:1"},
    { ratio: 4.5, label: "Large Text (Level AAA), 4.5:1"}
  ];

  // default view: show all
  $scope.view = $scope.views[0];

  /**
   * @param {Number} ratio the contrast ratio between two colors
   * @param {Object} view the current view mode in the tool
   * @returns {Boolean} whether or not the given contrast ratio 
   * passes the given view's required contrast ratio
   */
  $scope.passes = function(ratio, view) {
    return ratio >= view.ratio;
  }

  /**
   * Updates the arrays for foreground and background colors
   */
  $scope.updateColors = function() {
    if($scope.colors1) {
      $scope.foregroundColors = angular.fromJson($scope.colors1);
      $scope.backgroundColors = $scope.colors2 ? angular.fromJson($scope.colors2) : $scope.foregroundColors;
      $scope.updateContrastRatios();
    }
  }

  /** 
   * Updates the contrast ratio matrix
   */
  $scope.updateContrastRatios = function() {
    for(var i = 0; i < $scope.backgroundColors.length; i++) {
      for(var j = 0; j < $scope.foregroundColors.length; j++) {
        var foreground = $scope.foregroundColors[j];
        var background = $scope.backgroundColors[i];
        if(!$scope.contrastRatios[background]) $scope.contrastRatios[background] = [];
        $scope.contrastRatios[background][foreground] = contrastRatio(foreground, background);
      }
    }
  }

  // let's test if this works!
  // TODO: Remove this eventually or make it more dynamic. I took these values from the latest S1 variables repo.
  $scope.colors1 = '["#006eb3", "#be554b", "#e6b739", "#3c3d3e", "#696e71", "#afb5b9", "#44596c", "#FFFFFF", "#969899", "#aad0e9", "#6e7e8a", "#105b89", "#2b4257", "#686c70"]';
  $scope.colors2 = '["#2a94d6", "#be554b", "#e6b739", "#ff9c00", "#f0f1f2", "#FFFFFF", "#fafafa", "#344a5f", "#293f54", "#354452", "#e8eaeb", "#d68184", "#e4e5e7", "#f6e4e4", "#657889", "#278ac7", "#e9e9e9"]';
  $scope.updateColors();

});