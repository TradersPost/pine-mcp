# Other timeframes and data

Introduction
Pine Script® allows users to request data from sources and contexts
other than those their charts use. The functions we present on this page
can fetch data from a variety of alternative sources:

request.security() retrieves data from another symbol, timeframe, or other
context.
request.security_lower_tf() retrieves intrabar data, i.e., data from a timeframe
lower than the chart timeframe.
request.currency_rate() requests a daily rate to convert a value expressed in
one currency to another.
request.dividends(), request.splits(), and request.earnings() respectively retrieve information about an issuing
company’s dividends, splits, and earnings.
request.financial() retrieves financial data from
FactSet.
request.economic() retrieves economic and industry data.
request.footprint() retrieves volume footprint data.
request.seed() retrieves data from a user-maintained GitHub
repository.

NoteThroughout this page, and in other parts of our documentation that discuss request.*() functions, we often use the term “context” to describe the symbol, timeframe, and any modifications — such as price adjustments, session settings, and non-standard chart types — that apply to a chart or the data retrieved by a script.
These are the signatures of the functions in the request.* namespace:
request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, currency, calc_bars_count) → series <type>
request.security_lower_tf(symbol, timeframe, expression, ignore_invalid_symbol, currency, ignore_invalid_timeframe, calc_bars_count) → array<type>
request.currency_rate(from, to, ignore_invalid_currency) → series float
request.dividends(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float
request.splits(ticker, field, gaps, lookahead, ignore_invalid_symbol) → series float
request.earnings(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float
request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency) → series float
request.economic(country_code, field, gaps, ignore_invalid_symbol) → series float
request.footprint(ticks_per_row, va_percent, imbalance_percent) → series footprint
request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) → series <type>
The request.*() family of functions has numerous potential applications. Throughout this page, we discuss in detail these functions and some of their typical use cases.
TipProgrammers can also enable compatible scripts to perform calculations on data from another timeframe, without requiring request.*() calls, by supplying an argument to the timeframe parameter of the indicator() declaration statement.
Common characteristics
Many functions in the request.*() namespace share some common properties and parameters. Before we explore each function in depth, let’s familiarize ourselves with these characteristics.
Behavior
All request.*() functions have similar internal behavior, even though they do not all share the same required parameters. Every unique request.*() call in a script requests a dataset from a defined context (i.e., ticker ID and timeframe) and evaluates an expression across the retrieved data.
The request.security() and request.security_lower_tf() functions allow programmers to specify the context of a request and the expression directly via the symbol, timeframe, and expression parameters, making them suitable for a wide range of data requests.
For example, the request.security() call in this simple script requests daily “AMEX:SPY” data, and it calculates the slope of a 20-bar linear regression line using the retrieved hl2 prices. The first two arguments specify the context of the request, and the third specifies the expression to evaluate across the requested data:

```pinescript
//@version=6
indicator("Behavior of `request.security()` demo")

//@variable The 20-bar linear regression slope of `hl2` prices from the "AMEX:SPY" symbol on the "1D" timeframe.
float requestedSlope = request.security("AMEX:SPY", "1D", ta.linreg(hl2, 20, 0) - ta.linreg(hl2, 20, 1))

//@variable Is `color.teal` when the `requestedSlope` is positive, and `color.maroon` otherwise.
color plotColor = requestedSlope > 0 ? color.teal : color.maroon

// Plot the `requestedSlope` with the `plotColor`.
plot(requestedSlope, "Requested slope", plotColor, 1, plot.style_area)
```
Other functions within the request.*() namespace do not allow programmers to directly define the full context of a request or the evaluated expression. Instead, these functions determine some of the necessary information internally because they perform only specific types of requests.
For instance, request.financial() exclusively retrieves periodic financial data. Its required parameters (symbol, financial_id, and period) all define parts of a specific financial ticker ID. The function does not allow specification of the timeframe or expression, as it determines these details internally. The script below demonstrates a simple call to this function that retrieves the annual cost of goods data for the chart symbol’s issuing company:

```pinescript
//@version=6
indicator("Behavior of `request.financial()` demo", format = format.volume)

//@variable The annual cost of goods sold by the chart symbol's issuing company.
float costOfGoods = request.financial(syminfo.tickerid, "COST_OF_GOODS", "FY")

// Plot the `costOfGoods`.
plot(costOfGoods, "Cost of goods", color.purple, 3, plot.style_stepline_diamond)
```
Scripts can perform up to 40 unique requests using any combination of request.*() function calls, or up to 64 if the user has the Ultimate plan. Unique request.*() calls count toward this limit because they are the only calls that fetch new data. By contrast, redundant calls to the same request.*() function with identical arguments do not typically perform new requests. Instead, they reuse the data from the first executed call. See the request.*() calls section of the Limitations page for more information.
​gaps​
When using a request.*() function to retrieve data from another context, the data might not come in on each new bar as it would with the current chart. The gaps parameter of a request.*() function controls how the function responds to nonexistent values in the requested series.
**Note:** The timeframe_gaps parameter of the indicator() declaration statement is similar to the gaps parameter for request.*() functions. When the declaration statement includes a timeframe argument, causing the script to evaluate its code using data from a specific timeframe, the timeframe_gaps parameter specifies how the script handles nonexistent values on each chart bar.
Suppose we have a script that requests hourly data for the chart’s symbol using request.security() executing on a 1-minute chart. The function call returns new values only on the 1-minute bars that cover the opening or closing times of the symbol’s hourly bars. On other chart bars, we can decide whether the function returns na values or the last available values via the gaps parameter.
If the gaps parameter uses barmerge.gaps_on, the function returns na results on all chart bars where new data is not yet confirmed from the requested context. Otherwise, if the parameter uses barmerge.gaps_off, the function fills the gaps in the requested data with the last confirmed values on historical bars and the most recent developing values on realtime bars.
The script below demonstrates the difference in behavior by plotting the results from two request.security() calls that fetch the close price of the current symbol from the hourly timeframe on a 1-minute chart. The first call uses gaps = barmerge.gaps_off and the second uses gaps = barmerge.gaps_on:

```pinescript
//@version=6
indicator("`gaps` demo", overlay = true)

//@variable The `close` requested from the hourly timeframe without gaps.
float dataWithoutGaps = request.security(syminfo.tickerid, "60", close, gaps = barmerge.gaps_off)
//@variable The `close` requested from the hourly timeframe with gaps.
float dataWithGaps = request.security(syminfo.tickerid, "60", close, gaps = barmerge.gaps_on)

// Plot the requested data.
plot(dataWithoutGaps, "Data without gaps", color.blue, 3, plot.style_linebr)
plot(dataWithGaps, "Data with gaps", color.purple, 15, plot.style_linebr)

// Highlight the background for realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.aqua, 70) : na, title = "Realtime bar highlight")
```
Note that:

barmerge.gaps_off is the default value for the gaps parameter in all applicable request.*() functions.
The script plots the requested series as lines with breaks (plot.style_linebr), which do not bridge over na values as the default style (plot.style_line) does.
When using barmerge.gaps_off, the request.security() function returns the last confirmed close from the hourly timeframe on all historical bars. When running on realtime bars (the bars with the color.aqua background in this example), it returns the symbol’s current close value, regardless of confirmation. For more information, see the Historical and realtime behavior section of this page.

​ignore_invalid_symbol​
The ignore_invalid_symbol parameter of request.*() functions determines how a function handles invalid data requests, e.g.:

Using a request.*() function with a nonexistent ticker ID as the symbol/ticker parameter.
Using request.financial() to retrieve information that does not exist for the specified symbol or period.
Using request.economic() to request a field that does not exist for a country_code.

A request.*() function call produces a runtime error and halts the execution of the script when making an erroneous request if its ignore_invalid_symbol parameter is false. When this parameter’s value is true, the function returns na values in such a case instead of raising an error.
This example uses request.*() calls within a user-defined function to retrieve data for estimating an instrument’s market capitalization (market cap). The user-defined calcMarketCap() function calls request.financial() to retrieve the total shares outstanding for a symbol and request.security()
to retrieve a tuple containing the symbol’s close and syminfo.currency values. We’ve included ignore_invalid_symbol = true in both of these request.*() calls to prevent runtime errors for invalid requests.
The script displays a formatted string representing the symbol’s estimated market cap value and currency in a table on the chart and uses a plot() call to visualize the marketCap history:

```pinescript
//@version=6
indicator("`ignore_invalid_symbol` demo", "Market cap estimate", format = format.volume)

//@variable The symbol to request data from.
string symbol = input.symbol("TSX:SHOP", "Symbol")

//@function Estimates the market capitalization of the specified `tickerID` if the data exists.
calcMarketCap(simple string tickerID) =>
    //@variable The quarterly total shares outstanding for the `tickerID`. Returns `na` when the data isn't available.
    float tso = request.financial(tickerID, "TOTAL_SHARES_OUTSTANDING", "FQ", ignore_invalid_symbol = true)
    //@variable The `close` price and currency for the `tickerID`. Returns `[na, na]` when the `tickerID` is invalid.
    [price, currency] = request.security(
```
         tickerID, timeframe.period, [close, syminfo.currency], ignore_invalid_symbol = true
     )
    // Return a tuple containing the market cap estimate and the quote currency.
    [tso * price, currency]

```pinescript
//@variable A `table` object with a single cell that displays the `marketCap` and `quoteCurrency`.
var table infoTable = table.new(position.top_right, 1, 1)
// Initialize the table's cell on the first bar.
if barstate.isfirst
    table.cell(infoTable, 0, 0, "", text_color = color.white, text_size = size.huge, bgcolor = color.teal)

// Get the market cap estimate and quote currency for the `symbol`.
[marketCap, quoteCurrency] = calcMarketCap(symbol)

if barstate.islast
    //@variable The formatted text displayed inside the `infoTable`.
    string tableText = str.format("Market cap:\n{0} {1}", str.tostring(marketCap, format.volume), quoteCurrency)
    // Update the `infoTable`.
    table.cell_set_text(infoTable, 0, 0, tableText)

// Plot the `marketCap` value.
plot(marketCap, "Market cap", color.new(color.purple, 60), style = plot.style_area)
```
Note that:

The calcMarketCap() function only returns non-na values on valid instruments with total shares outstanding data, such as the one we selected for this example. It returns na on others that do not have financial data, including forex, crypto, and derivatives.
Not all issuing companies publish quarterly financial reports. If the issuing company of the symbol does not report on a quarterly basis, change the “FQ” value in this script to the company’s minimum reporting period. See the request.financial() section for more information.
We included format.volume in the indicator() and str.tostring() calls to specify that the y-axis of the chart pane represents volume-formatted values and the “string” representation of the marketCap value shows as volume-formatted text.
For efficiency, this script creates a table and initializes its cell on the first chart bar, then updates the cell’s text on the last bar. To learn more about working with tables, see the Tables page.

​currency​
The currency parameter of a request.*() function enables programmers to specify the currency of the requested data. If this parameter’s value differs from the symbol’s syminfo.currency value, the function converts the requested values to express them in the specified currency. The currency parameter accepts a built-in constant from the currency.* namespace, such as currency.JPY, or a string representing a valid currency code (e.g., “JPY”). By default, this parameter accepts a “series” argument that can change across executions. However, if dynamic requests are not enabled, it accepts only a value with the “simple” qualifier or a weaker one.
The conversion rate between the syminfo.currency of the requested data and the specified currency depends on the previous daily value of the corresponding currency pair from the most popular exchange. If no exchange provides the rate directly, the function derives the rate using a spread symbol.
NoteNot all request.*() function calls return values expressed as a currency amount. Therefore, currency conversion is not always necessary. For example, some of the series that the request.financial() function can retrieve — such as the “PIOTROSKI_F_SCORE” and “NUMBER_OF_EMPLOYEES” metrics — use units other than currency. It is up to programmers to determine when currency conversion is appropriate for their data requests.
​lookahead​
The lookahead parameter in request.security(), request.dividends(), request.splits(), and request.earnings() specifies the lookahead behavior of the function call. Its default value is barmerge.lookahead_off.
When requesting data from a higher-timeframe (HTF) context, the lookahead value determines whether the request.*() function can return values from times beyond those of the historical bars it executes on. In other words, the lookahead paremeter determines whether the requested data may contain lookahead bias on historical bars.
When requesting data from a lower-timeframe (LTF) context, the lookahead parameter determines whether the function requests values from the first or last intrabar (LTF bar) of each chart-timeframe bar.
Programmers should exercise extreme caution when using lookahead in their requests, especially when requesting data from higher timeframes.
When using barmerge.lookahead_on as the lookahead value, ensure that it does not compromise the integrity of the script’s logic by leaking future data into historical chart bars.
The following scenarios are cases where enabling lookahead is acceptable in a request.*() call:

The expression argument in a request.security() call includes a historical offset (e.g., close[1]), which prevents the function from requesting future values that it would not have access to on a realtime basis.
The timeframe argument of the call represents the same timeframe as that of the chart on which the script executes, i.e., timeframe.period.
The function call requests data from an intrabar timeframe, i.e., a timeframe smaller than the timeframe.period. See the Lower-timeframes section for more information.

NoticeScripts that use request.security() calls with lookahead to leak future data into the past are extremely misleading. As such, they are not allowed as script publications. Although the results of such a script might look great across history due to its apparent aquisition of prescience, those results are unrealistic because the retrieved data was not knowable at the time of each bar. Furthermore, the same behavior is impossible to reproduce on realtime bars. Therefore, before publishing a script to share it with others, ensure that its requests do not mislead traders by using future data on historical bars.
This example demonstrates how the lookahead parameter affects the behavior of higher-timeframe data requests and why enabling lookahead in request.security() without offsetting the expression is misleading. The script calls request.security() to get the HTF high price for the current chart’s symbol in three different ways and plots the resulting series on the chart for comparison.
The first call uses barmerge.lookahead_off (default), and the others use barmerge.lookahead_on. However, the third request.security() call also offsets its expression using the history-referencing operator [] to avoid leaking future data into the past.
As we see on the chart, the plot of the series requested using barmerge.lookahead_on without an offset (fuchsia line) shows final HTF high prices before they are actually available on historical bars, whereas the other two calls do not:

```pinescript
//@version=6
indicator("`lookahead` demo", overlay = true)

//@variable The timeframe to request the data from.
string timeframe = input.timeframe("30", "Timeframe")

//@variable The requested `high` price from the current symbol on the `timeframe` without lookahead bias.
//          On realtime bars, it returns the current `high` of the `timeframe`.
float lookaheadOff = request.security(syminfo.tickerid, timeframe, high, lookahead = barmerge.lookahead_off)

//@variable The requested `high` price from the current symbol on the `timeframe` with lookahead bias.
//          Returns values that should NOT be accessible yet on historical bars.
float lookaheadOn = request.security(syminfo.tickerid, timeframe, high, lookahead = barmerge.lookahead_on)

//@variable The requested `high` price from the current symbol on the `timeframe` without lookahead bias or repainting.
//          Behaves the same on historical and realtime bars.
float lookaheadOnOffset = request.security(syminfo.tickerid, timeframe, high[1], lookahead = barmerge.lookahead_on)

// Plot the values.
plot(lookaheadOff, "High, no lookahead bias", color.new(color.blue, 40), 5)
plot(lookaheadOn, "High with lookahead bias", color.fuchsia, 3)
plot(lookaheadOnOffset, "High, no lookahead bias or repaint", color.aqua, 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 60) : na, title = "Realtime bar highlight")
```
Note that:

The series requested using barmerge.lookahead_off has a new historical value at the end of each HTF period, and both series requested using barmerge.lookahead_on have new historical data at the start of each period.
On realtime bars, the plot of the series without lookahead (blue) and the series with lookahead and no historical offset (fuchsia) show the same value (i.e., the HTF period’s unconfirmed high price), as no data exists beyond those points to leak into the past. Both of these plots repaint their results after the user reloads the script, because the elapsed realtime bars from the previous run become historical bars in the new run.
The series that uses lookahead and a historical offset (aqua) does not repaint its results, because it always uses the last confirmed value from the higher timeframe. See the Avoiding repainting section of this page for more information.

NoticeIn Pine Script versions 1 and 2, the security() function did not include a lookahead parameter. However, the request behaved the same as those with lookahead = barmerge.lookahead_on in later versions of Pine, meaning that it systematically accessed future data from a higher timeframe on historical bars. Therefore, exercise caution with Pine v1 or v2 scripts that use HTF security() calls, unless those calls offset the requested series with the [] operator.
Dynamic requests
By default, unlike all previous Pine Script versions, request.*() function calls in Pine Script v6 are dynamic.
In contrast to non-dynamic requests, dynamic requests can:

Access data from different data feeds using a single request.*() instance with “series” arguments.
Execute within the local scopes of conditional structures, loops, and exported functions.
Execute nested requests.

Aside from the features listed above, there are insignificant differences in the behavior of dynamic and non-dynamic requests. However, for backward compatibility, programmers can deactivate dynamic requests by specifying dynamic_requests = false in the indicator(), strategy(), or library() declaration statement.
**Note:** In Pine Script v5, it is possible for scripts to call user-defined functions or methods containing request.*() calls inside loops or conditional structures without enabling dynamic requests. However, those wrapped requests are not truly dynamic, and they still require “simple” or weaker qualifiers for all arguments that define the requested context.In Pine Script v6, scripts cannot use wrapped request.*() calls within the local blocks of these structures without enabling dynamic requests.
”series” arguments
Scripts without dynamic requests enabled cannot use “series” arguments for most request.*() function parameters, which means the argument values cannot change. The only exception is the expression parameter in request.security(), request.security_lower_tf(), and request.seed(), which always allows “series” values.
In contrast, when a script allows dynamic requests, all request.*() function parameters that define parts of the ticker ID or timeframe of a request accept “series” arguments that can change with each script execution. In other words, with dynamic requests, it’s possible for a single request.*() instance to fetch data from different contexts in different executions. Some other optional parameters, such as ignore_invalid_symbol, can also accept “series” arguments, allowing additional flexibility in request.*() call behaviors.
The following script declares a symbolSeries variable that is assigned four different symbol strings in 20-bar cycles, with its value changing after every five bars. The request.security() call uses this variable as the symbol argument. The script plots the requestedClose values, which therefore represent a different symbol’s close prices for each five-bar period.

```pinescript
//@version=6
indicator("'series' arguments demo")
 
//@variable A "series" that cycles through four different symbol strings. Its value changes every five bars.  
string symbolSeries = switch int(bar_index / 5) % 4
```
    1 => "NASDAQ:MSFT"
    2 => "NASDAQ:AMD"
    3 => "NASDAQ:INTC"
    =>   "AMEX:SPY"

```pinescript
//@variable The requested `close` value from one of the four `symbolSeries` values on the chart's timeframe.
float requestedClose = request.security(symbolSeries, timeframe.period, close)

// Plot the `requestedClose`.
plot(requestedClose, "Requested close", color.purple, 3)

// Draw a label displaying the requested symbol each time the `symbolSeries` changes.
if symbolSeries != symbolSeries[1]
    label.new(bar_index, requestedClose, symbolSeries, textcolor = color.white)
```
Note that:

The script draws a label every time the symbolSeries changes, to signify which symbol’s data the requestedClose currently represents.
Pine v6 scripts enable dynamic requests by default, allowing this script to use a “series string” symbol argument in its request.security() call without error. If the dynamic behavior is disabled by including dynamic_requests = false in the indicator() declaration, then the “series” argument causes a compilation error.

