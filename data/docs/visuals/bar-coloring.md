# Bar coloring

The barcolor() function colors bars on the main chart, regardless of whether the script is running in the main chart pane or a separate pane.
The function’s signature is:
barcolor(color, offset, editable, show_last, title, display) → void
The coloring can be conditional because the color parameter accepts “series color” arguments.
The following script renders inside and outside bars in different colors:

```pinescript
//@version=6
indicator("barcolor example", overlay = true)
isUp = close > open
isDown = close <= open
isOutsideUp = high > high[1] and low < low[1] and isUp
isOutsideDown = high > high[1] and low < low[1] and isDown
isInside = high < high[1] and low > low[1]
barcolor(isInside ? color.yellow : isOutsideUp ? color.aqua : isOutsideDown ? color.purple : na)
```
Note that:

The na value leaves bars as is.
In the barcolor() call, we use embedded ?: ternary operator expressions to select the color.