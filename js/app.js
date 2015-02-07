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
  $scope.colorModels = $scope.appFactory.colorModels;
  $scope.accessibilityGrades = $scope.appFactory.accessibilityGrades;
  $scope.textSizes = $scope.appFactory.textSizes;
  $scope.fontWeights = $scope.appFactory.fontWeights;
  $scope.allColors = $scope.appFactory.allColors;


  /**
   * Default States when App Loads
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = $scope.allFontFamilies[0];
  $scope.fontSize = 22;
  $scope.fontWeight = 400;
  $scope.backgroundColor = { hex: '#ffffff'};
  $scope.currentTextColor = { hex: '#000', rgb: '0,0,0', currentRatio: 21, pass: true, textColor: 'text-white' };
  $scope.WCAGlevel = 'AA';
  $scope.isIntroActive = true;
  $scope.isSection1Active = false;
  $scope.infoPanelTabIndex = -1;
  $scope.colorModel = $scope.colorModels[0];


  //==============================================================
  /**
   * When user clicks on color variation, make user text that color
   * @color - the color the user selects
   */
  $scope.setTextColor = function(color) {
    $scope.currentTextColor = color;
    $scope.animateToolbar = true;
    $timeout(function() {
      $scope.animateToolbar = false;
    }, 1000);
  };

  $scope.preventDefault = function(event) {
    event.stopPropagation();
  };

  /**
   * Scroll Animation between step 1 to step 2
   * @thing - element to scroll to
   * @speed - duration of animation speed
   */
  $scope.slideToElement = function(thing, speed, offset) {
    var offset = offset;
    var speed = speed;
    var thing = angular.element(document.getElementById(thing));
    if($scope.isIntroActive){
      $timeout(function() {
        $document.scrollToElementAnimated(thing, offset, speed);
      }, 200);
    }else{
      $document.scrollToElement(thing, offset, speed);
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

  $scope.showInstructions2 = function(color) {
    $scope.currentCopiedColor = color;
    $scope.isInstructions2Active = true;
    $timeout(function() {
      $scope.fadeOutInstructions = true;
    }, 1800);
    $timeout($scope.hideInstructions2, 2500);
  };

  $scope.hideInstructions2 = function() {
    $scope.isInstructions2Active = false;
    $scope.fadeOutInstructions = false;
  };

  $scope.showInstructions3 = function(message) {
    if (!localStorage['instructions3']) {
      localStorage['instructions3'] = 'yes';
      $scope.isInstructions3Active = true;
      $scope.instructions3message = message;
    }
  };

  $scope.hideInstructions3 = function() {
    $scope.isInstructions3Active = false;
  };

  /**
   * Activate Step 1 from Intro screen & hide intro screen
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
        load: {
          filter: $scope.currentColorFilter
        },
        callbacks: {
          onMixEnd: function(state){
            $scope.slideToElement('section2', 0, 200);
            $scope.filteredColorsCount = state.totalShow;
            $scope.$apply(function () {
              $scope.filteredColorsCount < 8 ? $scope.lowOptions = true : $scope.lowOptions = false;
            });
            if(state.activeFilter !== '.mix'){
              $scope.currentColorFilter = state.activeFilter;
            }
          }
        }
      });
      $scope.pinToolbar = true;
    }, 0);
    //console.log('activatePalette() is working');
  };

  //Remove MixItUp from dom but leave visible nodes there
  $scope.destroyMixItUp = function() {
    //console.log('the currentColorFilter before destroy is: ', $scope.currentColorFilter);
    $('#Container').mixItUp('destroy');
  };


  /**
   * On Scroll, pin toolbar to top when picking colors from tiles
   */
  $document.on('scroll', function() {
    var userContentTop = $('#pinToolbar').position().top;
    if(userContentTop >= $document.scrollTop() ){
      $scope.pinToolbar = false;
    }else{
      $scope.pinToolbar = true;
    }
    $scope.$apply();
  });


  /**
   * Show/hide info left panel
   */
  $scope.toggleInfoPanel = function() {
    $scope.isLeftSlideOpen = !$scope.isLeftSlideOpen;
    if($scope.isLeftSlideOpen){
      $scope.infoPanelTabIndex = 0;
    }else{
      $scope.infoPanelTabIndex = -1;
    }
  };

  /*
   * Autofocus on input fields that should be modified when you have too few color options
   */
  $scope.updateWCAGlevel = function() {
    $scope.WCAGlevel = 'AA';
    $scope.getCurrentRatio();
    $scope.getPassingColors();
    $scope.activatePalette();
    $scope.showInstructions3('We lowered the WCAG level from AAA to AA. This lowers the contrast ratio requirement to 3.1 and allows more colors to meet it.');
  }
  $scope.updateTextInputs = function() {
    if($scope.updateFS){
      $scope.fontSize = 18;
      $scope.showInstructions3('We increased the font size to 18px which is considered "Large Text" by WCAG standards. Large Text has a lower contrast ratio requirement of 3.1 and allows more colors to meet it.');
    }
    if($scope.updateFW){
      $scope.fontWeight = 700;
      $scope.showInstructions3('We increased the font weight to 700. Text 14px and above and bold is considered "Large Text" by WCAG standards. Large Text has a lower contrast ratio requirement of 3.1 and allows more colors to meet it.');
    }
    $scope.getCurrentRatio();
    $scope.getPassingColors();
    $scope.activatePalette();
    $timeout(function() {
      $scope.updateFS = false;
      $scope.updateFW = false;
    }, 600)
  }


  //=============================================
  // COLOR CONTRAST LOGIC
  //=============================================

  /**
   * Get passing ratios of colors compared with current background color
   */
  $scope.getPassingColors = function() {
    $scope.passingColors = [];
    _.each($scope.allColors, function(color) {
      var ratio = contrastRatio(color.hex, $scope.backgroundColor.hex);
      color.currentRatio = ratio;
      if(color.currentRatio >= $scope.currentRatio){
        color.pass = true;
        $scope.passingColors.push(color);
      }else{
        color.pass = false;
      }
    })
    //console.log('getPassingColors() is working', $scope.passingColors.length);
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
      $scope.smallFontSize = false;
    }else if(currentFS < 18){
      currentLevel === 'AA' ? $scope.currentRatio = 4.5 : $scope.currentRatio = 7.0;
      $scope.smallFontSize = true;
    }else{
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }

    //Show tips at bottom to get more colors
    currentLevel === 'AAA' ? $scope.AAAlevel = true : $scope.AAAlevel = false;

    //Determine if current text color passes if the AA or AAA changes
    $scope.currentTextColor.currentRatio >= $scope.currentRatio ? $scope.currentTextColor.pass = true :  $scope.currentTextColor.pass = false;
    //console.log('the current ratio is: ', $scope.currentRatio);
  };


  /**
   * Dynamically set inline style of color tiles (using ng-style for IE)
   */
  $scope.setTileBgColor = function(item) {
    return { 'background-color' : item.hex }
  };
  $scope.setModalBgColor = function(item) {
    return { 'background-color' : 'rgba(' + item.rgb + ', .95)' }
  };



  //=============================================
  // VENDOR CODE
  //=============================================
  /**
   * Zero Clipboard plugin to copy to clipboard
   */
  new ZeroClipboard( document.getElementById("copyHexValue") );
  new ZeroClipboard( document.getElementById("copyRgbValue") );

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


  /*
  //Used to create ul of all colors
  var test = function() {
    var newArray = _.each($scope.allColors, function(color) {
      var currentColor = tinycolor(color.hex);
      var textColor = currentColor.isDark();
      if(textColor){
        color.textColor = 'text-white';
      }else{
        color.textColor = 'text-dark';
      }
    });
    return newArray;
  };
  $scope.testExecuted = test();
  */

});