An important limitation is that when using dynamic request.*() calls with “series” arguments or within local scopes, scripts must request all required datasets while executing on historical bars. All request.*() calls on realtime bars can retrieve data from the datasets that the script previously accessed on historical bars, but they cannot request a new context or evaluate a new expression.
To illustrate this limitation, let’s revisit the above script. Notice that it requests close data for all four symbols on the chart’s timeframe during its historical executions. The external datasets for those four contexts are the only ones that any request.*() call on realtime bars can access.
Below, we changed the timeframe argument in the script’s request.security() call to specify that it requests symbolSeries data from the chart’s timeframe on historical bars and the “240” (240 minutes = 4H) timeframe on realtime bars. This version raises a runtime error on the first realtime tick, if it is run on any timeframe other than the 4H timeframe, because it cannot access the 4H data feeds without requesting them on historical bars first:
```pinescript
//@version=6
indicator("Invalid realtime request demo")
 
//@variable A "series" that cycles through four different symbol strings. Its value changes every five bars.  
string symbolSeries = switch int(bar_index / 5) % 4
```
    1 => "NASDAQ:MSFT"
    2 => "NASDAQ:AMD"
    3 => "NASDAQ:INTC"
    =>   "AMEX:SPY"

// Request the `close` of the `symbolSeries` from the chart's timeframe on historical bars and the "240" (4H) timeframe 
// on realtime bars. Causes a runtime error on the first realtime tick because the script did not previously access 
// data from the "240" timeframe on any historical bars. 
float requestedClose = request.security(symbolSeries, barstate.isrealtime ? "240" : timeframe.period, close)

// Plot the `requestedClose`.
plot(requestedClose, "Requested close", color.purple, 3)

// Draw a label displaying the requested symbol each time the `symbolSeries` changes.
if symbolSeries != symbolSeries[1]
    label.new(bar_index, requestedClose, symbolSeries, textcolor = color.white)
In local scopes
When scripts do not allow dynamic requests, all request.*() calls execute once on every bar or realtime tick, which prevents their use within most local scopes. The only exception is for request.*() calls in the scopes of non-exported functions and methods, because the Pine Script compiler extracts such calls into the global scope during translation.
Scripts that allow dynamic requests do not restrict the execution of request.*() calls to the global scope. They can call request.*() functions directly within the scopes of conditional structures and loops, meaning that each request.*() instance in the code can activate zero, one, or several times on each script execution.
The following example uses a single request.security() instance within a loop to request data from multiple forex data feeds. The script declares an array of symbols on the first chart bar, which it iterates through on all bars using a for…in loop. Each loop iteration calls request.security() to retrieve the volume value for one of the symbols and pushes the result into the requestedData array. After the loop terminates, the script calculates the average, maximum, and minimum values from the requestedData array using built-in methods, then plots the results on the chart:

```pinescript
//@version=6
indicator("In local scopes demo", format = format.volume)

//@variable An array of "string" values representing different symbols to request. 
var array<string> symbols = array.from(
```
     "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "EURJPY", "GBPJPY", "EURGBP"
 )

```pinescript
//@variable An array containing the data retrieved for each requested symbol.  
```
array<float> requestedData = array.new<float>()

// Retrieve `volume` data for each symbol in the `symbols` array and push the results into the `requestedData` array. 
for symbol in symbols
    float data = request.security("OANDA:" + symbol, timeframe.period, volume)
    requestedData.push(data)

// Calculate the average, maximum, and minimum tick volume in the `requestedData`.
float avgVolume = requestedData.avg()
float maxVolume = requestedData.max()
float minVolume = requestedData.min()

// Plot the `avgVolume`, `maxVolume`, and `minVolume`. 
plot(avgVolume, "Average volume", color.gray,   3)
plot(maxVolume, "Highest volume", color.teal,   3)
plot(minVolume, "Lowest volume",  color.maroon, 3)
Notice that the expression argument in the above example (volume) is loop-invariant, i.e., it does not change on any loop iteration. When using request.*() calls within a loop, all parameters defining parts of the requested context can accept arguments that depend on variables from the loop’s header or mutable variables that change within the loop’s local scope. However, a request.*() call’s evaluated expression cannot depend on the values of those variables.
Here, we modified the above script to use the second form of the for…in loop statement, which creates a tuple containing the index and value of each element in the symbols array. The request.security() instance in this version uses the index (i) in its expression argument, resulting in a compilation error:
```pinescript
//@version=6
indicator("Loop-dependent expression demo", format = format.volume)

//@variable An array of "string" values representing different symbols to request. 
var array<string> symbols = array.from(
```
     "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "EURJPY", "GBPJPY", "EURGBP"
 )

```pinescript
//@variable An array containing the data retrieved for each requested symbol.  
```
array<float> requestedData = array.new<float>()

// Retrieve `volume` data for each symbol in the `symbols` array, weighted using the element index.
// Causes a compilation error because the `expression` in `request.security()` cannot depend on loop variables 
// or mutable variables that change within the loop's scope. 
for [i, symbol] in symbols
    float data = request.security("OANDA:" + symbol, timeframe.period, volume * (10 - i))
    requestedData.push(data)

// Calculate the average, maximum, and minimum tick volume in the `requestedData`.
float avgVolume = requestedData.avg()
float maxVolume = requestedData.max()
float minVolume = requestedData.min()

// Plot the `avgVolume`, `maxVolume`, and `minVolume`. 
plot(avgVolume, "Average volume", color.gray,   3)
plot(maxVolume, "Highest volume", color.teal,   3)
plot(minVolume, "Lowest volume",  color.maroon, 3)
In libraries
Libraries with dynamic requests enabled can export functions and methods that utilize request.*() calls within their local scopes, provided that the evaluated expressions do not depend on any exported function parameters.
For example, this simple library exports an htfPrices() function that requests a tuple of confirmed open, high, low, and close prices using a specified tickerID and timeframe. If we publish this library, another script can import the function to request higher-timeframe prices without explicitly calling request.security().
```pinescript
//@version=6
library("DynamicRequests")

//@function        Requests a tuple containing confirmed HTF OHLC data for a specified `tickerID` and `timeframe`.
//@param tickerID  The ticker identifier to request data for. 
//@param timeframe The timeframe of the requested data.
//@returns         A tuple containing the last confirmed `open`, `high`, `low`, and `close` from the requested context.
export htfPrices(string tickerID, string timeframe) =>
    if timeframe.in_seconds() >= timeframe.in_seconds(timeframe)
        runtime.error("The `timeframe` argument of `getHTFPrices()` must be higher than the chart's timeframe.")
    request.security(tickerID, timeframe, [open[1], high[1], low[1], close[1]], lookahead = barmerge.lookahead_on)
```
Note that:

The tuple that the request.security() call includes as the expression argument does not depend on the htfPrices() parameters.
The htfPrices() function includes a runtime.error() call that raises a custom runtime error when the timeframe argument does not represent a higher timeframe than the chart’s timeframe. See the higher timeframes section for more information.
The request.security() call uses barmerge.lookahead_on and offsets each item in the tuple by one bar. This is the only recommended method to avoid repainting.

Nested requests
Scripts can use dynamic requests to execute nested requests, i.e., request.*() calls that dynamically evaluate other request.*() calls that their expression arguments depend on.
When a request.security() or request.security_lower_tf() call uses an empty string or syminfo.tickerid for its symbol argument, or if it uses an empty string or timeframe.period for the timeframe argument, the requested ticker ID or timeframe depends on the context where the call executes. This context is normally the ticker ID or timeframe of the chart that the script is running on. However, if such a request.security() or request.security_lower_tf() function call is evaluated by another request.*() call, the nested request inherits that request.*() call’s ticker ID or timeframe information.
For example, the script below contains two request.security() calls and uses Pine Logs to display their results. The first call uses empty strings as its symbol and timeframe arguments, meaning that the requested context depends on where the call executes. It evaluates a concatenated string containing the call’s requested ticker ID and timeframe, and the script assigns its result to the info1 variable.
The second call requests data for a specific symbol and timeframe using the info1 variable as its expression argument. Since the info1 variable depends on the first request.security() call, the second call evaluates the first call within its own context. Therefore, the first call adopts the second call’s ticker ID and timeframe while executing within that context, resulting in a different returned value:

```pinescript
//@version=6
indicator("Nested requests demo")

//@variable A concatenated string containing the current `syminfo.tickerid` and `timeframe.period`.
string info1 = request.security("", "", syminfo.tickerid + "_" + timeframe.period)
//@variable A concatenated string representing the `info1` value calculated within the "NASDAQ:AAPL, 240" context.
//          This call evaluates the call on line 5 within its context to determine its result because the script 
//          allows dynamic requests.
string info2 = request.security("NASDAQ:AAPL", "240", info1)

// Log the results from both calls in the Pine Logs pane on the last historical bar. 
if barstate.islastconfirmedhistory
    log.info("First request: {0}", info1)
    log.info("Second request: {0}", info2)
```
This script allows the execution of the first request.security() call within the context of the second call because Pine v6 scripts enable dynamic request.*() calls by default. We can disable this behavior by including dynamic_requests = false in the indicator() declaration statement. Without dynamic requests enabled, the script evaluates each call independently, passing the first call’s calculated value directly into the second call rather than executing the first call within the second context. Consequently, the second call’s returned value is the same as the first call’s value, as we see below:

```pinescript
//@version=6
indicator("Nested requests demo", dynamic_requests = false)

//@variable A concatenated string containing the current `syminfo.tickerid` and `timeframe.period`.
string info1 = request.security("", "", syminfo.tickerid + "_" + timeframe.period)
//@variable The same value as `info1`. This call does not evalutate the call on line 5 because dynamic requests aren't 
//          allowed. Instead, it only uses the value of `info1`, meaning its result does not change. 
string info2 = request.security("NASDAQ:AAPL", "240", info1)

// Log the results from both calls in the Pine Logs pane on the last historical bar. 
if barstate.islastconfirmedhistory
    log.info("First request: {0}", info1)
    log.info("Second request: {0}", info2)
```
Data feeds
TradingView’s data providers supply different data feeds that scripts
can access to retrieve information about an instrument, including:

Intraday historical data (for timeframes < 1D)
End-of-day (EOD) historical data (for timeframes >= 1D)
Realtime data (which may be delayed, depending on your account type
and extra data services)
Extended hours data

Not all of these data feed types exist for every instrument. For
example, the symbol “BNC:BLX” only has EOD data available.
For some instruments with intraday and EOD historical feeds, volume data
may not be the same since some trades (block trades, OTC trades, etc.)
may only be available at the end of the trading day. Consequently, the
EOD feed will include this volume data, but the intraday feed will not.
Differences between EOD and intraday volume feeds are almost nonexistent
for instruments such as cryptocurrencies, but they are commonplace in
stocks.
Slight price discrepancies may also occur between EOD and intraday
feeds. For example, the high value on one EOD bar may not match any
intraday high values supplied by the data provider for that day.
Another distinction between EOD and intraday data feeds is that EOD
feeds do not contain information from extended hours.
When retrieving information on realtime bars with request.*()
functions, it’s important to note that historical and realtime data
reported for an instrument often rely on different data feeds. A
broker/exchange may retroactively modify values reported on realtime
bars, which the data will only reflect after refreshing the chart or
restarting the script.
Another important consideration is that the chart’s data feeds and
feeds requested from providers by the script are managed by
independent, concurrent processes. Consequently, in some rare cases,
it’s possible for races to occur where requested results temporarily
fall out of synch with the chart on a realtime bar, which a script
retroactively adjusts after restarting its executions.
These points may account for variations in the values retrieved by
request.*() functions when requesting data from other contexts. They
may also result in discrepancies between data received on realtime bars
and historical bars. There are no steadfast rules about the variations
one may encounter in their requested data feeds.
NoteAs a rule, TradingView does not generate data; it relies on its data providers for the information displayed on charts and accessed by scripts.
When using data feeds requested from other contexts, it’s also crucial
to consider the time axis differences between the chart the script
executes on and the requested feeds since request.*() functions adapt
the returned series to the chart’s time axis. For example, requesting
“BTCUSD” data on the “SPY” chart with
request.security()
will only show new values when the “SPY” chart has new data as well.
Since “SPY” is not a 24-hour symbol, the “BTCUSD” data returned will
contain gaps that are otherwise not present when viewing its chart
directly.
​request.security()​
The
request.security()
function allows scripts to request data from other contexts than the
chart the script executes on, such as:

Other symbols, including spread
symbols
Other timeframes (see our User Manual’s page on
Timeframes to learn
about timeframe specifications in Pine Script)
Custom contexts, including alternative sessions, price adjustments,
chart types, etc. using ticker.*() functions

This is the function’s signature:
request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol, currency, calc_bars_count) → series <type>
The symbol value is the ticker identifier representing the symbol to
fetch data from. This parameter accepts values in any of the following
formats:

A “string” representing a symbol (e.g., “IBM” or “EURUSD”) or
an “Exchange:Symbol” pair (e.g., “NYSE:IBM” or
“OANDA:EURUSD”). When the value does not contain an exchange
prefix, the function selects the exchange automatically. We
recommend specifying the exchange prefix when possible for
consistent results. Users can also pass an empty string to this
parameter, which prompts the function to use the current chart’s
symbol.
A “string” representing a spread
symbol
(e.g., “AMD/INTC”). Note that “Bar Replay” mode does not work
with these symbols.
The
syminfo.ticker
or
syminfo.tickerid
built-in variables, which return the symbol or the
“Exchange:Symbol” pair that the current chart references. We
recommend using
syminfo.tickerid
to avoid ambiguity unless the exchange information does not matter
in the data request. For more information on syminfo.* variables,
see
this section of our
Chart information page.
A custom ticker identifier created using ticker.*() functions.
Ticker IDs constructed from these functions may contain additional
settings for requesting data using
non-standard chart calculations, alternative sessions, and other contexts.
See the
Custom contexts section for more information.

The timeframe value specifies the timeframe of the requested data.
This parameter accepts “string” values in our
timeframe specification format (e.g., a value of “1D” represents the daily
timeframe). To request data from the same timeframe as the chart the
script executes on, use the
timeframe.period
variable or an empty string.
The expression parameter of the
request.security()
function determines the data it retrieves from the specified context.
This versatile parameter accepts “series” values of
int,
float,
bool,
color,
string,
and chart.point types. It can also accept
tuples,
collections,
user-defined types, and the outputs of function and
method calls. For more
details on the data one can retrieve, see the
Requestable data section below.
NoticeIf a request.*() call uses the value from a source input in its expression argument, and that input accesses a plotted series from another indicator, the request evaluates that series using the data for the chart’s symbol, and not the data for the specified symbol. This behavior occurs because request.*() functions cannot evaluate the scopes required by an external series. Therefore, some request.*() calls that use a symbol argument and request the value of a source input can return unintended results.
Timeframes
The
request.security()
function can request data from any available timeframe, regardless of
the chart the script executes on. The timeframe of the data retrieved
depends on the timeframe argument in the function call, which may
represent a higher timeframe (e.g., using “1D” as the timeframe
value while running the script on an intraday chart) or the chart’s
timeframe (i.e., using
timeframe.period
or an empty string as the timeframe argument).
Scripts can also request limited data from lower timeframes with
request.security()
(e.g., using “1” as the timeframe argument while running the script
on a 60-minute chart). However, we don’t typically recommend using this
function for LTF data requests. The
request.security_lower_tf()
function is more optimal for such cases.
Higher timeframes
Most use cases of
request.security()
involve requesting data from a timeframe higher than or the same as the
chart timeframe. For example, this script retrieves the
hl2
price from a requested higherTimeframe. It
plots the resulting series
on the chart alongside the current chart’s
hl2 for
comparison:

```pinescript
//@version=6
indicator("Higher timeframe security demo", overlay = true)

//@variable The higher timeframe to request data from.
string higherTimeframe = input.timeframe("240", "Higher timeframe")

//@variable The `hl2` value from the `higherTimeframe`. Combines lookahead with an offset to avoid repainting.
float htfPrice = request.security(syminfo.tickerid, higherTimeframe, hl2[1], lookahead = barmerge.lookahead_on)

// Plot the `hl2` from the chart timeframe and the `higherTimeframe`.
plot(hl2, "Current timeframe HL2", color.teal, 2)
plot(htfPrice, "Higher timeframe HL2", color.purple, 3)
```
Note that:

We’ve included an offset to the expression argument and used
barmerge.lookahead_on
in
request.security()
to ensure the series returned behaves the same on historical and
realtime bars. See the
Avoiding repainting section for more information.

Notice that in the above example, it is possible to select a
higherTimeframe value that actually represents a lower timeframe
than the one the chart uses, as the code does not prevent it. When
designing a script to work specifically with higher timeframes, we
recommend including conditions to prevent it from accessing lower
timeframes, especially if you intend to
publish it.
Below, we’ve added an if structure to our previous example. If the higherTimeframe value represents a timeframe that is smaller than the chart’s timeframe, the script calls runtime.error() within the structure’s local block to raise a custom runtime error, effectively preventing the script from requesting LTF data:

```pinescript
//@version=6
indicator("Higher timeframe security demo", overlay = true)

//@variable The higher timeframe to request data from.
string higherTimeframe = input.timeframe("240", "Higher timeframe")

// Raise a runtime error when the `higherTimeframe` is smaller than the chart's timeframe.
if timeframe.in_seconds() > timeframe.in_seconds(higherTimeframe)
    runtime.error("The requested timeframe is smaller than the chart's timeframe. Select a higher timeframe.")

//@variable The `hl2` value from the `higherTimeframe`. Combines lookahead with an offset to avoid repainting.
float htfPrice = request.security(syminfo.tickerid, higherTimeframe, hl2[1], lookahead = barmerge.lookahead_on)

// Plot the `hl2` from the chart timeframe and the `higherTimeframe`.
plot(hl2, "Current timeframe HL2", color.teal, 2)
plot(htfPrice, "Higher timeframe HL2", color.purple, 3)
```
Lower timeframes
Although the
request.security()
function is intended to operate on timeframes greater than or equal to
the chart timeframe, it can request data from lower timeframes as
well, with limitations. When calling this function to access a lower
timeframe, it will evaluate the expression from the LTF context.
However, it returns the results from only a single intrabar (LTF
bar) on each chart bar.
The intrabar that the function returns data from on each historical
chart bar depends on the lookahead value in the function call. When
using
barmerge.lookahead_on,
it will return the first available intrabar from the chart period.
When using
barmerge.lookahead_off,
it will return the last intrabar from the chart period. On realtime
bars, it returns the last available value of the expression from the
timeframe, regardless of the lookahead value, as the realtime intrabar
information retrieved by the function is not yet sorted.
This script retrieves
close
data from the valid timeframe closest to a fourth of the size of the
chart timeframe. It makes two calls to
request.security()
with different lookahead values. The first call uses
barmerge.lookahead_on
to access the first intrabar value in each chart bar. The second uses
the default lookahead value
(barmerge.lookahead_off),
which requests the last intrabar value assigned to each chart bar. The
script plots the outputs of
both calls on the chart to compare the difference:

```pinescript
//@version=6
indicator("Lower timeframe security demo", overlay = true)

//@variable The valid timeframe closest to 1/4 the size of the chart timeframe.
string lowerTimeframe = timeframe.from_seconds(int(timeframe.in_seconds() / 4))

//@variable The `close` value on the `lowerTimeframe`. Represents the first intrabar value on each chart bar.
float firstLTFClose = request.security(syminfo.tickerid, lowerTimeframe, close, lookahead = barmerge.lookahead_on)
//@variable The `close` value on the `lowerTimeframe`. Represents the last intrabar value on each chart bar.
float lastLTFClose = request.security(syminfo.tickerid, lowerTimeframe, close)

// Plot the values.
plot(firstLTFClose, "First intrabar close", color.teal, 3)
plot(lastLTFClose, "Last intrabar close", color.purple, 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 70) : na, title = "Realtime background highlight")
```
Note that:

The script determines the value of the lowerTimeframe by
calculating the number of seconds in the chart timeframe with
timeframe.in_seconds(),
then dividing by four and converting the result to a
valid timeframe string via
timeframe.from_seconds().
The plot of the series without lookahead
(purple)
aligns with the
close
value on the chart timeframe, as this is the last intrabar value
in the chart bar.
Both request.security() calls return the same value (the current close) on each realtime bar, as shown on the bars with the orange background.
Scripts can retrieve up to 200,000 intrabars from a lower-timeframe context. The number of chart bars with available intrabar data varies with the requested lower timeframe, the calc_bars_count value, and the user’s plan. For more information, see this section of the Limitations page.

