# Data structures

What data structures can I use in Pine Script®?
Pine data structures resemble those in other programming languages, with some important differences:

Tuple: An arbitrary—and temporary—grouping of values of one or more types.

Array: An ordered sequence of values of a single type.

Matrix: A two-dimensional ordered sequence of values of a single type.

Object: An arbitrary—and persistent—collection of values of one or more types.

Map: An unordered sequence of key-value pairs, where the keys are of a single type and the values are of a single type.

The following sections describe each data structure in more detail.
Tuples
A tuple in Pine Script is a list of values that is returned by a function, method, or local block. Unlike in other languages, tuples in Pine serve no other function.
Tuples do not have names and cannot be assigned to variables.
Apart from the fact that the values are requested and returned together, the values have no relation to each other, in contrast to the other data structures described here.
To define a tuple, enclose a comma-separated list of values in square brackets.
Using a tuple to request several values from the same symbol and timeframe using a request.security() call is more efficient than making several calls. For instance, consider a script that contains separate request.security() calls for the
open, high,
low, and close prices:
float o = request.security(syminfo.tickerid, "D", open)
float h = request.security(syminfo.tickerid, "D", high)
float l = request.security(syminfo.tickerid, "D", low)
float c = request.security(syminfo.tickerid, "D", close)
Using a tuple can consolidate these calls into a single request.security() function call, reducing performance overhead:
[o, h, l, c] = request.security(syminfo.tickerid, "D", [open, high, low, close])
See the Tuples section in the User Manual for more information.
Arrays
Arrays store multiple values of the same type in a single variable. Each element in an array can be efficiently accessed by its index—an integer corresponding to its position within the array.
Arrays can contain an arbitrary number of elements. Scripts can loop through arrays, testing each element in turn for certain logical conditions. There are also many built-in functions to perform different operations on arrays. This flexibility makes arrays very versatile data structures.
Arrays can be created with either the array.new<type>()
or array.from() function. In this simple example, we store the last five closing prices in an array and display it in a table:
```pinescript
//@version=6
indicator("Array example")
// Declare an array with 5 `na` values on the first bar.
var array<float> pricesArray = array.new<float>(5)
// On each bar, add a new value to the end of the array and remove the first (oldest) element.
array.push(pricesArray, close)
array.shift(pricesArray)
// Display the array and its contents in a table.
var table displayTable = table.new(position.middle_right, 1, 1)
if barstate.islast
    table.cell(displayTable, 0, 0, str.tostring(pricesArray), text_color = chart.fg_color)
```
See the Arrays section in the User Manual for more information.
Matrices
A matrix is a two-dimensional array, made of rows and columns, like a spreadsheet. Matrices, like arrays, store values of the same built-in or user-defined type.
Matrices have many built-in functions available to organize and manipulate their data. Matrices are useful for modeling complex systems, solving mathematical problems, and improving algorithm performance.
This script demonstrates a simple example of matrix addition. It creates a 3x3 matrix, calculates its transpose, then calculates the
matrix.sum() of the two matrices. This example displays strings representing the original matrix, its transpose, and the resulting sum matrix in a table on the chart:

```pinescript
//@version=6
indicator("Matrix sum example")

//@variable An empty matrix of type "float".
m = matrix.new<float>()

// Add rows to the matrix containing data.
m.add_row(0, array.from(1, 2, 3))
m.add_row(1, array.from(0, 4, 2))
m.add_row(2, array.from(3, 1, 2))

var table displayTable = table.new(position.middle_right, 5, 2)
if barstate.islast
```
    matrix<float> t = m.transpose()
    table.cell(displayTable, 0, 0, "A",                            text_color = chart.fg_color)
    table.cell(displayTable, 0, 1, str.tostring(m),                text_color = chart.fg_color)
    table.cell(displayTable, 1, 1, "+",                            text_color = chart.fg_color)
    table.cell(displayTable, 2, 0, "Aᵀ",                           text_color = chart.fg_color)
    table.cell(displayTable, 2, 1, str.tostring(t),                text_color = chart.fg_color)
    table.cell(displayTable, 3, 1, "=",                            text_color = chart.fg_color)
    table.cell(displayTable, 4, 0, "A + Aᵀ",                       text_color = color.green)
    table.cell(displayTable, 4, 1, str.tostring(matrix.sum(m, t)), text_color = color.green)
See the Matrices section in the User Manual for more information.
Objects
Pine Script objects are containers that group together multiple fields into one logical unit.
Objects are instances of user-defined types (UDTs). UDTs are similar to structs in traditional programming languages. They define the rules for what an object can contain. Scripts first create a UDT by using the type keyword and then create one or more objects of that type by using the UDT’s built-in new() method.
UDTs are composite types; they contain an arbitrary number of fields that can be of any type. A UDT’s field type can even be another UDT, which means that objects can contain other objects.
Our example script creates a new pivot object each time a new pivot is found, and draws a label using each of the object’s fields:
```pinescript
//@version=6
indicator("Object example", overlay = true)

// Create the pivot type with 3 fields: the x coordinate, the y coordinate, and a formatted time string.
type pivot
    int x
    float y
    string pivotTime
// Check for new pivots. `ta.pivotHigh` returns the price of the pivot.
float pivFound = ta.pivothigh(10, 10)
// When a pivot is found, create a new pivot object and generate a label using the values from its fields.
if not na(pivFound)
```
    pivot pivotObject = pivot.new(bar_index - 10, pivFound, str.format_time(time[10], "yyyy-MM-dd HH:mm"))
    label.new(pivotObject.x, pivotObject.y, pivotObject.pivotTime, textcolor = chart.fg_color)
