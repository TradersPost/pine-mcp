# Script structure

A Pine script follows this general structure:
<version><declaration_statement><code>
Version
A
compiler annotation in the following form tells the compiler which of the
versions of Pine Script® the script is written in:
```pinescript
//@version=6
```
The version number is a number from 1 to 6.
The compiler annotation is not mandatory. When omitted, version 1 is
assumed. It is strongly recommended to always use the latest version
of the language.
While it is synctactically correct to place the version compiler
annotation anywhere in the script, it is much more useful to readers
when it appears at the top of the script.

Notable changes to the current version of Pine Script are documented in
the Release notes.
Declaration statement
All Pine scripts must contain one declaration statement, which is a call
to one of these functions:

```pinescript
indicator()
strategy()
library()
```
The declaration statement:

Identifies the type of the script, which in turn dictates which
content is allowed in it, and how it can be used and executed.
Sets key properties of the script such as its name, where it will
appear when it is added to a chart, the precision and format of the
values it displays, and certain values that govern its runtime
behavior, such as the maximum number of drawing objects it will
display on the chart. With strategies, the properties include
parameters that control backtesting, such as initial capital,
commission, slippage, etc.

Each script type has distinct basic requirements. Scripts that do not meet these criteria cause a compilation error:

Indicators must call at least one function that creates a script output, such as plot(), plotshape(), barcolor(), line.new(), log.info(), alert(), etc.
Strategies must call at least one order placement command or other output function.
Libraries must export at least one user-defined function, method, type, or enum.

Code
Lines in a script that are not
comments
or
compiler annotations are statements, which implement the script’s algorithm. A
statement can be one of these:

variable declaration
variable reassignment
function definition
built-in function call,
user-defined function call or
a library function call
if,
for,
while,
switch,
type, or
enum
structure.

Statements can be arranged in multiple ways:

Some statements can be expressed in one line, like most variable
declarations, lines containing only a function call or single-line
function declarations. Lines can also be
wrapped (continued on multiple lines). Multiple one-line
statements can be concatenated on a single line by using the comma
as a separator.
Others statements such as structures or multiline function
definitions always require multiple lines because they require a
local block. A local block must be indented by a tab or four
spaces. Each local block defines a distinct local scope.
Statements in the global scope of the script (i.e., which are not
part of local blocks) cannot begin with white space (a space or a
tab). Their first character must also be the line’s first
character. Lines beginning in a line’s first position become by
definition part of the script’s global scope.

A simple valid Pine Script indicator can be generated in the Pine
Script Editor by using the “Open” button and choosing “New blank
indicator”:
```pinescript
//@version=6
indicator("My Script")
plot(close)
```
This indicator includes three local blocks, one in the barIsUp() function
declaration, and two in the variable declaration using an
if
structure:
```pinescript
//@version=6

indicator("", "", true)    // Declaration statement (global scope)

barIsUp() =>    // Function declaration (global scope)
```
    close > open    // Local block (local scope)

plotColor = if barIsUp()  // Variable declaration (global scope)
    color.green     // Local block (local scope)
else
    color.red       // Local block (local scope)

bgcolor(color.new(plotColor, 70))   // Call to a built-in function  (global scope)
You can bring up a simple Pine Script strategy by selecting “New
blank strategy” instead:
```pinescript
//@version=6
strategy("My Strategy", overlay=true, margin_long=100, margin_short=100)

longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))
if (longCondition)
    strategy.entry("My Long Entry Id", strategy.long)

shortCondition = ta.crossunder(ta.sma(close, 14), ta.sma(close, 28))
if (shortCondition)
    strategy.entry("My Short Entry Id", strategy.short)
```
Comments
Double slashes (//) define comments in Pine Script. Comments can
begin anywhere on the line. They can also follow Pine Script code on
the same line:
```pinescript
//@version=6
indicator("")
// This line is a comment
a = close // This is also a comment
plot(a)
```
The Pine Editor has a keyboard shortcut to comment/uncomment lines:
ctrl + /. You can use it on multiple lines by highlighting them
first.
Line wrapping
Scripts can use line wrapping to define a long single line of code across multiple lines. Generally, each wrapped line after the first can use any indentation length except multiples of four, because Pine uses four-space or tab indentations to define local code blocks.
For example, consider the following line of code:
float x = open + high + low + close
We can distribute any part of this single line of code across two or more lines. Within a wrapped statement or expression, the subsequent lines can use different indentation lengths, and can also include comments without disrupting the code:
float x = open +
  high +           // Indented by 2 spaces.
     low +         // Indented by 5 spaces.
          close    // Indented by 10 spaces.
If parts of a wrapped expression are enclosed in parentheses ( ), such as function calls or parameter declarations, the wrapped lines within the parentheses do not have any restriction on their indentation lengths. Therefore, those wrapped lines can use any indentation length including multiples of four.
For example, this script demonstrates various ways that expressions enclosed in parentheses can wrap across multiple lines:
```pinescript
//@version=6
indicator("Line wrapping within parentheses demo")

// We can enclose operations in parentheses to wrap them across multiple lines using a four-space indentation.
float x = (open +
```
    high +              
    low +          
    close)

// We can wrap a long function call across two lines, for a minimal line wrapping style.
plot(ta.sma(close, 14), title = "Avg close", color = color.new(color.purple, 70), style = plot.style_area,
 force_overlay = true, display = display.all - display.status_line)     // Indented by one space.