TipWhile scripts can use request.security() to retrieve limited intrabar data, we recommend using request.security_lower_tf() function for such requests in most cases. Instead of retrieving data for only a single LTF bar on each chart bar, it returns an array containing the data for all available LTF bars in the chart bar. See the ​request.security_lower_tf() section below to learn more.
Requestable data
The
request.security()
function is quite versatile, as it can retrieve values of any
fundamental type (int, float, bool, color, or string). It can also request the IDs of data structures and
built-in or
user-defined types that reference fundamental types. The data this function
requests depends on its expression parameter, which accepts any of the
following arguments:

Built-in variables and function calls
Variables declared by the script
Tuples
Calls to user-defined functions
Chart points
Collections
User-defined types

Built-in variables and functions
A frequent use case of
request.security()
is requesting the output of a built-in variable or
function/method call from
another symbol or timeframe.
For example, suppose we want to calculate the 20-bar SMA of a symbol’s
ohlc4
prices from the daily timeframe while on an intraday chart. We can
accomplish this task with a single line of code:
float ma = request.security(syminfo.tickerid, "1D", ta.sma(ohlc4, 20))
The above line calculates the value of ta.sma(ohlc4, 20) on the current symbol’s data from the daily timeframe.
It’s important to note that newcomers to Pine might sometimes confuse the above line of code as being equivalent to the following:
float ma = ta.sma(request.security(syminfo.tickerid, "1D", ohlc4), 20)
However, this line returns an entirely different result. Rather
than requesting a 20-bar SMA from the daily timeframe, it requests the
ohlc4
price from the daily timeframe and calclates the
ta.sma()
of the results over 20 chart bars.
In essence, when the intention is to request the results of an
expression from other contexts, pass the expression directly to the
expression parameter in the
request.security()
call, as demonstrated in the initial example.
Let’s expand on this concept. The script below calculates a multi-timeframe (MTF) ribbon of moving averages, where each moving average in the ribbon calculates over the same number of bars on its respective timeframe. Each request.security() call uses a ta.sma() call as its expression argument to return a length-bar SMA from the specified timeframe:

```pinescript
//@version=6
indicator("Requesting built-ins demo", "MTF Ribbon", true)

//@variable The length of each moving average.
int length = input.int(20, "Length", 1)

//@variable The number of seconds in the chart timeframe.
int chartSeconds = timeframe.in_seconds()

// Calculate the higher timeframes closest to 2, 3, and 4 times the size of the chart timeframe.
string htf1 = timeframe.from_seconds(chartSeconds * 2)
string htf2 = timeframe.from_seconds(chartSeconds * 3)
string htf3 = timeframe.from_seconds(chartSeconds * 4)

// Calculate the `length`-bar moving averages from each timeframe.
float chartAvg = ta.sma(ohlc4, length)
float htfAvg1  = request.security(syminfo.tickerid, htf1, ta.sma(ohlc4, length))
float htfAvg2  = request.security(syminfo.tickerid, htf2, ta.sma(ohlc4, length))
float htfAvg3  = request.security(syminfo.tickerid, htf3, ta.sma(ohlc4, length))

// Plot the results.
plot(chartAvg, "Chart timeframe SMA", color.red, 3)
plot(htfAvg1, "Double timeframe SMA", color.orange, 3)
plot(htfAvg2, "Triple timeframe SMA", color.green, 3)
plot(htfAvg3, "Quadruple timeframe SMA", color.blue, 3)

// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.aqua, 70) : na, title = "Realtime highlight")
```
Note that:

The script calculates the ribbon’s higher timeframes by
multiplying the chart’s
timeframe.in_seconds()
value by 2, 3, and 4, then converting each result into a
valid timeframe string using
timeframe.from_seconds().
Instead of calling
ta.sma()
within each
request.security()
call, one could use the chartAvg variable as the expression
in each call to achieve the same result. See the
next section for more information.
On realtime bars, this script also tracks unconfirmed SMA
values from each higher timeframe. See the
Historical and realtime behavior section to learn more.

Declared variables
The request.security() function’s expression parameter can accept declared variables that are accessible to the scope from which the function call executes. When using a declared variable as the expression argument, the function call duplicates all preceding code that determines the assigned value or reference. This duplication allows the function to evaluate necessary calculations and logic in the requested context without affecting the original variable.
For instance, this line of code declares a priceReturn variable that holds the current bar’s arithmetic price return:
float priceReturn = (close - close[1]) / close[1]
We can evaluate the priceReturn variable’s calculations in another context by using it as the expression in a request.security() call. The call below duplicates the variable’s calculation and evaluates it across the data from another symbol, returning a separate series adapted to the chart’s time axis:
float requestedReturn = request.security(symbol, timeframe.period, priceReturn)
This example script compares the price returns of the current chart’s symbol and a user-specified symbol. It calculates the value of the priceReturn variable, then uses that variable as the expression in a request.security() call to evaluate the calculation on the input symbol’s data. After the request, the script calculates the correlation between the priceReturn and requestedReturn series using ta.correlation() and plots the result on the chart:

```pinescript
//@version=6
indicator("Requesting calculated variables demo", "Price return correlation")

//@variable The symbol to compare to the chart symbol.
string symbol = input.symbol("SPY", "Symbol to compare")
//@variable The number of bars in the calculation window.
int length = input.int(60, "Length", 1)

//@variable The close-to-close price return.
float priceReturn = (close - close[1]) / close[1]
//@variable The close-to-close price return calculated on another `symbol`.
float requestedReturn = request.security(symbol, timeframe.period, priceReturn)

//@variable The correlation between the `priceReturn` and `requestedReturn` over `length` bars.
float correlation = ta.correlation(priceReturn, requestedReturn, length)
//@variable The color of the correlation plot.
color plotColor = color.from_gradient(correlation, -1, 1, color.purple, color.orange)

// Plot the correlation value.
plot(correlation, "Correlation", plotColor, style = plot.style_area)
```
Note that:

The request.security() call executes the same calculation used in the priceReturn declaration, but the request’s calculation operates on the close values from the specified symbol’s data.
The script uses the color.from_gradient() function to calculate the color for the plot of the correlation series on each bar. See this section of the Colors page to learn more about color gradients.

When using a variable as the expression argument of a request.*() call, it’s important to note that the function only duplicates code that affects the variable before the call. It cannot copy any subsequent code following the call. Consequently, if the script reassigns the variable or modifies its referenced data after calling request.security(), the code evaluated on the requested data does not include those additional operations.
For example, the following script declares a counter variable and calls request.security() to evaluate the variable from the same context as the chart. After the call, the script increments the counter value by one with the addition assignment operator (+=), then uses plots and Pine Logs to display the counter and requestedCounter values for comparison.
As shown below, the plots and logs of the two variables display different values. The requestedCounter variable has a consistent value of 0 because the request.security() call evaluates only the initial variable declaration. The request cannot evaluate the addition assignment operation because the script includes that code after the function call:

```pinescript
//@version=6
indicator("Modifying variables after requests demo")

//@variable A counter that starts at 0 and increments by 1 on each bar. 
var int counter = 0

//@variable Holds a consistent value of 0. 
//          `request.security()` cannot evaluate `counter += 1` in its requested context 
//          because that modification occurs *after* the call. 
int requestedCounter = request.security(syminfo.tickerid, timeframe.period, counter)

// Increment the `counter` by 1. This operation is *not* included in the `requestedCounter` calculation.
```
counter += 1

// Plot both variables for comparison. 
plot(counter, "Original counter", color.purple, 3)
plot(requestedCounter, "Requested counter", color.red, 3)

// Log the values of both variables in the Pine Logs pane.
if barstate.isconfirmed
    log.info("counter: {0}, requestedCounter: {1}", counter, requestedCounter)
Tuples
Tuples in Pine Script are comma-separated lists of expressions enclosed in square brackets. Programmers often use tuples when creating functions, conditional structures, or loops that return multiple values or references from their local scopes.
The
request.security()
function can accept a tuple as its expression argument, allowing
scripts to request multiple series of different types using a single
function call. The expressions within requested tuples can be of any
type outlined throughout the
Requestable data section of this page, excluding other tuples.
**Note:** The combined size of all tuples returned by request.*() calls in a script cannot exceed 127 elements. See the Tuple element limit section of the Limitations page for more information.
Tuples are particularly helpful when a script needs to retrieve more than one value from a specific context.
For example, the following script calculates the percent rank of the close series over length bars and assigns the result to the rank variable. It then calls request.security() to request a tuple containing the values of rank, ta.crossover(rank, 50), and ta.crossunder(rank, 50) from a specified timeframe. The script plots the requestedRank series in a separate pane, then uses the result of a ternary expression based on the crossOver and crossUnder values within a bgcolor() call to conditionally highlight the pane’s background:

```pinescript
//@version=6
indicator("Requesting tuples demo", "Percent rank cross")

//@variable The timeframe of the request.
string timeframe = input.timeframe("240", "Timeframe")
//@variable The number of bars in the calculation.
int length = input.int(20, "Length")

//@variable The previous bar's percent rank of the `close` price over `length` bars.
float rank = ta.percentrank(close, length)[1]

// Request the `rank` value from another `timeframe`, and two "bool" values indicating the `rank` from the `timeframe`
// crossed over or under 50.
[requestedRank, crossOver, crossUnder] = request.security(
```
     syminfo.tickerid, timeframe, [rank, ta.crossover(rank, 50), ta.crossunder(rank, 50)],
     lookahead = barmerge.lookahead_on
 )

// Plot the `requestedRank` and create a horizontal line at 50.
plot(requestedRank, "Percent Rank", linewidth = 3)
hline(50, "Cross line", linewidth = 2)
// Highlight the background of all bars where the `timeframe`'s `crossOver` or `crossUnder` value is `true`.
bgcolor(crossOver ? color.new(color.green, 50) : crossUnder ? color.new(color.red, 50) : na)
Note that:

We’ve offset the rank variable’s expression by one bar using
the history-referencing operator
[]
and included
barmerge.lookahead_on
in the
request.security()
call to ensure the values on realtime bars do not repaint after
becoming historical bars. See the
Avoiding repainting section for more information.
The
request.security()
call returns a tuple, so we use a tuple declaration to declare
the requestedRank, crossOver, and crossUnder variables. To
learn more about using tuples, see
this section of our User Manual’s
Type system
page.

User-defined functions
User-defined functions and
methods
are custom functions written by users. They allow users to define
sequences of operations associated with an identifier that scripts can
conveniently call throughout their executions (e.g., myUDF()).
The
request.security()
function can request the results of
user-defined functions and
methods
whose scopes consist of any types outlined throughout this page’s
Requestable data section.
For example, this script contains a user-defined weightedBB() function
that calculates Bollinger Bands with the basis average weighted by a
specified weight series. The function returns a
tuple of custom
band values. The script calls the weightedBB() as the expression
argument in
request.security()
to retrieve a
tuple of band values calculated on the specified timeframe and
plots the results on the
chart:

```pinescript
//@version=6
indicator("Requesting user-defined functions demo", "Weighted Bollinger Bands", true)

//@variable The timeframe of the request.
string timeframe = input.timeframe("480", "Timeframe")

//@function     Calculates Bollinger Bands with a custom weighted basis.
//@param source The series of values to process.
//@param length The number of bars in the calculation.
//@param mult   The standard deviation multiplier.
//@param weight The series of weights corresponding to each `source` value.
//@returns      A tuple containing the basis, upper band, and lower band respectively.
weightedBB(float source, int length, float mult = 2.0, float weight = 1.0) =>
    //@variable The basis of the bands.
    float ma = math.sum(source * weight, length) / math.sum(weight, length)
    //@variable The standard deviation from the `ma`.
    float dev = 0.0
    // Loop to accumulate squared error.
    for i = 0 to length - 1
        difference = source[i] - ma
```
        dev += difference * difference
    // Divide `dev` by the `length`, take the square root, and multiply by the `mult`.
    dev := math.sqrt(dev / length) * mult
    // Return the bands.
    [ma, ma + dev, ma - dev]

// Request weighted bands calculated on the chart symbol's prices over 20 bars from the
// last confirmed bar on the `timeframe`.
[basis, highBand, lowBand] = request.security(
     syminfo.tickerid, timeframe, weightedBB(close[1], 20, 2.0, (high - low)[1]), lookahead = barmerge.lookahead_on
 )

// Plot the values.
basisPlot = plot(basis, "Basis", color.orange, 2)
upperPlot = plot(highBand, "Upper", color.teal, 2)
lowerPlot = plot(lowBand, "Lower", color.maroon, 2)
fill(upperPlot, lowerPlot, color.new(color.gray, 90), "Background")
Note that:

We offset the source and weight arguments in the
weightedBB() call used as the expression in
request.security()
and used
barmerge.lookahead_on
to ensure the requested results reflect the last confirmed
values from the timeframe on realtime bars. See
this section to learn more.

Chart points
Chart points are objects that represent coordinates on the chart.
Lines,
boxes,
polylines,
and labels use these objects to set their display locations.
The
request.security()
function can use the ID of a
chart.point
instance in its expression argument, allowing scripts to retrieve
chart coordinates from other contexts.
The example below requests a tuple of historical
chart points from a higher timeframe and uses them to draw
boxes on the
chart. The script declares the topLeft and bottomRight variables
that reference
chart.point
IDs from the last confirmed bar. It then uses
request.security()
to request a
tuple containing the IDs of
chart points representing the topLeft and bottomRight from a
higherTimeframe.
When a new bar starts on the higherTimeframe, the script draws a new box using the time and price coordinates from the requestedTopLeft and requestedBottomRight chart points:

```pinescript
//@version=6
indicator("Requesting chart points demo", "HTF Boxes", true, max_boxes_count = 500)

//@variable The timeframe to request data from.
string higherTimeframe = input.timeframe("1D", "Timeframe")

// Raise a runtime error if the `higherTimeframe` is smaller than the chart's timeframe.
if timeframe.in_seconds(higherTimeframe) < timeframe.in_seconds(timeframe.period)
    runtime.error("The selected timeframe is too small. Choose a higher timeframe.")

//@variable A `chart.point` containing top-left coordinates from the last confirmed bar.
topLeft = chart.point.now(high)[1]
//@variable A `chart.point` containing bottom-right coordinates from the last confirmed bar.
bottomRight = chart.point.from_time(time_close, low)[1]

// Request the last confirmed `topLeft` and `bottomRight` chart points from the `higherTimeframe`.
[requestedTopLeft, requestedBottomRight] = request.security(
```
     syminfo.tickerid, higherTimeframe, [topLeft, bottomRight], lookahead = barmerge.lookahead_on
 )

// Draw a new box when a new `higherTimeframe` bar starts.
// The box uses the `time` fields from the `requestedTopLeft` and `requestedBottomRight` as x-coordinates.
if timeframe.change(higherTimeframe)
    box.new(
         requestedTopLeft, requestedBottomRight, color.purple, 3, 
         xloc = xloc.bar_time, bgcolor = color.new(color.purple, 90)
     )
Note that:

Because we designed this example to request data from higher timeframes, we’ve included a runtime.error() call that the script executes if the higherTimeframe value represents a lower timeframe than timeframe.period.

Collections
Pine Script collections (arrays, matrices,
and maps) are data structures
that contain an arbitrary number of elements with specified types. The
request.security()
function can retrieve the IDs of
collections whose elements consist of:

Fundamental types
Chart points
User-defined types that satisfy the criteria listed in the
section below

This example below calculates the ratio of a confirmed bar’s high-low range to the range between the highest and lowest prices over 10 bars from a from a specified symbol and timeframe. It uses maps to hold the values used in the calculations.
The script uses a data map with “string” keys and “float” values to store the current bar’s high, low, ta.highest(), and ta.lowest() results. It passes the map as the expression argument in a request.security() call on each bar to retrieve another map containing the values calculated from the specified context, then assigns that map’s reference to the otherData variable. The script uses the “float” values associated with the “High”, “Low”, “Highest”, and “Lowest” keys of the otherData map to calculate the ratio series that it plots in the chart pane:

```pinescript
//@version=6
indicator("Requesting collections demo", "Bar range ratio")

//@variable The ticker ID to request data from.
string symbol = input.symbol("", "Symbol")
//@variable The timeframe of the request.
string timeframe = input.timeframe("30", "Timeframe")

//@variable A map with "string" keys and "float" values.
var map<string, float> data = map.new<string, float>()

// Put key-value pairs into the `data` map.
map.put(data, "High", high)
map.put(data, "Low", low)
map.put(data, "Highest", ta.highest(10))
map.put(data, "Lowest", ta.lowest(10))

//@variable A new `map` whose data is calculated from the last confirmed bar of the requested context.
```
map<string, float> otherData = request.security(symbol, timeframe, data[1], lookahead = barmerge.lookahead_on)

```pinescript
//@variable The ratio of the context's bar range to the max range over 10 bars. Returns `na` if no data is available.
float ratio = na
if not na(otherData)
    ratio := (otherData.get("High") - otherData.get("Low")) / (otherData.get("Highest") - otherData.get("Lowest"))

//@variable A gradient color for the plot of the `ratio`.
color ratioColor = color.from_gradient(ratio, 0, 1, color.purple, color.orange)

// Plot the `ratio`.
plot(ratio, "Range Ratio", ratioColor, 3, plot.style_area)
```
Note that:

The
request.security()
call in this script can return
na
if no data is available from the specified context. Since one
cannot call methods on a
map
variable when its value is
na,
we’ve added an
if
structure to only calculate a new ratio value when otherData
references a valid
map
instance.

User-defined types
User-defined types (UDTs) are composite types containing an arbitrary number of
fields, which can be of any available type, including other
user-defined types.
The
request.security()
function can retrieve the IDs of
objects produced by
UDTs
from other contexts if their fields consist of:

Fundamental types
Chart points
Collections that satisfy the criteria listed in the
section above
Other UDTs whose fields consist of any of these types

The following example requests an
object ID using a
specified symbol and displays its field values on a chart pane.
The script contains a TickerInfo UDT with “string” fields for
syminfo.* values, an
array
field to store recent “float” price data, and an “int” field to hold
the requested ticker’s
bar_index
value. It assigns a new TickerInfo ID to an info variable on every
bar and uses the variable as the expression in
request.security()
to retrieve the ID of an object representing the calculated info from the specified
symbol.
The script displays the requestedInfo object’s description,
tickerType, currency, and barIndex values in a
label
and uses
plotcandle()
to display the values from its prices array:

```pinescript
//@version=6
indicator("Requesting user-defined types demo", "Ticker info")

//@variable The symbol to request information from.
string symbol = input.symbol("NASDAQ:AAPL", "Symbol")

//@type               A custom type containing information about a ticker.
//@field description  The symbol's description.
//@field tickerType   The type of ticker.
//@field currency     The symbol's currency.
//@field prices       An array of the symbol's current prices.
//@field barIndex     The ticker's `bar_index`.
type TickerInfo
    string       description
    string       tickerType
    string       currency
```
    array<float> prices
    int          barIndex

```pinescript
//@variable A `TickerInfo` object containing current data.
info = TickerInfo.new(
```
     syminfo.description, syminfo.type, syminfo.currency, array.from(open, high, low, close), bar_index
 )
```pinescript
//@variable The `info` requested from the specified `symbol`.
```
TickerInfo requestedInfo = request.security(symbol, timeframe.period, info)
// Assign a new `TickerInfo` instance to `requestedInfo` if one wasn't retrieved.
if na(requestedInfo)
    requestedInfo := TickerInfo.new(prices = array.new<float>(4))

```pinescript
//@variable A label displaying information from the `requestedInfo` object.
var infoLabel = label.new(
```
     na, na, "", color = color.purple, style = label.style_label_left, textcolor = color.white, size = size.large
 )
```pinescript
//@variable The text to display inside the `infoLabel`.
string infoText = na(requestedInfo) ? "" : str.format(
```
     "{0}\nType: {1}\nCurrency: {2}\nBar Index: {3}",
     requestedInfo.description, requestedInfo.tickerType, requestedInfo.currency, requestedInfo.barIndex
 )