See the User Manual page on Objects to learn more about working with UDTs.
Maps
Maps in Pine Script are similar to dictionaries in other programming languages, such as dictionaries in Python, objects in JavaScript, or HashMaps in Java.
Maps store elements as key-value pairs, where each key is unique. Scripts can access a particular value by looking up its associated key.
Maps are useful because they can access data directly without searching through each element, unlike arrays. For example, maps can be more performant and simpler than arrays for associating specific attributes with symbols, or dates with events.
The following example illustrates the practical application of maps for managing earnings dates and values as key-value pairs, with dates serving as the keys:

```pinescript
//@version=6
indicator("Earnings map", overlay = true)
// Get the earnings value if present. We use `barmerge.gaps_on` to return `na` unless earnings occurred.
float earnings = request.earnings(syminfo.tickerid, earnings.actual, barmerge.gaps_on)
// Declare a map object for storing earnings dates and values.
var map<string, float> earningsMap = map.new<string, float>()
// If `request.security()` returned data, add an entry to the map with the date as the key and earnings as the value.
if not na(earnings)
    map.put(earningsMap, str.format_time(time, "yyyy-MM-dd"), earnings)
// On the last historical bar, loop through the map in the insertion order, writing the key-value pairs to the logs.
if barstate.islastconfirmedhistory
    string logText = "\n"
    for [key, value] in earningsMap
```
        logText += str.format("{0}: {1}\n", key, value)
    log.info(logText)
Here, we use request.earnings() with the barmerge parameter set to barmerge.gaps_on to return the earnings value on bars where earnings data is available, and return na otherwise.
We add non-na values to the map, associating the dates that earnings occurred with the earnings numbers. Finally, on the last historical bar, the script loops through the map, logging each key-value pair to display the map’s contents.
To learn more about working with maps, refer to the Maps section in the User Manual.
What’s the difference between a series and an array?
In Pine Script, “series” variables are calculated on each bar. Historical values cannot change. Series values can change during the open realtime bar, but when the bar closes, the value for that bar becomes fixed and immutable.
These fixed values are automatically indexed for each bar. Scripts can access values from previous bars by using the [] history-referencing operator to go back one or more bars.
Where “series” variables are strictly time-indexed, and the historical values are created automatically, arrays are created, filled, and manipulated arbitrarily by a script’s logic. Programmers can change the size of arrays dynamically by using functions that insert or remove elements. Any element in an array can also be altered using the array.set() function.
The concept of time series is a fundamental aspect of Pine Script. Its series-based execution model processes scripts bar-by-bar. This built-in behavior mimics looping, allowing a series to track values, accumulate totals, or perform calculations across a sequence of data on each bar.
Simple calculations can thus be done efficiently using “series” variables. Using arrays for similar tasks requires manually creating a dataset, managing its size, and using loops to process the array’s contents, which can be far less efficient.
Arrays, of course, can do many things that series variables cannot. Scripts can use arrays to store a fixed set of values, collect complex data such as objects of user-defined types, manage drawing instances for visual display, and more.
In general, use arrays to handle data that doesn’t fit the time series model, or for complex calculations. Arrays can also mimic series by creating custom datasets, as in the getSeries library.
**Note:** An array itself is part of a series. Scripts can reference the previous committed states of any array by using the history-referencing operator. See the History referencing section of the Arrays page for more information.
How do I create and use arrays in Pine Script?
Pine Script arrays are one-dimensional collections that can hold multiple values of a single type.
Declaring arrays
Declare an array by using one of the following functions:
array.new<type>(),
array.from(),
or
array.copy().
Arrays can be declared with the var keyword to have their values persist from bar to bar, or without it, so that the values initialize again on each bar.
For more on the differences between declaring arrays with or without var, see this section of this FAQ.
Adding and removing elements
Pine Script provides several functions for dynamically adjusting the size and contents of arrays.
Adding elements

array.unshift()
inserts a new element at the beginning of an array (index 0) and increases the index values of any existing elements by one.
array.insert()
inserts a new element at the specified index and increases the index of existing elements at or after the insertion index by one. It accepts both positive and negative indices, which reference an element’s position starting from the beginning of the array or from the end, respectively.
array.push()
adds a new element at the end of an array.

Removing elements

array.remove()
removes the element at the specified index and returns that element’s value. It accepts both positive and negative indices, which reference an element’s position starting from the beginning of the array or from the end, respectively.
array.shift()
removes the first element from an array and returns its value.
array.pop()
removes the last element of an array and returns its value.
array.clear()
removes all elements from an array. Note that clearing an array won’t delete any objects that were referenced by its elements. To delete objects contained by an array, loop through the array and delete the objects first, and then clear the array.

The flexibility afforded by these functions supports various data management strategies, such as
queues or stacks, which are useful for custom datasets or sliding window calculations.
Read more about implementing a stack or queue in this FAQ entry.
Calculations on arrays
Because arrays are not time series data structures, performing operations across an array’s elements requires special functions designed for arrays.
Programmers can write custom functions to perform calculations on arrays. Additionally, built-in functions enable computations like finding the maximum, minimum, or average values within an array.
See the Calculation on arrays section of the User Manual for more information.
Script example
This script example demonstrates a practical application of arrays by tracking the opening prices of the last five sessions. The script declares a float array to hold the prices using the var keyword, allowing it to retain its values from bar to bar.
At the start of each session, we update the array by adding the new opening price and removing the oldest one. This process, resembling a queue, keeps the array’s size constant while maintaining a moving window of the session opens for the last five days.
Built-in array functions return the highest, lowest, and average opening price over the last five sessions. We plot these values to the chart.