//=============================================
// FACTORY (DATA)
//============================================
app.factory('appFactory', function() {
  return {
    colorCategories: [
      { hex: '#2ECC71', rgb: '46, 204, 113', name: 'green', textColor: 'text-white' },
      { hex: '#3498DB', rgb: '52, 152, 219', name: 'blue', textColor: 'text-white' },
      { hex: '#9B59B6', rgb: '155, 89, 182', name: 'purple', textColor: 'text-white' },
      { hex: '#D2527F', rgb: '210, 82, 127', name: 'pink', textColor: 'text-white' },
      { hex: '#34495E', rgb: '52, 73, 94', name: 'gray', textColor: 'text-white', },
      { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', textColor: 'text-dark' },
      { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', textColor: 'text-white' },
      { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', textColor: 'text-white' }
    ],
    allColors: [
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#C8F7C5","rgb":"200,247,197","name":"","textColor":"text-dark","hsl":{"h":116.4,"s":0.7575757575757579,"l":0.8705882352941177,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"palegreen","pass":true,"hex":"#98fb98","rgb":"152,251,152","textColor":"text-dark","hsl":{"h":120,"s":0.9252336448598131,"l":0.7901960784313725,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#98fb98","rgb":"152,251,152","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.9252336448598131,"l":0.7901960784313725,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#A2DED0","rgb":"162,222,208","name":"","textColor":"text-dark","hsl":{"h":166,"s":0.4761904761904763,"l":0.7529411764705882,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"lightgreen","pass":true,"hex":"#90ee90","rgb":"144,238,144","textColor":"text-dark","hsl":{"h":120,"s":0.734375,"l":0.7490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#90ee90","rgb":"144,238,144","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.734375,"l":0.7490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#7fffd4","rgb":"127,255,212","name":"","textColor":"text-dark","hsl":{"h":159.84375,"s":1,"l":0.7490196078431373,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"aquamarine","pass":true,"hex":"#7fffd4","rgb":"127,255,212","textColor":"text-dark","hsl":{"h":159.84375,"s":1,"l":0.7490196078431373,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#86E2D5","rgb":"134,226,213","name":"","textColor":"text-dark","hsl":{"h":171.52173913043478,"s":0.6133333333333332,"l":0.7058823529411764,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#90C695","rgb":"144,198,149","name":"","textColor":"text-dark","hsl":{"h":125.55555555555556,"s":0.3214285714285714,"l":0.6705882352941177,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#87D37C","rgb":"135,211,124","name":"","textColor":"text-dark","hsl":{"h":112.41379310344827,"s":0.49714285714285705,"l":0.6568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#7ed07e","rgb":"126,208,126","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.4659090909090909,"l":0.6549019607843137,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#6ad4b1","rgb":"106,212,177","name":"","textColor":"text-dark","hsl":{"h":160.188679245283,"s":0.5520833333333335,"l":0.6235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#76c376","rgb":"118,195,118","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.39086294416243644,"l":0.6137254901960785,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#baf73c","rgb":"186,247,60","name":"","textColor":"text-dark","hsl":{"h":79.57219251336899,"s":0.9211822660098525,"l":0.6019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#3cf73c","rgb":"60,247,60","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.9211822660098525,"l":0.6019607843137255,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#66CC99","rgb":"102,204,153","name":"","textColor":"text-dark","hsl":{"h":150,"s":0.5000000000000001,"l":0.6000000000000001,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#38f689","rgb":"56,246,137","name":"","textColor":"text-dark","hsl":{"h":145.57894736842107,"s":0.9134615384615387,"l":0.592156862745098,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#65C6BB","rgb":"101,198,187","name":"","textColor":"text-dark","hsl":{"h":173.1958762886598,"s":0.4597156398104265,"l":0.5862745098039216,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#68C3A3","rgb":"104,195,163","name":"","textColor":"text-dark","hsl":{"h":158.9010989010989,"s":0.43127962085308047,"l":0.5862745098039215,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#4ae08c","rgb":"74,224,140","name":"","textColor":"text-dark","hsl":{"h":146.4,"s":0.7075471698113207,"l":0.5843137254901961,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#4add8c","rgb":"74,221,140","name":"","textColor":"text-dark","hsl":{"h":146.9387755102041,"s":0.6837209302325582,"l":0.5784313725490197,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#abe338","rgb":"171,227,56","name":"","textColor":"text-dark","hsl":{"h":79.64912280701753,"s":0.7533039647577091,"l":0.5549019607843138,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4ECDC4","rgb":"78,205,196","name":"","textColor":"text-dark","hsl":{"h":175.748031496063,"s":0.5594713656387665,"l":0.5549019607843138,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#36D7B7","rgb":"54,215,183","name":"","textColor":"text-dark","hsl":{"h":168.07453416149067,"s":0.6680497925311204,"l":0.5274509803921569,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#65a665","rgb":"101,166,101","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.2674897119341564,"l":0.5235294117647059,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#3FC380","rgb":"63,195,128","name":"","textColor":"text-dark","hsl":{"h":149.54545454545453,"s":0.5238095238095237,"l":0.5058823529411764,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#00ff7f","rgb":"0,255,127","name":"","textColor":"text-dark","hsl":{"h":149.88235294117646,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#32cd32","rgb":"50,205,50","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.607843137254902,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"springgreen","pass":true,"hex":"#00ff7f","rgb":"0,255,127","textColor":"text-dark","hsl":{"h":149.88235294117646,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#00ff00","rgb":"0,255,0","name":"","textColor":"text-dark","hsl":{"h":120,"s":1,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"limegreen","pass":true,"hex":"#32cd32","rgb":"50,205,50","textColor":"text-dark","hsl":{"h":120,"s":0.607843137254902,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#9acd32","rgb":"154,205,50","name":"","textColor":"text-dark","hsl":{"h":79.74193548387098,"s":0.607843137254902,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#55aa8d","rgb":"85,170,141","name":"","textColor":"text-dark","hsl":{"h":159.52941176470588,"s":0.3333333333333333,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"yellowgreen","pass":true,"hex":"#9acd32","rgb":"154,205,50","textColor":"text-dark","hsl":{"h":79.74193548387098,"s":0.607843137254902,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"lime","pass":true,"hex":"#00ff00","rgb":"0,255,0","textColor":"text-dark","hsl":{"h":120,"s":1,"l":0.5,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4DAF7C","rgb":"77,175,124","name":"","textColor":"text-dark","hsl":{"h":148.77551020408163,"s":0.3888888888888889,"l":0.49411764705882355,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2ECC71","rgb":"46,204,113","name":"","textColor":"text-dark","hsl":{"h":145.44303797468353,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc71","rgb":"46,204,113","name":"","textColor":"text-dark","hsl":{"h":145.44303797468353,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc32","rgb":"46,204,50","name":"","textColor":"text-dark","hsl":{"h":121.51898734177216,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc51","rgb":"46,204,81","name":"","textColor":"text-dark","hsl":{"h":133.2911392405063,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc71","rgb":"46,204,113","name":"","textColor":"text-dark","hsl":{"h":145.44303797468353,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc91","rgb":"46,204,145","name":"","textColor":"text-dark","hsl":{"h":157.59493670886076,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2eccb0","rgb":"46,204,176","name":"","textColor":"text-dark","hsl":{"h":169.36708860759492,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc71","rgb":"46,204,113","name":"","textColor":"text-dark","hsl":{"h":145.44303797468353,"s":0.632,"l":0.4901960784313726,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#00fa9a","rgb":"0,250,154","name":"","textColor":"text-dark","hsl":{"h":156.96,"s":1,"l":0.49019607843137253,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"mediumspringgreen","pass":true,"hex":"#00fa9a","rgb":"0,250,154","textColor":"text-dark","hsl":{"h":156.96,"s":1,"l":0.49019607843137253,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#5d995d","rgb":"93,153,93","name":"","textColor":"text-dark","hsl":{"h":120,"s":0.24390243902439027,"l":0.48235294117647054,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#3cb572","rgb":"60,181,114","name":"","textColor":"text-dark","hsl":{"h":146.7768595041322,"s":0.5020746887966806,"l":0.4725490196078431,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#3cb371","rgb":"60,179,113","name":"","textColor":"text-dark","hsl":{"h":146.72268907563026,"s":0.49790794979079495,"l":0.46862745098039216,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"mediumseagreen","pass":true,"hex":"#3cb371","rgb":"60,179,113","textColor":"text-dark","hsl":{"h":146.72268907563026,"s":0.49790794979079495,"l":0.46862745098039216,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26C281","rgb":"38,194,129","name":"","textColor":"text-dark","hsl":{"h":155,"s":0.6724137931034482,"l":0.4549019607843137,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#8bb82d","rgb":"139,184,45","name":"","textColor":"text-dark","hsl":{"h":79.4244604316547,"s":0.6069868995633187,"l":0.44901960784313727,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2ABB9B","rgb":"42,187,155","name":"","textColor":"text-dark","hsl":{"h":166.75862068965517,"s":0.6331877729257642,"l":0.4490196078431372,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1BBC9B","rgb":"27,188,155","name":"","textColor":"text-dark","hsl":{"h":167.70186335403724,"s":0.7488372093023257,"l":0.4215686274509804,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#00d400","rgb":"0,212,0","name":"","textColor":"text-white","hsl":{"h":120,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#00d46a","rgb":"0,212,106","name":"","textColor":"text-dark","hsl":{"h":150,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#00cf80","rgb":"0,207,128","name":"","textColor":"text-dark","hsl":{"h":157.1014492753623,"s":1,"l":0.40588235294117647,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26A65B","rgb":"38,166,91","name":"","textColor":"text-white","hsl":{"h":144.84375,"s":0.6274509803921569,"l":0.4,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03C9A9","rgb":"3,201,169","name":"","textColor":"text-dark","hsl":{"h":170.30303030303028,"s":0.9705882352941178,"l":0.39999999999999997,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#7aa228","rgb":"122,162,40","name":"","textColor":"text-dark","hsl":{"h":79.67213114754098,"s":0.6039603960396039,"l":0.396078431372549,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#28a228","rgb":"40,162,40","name":"","textColor":"text-white","hsl":{"h":120,"s":0.6039603960396039,"l":0.396078431372549,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#4b7b4b","rgb":"75,123,75","name":"","textColor":"text-white","hsl":{"h":120,"s":0.2424242424242424,"l":0.38823529411764707,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#24a159","rgb":"36,161,89","name":"","textColor":"text-white","hsl":{"h":145.44,"s":0.6345177664974619,"l":0.38627450980392153,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#40806a","rgb":"64,128,106","name":"","textColor":"text-white","hsl":{"h":159.375,"s":0.3333333333333333,"l":0.3764705882352941,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1BA39C","rgb":"27,163,156","name":"","textColor":"text-white","hsl":{"h":176.91176470588238,"s":0.7157894736842106,"l":0.3725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"seagreen","pass":true,"hex":"#2e8b57","rgb":"46,139,87","textColor":"text-white","hsl":{"h":146.45161290322582,"s":0.5027027027027026,"l":0.3627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#2e8b57","rgb":"46,139,87","name":"","textColor":"text-white","hsl":{"h":146.45161290322582,"s":0.5027027027027026,"l":0.3627450980392157,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#16A085","rgb":"22,160,133","name":"","textColor":"text-white","hsl":{"h":168.2608695652174,"s":0.7582417582417582,"l":0.3568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#2e8856","rgb":"46,136,86","name":"","textColor":"text-white","hsl":{"h":146.66666666666669,"s":0.49450549450549447,"l":0.3568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#6b8e23","rgb":"107,142,35","name":"","textColor":"text-white","hsl":{"h":79.62616822429906,"s":0.6045197740112994,"l":0.34705882352941175,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#436e43","rgb":"67,110,67","name":"","textColor":"text-white","hsl":{"h":120,"s":0.24293785310734467,"l":0.34705882352941175,"a":1}},
{"type":"colorSibling","colorParent":"green","name":"olivedrab","pass":true,"hex":"#6b8e23","rgb":"107,142,35","textColor":"text-white","hsl":{"h":79.62616822429906,"s":0.6045197740112994,"l":0.34705882352941175,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#00B16A","rgb":"0,177,106","name":"","textColor":"text-white","hsl":{"h":155.9322033898305,"s":1,"l":0.34705882352941175,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#00aa55","rgb":"0,170,85","name":"","textColor":"text-white","hsl":{"h":150,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#00aa00","rgb":"0,170,0","name":"","textColor":"text-white","hsl":{"h":120,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03A678","rgb":"3,166,120","name":"","textColor":"text-white","hsl":{"h":163.06748466257667,"s":0.9644970414201185,"l":0.33137254901960783,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#00a566","rgb":"0,165,102","name":"","textColor":"text-white","hsl":{"h":157.0909090909091,"s":1,"l":0.3235294117647059,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1E824C","rgb":"30,130,76","name":"","textColor":"text-white","hsl":{"h":147.6,"s":0.6249999999999999,"l":0.3137254901960784,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#019875","rgb":"1,152,117","name":"","textColor":"text-white","hsl":{"h":166.09271523178808,"s":0.9869281045751634,"l":0.3,"a":1}},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#049372","rgb":"4,147,114","name":"","textColor":"text-white","hsl":{"h":166.15384615384613,"s":0.947019867549669,"l":0.29607843137254897,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#5a781d","rgb":"90,120,29","name":"","textColor":"text-white","hsl":{"h":79.78021978021978,"s":0.610738255033557,"l":0.29215686274509806,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#1d781d","rgb":"29,120,29","name":"","textColor":"text-white","hsl":{"h":120,"s":0.610738255033557,"l":0.29215686274509806,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#1b7742","rgb":"27,119,66","name":"","textColor":"text-white","hsl":{"h":145.43478260869563,"s":0.6301369863013699,"l":0.28627450980392155,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#315131","rgb":"49,81,49","name":"","textColor":"text-white","hsl":{"h":120,"s":0.2461538461538461,"l":0.2549019607843137,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#008000","rgb":"0,128,0","name":"","textColor":"text-white","hsl":{"h":120,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#20603c","rgb":"32,96,60","name":"","textColor":"text-white","hsl":{"h":146.25,"s":0.5,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#008040","rgb":"0,128,64","name":"","textColor":"text-white","hsl":{"h":150,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#2a5547","rgb":"42,85,71","name":"","textColor":"text-white","hsl":{"h":160.4651162790698,"s":0.3385826771653543,"l":0.24901960784313726,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#205e3b","rgb":"32,94,59","name":"","textColor":"text-white","hsl":{"h":146.1290322580645,"s":0.4920634920634921,"l":0.24705882352941178,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#4b6319","rgb":"75,99,25","name":"","textColor":"text-white","hsl":{"h":79.45945945945945,"s":0.5967741935483871,"l":0.24313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#007a4b","rgb":"0,122,75","name":"","textColor":"text-white","hsl":{"h":156.88524590163934,"s":1,"l":0.23921568627450981,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#294429","rgb":"41,68,41","name":"","textColor":"text-white","hsl":{"h":120,"s":0.24770642201834855,"l":0.21372549019607845,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#3a4d13","rgb":"58,77,19","name":"","textColor":"text-white","hsl":{"h":79.6551724137931,"s":0.6041666666666666,"l":0.18823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#134d13","rgb":"19,77,19","name":"","textColor":"text-white","hsl":{"h":120,"s":0.6041666666666666,"l":0.18823529411764706,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#114c2a","rgb":"17,76,42","name":"","textColor":"text-white","hsl":{"h":145.4237288135593,"s":0.6344086021505377,"l":0.18235294117647058,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#00552a","rgb":"0,85,42","name":"","textColor":"text-white","hsl":{"h":149.64705882352942,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#005500","rgb":"0,85,0","name":"","textColor":"text-white","hsl":{"h":120,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#005031","rgb":"0,80,49","name":"","textColor":"text-white","hsl":{"h":156.74999999999997,"s":1,"l":0.1568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#123622","rgb":"18,54,34","name":"","textColor":"text-white","hsl":{"h":146.66666666666669,"s":0.5,"l":0.1411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#2b390e","rgb":"43,57,14","name":"","textColor":"text-white","hsl":{"h":79.53488372093024,"s":0.6056338028169014,"l":0.1392156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#113321","rgb":"17,51,33","name":"","textColor":"text-white","hsl":{"h":148.23529411764707,"s":0.5000000000000001,"l":0.13333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"aquamarine","pass":true,"hex":"#152a23","rgb":"21,42,35","name":"","textColor":"text-white","hsl":{"h":160,"s":0.3333333333333333,"l":0.12352941176470589,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"palegreen","pass":true,"hex":"#172617","rgb":"23,38,23","name":"","textColor":"text-white","hsl":{"h":120,"s":0.24590163934426232,"l":0.1196078431372549,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"yellowgreen","pass":true,"hex":"#1a2309","rgb":"26,35,9","name":"","textColor":"text-white","hsl":{"h":80.76923076923077,"s":0.5909090909090909,"l":0.08627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"limegreen","pass":true,"hex":"#092309","rgb":"9,35,9","name":"","textColor":"text-white","hsl":{"h":120,"s":0.5909090909090909,"l":0.08627450980392157,"a":1}},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#082213","rgb":"8,34,19","name":"","textColor":"text-white","hsl":{"h":145.38461538461536,"s":0.6190476190476191,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lime","pass":true,"hex":"#002a00","rgb":"0,42,0","name":"","textColor":"text-white","hsl":{"h":120,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"springgreen","pass":true,"hex":"#002a15","rgb":"0,42,21","name":"","textColor":"text-white","hsl":{"h":150,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"lightgreen","pass":true,"hex":"#0f1a0f","rgb":"15,26,15","name":"","textColor":"text-white","hsl":{"h":120,"s":0.2682926829268293,"l":0.08039215686274509,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumspringgreen","pass":true,"hex":"#002517","rgb":"0,37,23","name":"","textColor":"text-white","hsl":{"h":157.2972972972973,"s":1,"l":0.07254901960784314,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"olivedrab","pass":true,"hex":"#0b0e04","rgb":"11,14,4","name":"","textColor":"text-white","hsl":{"h":78,"s":0.5555555555555556,"l":0.03529411764705882,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"seagreen","pass":true,"hex":"#040b07","rgb":"4,11,7","name":"","textColor":"text-white","hsl":{"h":145.7142857142857,"s":0.4666666666666667,"l":0.029411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"green","colorSiblingParent":"mediumseagreen","pass":true,"hex":"#030906","rgb":"3,9,6","name":"","textColor":"text-white","hsl":{"h":150,"s":0.5,"l":0.023529411764705882,"a":1}},

{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#E4F1FE","rgb":"228,241,254","name":"","textColor":"text-dark","hsl":{"h":210,"s":0.9285714285714288,"l":0.9450980392156862,"a":1}},




{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#e0ffff","rgb":"224,255,255","name":"","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.9392156862745098,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"lightcyan","pass":true,"hex":"#e0ffff","rgb":"224,255,255","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.9392156862745098,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#C5EFF7","rgb":"197,239,247","name":"","textColor":"text-dark","hsl":{"h":189.60000000000002,"s":0.7575757575757579,"l":0.8705882352941177,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#add8e6","rgb":"173,216,230","name":"","textColor":"text-dark","hsl":{"h":194.73684210526315,"s":0.5327102803738316,"l":0.7901960784313726,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"lightblue","pass":true,"hex":"#add8e6","rgb":"173,216,230","textColor":"text-dark","hsl":{"h":194.73684210526315,"s":0.5327102803738316,"l":0.7901960784313726,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#bbd4d4","rgb":"187,212,212","name":"","textColor":"text-dark","hsl":{"h":180,"s":0.2252252252252255,"l":0.7823529411764706,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#89C4F4","rgb":"137,196,244","name":"","textColor":"text-dark","hsl":{"h":206.9158878504673,"s":0.8294573643410856,"l":0.7470588235294118,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#81CFE0","rgb":"129,207,224","name":"","textColor":"text-dark","hsl":{"h":190.73684210526315,"s":0.6050955414012739,"l":0.692156862745098,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#6BB9F0","rgb":"107,185,240","name":"","textColor":"text-dark","hsl":{"h":204.81203007518795,"s":0.8159509202453987,"l":0.6803921568627451,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"cornflowerblue","pass":true,"hex":"#6495ed","rgb":"100,149,237","textColor":"text-dark","hsl":{"h":218.54014598540147,"s":0.7919075144508672,"l":0.6607843137254902,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#6495ed","rgb":"100,149,237","name":"","textColor":"text-dark","hsl":{"h":218.54014598540147,"s":0.7919075144508672,"l":0.6607843137254902,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#8db0bb","rgb":"141,176,187","name":"","textColor":"text-dark","hsl":{"h":194.3478260869565,"s":0.2527472527472527,"l":0.6431372549019607,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#7462e0","rgb":"116,98,224","name":"","textColor":"text-white","hsl":{"h":248.5714285714286,"s":0.6702127659574467,"l":0.6313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#95aaaa","rgb":"149,170,170","name":"","textColor":"text-dark","hsl":{"h":180,"s":0.10994764397905749,"l":0.6254901960784314,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#59ABE3","rgb":"89,171,227","name":"","textColor":"text-dark","hsl":{"h":204.3478260869565,"s":0.7113402061855669,"l":0.6196078431372549,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#52B3D9","rgb":"82,179,217","name":"","textColor":"text-dark","hsl":{"h":196.8888888888889,"s":0.6398104265402843,"l":0.5862745098039216,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#1e90ff","rgb":"30,144,255","name":"","textColor":"text-white","hsl":{"h":209.6,"s":1,"l":0.5588235294117647,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"dodgerblue","pass":true,"hex":"#1e90ff","rgb":"30,144,255","textColor":"text-white","hsl":{"h":209.6,"s":1,"l":0.5588235294117647,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#5C97BF","rgb":"92,151,191","name":"","textColor":"text-dark","hsl":{"h":204.24242424242425,"s":0.4361233480176212,"l":0.5549019607843138,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4183D7","rgb":"65,131,215","name":"","textColor":"text-white","hsl":{"h":213.60000000000002,"s":0.6521739130434784,"l":0.5490196078431373,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#19B5FE","rgb":"25,181,254","name":"","textColor":"text-dark","hsl":{"h":199.12663755458513,"s":0.9913419913419914,"l":0.5470588235294118,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#527ac2","rgb":"82,122,194","name":"","textColor":"text-white","hsl":{"h":218.57142857142856,"s":0.47863247863247854,"l":0.5411764705882353,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22A7F0","rgb":"34,167,240","name":"","textColor":"text-dark","hsl":{"h":201.26213592233012,"s":0.8728813559322034,"l":0.5372549019607843,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3498db","rgb":"52,152,219","name":"","textColor":"text-dark","hsl":{"h":204.07185628742513,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3498DB","rgb":"52,152,219","name":"","textColor":"text-dark","hsl":{"h":204.07185628742513,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3455db","rgb":"52,85,219","name":"","textColor":"text-white","hsl":{"h":228.1437125748503,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3477db","rgb":"52,119,219","name":"","textColor":"text-white","hsl":{"h":215.92814371257484,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3498db","rgb":"52,152,219","name":"","textColor":"text-dark","hsl":{"h":204.07185628742513,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34dbdb","rgb":"52,219,219","name":"","textColor":"text-dark","hsl":{"h":180,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34b9db","rgb":"52,185,219","name":"","textColor":"text-dark","hsl":{"h":192.21556886227546,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3498db","rgb":"52,152,219","name":"","textColor":"text-dark","hsl":{"h":204.07185628742513,"s":0.6987447698744769,"l":0.5313725490196078,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4B77BE","rgb":"75,119,190","name":"","textColor":"text-white","hsl":{"h":217.0434782608696,"s":0.46938775510204084,"l":0.5196078431372549,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#67809F","rgb":"103,128,159","name":"","textColor":"text-white","hsl":{"h":213.21428571428572,"s":0.22580645161290322,"l":0.5137254901960784,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#5e50b5","rgb":"94,80,181","name":"","textColor":"text-white","hsl":{"h":248.31683168316832,"s":0.40562248995983946,"l":0.5117647058823529,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#00bfff","rgb":"0,191,255","name":"","textColor":"text-dark","hsl":{"h":195.05882352941174,"s":1,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"deepskyblue","pass":true,"hex":"#00bfff","rgb":"0,191,255","textColor":"text-dark","hsl":{"h":195.05882352941174,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#00ffff","rgb":"0,255,255","name":"","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"aqua","pass":true,"hex":"#00ffff","rgb":"0,255,255","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#6d8891","rgb":"109,136,145","name":"","textColor":"text-dark","hsl":{"h":195,"s":0.14173228346456693,"l":0.4980392156862745,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#00f8fb","rgb":"0,248,251","name":"","textColor":"text-dark","hsl":{"h":180.71713147410358,"s":1,"l":0.492156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#708080","rgb":"112,128,128","name":"","textColor":"text-white","hsl":{"h":180,"s":0.06666666666666667,"l":0.47058823529411764,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#1978d4","rgb":"25,120,212","name":"","textColor":"text-white","hsl":{"h":209.51871657754012,"s":0.7890295358649789,"l":0.4647058823529412,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1E8BC3","rgb":"30,139,195","name":"","textColor":"text-white","hsl":{"h":200.36363636363637,"s":0.7333333333333333,"l":0.4411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#00e0e0","rgb":"0,224,224","name":"","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.4392156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#0000e0","rgb":"0,0,224","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.4392156862745098,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#2a7ab0","rgb":"42,122,176","name":"","textColor":"text-white","hsl":{"h":204.17910447761193,"s":0.6146788990825689,"l":0.42745098039215684,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#406098","rgb":"64,96,152","name":"","textColor":"text-white","hsl":{"h":218.1818181818182,"s":0.4074074074074074,"l":0.4235294117647059,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3A539B","rgb":"58,83,155","name":"","textColor":"text-white","hsl":{"h":224.53608247422682,"s":0.45539906103286387,"l":0.41764705882352937,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#00d4d4","rgb":"0,212,212","name":"","textColor":"text-dark","hsl":{"h":180,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#009fd4","rgb":"0,159,212","name":"","textColor":"text-white","hsl":{"h":195,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#00ced1","rgb":"0,206,209","name":"","textColor":"text-dark","hsl":{"h":180.86124401913875,"s":1,"l":0.40980392156862744,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"darkturquoise","pass":true,"hex":"#00ced1","rgb":"0,206,209","textColor":"text-dark","hsl":{"h":180.86124401913875,"s":1,"l":0.40980392156862744,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2574A9","rgb":"37,116,169","name":"","textColor":"text-white","hsl":{"h":204.0909090909091,"s":0.6407766990291262,"l":0.403921568627451,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"darkslateblue","pass":true,"hex":"#483d8b","rgb":"72,61,139","textColor":"text-white","hsl":{"h":248.4615384615385,"s":0.3899999999999999,"l":0.39215686274509803,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#483d8b","rgb":"72,61,139","name":"","textColor":"text-white","hsl":{"h":248.4615384615385,"s":0.3899999999999999,"l":0.39215686274509803,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#1460aa","rgb":"20,96,170","name":"","textColor":"text-white","hsl":{"h":209.6,"s":0.7894736842105262,"l":0.37254901960784315,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#0000b5","rgb":"0,0,181","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.35490196078431374,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#00b5b5","rgb":"0,181,181","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.35490196078431374,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#4d6066","rgb":"77,96,102","name":"","textColor":"text-white","hsl":{"h":194.4,"s":0.13966480446927382,"l":0.3509803921568627,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1F3A93","rgb":"31,58,147","name":"","textColor":"text-white","hsl":{"h":226.0344827586207,"s":0.6516853932584269,"l":0.34901960784313724,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#336E7B","rgb":"51,110,123","name":"","textColor":"text-white","hsl":{"h":190.83333333333331,"s":0.41379310344827586,"l":0.3411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#007faa","rgb":"0,127,170","name":"","textColor":"text-white","hsl":{"h":195.17647058823528,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#00aaaa","rgb":"0,170,170","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#00a4a6","rgb":"0,164,166","name":"","textColor":"text-white","hsl":{"h":180.72289156626508,"s":1,"l":0.3254901960784314,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#205d86","rgb":"32,93,134","name":"","textColor":"text-white","hsl":{"h":204.11764705882356,"s":0.6144578313253012,"l":0.3254901960784314,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#4b5555","rgb":"75,85,85","name":"","textColor":"text-white","hsl":{"h":180,"s":0.06249999999999996,"l":0.3137254901960784,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#2e456d","rgb":"46,69,109","name":"","textColor":"text-white","hsl":{"h":218.0952380952381,"s":0.4064516129032258,"l":0.30392156862745096,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#34495E","rgb":"52,73,94","name":"","textColor":"text-white","hsl":{"h":210,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#0f4880","rgb":"15,72,128","name":"","textColor":"text-white","hsl":{"h":209.73451327433625,"s":0.7902097902097902,"l":0.2803921568627451,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#008b8b","rgb":"0,139,139","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"darkblue","pass":true,"hex":"#00008b","rgb":"0,0,139","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#00008b","rgb":"0,0,139","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"blue","name":"darkcyan","pass":true,"hex":"#008b8b","rgb":"0,139,139","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#322a60","rgb":"50,42,96","name":"","textColor":"text-white","hsl":{"h":248.88888888888889,"s":0.391304347826087,"l":0.27058823529411763,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#008080","rgb":"0,128,128","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#006080","rgb":"0,96,128","name":"","textColor":"text-white","hsl":{"h":195,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2C3E50","rgb":"44,62,80","name":"","textColor":"text-white","hsl":{"h":210,"s":0.2903225806451613,"l":0.24313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#007a7c","rgb":"0,122,124","name":"","textColor":"text-white","hsl":{"h":180.96774193548387,"s":1,"l":0.24313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#16405b","rgb":"22,64,91","name":"","textColor":"text-white","hsl":{"h":203.4782608695652,"s":0.6106194690265487,"l":0.22156862745098038,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#2d383c","rgb":"45,56,60","name":"","textColor":"text-white","hsl":{"h":195.99999999999997,"s":0.14285714285714282,"l":0.20588235294117646,"a":1}},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22313F","rgb":"34,49,63","name":"","textColor":"text-white","hsl":{"h":208.9655172413793,"s":0.2989690721649485,"l":0.19019607843137254,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#000060","rgb":"0,0,96","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.18823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#006060","rgb":"0,96,96","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.18823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#0a3055","rgb":"10,48,85","name":"","textColor":"text-white","hsl":{"h":209.6,"s":0.7894736842105262,"l":0.18627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#1c2a43","rgb":"28,42,67","name":"","textColor":"text-white","hsl":{"h":218.46153846153845,"s":0.4105263157894737,"l":0.18627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#005555","rgb":"0,85,85","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#004055","rgb":"0,64,85","name":"","textColor":"text-white","hsl":{"h":194.8235294117647,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#005051","rgb":"0,80,81","name":"","textColor":"text-white","hsl":{"h":180.74074074074076,"s":1,"l":0.1588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightcyan","pass":true,"hex":"#252a2a","rgb":"37,42,42","name":"","textColor":"text-white","hsl":{"h":180,"s":0.06329113924050628,"l":0.15490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#1c1836","rgb":"28,24,54","name":"","textColor":"text-white","hsl":{"h":248.00000000000003,"s":0.3846153846153846,"l":0.15294117647058825,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#0c2231","rgb":"12,34,49","name":"","textColor":"text-white","hsl":{"h":204.32432432432432,"s":0.6065573770491803,"l":0.11960784313725491,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#000036","rgb":"0,0,54","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.10588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#003636","rgb":"0,54,54","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.10588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"dodgerblue","pass":true,"hex":"#05182a","rgb":"5,24,42","name":"","textColor":"text-white","hsl":{"h":209.18918918918916,"s":0.7872340425531914,"l":0.09215686274509804,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"aqua","pass":true,"hex":"#002a2a","rgb":"0,42,42","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"deepskyblue","pass":true,"hex":"#00202a","rgb":"0,32,42","name":"","textColor":"text-white","hsl":{"h":194.28571428571428,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkturquoise","pass":true,"hex":"#002627","rgb":"0,38,39","name":"","textColor":"text-white","hsl":{"h":181.53846153846155,"s":1,"l":0.07647058823529412,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"cornflowerblue","pass":true,"hex":"#0a0f18","rgb":"10,15,24","name":"","textColor":"text-white","hsl":{"h":218.57142857142856,"s":0.4117647058823529,"l":0.06666666666666667,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"lightblue","pass":true,"hex":"#0d1011","rgb":"13,16,17","name":"","textColor":"text-white","hsl":{"h":195,"s":0.13333333333333333,"l":0.058823529411764705,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkslateblue","pass":true,"hex":"#06050b","rgb":"6,5,11","name":"","textColor":"text-white","hsl":{"h":250.00000000000003,"s":0.375,"l":0.03137254901960784,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkcyan","pass":true,"hex":"#000b0b","rgb":"0,11,11","name":"","textColor":"text-white","hsl":{"h":180,"s":1,"l":0.021568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"blue","colorSiblingParent":"darkblue","pass":true,"hex":"#00000b","rgb":"0,0,11","name":"","textColor":"text-white","hsl":{"h":240,"s":1,"l":0.021568627450980392,"a":1}},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#020406","rgb":"2,4,6","name":"","textColor":"text-white","hsl":{"h":210,"s":0.5,"l":0.01568627450980392,"a":1}},

{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#DCC6E0","rgb":"220,198,224","name":"","textColor":"text-dark","hsl":{"h":290.76923076923083,"s":0.29545454545454536,"l":0.8274509803921568,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#dda0dd","rgb":"221,160,221","name":"","textColor":"text-dark","hsl":{"h":300,"s":0.4728682170542637,"l":0.7470588235294118,"a":1}},
{"type":"colorSibling","colorParent":"purple","name":"plum","pass":true,"hex":"#dda0dd","rgb":"221,160,221","textColor":"text-dark","hsl":{"h":300,"s":0.4728682170542637,"l":0.7470588235294118,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#AEA8D3","rgb":"174,168,211","name":"","textColor":"text-dark","hsl":{"h":248.37209302325581,"s":0.3282442748091602,"l":0.7431372549019608,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#BE90D4","rgb":"190,144,212","name":"","textColor":"text-dark","hsl":{"h":280.5882352941176,"s":0.44155844155844176,"l":0.6980392156862745,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#bf6ee0","rgb":"191,110,224","name":"","textColor":"text-dark","hsl":{"h":282.63157894736844,"s":0.6477272727272727,"l":0.6549019607843137,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#9370db","rgb":"147,112,219","name":"","textColor":"text-dark","hsl":{"h":259.6261682242991,"s":0.5977653631284916,"l":0.6490196078431372,"a":1}},
{"type":"colorSibling","colorParent":"purple","name":"mediumpurple","pass":true,"hex":"#9370db","rgb":"147,112,219","textColor":"text-dark","hsl":{"h":259.6261682242991,"s":0.5977653631284916,"l":0.6490196078431372,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#BF55EC","rgb":"191,85,236","name":"","textColor":"text-dark","hsl":{"h":282.1192052980132,"s":0.7989417989417991,"l":0.6294117647058823,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#b381b3","rgb":"179,129,179","name":"","textColor":"text-dark","hsl":{"h":300,"s":0.24752475247524747,"l":0.6039215686274509,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#b93cf6","rgb":"185,60,246","name":"","textColor":"text-white","hsl":{"h":280.3225806451613,"s":0.9117647058823533,"l":0.6,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#7659b6","rgb":"118,89,182","name":"","textColor":"text-white","hsl":{"h":258.7096774193548,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#9b59b6","rgb":"155,89,182","name":"","textColor":"text-white","hsl":{"h":282.58064516129025,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9B59B6","rgb":"155,89,182","name":"","textColor":"text-white","hsl":{"h":282.58064516129025,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#b659ac","rgb":"182,89,172","name":"","textColor":"text-white","hsl":{"h":306.4516129032258,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#9b59b6","rgb":"155,89,182","name":"","textColor":"text-white","hsl":{"h":282.58064516129025,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#ae59b6","rgb":"174,89,182","name":"","textColor":"text-white","hsl":{"h":294.8387096774194,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#8859b6","rgb":"136,89,182","name":"","textColor":"text-white","hsl":{"h":270.3225806451613,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#9b59b6","rgb":"155,89,182","name":"","textColor":"text-white","hsl":{"h":282.58064516129025,"s":0.38912133891213396,"l":0.5313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#8a2be2","rgb":"138,43,226","name":"","textColor":"text-white","hsl":{"h":271.1475409836066,"s":0.7593360995850621,"l":0.5274509803921569,"a":1}},
{"type":"colorSibling","colorParent":"purple","name":"blueviolet","pass":true,"hex":"#8a2be2","rgb":"138,43,226","textColor":"text-white","hsl":{"h":271.1475409836066,"s":0.7593360995850621,"l":0.5274509803921569,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#765ab0","rgb":"118,90,176","name":"","textColor":"text-white","hsl":{"h":259.5348837209302,"s":0.3524590163934426,"l":0.5215686274509804,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#9932cc","rgb":"153,50,204","name":"","textColor":"text-white","hsl":{"h":280.12987012987014,"s":0.6062992125984252,"l":0.4980392156862745,"a":1}},
{"type":"colorSibling","colorParent":"purple","name":"darkorchid","pass":true,"hex":"#9932cc","rgb":"153,50,204","textColor":"text-white","hsl":{"h":280.12987012987014,"s":0.6062992125984252,"l":0.4980392156862745,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#b200fd","rgb":"178,0,253","name":"","textColor":"text-white","hsl":{"h":282.2134387351779,"s":1,"l":0.49607843137254903,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#8E44AD","rgb":"142,68,173","name":"","textColor":"text-white","hsl":{"h":282.2857142857143,"s":0.4356846473029046,"l":0.4725490196078431,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#886288","rgb":"136,98,136","name":"","textColor":"text-white","hsl":{"h":300,"s":0.16239316239316234,"l":0.45882352941176474,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#7023b7","rgb":"112,35,183","name":"","textColor":"text-white","hsl":{"h":271.2162162162162,"s":0.6788990825688072,"l":0.4274509803921569,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#9400d3","rgb":"148,0,211","name":"","textColor":"text-white","hsl":{"h":282.08530805687207,"s":1,"l":0.4137254901960784,"a":1}},
{"type":"colorSibling","colorParent":"purple","name":"darkviolet","pass":true,"hex":"#9400d3","rgb":"148,0,211","textColor":"text-white","hsl":{"h":282.08530805687207,"s":1,"l":0.4137254901960784,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#77448b","rgb":"119,68,139","name":"","textColor":"text-white","hsl":{"h":283.0985915492958,"s":0.3429951690821256,"l":0.40588235294117647,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#913D88","rgb":"145,61,136","name":"","textColor":"text-white","hsl":{"h":306.42857142857144,"s":0.40776699029126207,"l":0.403921568627451,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#663399","rgb":"102,51,153","name":"","textColor":"text-white","hsl":{"h":270,"s":0.49999999999999994,"l":0.4,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#5a4586","rgb":"90,69,134","name":"","textColor":"text-white","hsl":{"h":259.38461538461536,"s":0.32019704433497537,"l":0.39803921568627454,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#7928a1","rgb":"121,40,161","name":"","textColor":"text-white","hsl":{"h":280.1652892561984,"s":0.6019900497512438,"l":0.3941176470588235,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9A12B3","rgb":"154,18,179","name":"","textColor":"text-white","hsl":{"h":290.6832298136646,"s":0.817258883248731,"l":0.38627450980392153,"a":1}},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#674172","rgb":"103,65,114","name":"","textColor":"text-white","hsl":{"h":286.5306122448979,"s":0.27374301675977664,"l":0.3509803921568627,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#7600a8","rgb":"118,0,168","name":"","textColor":"text-white","hsl":{"h":282.14285714285717,"s":1,"l":0.32941176470588235,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#561b8d","rgb":"86,27,141","name":"","textColor":"text-white","hsl":{"h":271.05263157894734,"s":0.6785714285714286,"l":0.32941176470588235,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#5d445d","rgb":"93,68,93","name":"","textColor":"text-white","hsl":{"h":300,"s":0.15527950310559005,"l":0.3156862745098039,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#591d77","rgb":"89,29,119","name":"","textColor":"text-white","hsl":{"h":280,"s":0.6081081081081081,"l":0.2901960784313726,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#532f61","rgb":"83,47,97","name":"","textColor":"text-white","hsl":{"h":283.2,"s":0.34722222222222215,"l":0.2823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#3d2f5b","rgb":"61,47,91","name":"","textColor":"text-white","hsl":{"h":259.0909090909091,"s":0.3188405797101449,"l":0.2705882352941177,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#58007e","rgb":"88,0,126","name":"","textColor":"text-white","hsl":{"h":281.9047619047619,"s":1,"l":0.24705882352941178,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#3c1362","rgb":"60,19,98","name":"","textColor":"text-white","hsl":{"h":271.13924050632914,"s":0.6752136752136751,"l":0.22941176470588237,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#39134c","rgb":"57,19,76","name":"","textColor":"text-white","hsl":{"h":280,"s":0.6,"l":0.18627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#332533","rgb":"51,37,51","name":"","textColor":"text-white","hsl":{"h":300,"s":0.1590909090909091,"l":0.17254901960784313,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#3b0053","rgb":"59,0,83","name":"","textColor":"text-white","hsl":{"h":282.65060240963857,"s":1,"l":0.1627450980392157,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#2e1b36","rgb":"46,27,54","name":"","textColor":"text-white","hsl":{"h":282.22222222222223,"s":0.33333333333333337,"l":0.1588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#211931","rgb":"33,25,49","name":"","textColor":"text-white","hsl":{"h":260,"s":0.32432432432432434,"l":0.1450980392156863,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#220b38","rgb":"34,11,56","name":"","textColor":"text-white","hsl":{"h":270.6666666666667,"s":0.6716417910447761,"l":0.13137254901960785,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkorchid","pass":true,"hex":"#190822","rgb":"25,8,34","name":"","textColor":"text-white","hsl":{"h":279.2307692307692,"s":0.6190476190476191,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"darkviolet","pass":true,"hex":"#1d0029","rgb":"29,0,41","name":"","textColor":"text-white","hsl":{"h":282.4390243902439,"s":1,"l":0.0803921568627451,"a":1}},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#0a060c","rgb":"10,6,12","name":"","textColor":"text-white","hsl":{"h":280,"s":0.3333333333333333,"l":0.03529411764705882,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"blueviolet","pass":true,"hex":"#08030d","rgb":"8,3,13","name":"","textColor":"text-white","hsl":{"h":270,"s":0.625,"l":0.03137254901960784,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"plum","pass":true,"hex":"#080608","rgb":"8,6,8","name":"","textColor":"text-white","hsl":{"h":300,"s":0.14285714285714285,"l":0.027450980392156862,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"purple","colorSiblingParent":"mediumpurple","pass":true,"hex":"#040306","rgb":"4,3,6","name":"","textColor":"text-white","hsl":{"h":260,"s":0.3333333333333333,"l":0.01764705882352941,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#FFECDB","rgb":"255,236,219","name":"","textColor":"text-dark","hsl":{"h":28.333333333333364,"s":1,"l":0.9294117647058824,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#F1A9A0","rgb":"241,169,160","name":"","textColor":"text-dark","hsl":{"h":6.666666666666665,"s":0.7431192660550457,"l":0.7862745098039216,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#E08283","rgb":"224,130,131","name":"","textColor":"text-dark","hsl":{"h":359.36170212765956,"s":0.6025641025641025,"l":0.6941176470588235,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#fc6399","rgb":"252,99,153","name":"","textColor":"text-dark","hsl":{"h":338.82352941176475,"s":0.9622641509433963,"l":0.6882352941176471,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#E26A6A","rgb":"226,106,106","name":"","textColor":"text-dark","hsl":{"h":0,"s":0.6741573033707865,"l":0.6509803921568628,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#F64747","rgb":"246,71,71","name":"","textColor":"text-white","hsl":{"h":0,"s":0.9067357512953369,"l":0.6215686274509804,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d2527f","rgb":"210,82,127","name":"","textColor":"text-white","hsl":{"h":338.90625,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d2527f","rgb":"210,82,127","name":"","textColor":"text-white","hsl":{"h":338.90625,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#D2527F","rgb":"210,82,127","name":"","textColor":"text-white","hsl":{"h":338.90625,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25265","rgb":"210,82,101","name":"","textColor":"text-white","hsl":{"h":351.09375,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25299","rgb":"210,82,153","name":"","textColor":"text-dark","hsl":{"h":326.71875,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25852","rgb":"210,88,82","name":"","textColor":"text-white","hsl":{"h":2.8124999999999964,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d252b2","rgb":"210,82,178","name":"","textColor":"text-dark","hsl":{"h":315,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d2527f","rgb":"210,82,127","name":"","textColor":"text-white","hsl":{"h":338.90625,"s":0.5871559633027522,"l":0.5725490196078431,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#F62459","rgb":"246,36,89","name":"","textColor":"text-white","hsl":{"h":344.8571428571429,"s":0.9210526315789473,"l":0.5529411764705883,"a":1}},
{"type":"colorSibling","colorParent":"pink","name":"fuchsia","pass":true,"hex":"#ff00ff","rgb":"255,0,255","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#ff00ff","rgb":"255,0,255","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.5,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#a74165","rgb":"167,65,101","name":"","textColor":"text-white","hsl":{"h":338.82352941176475,"s":0.43965517241379315,"l":0.4549019607843137,"a":1}},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#DB0A5B","rgb":"219,10,91","name":"","textColor":"text-white","hsl":{"h":336.74641148325355,"s":0.9126637554585153,"l":0.4490196078431372,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#e000e0","rgb":"224,0,224","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.4392156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#d400d4","rgb":"212,0,212","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#b500b5","rgb":"181,0,181","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.35490196078431374,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#7d314c","rgb":"125,49,76","name":"","textColor":"text-white","hsl":{"h":338.6842105263158,"s":0.4367816091954022,"l":0.3411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#aa00aa","rgb":"170,0,170","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#8b008b","rgb":"139,0,139","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"pink","name":"darkmagenta","pass":true,"hex":"#8b008b","rgb":"139,0,139","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#800080","rgb":"128,0,128","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#522032","rgb":"82,32,50","name":"","textColor":"text-white","hsl":{"h":338.4,"s":0.4385964912280702,"l":0.2235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#600060","rgb":"96,0,96","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.18823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#550055","rgb":"85,0,85","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#281018","rgb":"40,16,24","name":"","textColor":"text-white","hsl":{"h":340.00000000000006,"s":0.42857142857142855,"l":0.10980392156862745,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#360036","rgb":"54,0,54","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.10588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"fuchsia","pass":true,"hex":"#2a002a","rgb":"42,0,42","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"pink","colorSiblingParent":"darkmagenta","pass":true,"hex":"#0b000b","rgb":"11,0,11","name":"","textColor":"text-white","hsl":{"h":300,"s":1,"l":0.021568627450980392,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#FFFFFF","rgb":"255,255,255","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":1,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#fefefe","rgb":"254,254,254","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.996078431372549,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#F2F1EF","rgb":"242,241,239","name":"","textColor":"text-dark","hsl":{"h":40,"s":0.10344827586206856,"l":0.9431372549019608,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ECF0F1","rgb":"236,240,241","name":"","textColor":"text-dark","hsl":{"h":192,"s":0.151515151515151,"l":0.9352941176470588,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#EEEEEE","rgb":"238,238,238","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.9333333333333333,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ECECEC","rgb":"236,236,236","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.9254901960784314,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#e8e8e8","rgb":"232,232,232","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.9098039215686274,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#DADFE1","rgb":"218,223,225","name":"","textColor":"text-dark","hsl":{"h":197.14285714285708,"s":0.10447761194029853,"l":0.8686274509803922,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#d5d5d5","rgb":"213,213,213","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.8352941176470589,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#D2D7D3","rgb":"210,215,211","name":"","textColor":"text-dark","hsl":{"h":131.99999999999994,"s":0.058823529411764844,"l":0.8333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#d4d4d4","rgb":"212,212,212","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.8313725490196079,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#d3d3d3","rgb":"211,211,211","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.8274509803921568,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#b2cce5","rgb":"178,204,229","name":"","textColor":"text-dark","hsl":{"h":209.41176470588238,"s":0.49514563106796117,"l":0.7980392156862746,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#BDC3C7","rgb":"189,195,199","name":"","textColor":"text-dark","hsl":{"h":204.0000000000001,"s":0.08196721311475402,"l":0.7607843137254902,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#BFBFBF","rgb":"191,191,191","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.7490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#bebebe","rgb":"190,190,190","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.7450980392156863,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ABB7B7","rgb":"171,183,183","name":"","textColor":"text-dark","hsl":{"h":180,"s":0.07692307692307702,"l":0.6941176470588235,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#7bacdd","rgb":"123,172,221","name":"","textColor":"text-dark","hsl":{"h":210,"s":0.5903614457831327,"l":0.6745098039215687,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#aaaaaa","rgb":"170,170,170","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.6666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#aaaaaa","rgb":"170,170,170","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.6666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#a9a9a9","rgb":"169,169,169","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.6627450980392157,"a":1}},
{"type":"colorSibling","colorParent":"gray","name":"darkgray","pass":true,"hex":"#a9a9a9","rgb":"169,169,169","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.6627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#91a6ba","rgb":"145,166,186","name":"","textColor":"text-dark","hsl":{"h":209.26829268292678,"s":0.22905027932960892,"l":0.6490196078431372,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#95A5A6","rgb":"149,165,166","name":"","textColor":"text-dark","hsl":{"h":183.52941176470586,"s":0.08717948717948715,"l":0.6176470588235294,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#939393","rgb":"147,147,147","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.5764705882352941,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#638bb3","rgb":"99,139,179","name":"","textColor":"text-dark","hsl":{"h":210,"s":0.34482758620689646,"l":0.5450980392156862,"a":1}},
{"type":"colorSibling","colorParent":"gray","name":"gray","pass":true,"hex":"#808080","rgb":"128,128,128","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.5019607843137255,"a":1}},
{"type":"colorSibling","colorParent":"gray","name":"slategray","pass":true,"hex":"#708090","rgb":"112,128,144","textColor":"text-white","hsl":{"h":210,"s":0.12598425196850394,"l":0.5019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#708090","rgb":"112,128,144","name":"","textColor":"text-white","hsl":{"h":210,"s":0.12598425196850394,"l":0.5019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#808080","rgb":"128,128,128","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.5019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#808080","rgb":"128,128,128","name":"","textColor":"text-dark","hsl":{"h":0,"s":0,"l":0.5019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#7e7e7e","rgb":"126,126,126","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.49411764705882355,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#6C7A89","rgb":"108,122,137","name":"","textColor":"text-white","hsl":{"h":211.03448275862067,"s":0.1183673469387755,"l":0.48039215686274506,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#4b6a88","rgb":"75,106,136","name":"","textColor":"text-white","hsl":{"h":209.50819672131146,"s":0.2890995260663507,"l":0.4137254901960784,"a":1}},
{"type":"colorSibling","colorParent":"gray","name":"dimgray","pass":true,"hex":"#696969","rgb":"105,105,105","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.4117647058823529,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#696969","rgb":"105,105,105","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.4117647058823529,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#4f5a65","rgb":"79,90,101","name":"","textColor":"text-white","hsl":{"h":209.99999999999997,"s":0.12222222222222219,"l":0.3529411764705882,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#555555","rgb":"85,85,85","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#555555","rgb":"85,85,85","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#545454","rgb":"84,84,84","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.32941176470588235,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34495e","rgb":"52,73,94","name":"","textColor":"text-white","hsl":{"h":210,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34415e","rgb":"52,65,94","name":"","textColor":"text-white","hsl":{"h":221.42857142857144,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34515e","rgb":"52,81,94","name":"","textColor":"text-white","hsl":{"h":198.57142857142858,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34495e","rgb":"52,73,94","name":"","textColor":"text-white","hsl":{"h":210,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#345a5e","rgb":"52,90,94","name":"","textColor":"text-white","hsl":{"h":185.71428571428572,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34385e","rgb":"52,56,94","name":"","textColor":"text-white","hsl":{"h":234.2857142857143,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34495e","rgb":"52,73,94","name":"","textColor":"text-white","hsl":{"h":210,"s":0.28767123287671237,"l":0.28627450980392155,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#3e3e3e","rgb":"62,62,62","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.24313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#2e343b","rgb":"46,52,59","name":"","textColor":"text-white","hsl":{"h":212.30769230769232,"s":0.12380952380952384,"l":0.20588235294117646,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#2b2b2b","rgb":"43,43,43","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.16862745098039217,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#2a2a2a","rgb":"42,42,42","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.16470588235294117,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"darkgray","pass":true,"hex":"#292929","rgb":"41,41,41","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.1607843137254902,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#1c2833","rgb":"28,40,51","name":"","textColor":"text-white","hsl":{"h":208.69565217391306,"s":0.29113924050632917,"l":0.15490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"dimgray","pass":true,"hex":"#141414","rgb":"20,20,20","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0.0784313725490196,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"slategray","pass":true,"hex":"#0d0f10","rgb":"13,15,16","name":"","textColor":"text-white","hsl":{"h":200,"s":0.10344827586206896,"l":0.056862745098039215,"a":1}},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#050709","rgb":"5,7,9","name":"","textColor":"text-white","hsl":{"h":210,"s":0.2857142857142857,"l":0.027450980392156862,"a":1}},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"gray","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0,"a":1}},
{"type":"colorSibling","colorParent":"gray","name":"black","pass":true,"hex":"#000000","rgb":"0,0,0","textColor":"text-white","hsl":{"h":0,"s":0,"l":0,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"gray","colorSiblingParent":"black","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#fffacd","rgb":"255,250,205","name":"","textColor":"text-dark","hsl":{"h":53.999999999999986,"s":1,"l":0.9019607843137255,"a":1}},
{"type":"colorSibling","colorParent":"yellow","name":"lemonchiffon","pass":true,"hex":"#fffacd","rgb":"255,250,205","textColor":"text-dark","hsl":{"h":53.999999999999986,"s":1,"l":0.9019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#d4d0ab","rgb":"212,208,171","name":"","textColor":"text-dark","hsl":{"h":54.14634146341462,"s":0.3228346456692916,"l":0.7509803921568627,"a":1}},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#F5D76E","rgb":"245,215,110","name":"","textColor":"text-dark","hsl":{"h":46.666666666666664,"s":0.8709677419354841,"l":0.696078431372549,"a":1}},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#F4D03F","rgb":"244,208,63","name":"","textColor":"text-dark","hsl":{"h":48.06629834254144,"s":0.891625615763547,"l":0.6019607843137256,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#aaa789","rgb":"170,167,137","name":"","textColor":"text-dark","hsl":{"h":54.54545454545457,"s":0.16256157635467974,"l":0.6019607843137255,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f27927","rgb":"242,121,39","name":"","textColor":"text-dark","hsl":{"h":24.236453201970445,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2a127","rgb":"242,161,39","name":"","textColor":"text-dark","hsl":{"h":36.05911330049261,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2ca27","rgb":"242,202,39","name":"","textColor":"text-dark","hsl":{"h":48.177339901477836,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f1f227","rgb":"241,242,39","name":"","textColor":"text-dark","hsl":{"h":60.29556650246306,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c9f227","rgb":"201,242,39","name":"","textColor":"text-dark","hsl":{"h":72.11822660098521,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2ca27","rgb":"242,202,39","name":"","textColor":"text-dark","hsl":{"h":48.177339901477836,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2ca27","rgb":"242,202,39","name":"","textColor":"text-dark","hsl":{"h":48.177339901477836,"s":0.8864628820960698,"l":0.5509803921568628,"a":1}},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#F7CA18","rgb":"247,202,24","name":"","textColor":"text-dark","hsl":{"h":47.89237668161435,"s":0.9330543933054395,"l":0.5313725490196078,"a":1}},
{"type":"colorSibling","colorParent":"yellow","name":"gold","pass":true,"hex":"#ffd700","rgb":"255,215,0","textColor":"text-dark","hsl":{"h":50.588235294117645,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#ffd700","rgb":"255,215,0","name":"","textColor":"text-dark","hsl":{"h":50.588235294117645,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#daa520","rgb":"218,165,32","name":"","textColor":"text-dark","hsl":{"h":42.903225806451616,"s":0.744,"l":0.49019607843137253,"a":1}},
{"type":"colorSibling","colorParent":"yellow","name":"goldenrod","pass":true,"hex":"#daa520","rgb":"218,165,32","textColor":"text-dark","hsl":{"h":42.903225806451616,"s":0.744,"l":0.49019607843137253,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#e2a50e","rgb":"226,165,14","name":"","textColor":"text-dark","hsl":{"h":42.735849056603776,"s":0.8833333333333333,"l":0.47058823529411764,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#807d67","rgb":"128,125,103","name":"","textColor":"text-white","hsl":{"h":52.79999999999999,"s":0.10822510822510821,"l":0.45294117647058824,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c7a720","rgb":"199,167,32","name":"","textColor":"text-dark","hsl":{"h":48.50299401197605,"s":0.722943722943723,"l":0.45294117647058824,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#d4b300","rgb":"212,179,0","name":"","textColor":"text-dark","hsl":{"h":50.66037735849056,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#af851a","rgb":"175,133,26","name":"","textColor":"text-dark","hsl":{"h":43.08724832214766,"s":0.7412935323383085,"l":0.3941176470588235,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#b8860b","rgb":"184,134,11","name":"","textColor":"text-dark","hsl":{"h":42.65895953757225,"s":0.8871794871794872,"l":0.38235294117647056,"a":1}},
{"type":"colorSibling","colorParent":"yellow","name":"darkgoldenrod","pass":true,"hex":"#b8860b","rgb":"184,134,11","textColor":"text-dark","hsl":{"h":42.65895953757225,"s":0.8871794871794872,"l":0.38235294117647056,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#9d8319","rgb":"157,131,25","name":"","textColor":"text-white","hsl":{"h":48.18181818181817,"s":0.7252747252747254,"l":0.3568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#aa8f00","rgb":"170,143,0","name":"","textColor":"text-dark","hsl":{"h":50.470588235294116,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#856514","rgb":"133,101,20","name":"","textColor":"text-white","hsl":{"h":43.00884955752212,"s":0.7385620915032679,"l":0.30000000000000004,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#555344","rgb":"85,83,68","name":"","textColor":"text-white","hsl":{"h":52.94117647058826,"s":0.11111111111111109,"l":0.3,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#8d6708","rgb":"141,103,8","name":"","textColor":"text-white","hsl":{"h":42.85714285714286,"s":0.8926174496644296,"l":0.29215686274509806,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#726012","rgb":"114,96,18","name":"","textColor":"text-white","hsl":{"h":48.75000000000001,"s":0.7272727272727272,"l":0.25882352941176473,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#806c00","rgb":"128,108,0","name":"","textColor":"text-white","hsl":{"h":50.625,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#634806","rgb":"99,72,6","name":"","textColor":"text-white","hsl":{"h":42.58064516129031,"s":0.8857142857142859,"l":0.20588235294117646,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#5a440d","rgb":"90,68,13","name":"","textColor":"text-white","hsl":{"h":42.85714285714285,"s":0.7475728155339807,"l":0.2019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#554800","rgb":"85,72,0","name":"","textColor":"text-white","hsl":{"h":50.8235294117647,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#483c0c","rgb":"72,60,12","name":"","textColor":"text-white","hsl":{"h":48,"s":0.7142857142857143,"l":0.16470588235294117,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"lemonchiffon","pass":true,"hex":"#2a2a22","rgb":"42,42,34","name":"","textColor":"text-white","hsl":{"h":60,"s":0.10526315789473684,"l":0.14901960784313725,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#382903","rgb":"56,41,3","name":"","textColor":"text-white","hsl":{"h":43.018867924528315,"s":0.8983050847457626,"l":0.11568627450980393,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#302407","rgb":"48,36,7","name":"","textColor":"text-white","hsl":{"h":42.43902439024391,"s":0.7454545454545454,"l":0.10784313725490197,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"gold","pass":true,"hex":"#2a2400","rgb":"42,36,0","name":"","textColor":"text-white","hsl":{"h":51.42857142857142,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#1d1905","rgb":"29,25,5","name":"","textColor":"text-white","hsl":{"h":50,"s":0.7058823529411765,"l":0.06666666666666667,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"darkgoldenrod","pass":true,"hex":"#0e0a01","rgb":"14,10,1","name":"","textColor":"text-white","hsl":{"h":41.53846153846153,"s":0.8666666666666667,"l":0.029411764705882353,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"yellow","colorSiblingParent":"goldenrod","pass":true,"hex":"#050401","rgb":"5,4,1","name":"","textColor":"text-white","hsl":{"h":45,"s":0.6666666666666666,"l":0.011764705882352941,"a":1}},
  {"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#FDE3A7","rgb":"253,227,167","name":"","textColor":"text-dark","hsl":{"h":41.86046511627906,"s":0.9555555555555557,"l":0.8235294117647058,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#ffa07a","rgb":"255,160,122","name":"","textColor":"text-dark","hsl":{"h":17.142857142857142,"s":1,"l":0.7392156862745098,"a":1}},
{"type":"colorSibling","colorParent":"orange","name":"lightsalmon","pass":true,"hex":"#ffa07a","rgb":"255,160,122","textColor":"text-dark","hsl":{"h":17.142857142857142,"s":1,"l":0.7392156862745098,"a":1}},
{"type":"colorSibling","colorParent":"orange","name":"sandybrown","pass":true,"hex":"#f4a460","rgb":"244,164,96","textColor":"text-dark","hsl":{"h":27.567567567567572,"s":0.8705882352941179,"l":0.6666666666666667,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#f4a460","rgb":"244,164,96","name":"","textColor":"text-dark","hsl":{"h":27.567567567567572,"s":0.8705882352941179,"l":0.6666666666666667,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#ff7f50","rgb":"255,127,80","name":"","textColor":"text-dark","hsl":{"h":16.114285714285714,"s":1,"l":0.6568627450980392,"a":1}},
{"type":"colorSibling","colorParent":"orange","name":"coral","pass":true,"hex":"#ff7f50","rgb":"255,127,80","textColor":"text-dark","hsl":{"h":16.114285714285714,"s":1,"l":0.6568627450980392,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F4B350","rgb":"244,179,80","name":"","textColor":"text-dark","hsl":{"h":36.21951219512194,"s":0.8817204301075271,"l":0.6352941176470588,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F2784B","rgb":"242,120,75","name":"","textColor":"text-dark","hsl":{"h":16.167664670658684,"s":0.8652849740932641,"l":0.6215686274509804,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#d48566","rgb":"212,133,102","name":"","textColor":"text-dark","hsl":{"h":16.90909090909091,"s":0.5612244897959185,"l":0.615686274509804,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#EB974E","rgb":"235,151,78","name":"","textColor":"text-dark","hsl":{"h":27.898089171974522,"s":0.7969543147208119,"l":0.6137254901960785,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F9BF3B","rgb":"249,191,59","name":"","textColor":"text-dark","hsl":{"h":41.68421052631579,"s":0.9405940594059408,"l":0.6039215686274509,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F5AB35","rgb":"245,171,53","name":"","textColor":"text-dark","hsl":{"h":36.87499999999999,"s":0.9056603773584907,"l":0.5843137254901961,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F27935","rgb":"242,121,53","name":"","textColor":"text-dark","hsl":{"h":21.587301587301585,"s":0.8790697674418604,"l":0.5784313725490196,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#EB9532","rgb":"235,149,50","name":"","textColor":"text-dark","hsl":{"h":32.10810810810811,"s":0.822222222222222,"l":0.5588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#c9874f","rgb":"201,135,79","name":"","textColor":"text-dark","hsl":{"h":27.54098360655738,"s":0.5304347826086956,"l":0.5490196078431373,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#d46a43","rgb":"212,106,67","name":"","textColor":"text-dark","hsl":{"h":16.13793103448276,"s":0.6277056277056278,"l":0.5470588235294118,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e67e22","rgb":"230,126,34","name":"","textColor":"text-dark","hsl":{"h":28.16326530612245,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e67e22","rgb":"230,126,34","name":"","textColor":"text-dark","hsl":{"h":28.16326530612245,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e63022","rgb":"230,48,34","name":"","textColor":"text-white","hsl":{"h":4.285714285714286,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e65722","rgb":"230,87,34","name":"","textColor":"text-white","hsl":{"h":16.22448979591837,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e67e22","rgb":"230,126,34","name":"","textColor":"text-dark","hsl":{"h":28.16326530612245,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6a522","rgb":"230,165,34","name":"","textColor":"text-dark","hsl":{"h":40.10204081632653,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6cc22","rgb":"230,204,34","name":"","textColor":"text-dark","hsl":{"h":52.04081632653062,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#E67E22","rgb":"230,126,34","name":"","textColor":"text-dark","hsl":{"h":28.16326530612245,"s":0.7967479674796747,"l":0.5176470588235295,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F9690E","rgb":"249,105,14","name":"","textColor":"text-dark","hsl":{"h":23.23404255319149,"s":0.9514170040485831,"l":0.5156862745098039,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F39C12","rgb":"243,156,18","name":"","textColor":"text-dark","hsl":{"h":36.800000000000004,"s":0.9036144578313252,"l":0.5117647058823529,"a":1}},
{"type":"colorSibling","colorParent":"orange","name":"orangered","pass":true,"hex":"#ff4500","rgb":"255,69,0","textColor":"text-white","hsl":{"h":16.235294117647058,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#ff8c00","rgb":"255,140,0","name":"","textColor":"text-dark","hsl":{"h":32.94117647058824,"s":1,"l":0.5,"a":1}},
{"type":"colorSibling","colorParent":"orange","name":"darkorange","pass":true,"hex":"#ff8c00","rgb":"255,140,0","textColor":"text-dark","hsl":{"h":32.94117647058824,"s":1,"l":0.5,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#ff4500","rgb":"255,69,0","name":"","textColor":"text-white","hsl":{"h":16.235294117647058,"s":1,"l":0.5,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#F89406","rgb":"248,148,6","name":"","textColor":"text-dark","hsl":{"h":35.20661157024794,"s":0.952755905511811,"l":0.4980392156862745,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#aa6b51","rgb":"170,107,81","name":"","textColor":"text-white","hsl":{"h":17.528089887640455,"s":0.3545816733067729,"l":0.492156862745098,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#E87E04","rgb":"232,126,4","name":"","textColor":"text-dark","hsl":{"h":32.10526315789475,"s":0.9661016949152541,"l":0.4627450980392157,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#aa5535","rgb":"170,85,53","name":"","textColor":"text-white","hsl":{"h":16.41025641025641,"s":0.5246636771300448,"l":0.4372549019607843,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#9f6b3f","rgb":"159,107,63","name":"","textColor":"text-white","hsl":{"h":27.499999999999996,"s":0.4324324324324324,"l":0.43529411764705883,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#bb671c","rgb":"187,103,28","name":"","textColor":"text-white","hsl":{"h":28.30188679245283,"s":0.7395348837209303,"l":0.42156862745098034,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#d43900","rgb":"212,57,0","name":"","textColor":"text-white","hsl":{"h":16.132075471698112,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#d47500","rgb":"212,117,0","name":"","textColor":"text-dark","hsl":{"h":33.11320754716981,"s":1,"l":0.41568627450980394,"a":1}},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#D35400","rgb":"211,84,0","name":"","textColor":"text-white","hsl":{"h":23.88625592417062,"s":1,"l":0.4137254901960784,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#80503d","rgb":"128,80,61","name":"","textColor":"text-white","hsl":{"h":17.01492537313433,"s":0.3544973544973544,"l":0.37058823529411766,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#aa2e00","rgb":"170,46,0","name":"","textColor":"text-white","hsl":{"h":16.23529411764706,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#aa5d00","rgb":"170,93,0","name":"","textColor":"text-white","hsl":{"h":32.82352941176471,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#804028","rgb":"128,64,40","name":"","textColor":"text-white","hsl":{"h":16.363636363636363,"s":0.5238095238095238,"l":0.32941176470588235,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#914f15","rgb":"145,79,21","name":"","textColor":"text-white","hsl":{"h":28.064516129032263,"s":0.7469879518072289,"l":0.3254901960784314,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#744e2e","rgb":"116,78,46","name":"","textColor":"text-white","hsl":{"h":27.42857142857143,"s":0.43209876543209885,"l":0.3176470588235294,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#802200","rgb":"128,34,0","name":"","textColor":"text-white","hsl":{"h":15.9375,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#804600","rgb":"128,70,0","name":"","textColor":"text-white","hsl":{"h":32.8125,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#553529","rgb":"85,53,41","name":"","textColor":"text-white","hsl":{"h":16.363636363636367,"s":0.34920634920634913,"l":0.24705882352941178,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#66380f","rgb":"102,56,15","name":"","textColor":"text-white","hsl":{"h":28.275862068965512,"s":0.7435897435897435,"l":0.22941176470588237,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#552a1b","rgb":"85,42,27","name":"","textColor":"text-white","hsl":{"h":15.517241379310345,"s":0.5178571428571428,"l":0.2196078431372549,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#4a321d","rgb":"74,50,29","name":"","textColor":"text-white","hsl":{"h":27.999999999999996,"s":0.43689320388349523,"l":0.2019607843137255,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#551700","rgb":"85,23,0","name":"","textColor":"text-white","hsl":{"h":16.23529411764706,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#552f00","rgb":"85,47,0","name":"","textColor":"text-white","hsl":{"h":33.1764705882353,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#3c2109","rgb":"60,33,9","name":"","textColor":"text-white","hsl":{"h":28.235294117647065,"s":0.7391304347826088,"l":0.13529411764705881,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"lightsalmon","pass":true,"hex":"#2a1b14","rgb":"42,27,20","name":"","textColor":"text-white","hsl":{"h":19.09090909090909,"s":0.3548387096774194,"l":0.12156862745098039,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"coral","pass":true,"hex":"#2a150d","rgb":"42,21,13","name":"","textColor":"text-white","hsl":{"h":16.551724137931036,"s":0.5272727272727272,"l":0.10784313725490197,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"sandybrown","pass":true,"hex":"#1f150c","rgb":"31,21,12","name":"","textColor":"text-white","hsl":{"h":28.421052631578945,"s":0.441860465116279,"l":0.08431372549019608,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"orangered","pass":true,"hex":"#2a0b00","rgb":"42,11,0","name":"","textColor":"text-white","hsl":{"h":15.714285714285715,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"orange","colorSiblingParent":"darkorange","pass":true,"hex":"#2a1700","rgb":"42,23,0","name":"","textColor":"text-white","hsl":{"h":32.85714285714286,"s":1,"l":0.08235294117647059,"a":1}},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#110a03","rgb":"17,10,3","name":"","textColor":"text-white","hsl":{"h":30,"s":0.7,"l":0.0392156862745098,"a":1}},
{"type":"colorSibling","colorParent":"red","name":"tomato","pass":true,"hex":"#ff6347","rgb":"255,99,71","textColor":"text-dark","hsl":{"h":9.130434782608695,"s":1,"l":0.6392156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#ff6347","rgb":"255,99,71","name":"","textColor":"text-dark","hsl":{"h":9.130434782608695,"s":1,"l":0.6392156862745098,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#EF4836","rgb":"239,72,54","name":"","textColor":"text-white","hsl":{"h":5.837837837837839,"s":0.8525345622119815,"l":0.5745098039215686,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e76e3c","rgb":"231,110,60","name":"","textColor":"text-dark","hsl":{"h":17.543859649122805,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e74c3c","rgb":"231,76,60","name":"","textColor":"text-white","hsl":{"h":5.614035087719298,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e73c70","rgb":"231,60,112","name":"","textColor":"text-white","hsl":{"h":341.7543859649123,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e7903c","rgb":"231,144,60","name":"","textColor":"text-dark","hsl":{"h":29.473684210526315,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e74c3c","rgb":"231,76,60","name":"","textColor":"text-white","hsl":{"h":5.614035087719298,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#E74C3C","rgb":"231,76,60","name":"","textColor":"text-white","hsl":{"h":5.614035087719298,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e74c3c","rgb":"231,76,60","name":"","textColor":"text-white","hsl":{"h":5.614035087719298,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e73c4e","rgb":"231,60,78","name":"","textColor":"text-white","hsl":{"h":353.6842105263158,"s":0.7808219178082192,"l":0.5705882352941176,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#D24D57","rgb":"210,77,87","name":"","textColor":"text-white","hsl":{"h":355.4887218045113,"s":0.5964125560538116,"l":0.5627450980392157,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#D64541","rgb":"214,69,65","name":"","textColor":"text-white","hsl":{"h":1.610738255033557,"s":0.6450216450216452,"l":0.5470588235294118,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#d4533b","rgb":"212,83,59","name":"","textColor":"text-white","hsl":{"h":9.411764705882351,"s":0.6401673640167367,"l":0.5313725490196078,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#dc2a2a","rgb":"220,42,42","name":"","textColor":"text-white","hsl":{"h":0,"s":0.7177419354838711,"l":0.5137254901960785,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#F22613","rgb":"242,38,19","name":"","textColor":"text-white","hsl":{"h":5.112107623318385,"s":0.895582329317269,"l":0.5117647058823529,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#FF0000","rgb":"255,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.5,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#D91E18","rgb":"217,30,24","name":"","textColor":"text-white","hsl":{"h":1.8652849740932642,"s":0.8008298755186722,"l":0.4725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"red","name":"crimson","pass":true,"hex":"#dc143c","rgb":"220,20,60","textColor":"text-white","hsl":{"h":348,"s":0.8333333333333335,"l":0.47058823529411764,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#dc143c","rgb":"220,20,60","name":"","textColor":"text-white","hsl":{"h":348,"s":0.8333333333333335,"l":0.47058823529411764,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#bc3e31","rgb":"188,62,49","name":"","textColor":"text-white","hsl":{"h":5.6115107913669044,"s":0.5864978902953587,"l":0.4647058823529412,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#C0392B","rgb":"192,57,43","name":"","textColor":"text-white","hsl":{"h":5.637583892617451,"s":0.6340425531914893,"l":0.4607843137254902,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#e00000","rgb":"224,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.4392156862745098,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#aa422f","rgb":"170,66,47","name":"","textColor":"text-white","hsl":{"h":9.26829268292683,"s":0.5668202764976958,"l":0.42549019607843136,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#d50000","rgb":"213,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.4176470588235294,"a":1}},
{"type":"colorSibling","colorParent":"red","name":"firebrick","pass":true,"hex":"#b22222","rgb":"178,34,34","textColor":"text-white","hsl":{"h":0,"s":0.679245283018868,"l":0.4156862745098039,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#b22222","rgb":"178,34,34","name":"","textColor":"text-white","hsl":{"h":0,"s":0.679245283018868,"l":0.4156862745098039,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#CF000F","rgb":"207,0,15","name":"","textColor":"text-white","hsl":{"h":355.65217391304344,"s":1,"l":0.40588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#b11030","rgb":"177,16,48","name":"","textColor":"text-white","hsl":{"h":348.07453416149065,"s":0.8341968911917098,"l":0.3784313725490196,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#923026","rgb":"146,48,38","name":"","textColor":"text-white","hsl":{"h":5.555555555555556,"s":0.5869565217391304,"l":0.3607843137254902,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#b50000","rgb":"181,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.35490196078431374,"a":1}},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#96281B","rgb":"150,40,27","name":"","textColor":"text-white","hsl":{"h":6.341463414634146,"s":0.6949152542372882,"l":0.34705882352941175,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#aa0000","rgb":"170,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.3333333333333333,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#803224","rgb":"128,50,36","name":"","textColor":"text-white","hsl":{"h":9.130434782608695,"s":0.5609756097560976,"l":0.32156862745098036,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#871a1a","rgb":"135,26,26","name":"","textColor":"text-white","hsl":{"h":0,"s":0.6770186335403727,"l":0.3156862745098039,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#870c25","rgb":"135,12,37","name":"","textColor":"text-white","hsl":{"h":347.8048780487805,"s":0.8367346938775511,"l":0.28823529411764703,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#8b0000","rgb":"139,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"colorSibling","colorParent":"red","name":"darkred","pass":true,"hex":"#8b0000","rgb":"139,0,0","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.2725490196078431,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#67221b","rgb":"103,34,27","name":"","textColor":"text-white","hsl":{"h":5.526315789473684,"s":0.5846153846153846,"l":0.2549019607843137,"a":1}},
{"type":"colorSibling","colorParent":"red","name":"maroon","pass":true,"hex":"#800000","rgb":"128,0,0","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#800000","rgb":"128,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.25098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#5d1212","rgb":"93,18,18","name":"","textColor":"text-white","hsl":{"h":0,"s":0.6756756756756755,"l":0.21764705882352942,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#552118","rgb":"85,33,24","name":"","textColor":"text-white","hsl":{"h":8.852459016393446,"s":0.5596330275229358,"l":0.21372549019607842,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#5c0819","rgb":"92,8,25","name":"","textColor":"text-white","hsl":{"h":347.85714285714283,"s":0.84,"l":0.19607843137254902,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#600000","rgb":"96,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.18823529411764706,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#550000","rgb":"85,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.16666666666666666,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#3d1410","rgb":"61,20,16","name":"","textColor":"text-white","hsl":{"h":5.333333333333333,"s":0.5844155844155844,"l":0.15098039215686276,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#320a0a","rgb":"50,10,10","name":"","textColor":"text-white","hsl":{"h":0,"s":0.6666666666666666,"l":0.11764705882352941,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#32050e","rgb":"50,5,14","name":"","textColor":"text-white","hsl":{"h":348,"s":0.818181818181818,"l":0.10784313725490197,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"tomato","pass":true,"hex":"#2a100c","rgb":"42,16,12","name":"","textColor":"text-white","hsl":{"h":8,"s":0.5555555555555556,"l":0.10588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#360000","rgb":"54,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.10588235294117647,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#2b0000","rgb":"43,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.08431372549019608,"a":1}},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#120605","rgb":"18,6,5","name":"","textColor":"text-white","hsl":{"h":4.615384615384616,"s":0.5652173913043478,"l":0.045098039215686274,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"darkred","pass":true,"hex":"#0b0000","rgb":"11,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":1,"l":0.021568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"firebrick","pass":true,"hex":"#080202","rgb":"8,2,2","name":"","textColor":"text-white","hsl":{"h":0,"s":0.6,"l":0.0196078431372549,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"crimson","pass":true,"hex":"#070102","rgb":"7,1,2","name":"","textColor":"text-white","hsl":{"h":350,"s":0.75,"l":0.01568627450980392,"a":1}},
{"type":"colorSiblingTinyColor","colorParent":"red","colorSiblingParent":"maroon","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white","hsl":{"h":0,"s":0,"l":0,"a":1}}
    ],
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
    fontWeights: [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ],
    colorModels: [
      { label: 'hex'},
      { label: 'rgb' }
    ]
  }
});
