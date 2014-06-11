A Slider in React
===

A few months ago we launched the Omnibox, a single reconfigurable ticket-buying interface that replaced our old static listings and a thicket of popup windows. The Omnibox is written entirely in React, Facebook's new user interface framework, and in doing this we had to come up with our own solutions to user interface elements and innovate where we could.

One of the products of our work on the Omnibox is the price slider component, which allows users to filter tickets by price:
![](http://cl.ly/image/1J360e0W1U2w/Screen%20Shot%202014-06-11%20at%204.49.13%20PM.png)

But for an event with large price ranges - the Super Bowl, for example - a simple linear slider would be unwieldy. Tickets are likely sparsely populated across the full domain of prices and, more importantly, users are far more interested in lower-priced tickets than the exorbitantly priced ones in the long tail of ticket prices.

We solved this problem with two features of the slider: firstly, the upper limit of the price slider was truncated to the 90th percentile of ticket prices, and only dragging the slider handle to its right end will reveal all tickets greater than that price:

![](http://cl.ly/image/2r1e0J3Q0r2p/Screen%20Shot%202014-06-11%20at%204.49.43%20PM.png)

Secondly, the slider scale is no longer assumed to be linear. The implementation currently deployed to the SeatGeek site positions the slider on the horizontal axis using the square root function, making lower prices take up more space than the less-desirable higher-priced tickets.

![](http://cl.ly/image/1f3o461Y3d1a/Screen%20Shot%202014-06-11%20at%204.51.23%20PM.png)

Today we're happy to release this two-handled slider implementation written in React; it has no dependencies other than React itself.

### Documentation

The `Slider` component can be rendered into the DOM like any other React component. It takes the following arguments, the types of which are all enforced by React:

(optional) **Number** `outerWidth`

- Specifies the total width, in pixels, of the entire slider component

**Number** `width`

- Specifies the width, in pixels, of only the slider track

**Number** `leftwidth`

- Specifies the number of pixels to be left empty on the left side of the slider handle

**Number** `rightwidth`

- Specifies the number of pixels to be left empty on the right side of the slider handle

**Number** `leftNumber`

- The leftmost number that the slider can represent

(optional) **Number** `rightNumber`

- The rightmost number that the slider can represent

(optional) **Number** `initialLeftNumber`

- The initial left number that the slider will be set to. While not enforced, it should be equal to either the left or the right number or be between them

(optional) **Number** `initialRightNumber`

- The initial right number that the slider will be set to. While not enforced, it should be equal to either the left or the right number or be between them

(optional) **Function** `scalingFunction`

- A function that takes two arguments, the first representing the x-position of the slider and the second the width of the slider. Use this to control the mapping of the domain of numbers the slider represents onto the range of pixel locations of the slider. By default, this is set to the non-linear
```javascript
function(x, constantBase) {
    return Math.pow(x, 2) / Math.pow(constantBase, 2);
}
```
(optional) **Function** `inverseScalingFunction`

- A function that should be the inverse of the operation of the `scalingFunction`. By default, it is set to:
```javascript
 function(x, constantBase) {
    return Math.sqrt(x) / Math.sqrt(constantBase);
}
```

(optional) **Function** `onSliderUpdate`

- A callback function that is called every time the slider is updated by user interaction with the handles or entering a value into the input boxes. If `onlyUpdateOnRelease` is set to `true`, this function is called only when the user release the mouse button on the slider handle and the `mouseup` event is triggered. If it is set to `false`
- The function is called with an argument that is an object of the following structure:
```javascript
{
    leftNumber: this.state.leftNumber,
    rightNumber: this.state.rightNumber
}
```
where `leftNumber` and `rightNumber` are the new left and right numbers that the slider represents.

(optional) **Boolean** `onlyUpdateOnRelease`

- If set to true, only updates when the user releases the handle and when the user finishes his input. Otherwise, update on every change such as `mousemove`

(optional) **String** `unit`

- If a string is provided, the numbers that the slider represents will be prefixed with this string. A common usage is to prefix the numbers with `$`

(optional) **Boolean** `subset`

- If the slider's rightmost value is meant to represent only a subset of the full range, then setting `subset` to `true` will trigger a `>` symbol when the slider handle is pulled to the rightmost edge of the track