```pinescript
//@version=6
indicator("Array demo", overlay = true)
// Create an input to determine the number of session opens to track, with a default value of 5.
int numOpensInput = input.int(5, "Number of opens to track")
// Create an array to store open prices. Using `var` ensures the array retains its values from bar to bar.
// Initially, the array is filled with placeholder values (`na`), which are later updated with actual open prices.
var array<float> opensArray = array.new<float>(numOpensInput)
// On the first bar of each session, update the array: add the current open price and remove the oldest entry.
if session.isfirstbar_regular
    array.push(opensArray, open)
    array.shift(opensArray)
// Plot the highest, lowest, and average open prices from the tracked sessions
plot(array.max(opensArray), "Highest open in n sessions",       color.lime)
plot(array.min(opensArray), "Lowest open in n sessions",        color.fuchsia)
plot(array.avg(opensArray), "Avg. open of the last n sessions", color.gray)
// Change the background color on the first bar of each session to visually indicate session starts.
bgcolor(session.isfirstbar_regular ? color.new(color.gray, 80) : na)
```
For more information about arrays, see the Arrays page in the User Manual.
What’s the difference between an array declared with or without ​var​?
Using the var keyword, a script can declare an array variable in a script that is initialized only once, during the first iteration on the first chart bar.
Persistent arrays
When an array is declared with var, it is initialized only once, at the first execution of the script. This allows the array to retain its contents and potentially grow in size across bars, making it ideal for cumulative data collection or tracking values over time.
Non-persistent arrays
Arrays declared without var are reinitialized on every new bar, effectively resetting their content. This behavior suits scenarios where calculations are specific to the current bar, and historical data retention is unnecessary.
Example script
Here, we initialize two arrays. Array a is declared without using the var keyword, while array b
is declared with var, allowing us to observe and compare their behavior. Throughout the runtime, we incrementally add an element to
each array on each bar. We use a table to present and compare both the sizes of these arrays and the number of chart bars, effectively illustrating the impact of
different declaration methods on array behavior:
```pinescript
//@version=6
indicator("Using `var` with arrays")
//@variable An array that initializes on every bar.
a = array.new<float>()
array.push(a, close)
//@variable An array that expands its size by 1 on each bar.
var b = array.new<float>(0)
array.push(b, close)
// Populate a table on the chart's last bar to display the sizes of the arrays and compare it to the number of chart bars.
if barstate.islast
    var table displayTable = table.new(position.middle_right, 2, 3)
    table.cell(displayTable, 0, 0, "Array A size:",             text_color = chart.fg_color, text_halign = text.align_right)
    table.cell(displayTable, 1, 0, str.tostring(a.size()),      text_color = chart.fg_color, text_halign = text.align_left)
    table.cell(displayTable, 0, 1, "Array B size:",             text_color = chart.fg_color, text_halign = text.align_right)
    table.cell(displayTable, 1, 1, str.tostring(b.size()),      text_color = chart.fg_color, text_halign = text.align_left)
    table.cell(displayTable, 0, 2, "Number of chart bars:",     text_color = chart.fg_color, text_halign = text.align_right)
    table.cell(displayTable, 1, 2, str.tostring(bar_index + 1), text_color = chart.fg_color, text_halign = text.align_left)
```
Results

Array A (Non-Persistent): This array is reset at the beginning of each new bar. As a result, despite adding elements on each bar, its size remains constant, reflecting only the most recent addition.
Array B (Persistent): This array retains its elements and accumulates new entries across bars, mirroring the growing count of chart bars. This persistent nature of the array shows its ability to track or aggregate data over the script’s runtime.

For further details, consult the sections concerning variable
declaration modes and their use in
array declarations in the User Manual.
What are queues and stacks?
Scripts can use arrays to create queues and stacks.
Stacks
 A stack uses the “last in, first out” (LIFO) principle, where the most recently added item is the first to be taken away.
Think of this like a stack of plates, where you can only place a new plate on top or remove the top plate. To use an array as a stack, add elements to the end of the array using array.push() and remove elements from the end of the array using array.pop().
Queues
 A queue uses the “first in, first out” (FIFO) principle, where the first item to be added is the first to be removed. This kind of queue in code is like a queue in real life, such as in a coffee shop, where no matter how many people join the end of the queue, the first person still gets served first. To use an array as a queue, add elements to the end of the array using array.push() and remove them from the beginning using array.shift().
Stacks are particularly useful for accessing the most recent data, such as for tracking price levels. Queues are used for sequential data processing tasks, like event handling. Two example scripts follow, to illustrate these different usages.
Example: Arrays as stacks
This script uses arrays as stacks to manage pivot points. It draws lines from the pivot points and extends the lines with each new bar until price intersects them.
When the script detects a pivot point, it adds (pushes) a new line to the stack. With each new bar, the script extends the end point of each line in the stack.
It then checks whether price has intersected the high or low pivot lines at the top of the stack. If so, the script removes (pops) the intersected line from the stack, meaning that it will no longer be extended with new bars.
Note that we do not need to iterate through the arrays to check all the lines, because price is always between only the high and low pivot lines at the end of each array.

