var app = angular.module('app', []);

app.controller('appController', function($scope, $http, appFactory) {
  /**
   * Defaults
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = null;
  $scope.fontSize = 28;
  $scope.fontWeight = 400;
  $scope.backgroundColor = '#ffffff';
  $scope.WCAGlevel = 'AA';
  $scope.appFactory = appFactory;


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
    $scope.currentColor.colorVariations = $scope.currentColor.flatUIcolors;

    var newColorArray = Please.make_color({
      base_color: $scope.currentColor.name,
      colors_returned: 20,
      format:'hex'
    });

    var uniqColors = _.uniq(newColorArray);
    uniqColors = _.without(uniqColors, '#aN');
    var generatedColors = _.map(uniqColors, function(color) {
      return { hex: color, name: '', pass: true, rgb: '' }
    });

    $scope.currentColor.colorVariations = _.union($scope.currentColor.colorVariations, generatedColors);
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

app.factory('appFactory', function() {
  return {
    colorCategories: [
      //{ hex: '#16A085', rgb: '22, 160, 133', name: 'green-drk', colorVariations: []  },
      { hex: '#2ECC71', rgb: '46, 204, 113', name: 'green', shades: [], flatUIcolors: [
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
        ]
      },
      { hex: '#3498DB', rgb: '52, 152, 219', name: 'blue', shades: [], flatUIcolors: [
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
        ]
      },
      { hex: '#9B59B6', rgb: '155, 89, 182', name: 'purple', shades: [], flatUIcolors: [
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
        ]
      },
      //{ hex: '#34495E', rgb: '52, 73, 94', name: 'black', shades: []  },
      { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', shades: [], flatUIcolors: [
        { pass: true, hex: '#F5D76E', rgb: '', name: '' },
        { pass: true, hex: '#F7CA18', rgb: '', name: '' },
        { pass: true, hex: '#F4D03F', rgb: '', name: '' }
        ]
      },
      { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', shades: [], flatUIcolors: [
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
        ]
      },
      { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', shades: [], flatUIcolors: [
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
        ]
      },
      { hex: '#95A5A6', rgb: '149, 165, 166', name: 'gray', shades: [], flatUIcolors: [
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
      }
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
    }
  }
});