// Set the `point` and `text` of the `infoLabel`.
label.set_point(infoLabel, chart.point.now(array.last(requestedInfo.prices)))
label.set_text(infoLabel, infoText)
// Plot candles using the values from the `prices` array of the `requestedInfo`.
plotcandle(
     requestedInfo.prices.get(0), requestedInfo.prices.get(1), requestedInfo.prices.get(2), requestedInfo.prices.get(3),
     "Requested Prices"
 )
Note that:

The syminfo.* variables used in this script all return
“simple string” qualified types. However,
objects in Pine
are always qualified as “series”. Consequently, all values
assigned to the info object’s fields automatically adopt the
“series”
qualifier.
It is possible for the
request.security()
call to return
na
due to differences between the data requested from the symbol
and the main chart. This script assigns a new TickerInfo
object to the requestedInfo in that case to prevent runtime
errors.

​request.security_lower_tf()​
The
request.security_lower_tf()
function is an alternative to
request.security()
designed for reliably requesting information from lower-timeframe (LTF)
contexts.
While
request.security()
can retrieve data from a single intrabar (LTF bar) in each chart bar,
request.security_lower_tf()
retrieves data from all available intrabars in each chart bar, which
the script can access and use in additional calculations. Each
request.security_lower_tf()
call can retrieve up to 200,000 intrabars from a lower timeframe, depending on the user’s plan. See
this
section of our Limitations page for more information.
TipWorking with the request.security_lower_tf() function involves frequent usage of arrays, because the function always returns array results. Therefore, we recommend reading the Arrays page to make the most of this function and understand how to use its returned data.
Below is the function’s signature, which is similar to the signature of
request.security():
request.security_lower_tf(symbol, timeframe, expression, ignore_invalid_symbol, currency, ignore_invalid_timeframe, calc_bars_count) → array<type>
This function requests data only from timeframes that are lower than or equal to the chart’s timeframe (timeframe.period). If the timeframe argument of the request.security_lower_tf() call represents a higher timeframe, the function raises a runtime error or returns na results, depending on the ignore_invalid_timeframe parameter. The parameter’s default value is false, meaning the function raises an error and halts the script’s executions if the timeframe argument is invalid.
Requesting intrabar data
Intrabar data can provide a script with additional information that may
not be obvious or accessible from solely analyzing data sampled on the
chart’s timerframe. The
request.security_lower_tf()
function can retrieve many data types from an intrabar context.
Before you venture further in this section, we recommend exploring the
Requestable data portion of the
request.security() section above, which provides foundational information about
the types of data one can request. The expression parameter in
request.security_lower_tf()
accepts most of the same arguments discussed in that section, excluding
direct references to
collections and mutable variables.
Although it accepts many of the same types of arguments, this function
returns
array
results, which comes with some differences in interpretation and
handling, as explained below.
Intrabar data arrays
Lower timeframes contain more data points than higher timeframes, as new
values come in at a higher frequency. For example, when comparing a
1-minute chart to an hourly chart, the 1-minute chart will have up to 60
times the number of bars per hour, depending on the available data.
To address the fact that multiple intrabars exist within a chart bar,
request.security_lower_tf()
always creates arrays to store the requested data. The elements in the arrays represent the
expression values retrieved from the lower timeframe sorted in
ascending order based on each intrabar’s timestamp.
The type identifier of the constructed arrays corresponds to the
data types passed in the
request.security_lower_tf()
call. For example, using an “int” as the expression will produce an
array<int> instance, a “bool” as the expression will produce an
array<bool> instance, etc.
The following script uses intrabar information to decompose the chart’s close-to-close price changes into positive and negative parts. It calls request.security_lower_tf() to fetch a “float” array containing ta.change(close) values from a specified lower timeframe on each chart bar, then accesses all the array’s elements using a for…in loop to accumulate positiveChange and negativeChange sums. The script adds the accumulated values to calculate the netChange value, then plots the results on the chart alongside the priceChange value for comparison:

```pinescript
//@version=6
indicator("Intrabar arrays demo", "Intrabar price changes")

//@variable The lower timeframe of the requested data.
string lowerTimeframe = input.timeframe("1", "Timeframe")

//@variable The close-to-close price change.
float priceChange = ta.change(close)

//@variable An array of `close` values from available intrabars on the `lowerTimeframe`.
```
array<float> intrabarChanges = request.security_lower_tf(syminfo.tickerid, lowerTimeframe, priceChange)

```pinescript
//@variable The total positive intrabar `close` movement on the chart bar.
float positiveChange = 0.0
//@variable The total negative intrabar `close` movement on the chart bar.
float negativeChange = 0.0

// Loop to calculate totals, starting from the chart bar's first available intrabar.
for change in intrabarChanges
    // Add the `change` to `positiveChange` if its sign is 1, and add to `negativeChange` if its sign is -1.
    switch math.sign(change)
```
        1  => positiveChange += change
        -1 => negativeChange += change

```pinescript
//@variable The sum of `positiveChange` and `negativeChange`. Equals the `priceChange` on bars with available intrabars.
float netChange = positiveChange + negativeChange

// Plot the `positiveChange`, `negativeChange`, and `netChange`.
plot(positiveChange, "Positive intrabar change", color.teal, style = plot.style_area)
plot(negativeChange, "Negative intrabar change", color.maroon, style = plot.style_area)
plot(netChange, "Net intrabar change", color.yellow, 5)
// Plot the `priceChange` to compare.
plot(priceChange, "Chart price change", color.orange, 2)
```
Note that:

The plots based on
intrabar data may not appear on all available chart bars, as
request.security_lower_tf()
can only access up to the most recent 200,000 intrabars
available from the requested context. When executing this
function on a chart bar that doesn’t have accessible intrabar
data, it will return an empty array.
The number of intrabars per chart bar may vary depending on the
data available from the context and the chart the script
executes on. For example, a provider’s 1-minute data feed may
not include data for every minute within the 60-minute timeframe
due to a lack of trading activity over some 1-minute intervals.
To check the number of intrabars retrieved for a chart bar, one
can use
array.size()
on the resulting
array.
If the lowerTimeframe value is greater than the chart’s
timeframe, the script will raise a runtime error, as we have
not supplied an ignore_invalid_timeframe argument in the
request.security_lower_tf()
call.

Tuples of intrabar data
When passing a tuple or a function call that returns a tuple as the
expression argument in
request.security_lower_tf(),
the result is a tuple of arrays with
type templates corresponding to the types within the argument. For example,
using a [float, string, color] tuple as the expression will result
in [array<float>, array<string>, array<color>] data returned by the
function. Using a tuple expression allows a script to fetch the IDs of several
arrays containing intrabar data
with a single
request.security_lower_tf()
function call.
**Note:** The combined size of all tuples returned by request.*() calls in a script cannot exceed 127 elements. See the Tuple element limit section of the Limitations page for more information.
The following example requests OHLC data from a lower timeframe and
visualizes the current bar’s intrabars on the chart using
lines and boxes. The
script calls
request.security_lower_tf()
with the [open, high, low, close] tuple as its expression to
retrieve a tuple of arrays
representing OHLC information from a calculated lowerTimeframe. It
then uses a
for loop
to set line coordinates with the retrieved data and current bar indices
to display the results next to the current chart bar, providing a
“magnified view” of the price movement within the latest candle. It
also draws a
box
around the lines to indicate the chart region occupied by intrabar drawings:

```pinescript
//@version=6
indicator("Tuples of intrabar data demo", "Candle magnifier", max_lines_count = 500)

//@variable The maximum number of intrabars to display.
int maxIntrabars = input.int(20, "Max intrabars", 1, 250)
//@variable The width of the drawn candle bodies.
int candleWidth = input.int(20, "Candle width", 2)

//@variable The largest valid timeframe closest to `maxIntrabars` times smaller than the chart timeframe.
string lowerTimeframe = timeframe.from_seconds(math.ceil(timeframe.in_seconds() / maxIntrabars))

//@variable An array of lines to represent intrabar wicks.
var array<line> wicks  = array.new<line>()
//@variable An array of lines to represent intrabar bodies.
var array<line> bodies = array.new<line>()
//@variable A box that surrounds the displayed intrabars.
var box magnifierBox = box.new(na, na, na, na, bgcolor = na)

// Fill the `wicks` and `bodies` arrays with blank lines on the first bar.
if barstate.isfirst
    for i = 1 to maxIntrabars
        array.push(wicks, line.new(na, na, na, na, color = color.gray))
        array.push(bodies, line.new(na, na, na, na, width = candleWidth))

//@variable A tuple of "float" arrays containing `open`, `high`, `low`, and `close` prices from the `lowerTimeframe`.
[oData, hData, lData, cData] = request.security_lower_tf(syminfo.tickerid, lowerTimeframe, [open, high, low, close])
//@variable The number of intrabars retrieved from the `lowerTimeframe` on the chart bar.
int numIntrabars = array.size(oData)

if numIntrabars > 0
    // Define the start and end bar index values for intrabar display.
    int startIndex = bar_index + 2
    int endIndex = startIndex + numIntrabars
    // Loop to update lines.
    for i = 0 to maxIntrabars - 1
```
        line wickLine = array.get(wicks, i)
        line bodyLine = array.get(bodies, i)
        if i < numIntrabars
```pinescript
            //@variable The `bar_index` of the drawing.
            int candleIndex = startIndex + i
            // Update the properties of the `wickLine` and `bodyLine`.
            line.set_xy1(wickLine, startIndex + i, array.get(hData, i))
            line.set_xy2(wickLine, startIndex + i, array.get(lData, i))
            line.set_xy1(bodyLine, startIndex + i, array.get(oData, i))
            line.set_xy2(bodyLine, startIndex + i, array.get(cData, i))
            line.set_color(bodyLine, bodyLine.get_y2() > bodyLine.get_y1() ? color.teal : color.maroon)
```
            continue
        // Set the coordinates of the `wickLine` and `bodyLine` to `na` if no intrabar data is available at the index.
        line.set_xy1(wickLine, na, na)
        line.set_xy2(wickLine, na, na)
        line.set_xy1(bodyLine, na, na)
        line.set_xy2(bodyLine, na, na)
    // Set the coordinates of the `magnifierBox`.
    box.set_lefttop(magnifierBox, startIndex - 1, array.max(hData))
    box.set_rightbottom(magnifierBox, endIndex, array.min(lData))
Note that:

The script draws each candle using two
lines:
one to represent wicks and the other to represent the body.
Since the script can display up to 500 lines on the chart,
we’ve limited the maxIntrabars input to 250.
The lowerTimeframe value is the result of calculating the
math.ceil()
of the
timeframe.in_seconds()
divided by the maxIntrabars and converting to a
valid timeframe string with
timeframe.from_seconds().
The script sets the top of the box drawing using the
array.max()
of the requested hData array, and it sets the box’s bottom
using the
array.min()
of the requested lData array. As we see on the chart, these
values correspond to the
high
and
low
of the chart bar.

Requesting collections
In some cases, a script might need to request
collections from an intrabar context. However, in contrast to
request.security(),
scripts cannot use collection references or calls to functions that return them as the expression
argument in a
request.security_lower_tf()
call, because arrays cannot
directly store references to other
collections.
Despite these limitations, it is possible to request
collections from lower timeframes, if needed, with the help of wrapper
types.
NoticeThe technique described below is advanced and not recommended for beginners, because it requires an understanding of how user-defined types with collection fields work. When possible, use simpler methods to manage LTF requests. Use the following technique only if others do not suffice.
To make
collections requestable with
request.security_lower_tf(),
we must create a
UDT
with a field to reference a collection ID. This step is necessary since
arrays cannot reference
other collections directly but can reference UDTs with collection fields:
//@type A "wrapper" type for storing an `array<float>` reference.
type Wrapper
    array<float> collection
With our Wrapper UDT defined, we can now pass the IDs of
objects of the UDT to the
expression parameter in
request.security_lower_tf().
A straightforward approach is to use a call to the type’s built-in *.new() function as
the expression argument. For example, this line of code uses a call to Wrapper.new() with array.from(close) as the collection argument directly within the request.security_lower_tf() call:
```pinescript
//@variable An array of `Wrapper` IDs requested from the 1-minute timeframe.
```
array<Wrapper> wrappers = request.security_lower_tf(syminfo.tickerid, "1", Wrapper.new(array.from(close)))
Alternatively, we can create a
user-defined function or
method
that returns a reference to an object of
the UDT and call that function within
request.security_lower_tf().
For instance, this code calls a custom newWrapper() function that
returns a Wrapper ID as the expression argument:
```pinescript
//@function Creates a new `Wrapper` instance to wrap the specified `collection`.
newWrapper(array<float> collection) =>
    Wrapper.new(collection)

//@variable An array of `Wrapper` IDs requested from the 1-minute timeframe.
```
array<Wrapper> wrappers = request.security_lower_tf(syminfo.tickerid, "1", newWrapper(array.from(close)))
The result with either of the above is an
array
containing Wrapper IDs from all available intrabars in the chart bar,
which the script can use to reference Wrapper instances from specific
intrabars and use their collection fields in additional operations.
The script below utilizes this approach to collect the IDs of
arrays containing intrabar data
from a lowerTimeframe, then uses those arrays to display data from a specific
lower-timeframe bar. Its custom Prices type contains a single data field to
reference array<float> instances that hold price data, and the
user-defined newPrices() function returns the ID of a Prices object.
The script calls
request.security_lower_tf()
with a newPrices() call as its expression argument to retrieve the ID of an
array
containing Prices IDs from each intrabar in the chart bar, then uses
array.get()
to get the ID from a specified available intrabar, if it exists. Lastly,
it uses
array.get()
on the data array referenced by that instance and calls
plotcandle()
to display its values on the chart:

```pinescript
//@version=6
indicator("Requesting LTF collections demo", "Intrabar viewer", true)

//@variable The timeframe of the LTF data request.
string lowerTimeframe = input.timeframe("1", "Timeframe")
//@variable The index of the intrabar to show on each chart bar. 0 is the first available intrabar.
int intrabarIndex = input.int(0, "Intrabar to show", 0)

//@variable A custom type to store an `array<float>` reference.
type Prices
```
    array<float> data

```pinescript
//@function Returns the ID of a new `Prices` instance containing current `open`, `high`, `low`, and `close` prices.
newPrices() =>
    Prices.new(array.from(open, high, low, close))

//@variable An array of `Prices` IDs requested from the `lowerTimeframe`.
```
array<Prices> requestedPrices = request.security_lower_tf(syminfo.tickerid, lowerTimeframe, newPrices())

```pinescript
//@variable The `Prices` ID from the `requestedPrices` array at the `intrabarIndex`, or `na` if not available.
```
Prices intrabarPrices = array.size(requestedPrices) > intrabarIndex ? array.get(requestedPrices, intrabarIndex) : na
```pinescript
//@variable The `data` array ID from the `intrabarPrices` object, or the ID of an array of `na` values if `intrabarPrices` is `na`.
```
array<float> intrabarData = na(intrabarPrices) ? array.new<float>(4, na) : intrabarPrices.data

// Plot the `intrabarData` values as candles.
plotcandle(intrabarData.get(0), intrabarData.get(1), intrabarData.get(2), intrabarData.get(3))
Note that:

The intrabarPrices variable references a Prices object only if the size of the requestedPrices array is greater than the intrabarIndex, because attempting to use array.get() to retrieve an element that doesn’t exist causes an out of bounds error.
The intrabarData variable references an array from the intrabarPrices.data field only if the intrabarPrices variable references a Prices object. If intrabarPrices holds na because intrabar data is not available for a bar, the intrabarData variable references an array of na values.
The process used in this example is not necessary to achieve the intended result. Instead of using UDTs, we can use the tuple [open, high, low, close] as the expression argument in the request to retrieve a tuple of arrays for further operations. See the Tuples of intrabar data section above for more information.

Custom contexts
Pine Script includes multiple ticker.*() functions that allow scripts
to construct custom ticker IDs that specify additional settings for
data requests when used as a symbol argument in
request.security()
and
request.security_lower_tf():

ticker.new()
constructs a custom ticker ID from a specified prefix and ticker
with additional session and adjustment settings.
ticker.modify()
constructs a modified form of a specified tickerid with additional
session and adjustment settings.
ticker.heikinashi(),
ticker.renko(),
ticker.pointfigure(),
ticker.kagi(),
and
ticker.linebreak()
construct a modified form a symbol with
non-standard chart settings.
ticker.inherit()
constructs a new ticker ID for a symbol with additional parameters
inherited from the from_tickerid specified in the function call,
allowing scripts to request the symbol data with the same
modifiers as the from_tickerid, including session, dividend
adjustment, currency conversion, non-standard chart type,
back-adjustment, settlement-as-close, etc.
ticker.standard()
constructs a standard ticker ID representing the symbol without
additional modifiers.

Let’s explore some practical examples of applying ticker.*()
functions to request data from custom contexts.
Suppose we want to include dividend adjustment in a stock symbol’s
prices without enabling the “Adjust data for dividends” option in the
“Symbol” section of the chart’s settings. We can achieve this in a
script by constructing a custom ticker ID for the instrument using
ticker.new()
or
ticker.modify()
with an adjustment value of
adjustment.dividends.
This script creates an adjustedTickerID using
ticker.modify(),
uses that ticker ID as the symbol in
request.security()
to retrieve a
tuple of adjusted price values, then uses plotcandle() to plot the result as candles on the chart. It also highlights the background of bars where the requested prices differ from the prices without dividend adjustment.
As we see on the “NYSE:XOM” chart below, enabling dividend adjustment
results in different historical values before the date of the latest
dividend:

```pinescript
//@version=6
indicator("Custom contexts demo 1", "Adjusted prices", true)

//@variable A custom ticker ID representing the chart's symbol with the dividend adjustment modifier.
string adjustedTickerID = ticker.modify(syminfo.tickerid, adjustment = adjustment.dividends)

// Request the adjusted prices for the chart's symbol.
[o, h, l, c] = request.security(adjustedTickerID, timeframe.period, [open, high, low, close])

//@variable The color of the candles on the chart.
color candleColor = c > o ? color.teal : color.maroon

// Plot the adjusted prices.
plotcandle(o, h, l, c, "Adjusted Prices", candleColor)
// Highlight the background when `c` is different from `close`.
bgcolor(c != close ? color.new(color.orange, 80) : na)
```
Note that:

If a modifier included in a constructed ticker ID does not apply
to the symbol, the script will ignore that modifier when
requesting data. For instance, this script will display the same
values as the main chart on forex symbols such as “EURUSD”.

While the example above demonstrates a simple way to modify the chart’s
symbol, a more frequent use case for ticker.*() functions is applying
custom modifiers to another symbol while requesting data. If a ticker ID
referenced in a script already has the modifiers one would like to apply
(e.g., adjustment settings, session type, etc.), they can use
ticker.inherit()
to quickly and efficiently add those modifiers to another symbol.
In the example below, we’ve edited the previous script to request data
for a symbolInput using modifiers inherited from the
adjustedTickerID. This script calls
ticker.inherit()
to construct an inheritedTickerID and uses that ticker ID in a
request.security()
call. It also requests data for the symbolInput without additional
modifiers and plots candles
for both ticker IDs in a separate chart pane to compare the difference.
As shown on the chart, the data requested using the inheritedTickerID
includes dividend adjustment, whereas the data requested using the
symbolInput directly does not:

