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
