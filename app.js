var app = angular.module('app', []);

app.controller('appController', function($scope, $http) {
  /**
   * Defaults
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = null;
  $scope.fontSize = 18;
  $scope.fontWeight = 400;
  $scope.backgroundColor = '#fff';
  $scope.WCAGlevel = 'AA';
  $scope.colorCategories = [
  { pass: true, hex: '#16A085', rgb: '', name: 'green-drk', className: 'bg-1' },
  { pass: true, hex: '#2ECC71', rgb: '', name: 'green-lt', className: 'bg-2' },
  { pass: true, hex: '#3498DB', rgb: '', name: 'blue', className: 'bg-3' },
  { pass: true, hex: '#9B59B6', rgb: '', name: 'purple', className: 'bg-4' },
  { pass: true, hex: '#34495E', rgb: '', name: 'black', className: 'bg-5' },
  { pass: true, hex: '#F2CA27', rgb: '', name: 'yellow', className: 'bg-6' },
  { pass: true, hex: '#E67E22', rgb: '', name: 'orange', className: 'bg-7' },
  { pass: true, hex: '#E74C3C', rgb: '', name: 'red', className: 'bg-8', colorVariations: [
    { pass: true, hex: '#D24D57', rgb: '', name: 'chestnut-rose', className: 'chestnut-rose' },
    { pass: true, hex: '#F22613', rgb: '', name: 'pomegranate', className: 'pomegranate' },
    { pass: true, hex: '#FF0000', rgb: '', name: 'red', className: 'red' },
    { pass: true, hex: '#D91E18', rgb: '', name: 'thunderbird', className: 'thunderbird' },
    { pass: true, hex: '#96281B', rgb: '', name: 'old-brick', className: 'old-brick' },
    { pass: true, hex: '#EF4836', rgb: '', name: 'flamingo', className: 'flamingo' },
    { pass: true, hex: '#D64541', rgb: '', name: 'valencia', className: 'valencia' },
    { pass: true, hex: '#C0392B', rgb: '', name: 'tall-poppy', className: 'tall-poppy' },
    { pass: true, hex: '#CF000F', rgb: '', name: 'monza', className: 'monza' },
    { pass: true, hex: '#E74C3C', rgb: '', name: 'cinnabar', className: 'cinnabar' }
  ]
  },
  { pass: true, hex: '#ECF0F1', rgb: '', name: 'gray-lt', className: 'bg-9' },
  { pass: true, hex: '#95A5A6', rgb: '', name: 'gray-drk', className: 'bg-10' }
  ];

  $scope.reds = [
  { pass: true, hex: '#D24D57', rgb: '', name: 'chestnut-rose', className: 'chestnut-rose' },
  { pass: true, hex: '#F22613', rgb: '', name: 'pomegranate', className: 'pomegranate' },
  { pass: true, hex: '#FF0000', rgb: '', name: 'red', className: 'red' },
  { pass: true, hex: '#D91E18', rgb: '', name: 'thunderbird', className: 'thunderbird' },
  { pass: true, hex: '#96281B', rgb: '', name: 'old-brick', className: 'old-brick' },
  { pass: true, hex: '#EF4836', rgb: '', name: 'flamingo', className: 'flamingo' },
  { pass: true, hex: '#D64541', rgb: '', name: 'valencia', className: 'valencia' },
  { pass: true, hex: '#C0392B', rgb: '', name: 'tall-poppy', className: 'tall-poppy' },
  { pass: true, hex: '#CF000F', rgb: '', name: 'monza', className: 'monza' },
  { pass: true, hex: '#E74C3C', rgb: '', name: 'cinnabar', className: 'cinnabar' }
  ];


  /**
   * Change in WCAG Level needs a recalc (after user clicks on different ratio button)
   */
  $scope.getRatio = function() {
    $scope.getCurrentRatio();
    $scope.getPassingColors();
  };

  /**
   * Calculate Current Ratio based on user inputs for font size and WCGAG Level AA or AAA
   */
  $scope.getCurrentRatio = function() {
    var currentFS = $scope.fontSize;
    var currentLevel = $scope.WCAGlevel;
    if(currentFS < 18){
      currentLevel === 'AA' ? $scope.currentRatio = 4.5 : $scope.currentRatio = 7.0;
    }else{
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }
    //console.log('the current ratio is: ', $scope.currentRatio);
  };

  /**
   * Calculate Passing Colors to user Current Ratio by comparing set foreground colors and user's background color
   * @param {string} accpets two string values to calculate ratio. Strings can be either hex or rgb.
   */
  $scope.getPassingColors = function() {
    _.each($scope.colorCategories, function(color) {
      var ratio = contrastRatio(color.hex, $scope.backgroundColor);
      ratio >= $scope.currentRatio ? color.pass = true : color.pass = false;
      color.pass === true ? color.currentRatio = ratio : undefined;
    })
  };

  /**
   * When user clicks on color, make user content that color
   */
  $scope.setTextColor = function(color) {
    $scope.currentColor = color;
    console.log($scope.currentColor);
  };


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
/*
 *
 * Change in Font Size needs a recalc (after updates input and hits enter)
  $scope.getRatio_onEnter = function(keyEvent) {
    if(keyEvent.keyCode === 13){
      $scope.getCurrentRatio();
      $scope.getPassingColors();
    }
  };

  */