```pinescript
//@version=6
indicator("Custom contexts demo 2", "Inherited adjustment")

//@variable The symbol to request data from.
string symbolInput = input.symbol("NYSE:PFE", "Symbol")

//@variable A custom ticker ID representing the chart's symbol with the dividend adjustment modifier.
string adjustedTickerID = ticker.modify(syminfo.tickerid, adjustment = adjustment.dividends)
//@variable A custom ticker ID representing the `symbolInput` with modifiers inherited from the `adjustedTickerID`.
string inheritedTickerID = ticker.inherit(adjustedTickerID, symbolInput)

// Request prices using the `symbolInput`.
[o1, h1, l1, c1] = request.security(symbolInput, timeframe.period, [open, high, low, close])
// Request prices using the `inheritedTickerID`.
[o2, h2, l2, c2] = request.security(inheritedTickerID, timeframe.period, [open, high, low, close])

//@variable The color of the candles that use the `inheritedTickerID` prices.
color candleColor = c2 > o2 ? color.teal : color.maroon

// Plot the `symbol` prices.
plotcandle(o1, h1, l1, c1, "Symbol", color.gray, color.gray, bordercolor = color.gray)
// Plot the `inheritedTickerID` prices.
plotcandle(o2, h2, l2, c2, "Symbol With Modifiers", candleColor)
// Highlight the background when `c1` is different from `c2`.
bgcolor(c1 != c2 ? color.new(color.orange, 80) : na)
```
Note that:

Since the adjustedTickerID represents a modified form of the
syminfo.tickerid,
if we modify the chart’s context in other ways, such as
changing the chart type or enabling extended trading hours in
the chart’s settings, those modifiers will also apply to the
adjustedTickerID and inheritedTickerID. However, they will
not apply to the symbolInput since it represents a
standard ticker ID.

Another frequent use case for requesting custom contexts is retrieving
data that uses
non-standard chart calculations. For example, suppose we want to use
Renko
price values to calculate trade signals in a
```pinescript
strategy()
```
script. If we simply change the chart type to “Renko” to get the
prices, the strategy
will also simulate its trades based on those synthetic prices, producing
misleading
results:

```pinescript
//@version=6
strategy(
```
     "Custom contexts demo 3", "Renko strategy", true, default_qty_type = strategy.percent_of_equity,
     default_qty_value = 2, initial_capital = 50000, slippage = 2,
     commission_type = strategy.commission.cash_per_contract, commission_value = 1, margin_long = 100,
     margin_short = 100
 )

```pinescript
//@variable When `true`, the strategy places a long market order.
bool longEntry = ta.crossover(close, open)
//@variable When `true`, the strategy places a short market order.
bool shortEntry = ta.crossunder(close, open)

if longEntry
    strategy.entry("Long Entry", strategy.long)
if shortEntry
    strategy.entry("Short Entry", strategy.short)
```
To ensure our strategy shows results based on actual prices, we can
create a Renko ticker ID using
ticker.renko()
while keeping the chart on a standard type, allowing the script to
request and use
Renko
prices to calculate its signals without calculating the strategy results
on them:

```pinescript
//@version=6
strategy(
```
     "Custom contexts demo 3", "Renko strategy", true, default_qty_type = strategy.percent_of_equity,
     default_qty_value = 2, initial_capital = 50000, slippage = 1,
     commission_type = strategy.commission.cash_per_contract, commission_value = 1, margin_long = 100,
     margin_short = 100
 )

```pinescript
//@variable A Renko ticker ID.
string renkoTickerID = ticker.renko(syminfo.tickerid, "ATR", 14)
// Request the `open` and `close` prices using the `renkoTickerID`.
[renkoOpen, renkoClose] = request.security(renkoTickerID, timeframe.period, [open, close])

//@variable When `true`, the strategy places a long market order.
bool longEntry = ta.crossover(renkoClose, renkoOpen)
//@variable When `true`, the strategy places a short market order.
bool shortEntry = ta.crossunder(renkoClose, renkoOpen)

if longEntry
    strategy.entry("Long Entry", strategy.long)
if shortEntry
    strategy.entry("Short Entry", strategy.short)

plot(renkoOpen)
plot(renkoClose)
```
Historical and realtime behavior
Functions in the request.*() namespace can behave differently on
historical and realtime bars. This behavior is closely related to
Pine’s Execution model.
Consider how a script behaves within the main context. Throughout the
chart’s history, the script calculates its required values once and
commits them to that bar so their states are accessible on subsequent executions.
On an unconfirmed bar, however, the script recalculates its
values on each update to the bar’s data to align with realtime
changes. Before recalculating the values on that bar, it reverts
calculated values to their last committed states, otherwise known as
rollback, and it only commits values to that bar once the bar closes.
Now consider the behavior of data requests from other contexts with
request.security().
As when evaluating historical bars in the main context,
request.security()
only returns new historical values when it confirms a bar in its
specified context. When executing on realtime bars, it returns
recalculated values on each chart bar, similar to how a script
recalculates values in the main context on the open chart bar.
However, the function only confirms the requested values when a bar
from its context closes. When the script restarts, what
were previously realtime bars become historical bars.
Therefore,
request.security()
only returns the values it confirmed on those bars. In essence, this
behavior means that requested data may repaint when its values
fluctuate on realtime bars without confirmation from the context.
TipIt is often helpful to distinguish historical bars from realtime bars when working with request.*() functions. Scripts can determine whether bars have historical or realtime states by using the barstate.ishistory and barstate.isrealtime variables.
In most circumstances where a script requests data from a broader
context, one will typically require confirmed, stable values that do
not fluctuate on realtime bars. The
section below explains how to achieve such a result and avoid repainting
data requests.
Avoiding repainting
Higher-timeframe data
When requesting values from a higher timeframe, they are subject to
repainting since realtime bars can contain unconfirmed information
from developing HTF bars, and the script may adjust the times that new
values come in on historical bars. To avoid repainting HTF data, one
must ensure that the function only returns confirmed values with
consistent timing on all bars, regardless of bar state.
The most reliable approach to achieve non-repainting results is to use
an expression argument that only references past bars (e.g.,
close[1]) while using
barmerge.lookahead_on
as the lookahead value.
Using
barmerge.lookahead_on
with non-offset HTF data requests is discouraged since it prompts
request.security()
to “look ahead” to the final values of an HTF bar, retrieving
confirmed values before they’re actually available in the script’s
history. However, if the values used in the expression are offset by
at least one bar, the “future” data the function retrieves is no
longer from the future. Instead, the data represents confirmed values
from established, available HTF bars. In other words, applying an
offset to the expression effectively prevents the requested data from
repainting when the script restarts its executions and eliminates
lookahead bias in the historical series.
The following example demonstrates a repainting HTF data request. The
script uses
request.security()
without offset modifications or additional arguments to retrieve the
results of a
ta.wma()
call from a higher timeframe. It also highlights the background to
indicate which bars were in a realtime state during its calculations.
As shown on the chart below, the
plot
of the requested WMA only changes on historical bars when HTF bars
close, whereas it fluctuates on all realtime bars since the data
includes unconfirmed values from the higher timeframe:

```pinescript
//@version=6
indicator("Avoiding HTF repainting demo", overlay = true)

//@variable The multiplier applied to the chart's timeframe.
int tfMultiplier = input.int(10, "Timeframe multiplier", 1)
//@variable The number of bars in the moving average.
int length = input.int(5, "WMA smoothing length")

//@variable The valid timeframe string closest to `tfMultiplier` times larger than the chart timeframe.
string timeframe = timeframe.from_seconds(timeframe.in_seconds() * tfMultiplier)

//@variable The weighted MA of `close` prices over `length` bars on the `timeframe`.
//          This request repaints because it includes unconfirmed HTF data on realtime bars and it may offset the
//          times of its historical results.
float requestedWMA = request.security(syminfo.tickerid, timeframe, ta.wma(close, length))

// Plot the requested series.
plot(requestedWMA, "HTF WMA", color.purple, 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 70) : na, title = "Realtime bar highlight")
```
To avoid repainting in this script, we can add
lookahead = barmerge.lookahead_on to the
request.security()
call and offset the call history of
ta.wma()
by one bar with the history-referencing operator
[],
ensuring the request always retrieves the last confirmed HTF bar’s WMA
at the start of each new timeframe. Unlike the previous script, this
version has consistent behavior on historical and realtime bar states,
as we see below:

```pinescript
//@version=6
indicator("Avoiding HTF repainting demo", overlay = true)

//@variable The multiplier applied to the chart's timeframe.
int tfMultiplier = input.int(10, "Timeframe multiplier", 1)
//@variable The number of bars in the moving average.
int length = input.int(5, "WMA smoothing length")

//@variable The valid timeframe string closest to `tfMultiplier` times larger than the chart timeframe.
string timeframe = timeframe.from_seconds(timeframe.in_seconds() * tfMultiplier)

//@variable The weighted MA of `close` prices over `length` bars on the `timeframe`.
//          This request does not repaint, as it always references the last confirmed WMA value on all bars.
float requestedWMA = request.security(
```
     syminfo.tickerid, timeframe, ta.wma(close, length)[1], lookahead = barmerge.lookahead_on
 )

// Plot the requested value.
plot(requestedWMA, "HTF WMA", color.purple, 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 70) : na, title = "Realtime bar highlight")
Lower-timeframe data
The
request.security()
and
request.security_lower_tf()
functions can retrieve data from lower-timeframe contexts. The
request.security()
function can only retrieve data from a single intrabar in each chart
bar, and
request.security_lower_tf()
retrieves data from all available intrabars.
When using these functions to retrieve intrabar data, it’s important to
note that such requests are not immune to repainting behavior.
Historical and realtime series often rely on separate data feeds. Data
providers may retroactively modify realtime data, and it’s possible for
races to occur in realtime data feeds, as explained in the
Data feeds section of this page. Either case may result in intrabar
data retrieved on realtime bars repainting after the script restarts its
executions.
Additionally, a particular case that will cause repainting LTF
requests is using
request.security()
with
barmerge.lookahead_on
to retrieve data from the first intrabar in each chart bar. While it
will generally work as expected on historical bars, it will track only
the most recent intrabar on realtime bars, as
request.security()
does not retain all intrabar information, and the intrabars the function retrieves on realtime bars are unsorted until restarting the
script:

```pinescript
//@version=6
indicator("Avoiding LTF repainting demo", overlay = true)

//@variable The lower timeframe of the requested data.
string lowerTimeframe = input.timeframe("1", "Timeframe")

//@variable The first intrabar `close` requested from the `lowerTimeframe` on each bar.
//          Only works as intended on historical bars.
float requestedClose = request.security(syminfo.tickerid, lowerTimeframe, close, lookahead = barmerge.lookahead_on)

// Plot the `requestedClose`.
plot(requestedClose, "First intrabar close", linewidth = 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 60) : na, title = "Realtime bar Highlight")
```
One can mitigate this behavior and track the values from the first
intrabar, or any available intrabar in the chart bar, by using
request.security_lower_tf()
since it maintains an
array
of intrabar values ordered by the times they come in. Here, we call
array.first()
on a requested
array
of intrabar data to retrieve the
close
price from the first available intrabar in each chart bar:

```pinescript
//@version=6
indicator("Avoiding LTF repainting demo", overlay = true)

//@variable The lower timeframe of the requested data.
string lowerTimeframe = input.timeframe("1", "Timeframe")

//@variable An array of intrabar `close` values requested from the `lowerTimeframe` on each bar.
```
array<float> requestedCloses = request.security_lower_tf(syminfo.tickerid, lowerTimeframe, close)

```pinescript
//@variable The first intrabar `close` on each bar with available data.
float firstClose = requestedCloses.size() > 0 ? requestedCloses.first() : na

// Plot the `firstClose`.
plot(firstClose, "First intrabar close", linewidth = 3)
// Highlight the background on realtime bars.
bgcolor(barstate.isrealtime ? color.new(color.orange, 60) : na, title = "Realtime bar Highlight")
```
Note that:

While
request.security_lower_tf()
is more optimized for handling historical and realtime
intrabars, it’s still possible in some cases for minor
repainting to occur due to data differences from the provider,
as outlined above.
This code may not show intrabar data on all available chart
bars, depending on how many intrabars each chart bar contains,
as request.*() functions can retrieve up to 200,000 intrabars
from an LTF context. The maximum number of requestable intrabars depends on the user’s plan. See
this section of the
Limitations
page for more information.

​request.currency_rate()​
When a script needs to convert values expressed in one currency to
another, one can use
request.currency_rate().
This function requests a daily rate for currency conversion
calculations based on currency pair or spread data from the most popular exchanges, providing a simpler alternative
to fetching specific pairs or
spreads
with
request.security().
While one can use
request.security()
to retrieve daily currency rates, its use case is more involved than
request.currency_rate(),
as one needs to supply a valid ticker ID for a currency pair or spread
to request the rate. Additionally, a historical offset and
barmerge.lookahead_on
are necessary to prevent the results from repainting, as explained in
this section.
The
request.currency_rate()
function, on the other hand, only requires currency codes. No ticker
ID is needed when requesting rates with this function, and it ensures
non-repainting results without requiring additional specification.
The function’s signature is as follows:
request.currency_rate(from, to, ignore_invalid_currency) → series float
The from parameter specifies the currency to convert, and the to
parameter specifies the target currency. Both parameters accept
“string” values representing valid currency codes (e.g.,
“USD”) or any built-in currency.* variable (e.g.,
currency.USD).
When the function cannot calculate a valid conversion rate between the specified
from and to currencies, programmers can decide whether
it raises a runtime error or returns
na via
the ignore_invalid_currency parameter. The default value is false,
meaning the function raises a runtime error and halts the script’s
executions.
The following example demonstrates a simple use case for
request.currency_rate().
Suppose we want to convert values expressed in Turkish lira
(currency.TRY)
to South Korean won
(currency.KRW)
using a daily conversion rate. If we use
request.security()
to retrieve the rate, we must supply a valid ticker ID and request the
last confirmed
close
from the previous day.
In this case, no valid symbol exists that would allow us to
retrieve a conversion rate directly with
request.security().
Therefore, we first need a ticker ID for a
spread
that converts TRY to an intermediate currency, such as USD, then
converts the intermediate currency to KRW. We can then use that ticker
ID within
request.security()
with close[1] as the expression and
barmerge.lookahead_on
as the lookahead value to request a non-repainting daily rate.
Alternatively, we can achieve the same result more simply by calling
request.currency_rate().
This function does all the heavy lifting for us, only requiring from
and to currency arguments to perform its calculation.
As we see below, both approaches return the same daily rate:

```pinescript
//@version=6
indicator("Requesting currency rates demo")

//@variable The currency to convert.
```
simple string fromCurrency = currency.TRY
```pinescript
//@variable The resulting currency.
```
simple string toCurrency = currency.KRW

```pinescript
//@variable The spread symbol to request. Required in `request.security()` because no direct symbol exists.
```
simple string spreadSymbol = str.format("{0}{2} * {2}{1}", fromCurrency, toCurrency, currency.USD)

```pinescript
//@variable The non-repainting conversion rate from `request.security()` using the `spreadSymbol`.
float securityRequestedRate = request.security(spreadSymbol, "1D", close[1], lookahead = barmerge.lookahead_on)
//@variable The non-repainting conversion rate from `request.currency_rate()`.
float nonSecurityRequestedRate = request.currency_rate(fromCurrency, toCurrency)

// Plot the requested rates. We can multiply TRY values by these rates to convert them to KRW.
plot(securityRequestedRate, "`request.security()` value", color.purple, 5)
plot(nonSecurityRequestedRate, "`request.currency_rate()` value", color.yellow, 2)
```
​request.dividends()​, ​request.splits()​, and ​request.earnings()​
Analyzing a stock’s earnings data and corporate actions provides
helpful insights into its underlying financial strength. Pine Script
provides the ability to retrieve essential information about applicable
stocks via
request.dividends(),
request.splits(),
and
request.earnings().
These are the functions’ signatures:
request.dividends(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float
request.splits(ticker, field, gaps, lookahead, ignore_invalid_symbol) → series float
request.earnings(ticker, field, gaps, lookahead, ignore_invalid_symbol, currency) → series float
Each function has the same parameters in its signature, with the
exception of
request.splits(),
which doesn’t have a currency parameter.
Note that unlike the symbol parameter in other request.*()
functions, the ticker parameter in these functions only accepts an
“Exchange:Symbol” pair, such as “NASDAQ:AAPL”. The built-in
syminfo.ticker
variable does not work with these functions since it does not contain
exchange information. Instead, one must use
syminfo.tickerid
for such cases.
The field parameter determines the data the function will retrieve.
Each of these functions accepts different built-in variables as the
field argument since each requests different information about a
stock:

The
request.dividends()
function retrieves current dividend information for a stock, i.e.,
the amount per share the issuing company paid out to investors who
purchased shares before the ex-dividend date. Passing the built-in
dividends.gross
or
dividends.net
variables to the field parameter specifies whether the returned
value represents dividends before or after factoring in expenses the
company deducts from its payouts.
The
request.splits()
function retrieves current split and reverse split information for a
stock. A split occurs when a company increases its outstanding
shares to promote liquidity. A reverse split occurs when a company
consolidates its shares and offers them at a higher price to attract
specific investors or maintain their listing on a market that has a
minimum per-share price. Companies express their split information
as ratios. For example, a 5:1 split means the company issued
additional shares to its shareholders so that they have five times
the number of shares they had before the split, and the raw price of
each share becomes one-fifth of the previous price. Passing
splits.numerator
or
splits.denominator
to the field parameter of
request.splits()
determines whether it returns the numerator or denominator of the
split ratio.
The
request.earnings()
function retrieves the earnings per share (EPS) information for a
stock ticker’s issuing company. The EPS value is the ratio of a
company’s net income to the number of outstanding stock shares,
which investors consider an indicator of the company’s
profitability. Passing
earnings.actual,
earnings.estimate,
or
earnings.standardized
as the field argument in
request.earnings()
respectively determines whether the function requests the actual,
estimated, or standardized EPS value.

For a detailed explanation of the gaps, lookahead, and
ignore_invalid_symbol parameters of these functions, see the
Common characteristics section at the top of this page.
It’s important to note that the values returned by these functions
reflect the data available as it comes in. This behavior differs from
financial data originating from a
request.financial()
call in that the underlying data from such calls becomes available
according to a company’s fiscal reporting period.
**Tip:** Scripts can also retrieve information about upcoming earnings and dividends for an instrument via the earnings.future_* and dividends.future_* built-in variables.
Here, we’ve included an example that displays a handy
table
containing the most recent dividend, split, and EPS data. The script
calls the request.*() functions discussed in this section to retrieve
the data, then converts the values to “strings” with str.*()
functions and displays the results in the infoTable with
table.cell():

```pinescript
//@version=6
indicator("Dividends, splits, and earnings demo", overlay = true)

//@variable The size of the table's text.
string tableSize = input.string(
```
     size.large, "Table size", [size.auto, size.tiny, size.small, size.normal, size.large, size.huge]
 )

```pinescript
//@variable The color of the table's text and frame.
var color tableColor = chart.fg_color
//@variable A `table` displaying the latest dividend, split, and EPS information.
var table infoTable = table.new(position.top_right, 3, 4, frame_color = tableColor, frame_width = 1)

// Add header cells on the first bar.
if barstate.isfirst
    table.cell(infoTable, 0, 0, "Field", text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 1, 0, "Value", text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 2, 0, "Date", text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 0, 1, "Dividend", text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 0, 2, "Split", text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 0, 3, "EPS", text_color = tableColor, text_size = tableSize)

//@variable The amount of the last reported dividend as of the current bar.
float latestDividend = request.dividends(syminfo.tickerid, dividends.gross, barmerge.gaps_on)
//@variable The numerator of that last reported split ratio as of the current bar.
float latestSplitNum = request.splits(syminfo.tickerid, splits.numerator, barmerge.gaps_on)
//@variable The denominator of the last reported split ratio as of the current bar.
float latestSplitDen = request.splits(syminfo.tickerid, splits.denominator, barmerge.gaps_on)
//@variable The last reported earnings per share as of the current bar.
float latestEPS = request.earnings(syminfo.tickerid, earnings.actual, barmerge.gaps_on)

// Update the "Value" and "Date" columns when new values come in.
if not na(latestDividend)
    table.cell(
```
         infoTable, 1, 1, str.tostring(math.round(latestDividend, 3)), text_color = tableColor, text_size = tableSize
     )
    table.cell(infoTable, 2, 1, str.format_time(time, "yyyy-MM-dd"), text_color = tableColor, text_size = tableSize)