```pinescript
//@version=6
indicator("Array as a stack", overlay = true)

// @function                Adds a new horizontal line to an array of lines at a specified pivot level.
// @param id                (array<line>) The array to which to add the new line.
// @param pivot             (float) The price level at which to draw the horizontal line.
// @param lineColor         (color) The color of the line.
// @returns                 (void) The function has no explicit return.
stackLine(array<line> id, float pivot, color lineColor) =>
    if not na(pivot)
        array.push(id, line.new(bar_index - 10, pivot, bar_index, pivot, color = lineColor))

// @function                Extends the endpoint (`x2`) of each line in an array to the current `bar_index`.
// @param id                (array<line>) The array containing the line objects to update.
// @returns                 (void) The function has no explicit return.
extendLines(array<line> id) =>
    for eachLine in id
        eachLine.set_x2(bar_index)

// @function                Removes line objects from an array if they are above or below the current bar's high or low.
// @param id                (array<line>) The array from which to remove line objects.
// @param isBull            (bool) If true, remove bullish pivot lines below the high price;
//                          if false, remove bearish pivot line above the low price.
// @returns                 (void) The function has no explicit return.
removeLines(array<line> id, bool isBull) =>
    if array.size(id) > 0
        float linePrice = line.get_price(array.last(id), bar_index)
        if isBull ? high > linePrice : low < linePrice
            array.pop(id)
    line(na)

// Find the pivot high and pivot low prices.
float pivotLo = ta.pivotlow(10,  10), float pivotHi = ta.pivothigh(10, 10)

// Initialize two arrays on the first bar to stack our lines in.
var array<line> pivotHiArray = array.new<line>()
var array<line> pivotLoArray = array.new<line>()

// If a pivot occurs, draw a line from the pivot to the current bar and add the line to the stack.
stackLine(pivotHiArray, pivotHi, color.orange)
stackLine(pivotLoArray, pivotLo, color.aqua)

// Extend all lines in each array to the current bar on each bar.
extendLines(pivotHiArray)
extendLines(pivotLoArray)

// Check the final element of each array to see if price exceeded the pivot lines.
// Pop the line off the stack if it was exceeded.
removeLines(pivotHiArray, true)
removeLines(pivotLoArray, false)
```
Example: Arrays as queues
This script uses arrays as queues to track pivot points for monitoring recent support and resistance levels. It dynamically updates lines extending from the four most recent pivot highs and lows to the current bar with each new bar. When the script detects a new pivot high or low, it adds a line that represents this pivot to the respective queue.
To maintain the queue’s size at a constant four items, the script removes the oldest line in the queue whenever it adds a new line.

```pinescript
//@version=6
indicator("Array as a queue", overlay = true)

int PIVOT_LEGS = 10

// @function            Queues a new `value` at the end of the `id` array and removes
//                      the first element if the array size exceeds the specified `maxSize`.
// @param id            (<any array type>) The array in which to queue the element.
// @param maxSize       (int) The maximum allowed number of elements in the array.
//                      If the array exceeds this size, the first element is removed.
// @param value         (<type of the array>) The new element to add to the array.
// @returns             (<type of the array>) The removed element.
arrayQueue(id, int maxSize, value) =>
    id.push(value)
    if id.size() > maxSize
        id.shift()

// @function                Adds a new horizontal line to an array at a certain pivot level and removes the oldest line.
// @param id                (array<line>) The array to which to add the new line.
// @param pivot             (float) The price level at which to draw the horizontal line.
// @param numLines          (int) The number of lines to keep in the queue.
// @param lineColor         (color) The color of the line to draw.
// @returns                 (void) The function has no explicit return.
queueLine(array<line> id, float pivot, int numLines, color lineColor) =>
    if not na(pivot)
        arrayQueue(id, numLines, line.new(bar_index - PIVOT_LEGS, pivot, bar_index, pivot, color = lineColor))

// @function                Extends the endpoint (`x2`) of each line in an array to the current `bar_index`.
// @param id                (array<line>) The array containing the line objects to update.
// @returns                 (void) The function has no explicit return.
extendLines(array<line> id) =>
    for eachLine in id
        eachLine.set_x2(bar_index)

// Find the pivot high and pivot low price.
float pivotLo = ta.pivotlow(PIVOT_LEGS,  PIVOT_LEGS)
float pivotHi = ta.pivothigh(PIVOT_LEGS, PIVOT_LEGS)

// Initialize two arrays on the first bar to queue our lines in.
var array<line> pivotHiArray = array.new<line>()
var array<line> pivotLoArray = array.new<line>()

// If a pivot occurs, draw a line from the pivot to the current bar, add it to the queue, and remove the oldest line.
queueLine(pivotHiArray, pivotHi, 4, color.orange)
queueLine(pivotLoArray, pivotLo, 4, color.aqua)

// Extend all lines in each array to the current bar on each bar.
extendLines(pivotHiArray)
extendLines(pivotLoArray)
```
For more information on manipulating arrays, see the Arrays section in the User Manual.
How can I perform operations on all elements in an array?
In Pine Script, there are no built-in functions to apply operations across the entire array at once. Instead, scripts need to iterate through the array, performing the operation on each element one at a time.
The easiest way to retrieve each element in an array is by using a for…in structure. This type of loop retrieves each element in turn, without the need for specifying the number of iterations.
The simple form of the loop has the format for element in array, where element is a variable that is assigned the current array element being accessed.
If the script’s logic requires the position of the element in the array, use the two-argument form: for [index, element] in array. This form returns both the current element and its index in a tuple.
Example: retrieving array elements
This first example script uses an array as a queue to store lines representing the latest four pivot highs and lows. The for…in loop performs two tasks:

It adjusts the x2 endpoint of each line to the current bar_index.
It changes the colors of the lines to blue for support or orange for resistance, based on their position relative to the close
price.

Note that neither of these operations requires knowing the index of the array element.

