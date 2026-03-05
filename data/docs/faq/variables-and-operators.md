# Variables and operators

What is the variable name for the current price?
In Pine Script®, the close variable represents the current price. It provides the closing price of each historical bar, and, for indicator scripts, the current price of the most recent realtime bar. The close value of an open bar can change on each tick to reflect the latest price.
Strategy scripts usually execute only once on each historical and realtime bar, at the bar close. Consequently, during a realtime bar, the close variable holds the previous bar’s closing price. However, if a script sets the calc_on_every_tick parameter of the strategy() declaration statement to true, the strategy executes with each price change of the realtime bar, like indicators do. As a result, close holds the latest realtime price update.
To reference the closing price of the previous bar, use close[1]. Learn more about using square brackets to reference previous values in the history-referencing operator section.
Why declare variables with the ​var​ keyword?
The var keyword is useful for storing data across multiple bars. By default, the value assigned to a variable is reset and calculated again on each new bar. This process is called rollback.
If a script declares a variable with the var keyword, this persistent variable is initialized only once. Variables declared in the global scope are initialized on the first bar. Variables declared in a local block are initialized the first time that the local block executes. After its initial assignment, a persistent variable maintains its last value on subsequent bars until it is reassigned a new value.
In the example below, we demonstrate how to accumulate volume across bars, comparing an ordinary and a persistent “float” variable.
```pinescript
//@version=6
indicator("Var keyword example")

// Declare and initialize a persistent variable by using `var`.
var float a = 0
// Declare and initialize a normal float variable.
float b = 0

// Reset the values of a and b whenever a new day begins.
if timeframe.change("D")
    a := 0
    b := 0

// Add the current volume to both a and b.
```
a += volume
b += volume