if not na(latestSplitNum)
    table.cell(
         infoTable, 1, 2, str.format("{0}-for-{1}", latestSplitNum, latestSplitDen), text_color = tableColor,
         text_size = tableSize
     )
    table.cell(infoTable, 2, 2, str.format_time(time, "yyyy-MM-dd"), text_color = tableColor, text_size = tableSize)
if not na(latestEPS)
    table.cell(infoTable, 1, 3, str.tostring(latestEPS), text_color = tableColor, text_size = tableSize)
    table.cell(infoTable, 2, 3, str.format_time(time, "yyyy-MM-dd"), text_color = tableColor, text_size = tableSize)
Note that:

We’ve included
barmerge.gaps_on
in the request.*() calls, so they only return values when new
data is available. Otherwise, they return
na.
The script assigns a
table
ID to the infoTable variable on the first chart bar. On
subsequent bars, it updates necessary cells with new information
whenever data is available.
If no information is available from any of the request.*()
calls throughout the chart’s history (e.g., if the ticker has
no dividend information), the script does not initialize the
corresponding cells since it’s unnecessary.

​request.financial()​
Financial metrics provide investors with insights about a company’s
economic and financial health that are not tangible from solely
analyzing its stock prices. TradingView offers a wide variety of
financial metrics from FactSet that traders
can access via the “Financials” tab in the “Indicators” menu of the
chart. Scripts can access available metrics for an instrument directly
via the
request.financial()
function.
This is the function’s signature:
request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency) → series float
As with the first parameter in
request.dividends(),
request.splits(),
and
request.earnings(),
the symbol parameter in
request.financial()
requires an “Exchange:Symbol” pair. To request financial information
for the chart’s ticker ID, use
syminfo.tickerid,
as
syminfo.ticker
will not work.
The financial_id parameter accepts a “string” value representing
the ID of the requested financial metric. TradingView has numerous
financial metrics to choose from. See the
Financial IDs section below for an overview of all accessible metrics and
their “string” identifiers.
The period parameter specifies the fiscal period for which new
requested data comes in. It accepts one of the following “string” arguments:
“FQ” (quarterly), “FH” (semiannual), “FY” (annual), or “TTM”
(trailing twelve months). Not all fiscal periods are available for all
metrics or instruments. To confirm which periods are available for
specific metrics, see the second column of the tables in the
Financial IDs section.
See this page’s
Common characteristics section for a detailed explanation of this function’s
gaps, ignore_invalid_symbol, and currency parameters.
It’s important to note that the data retrieved from this function comes
in at a fixed frequency, independent of the precise date on which the
data is made available within a fiscal period. For a company’s
dividends, splits, and earnings per share (EPS) information, one can
request data reported on exact dates via
request.dividends(),
request.splits(),
and
request.earnings().
This script uses
request.financial()
to retrieve information about the income and expenses of a stock’s
issuing company and visualize the profitability of its typical business
operations. It requests the “OPER_INCOME”, “TOTAL_REVENUE”, and
“TOTAL_OPER_EXPENSE”
financial IDs for the
syminfo.tickerid
over the latest fiscalPeriod, then
plots the results on the
chart:

```pinescript
//@version=6
indicator("Requesting financial data demo", format = format.volume)

//@variable The size of the fiscal reporting period. Some options may not be available, depending on the instrument.
string fiscalPeriod = input.string("FQ", "Period", ["FQ", "FH", "FY", "TTM"])

//@variable The operating income after expenses reported for the stock's issuing company.
float operatingIncome = request.financial(syminfo.tickerid, "OPER_INCOME", fiscalPeriod)
//@variable The total revenue reported for the stock's issuing company.
float totalRevenue = request.financial(syminfo.tickerid, "TOTAL_REVENUE", fiscalPeriod)
//@variable The total operating expenses reported for the stock's issuing company.
float totalExpenses = request.financial(syminfo.tickerid, "TOTAL_OPER_EXPENSE", fiscalPeriod)

//@variable Is aqua when the `totalRevenue` exceeds the `totalExpenses`, fuchsia otherwise.
color incomeColor = operatingIncome > 0 ? color.new(color.aqua, 50) : color.new(color.fuchsia, 50)

// Display the requested data.
plot(operatingIncome, "Operating income", incomeColor, 1, plot.style_area)
plot(totalRevenue, "Total revenue", color.green, 3)
plot(totalExpenses, "Total operating expenses", color.red, 3)
```
Note that:

Not all fiscalPeriod options are available for every ticker
ID. For example, companies in the US typically publish
quarterly reports, whereas many European companies publish
semiannual reports. See this
page
in our Help Center for more information.

Calculating financial metrics
The
request.financial()
function can provide scripts with numerous useful financial metrics that
don’t require additional calculations. However, some commonly used
financial estimates require combining an instrument’s current market
price with requested financial data. Such is the case for:

Market Capitalization (market price * total shares outstanding)
Earnings Yield (12-month EPS / market price)
Price-to-Book Ratio (market price / BVPS)
Price-to-Earnings Ratio (market price / EPS)
Price-to-Sales Ratio (market cap / 12-month total revenue)

The following script contains
user-defined functions that calculate the above financial metrics for the
syminfo.tickerid.
We’ve created these functions so users can easily copy them into their
scripts. This example uses them within a
str.format()
call to construct a tooltipText, which it displays in tooltips on the
chart using labels. Hovering over any bar’s
label
will expose the tooltip containing the metrics calculated on that bar:

```pinescript
//@version=6
indicator("Calculating financial metrics demo", overlay = true, max_labels_count = 500)

//@function Calculates the market capitalization (market cap) for the chart's symbol.
marketCap() =>
    //@variable The most recent number of outstanding shares reported for the symbol.
    float totalSharesOutstanding = request.financial(syminfo.tickerid, "TOTAL_SHARES_OUTSTANDING", "FQ")
    // Return the market cap value.
```
    totalSharesOutstanding * close

```pinescript
//@function Calculates the Earnings Yield for the chart's symbol.
earningsYield() =>
    //@variable The most recent 12-month earnings per share reported for the symbol.
    float eps = request.financial(syminfo.tickerid, "EARNINGS_PER_SHARE", "TTM")
    //Return the Earnings Yield percentage.
```
    100.0 * eps / close

```pinescript
//@function Calculates the Price-to-Book (P/B) ratio for the chart's symbol.
priceBookRatio() =>
    //@variable The most recent Book Value Per Share (BVPS) reported for the symbol.
    float bookValuePerShare = request.financial(syminfo.tickerid, "BOOK_VALUE_PER_SHARE", "FQ")
    // Return the P/B ratio.
```
    close / bookValuePerShare

```pinescript
//@function Calculates the Price-to-Earnings (P/E) ratio for the chart's symbol.
priceEarningsRatio() =>
    //@variable The most recent 12-month earnings per share reported for the symbol.
    float eps = request.financial(syminfo.tickerid, "EARNINGS_PER_SHARE", "TTM")
    // Return the P/E ratio.
```
    close / eps

```pinescript
//@function Calculates the Price-to-Sales (P/S) ratio for the chart's symbol.
priceSalesRatio() =>
    //@variable The most recent number of outstanding shares reported for the symbol.
    float totalSharesOutstanding = request.financial(syminfo.tickerid, "TOTAL_SHARES_OUTSTANDING", "FQ")
    //@variable The most recent 12-month total revenue reported for the symbol.
    float totalRevenue = request.financial(syminfo.tickerid, "TOTAL_REVENUE", "TTM")
    // Return the P/S ratio.
```
    totalSharesOutstanding * close / totalRevenue

```pinescript
//@variable The text to display in label tooltips.
string tooltipText = str.format(
```
     "Market Cap: {0} {1}\nEarnings Yield: {2}%\nP/B Ratio: {3}\nP/E Ratio: {4}\nP/S Ratio: {5}",
     str.tostring(marketCap(), format.volume), syminfo.currency, earningsYield(), priceBookRatio(),
     priceEarningsRatio(), priceSalesRatio()
 )

```pinescript
//@variable Displays a blank label with a tooltip containing the `tooltipText`.
```
label info = label.new(chart.point.now(high), tooltip = tooltipText)
Note that:

Since not all companies publish quarterly financial reports, one
may need to change the “FQ” in these functions to match the
minimum reporting period for a specific company, as the
request.financial()
calls will return
na
when “FQ” data isn’t available.

Financial IDs
Below is an overview of all financial metrics one can request via
request.financial(),
along with the periods in which reports may be available. We’ve divided
this information into four tables corresponding to the categories
displayed in the “Financials” section of the “Indicators” menu:

Income statements
Balance sheet
Cash flow
Statistics

Each table has the following three columns:

The first column contains descriptions of each metric with links to
Help Center pages for additional information.
The second column lists the possible period arguments allowed for
the metric. Note that all available values may not be compatible
with specific ticker IDs, e.g., while “FQ” may be a possible
argument, it will not work if the issuing company does not publish
quarterly data.
The third column lists the “string” IDs for the financial_id
argument in
request.financial().

**Tip:** The tables in these sections are quite lengthy, because there are many financial_id arguments available. Use the “Click to show/hide” option above each table to toggle its visibility.
Income statements
This table lists the available metrics that provide information about a
company’s income, costs, profits and losses.
Click to show/hide

Financialperiodfinancial_idAfter tax other income/expenseFQ, FH, FY, TTMAFTER_TAX_OTHER_INCOMEAverage basic shares outstandingFQ, FH, FYBASIC_SHARES_OUTSTANDINGBasic earnings per share (Basic EPS)FQ, FH, FY, TTMEARNINGS_PER_SHARE_BASICCost of goods soldFQ, FH, FY, TTMCOST_OF_GOODSDeprecation and amortizationFQ, FH, FY, TTMDEP_AMORT_EXP_INCOME_SDiluted earnings per share (Diluted EPS)FQ, FH, FY, TTMEARNINGS_PER_SHARE_DILUTEDDiluted net income available to common stockholdersFQ, FH, FY, TTMDILUTED_NET_INCOMEDiluted shares outstandingFQ, FH, FYDILUTED_SHARES_OUTSTANDINGDilution adjustmentFQ, FH, FY, TTMDILUTION_ADJUSTMENTDiscontinued operationsFQ, FH, FY, TTMDISCONTINUED_OPERATIONSEBITFQ, FH, FY, TTMEBITEBITDAFQ, FH, FY, TTMEBITDAEquity in earningsFQ, FH, FY, TTMEQUITY_IN_EARNINGSGross profitFQ, FH, FY, TTMGROSS_PROFITInterest capitalizedFQ, FH, FY, TTMINTEREST_CAPITALIZEDInterest expense on debtFQ, FH, FY, TTMINTEREST_EXPENSE_ON_DEBTInterest expense, net of interest capitalizedFQ, FH, FY, TTMNON_OPER_INTEREST_EXPMiscellaneous non-operating expenseFQ, FH, FY, TTMOTHER_INCOMENet incomeFQ, FH, FY, TTMNET_INCOMENet income before discontinued operationsFQ, FH, FY, TTMNET_INCOME_BEF_DISC_OPERNon-controlling/minority interestFQ, FH, FY, TTMMINORITY_INTEREST_EXPNon-operating income, excl. interest expensesFQ, FH, FY, TTMNON_OPER_INCOMENon-operating income, totalFQ, FH, FY, TTMTOTAL_NON_OPER_INCOMENon-operating interest incomeFQ, FH, FY, TTMNON_OPER_INTEREST_INCOMEOperating expenses (excl. COGS)FQ, FH, FY, TTMOPERATING_EXPENSESOperating incomeFQ, FH, FY, TTMOPER_INCOMEOther cost of goods soldFQ, FH, FY, TTMCOST_OF_GOODS_EXCL_DEP_AMORTOther operating expenses, totalFQ, FH, FY, TTMOTHER_OPER_EXPENSE_TOTALPreferred dividendsFQ, FH, FY, TTMPREFERRED_DIVIDENDSPretax equity in earningsFQ, FH, FY, TTMPRETAX_EQUITY_IN_EARNINGSPretax incomeFQ, FH, FY, TTMPRETAX_INCOMEResearch & developmentFQ, FH, FY, TTMRESEARCH_AND_DEVSelling/general/admin expenses, otherFQ, FH, FY, TTMSELL_GEN_ADMIN_EXP_OTHERSelling/general/admin expenses, totalFQ, FH, FY, TTMSELL_GEN_ADMIN_EXP_TOTALTaxesFQ, FH, FY, TTMINCOME_TAXTotal operating expensesFQ, FH, FY, TTMTOTAL_OPER_EXPENSETotal revenueFQ, FH, FY, TTMTOTAL_REVENUEUnusual income/expenseFQ, FH, FY, TTMUNUSUAL_EXPENSE_INC
Balance sheet
This table lists the metrics that provide information about a company’s
capital structure.
Click to show/hide

Financialperiodfinancial_idAccounts payableFQ, FH, FYACCOUNTS_PAYABLEAccounts receivable - trade, netFQ, FH, FYACCOUNTS_RECEIVABLES_NETAccrued payrollFQ, FH, FYACCRUED_PAYROLLAccumulated depreciation, totalFQ, FH, FYACCUM_DEPREC_TOTALAdditional paid-in capital/Capital surplusFQ, FH, FYADDITIONAL_PAID_IN_CAPITALBook value per shareFQ, FH, FYBOOK_VALUE_PER_SHARECapital and operating lease obligationsFQ, FH, FYCAPITAL_OPERATING_LEASE_OBLIGATIONSCapitalized lease obligationsFQ, FH, FYCAPITAL_LEASE_OBLIGATIONSCash & equivalentsFQ, FH, FYCASH_N_EQUIVALENTSCash and short term investmentsFQ, FH, FYCASH_N_SHORT_TERM_INVESTCommon equity, totalFQ, FH, FYCOMMON_EQUITY_TOTALCommon stock par/Carrying valueFQ, FH, FYCOMMON_STOCK_PARCurrent portion of LT debt and capital leasesFQ, FH, FYCURRENT_PORT_DEBT_CAPITAL_LEASESDeferred income, currentFQ, FH, FYDEFERRED_INCOME_CURRENTDeferred income, non-currentFQ, FH, FYDEFERRED_INCOME_NON_CURRENTDeferred tax assetsFQ, FH, FYDEFERRED_TAX_ASSESTSDeferred tax liabilitiesFQ, FH, FYDEFERRED_TAX_LIABILITIESDividends payableFYDIVIDENDS_PAYABLEGoodwill, netFQ, FH, FYGOODWILLGross property/plant/equipmentFQ, FH, FYPPE_TOTAL_GROSSIncome tax payableFQ, FH, FYINCOME_TAX_PAYABLEInventories - finished goodsFQ, FH, FYINVENTORY_FINISHED_GOODSInventories - progress payments & otherFQ, FH, FYINVENTORY_PROGRESS_PAYMENTSInventories - raw materialsFQ, FH, FYINVENTORY_RAW_MATERIALSInventories - work in progressFQ, FH, FYINVENTORY_WORK_IN_PROGRESSInvestments in unconsolidated subsidiariesFQ, FH, FYINVESTMENTS_IN_UNCONCSOLIDATELong term debtFQ, FH, FYLONG_TERM_DEBTLong term debt excl. lease liabilitiesFQ, FH, FYLONG_TERM_DEBT_EXCL_CAPITAL_LEASELong term investmentsFQ, FH, FYLONG_TERM_INVESTMENTSMinority interestFQ, FH, FYMINORITY_INTERESTNet debtFQ, FH, FYNET_DEBTNet intangible assetsFQ, FH, FYINTANGIBLES_NETNet property/plant/equipmentFQ, FH, FYPPE_TOTAL_NETNote receivable - long termFQ, FH, FYLONG_TERM_NOTE_RECEIVABLENotes payableFYNOTES_PAYABLE_SHORT_TERM_DEBTOperating lease liabilitiesFQ, FH, FYOPERATING_LEASE_LIABILITIESOther common equityFQ, FH, FYOTHER_COMMON_EQUITYOther current assets, totalFQ, FH, FYOTHER_CURRENT_ASSETS_TOTALOther current liabilitiesFQ, FH, FYOTHER_CURRENT_LIABILITIESOther intangibles, netFQ, FH, FYOTHER_INTANGIBLES_NETOther investmentsFQ, FH, FYOTHER_INVESTMENTSOther long term assets, totalFQ, FH, FYLONG_TERM_OTHER_ASSETS_TOTALOther non-current liabilities, totalFQ, FH, FYOTHER_LIABILITIES_TOTALOther receivablesFQ, FH, FYOTHER_RECEIVABLESOther short term debtFYOTHER_SHORT_TERM_DEBTPaid in capitalFQ, FH, FYPAID_IN_CAPITALPreferred stock, carrying valueFQ, FH, FYPREFERRED_STOCK_CARRYING_VALUEPrepaid expensesFQ, FH, FYPREPAID_EXPENSESProvision for risks & chargeFQ, FH, FYPROVISION_F_RISKSRetained earningsFQ, FH, FYRETAINED_EARNINGSShareholders’ equityFQ, FH, FYSHRHLDRS_EQUITYShort term debtFQ, FH, FYSHORT_TERM_DEBTShort term debt excl. current portion of LT debtFQ, FH, FYSHORT_TERM_DEBT_EXCL_CURRENT_PORTShort term investmentsFQ, FH, FYSHORT_TERM_INVESTTangible book value per shareFQ, FH, FYBOOK_TANGIBLE_PER_SHARETotal assetsFQ, FH, FYTOTAL_ASSETSTotal current assetsFQ, FH, FYTOTAL_CURRENT_ASSETSTotal current liabilitiesFQ, FH, FYTOTAL_CURRENT_LIABILITIESTotal debtFQ, FH, FYTOTAL_DEBTTotal equityFQ, FH, FYTOTAL_EQUITYTotal inventoryFQ, FH, FYTOTAL_INVENTORYTotal liabilitiesFQ, FH, FYTOTAL_LIABILITIESTotal liabilities & shareholders’ equitiesFQ, FH, FYTOTAL_LIABILITIES_SHRHLDRS_EQUITYTotal non-current assetsFQ, FH, FYTOTAL_NON_CURRENT_ASSETSTotal non-current liabilitiesFQ, FH, FYTOTAL_NON_CURRENT_LIABILITIESTotal receivables, netFQ, FH, FYTOTAL_RECEIVABLES_NETTreasury stock - commonFQ, FH, FYTREASURY_STOCK_COMMON
Cash flow
This table lists the available metrics that provide information about
how cash flows through a company.
Click to show/hide

