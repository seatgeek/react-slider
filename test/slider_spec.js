var Slider, directions, reverseDirections, slider, sliderProps;

var ReactTest = React.addons.TestUtils;

sliderProps = {
  width: 100,
  leftNumber: 1,
  rightNumber: 100
};

directions = ['left', 'right'];
reverseDirections = ['right', 'left'];

beforeEach(function() {
  var sliderInstance;
  sliderInstance = Slider(sliderProps);
  return slider = ReactTest.renderIntoDocument(sliderInstance);
});

describe('The Slider Component', function() {
  describe('exists and sets itself up correctly, i.e.', function() {
    it('renders correctly', function() {
      return expect(slider).toBeDefined();
    });
    return it('has its initial state set correctly', function() {
      expect(slider.state.leftNumber).toEqual(sliderProps.leftNumber);
      expect(slider.state.rightNumber).toEqual(sliderProps.rightNumber);
      return expect(slider.state.storedNumber).toEqual(sliderProps.leftNumber);
    });
  });
  describe('has working mathematics: ', function() {
    describe('moveConditionsMet returns true only for valid moves: ', function() {
      it('does not let the handle to go off the slider on its side', function() {
        expect(slider.moveConditionsMet({
          left: -2,
          right: 0
        })).toBeFalsy();
        expect(slider.moveConditionsMet({
          left: 0,
          right: -40
        })).toBeFalsy();
        return expect(slider.moveConditionsMet({
          left: -55,
          right: -10
        })).toBeFalsy();
      });
      it('does not let the handle go off the slider on the other side', function() {
        expect(slider.moveConditionsMet({
          left: 100,
          right: 0
        })).toBeFalsy();
        expect(slider.moveConditionsMet({
          left: 0,
          right: 101
        })).toBeFalsy();
        return expect(slider.moveConditionsMet({
          left: 104,
          right: 103
        })).toBeFalsy();
      });
      it('does not let the sliders cross', function() {
        expect(slider.moveConditionsMet({
          left: 90,
          right: 12
        })).toBeFalsy();
        expect(slider.moveConditionsMet({
          left: 52,
          right: 52
        })).toBeFalsy();
        return expect(slider.moveConditionsMet({
          left: 60,
          right: 60
        })).toBeFalsy();
      });
      it('does not let the sliders cross when they take up space', function() {
        var otherProps, otherSlider, otherslider;
        otherProps = {
          width: 100,
          leftNumber: 1,
          rightNumber: 100,
          leftwidth: 10,
          rightwidth: 10
        };
        otherSlider = Slider(otherProps);
        otherslider = ReactTest.renderIntoDocument(otherSlider);
        expect(otherslider.moveConditionsMet({
          left: 90,
          right: 12
        })).toBeFalsy();
        return expect(otherslider.moveConditionsMet({
          left: 52,
          right: 52
        })).toBeFalsy();
      });
      return it('correctly detects valid move conditions', function() {
        expect(slider.moveConditionsMet({
          left: 10,
          right: 10
        })).toBeTruthy();
        expect(slider.moveConditionsMet({
          left: 0,
          right: 0
        })).toBeTruthy();
        return expect(slider.moveConditionsMet({
          left: 50,
          right: 50
        })).toBeTruthy();
      });
    });
    describe('typedConditionsMet returns true', function() {
      return it('when the sliders are ordered', function() {
        expect(slider.typedConditionsMet({
          leftNumber: 13,
          rightNumber: 89
        })).toBeTruthy();
        return expect(slider.typedConditionsMet({
          leftNumber: 55,
          rightNumber: 10
        })).toBeFalsy();
      });
    });
    describe('scalingFunction()', function() {
      return it('returns by default a ratio that increases with the second power', function() {
        expect(slider.props.scalingFunction(10, 100)).toEqual(0.01);
        return expect(slider.props.scalingFunction(90, 100)).toEqual(0.81);
      });
    });
    describe('inversescalingFunction works', function() {
      return it('returns by default a ratio that increases with the square root function', function() {
        expect(slider.props.inverseScalingFunction(16, 100)).toEqual(0.4);
        return expect(slider.props.inverseScalingFunction(81, 100)).toEqual(0.9);
      });
    });
    describe('buildNextState()', function() {
      it('builds a left-changing state correctly', function() {
        var nextState;
        nextState = slider.buildNextState('left', 24);
        expect(nextState.left).toEqual(24);
        expect(nextState.leftNumber).toEqual(7);
        expect(nextState.right).toEqual(0);
        return expect(nextState.rightNumber).toEqual(100);
      });
      it('builds a right-changing state correctly', function() {
        var nextState;
        nextState = slider.buildNextState('right', 89);
        expect(nextState.left).toEqual(0);
        expect(nextState.leftNumber).toEqual(1);
        expect(nextState.right).toEqual(89);
        return expect(nextState.rightNumber).toEqual(3);
      });
      return it('divines a below-zero intention correctly on the left side', function() {
        var nextState;
        nextState = slider.buildNextState('left', -3);
        expect(nextState.left).toEqual(0);
        expect(nextState.leftNumber).toEqual(1);
        expect(nextState.right).toEqual(0);
        return expect(nextState.rightNumber).toEqual(100);
      });
    });
    return describe('addPositionsFromNumbers()', function() {
      it('correctly adds slider positions at the initial position', function() {
        var testAddedState, testState;
        testState = {
          leftNumber: 1,
          rightNumber: 100
        };
        testAddedState = {
          leftNumber: testState.leftNumber,
          rightNumber: testState.rightNumber,
          left: 0,
          right: 0
        };
        return expect(slider.addPositionsFromNumbers(testState)).toEqual(testAddedState);
      });
      it('correctly adds slider positions for positive left positions', function() {
        var testAddedState, testState;
        testState = {
          leftNumber: 64,
          rightNumber: 100
        };
        testAddedState = {
          leftNumber: testState.leftNumber,
          rightNumber: testState.rightNumber,
          left: 79,
          right: 0
        };
        return expect(slider.addPositionsFromNumbers(testState)).toEqual(testAddedState);
      });
      it('correctly adds slider positions for positive right positions', function() {
        var testAddedState, testState;
        testState = {
          leftNumber: 1,
          rightNumber: 81
        };
        testAddedState = {
          leftNumber: testState.leftNumber,
          rightNumber: testState.rightNumber,
          left: 0,
          right: 10
        };
        return expect(slider.addPositionsFromNumbers(testState)).toEqual(testAddedState);
      });
      return it('correctly adds slider positions for mixed positions', function() {
        var testAddedState, testState;
        testState = {
          leftNumber: 36,
          rightNumber: 64
        };
        testAddedState = {
          leftNumber: testState.leftNumber,
          rightNumber: testState.rightNumber,
          left: 59,
          right: 20
        };
        return expect(slider.addPositionsFromNumbers(testState)).toEqual(testAddedState);
      });
    });
  });
  return describe('has other helper functions that work correctly:', function() {
    return describe('getOtherDirection', function() {
      var direction, i, reverseDirection, _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = directions.length; _i < _len; i = ++_i) {
        direction = directions[i];
        reverseDirection = reverseDirections[i];
        _results.push(it('returns ' + direction + ' for ' + reverseDirections[i], function() {
          return expect(slider.getOtherDirection(direction)).toEqual(reverseDirection);
        }));
      }
      return _results;
    });
  });
});
;
//# sourceMappingURL=slider_spec.js.map