```pinescript
//@version=6
indicator("Example: `for...in` loop", overlay = true)

// @function            Queues a new `value` at the end of the `id` array and removes
//                      the first element if the array size exceeds the specified `maxSize`.
// @param id            (<any array type>) The array in which to queue the element.
// @param maxSize       (int) The maximum allowed number of elements in the array.
//                      If the array exceeds this size, the first element is removed.
// @param value         (<type of the array>) The new element to add to the array.
// @returns             (<type of the array>) The removed element.
arrayQueue(id, int maxSize, value) =>
    id.push(value)
    if id.size() > maxSize
        id.shift()

// @function                Adds a new horizontal line to an array at a certain pivot level and removes the oldest line.
// @param id                (array<line>) The array to which to add the new line.
// @param pivot             (float) The price level at which to draw the horizontal line.
// @param numLines          (int) The number of lines to keep in the queue.
// @param lineColor         (color) The color of the line to draw.
// @returns                 (void) The function has no explicit return.
queueLine(array<line> id, float pivot, int numLines, color lineColor) =>
    if not na(pivot)
        arrayQueue(id, numLines, line.new(bar_index - 10, pivot, bar_index, pivot, color = lineColor))

// @function                Extends the endpoint (`x2`) of each line in an array to the current `bar_index`.
// @param id                (array<line>) The array containing the line objects to update.
// @returns                 (void) The function has no explicit return.
extendLines(array<line> id) =>
    for eachLine in id
        eachLine.set_x2(bar_index)

// @function                Adjusts the color of each line in an array. If the `close` is above the line, the line is 
//                          set to `bullColor` (support), else, `bearColor` (resistance).
// @param id                (array<line>) The array containing the line objects.
// @param bullColor         (color) The color to apply to the line if `close` is equal to or higher than the line's price.
// @param bearColor         (color) The color to apply to the line if `close` is below the line's price.
// @returns                 (void) The function has no explicit return.
colorLines(array<line> id, color bullColor, color bearColor) =>
    for eachLine in id
        if close >= eachLine.get_price(bar_index)
            eachLine.set_color(bullColor)
        else
            eachLine.set_color(bearColor)

// Find the pivot high and pivot low prices.
float pivotLo = ta.pivotlow(10,  10)
float pivotHi = ta.pivothigh(10, 10)

// Initialize two arrays on the first bar to queue our lines in.
var array<line> pivotHiArray = array.new<line>(), var array<line> pivotLoArray = array.new<line>()

// If a pivot occurs, draw a line from the pivot to the current bar, add it to the queue, and remove the oldest line.
queueLine(pivotHiArray, pivotHi, 4, color.orange), queueLine(pivotLoArray, pivotLo, 4, color.aqua)

// Extend all lines in each array to the current bar on each bar.
extendLines(pivotHiArray), extendLines(pivotLoArray)

// Set the color of lines as support or resistance by checking if the closing price is above or below the lines.
colorLines(pivotHiArray, color.aqua, color.orange)
colorLines(pivotLoArray, color.aqua, color.orange)
```
Example: retrieving array elements and indices
In our second script, we use the two-argument variant of the for…in loop to access elements and their indices in an array.
This method facilitates operations that depend on element indices, such as managing parallel arrays or incorporating index values into calculations.
The script pairs a boolean array with an array of positive and negative random integers. The boolean array flags whether each corresponding integer in the primary array is positive.
```pinescript
//@version=6
indicator("Example: `for...in` loop with index")
// Create an array of random integers above and below 0.
var valuesArray = array.from(4, -8, 11, 78, -16, 34, 7, 99, 0, 55)
// Create an array to track the positive state of each integer.
var isPos = array.new<bool>(10, false)

// Iterate over the valuesArray using a `for...in` loop and update each corresponding element in the bool array to true
// if the value is above 0, or false if it is below 0.
for [i, eachValue] in valuesArray
    if eachValue > 0
        array.set(isPos, i, true)

// Print both arrays in a label on the last historical bar.
if barstate.islastconfirmedhistory
    label.new(bar_index +1, high, str.tostring(valuesArray) + "\n" + str.tostring(isPos), style = label.style_label_left, textcolor = chart.fg_color)
```
What’s the most efficient way to search an array?
The obvious way to search for an element in an array is to use a loop to check each element in turn.
However, there are more efficient ways to search, which can be useful in different situations.
Some of the following functions return only the index of a value. Programmers can then use array.get() if the script needs the actual value.
Checking if a value is present in an array
If all the script needs to do is to check whether a certain value is present in an array or not, use the array.includes() function.
If the element is found, the function returns true; otherwise, it returns false.
This method does not return the index of the element.
The following example script checks if the value 3 is present in the values array, and displays either “found” or “not found” in a label.
```pinescript
//@version=6
indicator("Example: Find whether an array element is present")
```
array<int> values = array.from(1, 3, 5)
int searchValue = input(3, "Value to Search For")
bool valuePresent = array.includes(values, searchValue)
if barstate.islast
    label.new(bar_index, low, valuePresent ? "Search value found" : "Search value not found", textcolor = color.white)
Finding the position of an element
If the script requires the position of an element, programmers can use the array.indexof() function.
This function returns the index of the first occurrence of a value within an array. If the value is not found, the function returns -1.
This method does not show whether there are multiple occurrences of the search value in the array. Depending on the script logic, this method might not be suitable if the array contains values that are not unique.
The following script searches for the first occurrence of 101.2 in the prices array and displays “found” and the value’s index in a label, or “not found” otherwise.
```pinescript
//@version=6
indicator("Example: Find index of array element")
```
array<float> prices = array.from(100.5, 101.2, 102.8, 100.5)
float searchValue = input(101.2, "Value to Search For")
int indexFound = array.indexof(prices, searchValue)
if barstate.islast
    string lblString = switch
        indexFound < 0 => "Search value: not found"
        =>                "Search value: found\n       Index: " + str.tostring(indexFound)
    label.new(bar_index, high, lblString,
         textcolor        = color.white,
         textalign        = text.align_left,
         text_font_family = font.family_monospace
     )