Financialperiodfinancial_idAmortizationFQ, FH, FY, TTMAMORTIZATIONCapital expendituresFQ, FH, FY, TTMCAPITAL_EXPENDITURESCapital expenditures - fixed assetsFQ, FH, FY, TTMCAPITAL_EXPENDITURES_FIXED_ASSETSCapital expenditures - other assetsFQ, FH, FY, TTMCAPITAL_EXPENDITURES_OTHER_ASSETSCash from financing activitiesFQ, FH, FY, TTMCASH_F_FINANCING_ACTIVITIESCash from investing activitiesFQ, FH, FY, TTMCASH_F_INVESTING_ACTIVITIESCash from operating activitiesFQ, FH, FY, TTMCASH_F_OPERATING_ACTIVITIESChange in accounts payableFQ, FH, FY, TTMCHANGE_IN_ACCOUNTS_PAYABLEChange in accounts receivableFQ, FH, FY, TTMCHANGE_IN_ACCOUNTS_RECEIVABLEChange in accrued expensesFQ, FH, FY, TTMCHANGE_IN_ACCRUED_EXPENSESChange in inventoriesFQ, FH, FY, TTMCHANGE_IN_INVENTORIESChange in other assets/liabilitiesFQ, FH, FY, TTMCHANGE_IN_OTHER_ASSETSChange in taxes payableFQ, FH, FY, TTMCHANGE_IN_TAXES_PAYABLEChanges in working capitalFQ, FH, FY, TTMCHANGES_IN_WORKING_CAPITALCommon dividends paidFQ, FH, FY, TTMCOMMON_DIVIDENDS_CASH_FLOWDeferred taxes (cash flow)FQ, FH, FY, TTMCASH_FLOW_DEFERRED_TAXESDepreciation & amortization (cash flow)FQ, FH, FY, TTMCASH_FLOW_DEPRECATION_N_AMORTIZATIONDepreciation/depletionFQ, FH, FY, TTMDEPRECIATION_DEPLETIONFinancing activities - other sourcesFQ, FH, FY, TTMOTHER_FINANCING_CASH_FLOW_SOURCESFinancing activities - other usesFQ, FH, FY, TTMOTHER_FINANCING_CASH_FLOW_USESFree cash flowFQ, FH, FY, TTMFREE_CASH_FLOWFunds from operationsFQ, FH, FY, TTMFUNDS_F_OPERATIONSInvesting activities - other sourcesFQ, FH, FY, TTMOTHER_INVESTING_CASH_FLOW_SOURCESInvesting activities - other usesFQ, FH, FYOTHER_INVESTING_CASH_FLOW_USESIssuance of long term debtFQ, FH, FY, TTMSUPPLYING_OF_LONG_TERM_DEBTIssuance/retirement of debt, netFQ, FH, FY, TTMISSUANCE_OF_DEBT_NETIssuance/retirement of long term debtFQ, FH, FY, TTMISSUANCE_OF_LONG_TERM_DEBTIssuance/retirement of other debtFQ, FH, FY, TTMISSUANCE_OF_OTHER_DEBTIssuance/retirement of short term debtFQ, FH, FY, TTMISSUANCE_OF_SHORT_TERM_DEBTIssuance/retirement of stock, netFQ, FH, FY, TTMISSUANCE_OF_STOCK_NETNet income (cash flow)FQ, FH, FY, TTMNET_INCOME_STARTING_LINENon-cash itemsFQ, FH, FY, TTMNON_CASH_ITEMSOther financing cash flow items, totalFQ, FH, FY, TTMOTHER_FINANCING_CASH_FLOW_ITEMS_TOTALOther investing cash flow items, totalFQ, FH, FYOTHER_INVESTING_CASH_FLOW_ITEMS_TOTALPreferred dividends paidFQ, FH, FYPREFERRED_DIVIDENDS_CASH_FLOWPurchase of investmentsFQ, FH, FY, TTMPURCHASE_OF_INVESTMENTSPurchase/acquisition of businessFQ, FH, FY, TTMPURCHASE_OF_BUSINESSPurchase/sale of business, netFQ, FH, FYPURCHASE_SALE_BUSINESSPurchase/sale of investments, netFQ, FH, FY, TTMPURCHASE_SALE_INVESTMENTSReduction of long term debtFQ, FH, FY, TTMREDUCTION_OF_LONG_TERM_DEBTRepurchase of common & preferred stockFQ, FH, FY, TTMPURCHASE_OF_STOCKSale of common & preferred stockFQ, FH, FY, TTMSALE_OF_STOCKSale of fixed assets & businessesFQ, FH, FY, TTMSALES_OF_BUSINESSSale/maturity of investmentsFQ, FH, FYSALES_OF_INVESTMENTSTotal cash dividends paidFQ, FH, FY, TTMTOTAL_CASH_DIVIDENDS_PAID
Statistics
This table contains a variety of statistical metrics, including commonly
used financial ratios.
Click to show/hide

Financialperiodfinancial_idAccrualsFQ, FH, FYACCRUALS_RATIOAltman Z-scoreFQ, FH, FYALTMAN_Z_SCOREAsset turnoverFQ, FH, FYASSET_TURNOVERBeneish M-scoreFQ, FH, FYBENEISH_M_SCOREBuyback yield %FQ, FH, FYBUYBACK_YIELDCOGS to revenue ratioFQ, FH, FYCOGS_TO_REVENUECash conversion cycleFQ, FYCASH_CONVERSION_CYCLECash to debt ratioFQ, FH, FYCASH_TO_DEBTCurrent ratioFQ, FH, FYCURRENT_RATIODays inventoryFQ, FYDAYS_INVENTDays payableFQ, FYDAYS_PAYDays sales outstandingFQ, FYDAY_SALES_OUTDebt to EBITDA ratioFQ, FH, FYDEBT_TO_EBITDADebt to assets ratioFQ, FH, FYDEBT_TO_ASSETDebt to equity ratioFQ, FH, FYDEBT_TO_EQUITYDebt to revenue ratioFQ, FH, FYDEBT_TO_REVENUEDividend payout ratio %FQ, FH, FY, TTMDIVIDEND_PAYOUT_RATIODividend yield %FQ, FH, FYDIVIDENDS_YIELDDividends per share - common stock primary issueFQ, FH, FY, TTMDPS_COMMON_STOCK_PRIM_ISSUEEBITDA margin %FQ, FH, FY, TTMEBITDA_MARGINEPS basic one year growthFQ, FH, FY, TTMEARNINGS_PER_SHARE_BASIC_ONE_YEAR_GROWTHEPS diluted one year growthFQ, FH, FYEARNINGS_PER_SHARE_DILUTED_ONE_YEAR_GROWTHEPS estimatesFQ, FH, FYEARNINGS_ESTIMATEEffective interest rate on debt %FQ, FH, FYEFFECTIVE_INTEREST_RATE_ON_DEBTEnterprise valueFQ, FH, FYENTERPRISE_VALUEEnterprise value to EBIT ratioFQ, FH, FYEV_EBITEnterprise value to EBITDA ratioFQ, FH, FYENTERPRISE_VALUE_EBITDAEnterprise value to revenue ratioFQ, FH, FYEV_REVENUEEquity to assets ratioFQ, FH, FYEQUITY_TO_ASSETFloat shares outstandingFYFLOAT_SHARES_OUTSTANDINGFree cash flow margin %FQ, FH, FYFREE_CASH_FLOW_MARGINFulmer H factorFQ, FYFULMER_H_FACTORGoodwill to assets ratioFQ, FH, FYGOODWILL_TO_ASSETGraham’s numberFQ, FYGRAHAM_NUMBERSGross margin %FQ, FH, FY, TTMGROSS_MARGINGross profit to assets ratioFQ, FYGROSS_PROFIT_TO_ASSETInterest coverageFQ, FH, FYINTERST_COVERInventory to revenue ratioFQ, FH, FYINVENT_TO_REVENUEInventory turnoverFQ, FH, FYINVENT_TURNOVERKZ indexFYKZ_INDEXLong term debt to total assets ratioFQ, FH, FYLONG_TERM_DEBT_TO_ASSETSNet current asset value per shareFQ, FYNCAVPS_RATIONet income per employeeFYNET_INCOME_PER_EMPLOYEENet margin %FQ, FH, FY, TTMNET_MARGINNumber of employeesFYNUMBER_OF_EMPLOYEESOperating earnings yield %FQ, FH, FYOPERATING_EARNINGS_YIELDOperating margin %FQ, FH, FYOPERATING_MARGINPEG ratioFQ, FYPEG_RATIOPiotroski F-scoreFQ, FH, FYPIOTROSKI_F_SCOREPrice earnings ratio forwardFQ, FYPRICE_EARNINGS_FORWARDPrice sales ratio forwardFQ, FYPRICE_SALES_FORWARDQuality ratioFQ, FH, FYQUALITY_RATIOQuick ratioFQ, FH, FYQUICK_RATIOResearch & development to revenue ratioFQ, FH, FYRESEARCH_AND_DEVELOP_TO_REVENUEReturn on assets %FQ, FH, FYRETURN_ON_ASSETSReturn on common equity %FQ, FH, FYRETURN_ON_COMMON_EQUITYReturn on equity %FQ, FH, FYRETURN_ON_EQUITYReturn on equity adjusted to book value %FQ, FH, FYRETURN_ON_EQUITY_ADJUST_TO_BOOKReturn on invested capital %FQ, FH, FYRETURN_ON_INVESTED_CAPITALReturn on tangible assets %FQ, FH, FYRETURN_ON_TANG_ASSETSReturn on tangible equity %FQ, FH, FYRETURN_ON_TANG_EQUITYRevenue estimatesFQ, FH, FYSALES_ESTIMATESRevenue one year growthFQ, FH, FY, TTMREVENUE_ONE_YEAR_GROWTHRevenue per employeeFYREVENUE_PER_EMPLOYEEShares buyback ratio %FQ, FH, FYSHARE_BUYBACK_RATIOSloan ratio %FQ, FH, FYSLOAN_RATIOSpringate scoreFQ, FYSPRINGATE_SCORESustainable growth rateFQ, FYSUSTAINABLE_GROWTH_RATETangible common equity ratioFQ, FH, FYTANGIBLE_COMMON_EQUITY_RATIOTobin’s Q (approximate)FQ, FH, FYTOBIN_Q_RATIOTotal common shares outstandingFQ, FH, FYTOTAL_SHARES_OUTSTANDINGZmijewski scoreFQ, FYZMIJEWSKI_SCORE
​request.economic()​
The
request.economic()
function provides scripts with the ability to retrieve economic data for
a specified country or region, including information about the state of
the economy (GDP, inflation rate, etc.) or of a particular industry
(steel production, ICU beds, etc.).
Below is the signature for this function:
request.economic(country_code, field, gaps, ignore_invalid_symbol) → series float
The country_code parameter accepts a “string” value representing
the identifier of the country or region to request economic data for
(e.g., “US”, “EU”, etc.). See the
Country/region codes section for a complete list of codes this function supports.
Note that the economic metrics available depend on the country or region
specified in the function call.
The field parameter accepts a “string” specifying the metric that the function requests.
The
Field codes section covers all accessible metrics and the
countries/regions they’re available for.
For a detailed explanation on the last two parameters of this function,
see the
Common characteristics section at the top of this page.
This simple example requests the growth rate of the Gross Domestic
Product (“GDPQQ”) for the United States (“US”) using
request.economic(),
then plots its value on the
chart with a gradient color:

```pinescript
//@version=6
indicator("Requesting economic data demo")

//@variable The GDP growth rate for the US economy.
float gdpqq = request.economic("US", "GDPQQ")

//@variable The all-time maximum growth rate.
float maxRate = ta.max(gdpqq)
//@variable The all-time minimum growth rate.
float minRate = ta.min(gdpqq)

//@variable The color of the `gdpqq` plot.
color rateColor = switch
```
    gdpqq >= 0 => color.from_gradient(gdpqq, 0, maxRate, color.purple, color.blue)
    =>            color.from_gradient(gdpqq, minRate, 0, color.red, color.purple)

// Plot the results.
plot(gdpqq, "US GDP Growth Rate", rateColor, style = plot.style_area)
Note that:

This example does not include a gaps argument in the
request.economic()
call, so the function uses the default
barmerge.gaps_off.
In other words, it returns the last retrieved value when new
data isn’t yet available.

**Tip:** The tables in the sections below are rather large, because there are numerous country_code and field arguments available. Use the “Click to show/hide” option above each table to toggle its visibility.
Country/region codes
The table in this section lists all country/region codes available for
use with
request.economic().
The first column of the table contains the “string” values that
represent the country or region code, and the second column contains the
corresponding country/region names.
It’s important to note that the value used as the country_code
argument determines which
field codes are accessible to the function.
Click to show/hide

country_codeCountry/region nameAFAfghanistanALAlbaniaDZAlgeriaADAndorraAOAngolaAGAntigua and BarbudaARArgentinaAMArmeniaAWArubaAUAustraliaATAustriaAZAzerbaijanBSBahamasBHBahrainBDBangladeshBBBarbadosBYBelarusBEBelgiumBZBelizeBJBeninBMBermudaBTBhutanBOBoliviaBABosnia and HerzegovinaBWBotswanaBRBrazilBNBruneiBGBulgariaBFBurkina FasoBIBurundiKHCambodiaCMCameroonCACanadaCVCape VerdeKYCayman IslandsCFCentral African RepublicTDChadCLChileCNChinaCOColombiaKMComorosCGCongoCRCosta RicaHRCroatiaCUCubaCYCyprusCZCzech RepublicDKDenmarkDJDjiboutiDMDominicaDODominican RepublicTLEast TimorECEcuadorEGEgyptSVEl SalvadorGQEquatorial GuineaEREritreaEEEstoniaETEthiopiaEUEuro areaFOFaroe IslandsFJFijiFIFinlandFRFranceGAGabonGMGambiaGEGeorgiaDEGermanyGHGhanaGRGreeceGLGreenlandGDGrenadaGTGuatemalaGNGuineaGWGuinea BissauGYGuyanaHTHaitiHNHondurasHKHong KongHUHungaryISIcelandINIndiaIDIndonesiaIRIranIQIraqIEIrelandIMIsle of ManILIsraelITItalyCIIvory CoastJMJamaicaJPJapanJOJordanKZKazakhstanKEKenyaKIKiribatiXKKosovoKWKuwaitKGKyrgyzstanLALaosLVLatviaLBLebanonLSLesothoLRLiberiaLYLibyaLILiechtensteinLTLithuaniaLULuxembourgMOMacauMKMacedoniaMGMadagascarMWMalawiMYMalaysiaMVMaldivesMLMaliMTMaltaMRMauritaniaMUMauritiusMXMexicoMDMoldovaMCMonacoMNMongoliaMEMontenegroMAMoroccoMZMozambiqueMMMyanmarNANamibiaNPNepalNLNetherlandsNCNew CaledoniaNZNew ZealandNINicaraguaNENigerNGNigeriaKPNorth KoreaNONorwayOMOmanPKPakistanPSPalestinePAPanamaPGPapua New GuineaPYParaguayPEPeruPHPhilippinesPLPolandPTPortugalPRPuerto RicoQAQatarCDRepublic of the CongoRORomaniaRURussiaRWRwandaWSSamoaSMSan MarinoSTSao Tome and PrincipeSASaudi ArabiaSNSenegalRSSerbiaSCSeychellesSLSierra LeoneSGSingaporeSKSlovakiaSISloveniaSBSolomon IslandsSOSomaliaZASouth AfricaKRSouth KoreaSSSouth SudanESSpainLKSri LankaLCSt LuciaVCSt Vincent and the GrenadinesSDSudanSRSurinameSZSwazilandSESwedenCHSwitzerlandSYSyriaTWTaiwanTJTajikistanTZTanzaniaTHThailandTGTogoTOTongaTTTrinidad and TobagoTNTunisiaTRTurkeyTMTurkmenistanUGUgandaUAUkraineAEUnited Arab EmiratesGBUnited KingdomUSUnited StatesUYUruguayUZUzbekistanVUVanuatuVEVenezuelaVNVietnamYEYemenZMZambiaZWZimbabwe
Field codes
The table in this section lists the field codes available for use with
request.economic().
The first column contains the “string” values used as the field
argument, and the second column contains names of each metric and links
to our Help Center with additional information, including the
countries/regions they’re available for.
Click to show/hide

