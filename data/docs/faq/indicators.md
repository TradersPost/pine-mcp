# Indicators

Can I create an indicator that plots like the built-in Volume or Volume Profile indicators?
The Volume and Visible Range Volume Profile indicators (along with some other built-in indicators) are written in Java. They display data on the main chart pane in a unique way:

The bars are anchored to the bottom or right edge of the chart, not to an absolute x or y value.
The length of the bars is a relative percentage of the available space and is not an absolute price or number of bars.
The length of the bars adjusts automatically according to the data from the range of bars that are visible on the chart. The lengths of the bars are normalized so as never to appear too small or too large.
The width of the bars adjusts automatically to fit the visible space.

It is difficult for Pine Script® indicators to plot values in the same way.
Limitations of `plot.style_columns`
If volume, or another series, plotted as columns, it is anchored to the bottom of the chart, and the width and length of the bars can adjust dynamically. However, the tops of the bars are defined by absolute price values. This means that it is not possible for the series to be plotted on the main chart without distorting the price scale. Also, plots must be defined during processing of the bar they are plotted on, and cannot be plotted retroactively.
Limitations of drawings
Drawing objects such as lines and boxes are anchored to an absolute price scale, not to the edge of the chart. Drawing objects do not adjust their length automatically. Lines do not adjust their width automatically. Although boxes can be drawn exactly one bar wide, and so adjust their width automatically, they cannot be drawn so as to fit exactly in one bar; they always draw from the middle of one bar to the middle of another.
The following example script demonstrates some techniques for approximating the way that the built-in Volume indicator displays.

We use the chart.right_visible_bar_time and chart.left_visible_bar_time built-in variables, through the PineCoders’ VisibleChart library, to define the bars that are visible. Then we calculate the highest and lowest price, and the highest volume, for that period.
We plot lines retroactively, after the visible window and all related values are known.
We anchor the lines below the lowest visible price, so that it looks as if they are anchored to the bottom edge of the chart.
We scale the length of all the volume bars so that the longest bar in the set is approximately 30% of the screen height, similar to the built-in Volume indicator.
We adjust the width of the lines depending on how many bars are visible.

**Tip:** The bottom margin of the chart must be set to zero in order for the lines to start from the bottom edge of the chart. To set the margin, right-click the chart background and click “Settings…” then “Canvas”, and set the “Bottom” margin in the “Margins” section. To preserve the same space at the bottom of the chart, add a bottom margin in the script settings.
```pinescript
//@version=6
indicator("Dynamically scaled volume", overlay=true, max_lines_count=500)

// Import the PineCoders' VisibleChart library
import PineCoders/VisibleChart/4 as visibleChart
```
const float RELATIVE_HEIGHT = 0.3 // 30% matches the built-in volume indicator.
const string BOTTOM_TTIP = "Copy the bottom margin % from your chart settings to here, and then set "
     + "the bottom margin to *zero* on the chart settings."

int bottomInput = input.int(title = "Bottom Margin %", defval = 10, minval = 0, maxval = 100, tooltip = BOTTOM_TTIP)

// Get the highest volume, and highest and lowest price points, by calculating on each bar during the visible window.
var float hiVol   = na
var float hiPrice = na
var float loPrice = na
if visibleChart.barIsVisible()
    hiVol   := na(hiVol)   ? volume : math.max(hiVol,   volume)
    hiPrice := na(hiPrice) ? high   : math.max(hiPrice, high)
    loPrice := na(loPrice) ? low    : math.min(loPrice, low)

int bars = visibleChart.bars()
// Calculate the thickness for the lines based on how many bars are displayed.
int lineWidth = math.ceil(1000/bars)

// Draw the lines once, when the visible window ends.
if time == chart.right_visible_bar_time
    // Calculate the bottom y coordinate for all lines once.
    float priceDifference = hiPrice - loPrice
    float scale = (priceDifference / hiVol) * RELATIVE_HEIGHT
    float bottomY = loPrice - (bottomInput / 100) * priceDifference
    // Loop through the visible window using the historical operator.
    for i = bars - 1 to 0
        // Calculate the top y coordinate for each line.
        float topY = bottomY + (volume[i] * scale)
        // Draw the line.
        line.new(x1 = bar_index - i, y1 = bottomY, x2 = bar_index - i, y2 = topY, color = close[i] >= open[i] ?
          color.new(color.green, 50) : color.new(color.red, 50), width = lineWidth)
This script has some other limitations:

The lines do not begin from the bottom of the chart if other indicators display plots or drawings below that level.
In common with any script that uses the chart.right_visible_bar_time or chart.left_visible_bar_time built-in variables, the script must refresh each time the chart is moved or a new bar appears.
There is a maximum limit of 500 lines per script.
The width of the lines is calculated based on how many bars are visible. However, a Pine script has no way of knowing how much blank space there is to the right of the final bar. If the user scrolls to the right, the lines can appear too wide and overlap each other.

Can I use a Pine script with the TradingView screener?
The TradingView screener uses only its built-in filters, and cannot use a Pine script.
However, the Pine Screener can use any Pine script containing plot() or alertcondition() calls to scan and filter symbols. Add a personal, built-in, or community indicator to your favorites to use it in the Pine Screener. See this Help Center article for more information.
Alternatively, search for “screener” in the Community Collection to find scripts that use the request.security() function to screen pre-set lists of symbols.
See also this FAQ entry for an example script that generates alerts on multiple
symbols.
How can I use the output from one script as input to another?
Scripts with an input of type input.source() can take a plot from another script (up to a maximum of ten) as an input.
Select the script and plot to take as input in the script’s “Settings” tab. If the user removes the script from the chart and adds it again, they must select the correct inputs again.
The sources used as external inputs must originate from indicators; they cannot originate from strategies. However, plots originating from indicators can be used in strategies.
For further information, refer to this blog post and the Source input section in the User Manual.
Can my script draw on the main chart when it’s running in a separate pane?
Scripts that have the overlay parameter in the indicator() or strategy() functions set to false appear in a separate pane to the main chart.
Such scripts can affect the display of the main chart in only two ways:

Changing bar colors, using the barcolor() function.
Forcing plots to overlay, using force_overlay = true in the plotting function. The force_overlay parameter is available in most functions that draw on the chart.

Is it possible to export indicator data to a file?
The option “Export chart data…” in the dropdown menu at the top right corner of the chart exports a comma-separated values (CSV) file that includes time, OHLC data, and any plots generated by your script. This option can also export strategy data.
To include specific information in the CSV file, ensure that it is plotted by the script.
If this extra information is far from the symbol’s price and the existing indicator plots, and plotting it on the chart could distort the scale of the script, or if you prefer not to display
certain plots, consider using the display parameter in the plot() function.
Here is an example plot that displays the close only in the Data Window. The plot title “No chart display” becomes the column header for this value in the CSV file.
plot(close * 0.5, "No chart display", display = display.data_window)
Alternatively, the “Scale price chart only” in the chart settings maintains the script’s scale. To access these settings, right-click on the chart’s price scale.
To determine if a condition is true or false, use the plotshape() function, which records a 1 (for true) or 0 (for false) in the CSV file.         Previous       Functions      Next   Other data and timeframes              On this pageCan I create an indicator that plots like the built-in Volume or Volume Profile indicators?Can I use a Pine script with the TradingView screener?How can I use the output from one script as input to another?Can my script draw on the main chart when it’s running in a separate pane?Is it possible to export indicator data to a file?