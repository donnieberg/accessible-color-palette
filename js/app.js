var app = angular.module('app', ['duScroll', 'colorpicker.module']);

//=============================================
// DIRECTIVES
//============================================
app.directive('slideOutLeft', function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/slideOutLeft.html',
    replace: true,
    transclude: true,
    link: function(scope, element, attrs) {
    }
  };
});

//=============================================
// CONTROLLER
//============================================
app.controller('appController', function($scope, $http, $document, $timeout, appFactory) {
  /**
   * Model Data
   */
  $scope.appFactory = appFactory;
  $scope.allFontFamilies = $scope.appFactory.fonts;
  $scope.accessibilityGrades = $scope.appFactory.accessibilityGrades;
  $scope.textSizes = $scope.appFactory.textSizes;
  $scope.fontWeights = $scope.appFactory.fontWeights;

  /**
   * Default States when App Loads
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = $scope.allFontFamilies[0];
  $scope.fontSize = 22;
  $scope.fontWeight = 400;
  $scope.backgroundColor = { hex: '#ffffff'};
  $scope.currentTextColor = { hex: '#000', rgb: { r: 0, g: 0, b: 0}, currentRatio: 21, pass: true };
  $scope.WCAGlevel = 'AA';
  $scope.isIntroActive = true;

  //==============================================================

  /**
   * When user clicks on color variation, make user text that color
   */
  $scope.setTextColor = function(color) {
    $scope.currentTextColor = color;
    $scope.animateToolbar = true;
    $timeout(function() {
      $scope.animateToolbar = false;
    }, 1000);
  };

  /**
   * User can select tile to make that the background color
   */
  $scope.setBackgroundColor = function(color) {
    $scope.backgroundColor = color;
  };

  /**
   * User clicks on color to set as Current Color and generate passing colors off of that
   */
  $scope.setColor = function(event, color) {
    $scope.currentCopiedColor = null;
    if(event.metaKey){
      $scope.setBackgroundColor(color);
    }else{
      $scope.setTextColor(color);
      var currentColor = tinycolor(color.hex);
      color.rgb = currentColor.toRgb();
    }
    $scope.getPassingColors();
  };

  //==============================================================

  /**
   * Scroll Animation between step 1 to step 2
   * @thing - element to scroll to
   * @speed - duration of animation speed
   */
  $scope.slideToElement = function(thing, speed) {
    var offset = 0;
    var speed = speed;
    var thing = angular.element(document.getElementById(thing));
    if(!$scope.isSection2Active){
      $timeout(function() {
        $document.scrollToElementAnimated(thing, offset, speed);
      }, 200);
    }else{
      $document.scrollToElementAnimated(thing, offset, speed);
    }
  };

  /**
   * Show/hide Instructions 1 and 2 Modals.
   * Only show if it's the users' first time to website using HTML5 Local Storage
   */
  $scope.showInstructions1 = function() {
    if (!localStorage['instructions1']) {
      localStorage['instructions1'] = 'yes';
      $scope.isInstructions1Active = true;
    }
  };
  $scope.hideInstructions1 = function() {
    $scope.isInstructions1Active = false;
  };
  $scope.showInstructions2 = function(color, colorValue) {
    $scope.isInstructions2Active = true;
    $scope.currentCopiedColor = color;
    $scope.currentCopiedColorValue = colorValue;
    var color = tinycolor(colorValue);
    if(color.isDark()){
      $scope.modalTextColor = 'text-white';
      $scope.modalBtnColor = 'btn-white';
    }else{
      $scope.modalTextColor = 'text-dark';
      $scope.modalBtnColor = 'btn-dark';
    }
  };
  $scope.hideInstructions2 = function() {
    $scope.isInstructions2Active = false;
  };

  /**
   * Activate Step 1 from Intro screen
   */
  $scope.activateStep1 = function() {
    $scope.isSection1Active = true;
    $timeout(function() {
      $scope.isIntroActive = false;
    }, 1000);
  };

  /**
   * Activate Section 2 Color Palette and Color Tiles using MixItUp() https://mixitup.kunkalabs.com/
   */
  $scope.activatePalette = function() {
    $scope.isSection2Active = true;
    $timeout(function() {
      $('#Container').mixItUp({
        layout: { display: 'table' }
      });
    }, 200);
  };


  /**
   * On Scroll, pin toolbar to top when picking colors from tiles
   */
  $document.on('scroll', function() {
    if( $('#section2').position().top >= $document.scrollTop() ){
      $scope.pinToolbar = false;
    }else{
      $scope.pinToolbar = true;
    }
    $scope.$apply();
  });

  /**
   * Show/hide the Filter by Color options below the Color Filter drop down 'button'
   */
  $scope.toggleColorFilters = function() {
    $scope.showColorFilters = !$scope.showColorFilters;
  };

  /**
   * Show/hide info left panel
   */
  $scope.toggleInfoPanel = function() {
    $scope.isLeftSlideOpen = !$scope.isLeftSlideOpen;
  };


  //=============================================
  // GENERATE COLOR TILES - uses Tiny Colors http://bgrins.github.io/TinyColor/
  //=============================================

  /**
   * Get all Flat UI Colors
   */
  var allFlatColors = [];
  _.each($scope.appFactory.colorCategories, function(color) {
    allFlatColors.push(color.flatUIcolors);
    allFlatColors = _.flatten(allFlatColors);
  });

  /**
   * Generate all tinycolors based off color categories
   */
  var allTinyColors = [];
  var tinyColors = [];
  _.each($scope.appFactory.colorCategories, function(color) {
    tinyColors = tinycolor(color.hex).monochromatic();
    var tinyColorsHex = _.map(tinyColors, function(col) {
      return { colorParent: color.name, pass: true, hex: col.toHexString(), rgb: '', name: '' }
    })
    allTinyColors.push(tinyColorsHex);
    allTinyColors = _.flatten(allTinyColors);
  });


  /**
   * Combine flatUI colors and generated tiny colors
   */
  $scope.allColors = _.union(allFlatColors, allTinyColors);



  //=============================================
  // COLOR CONTRAST LOGIC
  //=============================================

  /**
   * Get passing ratios of colors compared with current background color
   */
  $scope.getPassingColors = function() {
    _.each($scope.allColors, function(color) {
      var ratio = contrastRatio(color.hex, $scope.backgroundColor.hex);
      color.currentRatio = ratio;
      ratio >= $scope.currentRatio ? color.pass = true : color.pass = false;
    })
  };

  /**
   * Calculate Current Ratio based on user inputs for font size and WCGAG Level AA or AAA
   */
  $scope.getCurrentRatio = function() {
    var currentFS = $scope.fontSize;
    var currentLevel = $scope.WCAGlevel;
    var currentFW = $scope.fontWeight;
    if(currentFW >= 700 && currentFS >= 14){
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }else if(currentFS < 18){
      currentLevel === 'AA' ? $scope.currentRatio = 4.5 : $scope.currentRatio = 7.0;
    }else{
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }
    //console.log('the current ratio is: ', $scope.currentRatio);
  };


  //=============================================
  // VENDOR CODE
  //=============================================
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


  /**
   * Zero Clipboard plugin to copy to clipboard
   */
  var client = new ZeroClipboard( document.getElementById("copyHexValue") );
  var rgbValue = new ZeroClipboard( document.getElementById("copyRgbValue") );

});

