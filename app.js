var app = angular.module('app', []);

app.controller('appController', function($scope, $http) {
  /**
   * Defaults
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = null;
  $scope.fontSize = 28;
  $scope.fontWeight = 400;
  $scope.backgroundColor = '#FFFFFF';
  $scope.WCAGlevel = 'AA';


  $scope.colorCategories = [
  //{ hex: '#16A085', rgb: '22, 160, 133', name: 'green-drk', colorVariations: []  },
  { hex: '#2ECC71', rgb: '46, 204, 113', name: 'green-lt', colorVariations: []  },
  { hex: '#3498DB', rgb: '52, 152, 219', name: 'blue', colorVariations: []  },
  { hex: '#9B59B6', rgb: '155, 89, 182', name: 'purple', colorVariations: [] },
  { hex: '#34495E', rgb: '52, 73, 94', name: 'black', colorVariations: []  },
  { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', colorVariations: []  },
  { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', colorVariations: [] },
  { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', colorVariations: [] },
  { hex: '#95A5A6', rgb: '149, 165, 166', name: 'gray-drk', colorVariations: []  }
  ];

  // TEST Hard Coded Colors = might use these later
  var reds = [
    { pass: true, hex: '#D24D57', rgb: '', name: 'chestnut-rose'},
    { pass: true, hex: '#F22613', rgb: '', name: 'pomegranate'},
    { pass: true, hex: '#FF0000', rgb: '', name: 'red'},
    { pass: true, hex: '#D91E18', rgb: '', name: 'thunderbird'},
    { pass: true, hex: '#96281B', rgb: '', name: 'old-brick'},
    { pass: true, hex: '#EF4836', rgb: '', name: 'flamingo'},
    { pass: true, hex: '#D64541', rgb: '', name: 'valencia'},
    { pass: true, hex: '#C0392B', rgb: '', name: 'tall-poppy'},
    { pass: true, hex: '#CF000F', rgb: '', name: 'monza'},
    { pass: true, hex: '#E74C3C', rgb: '', name: 'cinnabar'}
  ];
  var purples = [
    { pass: true, hex: '#DCC6E0', rgb: '', name: 'snuff' },
    { pass: true, hex: '#663399', rgb: '', name: 'rebecca-purple' },
    { pass: true, hex: '#674172', rgb: '', name: 'honey-flower' },
    { pass: true, hex: '#AEA8D3', rgb: '', name: 'wistful' },
    { pass: true, hex: '#913D88', rgb: '', name: 'plum' },
    { pass: true, hex: '#9A12B3', rgb: '', name: 'seance' },
    { pass: true, hex: '#BF55EC', rgb: '', name: 'medium-purple' },
    { pass: true, hex: '#BE90D4', rgb: '', name: 'light-wisteria' },
    { pass: true, hex: '#8E44AD', rgb: '', name: 'studio' },
    { pass: true, hex: '#9B59B6', rgb: '', name: 'wisteria' }
  ];


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
    console.log('the current ratio is: ', $scope.currentRatio);
  };

  /**
   * When user clicks on color category, get color variations that pass the current ratio
   * @param {object} current color selected by user
   */
  $scope.selectColorCategory = function(color) {
    $scope.currentColor = color;
    $scope.getColorVariations();
    $scope.getPassingColors();
  };

  /**
   * Calculate Passing Colors to user Current Ratio by comparing set foreground colors and user's background color
   */
  $scope.getPassingColors = function() {
    _.each($scope.currentColor.colorVariations, function(color) {
      var ratio = contrastRatio(color.hex, $scope.backgroundColor);
      color.currentRatio = ratio;
      ratio >= $scope.currentRatio ? color.pass = true : color.pass = false;
    })
    console.log('the current color variations are: ', $scope.currentColor.colorVariations);
  };

  var changeShade = function(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  };

  $scope.getColorVariations = function() {
    $scope.currentColor.colorVariations = [];
    var darkestShade = changeShade($scope.currentColor.hex, -30);
    var percentage = 10;
    for(var i=0; i<30; i++){
      percentage += 5;
      var newShade = changeShade(darkestShade, percentage);
      $scope.currentColor.colorVariations.push({ hex: newShade });
    }
  }

  //$scope.getColorVariations = function() {
  //  $scope.currentColor.colorVariations = [];
  //  var strVariations = $scope.currentColor.rgb.split(",");
  //  var intVariations = _.map(strVariations, function(num) {
  //    return parseInt(num);
  //  });
  //  var r = intVariations[0]%256;
  //  var g = intVariations[1]%256;
  //  var b = intVariations[2]%256;
  //  for(var i=0;i<10;i++){
  //    r+=5;
  //    g+=5;
  //    b+=5;
  //    $scope.currentColor.colorVariations.push({ pass: true, currentRatio: null, rgb: "rgb("+r+","+g+","+b+")"});
  //  }
  //  //console.log('the current color variations are: ', $scope.currentColor.colorVariations);
  //};


  /**
   * When user clicks on color variation, make user text that color
   */
  $scope.setTextColor = function(color) {
    $scope.currentTextColor = color;
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