Binary search
If the script requires the position of the element in a sorted array, the function array.binary_search() returns the index of a value more efficiently than array.indexof(). The performance improvement is significant for large arrays. If the value is not found, the function returns -1.
NoticeThe array.binary_search() function requires arrays of “int” or “float” values, and the values must be sorted in ascending order for correct results.
This script uses a binary search to find the value 100.5 within an array of prices. The script displays the original array, the sorted array, the target value (100.5), and the result of the search.
If the value is found, it displays “found”, along with the index of the value. If the value is not found, it displays “not found”.
```pinescript
//@version=6
indicator("Example: Binary search in sorted array")
```
array<float> sortedPrices = array.from(100.5, 102.3, 98.7, 99.2)
string originalArrayString = str.tostring(sortedPrices)
float searchValue = input(100.5)
// Ensure that the array is sorted (order is ascending by default); this step is crucial for binary search.
array.sort(sortedPrices)
string sortedArrayString = str.tostring(sortedPrices)
int searchValueIndex = array.binary_search(sortedPrices, searchValue)
bool valueFound = searchValueIndex >= 0
if barstate.islast
    string lblTxt =
     str.format("Original array: {0}\n  Sorted Array: {1}\n  Search value: {2}\n   Value found: {3}\n      Position: {4}",
         originalArrayString,
         sortedArrayString,
         searchValue,
         valueFound,
         searchValueIndex
     )
    label.new(bar_index, high, lblTxt,
         textcolor        = color.white,
         textalign        = text.align_left,
         text_font_family = font.family_monospace
     )
If a script does not need the exact value, the functions array.binary_search_leftmost() and array.binary_search_rightmost() provide an effective way to locate the nearest index to a given value in sorted arrays.
These functions return the index of the value, if it is present. If the value is not present, they return the index of the element that is closest to the search value on the left (smaller) or right (larger) side.
How can I debug arrays?
To debug arrays, scripts need to display the contents of the array at certain points in the script.
Techniques that can display the contents of arrays include using plots, labels, tables, and Pine Logs.
For information about commonly encountered array-related errors, refer to the array Error Handling section in the User Manual.
Plotting
Using the plot() function to inspect the contents of an array can be helpful because this function can show numerical values on the script’s status line, the price
scale, and the Data Window. It is also easy to review historical values.
Limitations of this approach include:

Arrays must be of type “float” or “int”.
The number of plots used for debugging counts towards the plot limit for a script.
Plot calls must be in the global scope and scripts cannot call them conditionally. Therefore, if the size of the array varies across bars, using this technique can be impractical.

Here we populate an array with the open, high, low and close (OHLC) prices on each bar. The script retrieves all the elements of the array and plots them on the chart.
```pinescript
//@version=6
indicator("Plot array elements")
```
array<float> ohlc = array.from(open, high, low, close)
plot(ohlc.get(0), "Open",  color.red)
plot(ohlc.get(1), "High",  color.yellow)
plot(ohlc.get(2), "Low",   color.blue)
plot(ohlc.get(3), "Close", color.green)
Using labels
Using labels to display array values on certain bars is particularly useful for non-continuous data points or to view all elements of an array simultaneously.
Scripts can create labels within any local scope, including functions and methods. Scripts can also position drawings at any available chart location, irrespective of the current bar_index.
Unlike plots, labels can display the contents of a variety of array types, including boolean and string arrays.
Limitations of using labels include:

Pine labels display only in the chart pane.
Scripts can display only up to a maximum number of labels.

