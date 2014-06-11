/**
 * @jsx React.DOM
 */

// Slider, a standalone component.
// <Slider width="" leftWidth="" rightWidth=""
// leftNumber="" rightNumber="">
//
// Arguments:
//  Integer width, number of pixels the slider bar is
//  Integer leftWidth, rightWidth, number of pixels to leave
//    between each slider handle, if wanted
//  Integer leftNumber: minimum number the slider represents
//  Integer rightNumber: maximum number the slider represents
//  Boolean onlyUpdateOnRelease: whether the update function is only called when
//   the handle is released, rather than each small movement of the slider

var Slider = React.createClass({
  propTypes: {
    outerWidth: React.PropTypes.number,
    width: React.PropTypes.number.isRequired,
    leftwidth: React.PropTypes.number.isRequired,
    rightwidth: React.PropTypes.number.isRequired,
    leftNumber: React.PropTypes.number.isRequired,
    rightNumber: React.PropTypes.number,
    initialLeftNumber: React.PropTypes.number,
    initialRightNumber: React.PropTypes.number,
    scalingFunction: React.PropTypes.func,
    inverseScalingFunction: React.PropTypes.func,
    onSliderUpdate: React.PropTypes.func,
    onlyUpdateOnRelease: React.PropTypes.bool,
    unit: React.PropTypes.string,
    subset: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      unit: '',
      leftwidth: 0,
      rightwidth: 0,
      subset: false,
      scalingFunction: function(x, constantBase) {
        return Math.pow(x, 2) / Math.pow(constantBase, 2);
      },
      inverseScalingFunction: function(x, constantBase) {
        return Math.sqrt(x) / Math.sqrt(constantBase);
      },
      onSliderUpdate: function() {}
    }
  },
  getInitialState: function() {
    // invariant: left <= right
    return {
      left: 0,
      right: 0,
      leftNumber: this.props.leftNumber,
      rightNumber: this.props.rightNumber,
      storedState: undefined,
      storedNumber: this.props.leftNumber,
      leftActive: false,
      rightActive: false,
      isTouch: 'ontouchstart' in document,
      sliderStartX: undefined,
      sliderEndX: undefined
    }
  },
  componentWillReceiveProps: function(nextProps) {
    var that = this;
    if (this.state.rightNumber === undefined || this.state.leftNumber === undefined) {
      var stateObject = {
        leftNumber: nextProps.leftNumber,
        rightNumber: nextProps.rightNumber
      };
      this.setState(stateObject);
    }
  },
  getOtherDirection: function(thisDirection) {
    var directions = ["left", "right"];
    var otherIndex = (directions.indexOf(thisDirection) + 1) % 2;
    return directions[otherIndex];
  },

  sliderUpdater: function() {
    if (this.props.onlyUpdateOnRelease && (this.state.leftActive || this.state.rightActive)) {
      this.props.onSliderUpdate({
        leftNumber: this.state.leftNumber,
        rightNumber: this.state.rightNumber
      }, true);
    }
    this.setState({
      leftActive: false,
      rightActive: false
    });
    document.removeEventListener("mousemove", this.mouseDownHelper);
    document.removeEventListener("touchmove", this.mouseDownHelper);
  },

  componentDidMount: function() {
    document.addEventListener("mouseup", this.sliderUpdater);
    document.addEventListener("touchend", this.sliderUpdater);
    var stateObject = {};
    stateObject.leftNumber = parseInt(this.props.initialLeftNumber || this.props.leftNumber, 10);
    var setRightNumber;
    if (this.props.initialRightNumber) {
      setRightNumber = Math.min(this.props.initialRightNumber, this.props.rightNumber);
    } else {
      setRightNumber = this.props.rightNumber;
    }
    stateObject.rightNumber = parseInt(setRightNumber, 10);
    var addedState = this.addPositionsFromNumbers(stateObject, this.props.rightNumber);
    this.setState(addedState);
  },
  // a function of props and state
  moveConditionsMet: function(state) {
    var leftWithinBounds  = state.left >= 0 && state.left < this.props.width;
    var rightWithinBounds = state.right >= 0 && state.right < this.props.width;
    var leftNotCrossing   = (state.left + this.props.leftwidth) <= (this.props.width - state.right);
    var rightNotCrossing  = (this.props.width - state.right - this.props.rightwidth) >= state.left;
    return leftWithinBounds && rightWithinBounds && leftNotCrossing && rightNotCrossing;
  },
  // Typed conditions cannot go out of bounds, but they can cross
  typedConditionsMet: function(state) {
    return state.leftNumber <= state.rightNumber;
  },
  handleBlur: function(e) {
    var stateObject = {};
    var targetClassName = e.target.className;
    if (e.target.value.substr(1) === "")
      stateObject[targetClassName] = this.state.storedNumber;
    this.setState(stateObject);
  },
  addPositionsFromNumbers: function(state, rightNumber) {
    rightNumber = rightNumber || this.props.rightNumber;
    state.left = Math.floor(this.props.inverseScalingFunction(state.leftNumber - this.props.leftNumber, rightNumber) * this.props.width);
    state.right = this.props.width - (this.props.inverseScalingFunction(state.rightNumber, rightNumber) * this.props.width); //inverse - from the other side
    return state;
  },

  buildNextState: function(updateDirection, updateLocation) {
    var  nextState = {},
    otherDirection = this.getOtherDirection(updateDirection),
    updateLocation = Math.max(0, updateLocation),
  absoluteLocation = updateDirection === 'left' ? updateLocation : this.props.width - updateLocation;

    nextState[updateDirection] = updateLocation;
    nextState[updateDirection + 'Number'] = Math.ceil(this.props.scalingFunction(absoluteLocation, this.props.width) * (this.props.rightNumber - this.props.leftNumber) + this.props.leftNumber);
    nextState[otherDirection] = this.state[otherDirection];
    nextState[otherDirection + 'Number'] = this.state[otherDirection + 'Number'];

    return nextState;
  },

  handleSliderClick: function(re) {
    var clickX = re.clientX;
    var sliderBar = this.refs.sliderBar.getDOMNode();
    var that = this;
    var stateObject = {};
    if (!(this.state.sliderStartX || this.state.sliderEndX)) {
      var rect = sliderBar.getBoundingClientRect();
      stateObject.sliderStartX = rect.left;
      stateObject.sliderEndX = rect.left + rect.width;
    }
    this.setState(stateObject, function() {
      var relativeClickX = clickX - that.state.sliderStartX;
      var leftDistance = Math.abs(relativeClickX - that.state.left);
      var rightDistance = Math.abs(relativeClickX - (that.props.width - that.state.right));
      var closer = (leftDistance < rightDistance) ? 'left' : 'right';
      var updateLocation = closer === 'left' ? relativeClickX : this.props.width - relativeClickX;

      var nextState = that.buildNextState(closer, updateLocation);
      // A state generated by a click is guaranteed to be valid
      that.setState(nextState, function() {
        that.props.onSliderUpdate({
          leftNumber: nextState.leftNumber,
          rightNumber: nextState.rightNumber
        });
      })
    })
  },

  handleFocus: function(e) {
    var   stateObject = {},
      targetClassName = e.target.className,
            direction = targetClassName.match(/(\w+)Number/)[1];
                value = e.target.value;
    stateObject[targetClassName] = '';
    stateObject.storedNumber = this.state[targetClassName];
    this.setState(stateObject);
  },

  handleChange: function(e) {
    var   stateObject = {},
      targetClassName = e.target.className,
            direction = targetClassName.match(/(\w+)Number/)[1],
       otherDirection = this.getOtherDirection(direction),
           inputValue = e.target.value,
          targetValue = inputValue.charAt(0) === '>' ? inputValue.substr(2) : inputValue.substr(1);

    // Restrictions on entered values. Storage of temporary value when user clears
    // input field.
    if (targetValue.match(/^\d+$/) && targetValue <= this.props.rightNumber && targetValue >= this.props.leftNumber)
      stateObject[targetClassName] = parseInt(targetValue);
    else if (targetValue === "") {
      stateObject[targetClassName] = "";
      stateObject.storedNumber = this.state[targetClassName];
      this.setState(stateObject);
      return;
    } else
      return;

    var otherNumber = otherDirection + "Number";
    stateObject[otherNumber] = this.state[otherNumber];
    if (!this.typedConditionsMet(stateObject))
      stateObject[otherNumber] = stateObject[targetClassName];

    stateObject = this.addPositionsFromNumbers(stateObject);
    this.setState(stateObject);
    this.props.onSliderUpdate(stateObject, true);

  },

  handleMouseMove: function(event, targetClass, initialX, originalPosition) {
    var that = this;
    event.preventDefault();
    var newX = (that.state.isTouch ? event.originalEvent.touches[0] : event).clientX;

    var scaling = targetClass === "left" ? 1 : -1;
    var otherDirection = that.getOtherDirection(targetClass);
    var nextState = that.buildNextState(targetClass, originalPosition + scaling * (newX - initialX));
    if (that.moveConditionsMet(nextState)) {
      that.setState(nextState, function() {
        if (!that.props.onlyUpdateOnRelease) {
          that.props.onSliderUpdate({
            leftNumber: nextState.leftNumber,
            rightNumber: nextState.rightNumber
          });
        }
      });
    }
  },

  handleMouseDown: function(re) {
    // N.B. e is a React event, while event below is a browser event
    var targetClass = re.target.className.split(' ')[0],
               that = this,
           initialX = (this.state.isTouch ? re.touches[0] : re).clientX,
   originalPosition = this.state[targetClass];

    var activeState = {};
    activeState[targetClass + "Active"] = true; //set active state on mousedown
    this.setState(activeState);

    this.mouseDownHelper = function(event) {
      that.handleMouseMove(event, targetClass, initialX, originalPosition);
    }

    document.addEventListener("mousemove", this.mouseDownHelper);
    document.addEventListener("touchmove", this.mouseDownHelper);
  },

  render: function() {
    var leftActive = this.state.leftActive ? "active" : "";
    var rightActive = this.state.rightActive ? "active" : "";
    var rightUnit = (this.state.rightNumber >= this.props.rightNumber && this.props.subset) ? '>' + this.props.unit : this.props.unit;
    return <div className="slider-container clearfix" style={{width: this.props.outerWidth}}>
    <div className="numerical-container">
      <div className="numerical-left">
        <input type="text"
               className="leftNumber"
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               onChange={this.handleChange}
               value={this.props.unit + this.state.leftNumber}></input>
      </div>
    </div>
    <div className="slider-control-container clearfix" style={{width: this.props.width}}>
      <div className="full-slider"
           ref="sliderBar"
           onClick={this.handleSliderClick} style={{width: this.props.width}}>
        <div className="slider"
             style={{left: this.state.left, width: this.props.width - this.state.left - this.state.right}}></div>
      </div>
      <div className="handle-container clearfix" style={{width: this.props.width}}>
        <div ref="leftSlider" className={"left " + leftActive}
             style={{left: this.state.left}}
             onTouchStart={this.handleMouseDown}
             onMouseDown={this.handleMouseDown}>
        </div>
        <div ref="rightSlider" className={"right " + rightActive}
             style={{right: this.state.right}}
             onTouchStart={this.handleMouseDown}
             onTouchMove={this.handleTouchMove}
             onMouseDown={this.handleMouseDown}>
        </div>
      </div>
    </div>
    <div className="numerical-container">
      <div className="numerical-right">
        <input type="text"
               className="rightNumber"
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               onChange={this.handleChange}
               value={rightUnit + this.state.rightNumber}></input>
      </div>
    </div>
  </div>
  }
})