// Plot the values of `a` and `b`. The value of `a` accumulates over time; `b` is reinitialized at every bar.
plot(a, "a", close > open ? #089981 : #f23645, style = plot.style_columns)
plot(b, "b", color.yellow)
What is ​varip​ used for?
The varip keyword declares variables whose values persist within the same realtime bar. This contrasts with the typical mode of Pine’s execution model, where variables are reset to their last committed value with each realtime script execution, potentially many times in each bar.
Recall that the var keyword allows a variable to retain its value from bar to bar — however, the value still resets on each script execution within a bar. The varip keyword takes this persistence a step further and escapes the rollback process, or re-initialization, on each price update within the same realtime bar.
As a result, varip (which stands for “variable intrabar persist”) variables can perform calculations that span across executions in the same bar. For example, they can track the number of realtime updates that occur within a realtime bar.
It’s important to note that varip only affects the behavior of code on realtime bars, not historical ones. Therefore, backtest results on strategies based on varip variables might not accurately reflect the behavior of those historical bars. Similarly, calculations on historical bars won’t reproduce the script’s realtime behavior.
To distinguish between var and varip, add the following script to a live market symbol. With realtime updates, the varip plot increments within a bar on each price update, whereas the var plot stays constant within a bar:

```pinescript
//@version=6
indicator("varip vs var demo")

// `var`  : Retains value across bars, resets on intrabar price updates.
// 'varip': Retains value across bars and across intrabar price updates within a realtime bar.
var   int varCount   = -1
varip int varipCount = -1

// Increment `varCount` on each bar and `varipCount` on each intrabar price update.
```
varCount   += 1
varipCount += 1

// Plot values for comparison.
plot(varCount,   "var counter",   color.fuchsia, 4)
plot(varipCount, "varip counter", color.lime)
Note that:

Both plots in the above script are the same for historical bars, because there are no intrabar updates on historical bars.

What’s the difference between ​==​, ​=​, and ​:=​?
The = operator declares and initializes variables, assigning a specific value to a named variable. For example, a = 0 sets the
variable a to hold the value 0.
The := property reassigns values to existing variables. For instance, if a script declared int a = 1, a subsequent line a := 2 updates the value of a to 2, which is possible because integer variables are mutable, or changeable.
Finally, the == operator is a comparison operator. It checks the equality between two values, returning a Boolean (true/false) result. For instance, a == b is true if a and b hold the same value. The opposite operator is !=, which is true if the two variables are not equal.
The following script initializes two variables a and b, reassigs a, and then performs and plots equality comparisons.
```pinescript
//@version=6
indicator("Variable operators demo", overlay = true)

// Define two variables `a` and `b` using `=`, representing the high and low of each bar.
float a = high
float b = low

// Define the initial line color as lime
color lineColor = color.lime

// When there are fewer than 10 bars left on the chart,  use `:=` to update `a` to `b` and change the line color.
if last_bar_index - bar_index < 10
    a := b
    lineColor := color.fuchsia

// Plot the variable 'a' to visualize its change in value. 
// Initially, 'a' represents the 'high' of each bar. 
// If there are fewer than 10 bars remaining in the chart, 'a' is updated to represent the 'low' of each bar.
plot(a, "Our line", lineColor, 2)

// Plot a checkmark character whenever `a` is equal to `b`.
plotchar(a == b, "a equals b", "✅", location.bottom)

// Plot a cross character whenever `a` is not equal to `b`.
plotchar(a != b, "a does not equal b", "❌", location.bottom)
```
Can I use the ​:=​ operator to assign values to past values of a series?
Historical values are fixed and cannot be changed. Just as we can’t alter the past in real life, scripts are unable to modify historical values in a series, because they are read-only.
For example, the following script generates an error:
```pinescript
//@version=6
indicator("Changing historical values demo", overlay = true)
// Initialize a variable to hold the value of the current bar's high.
```
series float a = high
// Reassign the *previous* value of the series `a` to hold the low of the current bar.
a[1] := low  // This line causes a compilation error.
plot(a, color = chart.fg_color, linewidth = 3)
However, scripts can assign or reassign a value to the current instance of a series, and assign a historical value of a series to a variable. The following version of our script works without error.
```pinescript
//@version=6
indicator("Changing historical values demo", overlay = true)
// Initialize a variable to hold the value of the current bar's high.
```
series float a = high
// Reassign the *current* value of the series `a` to hold the high of the *previous* bar.
a := high[1]
plot(a, color = chart.fg_color, linewidth = 3)
Why do the OHLC built-ins sometimes return different values than the ones shown on the chart?
The OHLC (Open, High, Low, Close) values displayed on the chart and the values returned by the built-in OHLC variables
open,
high,
low,
close can differ.
This is because data feeds can contain price points that exceed a symbol’s defined tick precision. While visually, chart prices are always rounded to tick precision, the built-in variables maintain their original, unrounded values.
For instance, if an exchange feed provides a closing price of 30181.07, which is more precise than the symbol’s 0.1 tick size, the chart displays a rounded value of 30181.1, whereas the built-in variable holds the unrounded value of 30181.07.
Subtle differences, while not immediately obvious, can lead to significant outcomes, especially in scripts requiring precise calculations or when diagnosing unexpected behaviors in scripts. An example of this is in detecting crossover events. Discrepancies between unrounded and rounded values can cause scripts to identify crossover events in one scenario but not in the other.
One way to mitigate this issue is to round the OHLC built-in variables to the nearest tick size before using them in calculations. The script below highlights discrepancies between actual OHLC values and their rounded counterparts, visually indicating any differences by coloring the background red:

```pinescript
//@version=6
indicator("Different tick values example", overlay = true, precision = 10)

// @function Rounds each OHLC value to the nearest minimum tick size.
// @returns  A tuple containing the rounded values.
OHLCToMinTick() =>
    [math.round_to_mintick(open), math.round_to_mintick(high), math.round_to_mintick(low), math.round_to_mintick(close)]

//@function Checks whether two float values are equal or not.
//@param    v1 (series float) The first value to compare.
//@param    v2 (series float) The second value to compare.
//@returns  The color blue if the values are equal or red otherwise.
getTickColor(series float v1, series float v2) =>
    color result = v1 != v2 ? color.red : color.blue

// Round each OHLC value to the nearest mintick size.
[o, h, l, c] = OHLCToMinTick()

// Plot the original and rounded values of each OHLC component in the data window.
// If a value and its rounded counterpart are not equal, color the plot red. Otherwise, color it blue.
plot(o,     "o",     getTickColor(o, open),  display = display.data_window)
plot(open,  "open",  getTickColor(o, open),  display = display.data_window)
plot(h,     "h",     getTickColor(h, high),  display = display.data_window)
plot(high,  "high",  getTickColor(h, high),  display = display.data_window)
plot(l,     "l",     getTickColor(l, low),   display = display.data_window)
plot(low,   "low",   getTickColor(l, low),   display = display.data_window)
plot(c,     "c",     getTickColor(c, close), display = display.data_window)
plot(close, "close", getTickColor(c, close), display = display.data_window)

// If any of the original and rounded values of OHLC components are not equal, set the background color to red.
bgcolor(o != open or h != high or l != low or c != close ? color.new(color.red, 90) : na)
```
Why do some logical expressions not evaluate as expected when ​na​ values are involved?
In Pine Script, every type of variable can take an na value — except Boolean variables, which can only be true or false. Here, na stands for “not available”, and signifies the absence of a value, similar to NULL in other programming
languages.
Although Boolean values themselves cannot be na, logical expressions that evaluate to true or false can depend on variables of other types that can be na.
This behavior can cause unexpected outcomes because any valid logical comparison that includes na values always returns false.
The following example script evaluates a single comparison where one value is always na. The user can choose which comparison to evaluate from a set. A label displays the chosen comparison and its result.
```pinescript
//@version=6
indicator("`na` example")
string conditionInput = input.string("a != b", "Condition", options=["a != b","a == b", "a > b", "a < b"])
int a = 1
int b = na
bool condition = switch conditionInput
```
    "a != b" => a != b
    "a == b" => a == b
    "a > b"  => a > b
    "a < b"  => a < b

if barstate.islastconfirmedhistory
    string conditionText = condition ? "true" : "false"
    label.new(
      x = bar_index,
      y = high,
      text = "a = 1\nb = na\n" + conditionInput + ": " + conditionText,
      color = condition ? color.green : color.red,
      textcolor = color.new(chart.fg_color, 0),
      style = label.style_label_down,
      size = size.large
      )
To avoid unwanted false negatives, write code that checks for na values and, if necessary, replaces them. For a discussion of na values and how to manage them, see the ​na​ value section of the User Manual.         Previous       Times, dates, and sessions      Next   Visuals              On this pageWhat is the variable name for the current price?Why declare variables with the var keyword?What is varip used for?What’s the difference between ==, =, and :=?Can I use the := operator to assign values to past values of a series?Why do the OHLC built-ins sometimes return different values than the ones shown on the chart?Why do some logical expressions not evaluate as expected when na values are involved?