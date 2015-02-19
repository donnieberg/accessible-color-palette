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
  $scope.fontFamily = $scope.allFontFamilies[12];
  $scope.fontSize = 24;
  $scope.fontWeight = 400;
  $scope.backgroundColor = { hex: '#ffffff'};
  $scope.currentTextColor = { hex: '#000', rgb: '0,0,0', currentRatio: 21, pass: true, textColor: 'text-white' };
  $scope.WCAGlevel = 'AA';
  $scope.isIntroActive = true;
  $scope.isSection1Active = false;
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
   * Set focus to first color tile
   */
  $scope.focusFirstTile = function() {
    $('#Container li:first-child a').focus();
  };


  /**
   * Show/hide Instructions 1 and 2 Modals.
   * Only show if it's the users' first time to website using HTML5 Local Storage
   */
  var isLocalStorageNameSupported = function() {
    var testKey = 'test', storage = window.sessionStorage;
    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  var trapKeyEventToBtn = function(event, itemToFocus) {
    $(document).bind('keyup', function(event) {
      if(event.which === 9){
        event.preventDefault();
        $(itemToFocus).focus();
      }
    });
  };

  $scope.showInstructions1 = function(event) {
    if(isLocalStorageNameSupported()){
      if (!localStorage['instructions1']) {
        localStorage['instructions1'] = 'yes';
        $scope.isInstructions1Active = true;
        $timeout(function() {
          var btn = $('#instructions1Btn');
          btn.focus();
          trapKeyEventToBtn(event, btn);
        }, 0);
      }
    }
  };

  $scope.hideInstructions1 = function() {
    $scope.isInstructions1Active = false;
    $(document).unbind('keyup');
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
    if(isLocalStorageNameSupported()){
      if (!localStorage['instructions3']) {
        localStorage['instructions3'] = 'yes';
        $scope.isInstructions3Active = true;
        $scope.instructions3message = message;
        $timeout(function() {
          var btn = $('#instructions3Btn');
          btn.focus();
          trapKeyEventToBtn(event, btn);
        }, 0);
      }
    }
  };

  $scope.hideInstructions3 = function() {
    $scope.isInstructions3Active = false;
    $(document).unbind('keyup');
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
    $('#Container').mixItUp('destroy');
    //console.log('the currentColorFilter before destroy is: ', $scope.currentColorFilter);
  };


  /**
   * On Scroll, pin toolbar to top when picking colors from tiles
   */
  $document.on('scroll', function() {
    var userContentTop = $('#pinToolbar').position().top;
    if(userContentTop >= $document.scrollTop() ){
      $scope.pinToolbar = false;
      $scope.blurGenerateBtn = 0;
    }else{
      $scope.pinToolbar = true;
      $scope.blurGenerateBtn = -1;
    }
    $scope.$apply();
  });


  /**
   * Show/hide info left panel
   */
  var focusableElementsString ="a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";

  $scope.toggleInfoPanel = function() {
    if(!$scope.isLeftSlideOpen){
      $scope.isLeftSlideOpen = true;
      $timeout(function() {
        $('#closePanel').focus();

        $(document).bind('keydown', function(evt) {
          // if tab or shift-tab pressed
          if ( evt.which == 9 ) {

            // get list of all children elements in given object
            var o = $('#infoPanel').find('*');

            // get list of focusable items
            var focusableItems;
            focusableItems = o.filter(focusableElementsString).filter(':visible')

          // get currently focused item
          var focusedItem;
        focusedItem = jQuery(':focus');

        // get the number of focusable items
        var numberOfFocusableItems;
        numberOfFocusableItems = focusableItems.length

          // get the index of the currently focused item
          var focusedItemIndex;
        focusedItemIndex = focusableItems.index(focusedItem);

        if (evt.shiftKey) {
          //console.log('backwards');
          //back tab
          // if focused on first item and user preses back-tab, go to the last focusable item
          if(focusedItemIndex==0){
            //console.log('backwards from first item');
            focusableItems.get(numberOfFocusableItems-1).focus();
            evt.preventDefault();
          }

        } else {
          //console.log('forwards');
          //forward tab
          // if focused on the last item and user preses tab, go to the first focusable item
          if(focusedItemIndex==numberOfFocusableItems-1){
            //console.log('forwards from last item');
            focusableItems.get(0).focus();
            evt.preventDefault();
          }
        }
          }
        });
      }, 500);
    }else{
      $scope.isLeftSlideOpen = false;
      $(document).unbind('keydown');
      $scope.focusFirstTile();
    }
  };


  /*
   * Auto Update Font Size, Font Weight, or WCAG level to return more color options
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
      $scope.fontSize = 24;
      $scope.showInstructions3('We increased the font size to 18pt (24px) which is considered "Large Text" by WCAG standards. Large Text has a lower contrast ratio requirement of 3.1 and allows more colors to meet it.');
    }
    if($scope.updateFW){
      $scope.fontWeight = 700;
      $scope.showInstructions3('We increased the font weight to 700. Text 14pt and above and bold is considered "Large Text" by WCAG standards. Large Text has a lower contrast ratio requirement of 3.1 and allows more colors to meet it.');
    }
    $scope.getCurrentRatio();
    $scope.getPassingColors();
    $scope.activatePalette();
    $timeout(function() {
      $scope.updateFS = false;
      $scope.updateFW = false;
    }, 600)
  }

  $scope.toggleWCAGToolTip = function() {
    $scope.showWCAGToolTip = !$scope.showWCAGToolTip;
  };


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
    $scope.WCAGlevel === 'AAA' ? $scope.AAAlevel = true : $scope.AAAlevel = false;
    ($scope.fontSize >= 24 || ($scope.fontSize >= 18 && $scope.fontWeight >=700)) ? $scope.smallFontSize = false : $scope.smallFontSize = true;

    if($scope.smallFontSize){
      $scope.AAAlevel ? $scope.currentRatio = 7.0 : $scope.currentRatio = 4.5;
    }else{
      $scope.AAAlevel ? $scope.currentRatio = 4.5 : $scope.currentRatio = 3.1;
    }

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
      //{ hex: '#D2527F', rgb: '210, 82, 127', name: 'pink', textColor: 'text-white' },
      { hex: '#34495E', rgb: '52, 73, 94', name: 'gray', textColor: 'text-white', },
      { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', textColor: 'text-dark' },
      { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', textColor: 'text-white' },
      { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', textColor: 'text-white' }
    ],
    allColors: [
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#c8f7c5","rgb":"200,247,197","name":"","textColor":"text-dark","brightness":233.31573243139863},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#7fffd4","rgb":"127,255,212","name":"aquamarine","textColor":"text-dark","brightness":227.76206005390802},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#baf73c","rgb":"186,247,60","name":"","textColor":"text-dark","brightness":225.2546447911785},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#98fb98","rgb":"152,251,152","name":"palegreen","textColor":"text-dark","brightness":225.10625713204863},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00ff7f","rgb":"0,255,127","name":"springgreen","textColor":"text-dark","brightness":214.54381137660437},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#90ee90","rgb":"144,238,144","name":"lightgreen","textColor":"text-dark","brightness":213.42077687048183},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00ff00","rgb":"0,255,0","name":"lime","textColor":"text-dark","brightness":211.97234489432813},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00fa9a","rgb":"0,250,154","name":"mediumspringgreen","textColor":"text-dark","brightness":211.66054899295713},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#38f689","rgb":"56,246,137","name":"","textColor":"text-dark","brightness":209.400630371544},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#a2ded0","rgb":"162,222,208","name":"","textColor":"text-dark","brightness":208.13937638034758},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3cf73c","rgb":"60,247,60","name":"","textColor":"text-dark","brightness":208.0135067729978},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#abe338","rgb":"171,227,56","name":"","textColor":"text-dark","brightness":207.04315492186646},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#86e2d5","rgb":"134,226,213","name":"","textColor":"text-dark","brightness":206.65431038330652},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4ae08c","rgb":"74,224,140","name":"","textColor":"text-dark","brightness":193.1945444364307},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4add8c","rgb":"74,221,140","name":"","textColor":"text-dark","brightness":190.7921565473801},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#87d37c","rgb":"135,211,124","name":"","textColor":"text-dark","brightness":190.26771665208997},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#6ad4b1","rgb":"106,212,177","name":"","textColor":"text-dark","brightness":189.45857594735583},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#9acd32","rgb":"154,205,50","name":"yellowgreen","textColor":"text-dark","brightness":186.88186375354886},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#36d7b7","rgb":"54,215,183","name":"","textColor":"text-dark","brightness":186.87290600833498},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#7ed07e","rgb":"126,208,126","name":"","textColor":"text-dark","brightness":186.55055078985964},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#90c695","rgb":"144,198,149","name":"","textColor":"text-dark","brightness":183.2948662674435},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4ecdc4","rgb":"78,205,196","name":"","textColor":"text-dark","brightness":181.98298546842227},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#66cc99","rgb":"102,204,153","name":"","textColor":"text-dark","brightness":181.26177754838443},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#65c6bb","rgb":"101,198,187","name":"","textColor":"text-dark","brightness":178.67931329619552},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00d46a","rgb":"0,212,106","name":"","textColor":"text-dark","brightness":178.3826000483231},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2eccb0","rgb":"46,204,176","name":"","textColor":"text-dark","brightness":177.12419371728978},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00d400","rgb":"0,212,0","name":"","textColor":"text-white","brightness":176.22798869646104},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00cf80","rgb":"0,207,128","name":"","textColor":"text-dark","brightness":175.2791231151046},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc91","rgb":"46,204,145","name":"","textColor":"text-dark","brightness":175.20363009937893},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#68c3a3","rgb":"104,195,163","name":"","textColor":"text-dark","brightness":175.18168568660366},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#76c376","rgb":"118,195,118","name":"","textColor":"text-dark","brightness":174.86506512165315},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2ecc71","rgb":"46,204,113","name":"","textColor":"text-dark","brightness":173.59407824001372},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03c9a9","rgb":"3,201,169","name":"","textColor":"text-dark","brightness":172.80453697747637},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#32cd32","rgb":"50,205,50","name":"limegreen","textColor":"text-dark","brightness":172.66086701971585},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc51","rgb":"46,204,81","name":"","textColor":"text-dark","brightness":172.3738959355505},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc32","rgb":"46,204,50","name":"","textColor":"text-dark","brightness":171.5710115374972},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#3fc380","rgb":"63,195,128","name":"","textColor":"text-dark","brightness":168.3624542467827},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#8bb82d","rgb":"139,184,45","name":"","textColor":"text-dark","brightness":167.89448174374286},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26c281","rgb":"38,194,129","name":"","textColor":"text-dark","brightness":165.78922763557347},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1bbc9b","rgb":"27,188,155","name":"","textColor":"text-dark","brightness":161.96324583065135},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2abb9b","rgb":"42,187,155","name":"","textColor":"text-dark","brightness":161.93332887333602},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3cb572","rgb":"60,181,114","name":"","textColor":"text-dark","brightness":156.1703525000824},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#3cb371","rgb":"60,179,113","name":"mediumseagreen","textColor":"text-dark","brightness":154.51932888800675},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4daf7c","rgb":"77,175,124","name":"","textColor":"text-dark","brightness":153.74112006877016},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#55aa8d","rgb":"85,170,141","name":"","textColor":"text-dark","brightness":151.86518034098532},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#00b16a","rgb":"0,177,106","name":"","textColor":"text-white","brightness":149.70767181410577},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#65a665","rgb":"101,166,101","name":"","textColor":"text-dark","brightness":148.97417561443325},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#7aa228","rgb":"122,162,40","name":"","textColor":"text-dark","brightness":147.75130456276858},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00aa55","rgb":"0,170,85","name":"","textColor":"text-white","brightness":143.04265098214586},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1ba39c","rgb":"27,163,156","name":"","textColor":"text-white","brightness":142.09052044383537},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03a678","rgb":"3,166,120","name":"","textColor":"text-white","brightness":141.50111306982714},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00aa00","rgb":"0,170,0","name":"","textColor":"text-white","brightness":141.31489659621874},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26a65b","rgb":"38,166,91","name":"","textColor":"text-white","brightness":141.25263891340225},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00a566","rgb":"0,165,102","name":"","textColor":"text-white","brightness":139.71380389925685},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#16a085","rgb":"22,160,133","name":"","textColor":"text-white","brightness":137.87347823276235},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#5d995d","rgb":"93,153,93","name":"","textColor":"text-dark","brightness":137.2886011291542},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#24a159","rgb":"36,161,89","name":"","textColor":"text-white","brightness":136.9758190338718},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#28a228","rgb":"40,162,40","name":"","textColor":"text-white","brightness":136.48810937220867},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#019875","rgb":"1,152,117","name":"","textColor":"text-white","brightness":129.9844490698791},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#6b8e23","rgb":"107,142,35","name":"olivedrab","textColor":"text-white","brightness":129.52155419079867},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#049372","rgb":"4,147,114","name":"","textColor":"text-white","brightness":125.77520820893122},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#008b8b","rgb":"0,139,139","name":"darkcyan","textColor":"text-white","brightness":121.09764242131223},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#2e8b57","rgb":"46,139,87","name":"seagreen","textColor":"text-white","brightness":119.89770222985926},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2e8856","rgb":"46,136,86","name":"","textColor":"text-white","brightness":117.44624302207372},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#40806a","rgb":"64,128,106","name":"","textColor":"text-white","brightness":114.3351564480497},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1e824c","rgb":"30,130,76","name":"","textColor":"text-white","brightness":110.84930311012333},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4b7b4b","rgb":"75,123,75","name":"","textColor":"text-white","brightness":110.41858539213405},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#5a781d","rgb":"90,120,29","name":"","textColor":"text-white","brightness":109.3603584485713},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#008040","rgb":"0,128,64","name":"","textColor":"text-white","brightness":107.70270191596866},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#007a7c","rgb":"0,122,124","name":"","textColor":"text-white","brightness":106.44440802597381},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#008000","rgb":"0,128,0","name":"","textColor":"text-white","brightness":106.40180449597648},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#007a4b","rgb":"0,122,75","name":"","textColor":"text-white","brightness":103.28283497270976},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#1b7742","rgb":"27,119,66","name":"","textColor":"text-white","brightness":101.27757896000476},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#1d781d","rgb":"29,120,29","name":"","textColor":"text-white","brightness":101.04587571989269},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#436e43","rgb":"67,110,67","name":"","textColor":"text-white","brightness":98.73297827980274},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4b6319","rgb":"75,99,25","name":"","textColor":"text-white","brightness":90.39145977358702},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#006060","rgb":"0,96,96","name":"","textColor":"text-white","brightness":83.63578181615809},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#20603c","rgb":"32,96,60","name":"","textColor":"text-white","brightness":82.82415106718571},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#345a5e","rgb":"52,90,94","name":"","textColor":"text-white","brightness":82.76238275931885},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#205e3b","rgb":"32,94,59","name":"","textColor":"text-white","brightness":81.17369031896972},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2a5547","rgb":"42,85,71","name":"","textColor":"text-white","brightness":75.89721338758096},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#005555","rgb":"0,85,85","name":"","textColor":"text-white","brightness":74.0525151497233},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#315131","rgb":"49,81,49","name":"","textColor":"text-white","brightness":72.6330503283457},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00552a","rgb":"0,85,42","name":"","textColor":"text-white","brightness":71.50123775152427},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#005500","rgb":"0,85,0","name":"","textColor":"text-white","brightness":70.65744829810937},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3a4d13","rgb":"58,77,19","name":"","textColor":"text-white","brightness":70.22970169379904},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#005031","rgb":"0,80,49","name":"","textColor":"text-white","brightness":67.71756049947457},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#134d13","rgb":"19,77,19","name":"","textColor":"text-white","brightness":64.8728602729986},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#114c2a","rgb":"17,76,42","name":"","textColor":"text-white","brightness":64.65923754576758},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#294429","rgb":"41,68,41","name":"","textColor":"text-white","brightness":60.9476250562727},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2b390e","rgb":"43,57,14","name":"","textColor":"text-white","brightness":51.99996153844731},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#003636","rgb":"0,54,54","name":"","textColor":"text-white","brightness":47.045127271588925},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#123622","rgb":"18,54,34","name":"","textColor":"text-white","brightness":46.60094419644306},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#113321","rgb":"17,51,33","name":"","textColor":"text-white","brightness":44.056690751802954},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#152a23","rgb":"21,42,35","name":"","textColor":"text-white","brightness":37.53005462292854},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002a15","rgb":"0,42,21","name":"","textColor":"text-white","brightness":35.33994906617722},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002a00","rgb":"0,42,0","name":"","textColor":"text-white","brightness":34.91309210024228},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#172617","rgb":"23,38,23","name":"","textColor":"text-white","brightness":34.077338511098546},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002627","rgb":"0,38,39","name":"","textColor":"text-white","brightness":33.18481580482254},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#1a2309","rgb":"26,35,9","name":"","textColor":"text-white","brightness":31.857479498541625},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002517","rgb":"0,37,23","name":"","textColor":"text-white","brightness":31.336097395814942},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#082213","rgb":"8,34,19","name":"","textColor":"text-white","brightness":28.961491674290535},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#e0ffff","rgb":"224,255,255","name":"lightcyan","textColor":"text-dark","brightness":247.88382561191844},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#e4f1fe","rgb":"228,241,254","name":"","textColor":"text-dark","brightness":238.84974984286671},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#c5eff7","rgb":"197,239,247","name":"","textColor":"text-dark","brightness":230.15688562369797},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00ffff","rgb":"0,255,255","name":"aqua","textColor":"text-dark","brightness":222.1575454491699},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00f8fb","rgb":"0,248,251","name":"","textColor":"text-dark","brightness":216.2945491684892},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#add8e6","rgb":"173,216,230","name":"lightblue","textColor":"text-dark","brightness":207.48345717189116},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#bbd4d4","rgb":"187,212,212","name":"","textColor":"text-dark","brightness":206.25233332013482},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00e0e0","rgb":"0,224,224","name":"","textColor":"text-dark","brightness":195.15015757103552},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34dbdb","rgb":"52,219,219","name":"","textColor":"text-dark","brightness":192.49431939670322},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#81cfe0","rgb":"129,207,224","name":"","textColor":"text-dark","brightness":192.43468502325666},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#89c4f4","rgb":"137,196,244","name":"","textColor":"text-dark","brightness":187.3959257828195},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00d4d4","rgb":"0,212,212","name":"","textColor":"text-dark","brightness":184.69568484401577},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00ced1","rgb":"0,206,209","name":"darkturquoise","textColor":"text-dark","brightness":179.70415688013452},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#6bb9f0","rgb":"107,185,240","name":"","textColor":"text-dark","brightness":174.1421373476276},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00bfff","rgb":"0,191,255","name":"deepskyblue","textColor":"text-dark","brightness":172.13387522507008},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#8db0bb","rgb":"141,176,187","name":"","textColor":"text-dark","brightness":169.0373597758791},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34b9db","rgb":"52,185,219","name":"","textColor":"text-dark","brightness":166.01953800682617},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#95aaaa","rgb":"149,170,170","name":"","textColor":"text-dark","brightness":165.1833556990534},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#19b5fe","rgb":"25,181,254","name":"","textColor":"text-dark","brightness":164.8501258719568},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#52b3d9","rgb":"82,179,217","name":"","textColor":"text-dark","brightness":164.20373625469063},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#59abe3","rgb":"89,171,227","name":"","textColor":"text-dark","brightness":160.05768959971903},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00b5b5","rgb":"0,181,181","name":"","textColor":"text-white","brightness":157.6882969658814},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22a7f0","rgb":"34,167,240","name":"","textColor":"text-dark","brightness":153.1884297197409},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00aaaa","rgb":"0,170,170","name":"","textColor":"text-white","brightness":148.1050302994466},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#6495ed","rgb":"100,149,237","name":"cornflowerblue","textColor":"text-dark","brightness":146.86859092399573},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#009fd4","rgb":"0,159,212","name":"","textColor":"text-white","brightness":143.2667546920778},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00a4a6","rgb":"0,164,166","name":"","textColor":"text-white","brightness":143.03476500487565},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#5c97bf","rgb":"92,151,191","name":"","textColor":"text-dark","brightness":142.3939008525295},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3498db","rgb":"52,152,219","name":"","textColor":"text-dark","brightness":140.9889215505956},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#1e90ff","rgb":"30,144,255","name":"dodgerblue","textColor":"text-white","brightness":137.7213708906501},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#638bb3","rgb":"99,139,179","name":"","textColor":"text-dark","brightness":133.75963516696658},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#6d8891","rgb":"109,136,145","name":"","textColor":"text-dark","brightness":130.66658715983974},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1e8bc3","rgb":"30,139,195","name":"","textColor":"text-white","brightness":127.09606996284346},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4183d7","rgb":"65,131,215","name":"","textColor":"text-white","brightness":126.56925377041613},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#67809f","rgb":"103,128,159","name":"","textColor":"text-white","brightness":124.88883456898779},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#527ac2","rgb":"82,122,194","name":"","textColor":"text-white","brightness":120.26876568752171},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3477db","rgb":"52,119,219","name":"","textColor":"text-white","brightness":117.03957877572869},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4b77be","rgb":"75,119,190","name":"","textColor":"text-white","brightness":116.60049742604016},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1978d4","rgb":"25,120,212","name":"","textColor":"text-white","brightness":114.7049127108338},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#007faa","rgb":"0,127,170","name":"","textColor":"text-white","brightness":114.50038864562862},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#2a7ab0","rgb":"42,122,176","name":"","textColor":"text-white","brightness":113.2092575719848},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#008080","rgb":"0,128,128","name":"","textColor":"text-white","brightness":111.51437575487745},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2574a9","rgb":"37,116,169","name":"","textColor":"text-white","brightness":107.56473864608233},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#336e7b","rgb":"51,110,123","name":"","textColor":"text-white","brightness":100.0835301136006},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#406098","rgb":"64,96,152","name":"","textColor":"text-white","brightness":94.4799661303919},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3455db","rgb":"52,85,219","name":"","textColor":"text-white","brightness":94.36888788154705},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1460aa","rgb":"20,96,170","name":"","textColor":"text-white","brightness":91.81424726043339},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#006080","rgb":"0,96,128","name":"","textColor":"text-white","brightness":86.50068207823566},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#205d86","rgb":"32,93,134","name":"","textColor":"text-white","brightness":86.28007301804976},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3a539b","rgb":"58,83,155","name":"","textColor":"text-white","brightness":84.88063972426221},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#34495e","rgb":"52,73,94","name":"","textColor":"text-white","brightness":70.24849464579295},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#005051","rgb":"0,80,81","name":"","textColor":"text-white","brightness":69.77498118953527},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0f4880","rgb":"15,72,128","name":"","textColor":"text-white","brightness":68.92373321287813},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#2e456d","rgb":"46,69,109","name":"","textColor":"text-white","brightness":67.88015173819223},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34415e","rgb":"52,65,94","name":"","textColor":"text-white","brightness":64.59092041455982},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1f3a93","rgb":"31,58,147","name":"","textColor":"text-white","brightness":63.44711971397914},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2c3e50","rgb":"44,62,80","name":"","textColor":"text-white","brightness":59.64880552031197},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#16405b","rgb":"22,64,91","name":"","textColor":"text-white","brightness":59.24599564527547},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34385e","rgb":"52,56,94","name":"","textColor":"text-white","brightness":58.476388397369405},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0000e0","rgb":"0,0,224","name":"","textColor":"text-white","brightness":58.41205355061574},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#004055","rgb":"0,64,85","name":"","textColor":"text-white","brightness":57.633636012314895},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#2d383c","rgb":"45,56,60","name":"","textColor":"text-white","brightness":53.84980037103202},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0000b5","rgb":"0,0,181","name":"","textColor":"text-white","brightness":47.19902541366718},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22313f","rgb":"34,49,63","name":"","textColor":"text-white","brightness":46.98488054683123},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0a3055","rgb":"10,48,85","name":"","textColor":"text-white","brightness":45.907123630216695},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1c2a43","rgb":"28,42,67","name":"","textColor":"text-white","brightness":41.38985382916929},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#252a2a","rgb":"37,42,42","name":"","textColor":"text-white","brightness":40.85100977944119},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#002a2a","rgb":"0,42,42","name":"","textColor":"text-white","brightness":36.59065454456916},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00008b","rgb":"0,0,139","name":"darkblue","textColor":"text-white","brightness":36.24676537292673},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#0c2231","rgb":"12,34,49","name":"","textColor":"text-white","brightness":31.571632837089687},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00202a","rgb":"0,32,42","name":"","textColor":"text-white","brightness":28.766925452679157},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000060","rgb":"0,0,96","name":"","textColor":"text-white","brightness":25.033737235978172},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#05182a","rgb":"5,24,42","name":"","textColor":"text-white","brightness":22.89089338579864},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000036","rgb":"0,0,54","name":"","textColor":"text-white","brightness":14.081477195237722},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#ffecdb","rgb":"255,236,219","name":"","textColor":"text-dark","brightness":239.62117811245315},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#dcc6e0","rgb":"220,198,224","name":"","textColor":"text-dark","brightness":205.34442286071467},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#f1a9a0","rgb":"241,169,160","name":"","textColor":"text-dark","brightness":188.34535300877482},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#dda0dd","rgb":"221,160,221","name":"plum","textColor":"text-dark","brightness":181.05653536948066},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#aea8d3","rgb":"174,168,211","name":"","textColor":"text-dark","brightness":172.70416323875924},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#be90d4","rgb":"190,144,212","name":"","textColor":"text-dark","brightness":161.5081050597771},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#e08283","rgb":"224,130,131","name":"","textColor":"text-dark","brightness":157.91536973961718},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#fc6399","rgb":"252,99,153","name":"","textColor":"text-dark","brightness":153.84656967251496},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b381b3","rgb":"179,129,179","name":"","textColor":"text-dark","brightness":146.28602120503515},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#e26a6a","rgb":"226,106,106","name":"","textColor":"text-dark","brightness":144.35179250705548},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#bf6ee0","rgb":"191,110,224","name":"","textColor":"text-dark","brightness":143.40498247968932},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#ff00ff","rgb":"255,0,255","name":"fuchsia","textColor":"text-white","brightness":141.74880951881042},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#bf55ec","rgb":"191,85,236","name":"","textColor":"text-dark","brightness":132.5583795917859},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#d252b2","rgb":"210,82,178","name":"","textColor":"text-dark","brightness":132.0185441519486},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9370db","rgb":"147,112,219","name":"mediumpurple","textColor":"text-dark","brightness":130.9084451057303},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#d25299","rgb":"210,82,153","name":"","textColor":"text-dark","brightness":129.86991953489462},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#d25852","rgb":"210,88,82","name":"","textColor":"text-white","brightness":128.20466450172552},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#d2527f","rgb":"210,82,127","name":"","textColor":"text-white","brightness":127.94981828826488},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#e73c70","rgb":"231,60,112","name":"","textColor":"text-white","brightness":127.28155011626784},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#f62459","rgb":"246,36,89","name":"","textColor":"text-white","brightness":126.5642919626227},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#d25265","rgb":"210,82,101","name":"","textColor":"text-white","brightness":126.3647577451878},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#e000e0","rgb":"224,0,224","name":"","textColor":"text-white","brightness":124.51660130279818},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#b659ac","rgb":"182,89,172","name":"","textColor":"text-white","brightness":124.37044263007186},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#ae59b6","rgb":"174,89,182","name":"","textColor":"text-white","brightness":122.56573338417226},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b93cf6","rgb":"185,60,246","name":"","textColor":"text-white","brightness":121.86432209633794},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#d400d4","rgb":"212,0,212","name":"","textColor":"text-white","brightness":117.84606909014828},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9b59b6","rgb":"155,89,182","name":"","textColor":"text-white","brightness":116.25776533204136},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7462e0","rgb":"116,98,224","name":"","textColor":"text-white","brightness":115.28758823047691},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#886288","rgb":"136,98,136","name":"","textColor":"text-white","brightness":111.1378783313772},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#db0a5b","rgb":"219,10,91","name":"","textColor":"text-white","brightness":110.41199663080094},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#8859b6","rgb":"136,89,182","name":"","textColor":"text-white","brightness":110.37834479643188},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b200fd","rgb":"178,0,253","name":"","textColor":"text-white","brightness":109.49180791273838},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#7659b6","rgb":"118,89,182","name":"","textColor":"text-white","brightness":105.26883204443754},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#765ab0","rgb":"118,90,176","name":"","textColor":"text-white","brightness":105.16250282301196},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#a74165","rgb":"167,65,101","name":"","textColor":"text-white","brightness":101.6582116702827},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9932cc","rgb":"153,50,204","name":"darkorchid","textColor":"text-white","brightness":100.98988563217605},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b500b5","rgb":"181,0,181","name":"","textColor":"text-white","brightness":100.61386087413602},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#8e44ad","rgb":"142,68,173","name":"","textColor":"text-white","brightness":100.4483947109161},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#8a2be2","rgb":"138,43,226","name":"blueviolet","textColor":"text-white","brightness":96.64590524176387},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#aa00aa","rgb":"170,0,170","name":"","textColor":"text-white","brightness":94.49920634587362},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#913d88","rgb":"145,61,136","name":"","textColor":"text-white","brightness":94.31841813771051},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#5e50b5","rgb":"94,80,181","name":"","textColor":"text-white","brightness":93.6996478115046},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9400d3","rgb":"148,0,211","name":"darkviolet","textColor":"text-white","brightness":91.1388610857081},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9a12b3","rgb":"154,18,179","name":"","textColor":"text-white","brightness":90.10120975880402},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#77448b","rgb":"119,68,139","name":"","textColor":"text-white","brightness":89.00456729853812},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#5a4586","rgb":"90,69,134","name":"","textColor":"text-white","brightness":80.39253074757629},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7928a1","rgb":"121,40,161","name":"","textColor":"text-white","brightness":79.97942860511071},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#674172","rgb":"103,65,114","name":"","textColor":"text-white","brightness":79.74943259986243},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7023b7","rgb":"112,35,183","name":"","textColor":"text-white","brightness":78.40172829727672},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#8b008b","rgb":"139,0,139","name":"darkmagenta","textColor":"text-white","brightness":77.26699812986136},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#663399","rgb":"102,51,153","name":"","textColor":"text-white","brightness":76.78845616367084},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#5d445d","rgb":"93,68,93","name":"","textColor":"text-white","brightness":76.60107701592713},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#7d314c","rgb":"125,49,76","name":"","textColor":"text-white","brightness":76.27243276571163},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7600a8","rgb":"118,0,168","name":"","textColor":"text-white","brightness":72.62861694951928},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#483d8b","rgb":"72,61,139","name":"darkslateblue","textColor":"text-white","brightness":71.65460906319983},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#800080","rgb":"128,0,128","name":"","textColor":"text-white","brightness":71.15234360159896},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#532f61","rgb":"83,47,97","name":"","textColor":"text-white","brightness":61.858548317916416},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#561b8d","rgb":"86,27,141","name":"","textColor":"text-white","brightness":60.31652344092786},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#591d77","rgb":"89,29,119","name":"","textColor":"text-white","brightness":58.76257312269435},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3d2f5b","rgb":"61,47,91","name":"","textColor":"text-white","brightness":54.64693953004139},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#58007e","rgb":"88,0,126","name":"","textColor":"text-white","brightness":54.27588783244361},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#600060","rgb":"96,0,96","name":"","textColor":"text-white","brightness":53.36425770119922},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#522032","rgb":"82,32,50","name":"","textColor":"text-white","brightness":49.98067626593301},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#322a60","rgb":"50,42,96","name":"","textColor":"text-white","brightness":49.47839932738326},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#550055","rgb":"85,0,85","name":"","textColor":"text-white","brightness":47.24960317293681},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3c1362","rgb":"60,19,98","name":"","textColor":"text-white","brightness":42.0728297122977},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#332533","rgb":"51,37,51","name":"","textColor":"text-white","brightness":41.82927204721593},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#39134c","rgb":"57,19,76","name":"","textColor":"text-white","brightness":37.75219198934017},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3b0053","rgb":"59,0,83","name":"","textColor":"text-white","brightness":36.15761330619044},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#2e1b36","rgb":"46,27,54","name":"","textColor":"text-white","brightness":34.81354621408167},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#360036","rgb":"54,0,54","name":"","textColor":"text-white","brightness":30.01739495692456},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#211931","rgb":"33,25,49","name":"","textColor":"text-white","brightness":29.284671758447285},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#1c1836","rgb":"28,24,54","name":"","textColor":"text-white","brightness":28.02227685253288},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#220b38","rgb":"34,11,56","name":"","textColor":"text-white","brightness":23.98864314628904},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#2a002a","rgb":"42,0,42","name":"","textColor":"text-white","brightness":23.34686274427466},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#1d0029","rgb":"29,0,41","name":"","textColor":"text-white","brightness":17.804184901309018},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ffffff","rgb":"255,255,255","name":"","textColor":"text-dark","brightness":255},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#fefefe","rgb":"254,254,254","name":"","textColor":"text-dark","brightness":254},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#f2f1ef","rgb":"242,241,239","name":"","textColor":"text-dark","brightness":241.1060409861188},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ecf0f1","rgb":"236,240,241","name":"","textColor":"text-dark","brightness":239.11052674443255},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#eeeeee","rgb":"238,238,238","name":"","textColor":"text-dark","brightness":237.99999999999997},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ececec","rgb":"236,236,236","name":"","textColor":"text-dark","brightness":235.99999999999997},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#e8e8e8","rgb":"232,232,232","name":"","textColor":"text-dark","brightness":231.99999999999997},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#dadfe1","rgb":"218,223,225","name":"","textColor":"text-dark","brightness":221.94261195182864},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#d2d7d3","rgb":"210,215,211","name":"","textColor":"text-dark","brightness":213.5345475561273},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d5d5d5","rgb":"213,213,213","name":"","textColor":"text-dark","brightness":212.99999999999997},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d4d4d4","rgb":"212,212,212","name":"","textColor":"text-dark","brightness":212},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d3d3d3","rgb":"211,211,211","name":"","textColor":"text-dark","brightness":211},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#b2cce5","rgb":"178,204,229","name":"","textColor":"text-dark","brightness":199.89619306029817},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#bdc3c7","rgb":"189,195,199","name":"","textColor":"text-dark","brightness":193.84763088570364},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#bfbfbf","rgb":"191,191,191","name":"","textColor":"text-dark","brightness":191},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#bebebe","rgb":"190,190,190","name":"","textColor":"text-dark","brightness":190},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#abb7b7","rgb":"171,183,183","name":"","textColor":"text-dark","brightness":180.18110888769664},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#aaaaaa","rgb":"170,170,170","name":"","textColor":"text-dark","brightness":170},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#a9a9a9","rgb":"169,169,169","name":"darkgray","textColor":"text-dark","brightness":169},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#7bacdd","rgb":"123,172,221","name":"","textColor":"text-dark","brightness":165.55911633008915},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#91a6ba","rgb":"145,166,186","name":"","textColor":"text-dark","brightness":162.66760279785277},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#95a5a6","rgb":"149,165,166","name":"","textColor":"text-dark","brightness":161.358991072701},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#939393","rgb":"147,147,147","name":"","textColor":"text-dark","brightness":147},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#808080","rgb":"128,128,128","name":"gray","textColor":"text-dark","brightness":128},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#7e7e7e","rgb":"126,126,126","name":"","textColor":"text-white","brightness":125.99999999999999},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#708090","rgb":"112,128,144","name":"slategray","textColor":"text-white","brightness":125.51691519472584},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#708080","rgb":"112,128,128","name":"","textColor":"text-white","brightness":124.33245754830071},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#6c7a89","rgb":"108,122,137","name":"","textColor":"text-white","brightness":119.88394387906997},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#696969","rgb":"105,105,105","name":"dimgray","textColor":"text-white","brightness":105},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#4b6a88","rgb":"75,106,136","name":"","textColor":"text-white","brightness":101.86966673156441},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#4d6066","rgb":"77,96,102","name":"","textColor":"text-white","brightness":92.22048037176991},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#4f5a65","rgb":"79,90,101","name":"","textColor":"text-white","brightness":88.28844205217351},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#555555","rgb":"85,85,85","name":"","textColor":"text-white","brightness":85},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#545454","rgb":"84,84,84","name":"","textColor":"text-white","brightness":84},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#4b5555","rgb":"75,85,85","name":"","textColor":"text-white","brightness":82.70066505173945},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34515e","rgb":"52,81,94","name":"","textColor":"text-white","brightness":76.06683245672846},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#3e3e3e","rgb":"62,62,62","name":"","textColor":"text-white","brightness":61.99999999999999},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2e343b","rgb":"46,52,59","name":"","textColor":"text-white","brightness":51.138322225118024},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2b2b2b","rgb":"43,43,43","name":"","textColor":"text-white","brightness":43},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2a2a2a","rgb":"42,42,42","name":"","textColor":"text-white","brightness":42},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#292929","rgb":"41,41,41","name":"","textColor":"text-white","brightness":41},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#1c2833","rgb":"28,40,51","name":"","textColor":"text-white","brightness":38.35898851638296},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#050709","rgb":"5,7,9","name":"","textColor":"text-white","brightness":6.737358532837628},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white","brightness":0},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#fffacd","rgb":"255,250,205","name":"lemonchiffon","textColor":"text-dark","brightness":248.42750451590499},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f1f227","rgb":"241,242,39","name":"","textColor":"text-dark","brightness":233.59938570124706},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c9f227","rgb":"201,242,39","name":"","textColor":"text-dark","brightness":224.293987881976},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#ffd700","rgb":"255,215,0","name":"gold","textColor":"text-dark","brightness":218.20288724029294},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f5d76e","rgb":"245,215,110","name":"","textColor":"text-dark","brightness":217.3253321635561},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f4d03f","rgb":"244,208,63","name":"","textColor":"text-dark","brightness":210.98220778065624},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f7ca18","rgb":"247,202,24","name":"","textColor":"text-dark","brightness":207.21462544907394},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#d4d0ab","rgb":"212,208,171","name":"","textColor":"text-dark","brightness":206.67683953457387},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2ca27","rgb":"242,202,39","name":"","textColor":"text-dark","brightness":205.94396325214294},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#d4b300","rgb":"212,179,0","name":"","textColor":"text-dark","brightness":181.58148308679495},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2a127","rgb":"242,161,39","name":"","textColor":"text-dark","brightness":179.24498040391535},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#e2a50e","rgb":"226,165,14","name":"","textColor":"text-dark","brightness":176.45146358134863},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#daa520","rgb":"218,165,32","name":"goldenrod","textColor":"text-dark","brightness":174.1705801793173},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c7a720","rgb":"199,167,32","name":"","textColor":"text-dark","brightness":169.95520586319208},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#aaa789","rgb":"170,167,137","name":"","textColor":"text-dark","brightness":165.86889702412566},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f27927","rgb":"242,121,39","name":"","textColor":"text-dark","brightness":155.9944966978002},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#aa8f00","rgb":"170,143,0","name":"","textColor":"text-dark","brightness":145.2417260982532},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#b8860b","rgb":"184,134,11","name":"darkgoldenrod","textColor":"text-dark","brightness":143.44030117090523},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#af851a","rgb":"175,133,26","name":"","textColor":"text-dark","brightness":140.17735908483937},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#9d8319","rgb":"157,131,25","name":"","textColor":"text-white","brightness":133.57080519335054},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#807d67","rgb":"128,125,103","name":"","textColor":"text-white","brightness":124.36571472877885},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#8d6708","rgb":"141,103,8","name":"","textColor":"text-white","brightness":110.12035234233498},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#806c00","rgb":"128,108,0","name":"","textColor":"text-white","brightness":109.5826993644526},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#856514","rgb":"133,101,20","name":"","textColor":"text-white","brightness":106.48539806001573},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#726012","rgb":"114,96,18","name":"","textColor":"text-white","brightness":97.58239595336855},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#555344","rgb":"85,83,68","name":"","textColor":"text-white","brightness":82.55880328590041},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#634806","rgb":"99,72,6","name":"","textColor":"text-white","brightness":77.11441499486331},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#554800","rgb":"85,72,0","name":"","textColor":"text-white","brightness":72.96142131291029},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#5a440d","rgb":"90,68,13","name":"","textColor":"text-white","brightness":71.82461973446152},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#483c0c","rgb":"72,60,12","name":"","textColor":"text-white","brightness":61.21058731951524},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#382903","rgb":"56,41,3","name":"","textColor":"text-white","brightness":43.79450878820312},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#2a2a22","rgb":"42,42,34","name":"","textColor":"text-white","brightness":41.504891278016856},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#302407","rgb":"48,36,7","name":"","textColor":"text-white","brightness":38.13308274975943},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#2a2400","rgb":"42,36,0","name":"","textColor":"text-white","brightness":36.34088606514706},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#1d1905","rgb":"29,25,5","name":"","textColor":"text-white","brightness":25.224115445343173},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#fde3a7","rgb":"253,227,167","name":"","textColor":"text-dark","brightness":230.06338257097758},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6cc22","rgb":"230,204,34","name":"","textColor":"text-dark","brightness":203.92195565951204},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f9bf3b","rgb":"249,191,59","name":"","textColor":"text-dark","brightness":200.96596726809244},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f4b350","rgb":"244,179,80","name":"","textColor":"text-dark","brightness":192.155424071245},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f5ab35","rgb":"245,171,53","name":"","textColor":"text-dark","brightness":186.71520559397405},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ffa07a","rgb":"255,160,122","name":"lightsalmon","textColor":"text-dark","brightness":185.39885921979132},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#f4a460","rgb":"244,164,96","name":"sandybrown","textColor":"text-dark","brightness":183.19388636087177},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6a522","rgb":"230,165,34","name":"","textColor":"text-dark","brightness":177.8763137688658},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f39c12","rgb":"243,156,18","name":"","textColor":"text-dark","brightness":176.26405475876243},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f89406","rgb":"248,148,6","name":"","textColor":"text-dark","brightness":173.09123605775076},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#eb974e","rgb":"235,151,78","name":"","textColor":"text-dark","brightness":171.69283036865576},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff8c00","rgb":"255,140,0","name":"darkorange","textColor":"text-dark","brightness":170.92286271882998},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#eb9532","rgb":"235,149,50","name":"","textColor":"text-dark","brightness":169.76488447261406},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff7f50","rgb":"255,127,80","name":"coral","textColor":"text-dark","brightness":165.07987157736704},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f2784b","rgb":"242,120,75","name":"","textColor":"text-dark","brightness":156.35480165316318},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f27935","rgb":"242,121,53","name":"","textColor":"text-dark","brightness":156.27497240441284},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#e87e04","rgb":"232,126,4","name":"","textColor":"text-dark","brightness":154.73521900330255},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#e67e22","rgb":"230,126,34","name":"","textColor":"text-dark","brightness":154.2654335876965},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d48566","rgb":"212,133,102","name":"","textColor":"text-dark","brightness":154.149521569157},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#c9874f","rgb":"201,135,79","name":"","textColor":"text-dark","brightness":150.84596116568716},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f9690e","rgb":"249,105,14","name":"","textColor":"text-dark","brightness":150.24594503679626},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d47500","rgb":"212,117,0","name":"","textColor":"text-dark","brightness":142.44508766538775},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff4500","rgb":"255,69,0","name":"orangered","textColor":"text-white","brightness":137.69849672382048},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d46a43","rgb":"212,106,67","name":"","textColor":"text-dark","brightness":137.48029677011903},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e65722","rgb":"230,87,34","name":"","textColor":"text-white","brightness":134.3788934319672},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#bb671c","rgb":"187,103,28","name":"","textColor":"text-white","brightness":125.74442333558972},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#d35400","rgb":"211,84,0","name":"","textColor":"text-white","brightness":124.92100303791993},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa6b51","rgb":"170,107,81","name":"","textColor":"text-white","brightness":123.7833066289635},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e63022","rgb":"230,48,34","name":"","textColor":"text-white","brightness":120.08152230880486},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#9f6b3f","rgb":"159,107,63","name":"","textColor":"text-white","brightness":119.47331082714666},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d43900","rgb":"212,57,0","name":"","textColor":"text-white","brightness":114.35280057786079},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa5d00","rgb":"170,93,0","name":"","textColor":"text-white","brightness":113.76009405762638},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa5535","rgb":"170,85,53","name":"","textColor":"text-white","brightness":110.21972146580666},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#914f15","rgb":"145,79,21","name":"","textColor":"text-white","brightness":97.00280408318102},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#80503d","rgb":"128,80,61","name":"","textColor":"text-white","brightness":92.86534337415654},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa2e00","rgb":"170,46,0","name":"","textColor":"text-white","brightness":91.79899781588033},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#744e2e","rgb":"116,78,46","name":"","textColor":"text-white","brightness":87.12535796196191},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#804600","rgb":"128,70,0","name":"","textColor":"text-white","brightness":85.64136850844923},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#804028","rgb":"128,64,40","name":"","textColor":"text-white","brightness":82.99204781182351},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#802200","rgb":"128,34,0","name":"","textColor":"text-white","brightness":68.90094338976789},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#66380f","rgb":"102,56,15","name":"","textColor":"text-white","brightness":68.48094625514457},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#553529","rgb":"85,53,41","name":"","textColor":"text-white","brightness":61.61616670971994},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#552f00","rgb":"85,47,0","name":"","textColor":"text-white","brightness":57.16330991116592},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#4a321d","rgb":"74,50,29","name":"","textColor":"text-white","brightness":55.717178679470116},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#552a1b","rgb":"85,42,27","name":"","textColor":"text-white","brightness":54.860924162831964},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#551700","rgb":"85,23,0","name":"","textColor":"text-white","brightness":45.89949890794016},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#3c2109","rgb":"60,33,9","name":"","textColor":"text-white","brightness":40.31881694692938},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a150d","rgb":"42,21,13","name":"","textColor":"text-white","brightness":27.22768811338928},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e7903c","rgb":"231,144,60","name":"","textColor":"text-dark","brightness":165.63024180384448},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#ff6347","rgb":"255,99,71","name":"tomato","textColor":"text-dark","brightness":150.95132990470802},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e76e3c","rgb":"231,110,60","name":"","textColor":"text-dark","brightness":146.5124602209655},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#f64747","rgb":"246,71,71","name":"","textColor":"text-white","brightness":135.6852055310379},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#ef4836","rgb":"239,72,54","name":"","textColor":"text-white","brightness":132.4635534779284},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#e74c3c","rgb":"231,76,60","name":"","textColor":"text-white","brightness":130.75173803816148},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#d4533b","rgb":"212,83,59","name":"","textColor":"text-white","brightness":125.81141045231152},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e73c4e","rgb":"231,60,78","name":"","textColor":"text-white","brightness":125.54406796021865},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#ff0000","rgb":"255,0,0","name":"","textColor":"text-white","brightness":125.18396462806248},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d24d57","rgb":"210,77,87","name":"","textColor":"text-white","brightness":123.44930538484208},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#f22613","rgb":"242,38,19","name":"","textColor":"text-white","brightness":123.02957368047733},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d64541","rgb":"214,69,65","name":"","textColor":"text-white","brightness":120.88832449827402},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#dc2a2a","rgb":"220,42,42","name":"","textColor":"text-white","brightness":114.03190781531282},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#dc143c","rgb":"220,20,60","name":"crimson","textColor":"text-white","brightness":110.38840518822617},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#e00000","rgb":"224,0,0","name":"","textColor":"text-white","brightness":109.96552186935685},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d91e18","rgb":"217,30,24","name":"","textColor":"text-white","brightness":109.5879418549322},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#bc3e31","rgb":"188,62,49","name":"","textColor":"text-white","brightness":106.47711491207865},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#c0392b","rgb":"192,57,43","name":"","textColor":"text-white","brightness":106.08965548063581},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#d50000","rgb":"213,0,0","name":"","textColor":"text-white","brightness":104.56542927755808},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#cf000f","rgb":"207,0,15","name":"","textColor":"text-white","brightness":101.69517687678211},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#aa422f","rgb":"170,66,47","name":"","textColor":"text-white","brightness":100.62359564237406},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#b22222","rgb":"178,34,34","name":"firebrick","textColor":"text-white","brightness":92.26726396723812},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#b50000","rgb":"181,0,0","name":"","textColor":"text-white","brightness":88.8560690105071},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#b11030","rgb":"177,16,48","name":"","textColor":"text-white","brightness":88.79108626433174},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#aa0000","rgb":"170,0,0","name":"","textColor":"text-white","brightness":83.45597641870832},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#923026","rgb":"146,48,38","name":"","textColor":"text-white","brightness":82.62815500784221},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#96281b","rgb":"150,40,27","name":"","textColor":"text-white","brightness":81.10284828537158},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#803224","rgb":"128,50,36","name":"","textColor":"text-white","brightness":75.92214433220389},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#871a1a","rgb":"135,26,26","name":"","textColor":"text-white","brightness":70.03791116245543},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#8b0000","rgb":"139,0,0","name":"darkred","textColor":"text-white","brightness":68.23753366000268},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#870c25","rgb":"135,12,37","name":"","textColor":"text-white","brightness":67.71130629370548},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#800000","rgb":"128,0,0","name":"maroon","textColor":"text-white","brightness":62.837441068203916},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#67221b","rgb":"103,34,27","name":"","textColor":"text-white","brightness":58.35355173423465},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#552118","rgb":"85,33,24","name":"","textColor":"text-white","brightness":50.32784517540961},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#5d1212","rgb":"93,18,18","name":"","textColor":"text-white","brightness":48.27343990228996},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#600000","rgb":"96,0,0","name":"","textColor":"text-white","brightness":47.12808080115294},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#5c0819","rgb":"92,8,25","name":"","textColor":"text-white","brightness":46.11450964718154},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#550000","rgb":"85,0,0","name":"","textColor":"text-white","brightness":41.72798820935416},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#3d1410","rgb":"61,20,16","name":"","textColor":"text-white","brightness":34.504622878681054},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#360000","rgb":"54,0,0","name":"","textColor":"text-white","brightness":26.509545450648528},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#320a0a","rgb":"50,10,10","name":"","textColor":"text-white","brightness":26.04611295375953},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#32050e","rgb":"50,5,14","name":"","textColor":"text-white","brightness":25.161538108788182},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#2b0000","rgb":"43,0,0","name":"","textColor":"text-white","brightness":21.109452858849753},
    ],
    leftOverColors: [
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#1f150c","rgb":"31,21,12","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#092309","rgb":"9,35,9","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#0b0000","rgb":"11,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#070102","rgb":"7,1,2","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#080202","rgb":"8,2,2","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#2a100c","rgb":"42,16,12","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#120605","rgb":"18,6,5","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a0b00","rgb":"42,11,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a1700","rgb":"42,23,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a1b14","rgb":"42,27,20","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#050401","rgb":"5,4,1","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#110a03","rgb":"17,10,3","name":"","textColor":"text-white"},
      {"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#020406","rgb":"2,4,6","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#0e0a01","rgb":"14,10,1","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#0d0f10","rgb":"13,15,16","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#141414","rgb":"20,20,20","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#0b000b","rgb":"11,0,11","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#281018","rgb":"40,16,24","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#080608","rgb":"8,6,8","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0a0f18","rgb":"10,15,24","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00000b","rgb":"0,0,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000b0b","rgb":"0,11,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#06050b","rgb":"6,5,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0d1011","rgb":"13,16,17","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#0f1a0f","rgb":"15,26,15","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#030906","rgb":"3,9,6","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#0b0e04","rgb":"11,14,4","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#040b07","rgb":"4,11,7","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#0a060c","rgb":"10,6,12","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#08030d","rgb":"8,3,13","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#190822","rgb":"25,8,34","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#040306","rgb":"4,3,6","name":"","textColor":"text-white"},
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
