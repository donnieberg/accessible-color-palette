var app = angular.module('app', []);

app.controller('appController', function($scope, $http) {

  /**
   * Calculate Ratio based on foreground and background
   * @param {string} accpets two string values to calculate ratio. Strings can be either hex or rgb.
   * @return contrast ratio
   */
  $scope.getContrastRatio = function(foreground, background) {
    return contrastRatio(foreground, background);
  };

  //WCAG Color Contrast Levels
  $scope.views = [
    { ratio: 1.0, label: "All Combinations"},
    { ratio: 4.5, label: "Normal Text (Level AA), 4.5:1"},
    { ratio: 3.0, label: "Large Text (Level AA), 3:1"},
    { ratio: 7.0, label: "Normal Text (Level AAA), 7:1"},
    { ratio: 4.5, label: "Large Text (Level AAA), 4.5:1"}
  ];

  //When User selects new WCAG Setting, change view accordingly
  $scope.changeView = function() {
    console.log($scope.view);
  };

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
   * Sources of awesomeness:
   * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
   * http://webaim.org/resources/contrastchecker/
   * http://stackoverflow.com/a/5624139
   * http://stackoverflow.com/a/9733420
   */

  /**
   * @param {String} color, RGB or hex value of a color
   * @returns {Object} an object with properties r,g,b
   */
  function rgb(color) {
    // convert RGB string to RGB object
    var result = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(color);
    if(result) return {
      r: result[1],
        g: result[2],
          b: result[3]
    }

    // convert hex string to RGB object
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = color.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    // get RGB values from hex
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) return {
      r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
    };

    // nothing! sad!
    return null;
  }

  /**
   * @param {Object} rgb, an object with properties r,g,b
   * @returns {Number} the luminance of this particular color
   */
  //
  function luminance(rgb) {
    // convert RGB to sRGB
    var sRGB = [rgb.r, rgb.g, rgb.b].map(function(value) {
      value /= 255;
      return (value <= 0.03928) ? (value / 12.92) : Math.pow( ((value+0.055)/1.055), 2.4);
    });
    // calculate luminance
    return (sRGB[0] * 0.2126) + (sRGB[1] * 0.7152) + (sRGB[2] * 0.0722);
  }

  /**
   * @param {String} foreground RGB or hex string for foreground color
   * @param {String} background RGB or hex string for background color
   * @returns {Number} the contrast between these two colors
   */
  function contrastRatio(foreground, background) {
    var L1 = luminance(rgb(foreground));
    var L2 = luminance(rgb(background));
    return (Math.round(((Math.max(L1, L2) + 0.05)/(Math.min(L1, L2) + 0.05))*100)/100);
  }

});