//=============================================
// FACTORY (DATA)
//============================================
app.factory('appFactory', function() {
  return {
    colorCategories: [
      { hex: '#2ECC71', rgb: '46, 204, 113', name: 'green', colorSiblings: ['green', 'aquamarine', 'lightgreen', 'lime', 'limegreen', 'mediumseagreen', 'mediumspringgreen', 'olivedrab', 'palegreen', 'seagreen', 'springgreen', 'yellowgreen'], flatUIcolors: [
        { colorParent: 'green', pass: true, hex: '#4ECDC4', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#A2DED0', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#87D37C', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#90C695', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#26A65B', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#03C9A9', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#68C3A3', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#65C6BB', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#1BBC9B', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#1BA39C', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#66CC99', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#36D7B7', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#C8F7C5', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#86E2D5', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#2ECC71', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#16A085', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#3FC380', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#019875', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#03A678', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#4DAF7C', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#2ABB9B', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#00B16A', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#1E824C', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#049372', rgb: '', name: '' },
        { colorParent: 'green', pass: true, hex: '#26C281', rgb: '', name: '' }
        ]
      },
      { hex: '#3498DB', rgb: '52, 152, 219', name: 'blue', colorSiblings: ['blue', 'aqua', 'cornflowerblue', 'darkblue', 'darkcyan', 'darkslateblue', 'darkturquoise', 'deepskyblue', 'dodgerblue', 'lightblue', 'lightcyan'], flatUIcolors: [
        { colorParent: 'blue', pass: true, hex: '#E4F1FE', rgb: '', name: 'alice-blue' },
        { colorParent: 'blue', pass: true, hex: '#4183D7', rgb: '', name: 'royal-blue' },
        { colorParent: 'blue', pass: true, hex: '#59ABE3', rgb: '', name: 'picton-blue' },
        { colorParent: 'blue', pass: true, hex: '#81CFE0', rgb: '', name: 'spray' },
        { colorParent: 'blue', pass: true, hex: '#52B3D9', rgb: '', name: 'shakespeare' },
        { colorParent: 'blue', pass: true, hex: '#C5EFF7', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#22A7F0', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#3498DB', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#2C3E50', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#19B5FE', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#336E7B', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#22313F', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#6BB9F0', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#1E8BC3', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#3A539B', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#34495E', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#67809F', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#2574A9', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#1F3A93', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#89C4F4', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#4B77BE', rgb: '', name: '' },
        { colorParent: 'blue', pass: true, hex: '#5C97BF', rgb: '', name: '' }
        ]
      },
      { hex: '#9B59B6', rgb: '155, 89, 182', name: 'purple', colorSiblings: ['purple', 'blueviolet', 'darkorchid', 'darkviolet', 'mediumpurple', 'plum'], flatUIcolors: [
        { colorParent: 'purple', pass: true, hex: '#DCC6E0', rgb: '', name: 'snuff' },
        { colorParent: 'purple', pass: true, hex: '#663399', rgb: '', name: 'rebecca-purple' },
        { colorParent: 'purple', pass: true, hex: '#674172', rgb: '', name: 'honey-flower' },
        { colorParent: 'purple', pass: true, hex: '#AEA8D3', rgb: '', name: 'wistful' },
        { colorParent: 'purple', pass: true, hex: '#913D88', rgb: '', name: 'plum' },
        { colorParent: 'purple', pass: true, hex: '#9A12B3', rgb: '', name: 'seance' },
        { colorParent: 'purple', pass: true, hex: '#BF55EC', rgb: '', name: 'medium-purple' },
        { colorParent: 'purple', pass: true, hex: '#BE90D4', rgb: '', name: 'light-wisteria' },
        { colorParent: 'purple', pass: true, hex: '#8E44AD', rgb: '', name: 'studio' },
        { colorParent: 'purple', pass: true, hex: '#9B59B6', rgb: '', name: 'wisteria' }
        ]
      },
      { hex: '#D2527F', rgb: '', name: 'pink', colorSiblings: ['darkmagenta', 'fuchsia'], flatUIcolors: [
        { colorParent: 'pink', pass: true, hex: '#DB0A5B', rgb: '', name: 'rassmatazz' },
        { colorParent: 'pink', pass: true, hex: '#FFECDB', rgb: '', name: 'derby' },
        { colorParent: 'pink', pass: true, hex: '#F64747', rgb: '', name: 'sunset-orange' },
        { colorParent: 'pink', pass: true, hex: '#F1A9A0', rgb: '', name: 'wax-flower' },
        { colorParent: 'pink', pass: true, hex: '#D2527F', rgb: '', name: 'cabaret' },
        { colorParent: 'pink', pass: true, hex: '#E08283', rgb: '', name: 'newYork-pink' },
        { colorParent: 'pink', pass: true, hex: '#F62459', rgb: '', name: 'radical-red' },
        { colorParent: 'pink', pass: true, hex: '#E26A6A', rgb: '', name: 'sunglo' }
        ]
      },
      { hex: '#34495E', rgb: '52, 73, 94', name: 'gray', colorSiblings: ['black', 'darkgray', 'dimgray', 'gray', 'slategray'], flatUIcolors: [
        { colorParent: 'gray', pass: true, hex: '#000000', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#FFFFFF', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#ECECEC', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#6C7A89', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#D2D7D3', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#EEEEEE', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#BDC3C7', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#ECF0F1', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#95A5A6', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#DADFE1', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#ABB7B7', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#F2F1EF', rgb: '', name: '' },
        { colorParent: 'gray', pass: true, hex: '#BFBFBF', rgb: '', name: '' }
        ]
      },
      { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', colorSiblings: ['yellow', 'darkgoldenrod', 'gold', 'goldenrod', 'lemonchiffon'], flatUIcolors: [
        { colorParent: 'yellow', pass: true, hex: '#F5D76E', rgb: '', name: '' },
        { colorParent: 'yellow', pass: true, hex: '#F7CA18', rgb: '', name: '' },
        { colorParent: 'yellow', pass: true, hex: '#F4D03F', rgb: '', name: '' }
        ]
      },
      { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', colorSiblings: ['orange', 'coral', 'darkorange', 'lightsalmon', 'orangered', 'sandybrown'], flatUIcolors: [
        { colorParent: 'orange', pass: true, hex: '#FDE3A7', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F89406', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#EB9532', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#E87E04', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F4B350', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F2784B', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#EB974E', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F5AB35', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#D35400', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F39C12', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F9690E', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F9BF3B', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#F27935', rgb: '', name: '' },
        { colorParent: 'orange', pass: true, hex: '#E67E22', rgb: '', name: '' }
        ]
      },
      { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', colorSiblings: ['red', 'crimson', 'darkred', 'firebrick', 'maroon', 'tomato'], flatUIcolors: [
        { colorParent: 'red', pass: true, hex: '#D24D57', rgb: '', name: 'chestnut-rose'},
        { colorParent: 'red', pass: true, hex: '#F22613', rgb: '', name: 'pomegranate'},
        { colorParent: 'red', pass: true, hex: '#FF0000', rgb: '', name: 'red'},
        { colorParent: 'red', pass: true, hex: '#D91E18', rgb: '', name: 'thunderbird'},
        { colorParent: 'red', pass: true, hex: '#96281B', rgb: '', name: 'old-brick'},
        { colorParent: 'red', pass: true, hex: '#EF4836', rgb: '', name: 'flamingo'},
        { colorParent: 'red', pass: true, hex: '#D64541', rgb: '', name: 'valencia'},
        { colorParent: 'red', pass: true, hex: '#C0392B', rgb: '', name: 'tall-poppy'},
        { colorParent: 'red', pass: true, hex: '#CF000F', rgb: '', name: 'monza'},
        { colorParent: 'red', pass: true, hex: '#E74C3C', rgb: '', name: 'cinnabar'}
        ]
      },
    ],
    flatUIcolors: {
      reds: [
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
        ],
      pinks: [
        { pass: true, hex: '#DB0A5B', rgb: '', name: 'rassmatazz' },
        { pass: true, hex: '#FFECDB', rgb: '', name: 'derby' },
        { pass: true, hex: '#F64747', rgb: '', name: 'sunset-orange' },
        { pass: true, hex: '#F1A9A0', rgb: '', name: 'wax-flower' },
        { pass: true, hex: '#D2527F', rgb: '', name: 'cabaret' },
        { pass: true, hex: '#E08283', rgb: '', name: 'newYork-pink' },
        { pass: true, hex: '#F62459', rgb: '', name: 'radical-red' },
        { pass: true, hex: '#E26A6A', rgb: '', name: 'sunglo' }
      ],
      purples: [
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
      ],
      blues: [
        { pass: true, hex: '#E4F1FE', rgb: '', name: 'alice-blue' },
        { pass: true, hex: '#4183D7', rgb: '', name: 'royal-blue' },
        { pass: true, hex: '#59ABE3', rgb: '', name: 'picton-blue' },
        { pass: true, hex: '#81CFE0', rgb: '', name: 'spray' },
        { pass: true, hex: '#52B3D9', rgb: '', name: 'shakespeare' },
        { pass: true, hex: '#C5EFF7', rgb: '', name: '' },
        { pass: true, hex: '#22A7F0', rgb: '', name: '' },
        { pass: true, hex: '#3498DB', rgb: '', name: '' },
        { pass: true, hex: '#2C3E50', rgb: '', name: '' },
        { pass: true, hex: '#19B5FE', rgb: '', name: '' },
        { pass: true, hex: '#336E7B', rgb: '', name: '' },
        { pass: true, hex: '#22313F', rgb: '', name: '' },
        { pass: true, hex: '#6BB9F0', rgb: '', name: '' },
        { pass: true, hex: '#1E8BC3', rgb: '', name: '' },
        { pass: true, hex: '#3A539B', rgb: '', name: '' },
        { pass: true, hex: '#34495E', rgb: '', name: '' },
        { pass: true, hex: '#67809F', rgb: '', name: '' },
        { pass: true, hex: '#2574A9', rgb: '', name: '' },
        { pass: true, hex: '#1F3A93', rgb: '', name: '' },
        { pass: true, hex: '#89C4F4', rgb: '', name: '' },
        { pass: true, hex: '#4B77BE', rgb: '', name: '' },
        { pass: true, hex: '#5C97BF', rgb: '', name: '' }
      ],
      greens: [
        { pass: true, hex: '#4ECDC4', rgb: '', name: '' },
        { pass: true, hex: '#A2DED0', rgb: '', name: '' },
        { pass: true, hex: '#87D37C', rgb: '', name: '' },
        { pass: true, hex: '#90C695', rgb: '', name: '' },
        { pass: true, hex: '#26A65B', rgb: '', name: '' },
        { pass: true, hex: '#03C9A9', rgb: '', name: '' },
        { pass: true, hex: '#68C3A3', rgb: '', name: '' },
        { pass: true, hex: '#65C6BB', rgb: '', name: '' },
        { pass: true, hex: '#1BBC9B', rgb: '', name: '' },
        { pass: true, hex: '#1BA39C', rgb: '', name: '' },
        { pass: true, hex: '#66CC99', rgb: '', name: '' },
        { pass: true, hex: '#36D7B7', rgb: '', name: '' },
        { pass: true, hex: '#C8F7C5', rgb: '', name: '' },
        { pass: true, hex: '#86E2D5', rgb: '', name: '' },
        { pass: true, hex: '#2ECC71', rgb: '', name: '' },
        { pass: true, hex: '#16A085', rgb: '', name: '' },
        { pass: true, hex: '#3FC380', rgb: '', name: '' },
        { pass: true, hex: '#019875', rgb: '', name: '' },
        { pass: true, hex: '#03A678', rgb: '', name: '' },
        { pass: true, hex: '#4DAF7C', rgb: '', name: '' },
        { pass: true, hex: '#2ABB9B', rgb: '', name: '' },
        { pass: true, hex: '#00B16A', rgb: '', name: '' },
        { pass: true, hex: '#1E824C', rgb: '', name: '' },
        { pass: true, hex: '#049372', rgb: '', name: '' },
        { pass: true, hex: '#26C281', rgb: '', name: '' }
      ],
      yellows: [
        { pass: true, hex: '#F5D76E', rgb: '', name: '' },
        { pass: true, hex: '#F7CA18', rgb: '', name: '' },
        { pass: true, hex: '#F4D03F', rgb: '', name: '' }
      ],
      oranges: [
        { pass: true, hex: '#FDE3A7', rgb: '', name: '' },
        { pass: true, hex: '#F89406', rgb: '', name: '' },
        { pass: true, hex: '#EB9532', rgb: '', name: '' },
        { pass: true, hex: '#E87E04', rgb: '', name: '' },
        { pass: true, hex: '#F4B350', rgb: '', name: '' },
        { pass: true, hex: '#F2784B', rgb: '', name: '' },
        { pass: true, hex: '#EB974E', rgb: '', name: '' },
        { pass: true, hex: '#F5AB35', rgb: '', name: '' },
        { pass: true, hex: '#D35400', rgb: '', name: '' },
        { pass: true, hex: '#F39C12', rgb: '', name: '' },
        { pass: true, hex: '#F9690E', rgb: '', name: '' },
        { pass: true, hex: '#F9BF3B', rgb: '', name: '' },
        { pass: true, hex: '#F27935', rgb: '', name: '' },
        { pass: true, hex: '#E67E22', rgb: '', name: '' }
      ],
      grays: [
        { pass: true, hex: '#ECECEC', rgb: '', name: '' },
        { pass: true, hex: '#6C7A89', rgb: '', name: '' },
        { pass: true, hex: '#D2D7D3', rgb: '', name: '' },
        { pass: true, hex: '#EEEEEE', rgb: '', name: '' },
        { pass: true, hex: '#BDC3C7', rgb: '', name: '' },
        { pass: true, hex: '#ECF0F1', rgb: '', name: '' },
        { pass: true, hex: '#95A5A6', rgb: '', name: '' },
        { pass: true, hex: '#DADFE1', rgb: '', name: '' },
        { pass: true, hex: '#ABB7B7', rgb: '', name: '' },
        { pass: true, hex: '#F2F1EF', rgb: '', name: '' },
        { pass: true, hex: '#BFBFBF', rgb: '', name: '' }
      ]
    },
    fonts: [
      { type: 'sans-serif', alias: 'Arial', name: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Black', name: '"Arial Black", "Arial Bold", Gadget, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Narrow', name: '"Arial Narrow", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Rounded MT Bold', name: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Avant Garde', name: '"Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif' },
      { type: 'sans-serif', alias: 'Calibri', name: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Candara', name: 'Candara, Calibri, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Century Gothic', name: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' },
      { type: 'sans-serif', alias: 'Franklin Gothic Medium', name: '"Franklin Gothic Medium", "Franklin Gothic", "ITC Franklin Gothic", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Futura', name: 'Futura, "Trebuchet MS", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Geneva', name: 'Geneva, Tahoma, Verdana, sans-serif' },
      { type: 'sans-serif', alias: 'Gill Sans', name: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
      { type: 'sans-serif', alias: 'Helvetica', name: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Impact', name: 'Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans serif' },
      { type: 'sans-serif', alias: 'Lucida Grande', name: '"Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif' },
      { type: 'sans-serif', alias: 'Optima', name: 'Optima, Segoe, "Segoe UI", Candara, Calibri, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Segoe UI', name: '"Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Tahoma', name: 'Tahoma, Verdana, Segoe, sans-serif' },
      { type: 'sans-serif', alias: 'Trebuchet MS', name: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif' },
      { type: 'sans-serif', alias: 'Verdana', name: 'Verdana, Geneva, sans-serif' },
      { type: 'serif', alias: 'Baskerville', name: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Big Caslon', name: '"Big Caslon", "Book Antiqua", "Palatino Linotype", Georgia, serif' },
      { type: 'serif', alias: 'Bodoni MT', name: '"Bodoni MT", Didot, "Didot LT STD", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Book Antiqua', name: '"Book Antiqua", Palatino, "Palatino Linotype", "Palatino LT STD", Georgia, serif' },
      { type: 'serif', alias: 'Calisto MT', name: '"Calisto MT", "Bookman Old Style", Bookman, "Goudy Old Style", Garamond, "Hoefler Text", "Bitstream Charter", Georgia, serif' },
      { type: 'serif', alias: 'Cambria', name: 'Cambria, Georgia, serif' },
      { type: 'serif', alias: 'Didot', name: 'Didot, "Didot LT STD", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Garamond', name: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
      { type: 'serif', alias: 'Georgia', name: 'Georgia, Times, "Times New Roman", serif' },
      { type: 'serif', alias: 'Goudy Old Style', name: '"Goudy Old Style", Garamond, "Big Caslon", "Times New Roman", serif' },
      { type: 'serif', alias: 'Hoefler Text', name: '"Hoefler Text", "Baskerville old face", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Lucida Bright', name: '"Lucida Bright", Georgia, serif' },
      { type: 'serif', alias: 'Palatino', name: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif' },
      { type: 'serif', alias: 'Perpetua', name: 'Perpetua, Baskerville, "Big Caslon", "Palatino Linotype", Palatino, "URW Palladio L", "Nimbus Roman No9 L", serif' },
      { type: 'serif', alias: 'Rockwell', name: 'Rockwell, "Courier Bold", Courier, Georgia, Times, "Times New Roman", serif' },
      { type: 'serif', alias: 'Rockwell Extra Bold', name: '"Rockwell Extra Bold", "Rockwell Bold", monospace' },
      { type: 'serif', alias: 'TimesNewRoman', name: 'TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif' },
      { type: 'monospaced', alias: 'Andale Mono', name: '"Andale Mono", AndaleMono, monospace' },
      { type: 'monospaced', alias: 'Consolas', name: 'Consolas, monaco, monospace' },
      { type: 'monospaced', alias: 'Courier New', name: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace' },
      { type: 'monospaced', alias: 'Lucida Console', name: '"Lucida Console", "Lucida Sans Typewriter", Monaco, "Bitstream Vera Sans Mono", monospace' },
      { type: 'monospaced', alias: 'Lucida Sans Typewriter', name: '"Lucida Sans Typewriter", "Lucida Console", Monaco, "Bitstream Vera Sans Mono", monospace' },
      { type: 'monospaced', alias: 'Monaco', name: 'Monaco, Consolas, "Lucida Console", monospace' },
      { type: 'fantasy', alias: 'Copperplate', name: 'Copperplate, "Copperplate Gothic Light", fantasy' },
      { type: 'fantasy', alias: 'Papyrus', name: 'Papyrus, fantasy' },
      { type: 'script',  alias: 'Brush Script MT', name: '"Brush Script MT", cursive' }
    ],
    accessibilityGrades: [ 'AA', 'AAA' ],
    textSizes: [ 'small text', 'large text' ],
    fontWeights: [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ]
  }
});
