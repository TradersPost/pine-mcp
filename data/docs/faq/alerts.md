# Alerts

How do I make an alert available from my script?
In indicator scripts, there are two ways to define triggers for alerts:

Using the alertcondition() function
Using the alert() function

In strategy scripts, there are also two ways to define alert triggers:

Using the alert() function
Using order fill events

These methods make alert triggers available but do not create alerts directly. Users must create alerts using a script’s alert triggers by selecting the appropriate trigger in the “Condition” dropdown of the “Create Alert” dialog box.
Programmers can define multiple alert triggers of one or more types in a script.
How are the types of alerts different?
Usability
Any script can include calls to the alertcondition() and alert() functions within their code. However, alertcondition() calls have no effect unless the script is an indicator. Libraries can export functions containing alert() calls, but they cannot issue alert triggers directly.
Order fill alert triggers are available only from strategies.
Options for creating alerts
Each alertcondition() call in an indicator script defines one distinct trigger and one corresponding option in the “Condition” dropdown menu of the “Create Alert” dialog box. If the user wants multiple alerts, they must create each one separately.
By contrast, if a script includes one or more alert() function calls, only one option appears in the “Condition” dropdown menu, titled “Any alert() function call”. Selecting this option creates a single alert that activates based on the occurrences of any executed alert() call.
Similarly, for strategy scripts, the “Order fills and and alert() function calls” or “Order fills only” option in the “Condition” dropdown menu creates an alert that fires when any order fill event occurs.
How alerts activate
The alertcondition() function operates exclusively in an indicator’s global scope. Scripts cannot include calls to this function within any local block, such as the indented code within an if structure. The function triggers an alert when its specified condition is true. Users can set the allowed frequency of the alert trigger using the “Frequency” field in the “Create Alert” dialog box.
The alert() function has no condition parameter. Scripts trigger the alerts on any alert() call based on each call’s freq argument. Therefore, programmers typically include such calls within the local scopes of conditional structures to control when they execute.
Order fill alert triggers are available from strategies automatically without requiring extra code. However, programmers can customize the default alert messages. These alerts fire on order fill events, which occur when the broker emulator fills a strategy’s orders.
Messages
The message parameter of the alertcondition() function populates the “Message” field of the “Create Alert” dialog box with a default message, which script users can customize to suit their alert needs. It accepts a “const string” argument, meaning its value cannot change after compilation. However, the argument can include placeholders to make the message’s information dynamic.
The message parameter of the alert() function accepts a “series string” argument, allowing programmers to create dynamic messages that can include “string” representations of a script’s calculated values. Unlike alertcondition(), this function does not populate a “Message” field in the “Create Alert” dialog box, and it does not process placeholders. Programmers can allow users to customize alert() messages by creating inputs in the script’s settings.
Order fill alerts have a default message that describes a strategy’s order fill event. This default message contains strategy-specific placeholders, which the alert replaces with current strategy information each time it fires. Programmers can override the default message using the //@strategy_alert_message compiler annotation, which allows text and strategy placeholders, but not script variables. Script users can edit the default message from the “Message” field in the “Create Alert” dialog.
The alert_message parameter in a strategy’s order placement commands allows programmers to define distinct messages for each order fill event. The parameter accepts “series string” values that can change on each event. To use the values from this parameter in a strategy’s order fill alerts, include the {{strategy.order.alert_message}} placeholder in the //@strategy_alert_message annotation, or include it in the “Message” field when creating an alert.
Limitations
The alertcondition() function has some limitations:

Each active alert condition counts toward the total number of alerts the user’s plan allows.
Every alertcondition() call contributes to the script’s plot count.
Only indicators can issue alert triggers with this function. Other script types do not raise a compilation error when they include calls to this function in their code, but each call has no effect.