// We can also wrap a long function call across multiple lines, each with different indentation lengths.
// The parentheses enclosing the wrapped lines can start and end on separate lines than the wrapped content.
plot(
 series = x, title = "Sum OHLC",                              // Indented by one space.
   color = (x >= x[1] ? color.green : color.red),             // Indented by three spaces.
    linewidth = 4,                                            // Indented by four spaces.
        style = plot.style_stepline                           // Indented by eight spaces.
)                                                             // No indentation.
Expressions inside local code blocks can also use line wrapping. A local block requires indenting each line that belongs to its scope by four spaces or a tab relative to the local block’s header. Therefore, we recommend indenting any wrapped lines inside local blocks by a larger indentation than that of the block’s scope for readability. For example:
upDown(float s) =>
    // These lines are indented by four spaces relative to the `upDown()` function header to belong to its local scope.
    var int ud = 0
    bool isEqual   = s == s[1]
    bool isGrowing = s > s[1]
    // Within the local block, this statement wraps across multiple lines, where each line uses   
    // an indentation length that is larger than the indentation that signifies the local block's scope.  
    ud := isEqual ?
           0 :
           isGrowing ?
               (ud <= 0 ?
                    1 :
                    ud + 1) :
               (ud >= 0 ?
                    -1 :
                    ud - 1)
Compiler annotations
Compiler annotations are
comments
that issue special instructions for a script:

//@version= specifies the PineScript version that the compiler
will use. The number in this annotation should not be confused with
the script’s version number, which updates on every saved change
to the code.
```pinescript
//@description sets a custom description for scripts that use the
library()
```
declaration statement.
```pinescript
//@function, //@param and //@returns add custom descriptions
for a user-defined function or method, its parameters, and its result when placed above the function declaration.
//@type adds a custom description for a user-defined type (UDT) when placed
```
above the type declaration.
//@enum adds a custom description for an enum types when placed above the enum declaration.
//@field adds a custom description for the field of a user-defined type (UDT) or an enum types when placed above the type or enum declaration.
```pinescript
//@variable adds a custom description for a variable when placed
```
above its declaration.
//@strategy_alert_message provides a default message for strategy
scripts to pre-fill the “Message” field in the alert creation
dialog.

The Pine Editor also features two specialized annotations, //#region and //#endregion, that create collapsible code regions.
Clicking the dropdown arrow next to a //#region line collapses all the code between that line and the nearest //#endregion annotation
below it.
This example draws a triangle using three interactively selected points on the chart.
The script illustrates how one can use compiler and Editor annotations to document code and make it easier to navigate:

```pinescript
//@version=6
indicator("Triangle", "", true)

//#region ———————————————————— Constants and inputs

int   TIME_DEFAULT  = 0
float PRICE_DEFAULT = 0.0

x1Input = input.time(TIME_DEFAULT,   "Point 1", inline = "1", confirm = true)
y1Input = input.price(PRICE_DEFAULT, "",        inline = "1", tooltip = "Pick point 1", confirm = true)
x2Input = input.time(TIME_DEFAULT,   "Point 2", inline = "2", confirm = true)
y2Input = input.price(PRICE_DEFAULT, "",        inline = "2", tooltip = "Pick point 2", confirm = true)
x3Input = input.time(TIME_DEFAULT,   "Point 3", inline = "3", confirm = true)
y3Input = input.price(PRICE_DEFAULT, "",        inline = "3", tooltip = "Pick point 3", confirm = true)
//#endregion

//#region ———————————————————— Types and functions

// @type            Used to represent the coordinates and color to draw a triangle.
// @field time1     Time of first point.
// @field time2     Time of second point.
// @field time3     Time of third point.
// @field price1    Price of first point.
// @field price2    Price of second point.
// @field price3    Price of third point.
// @field lineColor Color to be used to draw the triangle lines.
type Triangle
    int   time1
    int   time2
    int   time3
    float price1
    float price2
    float price3
    color lineColor

//@function Draws a triangle using the coordinates of the `t` object.
//@param t  (Triangle) Object representing the triangle to be drawn.
//@returns  The ID of the last line drawn.
drawTriangle(Triangle t) =>
    line.new(t.time1, t.price1, t.time2, t.price2, xloc = xloc.bar_time, color = t.lineColor)
    line.new(t.time2, t.price2, t.time3, t.price3, xloc = xloc.bar_time, color = t.lineColor)
    line.new(t.time1, t.price1, t.time3, t.price3, xloc = xloc.bar_time, color = t.lineColor)
//#endregion

//#region ———————————————————— Calculations

// Draw the triangle only once on the last historical bar.
if barstate.islastconfirmedhistory
    //@variable Used to hold the Triangle object to be drawn.
```
    Triangle triangle = Triangle.new()

    triangle.time1  := x1Input
    triangle.time2  := x2Input
    triangle.time3  := x3Input
    triangle.price1 := y1Input
    triangle.price2 := y2Input
    triangle.price3 := y3Input
    triangle.lineColor := color.purple

    drawTriangle(triangle)
//#endregion         Previous       Type system      Next   Identifiers              On this pageOverviewVersionDeclaration statementCodeCommentsLine wrappingCompiler annotations