In the following example script, we monitor the close price at the last four moving average (MA) crosses in a queued array and use a label to display this array from a local scope whenever a cross occurs:
```pinescript
//@version=6
indicator("Array elements in a label", overlay = true)

var array<float> crossPrices = array.new<float>(4)

float fastMa = ta.ema(close, 9)
float slowMa = ta.ema(close, 21)

if ta.cross(fastMa, slowMa)
    crossPrices.push(close)
    crossPrices.shift()
    label.new(bar_index, high, str.tostring(crossPrices), textcolor = color.white)

plot(fastMa, "Fast MA", color.aqua)
plot(slowMa, "Slow MA", color.orange)
```
For more information, see the Labels section of the Debugging page in the User Manual.
Using label tooltips
If programmers want to be able to inspect the values in an array on every bar, displaying the contents of the array in a label is not convenient, because the labels overlap and become difficult to read.
In this case, displaying the array contents in a label tooltip can be visually clearer. This method has the same advantages and limitations as using labels in the section above.
This example script plots a fast and a slow moving average (MA). It maintains one array of the most recent three values of the fast MA, and one array for the slow MA. The script prints empty labels on each bar.
The tooltip shows the values of the MA arrays and whether or not the MAs crossed this bar. The labels are displayed in a semi-transparent color, and the tooltip is visible only when the cursor hovers over the label.
```pinescript
//@version=6
indicator("Array elements in a label tooltip", overlay = true)

// Create two arrays to hold the MA values.
var array<float> fastMaValues = array.new<float>(3)
var array<float> slowMaValues = array.new<float>(3)

// Calculate the MAs.
float fastMa = ta.ema(close, 9)
float slowMa = ta.ema(close, 21)

// Load the current MA values into the arrays.
fastMaValues.push(math.round(fastMa,2)), slowMaValues.push(math.round(slowMa,2))
// Remove the first element to keep the arrays at the same size.
fastMaValues.shift(),  slowMaValues.shift()
// Define the string to print in the label tooltip.
string labelString = str.format("Fast MA array: {0}\n  Slow MA array: {1}\n  Crossed this bar? {2}",
  str.tostring(fastMaValues),
  str.tostring(slowMaValues),
  ta.cross(fastMa, slowMa))
//Print the labels.
label.new(bar_index, high, text="", color=color.new(chart.fg_color,90), textcolor = chart.fg_color, tooltip=labelString)

plot(fastMa, "Fast MA", color.aqua)
plot(slowMa, "Slow MA", color.orange)
```
Using tables
Using tables for debugging offers a more organized and scalable alternative to labels. Tables can display multiple “series” strings in a clear format that remains unaffected by the chart’s scale or the index of the bars.
Limitations of using tables for debugging include that, unlike labels, the state of a table can only be viewed from the most recent script execution, making it hard to view historical data.
Additionally, tables are computationally more expensive than other debugging methods and can require more code.
In the following example script, we create and display two unrelated arrays, to show how flexible this approach can be. The first array captures the times of the last six bars where a Golden Cross occurred. The second array records the last eight bar indices where the Relative Strength Index (RSI) reached new all-time highs within the chart’s history. We use the whenSince() function from the PineCoders’ getSeries library to create and update the arrays. This function treats the arrays as queues, and limits their size.
```pinescript
//@version=6
indicator("Debugging arrays with tables", overlay = true)

// Import the `getSeries` PineCoders library to build fixed-size arrays populated on specific conditions.
//      https://www.tradingview.com/v/Bn7QkdZR/
import PineCoders/getSeries/1 as PCgs

// Calculate MAs and create cross condition.
float ma50        = ta.sma(close,  50)
float ma200       = ta.sma(close,  200)
bool  goldenCross = ta.cross(ma50, ma200)

// Calculate the RSI and determine if it's hitting a new all-time high.
float myRsi       = ta.rsi(close,  20)
bool newRsiAth    = myRsi == ta.max(myRsi)

// Create two arrays using the imported `whenSince()` function.
```
array<float> goldenCrossesTimes = PCgs.whenSince(time_close, goldenCross, length = 6)
array<float> barIndicesOfHiRSIs = PCgs.whenSince(bar_index,  newRsiAth,   length = 8)

// Plot the MAs for cross reference.
plot(ma50,  "50 MA",  color.aqua)
plot(ma200, "200 MA", color.orange)