By contrast, all calls to the alert() function count as one alert, regardless of the number of calls in the code. In addition, alert() calls do not contribute to a script’s plot count.
Similarly, if a user creates a strategy alert based on order fill events, it counts as one alert, even though it can fire multiple times with distinct messages from different order executions.
Example ​alertcondition()​ alert
The script below demonstrates a simple alertcondition() call that triggers alerts when the current bar’s close is above the value from the previous chart bar. It also uses a plotshape() call to indicate each bar where the triggerCondition occurred:
```pinescript
//@version=6
indicator("Simple alert demo", overlay = true)
// Create condition to trigger alert.
bool triggerCondition = close > close[1]
// Use `triggerCondition` for the `condition` parameter. 
// Define a title for the alert in the menu and a message to send with the alert. 
alertcondition(condition = triggerCondition, title = "Example `alertcondition` Alert", 
  message = "The example `alertcondition` alert was triggered.")
// Plot a shape when `triggerCondition` is true to visually mark where alerts occur.
plotshape(triggerCondition, "Trigger Condition", shape.xcross, color = color.fuchsia)
```
See this section of the Alerts page to learn more.
Example ​alert()​ alert
This example uses the vstop() function from our ta library to calculate a volatility stop value and trend information based on the Average True Range (ATR). The stopValue trails behind the chart’s close to form a trend-following system.
The script triggers an alert with an alert() call each time the trend direction changes. The alert’s message is a “series string” that shows the trend’s new direction and the current stop value. An additional alert occurs whenever the stopValue moves in the current trend direction, with a message containing the updated value:
```pinescript
//@version=6
indicator("Vstop alert demo", overlay = true)

import TradingView/ta/7 as TVta

// Calculate ATR trailing stop and determine trend direction.
[stopValue, trendUp] = TVta.vStop(close, 20, 2)

// Round the stop value to mintick for accuracy in comparison operators.
float stop = math.round_to_mintick(stopValue)

// Check for trend changes.
bool  trendReversal = trendUp != trendUp[1]
bool  trendToDn     = trendReversal and not trendUp
bool  trendToUp     = trendReversal and     trendUp
// Create color variables for the plot display.
color plotColor     = trendUp ? color.green : color.red
color lineColor     = trendReversal ? color(na) : plotColor

// Plot the stop value on the chart. Plot a circle on trend changes.
plot(stop, "V-Stop", lineColor)
plot(trendReversal ? stop : na, "Trend Change Circle", plotColor, 3, plot.style_circles)

// Convert the stop value to string for use in the alert messages.
string stopStr = str.tostring(stop)

// If the trend changed to up, send a long alert with the initial stop value.
if trendToUp
    alert("Long alert. Stop @ " + stopStr, alert.freq_once_per_bar_close)

// If the trend changed to down, send a short alert with the initial stop value.
if trendToDn
    alert("Short alert. Stop @ " + stopStr, alert.freq_once_per_bar_close)

// If the stop value has progressed, send an alert to update the stop value.
if (trendUp and stop > stop[1] or not trendUp and stop < stop[1]) and not trendReversal
    alert('Update stop to ' + stopStr, alert.freq_once_per_bar_close)
```
See this section of the Alerts page for more information.
Example strategy alert
This example strategy places a market order with strategy.entry() and a stop-loss and take-profit (bracket) order with strategy.exit() when a 5-bar moving average crosses over a 10-bar moving average. The stop-loss price is 1% below the current close and the take-profit price is 2% above the close. Order fill alerts occur when the broker emulator fills an entry or exit order. Both order placement commands include unique alert_message arguments that combine placeholders and “string” representations of the limit and stop values to output details like the trade action, position size, chart symbol, and order prices:
```pinescript
//@version=6

// This annotation auto-populates the alert dialogue with the `alert_message` string.
// @strategy_alert_message {{strategy.order.alert_message}}

strategy("Alert message demo", overlay = true)

// Declare two moving averages to use for the entry condition.
float fastMa = ta.sma(close, 5)
float slowMa = ta.sma(close, 10)
// Declare two persistent variables that will hold our stop-loss and take-profit values.
var float limit = na
var float stop  = na

// If `fastMa` has crossed over `slowMa` and we are not already in a position,
// place an entry and exit order. 
//      • Set the `limit` to 2% above the close and the stop to 1% below.
//      • Use a combination of script variables and placeholders in the alert strings.
//      • The exit alert shows the order direction, position size, ticker, and order price.
//      • The entry alert includes the same values plus the stop and limit price.
if ta.crossover(fastMa, slowMa) and strategy.position_size == 0
    limit := close * 1.02
    stop  := close * 0.99
    string exitString  = "{{strategy.order.action}} {{strategy.position_size}} {{ticker}} @ {{strategy.order.price}}"
    string entryString = exitString + " TP: " + str.tostring(limit, format.mintick) + " SL: " + 
      str.tostring(stop, format.mintick)
    strategy.entry("Buy", strategy.long, alert_message = entryString)
    strategy.exit("Exit", "Buy", stop = stop, limit = limit, alert_message = exitString)

// Plot the moving averages, stop, and limit values on the chart.
plot(fastMa, "Fast Moving Average", color.aqua)
plot(slowMa, "Slow Moving Average", color.orange)
plot(strategy.position_size > 0 ? limit : na, "Limit", color.green, style = plot.style_linebr)
plot(strategy.position_size > 0 ? stop  : na, "Stop",  color.red,   style = plot.style_linebr)
```
For more information about order fill events, see this section of the Alerts page. To learn more about how strategy scripts work, see the Strategies page.
If I change my script, does my alert change?
No, not without creating a new alert.
When a user creates an alert using the “Create Alert” dialog box, that action saves a “snapshot” of the script, its inputs, and the current chart’s context on TradingView’s servers. This snapshot acts as an independent copy of the script instance and chart. Therefore, any changes to the script, its inputs, or the user’s chart do not affect that created alert. To update an alert after making changes, delete the existing alert and create a new one.
Why aren’t my alerts working?
Here are some common reasons why alerts might not work as expected, and how to solve them:
Make sure the alert is active and has not expired
Scripts that include alert triggers do not directly create alerts. Users must create alerts in the “Create Alert” dialog box, where they specify the “Condition” that triggers the alert and the “Expiration” time. Created alerts do not fire after they expire. See this Help Center article on Setting up alerts.
Check the alert logs
An alert can fire without a notification, depending on the alert’s settings. Check the logs in the alert manager to see whether an alert occurred. To set up notifications for an alert, use the options in the “Notifications” tab of the “Create/Edit Alert” dialog box.
Check for repainting
If an alert fires at a different time than expected, repainting might be the cause. Refer to the Repainting page for more information.
Limit the frequency of alerts
If more than 15 alerts occur within three minutes, the system automatically halts further alerts. This frequency limit helps prevent excessive notifications and potential server overload.
Debug script errors
If a script instance raises a runtime error at some point during its executions, alerts from that instance cannot fire because the error stops the script from continuing to execute its code. Some common issues that can halt alerts include:

Attempting to store more than 100,000 elements within a collection
Trying to access an item from a collection at an out-of-bounds index
Referencing historical values of a time series outside its allocated memory buffer
Using loops that take longer than 500 ms to complete their iterations

See this page for additional details about common error messages and troubleshooting tips.
Why is my alert firing at the wrong time?
Sometimes, alerts may fire when users do not expect according to what their script displays on the chart. Repainting is the typical cause of such issues.
A chart’s realtime and historical bars often rely on different data feeds. Data providers may retroactively adjust the reported values on realtime bars, which the displayed data reflects after users refresh their charts or restart their scripts. Such adjustments can cause discrepancies where a triggered alert’s timing may not align with the script’s output after reloading it.
Scripts may also behave differently on historical and realtime bars, which can lead to repainting. On historical bars, scripts execute once per bar close, whereas on realtime bars, where alerts fire, scripts execute once for each new tick from the data feed. Therefore, if a script behaves differently on those bars, users may see differences between its signals and triggered alerts after reloading the chart.
Below are some common repainting issues that can affect a script’s alerts:
Alerts firing before bar close
Most scripts have fluid data values that update after new ticks during an unconfirmed realtime bar and finalize after the bar closes. Consequently, an alert that fires on an open bar may not reflect the final state of the condition after the bar’s confirmation. Set the alert’s frequency to “Once Per Bar Close” to avoid this issue.
Using `calc_on_every_tick` in strategies
When a strategy script includes calc_on_every_tick = true in its declaration statement or the user selects the “On every tick” option in the “Recalculate” section of the strategy’s properties, it recalculates on every price update in the realtime data. This behavior can cause strategies to repaint because historical bars do not contain the same information as realtime bars. See this section of the Strategies page to learn more.
Incorrect usage of `request.security()` calls
Using request.security() calls to fetch data from alternative timeframes can cause discrepancies on historical bars that scripts cannot reproduce on realtime bars. Ensure you follow the best practices for non-repainting data requests to avoid such discrepancies, especially with higher-timeframe data. See the Avoiding repainting section of the Other timeframes and data page and the Higher-timeframe requests publication from PineCoders for more information.
Can I use variable messages with alertcondition()?
The message parameter of the alertcondition() function requires a “const string” argument, which cannot change after compilation. However, the “string” can include placeholders, which an alert substitutes with corresponding dynamic values from a script each time it fires.
The script below demonstrates two alertcondition() calls whose message arguments include placeholders for dynamic values. Each time alerts from these triggers occur, the message displays information about the current chart’s exchange, symbol, price, and volume:
```pinescript
//@version=6
indicator("Placeholder demo", overlay = false)

[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)
plot(macdLine,   "MACD",   color.blue)
plot(signalLine, "Signal", color.orange)
plot(histLine,   "Hist.",  color.red, style = plot.style_histogram)

bool crossUp = ta.crossover(macdLine,  signalLine)
bool crossDown = ta.crossunder(macdLine, signalLine)

alertcondition(crossUp, "MACD Cross Up",   "MACD cross up on {{exchange}}:{{ticker}}\nprice = {{close}}\nvolume = {{volume}}")
alertcondition(crossDown, "MACD Cross Down", "MACD cross down on {{exchange}}:{{ticker}}\nprice = {{close}}\nvolume = {{volume}}")
```
How can I include values that change in my alerts?
The method for including dynamic values in alert messages varies with the type of alert trigger:

The alertcondition() function accepts a “const string” message argument that can contain placeholders for dynamic values. See Can I use variable messages with `alertcondition()`? for more information.
The alert() function accepts “series string” message arguments, which allows the convenient creation of dynamic messages that use a script’s calculated values. See this section for an example.
Order fill alerts can use “series string” values and placeholders. Refer to the example here.

How can I get custom alerts on many symbols?
To manage alerts across multiple symbols using a custom script, one option is to set an individual alert on each symbol. There is no automated method to set the same alert across many symbols simultaneously in a single action. It’s also important to note that the TradingView screener uses built-in filters and does not support custom Pine Script® code.
Scripts can retrieve data from other contexts (symbols, timeframes, and modifiers such as non-standard chart calculations and extended sessions) using the functions in the request namespace. With these functions, programmers can design scripts that retrieve data from up to 40 or 64 unique contexts, depending on their plan. Search for “screener” in the Community scripts for in-depth examples.
Here is an example incorporating three symbols. The checkForAlert() function calls request.security() to fetch data from a specified context and evaluate the user-defined checkForRsiConditions() function using that data. Then, the function calls alert() using the result to create an alert trigger. The script calls this function three times, creating distinct alert triggers for each specified symbol:

```pinescript
//@version=6
indicator("Screener demo", overlay = true)

// Declare inputs for the alert symbols and the timeframe to run the alerts on. The default is the current chart timeframe.
string tfInput      = input.timeframe("", "Timeframe")
string symbol1Input = input.symbol("BINANCE:ETHUSDT", "Symbol 1")
string symbol2Input = input.symbol("BINANCE:BATUSDT", "Symbol 2")
string symbol3Input = input.symbol("BINANCE:SOLUSDT", "Symbol 3")

// @function    Generates alert messages for RSI crossing over or under 50, and crosses of price and the 50 EMA.
// @returns     (string) Formatted alert messages with values for each crossover and crossunder event.
checkForRsiConditions() =>
    float  rsi = ta.rsi(close, 14)
    float  ema = ta.ema(close, 50)
    string alertMessage = ""
    if ta.crossover(rsi, 50)
```
        alertMessage += str.format("RSI ({0}) crossed over 50 for {1} on {2} timeframe.\n", rsi, syminfo.ticker, timeframe.period)
    if ta.crossunder(rsi, 50)
        alertMessage += str.format("RSI ({0}) crossed under 50 for {1} on {2} timeframe.\n", rsi, syminfo.ticker, timeframe.period)
    if ta.crossover(close, ema)
        alertMessage += str.format("Crossover of 50 EMA for {0} on {1} timeframe. Price is {2}", syminfo.ticker, timeframe.period, close)
    if ta.crossunder(close, ema)
        alertMessage += str.format("Crossunder of 50 EMA for {0} on {1} timeframe. Price is {2}", syminfo.ticker, timeframe.period, close)