fieldMetricAAAsylum ApplicationsACRAPI Crude RunsAEAuto ExportsAHEAverage Hourly EarningsAHOAPI Heating OilAWHAverage Weekly HoursBBSBanks Balance SheetBCLIBusiness Climate IndicatorBCOIBusiness Confidence IndexBIBusiness InventoriesBLRBank Lending RateBOINFIB Business Optimism IndexBOTBalance Of TradeBPBuilding PermitsBRBankruptciesCACurrent AccountCAGCurrent Account To GDPCAPCar ProductionCARCar RegistrationsCBBSCentral Bank Balance SheetCCCClaimant Count ChangeCCIConsumer Confidence IndexCCOSCushing Crude Oil StocksCCPCore Consumer PricesCCPICore CPICCPTConsumer Confidence Price TrendsCCRConsumer CreditCCSCredit Card SpendingCEPCement ProductionCFCapital FlowsCFNAIChicago Fed National Activity IndexCIAPI Crude ImportsCINDCoincident IndexCIRCore Inflation Rate, YoYCJCContinuing Jobless ClaimsCNAPI Cushing NumberCOICrude Oil ImportsCOIRCrude Oil Imports from RussiaCONSTSConstruction SpendingCOPCrude Oil ProductionCORCrude Oil RigsCORDConstruction Orders, YoYCORPICorruption IndexCORRCorruption RankCOSCCrude Oil Stocks ChangeCOUTConstruction Output, YoYCPCopper ProductionCPCEPICore PCE Price IndexCPIConsumer Price IndexCPIHUCPI Housing UtilitiesCPIMCPI MedianCPITCPI TransportationCPITMCPI Trimmed MeanCPMIChicago PMICPPICore Producer Price IndexCPRCorporate ProfitsCRLPICereals Price IndexCRRCash Reserve RatioCSConsumer SpendingCSCAPI Crude Oil Stock ChangeCSHPICase Shiller Home Price IndexCSHPIMMCase Shiller Home Price Index, MoMCSHPIYYCase Shiller Home Price Index, YoYCSSChain Store SalesCTRCorporate Tax RateCUCapacity UtilizationDFMIDallas Fed Manufacturing IndexDFPDistillate Fuel ProductionDFSDistillate StocksDFSIDallas Fed Services IndexDFSRIDallas Fed Services Revenues IndexDGDeposit GrowthDGODurable Goods OrdersDGOEDDurable Goods Orders Excluding DefenseDGOETDurable Goods Orders Excluding TransportationDIRDeposit Interest RateDPIDisposable Personal IncomeDRPIDairy Price IndexDSAPI Distillate StocksDTCBI Distributive TradesECADP Employment ChangeEDExternal DebtEDBREase Of Doing Business RankingEHSExisting Home SalesELPElectricity ProductionEMCEmployment ChangeEMCIEmployment Cost IndexEMPEmployed PersonsEMREmployment RateEOIEconomic Optimism IndexEPExport PricesESIZEW Economic Sentiment IndexEWSEconomy Watchers SurveyEXPExportsEXPYYExports, YoYFAIFixed Asset InvestmentFBIForeign Bond InvestmentFDIForeign Direct InvestmentFEFiscal ExpenditureFERForeign Exchange ReservesFIFood Inflation, YoYFOFactory OrdersFOETFactory Orders Excluding TransportationFPIFood Price IndexFSIForeign Stock InvestmentFTEFull Time EmploymentFYGDPGFull Year GDP GrowthGASPGasoline PricesGBPGovernment BudgetGBVGovernment Budget ValueGCICompetitiveness IndexGCRCompetitiveness RankGDGovernment DebtGDGGovernment Debt To GDPGDPGross Domestic ProductGDPAGDP From AgricultureGDPCGDP From ConstructionGDPCPGDP Constant PricesGDPDGDP DeflatorGDPGAGDP Growth AnnualizedGDPMANGDP From ManufacturingGDPMINGDP From MiningGDPPAGDP From Public AdministrationGDPPCGDP Per CapitaGDPPCPGDP Per Capita, PPPGDPQQGDP Growth RateGDPSGDP From ServicesGDPSAGDP SalesGDPTGDP From TransportGDPUGDP From UtilitiesGDPYYGDP, YoYGDTPIGlobal Dairy Trade Price IndexGFCFGross Fixed Capital FormationGNPGross National ProductGPGold ProductionGPAGovernment PayrollsGPROGasoline ProductionGRGovernment RevenuesGRESGold ReservesGSAPI Gasoline StocksGSCGrain Stocks CornGSCHGasoline Stocks ChangeGSGGovernment Spending To GDPGSPGovernment SpendingGSSGrain Stocks SoyGSWGrain Stocks WheatGTBGoods Trade BalanceHBHospital BedsHDGHouseholds Debt To GDPHDIHouseholds Debt To IncomeHICPHarmonised Index of Consumer PricesHIRMMHarmonised Inflation Rate, MoMHIRYYHarmonised Inflation Rate, YoYHMINAHB Housing Market IndexHORHome Ownership RateHOSHeating Oil StocksHOSPHospitalsHPIHouse Price IndexHPIMMHouse Price Index, MoMHPIYYHouse Price Index, YoYHSHome LoansHSPHousehold SpendingHSTHousing StartsICChanges In InventoriesICUBICU BedsIEInflation ExpectationsIFOCCIFO Assessment Of The Business SituationIFOEIFO Business Developments ExpectationsIJCInitial Jobless ClaimsIMPImportsIMPYYImports, YoYINBRInterbank RateINTRInterest RateIPAIP AddressesIPMMIndustrial Production, MoMIPRIImport PricesIPYYIndustrial Production, YoYIRMMInflation Rate, MoMIRYYInflation Rate, YoYISIndustrial SentimentISPInternet SpeedJAJob AdvertisementsJARJobs To Applications RatioJCChallenger Job CutsJC4WJobless Claims, 4-Week AverageJOJob OffersJVJob VacanciesKFMIKansas Fed Manufacturing IndexLBLoans To BanksLCLabor CostsLEILeading Economic IndexLFPRLabor Force Participation RateLGLoan Growth, YoYLIVRRLiquidity Injections Via Reverse RepoLMICLMI Logistics Managers Index CurrentLMICILMI Inventory CostsLMIFLMI Logistics Managers Index FutureLMITPLMI Transportation PricesLMIWPLMI Warehouse PricesLPSLoans To Private SectorLRCentral Bank Lending RateLTURLong Term Unemployment RateLWFLiving Wage FamilyLWILiving Wage IndividualM0Money Supply M0M1Money Supply M1M2Money Supply M2M3Money Supply M3MAMortgage ApprovalsMAPLMortgage ApplicationsMCEMichigan Consumer ExpectationsMCECMichigan Current Economic ConditionsMDMedical DoctorsMEMilitary ExpenditureMGDPYYMonthly GDP, YoYMIE1YMichigan Inflation ExpectationsMIE5YMichigan 5 Year Inflation ExpectationsMIPMining Production, YoYMMIMBA Mortgage Market IndexMOMachinery OrdersMPManufacturing PayrollsMPIMeat Price IndexMPRMMManufacturing Production, MoMMPRYYManufacturing Production, YoYMRMortgage RateMRIMBA Mortgage Refinance IndexMSManufacturing SalesMTOMachine Tool OrdersMWMinimum WagesNDCGOEAOrders For Non-defense Capital Goods Excluding AircraftNEGTBGoods Trade Deficit With Non-EU CountriesNFPNonfarm PayrollsNGINatural Gas ImportsNGIRNatural Gas Imports from RussiaNGSCNatural Gas Stocks ChangeNHPINationwide House Price IndexNHSNew Home SalesNHSMMNew Home Sales, MoMNMPMINon-Manufacturing PMINONew OrdersNODXMMNon-Oil Domestic Exports, MoMNODXYYNon-Oil Domestic Exports, YoYNOENon-Oil ExportsNPPNonfarm Payrolls PrivateNURSNursesNYESMINY Empire State Manufacturing IndexOEOil ExportsOPIOils Price IndexPCEPIPCE Price IndexPDGPrivate Debt To GDPPFMIPhiladelphia Fed Manufacturing IndexPHSIMMPending Home Sales Index, MoMPHSIYYPending Home Sales Index, YoYPIPersonal IncomePINPrivate InvestmentPINDMBA Purchase IndexPITRPersonal Income Tax RatePOPPopulationPPIProducer Price IndexPPIIProducer Price Index InputPPIMMProducer Price Inflation, MoMPPIYYProducer Prices Index, YoYPRIAPI Product ImportsPRODProductivityPSPersonal SavingsPSCPrivate Sector CreditPSPPersonal SpendingPTEPart Time EmploymentPUACPandemic Unemployment Assistance ClaimsRAMRetirement Age MenRAWRetirement Age WomenRCRRefinery Crude RunsREMRemittancesRFMIRichmond Fed Manufacturing IndexRFMSIRichmond Fed Manufacturing Shipments IndexRFSIRichmond Fed Services IndexRIRedbook IndexRIEARetail Inventories Excluding AutosRPIRetail Price IndexRRRepo RateRRRReverse Repo RateRSEARetail Sales Excluding AutosRSEFRetail Sales Excluding FuelRSMMRetail Sales, MoMRSYYRetail Sales, YoYRTIReuters Tankan IndexSBSISmall Business Sentiment IndexSFHPSingle Family Home PricesSPSteel ProductionSPISugar Price IndexSSServices SentimentSSRSocial Security RateSSRCSocial Security Rate For CompaniesSSRESocial Security Rate For EmployeesSTRSales Tax RateTATourist ArrivalsTAXRTax RevenueTCBTreasury Cash BalanceTCPITokyo CPITITerrorism IndexTIITertiary Industry IndexTOTTerms Of TradeTRTourism RevenuesTVSTotal Vehicle SalesUCUnemployment ChangeUPUnemployed PersonsURUnemployment RateWAGWagesWESWeapons SalesWGWage Growth, YoYWHSWages High SkilledWIWholesale InventoriesWLSWages Low SkilledWMWages In ManufacturingWPIWholesale Price IndexWSWholesale SalesYURYouth Unemployment RateZCCZEW Current Conditions
​request.footprint()​
The request.footprint() function enables scripts to retrieve volume footprint data for the bars in the datasets on which they run. For a given bar, a volume footprint categorizes volume values from lower timeframes as “buy” (upward) or “sell” (downward) based on intrabar price action, then collects the categorized volume data into equally sized rows that cover the bar’s price range. Programmers can use retrieved footprint data to inspect the distribution of “buy”, “sell”, and total volume across the rows for a bar’s range, identify a bar’s Point of Control (POC) and other significant price levels, calculate volume delta information, detect volume imbalances, and more.
NoteVolume footprints are available exclusively to users who have a Premium or Ultimate plan. Accounts with lower-tier plans cannot use scripts that request volume footprint data with the request.footprint() function.
The function’s signature is as follows:
request.footprint(ticks_per_row, va_percent, imbalance_percent) → series footprint
The ticks_per_row parameter specifies the size of each row in the calculated volume footprint, in ticks. It requires a positive “simple int” value representing a multiplier for the instrument’s minimum tick size. For example, if the argument is 100, the price range of each row equals the value of 100 * syminfo.mintick. The specified row size affects the total number of rows in each bar’s footprint. Increase the value for fewer rows with a larger size, or decrease the value for the opposite.
The va_percent parameter accepts a “simple float” value specifying the percentage of the footprint’s total volume to use for calculating the bar’s Value Area (VA), where a value of 100 represents 100% of the total volume. Specifying an argument is optional. The default value is 70, meaning that the footprint’s VA includes 70% of the total volume.
The imbalance_percent parameter accepts a “simple float” value specifying the required percentage difference between “buy” and “sell” volume in adjacent footprint rows for detecting volume imbalances:

The footprint considers a row to have a buy imbalance if the row’s “buy” volume exceeds the “sell” volume of the row below it by the specified percentage.
The footprint considers a row to have a sell imbalance if the row’s “sell” volume exceeds the “buy” volume of the row above it by the given percentage.

Including an imbalance_percent argument is optional. The default value is 300, meaning that the “buy” or “sell” volume of a footprint row must be three times (300%) larger than the opposing volume of an adjacent row to signify an imbalance.
A call to the request.footprint() function returns either the reference (ID) of a footprint object that contains the volume footprint data for the current bar, or na if no footprint is available for that bar.
NoticeScripts cannot perform more than one footprint request with the request.footprint() function. If a script contains multiple calls to this function, it raises a runtime error.
Scripts can use any returned footprint ID that is not na in calls to the built-in footprint.*() functions to retrieve data from a bar’s volume footprint.
For example, the following script calls request.footprint() on each bar to request the ID of a footprint object that contains the bar’s volume footprint data. If the requested data is available, the script then uses the returned ID in calls to four footprint.*() functions — footprint.total_volume(), footprint.buy_volume(), footprint.sell_volume(), and footprint.delta() — to retrieve the footprint’s total volume, total “buy” and “sell” volume, and overall volume delta.
The script plots the “buy” volume, the negative “sell” volume, and the volume delta as columns for visual comparison. It also displays a color-coded label at each bar’s high price to indicate whether the bar’s “buy” volume exceeds its “sell” volume or vice versa. Hovering over a label reveals a tooltip that shows the corresponding bar’s total volume and volume delta:

```pinescript
//@version=6
indicator("Requesting volume footprint data demo", max_labels_count = 500)

//@variable The number of ticks to use as the price interval for each footprint row.
int numTicksInput = input.int(100, "Ticks per footprint row", minval = 1)

//@variable References a `footprint` object for the current bar, or holds `na` if no footprint data is available.
```
footprint reqFootprint = request.footprint(numTicksInput)
```pinescript
//@variable Is `true` if the requested `footprint` ID is not `na`, and `false` otherwise.
bool hasFootprint = not na(reqFootprint)

// Retrieve the bar's total, "buy", and "sell" volume sums and overall volume delta from the `footprint` object.
float totalVolume = hasFootprint ? footprint.total_volume(reqFootprint) : na
float buyVolume   = hasFootprint ? footprint.buy_volume(reqFootprint)   : na
float sellVolume  = hasFootprint ? footprint.sell_volume(reqFootprint)  : na
float deltaVolume = hasFootprint ? footprint.delta(reqFootprint)        : na

// Plot the total "buy" and "sell" volume as bidirectional columns, where "buy" volume increases in the
// positive direction (upward plot), and "sell" volume increases in the negative direction (downward plot).
plot(buyVolume,       "Total buy volume",  #6eb21c, style = plot.style_columns)
plot(sellVolume * -1, "Total sell volume", #b21c2b, style = plot.style_columns)
// Plot bar's volume delta on top of the bidirectional columns to show the difference between "buy" and "sell" volume.
plot(deltaVolume, "Volume delta", #e8a93c, style = plot.style_columns)
hline(0, "Zero line", #d6d6d8, hline.style_solid)

// Draw a label at the bar's high. The label is green if the volume delta is positive or zero, and red otherwise.
// The label includes a tooltip that shows the bar's total volume and volume delta.
label.new(
```
    bar_index, high, color = deltaVolume >= 0 ? #6eb21c : #b21c2b, size = 14,
    tooltip = str.format("Total volume: \t{0}\nVolume delta: \t{1}", totalVolume, deltaVolume), force_overlay = true
)
Note that:

The id parameter of each footprint.*() function does not allow na arguments. Therefore, this script uses ternary operations that execute footprint.*() calls only if the retrieved footprint ID is not na. If no data is available, the operations return na directly without executing the calls.
On timeframes higher than or equal to “1D”, a footprint’s total volume might differ significantly from the value of the volume variable. Such differences occur for some instruments because EOD data feeds can include data from block trades, OTC trades, and other sources, whereas requested intraday data feeds do not. See the Data feeds section to learn more about the types of data feeds and their differences.

While some of the footprint.*() functions retrieve values representing overall metrics for a requested volume footprint, as shown above, others retrieve the IDs of volume_row objects that contain data for individual rows from the footprint for more detailed analysis. For instance, the footprint.poc() function retrieves the ID of the volume_row object that contains data for a footprint’s Point of Control row (i.e., the row with the highest total volume), and the footprint.rows() function constructs an array containing the volume_row IDs for every row within a footprint.
Scripts can use non-na IDs of the volume_row type in calls to the built-in volume_row.*() functions to retrieve data for a specific footprint row, including the row’s price levels, volume sums, volume delta, and buy or sell imbalances.
The advanced example below retrieves and displays detailed volume footprint information for visible chart bars. On each visible bar, the script requests a footprint ID using request.footprint(). If the ID is not na, the script calls footprint.rows() to create an array containing the volume_row IDs for all rows in the footprint, and uses other footprint.*() calls to retrieve the individual IDs for the footprint’s POC and Value Area rows.
Afterward, the script loops through the array using a for...in loop. It calls multiple volume_row.*() functions within the loop to retrieve price levels, categorized volume values, volume delta, and imbalance states for each row. On each iteration, the script formats the retrieved “buy” and “sell” volume, volume delta, and imbalance information for the current row into a string, and then displays the text in a box drawn at the row’s price range in a separate pane. Each box uses a gradient background color based on the row’s volume delta and its total volume relative to the POC row’s total volume. The text color of each box is the chart’s foreground color if the row is the POC, purple if the row is a VA boundary, and gray otherwise.
The script also plots the retrieved POC levels and the VA boundaries as circles on the main chart pane for visual reference:

```pinescript
//@version=6
indicator("Retrieving footprint row data demo", max_boxes_count = 500)

//@variable The size of each footprint row, expressed in ticks.
int numTicksInput = input.int(100, "Ticks per footprint row", 1)
//@variable The percentage difference in opposing volume between rows for detecting volume imbalances.
int imbalanceInput = input.int(300, "Imbalance percentage", 1)

//@variable References a `footprint` object for the current bar, or holds `na` if no footprint data is available.
```
footprint reqFootprint = request.footprint(numTicksInput, imbalance_percent = imbalanceInput)

// Declare a tuple of variables to hold the values returned by the `if` structure for plotting.
// The values are not `na` only if the bar is visible and the `reqFootprint` variable does not hold `na`.
[pocHigh, pocLow, vaHigh, vaLow] = if (
    time >= chart.left_visible_bar_time and time <= chart.right_visible_bar_time and not na(reqFootprint)
)
```pinescript
    //@variable References an array containing a `volume_row` ID for each row in the volume footprint.
```
    array<volume_row> volumeRowsArray = reqFootprint.rows()

    // Retrieve `volume_row` IDs for the footprint's Point of Control, Value Area High, and Value Area Low rows.
    volume_row poc = reqFootprint.poc()
    volume_row vah = reqFootprint.vah()
    volume_row val = reqFootprint.val()

    // Loop through the array. The `row` variable holds a `volume_row` ID, starting with the one for the *lowest* row.
    for row in volumeRowsArray
        // Get the upper and lower price levels of the current row.
        float upPrice = row.up_price(), float dnPrice = row.down_price()
        // Get the row's "buy" and "sell" volume values and the volume delta.
        float buyVol = row.buy_volume(), float sellVol = row.sell_volume(), float delta = row.delta()
        // Get the row's buy and sell imbalance states.
        bool buyImbalance = row.has_buy_imbalance(), bool sellImbalance = row.has_sell_imbalance()

```pinescript
        //@variable A string representing the row's buy volume, sell volume, volume delta, and imbalances, respectively.
        string boxText = str.format(
```
            "B: {0} | S: {1} | D: {2} | I: {3}", str.tostring(buyVol, format.volume),
            str.tostring(sellVol, format.volume), str.tostring(delta, format.volume),
            buyImbalance and sellImbalance ? "Both" : buyImbalance ? "Buy" : sellImbalance ? "Sell" : "None"
        )

        // Calculate a green (for positive delta) or red (for negative delta) gradient color based on the row's volume 
        // relative to the POC volume.
        color deltaColor = delta >= 0 ? color.green : color.red
        color boxColor = color.from_gradient(
            row.total_volume() / poc.total_volume(),  0, 1, color.new(deltaColor, 100), color.new(deltaColor, 70)
        )
        // Draw a box at the price range of the row, in a separate pane, to display the `boxText` value.
        box rowBox = box.new(
            bar_index, upPrice, bar_index + 1, dnPrice, #787b8650, 1, text = boxText,
            text_color = #787b86, text_halign = text.align_left, bgcolor = boxColor
        )
        // Update the text color and formatting of the box if the current row is a Value Area boundary or the POC.
        if upPrice == vah.up_price() or upPrice == val.up_price()
            rowBox.set_text_color(color.purple)
            rowBox.set_text_formatting(text.format_bold)
        if upPrice == poc.up_price()
            rowBox.set_text_color(chart.fg_color)
            rowBox.set_text_formatting(text.format_bold)
    // Return the POC and VA levels for use in the global scope.
    [poc.up_price(), poc.down_price(), vah.up_price(), val.down_price()]

// Plot the retrieved POC and VA levels on the main chart pane.
plot(pocHigh, "POC top",    chart.fg_color,  5, plot.style_circles, force_overlay = true)
plot(pocLow,  "POC bottom", chart.fg_color,  5, plot.style_circles, force_overlay = true)
plot(vaHigh,  "VAH top",    color.purple,  3, plot.style_circles, force_overlay = true)
plot(vaLow,   "VAH bottom", color.purple,  3, plot.style_circles, force_overlay = true)
Note that:

As with the built-in functions for most other reference types, scripts can call footprint.*() and volume_row.*() built-ins as functions or methods. This script calls the built-ins using method syntax.
The array created by footprint.rows() sorts its elements in ascending order by price level, where the first element refers to the volume_row object for the row with the lowest prices, and the last refers to the one for the row with the highest prices.
The results of volume_row.has_buy_imbalance() and volume_row.has_sell_imbalance() calls depend on the imbalance_percent argument of the request.footprint() call that creates the parent footprint object. In this example, the “Imbalance percentage” input controls the argument, and therefore controls the behavior of the script’s volume_row.has_*_imbalance() calls.

To learn more about the footprint and volume_row types, and the available functions in their namespaces, refer to the footprint and volume_row section of the Type system page.
For more information about volume footprints and how they work, refer to the Volume footprint charts article in our Help Center.
​request.seed()​
TradingView aggregates a vast amount of data from its many providers, including price and volume information on tradable instruments, financials, economic data, and more, which users can retrieve in Pine Script using the functions discussed in the sections above, as well as multiple built-in variables.
To further expand the horizons of possible data one can analyze on TradingView, we have Pine Seeds, which allows users to supply custom user-maintained EOD data feeds via GitHub for use on TradingView charts and within Pine Script code.
NoticeThe creation of new Pine Seeds repositories is currently unavailable. However, the data feeds from existing repositories are still accessible to charts and scripts. The Pine Seeds documentation on GitHub provides in-depth information about Pine Seeds functionality and instructions for requesting the return of full Pine Seeds support.
To retrieve data from a Pine Seeds data feed within a script, use the request.seed() function. Below is the function’s signature:
request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) → series <type>
The source parameter specifies the unique name of the user-maintained GitHub repository that contains the data feed.
The symbol parameter represents the file name from the “data/” directory of the source repository, excluding the “.csv” file extension. See this page for information about the structure of the data stored in repositories.
The expression parameter is the series to evaluate using data extracted from the requested context. It is similar to the equivalent in request.security() and request.security_lower_tf(). Data feeds stored in user-maintained repos contain time, open, high, low, close, and volume information, meaning the expression argument can use the corresponding built-in variables, including variables derived from them (e.g., bar_index, ohlc4, etc.) to request their values from the context of the custom data.
The script below visualizes sample data from the seed_crypto_santiment demo repository. It uses two calls to request.seed() to retrieve the close values from the repository’s BTC_SENTIMENT_POSITIVE_TOTAL and BTC_SENTIMENT_NEGATIVE_TOTAL data feeds and plots the results on the chart as step lines:

```pinescript
//@version=6
indicator("Pine Seeds demo", format=format.volume)

//@variable The total positive sentiment for BTC extracted from the "seed_crypto_santiment" repository.
float positiveTotal = request.seed("seed_crypto_santiment", "BTC_SENTIMENT_POSITIVE_TOTAL", close)
//@variable The total negative sentiment for BTC extracted from the "seed_crypto_santiment" repository.
float negativeTotal = request.seed("seed_crypto_santiment", "BTC_SENTIMENT_NEGATIVE_TOTAL", close)

// Plot the data.
plot(positiveTotal, "Positive sentiment", color.teal, 2, plot.style_stepline)
plot(negativeTotal, "Negative sentiment", color.maroon, 2, plot.style_stepline)
```
Note that:

This example requests data from the repository highlighted in the Pine Seeds documentation. It exists solely for example purposes, and its data does not update on a regular basis.
Unlike most other request.*() functions, request.seed() does not have a gaps parameter. It always returns na values when no new data exists.
Pine Seeds data is searchable from the chart’s symbol search bar. To load a data feed on the chart, enter the “Repo:File” pair, similar to searching for an “Exchange:Symbol” pair.