// On the last historical bar, display the date and time of the last crosses.
if barstate.islast
    // Declare our MA table to display the Golden Cross times. 
    var table maTable  = table.new(position.top_right, 2, 8, color.new(color.black, 100), color.gray, 1, color.gray, 1)
    // Create a title cell for the MA table and merge cells to form a banner two cells wide.
    table.cell(maTable , 0, 0, "Golden Cross Times", text_color = color.black, bgcolor = #FFD700)
    table.merge_cells(maTable , 0, 0, 1, 0)
    // Loop the array and write cells to the MA table containing the cross time for each element of the array. Number each element in the left row.
    // Format the UNIX time value to a formatted time string using `str.format_time()`.
    for [i, timeValue] in goldenCrossesTimes
        table.cell(maTable, 0, i + 1, str.tostring(i + 1), text_color = #FFD700)
        table.cell(maTable, 1, i + 1, str.format_time(int(timeValue), "yyyy.MM.dd 'at' HH:mm:ss z"), text_color = chart.fg_color)
    // Create a second table to display the indices of the last eight RSI all-time highs.
    var table rsiTable = table.new(position.bottom_right, 1, 1, color.new(color.black, 100), color.gray, 1, color.gray, 1)
    table.cell(rsiTable, 0, 0, "Bar indices of RSI ATHs\n" + str.tostring(barIndicesOfHiRSIs), text_color = chart.fg_color)
Using Pine Logs
Pine Logs are messages that display in the Pine Logs pane, along with a timestamp when the logging function was called.
Scripts can create log messages at specific points during the execution of a script. Programmers can use the log.*() functions to create Pine Logs from almost anywhere in a script — including inside the local scopes of user-defined functions, conditional structures, and loops.
By logging messages to the console whenever there is a modification to the array, programmers can track the logical flow of array operations in much more detail than by using other approaches.
The script below updates a previous example script from the section on queues and stacks to add logging. It uses arrays as stacks to track lines drawn from pivot points. When a pivot occurs, the script adds a new line to the stack and continues to extend the lines on each bar until an intersection with price occurs. If an intersection is found, the script removes (pops) the intersected line from the stack, meaning it will no longer be extended with new bars.
The messages in the Pine Logs pane are time stamped and offer detailed information about when elements are added to and removed from the arrays, the current size of the arrays, and the specific prices at which elements were added.

```pinescript
//@version=6
indicator("Array as a stack", overlay = true)

// @function                Adds a new horizontal line to an array of lines at a specified pivot level.
// @param id                (array<line>) The array to which to add the new line.
// @param pivot             (float) The price level at which to draw the horizontal line.
// @param lineColor         (color) The color of the line.
// @returns                 (void) The function has no explicit return.
stackLine(array<line> id, float pivot, color lineColor) =>
    if not na(pivot)
        array.push(id, line.new(bar_index - 10, pivot, bar_index, pivot, color = lineColor))
        if barstate.isconfirmed
            log.info("\nNew line added at {0}\nArray size: {1}", pivot, id.size())

// @function                Extends the endpoint (`x2`) of each line in an array to the current `bar_index`.
// @param id                (array<line>) The array containing the line objects to update.
// @returns                 (void) The function has no explicit return.
extendLines(array<line> id) =>
    for eachLine in id
        eachLine.set_x2(bar_index)

// @function                Removes line objects from an array if they are above or below the current bar's high or low.
// @param id                (array<line>) The array from which to remove line objects.
// @param isBull            (bool) If true, remove bullish pivot lines below the high price;
//                          if false, remove bearish pivot line above the low price.
// @returns                 (void) The function has no explicit return.
removeLines(array<line> id, bool isBull) =>
    if array.size(id) > 0
        float linePrice = line.get_price(array.last(id), bar_index)
        if isBull ? high > linePrice : low < linePrice
            array.pop(id)
            if barstate.isconfirmed
                log.warning(
```
                    "\nLine removed from {0} array.\nPrice breached {1}\nArray size: {2}", 
                    isBull ? "Highs" : "Lows", linePrice, id.size()
                )

// Find the pivot high and pivot low prices.
float pivotLo = ta.pivotlow(10,  10), float pivotHi = ta.pivothigh(10, 10)

// Initialize two arrays on the first bar to stack our lines in.
var array<line> pivotHiArray = array.new<line>()
var array<line> pivotLoArray = array.new<line>()

// If a pivot occurs, draw a line from the pivot to the current bar and add the line to the stack.
stackLine(pivotHiArray, pivotHi, color.orange), stackLine(pivotLoArray, pivotLo, color.aqua)

// Extend all lines in each array to the current bar on each bar.
extendLines(pivotHiArray), extendLines(pivotLoArray)

// Check the final element of each array. If price exceeded the pivot lines, pop the line off the stack.
removeLines(pivotHiArray, true), removeLines(pivotLoArray, false)
Can I use matrices or multidimensional arrays in Pine Script?
Pine Script does not directly support multidimensional arrays; however, it provides matrices and user-defined types (UDTs).
Programmers can use these data structures to create and manipulate complex datasets.
Matrices
Pine Script matrices are like two-dimensional arrays. They organize data in a rectangular grid, facilitating operations like transformations, linear algebra, and other complex calculations. They are particularly useful for quantitative modeling, such as portfolio optimization, correlation matrix analysis, and more.
Just as in arrays, all elements in a matrix must be of the same type, which can be a built-in or a user-defined type. Pine Script provides a range of functions for manipulating and performing calculations on matrices, including addition, subtraction, multiplication, and more.
Using UDTs for multidimensional structures
Programmers can achieve similar functionality to multidimensional arrays through defining user-defined types (UDTs). For example, a script can define a UDT that includes an array as one of its fields. UDTs themselves can be contained in arrays. In this way, scripts can effectively have arrays of arrays.
For more information, see the sections on Matrices, Maps, and Objects in the User Manual.
How can I debug objects?
To debug objects, create custom functions that break down an object into its constituent fields and convert these fields into strings.
See the Debugging section of the User Manual for information about methods to display debug information.
In particular, Pine Logs can display extensive and detailed debug information. See the FAQ section about debugging arrays using Pine Logs for an explanation of using logs for debugging.
In our example script, we create a user-defined type (UDT) named openLine, which includes fields such as price, openTime, and a line object called level.
On the first bar of each session, the script initializes a new openLine instance. This object tracks the session’s opening price and time, and it draws a line at the open price, extending from the session’s start to
its close. An array stores each openLine object. A custom function debugOpenLine() breaks an openLine object into its individual fields, converts the fields to strings, and then logs a message that displays these strings in the console.

```pinescript
//@version=6
indicator("Debugging objects", overlay = true)

// Define the user-defined type.
type openLine
    float price
    int   openTime
```
    line  level

// @function            Queues a new `arrayElement` at the end of the `id` array and removes
//                      the first element if the array size exceeds the specified `maxSize`.
// @param id            (<any array type>) The array in which the element is queued.
// @param maxSize       (int) The maximum allowed number of elements in the array.
//                      If the array exceeds this size, the first element is removed.
// @param arrayElement  (<array type) The new element to add to the array.
// @returns             (<array type>) The removed element.
arrayQueue(id, int maxSize, value) =>
    id.push(value)
    if id.size() > maxSize
        id.shift()

// @function            Logs detailed information about an open line object for debugging purposes.
// @param ol            (openLine) The open line object to log.
// @returns             (void) Function has no explicit return.
debugOpenLine(openLine ol) =>
    if barstate.isconfirmed
        log.info(
            "\nprice: {0}\nopenTime: {1}\nlevel line coords:\nx1: {2}\ny1: {3}\nx2: {4}\ny2: {5}",
            ol.price, ol.openTime, str.format_time(ol.level.get_x1()), ol.level.get_y1(),
            str.format_time(ol.level.get_x2()), ol.level.get_y2()
        )

// Create an empty `openLine` array.
var openLineArray = array.new<openLine>()

// On session start, create a new `openLine` object and add it to the array.
// Use the custom debug function to print the object's fields to the Pine Logs pane.
if session.isfirstbar_regular
    openLine ol = openLine.new(open, time)
    ol.level := line.new(time, open, time_close("D"), open, xloc.bar_time, color = color.aqua)
    arrayQueue(openLineArray, 4, ol)
    debugOpenLine(ol)         Previous       Alerts      Next   Functions              On this pageWhat data structures can I use in Pine Script®?TuplesArraysMatricesObjectsMapsWhat’s the difference between a series and an array?How do I create and use arrays in Pine Script?What’s the difference between an array declared with or without var?What are queues and stacks?How can I perform operations on all elements in an array?What’s the most efficient way to search an array?Checking if a value is present in an arrayFinding the position of an elementBinary searchHow can I debug arrays?PlottingUsing labelsUsing label tooltipsUsing tablesUsing Pine LogsCan I use matrices or multidimensional arrays in Pine Script?How can I debug objects?