// @function        Calls the `checkForRsiConditions()` function for the provided symbol and timeframe. 
//                      Triggers an alert if the function returns a message.
// @param symbol    (simple string) The symbol to check.
// @param tf        (simple string) The timeframe to check.
// @param freq      (const string) The frequency of the alert. Optional. Default is `alert.freq_once_per_bar`.
// @returns         (void) The function has no explicit return, but triggers an alert with the message if the
//                          conditions defined within the `checkForRsiConditions()` function are met.
checkForAlert(simple string symbol, simple string tf, const string freq = alert.freq_once_per_bar) =>
    string msg = request.security(symbol, tf, checkForRsiConditions())
    if msg != msg[1] and str.length(msg) > 0
        alert(msg, freq)

// Check for alerts on the input symbols and timeframe.
checkForAlert(symbol1Input, tfInput)
checkForAlert(symbol2Input, tfInput)
checkForAlert(symbol3Input, tfInput)
// Add calls for additional symbols up to your plan's limit...
Note that:

A script can execute up to 40 unique request.*() calls, or up to 64 if the user has the Ultimate plan. A request.*() call is typically not unique if a script already calls the same function with the same arguments. See the request.*() calls section of the Limitations page for more information.
This script uses the alert() function because alertcondition() is not allowed within local scopes.

How can I trigger an alert for only the first instance of a condition?
Firing an alert only on its first occurrence can help avoid redundant notifications and isolate specific conditions or state changes, which is beneficial in several use cases. For instance, if a user relies on alerts to automate order placement, restricting redundant alerts to their first occurrence can help avoid accidentally placing excessive orders.
For alerts with alertcondition() triggers, setting them to fire once using the “Only Once” option in the “Create Alert” dialog box is not an optimal solution because it requires manual reactivation each time an alert occurs. Alerts from the alert() function do not have an “Only Once” frequency option. The programmer must use conditional logic to ensure the call executes at the appropriate time.
There are two primary ways to code repeating alerts that fire on only the first instance of a condition:
Using stricter criteria
Rather than relying on a continuous condition like close > ma, which may remain true for multiple consecutive bars, try using a more strict condition like ta.crossover(close, ma). For simple cases, this is the easiest method.
Using state control
More complex scenarios might require controlling and tracking states, which entails setting flags or specific values to signify certain conditions.
The example script below manages separate bullish and bearish states, and it colors the background to represent each state. When a bullish or bearish state first occurs, an alert() call executes and the script plots a triangle on the chart. It also plots smaller triangles to show where other signals occur within a state, which do not trigger additional alerts:
// 
```pinescript
//@version=6
indicator("Single alert demo", overlay = true)

// ————— Calculations: Determine highest/lowest values over last `lengthInput` bars.
int   lengthInput = input.int(20, "Length")
float highest     = ta.highest(lengthInput)
float lowest      = ta.lowest(lengthInput)
// ————— Trigger conditions: Define bull and bear signals. Bull signal is triggered by a new high, and bear by a new low.
bool bullSignal = high == highest
bool bearSignal = low  == lowest
// ————— State change flags: Set true on state transition bars only.
bool changeToBull = false
bool changeToBear = false
// ————— State tracking: `isBull` is set to true for bull state, false for bear. It's set only at the initial switch to the opposite condition.
// This variable's state is retained from bar to bar because we use the `var` keyword to declare it.
var bool isBull = false
// ————— State transitions: Allow a switch from bull to bear or bear to bull; ignore repeated signals in current state.
// Set the state change flags to true only on the first bar where a new signal appears.
if bullSignal and not isBull
    isBull       := true
    changeToBull := true
else if bearSignal and isBull
    isBull       := false
    changeToBear := true

// Plot highest and lowest values.
plot(highest, "Highest", color.new(color.green, 80), 2)
plot(lowest,  "Lowest",  color.new(color.red,   80), 2)
// Background color: Green for bull, none for bear.
bgcolor(isBull ? color.new(color.green, 90) : na)
// State change markers: Display "ALERT" text on bars where a state change occurs and an alert would trigger.
plotchar(changeToBull, "Change to Bull state", "▲", location.belowbar, color.new(color.lime, 30), size = size.small, text = "BULL\nALERT")
plotchar(changeToBear, "Change to Bear state", "▼", location.abovebar, color.new(color.red,  30), size = size.small, text = "BEAR\nALERT")
// Signal markers: Display for repeated signals within the current state.
// These signals would trigger redundant alerts if not for the state tracking flag preventing them.
plotchar(bullSignal and not changeToBull, "Bull signal", "▲", location.belowbar, color.green,  size = size.tiny)
plotchar(bearSignal and not changeToBear, "Bear signal", "▼", location.abovebar, color.maroon, size = size.tiny)

// Alerts: Trigger on state changes only.
if changeToBull
    alert("Change to bull state")
if changeToBear
    alert("Change to bear state")
```
How can I run my alert on a timer or delay?
It is possible to program logic to delay alert triggers so that they occur after the initial condition. However, because Pine scripts execute on realtime bars only after new price updates, and an alert only fires when a script executes, it is difficult to predict the exact time of a delayed alert.
There are no price updates in a closed market, meaning an alert with a delay will not fire until the market opens again. Similarly, thinly traded securities may have very infrequent price updates in unpredictable intervals, which can cause a larger delay than intended.
The Pine script below implements a time-delayed alert, which is subject to the limitations above. When the current close is higher than a moving average, a delay counter starts. After the delay passes, the alert fires once, and another alert cannot fire until the timer resets. Users can specify whether the timer resets on each bar using the script’s resetInput:

```pinescript
//@version=6
indicator("Delayed alert demo", overlay = true)

import PineCoders/Time/4 as PCtime

string TIME_TT  = "The delay's duration and units. This specifies the continuous duration for which the condition must be true before triggering the alert."
string RESET_TT = "When checked, the duration will reset every time a new realtime bar begins."
```
enum TimeUnit
    seconds
    minutes
    hours

int    durationInput = input.int(20,     "Condition must last",     minval  = 1,       inline = "00")
TimeUnit timeUnitInput = input.enum(TimeUnit.seconds, "", inline="00")
bool   resetInput    = input.bool(false, "Reset timing on new bar", tooltip = RESET_TT)
int    maLengthInput = input.int(9,      "MA length")

// Calculate and plot a SMA with `maLengthInput` length.
float ma = ta.sma(close, maLengthInput), plot(ma, "MA")
// Check whether the close is greater than the SMA.
bool cond = close > ma
// Time the duration for which the condition has been true.
int secSince = PCtime.secondsSince(cond, resetInput and barstate.isnew)
// Check if the duration is greater than the input timer.
bool timeAlert = secSince > (PCtime.timeFrom("bar", durationInput, str.tostring(timeUnitInput)) - time) / 1000
// Format a time string for the timer label.
string alertTime = str.format_time(secSince * 1000, "mm:ss")

// Set the contents for the label depending on the stage of the alert timer.
string alertString = switch
    timeAlert => "Timed Alert Triggered\n\n" + alertTime
    cond      => "Condition Detected...\n\nTimer count\n" + alertTime
    =>           "Waiting for condition..."

// Display alert timer using a label.  Declare a basic label once and update location, color, and text on the last bar for efficiency.
if barstate.islast
    var label condTime = label.new(na, na, yloc = yloc.abovebar, style = label.style_label_lower_left, textcolor = chart.fg_color)
    label.set_x(condTime, bar_index)
    label.set_text(condTime, alertString)
    label.set_color(condTime, color.new(timeAlert ? color.green : cond ? color.orange : color.red, 50))

// Create a flag to ensure alert is triggered only once each time the delay timer is exceeded.
varip bool isFirstOccurrence = true
// Fire alert if timer is triggered.
if timeAlert and isFirstOccurrence
    alert(str.format("{0} {1} Delayed Alert Triggered", durationInput, str.tostring(timeUnitInput)), alert.freq_all)

// Toggle the flag to `false` when alert triggers, and reset when the condition clears.
isFirstOccurrence := not timeAlert
Note that:

The secondsSince() function from the PineCoders’ time library determines the duration, in seconds, for which a certain condition remains continuously true. The duration can be tracked within bars because it uses the varip keyword.
The timing starts when the condition first becomes true. If the condition becomes false or an optional resetting condition occurs, the timer restarts. If “Reset timing on new bar” is enabled in the “Settings/Inputs” tab, the function restarts its timing at the start of a new bar.
A colored label shows what state the script is in:

Red - The condition has not occurred yet.
Orange - The condition occurred and the delay timer is active.
Green - The timer has surpassed the set duration, simulating a delayed alert.

This script relies on variables declared with the varip keyword, which do not revert to their last committed states during realtime bar calculations. See this section of the User Manual to learn more about using this keyword. To learn about how rollback works, see the Execution model page.
How can I create JSON messages in my alerts?
Alerts can send messages containing JavaScript Object Notation (JSON) to webhooks. Pine Script does not include any built-in functions to produce JSON, but programmers can create JSON messages in Pine by constructing “string” representations.
When constructing JSON representations, ensure the keys and values intended as strings in the JSON-formatted text use double quotes, not single quotes.
The following example shows three ways to construct JSON strings in Pine Script:

Static JSON Strings
Define separate alerts with predefined JSON-formatted strings. This method is the simplest.

Placeholders
Use placeholders in the alert message, such as {{close}} and {{volume}}, to add dynamic values to the JSON. The alert instance replaces the placeholders with corresponding values when it fires. This method can create richer alerts, especially for strategies, which have extra placeholders for their calculated values. See this section above for an example.

Dynamic strings
Use the functions in the str.*() namespace and “string” concatenation to create dynamic JSON-formatted text. This method is the most customizable and advanced. Our script below shows a simple, straightforward example of this approach. When using dynamic string formatting to construct JSON strings, ensure the resulting JSON is valid for all the combined values.

```pinescript
//@version=6
indicator("JSON example", overlay = true)

// Define EMA cross conditions to trigger alerts, and plot the ema on the chart.
float ema = ta.ema(close, 21)
bool crossUp    = ta.crossover(close, ema)
bool crossDown  = ta.crossunder(close, ema)
plot(ta.ema(close, 21))

// ————— Method 1 - Separate alerts with static messages.
string alertMessage1a = '{"method": 1, "action": "buy", "direction": "long", "text": "Price crossed above EMA"}'
string alertMessage1b = '{"method": 1, "action": "sell", "direction": "short", "text": "Price crossed below EMA"}'
alertcondition(crossUp,     "Method 1 - Cross up",   alertMessage1a)
alertcondition(crossDown,   "Method 1 - Cross down", alertMessage1b)

// Rendered alert:
// {
//     "method": 1,
//     "action": "buy",
//     "direction": "long",
//     "text": "Price crossed above EMA"
// }

// ————— Method 2 - Using placeholders for dynamic values.
string alertMessage2 = '{"method": 2, "price": {{close}}, "volume": {{volume}}, "ema": {{plot_0}}}'
alertcondition(crossUp, "Method 2 - Cross Up", alertMessage2)

// Rendered alert:
// {
//     "method": 2,
//     "price": 2066.29,
//     "volume": 100.859,
//     "ema": 2066.286
// }

// ————— Method 3 - String concatenation using dynamic values.
string alertMessage3 =
```
 '{"method": 3, "price": ' + str.tostring(close) + ', "volume": ' + str.tostring(volume) + ', "ema": ' + str.tostring(ema) + '}'
if crossUp
    alert(alertMessage3, alert.freq_once_per_bar_close)

// Rendered alert:
// {
//     "method": 3,
//     "price": 2052.27,
//     "volume": 107.683,
//     "ema": 2052.168
// }
Before using the JSON-formatted string in alerts for real-world applications, such as sending messages to place orders, test and validate the JSON message to ensure it works as intended:

Send alerts to an email address to see how the JSON message appears.
Copy the alert message from the email into an online JSON validation tool.
Use an API client application to check the server response to the request.

Refer to this Wikipedia page to learn more about JSON format. To learn more about how alerts send information using webhooks, see the Help Center article on webhooks.
How can I send alerts to Discord?
Sending alerts from a Pine script to a Discord chat room is possible using webhooks.
The message for Discord communication requires JSON format. The minimum requirement for a valid message is {"content": "Your message here"}.
The script example below uses placeholders to dynamically populate alert messages with script values, including the new high or low price, and the chart’s symbol and timeframe:

```pinescript
//@version=6
indicator("Discord demo", overlay = true)
// Calculate a Donchian channel using the TV ta library.
import TradingView/ta/7 as TVta
int lengthInput = input.int(10, "Channel length")
[highest, lowest, middle] = TVta.donchian(lengthInput)
// Create conditions checking for a new channel high or low.
bool isNewHi = high > highest[1]
bool isNewLo = low  <  lowest[1]
// Plot the Donchian channel and fill between the midpoint and the upper and lower halves.
hi  = plot(highest, "Channel high", color.new(color.fuchsia, 70))
mid = plot(middle,  "Channel mid.", color.new(color.gray,    70))
lo  = plot(lowest,  "Channel low",  color.new(color.lime,    70))
fill(mid, hi, color.new(color.fuchsia, 95))
fill(mid, lo, color.new(color.lime,    95))
// Plot shapes to mark new highs and lows to visually identify where alert trigger conditions occur.
plotshape(isNewHi, "isNewHi", shape.arrowup,   location.abovebar, color.new(color.lime,    70))
plotshape(isNewLo, "isNewLo", shape.arrowdown, location.belowbar, color.new(color.fuchsia, 70))
// Create two alert conditions, one for new highs, and one for new lows.
// Format the message for Discord in the following JSON format: {"content": "Your message here"}
alertcondition(isNewHi, "New High (Discord Alert Demo)", '{"content": "New high ({{high}}) on {{ticker}} on {{interval}} chart!"}')
alertcondition(isNewLo, "New Low  (Discord Alert Demo)", '{"content": "New low ({{low}}) on {{ticker}} on {{interval}} chart!"}')
// The following test alert condition fires immediately. Set this alert frequency to "Only Once".
alertcondition(true, "Test (Discord Alert Demo)", '{"content": "This is a test alert from TradingView to Discord."}')
```
To send these alert messages to Discord, follow these steps:
1. Create a Discord webhook

Create a new webhook in a server using an account with webhook creation and management permissions. Refer to Discord’s Intro to Webhooks article for instructions.
Copy the Webhook URL. This URL represents the address where the alert sends a POST request.

2. Set up an alert on TradingView

Add the above “Discord demo” script to a chart and open the “Create Alert” dialog box.
Choose one of the script’s alert conditions as the “Condition” in the dialog. If you select the “New High” or “New Low” alerts, choose the “Once Per Bar Close” option in the “Frequency” field to avoid triggering alerts for new highs or lows on an unconfirmed bar. When using the “Test” alert, choose “Only Once” as the “Frequency” option.
In the “Notifications” tab of the “Create Alert” dialog, select “Webhook URL” and paste the URL of the Discord webhook.

3. Test the integration

Check that alerts appear in the alert log on TradingView.
Use the “Test” alert to check whether the webhook works as expected. After the alert fires, check your Discord to see if it received the message.
If the alert message does not appear in Discord, check whether the pasted webhook URL is correct.
If the message does not display correctly in Discord, check the JSON format. The minimum required format is {"content": "Your message here"}.

Consult Discord’s Webhook Resource to learn about advanced JSON message configurations.
For more information about dynamic values in alert messages, refer to How can I include values that change in my alerts?.
To learn about using JSON format in script alerts, see How can I create JSON messages in my alerts?.
How can I send alerts to Telegram?
Sending TradingView alerts directly to Telegram is challenging due to protocol differences and formatting requirements. One solution is to use an intermediary service, which receives webhook alerts from TradingView, formats them as required by Telegram, and then forwards them to a Telegram bot.

Choose a platform like Zapier, Integromat, or Pipedream. Alternatively, programmers can consider developing a custom server script using Node.js or Python.
In TradingView, set up alerts to send webhook requests to the intermediary service’s provided URL.
Configure the intermediary service to reformat TradingView’s incoming requests for Telegram’s API and send the formatted message to a Telegram bot using the sendMessage method.

See the Telegram Bot API documentation for detailed technical information.         Previous       General      Next   Data structures              On this pageHow do I make an alert available from my script?How are the types of alerts different?UsabilityOptions for creating alertsHow alerts activateMessagesLimitationsExample alertcondition() alertExample alert() alertExample strategy alertIf I change my script, does my alert change?Why aren’t my alerts working?Why is my alert firing at the wrong time?Can I use variable messages with alertcondition()?How can I include values that change in my alerts?How can I get custom alerts on many symbols?How can I trigger an alert for only the first instance of a condition?How can I run my alert on a timer or delay?How can I create JSON messages in my alerts?How can I send alerts to Discord?How can I send alerts to Telegram?