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
  $scope.fontSize = 18;
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
    var currentFS = $scope.fontSize;
    var currentLevel = $scope.WCAGlevel;
    var currentFW = $scope.fontWeight;
    if(currentFW >= 700 && currentFS >= 18){
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
      $scope.smallFontSize = false;
    }else if(currentFS < 24){
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

  var removeDupes = function() {
    var toLowerCaseArray = _.map($scope.allColors, function(color) {
      return {type: color.type, colorParent: color.colorParent, pass: true, hex: color.hex.toLowerCase(), rgb: color.rgb, name: color.name, textColor: color.textColor};
    });
    var uniqColors = _.uniq(toLowerCaseArray, function(color) {
      return color.hex;
    });
    return uniqColors;
  };
  $scope.uniqColors = removeDupes();
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
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4ecdc4","rgb":"78,205,196","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#a2ded0","rgb":"162,222,208","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#87d37c","rgb":"135,211,124","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#90c695","rgb":"144,198,149","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26a65b","rgb":"38,166,91","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03c9a9","rgb":"3,201,169","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#68c3a3","rgb":"104,195,163","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#65c6bb","rgb":"101,198,187","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1bbc9b","rgb":"27,188,155","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1ba39c","rgb":"27,163,156","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#66cc99","rgb":"102,204,153","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#36d7b7","rgb":"54,215,183","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#c8f7c5","rgb":"200,247,197","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#86e2d5","rgb":"134,226,213","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2ecc71","rgb":"46,204,113","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#16a085","rgb":"22,160,133","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#3fc380","rgb":"63,195,128","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#019875","rgb":"1,152,117","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#03a678","rgb":"3,166,120","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#4daf7c","rgb":"77,175,124","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#2abb9b","rgb":"42,187,155","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#00b16a","rgb":"0,177,106","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#1e824c","rgb":"30,130,76","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#049372","rgb":"4,147,114","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"green","pass":true,"hex":"#26c281","rgb":"38,194,129","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#e4f1fe","rgb":"228,241,254","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4183d7","rgb":"65,131,215","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#59abe3","rgb":"89,171,227","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#81cfe0","rgb":"129,207,224","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#52b3d9","rgb":"82,179,217","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#c5eff7","rgb":"197,239,247","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22a7f0","rgb":"34,167,240","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3498db","rgb":"52,152,219","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2c3e50","rgb":"44,62,80","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#19b5fe","rgb":"25,181,254","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#336e7b","rgb":"51,110,123","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#22313f","rgb":"34,49,63","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#6bb9f0","rgb":"107,185,240","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1e8bc3","rgb":"30,139,195","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#3a539b","rgb":"58,83,155","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#34495e","rgb":"52,73,94","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#67809f","rgb":"103,128,159","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#2574a9","rgb":"37,116,169","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#1f3a93","rgb":"31,58,147","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#89c4f4","rgb":"137,196,244","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#4b77be","rgb":"75,119,190","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"blue","pass":true,"hex":"#5c97bf","rgb":"92,151,191","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#dcc6e0","rgb":"220,198,224","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#663399","rgb":"102,51,153","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#674172","rgb":"103,65,114","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#aea8d3","rgb":"174,168,211","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#913d88","rgb":"145,61,136","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9a12b3","rgb":"154,18,179","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#bf55ec","rgb":"191,85,236","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#be90d4","rgb":"190,144,212","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#8e44ad","rgb":"142,68,173","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"purple","pass":true,"hex":"#9b59b6","rgb":"155,89,182","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#db0a5b","rgb":"219,10,91","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#ffecdb","rgb":"255,236,219","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#f64747","rgb":"246,71,71","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#f1a9a0","rgb":"241,169,160","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#d2527f","rgb":"210,82,127","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#e08283","rgb":"224,130,131","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#f62459","rgb":"246,36,89","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"pink","pass":true,"hex":"#e26a6a","rgb":"226,106,106","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#000000","rgb":"0,0,0","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ffffff","rgb":"255,255,255","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ececec","rgb":"236,236,236","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#6c7a89","rgb":"108,122,137","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#d2d7d3","rgb":"210,215,211","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#eeeeee","rgb":"238,238,238","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#bdc3c7","rgb":"189,195,199","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#ecf0f1","rgb":"236,240,241","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#95a5a6","rgb":"149,165,166","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#dadfe1","rgb":"218,223,225","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#abb7b7","rgb":"171,183,183","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#f2f1ef","rgb":"242,241,239","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"gray","pass":true,"hex":"#bfbfbf","rgb":"191,191,191","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f5d76e","rgb":"245,215,110","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f7ca18","rgb":"247,202,24","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"yellow","pass":true,"hex":"#f4d03f","rgb":"244,208,63","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#fde3a7","rgb":"253,227,167","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f89406","rgb":"248,148,6","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#eb9532","rgb":"235,149,50","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#e87e04","rgb":"232,126,4","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f4b350","rgb":"244,179,80","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f2784b","rgb":"242,120,75","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#eb974e","rgb":"235,151,78","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f5ab35","rgb":"245,171,53","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#d35400","rgb":"211,84,0","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f39c12","rgb":"243,156,18","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f9690e","rgb":"249,105,14","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f9bf3b","rgb":"249,191,59","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#f27935","rgb":"242,121,53","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"orange","pass":true,"hex":"#e67e22","rgb":"230,126,34","name":"","textColor":"text-dark"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d24d57","rgb":"210,77,87","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#f22613","rgb":"242,38,19","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#ff0000","rgb":"255,0,0","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d91e18","rgb":"217,30,24","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#96281b","rgb":"150,40,27","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#ef4836","rgb":"239,72,54","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#d64541","rgb":"214,69,65","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#c0392b","rgb":"192,57,43","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#cf000f","rgb":"207,0,15","name":"","textColor":"text-white"},
{"type":"flatUIcolor","colorParent":"red","pass":true,"hex":"#e74c3c","rgb":"231,76,60","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#38f689","rgb":"56,246,137","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#082213","rgb":"8,34,19","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#114c2a","rgb":"17,76,42","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#1b7742","rgb":"27,119,66","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#24a159","rgb":"36,161,89","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc32","rgb":"46,204,50","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc51","rgb":"46,204,81","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2ecc91","rgb":"46,204,145","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"green","pass":true,"hex":"#2eccb0","rgb":"46,204,176","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#020406","rgb":"2,4,6","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#0c2231","rgb":"12,34,49","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#16405b","rgb":"22,64,91","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#205d86","rgb":"32,93,134","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#2a7ab0","rgb":"42,122,176","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34dbdb","rgb":"52,219,219","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#34b9db","rgb":"52,185,219","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3477db","rgb":"52,119,219","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"blue","pass":true,"hex":"#3455db","rgb":"52,85,219","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#bf6ee0","rgb":"191,110,224","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#0a060c","rgb":"10,6,12","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#2e1b36","rgb":"46,27,54","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#532f61","rgb":"83,47,97","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#77448b","rgb":"119,68,139","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#7659b6","rgb":"118,89,182","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#8859b6","rgb":"136,89,182","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#ae59b6","rgb":"174,89,182","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"purple","pass":true,"hex":"#b659ac","rgb":"182,89,172","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#fc6399","rgb":"252,99,153","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#281018","rgb":"40,16,24","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#522032","rgb":"82,32,50","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#7d314c","rgb":"125,49,76","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#a74165","rgb":"167,65,101","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d252b2","rgb":"210,82,178","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25299","rgb":"210,82,153","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25265","rgb":"210,82,101","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"pink","pass":true,"hex":"#d25852","rgb":"210,88,82","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#4b6a88","rgb":"75,106,136","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#638bb3","rgb":"99,139,179","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#7bacdd","rgb":"123,172,221","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#050709","rgb":"5,7,9","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#1c2833","rgb":"28,40,51","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#345a5e","rgb":"52,90,94","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34515e","rgb":"52,81,94","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34415e","rgb":"52,65,94","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"gray","pass":true,"hex":"#34385e","rgb":"52,56,94","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2ca27","rgb":"242,202,39","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#1d1905","rgb":"29,25,5","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#483c0c","rgb":"72,60,12","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#726012","rgb":"114,96,18","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#9d8319","rgb":"157,131,25","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c7a720","rgb":"199,167,32","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f27927","rgb":"242,121,39","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f2a127","rgb":"242,161,39","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#f1f227","rgb":"241,242,39","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"yellow","pass":true,"hex":"#c9f227","rgb":"201,242,39","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#110a03","rgb":"17,10,3","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#3c2109","rgb":"60,33,9","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#66380f","rgb":"102,56,15","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#914f15","rgb":"145,79,21","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#bb671c","rgb":"187,103,28","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e63022","rgb":"230,48,34","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e65722","rgb":"230,87,34","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6a522","rgb":"230,165,34","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"orange","pass":true,"hex":"#e6cc22","rgb":"230,204,34","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#120605","rgb":"18,6,5","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#3d1410","rgb":"61,20,16","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#67221b","rgb":"103,34,27","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#923026","rgb":"146,48,38","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#bc3e31","rgb":"188,62,49","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e73c70","rgb":"231,60,112","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e73c4e","rgb":"231,60,78","name":"","textColor":"text-white"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e76e3c","rgb":"231,110,60","name":"","textColor":"text-dark"},
{"type":"tinyColor","colorParent":"red","pass":true,"hex":"#e7903c","rgb":"231,144,60","name":"","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#7fffd4","rgb":"127,255,212","name":"aquamarine","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#90ee90","rgb":"144,238,144","name":"lightgreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00ff00","rgb":"0,255,0","name":"lime","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#32cd32","rgb":"50,205,50","name":"limegreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#3cb371","rgb":"60,179,113","name":"mediumseagreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00fa9a","rgb":"0,250,154","name":"mediumspringgreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#6b8e23","rgb":"107,142,35","name":"olivedrab","textColor":"text-white"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#98fb98","rgb":"152,251,152","name":"palegreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#2e8b57","rgb":"46,139,87","name":"seagreen","textColor":"text-white"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#00ff7f","rgb":"0,255,127","name":"springgreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"green","pass":true,"hex":"#9acd32","rgb":"154,205,50","name":"yellowgreen","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00ffff","rgb":"0,255,255","name":"aqua","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#6495ed","rgb":"100,149,237","name":"cornflowerblue","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00008b","rgb":"0,0,139","name":"darkblue","textColor":"text-white"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#008b8b","rgb":"0,139,139","name":"darkcyan","textColor":"text-white"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#483d8b","rgb":"72,61,139","name":"darkslateblue","textColor":"text-white"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00ced1","rgb":"0,206,209","name":"darkturquoise","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#00bfff","rgb":"0,191,255","name":"deepskyblue","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#1e90ff","rgb":"30,144,255","name":"dodgerblue","textColor":"text-white"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#add8e6","rgb":"173,216,230","name":"lightblue","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"blue","pass":true,"hex":"#e0ffff","rgb":"224,255,255","name":"lightcyan","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#8a2be2","rgb":"138,43,226","name":"blueviolet","textColor":"text-white"},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9932cc","rgb":"153,50,204","name":"darkorchid","textColor":"text-white"},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9400d3","rgb":"148,0,211","name":"darkviolet","textColor":"text-white"},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#9370db","rgb":"147,112,219","name":"mediumpurple","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"purple","pass":true,"hex":"#dda0dd","rgb":"221,160,221","name":"plum","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"pink","pass":true,"hex":"#8b008b","rgb":"139,0,139","name":"darkmagenta","textColor":"text-white"},
{"type":"colorSibling","colorParent":"pink","pass":true,"hex":"#ff00ff","rgb":"255,0,255","name":"fuchsia","textColor":"text-white"},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#a9a9a9","rgb":"169,169,169","name":"darkgray","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#696969","rgb":"105,105,105","name":"dimgray","textColor":"text-white"},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#808080","rgb":"128,128,128","name":"gray","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"gray","pass":true,"hex":"#708090","rgb":"112,128,144","name":"slategray","textColor":"text-white"},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#b8860b","rgb":"184,134,11","name":"darkgoldenrod","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#ffd700","rgb":"255,215,0","name":"gold","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#daa520","rgb":"218,165,32","name":"goldenrod","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"yellow","pass":true,"hex":"#fffacd","rgb":"255,250,205","name":"lemonchiffon","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff7f50","rgb":"255,127,80","name":"coral","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff8c00","rgb":"255,140,0","name":"darkorange","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ffa07a","rgb":"255,160,122","name":"lightsalmon","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#ff4500","rgb":"255,69,0","name":"orangered","textColor":"text-white"},
{"type":"colorSibling","colorParent":"orange","pass":true,"hex":"#f4a460","rgb":"244,164,96","name":"sandybrown","textColor":"text-dark"},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#dc143c","rgb":"220,20,60","name":"crimson","textColor":"text-white"},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#8b0000","rgb":"139,0,0","name":"darkred","textColor":"text-white"},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#b22222","rgb":"178,34,34","name":"firebrick","textColor":"text-white"},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#800000","rgb":"128,0,0","name":"maroon","textColor":"text-white"},
{"type":"colorSibling","colorParent":"red","pass":true,"hex":"#ff6347","rgb":"255,99,71","name":"tomato","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#152a23","rgb":"21,42,35","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2a5547","rgb":"42,85,71","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#40806a","rgb":"64,128,106","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#55aa8d","rgb":"85,170,141","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#6ad4b1","rgb":"106,212,177","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#0f1a0f","rgb":"15,26,15","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#294429","rgb":"41,68,41","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#436e43","rgb":"67,110,67","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#5d995d","rgb":"93,153,93","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#76c376","rgb":"118,195,118","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002a00","rgb":"0,42,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#005500","rgb":"0,85,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#008000","rgb":"0,128,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00aa00","rgb":"0,170,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00d400","rgb":"0,212,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3cf73c","rgb":"60,247,60","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#092309","rgb":"9,35,9","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#134d13","rgb":"19,77,19","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#1d781d","rgb":"29,120,29","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#28a228","rgb":"40,162,40","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4add8c","rgb":"74,221,140","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#030906","rgb":"3,9,6","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#113321","rgb":"17,51,33","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#205e3b","rgb":"32,94,59","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2e8856","rgb":"46,136,86","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002517","rgb":"0,37,23","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#005031","rgb":"0,80,49","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#007a4b","rgb":"0,122,75","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00a566","rgb":"0,165,102","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00cf80","rgb":"0,207,128","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#8bb82d","rgb":"139,184,45","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#abe338","rgb":"171,227,56","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#0b0e04","rgb":"11,14,4","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#2b390e","rgb":"43,57,14","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4b6319","rgb":"75,99,25","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#172617","rgb":"23,38,23","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#315131","rgb":"49,81,49","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4b7b4b","rgb":"75,123,75","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#65a665","rgb":"101,166,101","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#7ed07e","rgb":"126,208,126","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3cb572","rgb":"60,181,114","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#4ae08c","rgb":"74,224,140","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#040b07","rgb":"4,11,7","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#123622","rgb":"18,54,34","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#20603c","rgb":"32,96,60","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#002a15","rgb":"0,42,21","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00552a","rgb":"0,85,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#008040","rgb":"0,128,64","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00aa55","rgb":"0,170,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#00d46a","rgb":"0,212,106","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#baf73c","rgb":"186,247,60","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#1a2309","rgb":"26,35,9","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#3a4d13","rgb":"58,77,19","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#5a781d","rgb":"90,120,29","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"green","pass":true,"hex":"#7aa228","rgb":"122,162,40","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#002a2a","rgb":"0,42,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#005555","rgb":"0,85,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#008080","rgb":"0,128,128","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00aaaa","rgb":"0,170,170","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00d4d4","rgb":"0,212,212","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0a0f18","rgb":"10,15,24","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1c2a43","rgb":"28,42,67","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#2e456d","rgb":"46,69,109","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#406098","rgb":"64,96,152","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#527ac2","rgb":"82,122,194","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0000b5","rgb":"0,0,181","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0000e0","rgb":"0,0,224","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00000b","rgb":"0,0,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000036","rgb":"0,0,54","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000060","rgb":"0,0,96","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00b5b5","rgb":"0,181,181","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00e0e0","rgb":"0,224,224","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#000b0b","rgb":"0,11,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#003636","rgb":"0,54,54","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#006060","rgb":"0,96,96","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#5e50b5","rgb":"94,80,181","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#7462e0","rgb":"116,98,224","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#06050b","rgb":"6,5,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1c1836","rgb":"28,24,54","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#322a60","rgb":"50,42,96","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00f8fb","rgb":"0,248,251","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#002627","rgb":"0,38,39","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#005051","rgb":"0,80,81","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#007a7c","rgb":"0,122,124","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00a4a6","rgb":"0,164,166","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#00202a","rgb":"0,32,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#004055","rgb":"0,64,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#006080","rgb":"0,96,128","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#007faa","rgb":"0,127,170","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#009fd4","rgb":"0,159,212","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#05182a","rgb":"5,24,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0a3055","rgb":"10,48,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0f4880","rgb":"15,72,128","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1460aa","rgb":"20,96,170","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#1978d4","rgb":"25,120,212","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#0d1011","rgb":"13,16,17","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#2d383c","rgb":"45,56,60","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#4d6066","rgb":"77,96,102","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#6d8891","rgb":"109,136,145","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#8db0bb","rgb":"141,176,187","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#252a2a","rgb":"37,42,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#4b5555","rgb":"75,85,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#708080","rgb":"112,128,128","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#95aaaa","rgb":"149,170,170","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"blue","pass":true,"hex":"#bbd4d4","rgb":"187,212,212","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#08030d","rgb":"8,3,13","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#220b38","rgb":"34,11,56","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3c1362","rgb":"60,19,98","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#561b8d","rgb":"86,27,141","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7023b7","rgb":"112,35,183","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b93cf6","rgb":"185,60,246","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#190822","rgb":"25,8,34","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#39134c","rgb":"57,19,76","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#591d77","rgb":"89,29,119","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7928a1","rgb":"121,40,161","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b200fd","rgb":"178,0,253","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#1d0029","rgb":"29,0,41","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3b0053","rgb":"59,0,83","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#58007e","rgb":"88,0,126","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#7600a8","rgb":"118,0,168","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#040306","rgb":"4,3,6","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#211931","rgb":"33,25,49","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#3d2f5b","rgb":"61,47,91","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#5a4586","rgb":"90,69,134","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#765ab0","rgb":"118,90,176","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#080608","rgb":"8,6,8","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#332533","rgb":"51,37,51","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#5d445d","rgb":"93,68,93","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#886288","rgb":"136,98,136","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"purple","pass":true,"hex":"#b381b3","rgb":"179,129,179","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#b500b5","rgb":"181,0,181","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#e000e0","rgb":"224,0,224","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#0b000b","rgb":"11,0,11","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#360036","rgb":"54,0,54","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#600060","rgb":"96,0,96","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#2a002a","rgb":"42,0,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#550055","rgb":"85,0,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#800080","rgb":"128,0,128","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#aa00aa","rgb":"170,0,170","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"pink","pass":true,"hex":"#d400d4","rgb":"212,0,212","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2a2a2a","rgb":"42,42,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#555555","rgb":"85,85,85","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#aaaaaa","rgb":"170,170,170","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d4d4d4","rgb":"212,212,212","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d3d3d3","rgb":"211,211,211","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#fefefe","rgb":"254,254,254","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#292929","rgb":"41,41,41","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#545454","rgb":"84,84,84","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#7e7e7e","rgb":"126,126,126","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#939393","rgb":"147,147,147","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#bebebe","rgb":"190,190,190","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#e8e8e8","rgb":"232,232,232","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#141414","rgb":"20,20,20","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#3e3e3e","rgb":"62,62,62","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#d5d5d5","rgb":"213,213,213","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2b2b2b","rgb":"43,43,43","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#91a6ba","rgb":"145,166,186","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#b2cce5","rgb":"178,204,229","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#0d0f10","rgb":"13,15,16","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#2e343b","rgb":"46,52,59","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"gray","pass":true,"hex":"#4f5a65","rgb":"79,90,101","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#e2a50e","rgb":"226,165,14","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#0e0a01","rgb":"14,10,1","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#382903","rgb":"56,41,3","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#634806","rgb":"99,72,6","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#8d6708","rgb":"141,103,8","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#2a2400","rgb":"42,36,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#554800","rgb":"85,72,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#806c00","rgb":"128,108,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#aa8f00","rgb":"170,143,0","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#d4b300","rgb":"212,179,0","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#050401","rgb":"5,4,1","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#302407","rgb":"48,36,7","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#5a440d","rgb":"90,68,13","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#856514","rgb":"133,101,20","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#af851a","rgb":"175,133,26","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#2a2a22","rgb":"42,42,34","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#555344","rgb":"85,83,68","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#807d67","rgb":"128,125,103","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#aaa789","rgb":"170,167,137","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"yellow","pass":true,"hex":"#d4d0ab","rgb":"212,208,171","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a150d","rgb":"42,21,13","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#552a1b","rgb":"85,42,27","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#804028","rgb":"128,64,40","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa5535","rgb":"170,85,53","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d46a43","rgb":"212,106,67","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a1700","rgb":"42,23,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#552f00","rgb":"85,47,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#804600","rgb":"128,70,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa5d00","rgb":"170,93,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d47500","rgb":"212,117,0","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a1b14","rgb":"42,27,20","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#553529","rgb":"85,53,41","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#80503d","rgb":"128,80,61","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa6b51","rgb":"170,107,81","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d48566","rgb":"212,133,102","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#2a0b00","rgb":"42,11,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#551700","rgb":"85,23,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#802200","rgb":"128,34,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#aa2e00","rgb":"170,46,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#d43900","rgb":"212,57,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#1f150c","rgb":"31,21,12","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#4a321d","rgb":"74,50,29","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#744e2e","rgb":"116,78,46","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#9f6b3f","rgb":"159,107,63","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"orange","pass":true,"hex":"#c9874f","rgb":"201,135,79","name":"","textColor":"text-dark"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#070102","rgb":"7,1,2","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#32050e","rgb":"50,5,14","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#5c0819","rgb":"92,8,25","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#870c25","rgb":"135,12,37","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#b11030","rgb":"177,16,48","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#b50000","rgb":"181,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#e00000","rgb":"224,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#0b0000","rgb":"11,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#360000","rgb":"54,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#600000","rgb":"96,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#dc2a2a","rgb":"220,42,42","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#080202","rgb":"8,2,2","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#320a0a","rgb":"50,10,10","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#5d1212","rgb":"93,18,18","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#871a1a","rgb":"135,26,26","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#aa0000","rgb":"170,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#d50000","rgb":"213,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#2b0000","rgb":"43,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#550000","rgb":"85,0,0","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#2a100c","rgb":"42,16,12","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#552118","rgb":"85,33,24","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#803224","rgb":"128,50,36","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#aa422f","rgb":"170,66,47","name":"","textColor":"text-white"},
{"type":"colorSiblingTinyColor","colorParent":"red","pass":true,"hex":"#d4533b","rgb":"212,83,59","name":"","textColor":"text-white"}
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
