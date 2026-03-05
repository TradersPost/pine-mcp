# Arrays

**Tip:** This page contains advanced material. If you’re new to Pine Script®, start by learning about core language components — such as the type system and the basics of the execution model — and explore other, more accessible features before venturing further.
Introduction
Pine Script arrays are one-dimensional collections that can store multiple values or references in a single location. Arrays are a more robust alternative to declaring a set of similar variables (e.g., price00, price01, price02, …).
All elements in an array must be of the same built-in type, user-defined type, or enum type.
Similar to lines, labels, and other reference types, arrays and their data are accessed using references, which we often refer to as IDs. Pine Script does not use an indexing operator to access individual array elements. Instead, functions including array.get() and array.set() read and write the elements of the array associated with a specific ID.
Scripts access specific elements in an array by specifying an index in calls to these functions. The index starts at 0 and extends to one less than the number of elements in the array. Arrays in Pine Script can have dynamic sizes that vary across bars, as scripts can change the number of elements in an array on any execution. A single script can create multiple array instances. The total number of elements in any array cannot exceed 100,000.
NoteWe often refer to index 0 as the beginning of an array, and the highest index value as the end of the array.Additionally, for the sake of brevity, we sometimes use the term “array” to mean “array ID”.
Declaring arrays
Pine Script uses the following syntax for array declarations:
[var/varip ][array<type> ]<identifier> = <expression>
Where <type> is a type template that defines the type of elements that the array can contain, and <expression> is an expression that returns either the ID of an array or na. See the Collections section of the Type system page to learn about type templates.
When declaring an array variable, programmers can use the array keyword followed by a type template to explicitly define the variable’s type identifier (e.g., array<int> for a variable that can reference an array of “int” values).
NoticeIt is also possible to specify an array variable’s type by prefixing its declaration with the element type keyword, followed by empty square brackets ([]). For example, a variable whose declaration includes int[] as the type keyword accepts the type array<int>. However, this legacy format is deprecated; future versions of Pine Script might not support it. Therefore, we recommend using the array<type> format to define type identifiers for consistency.
Specifying a type identifier for a variable or function parameter that holds array references is usually optional. The only exceptions are when initializing an identifier with an na value, defining exported library functions whose parameters accept array IDs, or declaring user-defined types with fields for storing array IDs. Even when not required, note that specifying an array variable’s type helps promote readability, and it helps the Pine Editor provide relevant code suggestions.
The following line of code declares an array variable named prices that has an initial reference of na. This variable declaration requires a type identifier, because the compiler cannot automatically determine the type that na represents:
array<float> prices = na
Scripts can use the following functions to create new arrays: array.new<type>(), array.from(), or array.copy(). Each of these functions creates a new array and returns a non-na ID for use in other parts of the code. Note that these functions accept “series” arguments for all parameters, meaning the constructed arrays can have dynamic sizes and elements on each call.
The following example creates an empty “float” array and assigns its ID to a prices variable. Specifying a type identifier for the prices variable is not required in this case, because the variable automatically inherits the function’s returned type (array<float>):
prices = array.new<float>(0)
**Note:** The array namespace also includes legacy functions for creating arrays of specific built-in types. These functions include array.new_int(), array.new_float(), array.new_bool(), array.new_color(), array.new_string(), array.new_line(), array.new_linefill(), array.new_label(), array.new_box() and array.new_table().However, we recommend using the general-purpose array.new<type>() function, because it can create an array of any supported type, including user-defined types.
The initial_value parameter of the array.new*() functions enables users to set all initial elements in the array to a specified value or reference. If a call to these functions does not include an initial_value argument, it creates an array filled with na elements.
The following line declares an array variable named prices and assigns it the ID of an array containing two elements. Both elements in the array hold the current bar’s close value:
prices = array.new<float>(2, close)
To create an array without initializing all elements to the same value or reference, use array.from(). This function determines the array’s size and the type of elements it stores based on the arguments in the function call. All arguments supplied to the call must be of the same type.
For example, both lines of code in the following example show two ways to create a “bool” array using array.from() and declare a variable to store its ID:
statesArray = array.from(close > open, high != close)

array<bool> statesArray = array.from(close > open, high != close)
Using ​var​ and ​varip​ keywords
Programmers can use the
var and
varip
keywords to instruct a script to declare an array variable on only one bar instead of on each execution of the variable’s scope. Array
variables declared using these keywords point to the same array
instances until explicitly reassigned, allowing an array and its elements to persist across bars.
When declaring an array variable using these keywords and pushing a new
value to the end of the referenced array on each bar, the array will
grow by one on each bar and be of size bar_index + 1
(bar_index
starts at zero) by the time the script executes on the last bar, as this
code demonstrates:
```pinescript
//@version=6
indicator("Using `var`")
//@variable An array that expands its size by 1 on each bar.
var a = array.new<float>(0)
array.push(a, close)

if barstate.islast
    //@variable A string containing the size of `a` and the current `bar_index` value.
    string labelText = "Array size: " + str.tostring(a.size()) + "\nbar_index: " + str.tostring(bar_index)
    // Display the `labelText`.
    label.new(bar_index, 0, labelText, size = size.large)
```
The same code without the
var
keyword would reinitialize the a variable with the ID of a new, empty array on every execution. In that case, after
execution of the
array.push()
call, the
array.size() method
call (a.size()) would return a value of 1.
NoticeArray variables declared using varip behave similarly to those declared using var, with two key differences. Firstly, the arrays that they reference can finalize updates to their elements on any available tick — not only on a bar’s closing tick. Secondly, arrays referenced by varip variables can contain only the following data:
Values of any fundamental type.
IDs of the chart.point, footprint, or volume_row type.
References to objects of a user-defined type that have fields for storing only data of either of the above types or the IDs of other collections containing only these types.

Reading and writing array elements
Scripts can write values to existing individual array elements using
array.set(),
and read using array.get().
When using these functions, it is imperative that the index in the
function call is always less than or equal to the array’s size (because
array indices start at zero). To get the size of an array, use the
array.size()
function.
The following example uses the
set()
method to populate a fillColors array with instances of one base color
using different transparency levels. It then uses
array.get()
to retrieve one of the colors from the array based on the location of
the bar with the highest price within the last lookbackInput bars:

```pinescript
//@version=6
indicator("Distance from high", "", true)
lookbackInput = input.int(100)
FILL_COLOR = color.green
// Declare array and set its values on the first bar only.
var fillColors = array.new<color>(5)
if barstate.isfirst
    // Initialize the array elements with progressively lighter shades of the fill color.
    fillColors.set(0, color.new(FILL_COLOR, 70))
    fillColors.set(1, color.new(FILL_COLOR, 75))
    fillColors.set(2, color.new(FILL_COLOR, 80))
    fillColors.set(3, color.new(FILL_COLOR, 85))
    fillColors.set(4, color.new(FILL_COLOR, 90))

// Find the offset to highest high. Change its sign because the function returns a negative value.
lastHiBar = - ta.highestbars(high, lookbackInput)
// Convert the offset to an array index, capping it to 4 to avoid a runtime error.
// The index used by `array.get()` will be the equivalent of `floor(fillNo)`.
fillNo = math.min(lastHiBar / (lookbackInput / 5), 4)
// Set background to a progressively lighter fill with increasing distance from location of highest high.
bgcolor(array.get(fillColors, fillNo))
// Plot key values to the Data Window for debugging.
plotchar(lastHiBar, "lastHiBar", "", location.top, size = size.tiny)
plotchar(fillNo, "fillNo", "", location.top, size = size.tiny)
```
Another technique for initializing the elements in an array is to create
an empty array (an array with no elements), then use
array.push()
to append new elements to the end of the array, increasing the size
of the array by one on each call. The following code is functionally
identical to the initialization section from the preceding script:
// Declare array and set its values on the first bar only.
var fillColors = array.new<color>(0)
if barstate.isfirst
    // Initialize the array elements with progressively lighter shades of the fill color.
    array.push(fillColors, color.new(FILL_COLOR, 70))
    array.push(fillColors, color.new(FILL_COLOR, 75))
    array.push(fillColors, color.new(FILL_COLOR, 80))
    array.push(fillColors, color.new(FILL_COLOR, 85))
    array.push(fillColors, color.new(FILL_COLOR, 90))
This code is equivalent to the one above, but it uses
array.unshift()
to insert new elements at the beginning of the fillColors array:
// Declare array and set its values on the first bar only.
var fillColors = array.new<color>(0)
if barstate.isfirst
    // Initialize the array elements with progressively lighter shades of the fill color.
    array.unshift(fillColors, color.new(FILL_COLOR, 90))
    array.unshift(fillColors, color.new(FILL_COLOR, 85))
    array.unshift(fillColors, color.new(FILL_COLOR, 80))
    array.unshift(fillColors, color.new(FILL_COLOR, 75))
    array.unshift(fillColors, color.new(FILL_COLOR, 70))
We can also use
array.from()
to create the same fillColors array with a single function call:
```pinescript
//@version=6
indicator("Using `var`")
FILL_COLOR = color.green
var array<color> fillColors = array.from(
     color.new(FILL_COLOR, 70),
     color.new(FILL_COLOR, 75),
     color.new(FILL_COLOR, 80),
     color.new(FILL_COLOR, 85),
     color.new(FILL_COLOR, 90)
```
 )
// Cycle background through the array's colors.
bgcolor(array.get(fillColors, bar_index % (fillColors.size())))
The array.fill()
function points all array elements, or the elements within the index_from to index_to range, to a specified value. Without the
last two optional parameters, the function fills the whole array, so:
a = array.new<float>(10, close)
and:
a = array.new<float>(10)
a.fill(close)
are equivalent, but:
a = array.new<float>(10)
a.fill(close, 1, 3)
only fills the second and third elements (at index 1 and 2) of the array
with close. Note how the
array.fill() function’s
last parameter, index_to, must have a value one greater than the last index the
function will fill. The remaining elements will hold na values, as the
array.new<type>()
function call does not contain an initial_value argument.
Looping through array elements
When looping through an array’s element indices and the array’s size
is unknown, one can use the
array.size()
function to get the maximum index value. For example:
```pinescript
//@version=6
indicator("Protected `for` loop", overlay = true)
//@variable An array of `close` prices from the 1-minute timeframe.
```
array<float> a = request.security_lower_tf(syminfo.tickerid, "1", close)

```pinescript
//@variable A string representation of the elements in `a`.
string labelText = ""
for i = 0 to (array.size(a) == 0 ? na : array.size(a) - 1)
```
    labelText += str.tostring(array.get(a, i)) + "\n"

label.new(bar_index, high, text = labelText)
Note that:

We use the
request.security_lower_tf()
function which returns an array of
close
prices at the 1 minute timeframe.
This code example will throw an error if you use it on a chart
timeframe smaller than 1 minute.
for
loops do not execute if the to expression is
na.
Note that the to value is only evaluated once upon entry.

An alternative method to loop through an array is to use a
for…in
loop. This approach is a variation of the standard for loop that can
iterate over the value references and indices in an array. Here is an
example of how we can write the code example from above using a
for...in loop:
```pinescript
//@version=6
indicator("`for...in` loop", overlay = true)
//@variable An array of `close` prices from the 1-minute timeframe.
```
array<float> a = request.security_lower_tf(syminfo.tickerid, "1", close)

```pinescript
//@variable A string representation of the elements in `a`.
string labelText = ""
for price in a
```
    labelText += str.tostring(price) + "\n"

label.new(bar_index, high, text = labelText)
Note that:

for…in
loops can return a tuple containing each index and corresponding
element. For example, for [i, price] in a returns the i
index and price value for each element in a.

A
while
loop statement can also be used:
```pinescript
//@version=6
indicator("`while` loop", overlay = true)
```
array<float> a = request.security_lower_tf(syminfo.tickerid, "1", close)

string labelText = ""
int i = 0
while i < array.size(a)
    labelText += str.tostring(array.get(a, i)) + "\n"
    i += 1

label.new(bar_index, high, text = labelText)
Scope
Users can declare arrays within the global scope of a script, as well as
the local scopes of
functions,
methods, and
conditional structures. Unlike some of the other built-in types, namely
fundamental types, scripts can modify globally-assigned arrays from
within local scopes, allowing users to implement global variables that
any function in the script can directly interact with. We use the
functionality here to calculate progressively lower or higher price
levels:

```pinescript
//@version=6
indicator("Bands", "", true)
//@variable The distance ratio between plotted price levels.
factorInput = 1 + (input.float(-2., "Step %") / 100)
//@variable A single-value array holding the lowest `ohlc4` value within a 50 bar window from 10 bars back.
level = array.new<float>(1, ta.lowest(ohlc4, 50)[10])

nextLevel(val) =>
    newLevel = level.get(0) * val
    // Write new level to the global `level` array so we can use it as the base in the next function call.
    level.set(0, newLevel)
```
    newLevel

plot(nextLevel(1))
plot(nextLevel(factorInput))
plot(nextLevel(factorInput))
plot(nextLevel(factorInput))
History referencing
The history-referencing operator [] can
access the history of array variables, allowing scripts to interact with
past array instances previously assigned to a variable.
To illustrate this, let’s create a simple example to show how one can
fetch the previous bar’s close value in two equivalent ways. This
script uses the []
operator to get the array instance assigned to a on the previous bar,
then uses an
array.get()
method call to retrieve the value of the first element (previousClose1).
For previousClose2, we use the history-referencing operator on the
close variable directly to retrieve the value. As we see from the
plots, previousClose1 and previousClose2 both return the same value:

```pinescript
//@version=6
indicator("History referencing")

//@variable A single-value array declared on each bar.
a = array.new<float>(1)
// Set the value of the only element in `a` to `close`.
array.set(a, 0, close)

//@variable The array instance assigned to `a` on the previous bar.
previous = a[1]

previousClose1 = na(previous) ? na : previous.get(0)
previousClose2 = close[1]

plot(previousClose1, "previousClose1", color.gray, 6)
plot(previousClose2, "previousClose2", color.white, 2)
```
Inserting and removing array elements
Inserting
The following three functions can insert new elements into an array.
array.unshift()
inserts a new element at the beginning of an array (index 0) and
increases the index values of any existing elements by one.
array.insert()
inserts a new element at the specified index and increases the index
of existing elements at or after the index by one.

```pinescript
//@version=6
indicator("`array.insert()`")
a = array.new<float>(5, 0)
for i = 0 to 4
    array.set(a, i, i + 1)
if barstate.islast
    label.new(bar_index, 0, "BEFORE\na: " + str.tostring(a), size = size.large)
    array.insert(a, 2, 999)    
    label.new(bar_index, 0, "AFTER\na: " + str.tostring(a), style = label.style_label_up, size = size.large)
array.push()
```
adds a new element at the end of an array.
Removing
These four functions remove elements from an array. The first three also
return the value of the removed element.
array.remove()
removes the element at the specified index and returns that element’s
value.
array.shift()
removes the first element from an array and returns its value.
array.pop()
removes the last element of an array and returns its value.
array.clear()
removes all elements from an array. Note that clearing an array won’t
delete any objects its elements referenced. See the example below that
illustrates how this works:
```pinescript
//@version=6
indicator("`array.clear()` example", overlay = true)

// Create a label array and add a label to the array on each new bar.
var a = array.new<label>()
```
label lbl = label.new(bar_index, high, "Text", color = color.red)
array.push(a, lbl)

var table t = table.new(position.top_right, 1, 1)
// Clear the array on the last bar. This doesn't remove the labels from the chart. 
if barstate.islast
    array.clear(a)
    table.cell(t, 0, 0, "Array elements count: " + str.tostring(array.size(a)), bgcolor = color.yellow)
Using an array as a stack
Stacks are LIFO (last in, first out) constructions. They behave somewhat
like a vertical pile of books to which books can only be added or
removed one at a time, always from the top. Pine Script arrays can be
used as a stack, in which case we use the
array.push()
and
array.pop()
functions to add and remove elements at the end of the array.
array.push(prices, close) will add a new element to the end of the
prices array, increasing the array’s size by one.
array.pop(prices) will remove the end element from the prices array,
return its value and decrease the array’s size by one.
See how the functions are used here to track successive lows in rallies:

```pinescript
//@version=6
indicator("Lows from new highs", "", true)
var lows = array.new<float>(0)
flushLows = false

//@function Removes the last element from the `id` stack when `cond` is `true`.
array_pop(id, cond) => cond and array.size(id) > 0 ? array.pop(id) : float(na)

if ta.rising(high, 1)
    // Rising highs; push a new low on the stack.
    lows.push(low)
    // Force the return type of this `if` block to be the same as that of the next block.
    bool(na)
else if lows.size() >= 4 or low < array.min(lows)
    // We have at least 4 lows or price has breached the lowest low;
    // sort lows and set flag indicating we will plot and flush the levels.
    array.sort(lows, order.ascending)
    flushLows := true

// If needed, plot and flush lows.
lowLevel = array_pop(lows, flushLows)
plot(lowLevel, "Low 1", low > lowLevel ? color.silver : color.purple, 2, plot.style_linebr)
lowLevel := array_pop(lows, flushLows)
plot(lowLevel, "Low 2", low > lowLevel ? color.silver : color.purple, 3, plot.style_linebr)
lowLevel := array_pop(lows, flushLows)
plot(lowLevel, "Low 3", low > lowLevel ? color.silver : color.purple, 4, plot.style_linebr)
lowLevel := array_pop(lows, flushLows)
plot(lowLevel, "Low 4", low > lowLevel ? color.silver : color.purple, 5, plot.style_linebr)

if flushLows
    // Clear remaining levels after the last 4 have been plotted.
    lows.clear()
```
Using an array as a queue
Queues are FIFO (first in, first out) constructions. They behave
somewhat like cars arriving at a red light. New cars are queued at the
end of the line, and the first car to leave will be the first one that
arrived to the red light.
In the following code example, we let users decide through the script’s
inputs how many labels they want to have on their chart. We use that
quantity to determine the size of the array of labels we then create,
initializing the array’s elements to na.
When a new pivot is detected, we create a label for it, saving the
label’s ID in the pLabel variable. We then queue the ID of that label
by using
array.push()
to append the new label’s ID to the end of the array, making our array
size one greater than the maximum number of labels to keep on the chart.
Lastly, we de-queue the oldest label by removing the array’s first
element using
array.shift()
and deleting the label referenced by that array element’s value. As we
have now de-queued an element from our queue, the array contains
pivotCountInput elements once again. Note that on the dataset’s first
bars we will be deleting na label IDs until the maximum number of
labels has been created, but this does not cause runtime errors. Let’s
look at our code:

```pinescript
//@version=6
MAX_LABELS = 100
indicator("Show Last n High Pivots", "", true, max_labels_count = MAX_LABELS)

pivotCountInput = input.int(5, "How many pivots to show", minval = 0, maxval = MAX_LABELS)
pivotLegsInput  = input.int(3, "Pivot legs", minval = 1, maxval = 5)

// Create an array containing the user-selected max count of label IDs.
var labelIds = array.new<label>(pivotCountInput)

pHi = ta.pivothigh(pivotLegsInput, pivotLegsInput)
if not na(pHi)
    // New pivot found; plot its label `pivotLegsInput` bars behind the current `bar_index`.
    pLabel = label.new(bar_index - pivotLegsInput, pHi, str.tostring(pHi, format.mintick), textcolor = color.white)
    // Queue the new label's ID by appending it to the end of the array.
    array.push(labelIds, pLabel)
    // De-queue the oldest label ID from the queue and delete the corresponding label.
    label.delete(array.shift(labelIds))
```
Negative indexing
The array.get(), array.set(), array.insert(), and array.remove() functions support negative indexing, which references elements starting from the end of the array. An index of -1 refers to the last element in the array, an index of -2 refers to the second to last element, and so on.
When using a positive index, functions traverse the array forwards from the beginning of the array (first to last element). The first element’s index is 0, and the last element’s index is array.size() - 1. When using a negative index, functions traverse the array backwards from the end of the array (last to first element). The last element’s index is -1, and the first element’s index is –array.size():
array<string> myArray = array.from("first", "second", "third", "fourth", "last")

// Positive indexing: Indexes forwards from the beginning of the array.
myArray.get(0)                        // Returns "first" element
myArray.get(myArray.size() - 1)       // Returns "last" element
myArray.get(4)                        // Returns "last" element

// Negative indexing: Indexes backwards from the end of the array.
myArray.get(-1)                       // Returns "last" element
myArray.get(-myArray.size())          // Returns "first" element
myArray.get(-5)                       // Returns "first" element
Like positive indexing, negative indexing is bound by the size of the array. For example, functions operating on an array of 5 elements only accept indices of 0 to 4 (first to last element) or -1 to -5 (last to first element). Any other indices are out of bounds and will raise a runtime error.
We can use negative indices to retrieve, update, add, and remove array elements. This simple script creates an “int” countingArray and calls the array.get(), array.set(), array.insert(), and array.remove() functions to perform various array operations using negative indices. It displays each array operation and its corresponding result using a table:

```pinescript
//@version=6
indicator("Negative indexing demo", overlay = false)

//@variable A table that displays various array operations and their results.
var table displayTable = table.new(
```
     position.middle_center, 2, 15, bgcolor = color.white, 
     frame_color = color.black, frame_width = 1, border_width = 1
 )

```pinescript
//@function Initializes a `displayTable` row to output a "string" of an `arrayOperation` and the `operationResult`.
displayRow(int rowID, string arrayOperation, operationResult) =>
    //@variable Is white if the `rowID` is even, light blue otherwise. Used to set alternating table row colors.
    color rowColor = rowID % 2 == 0 ? color.white : color.rgb(33, 149, 243, 75)
    // Display the `arrayOperation` in the row's first cell.
    displayTable.cell(0, rowID, arrayOperation, text_color = color.black, 
         text_halign = text.align_left, bgcolor = rowColor, text_font_family = font.family_monospace
```
     )
    // Display the `operationResult` in the row's second cell.
    displayTable.cell(1, rowID, str.tostring(operationResult), text_color = color.black, 
         text_halign = text.align_right, bgcolor = rowColor
     )

if barstate.islastconfirmedhistory
```pinescript
    //@variable Array of "int" numbers. Holds six multiples of 10, counting from 10 to 60.
```
    array<int> countingArray = array.from(10, 20, 30, 40, 50, 60)

    // Initialize the table's header cells.
    displayTable.cell(0, 0, "ARRAY OPERATION")
    displayTable.cell(1, 0, "RESULT")

    // Display the initial `countingArray` values.
    displayTable.cell(0, 1, "Initial `countingArray`", 
         text_color = color.black, text_halign = text.align_center, bgcolor = color.yellow)
    displayTable.cell(1, 1, str.tostring(countingArray), 
         text_color = color.black, text_halign = text.align_right, bgcolor = color.yellow)

    // Retrieve array elements using negative indices in `array.get()`.
    displayRow(2, "`countingArray.get(0)`", countingArray.get(0))
    displayRow(3, "`countingArray.get(-1)`", countingArray.get(-1))
    displayRow(4, "`countingArray.get(-countingArray.size())`", countingArray.get(-countingArray.size()))

    // Update array elements using negative indices in `array.set()` and `array.insert()`.
    countingArray.set(-2, 99)
    displayRow(5, "`countingArray.set(-2, 99)`", countingArray)

    countingArray.insert(-5, 878)
    displayRow(6, "`countingArray.insert(-5, 878)`", countingArray)

    // Remove array elements using negative indices in `array.remove()`.
    countingArray.remove(-3)
    displayRow(7, "`countingArray.remove(-3)`", countingArray)
Note that not all array operations can use negative indices. For example, search functions like array.indexof() and array.binary_search() return the positive index of an element if it’s found in the array. If the value is not found, the functions return -1. However, this returned value is not a negative index, and using it as one would incorrectly reference the last array element. If a script needs to use a search function’s returned index in subsequent array operations, it must appropriately differentiate between this -1 result and other valid indices.
Calculations on arrays
While series variables can be viewed as a horizontal set of values
stretching back in time, Pine Script’s one-dimensional arrays can be
viewed as vertical structures residing on each bar. As an array’s set
of elements is not a
time series,
Pine Script’s usual mathematical functions are not allowed on them.
Special-purpose functions must be used to operate on all of an array’s
values. The available functions are:
array.abs(),
array.avg(),
array.covariance(),
array.min(),
array.max(),
array.median(),
array.mode(),
array.percentile_linear_interpolation(),
array.percentile_nearest_rank(),
array.percentrank(),
array.range(),
array.standardize(),
array.stdev(),
array.sum(),
array.variance().
Note that contrary to the usual mathematical functions in Pine Script,
those used on arrays do not return na when some of the values they
calculate on have na values. There are a few exceptions to this rule:

When all array elements have na value or the array contains no
elements, na is returned. array.standardize() however, will
return an empty array.
array.mode() will return na when no mode is found.

Manipulating arrays
Concatenation
Two arrays can be merged — or concatenated — using
array.concat().
When arrays are concatenated, the second array is appended to the end of
the first, so the first array is modified while the second one remains
intact. The function returns the array ID of the first array:

```pinescript
//@version=6
indicator("`array.concat()`")
a = array.new<float>(0)
b = array.new<float>(0)
array.push(a, 0)
array.push(a, 1)
array.push(b, 2)
array.push(b, 3)
if barstate.islast
    label.new(bar_index, 0, "BEFORE\na: " + str.tostring(a) + "\nb: " + str.tostring(b), size = size.large)
    c = array.concat(a, b)
    array.push(c, 4)
    label.new(bar_index, 0, "AFTER\na: " + str.tostring(a) + "\nb: " + str.tostring(b) + "\nc: " + str.tostring(c), style = label.style_label_up, size = size.large)
```
Copying
Scripts can create copies of an array by using array.copy(). This function creates a new array with the same elements and returns that array’s unique ID. Changes to a copied array do not directly affect the original.
For example, the following script creates a new array with array.new<float>() and assigns its ID to the a variable. Then, it calls array.copy(a) to copy that array, and it assigns the copied array’s ID to the b variable. Any changes to the array referenced by b do not affect the one referenced by a, because both variables refer to separate array objects:

```pinescript
//@version=6
indicator("`array.copy()`")
a = array.new<float>(0)
array.push(a, 0)
array.push(a, 1)
if barstate.islast
    b = array.copy(a)
    array.push(b, 2)
    label.new(bar_index, 0, "a: " + str.tostring(a) + "\nb: " + str.tostring(b), size = size.large)
```
Note that assigning one variable’s stored array ID to another variable does not create a copy of the referenced array. For example, if we use b = a instead of b = array.copy(a) in the above script, the b variable does not reference a copy of the array referenced by a. Instead, both variables hold a reference to the same array. In that case, the call array.push(b, 2) directly modifies the array referenced by a, and the label’s text shows identical results for the two variables.
Joining
The array.join() function converts an “int”, “float”, or “string” array’s elements into strings, then joins each one to form a single “string” value with a specified separator inserted between each combined value. It provides a convenient alternative to converting values to strings with str.tostring() and performing repeated string concatenation operations.
The following script demonstrates the array.join() function’s behaviors. It requests tuples of “string”, “int”, and “float” values from three different contexts with request.security() calls, creates separate arrays for each type with array.from(), then creates joined strings with the array.join() function. Lastly, it creates another array from those strings with array.from() and joins them with another array.join() call, using a newline as the separator, and displays the final string in the table:

```pinescript
//@version=6
indicator("Joining demo")

//@function Returns a tuple containing the ticker ID ("string"), bar index ("int"), and closing price ("float"). 
dataRequest() =>
    [syminfo.tickerid, bar_index, close]

if barstate.islast
    //@variable A single-cell table displaying the results of `array.join()` calls.
    var table displayTable = table.new(position.middle_center, 1, 1, color.blue)
    // Request data for three symbols. 
    [ticker1, index1, price1] = request.security("SPY", "", dataRequest())
    [ticker2, index2, price2] = request.security("GLD", "", dataRequest())
    [ticker3, index3, price3] = request.security("TLT", "", dataRequest())

    // Create separate "string", "int", and "float" arrays to hold the requested data.
```
    array<string> tickerArray = array.from(ticker1, ticker2, ticker3)
    array<int> indexArray = array.from(index1, index2, index3)
    array<float> priceArray = array.from(price1, price2, price3)

    // Convert each array's data to strings and join them with different separators. 
    string joined1 = array.join(tickerArray, ", ")
    string joined2 = indexArray.join("|")
    string joined3 = priceArray.join("\n")

```pinescript
    //@variable A joined "string" containing the `joined1`, `joined2`, and `joined3` values. 
    string displayText = array.from(joined1, joined2, joined3).join("\n---\n")
    // Initialize a cell to show the `displayText`.
    displayTable.cell(0, 0, displayText, text_color = color.white, text_size = 36)
```
Note that:

Each array.join() call inserts the specified separator only between each element string. It does not include the separator at the start or end of the returned value.
The array.join() function uses the same numeric format as the default for str.tostring(). See the String conversion and formatting section of the Strings page to learn more.
Calls to array.join() cannot directly convert elements of “bool”, “color”, or other types to strings. Scripts must convert data of these types separately.

Sorting
Scripts can sort arrays containing “int”, “float”, or “string” elements in ascending or descending order using the array.sort() function. The direction in which the function sorts the array’s elements depends on its order parameter, which accepts the order.ascending or order.descending constants. The default argument is order.ascending, meaning the function sorts the elements in ascending order of value.
The function sorts arrays of “int” and “float” elements based on their numeric values.
The example below declares two arrays with references assigned to the a and b variables, and it concatenates those arrays to form a combined c array. The script creates Pine Logs showing formatted text representing the unsorted arrays, and the results of using array.sort() to sort all three arrays in ascending and descending order:

```pinescript
//@version=6
indicator("Sorting numeric arrays demo")

if barstate.isfirst
    //@variable A formatting string.
    string formatString = "\n{0}:\n{1}\n{2}\n{3}"

    // Create two three-element arrays.
```
    array<float> a = array.from(2.1, 0.5, 1.2)
    array<float> b = array.from(0.1, 1.4, 0.6)
```pinescript
    //@variable A combined array containing the elements from `a` and `b`. 
```
    array<float> c = array.copy(a).concat(b)

    // Log formatted text showing the unsorted `a`, `b`, and `c` arrays. 
    log.info(formatString, "Unsorted", a, b, c)

    // Sort the `a`, `b`, and `c` arrays in ascending order (default).
    array.sort(a)
    array.sort(b)
    c.sort()

    // Log formatted text showing the `a`, `b`, and `c` arrays sorted in ascending order. 
    log.info(formatString, "Ascending", a, b, c)

    // Sort the `a`, `b`, and `c` arrays in descending order.
    a.sort(order.descending)
    b.sort(order.descending)
    c.sort(order.descending)

    // Log formatted text showing the `a`, `b`, and `c` arrays sorted in descending order. 
    log.info(formatString, "Descending", a, b, c)
Note that:

Each array.sort() call directly modifies the order of the elements in the original array. To get sorted elements without reorganizing the original array, use the array.sort_indices() function. This function returns a new array of “int” values representing the indices of the elements sorted in ascending or descending order.

The array.sort() function sorts arrays of “string” values based on the Unicode values of their characters. The sorting algorithm starts with each element’s first character position, then successively uses additional characters if multiple elements have matching characters at the same position.
This example creates an array of arbitrary strings on the first bar, then sorts the array’s contents in ascending order with an array.sort() call. The script logs formatted representations of the array in the Pine Logs pane before and after calling the array.sort() function:

```pinescript
//@version=6
indicator("Sorting string arrays demo")

if barstate.isfirst

    //@variable An array of arbitrary "string" values. 
```
    array<string> stringArray = array.from("abC", "Abc", "ABc", "ABC", "!", "123", "12.3", " ")

    // Log the original `stringArray`.
    log.info("Unsorted: {0}", stringArray)

    // Sort the array in ascending order (default) and log the result.
    stringArray.sort()
    log.info("Ascending: {0}", stringArray)
Note that:

Whitespace and control characters have lower Unicode values than other characters, which is why the " " element appears first in the sorted array.
Some ASCII punctuation marks and symbols have lower Unicode values than digit or letter characters. The "!" element comes before the elements with word characters because its Unicode value is U+0021. However, some other ASCII punctuation and symbol characters, such as the Left Curly Bracket { (U+007B), have higher Unicode values than ASCII digits and letters.
ASCII digits have lower Unicode values than letter characters. For example, the 1 character’s value is U+0031, and the A character’s value is U+0041.
Uppercase ASCII letters come before lowercase characters in the Unicode Standard. For instance, the a character has the Unicode value U+0061, which is larger than the value for A.

Reversing
Use
array.reverse()
to reverse an array:
```pinescript
//@version=6
indicator("`array.reverse()`")
a = array.new<float>(0)
array.push(a, 0)
array.push(a, 1)
array.push(a, 2)
if barstate.islast
    array.reverse(a)
    label.new(bar_index, 0, "a: " + str.tostring(a))
```
Slicing
Slicing an array using
array.slice()
creates a shallow copy of a subset of the parent array. You determine
the size of the subset to slice using the index_from and index_to
parameters. The index_to argument must be one greater than the end of
the subset you want to slice.
The shallow copy created by the slice acts like a window on the parent
array’s content. The indices used for the slice define the window’s
position and size over the parent array. If, as in the example below, a
slice is created from the first three elements of an array (indices 0 to
2), then regardless of changes made to the parent array, and as long as
it contains at least three elements, the shallow copy will always
contain the parent array’s first three elements.
Additionally, once the shallow copy is created, operations on the copy
are mirrored on the parent array. Adding an element to the end of the
shallow copy, as is done in the following example, will widen the window
by one element and also insert that element in the parent array at index
3. In this example, to slice the subset from index 0 to index 2 of array
a, we must use sliceOfA = array.slice(a, 0, 3):

```pinescript
//@version=6
indicator("`array.slice()`")
a = array.new<float>(0)
array.push(a, 0)
array.push(a, 1)
array.push(a, 2)
array.push(a, 3)
if barstate.islast
    // Create a shadow of elements at index 1 and 2 from array `a`.
    sliceOfA = array.slice(a, 0, 3)
    label.new(bar_index, 0, "BEFORE\na: " + str.tostring(a) + "\nsliceOfA: " + str.tostring(sliceOfA))
    // Remove first element of parent array `a`.
    array.remove(a, 0)
    // Add a new element at the end of the shallow copy, thus also affecting the original array `a`.
    array.push(sliceOfA, 4)
    label.new(bar_index, 0, "AFTER\na: " + str.tostring(a) + "\nsliceOfA: " + str.tostring(sliceOfA), style = label.style_label_up)
```
Searching arrays
We can test if a value is part of an array with the
array.includes()
function, which returns true if the element is found. We can find the
first occurrence of a value in an array by using the
array.indexof()
function. The first occurence is the one with the lowest index. We can
also find the last occurrence of a value with
array.lastindexof():
```pinescript
//@version=6
indicator("Searching in arrays")
valueInput = input.int(1)
a = array.new<float>(0)
array.push(a, 0)
array.push(a, 1)
array.push(a, 2)
array.push(a, 1)
if barstate.islast
    valueFound      = array.includes(a, valueInput)
    firstIndexFound = array.indexof(a, valueInput)
    lastIndexFound  = array.lastindexof(a, valueInput)
    label.new(bar_index, 0, "a: " + str.tostring(a) + 
```
      "\nFirst " + str.tostring(valueInput) + (firstIndexFound != -1 ? " value was found at index: " + str.tostring(firstIndexFound) : " value was not found.") +
      "\nLast " + str.tostring(valueInput)  + (lastIndexFound  != -1 ? " value was found at index: " + str.tostring(lastIndexFound) : " value was not found."))
We can also perform a binary search on an array but note that performing
a binary search on an array means that the array will first need to be
sorted in ascending order only. The
array.binary_search()
function will return the value’s index if it was found or -1 if it
wasn’t. If we want to always return an existing index from the array
even if our chosen value wasn’t found, then we can use one of the other
binary search functions available. The
array.binary_search_leftmost()
function, which returns an index if the value was found or the first
index to the left where the value would be found. The
array.binary_search_rightmost()
function is almost identical and returns an index if the value was found
or the first index to the right where the value would be found.
NoticeSearch functions like array.indexof() and array.binary_search() return an array index if the requested element is found, or -1 if it’s not present. Note that these functions only return positive indices, while other functions like array.get() accept both positive and negative indices. Ensure that scripts do not misconstrue a search function’s returned -1 result as a negative index in their subsequent logic.
Error handling
Malformed array.*() call syntax in Pine scripts will cause the usual
compiler error messages to appear in Pine Editor’s console, at the
bottom of the window, when you save a script. Refer to the Pine Script
v6 Reference
Manual when in
doubt regarding the exact syntax of function calls.
Scripts using arrays can also throw runtime errors, which appear as
an exclamation mark next to the indicator’s name on the chart. We
discuss those runtime errors in this section.
Index xx is out of bounds. Array size is yy
This error is the most frequent one programmers encounter when using arrays. The error occurs when the script references a nonexistent array index. The “xx”
value represents the out-of-bounds index the function tried to use, and “yy” represents the array’s size. Recall that array indices start at zero — not one — and end at the array’s size, minus one. For instance, the last valid index in a three-element array is 2.
To avoid this error, you must make provisions in your code logic to prevent using an index value outside the array’s boundaries. This code example generates the error because the last i value in the loop’s iterations is beyond the valid index range for the a array:
```pinescript
//@version=6
indicator("Out of bounds index")
a = array.new<float>(3)
for i = 1 to 3
    array.set(a, i, i)
plot(array.pop(a))
```
To resolve the error, last i value in the loop statement should be less than or equal to 2:
for i = 0 to 2
To iterate over all elements in an array of unknown size with a for loop, set the loop counter’s final value to one less than the array.size() value:
```pinescript
//@version=6
indicator("Protected `for` loop")
sizeInput = input.int(0, "Array size", minval = 0, maxval = 100000)
a = array.new<float>(sizeInput)
for i = 0 to (array.size(a) == 0 ? na : array.size(a) - 1)
    array.set(a, i, i)
plot(array.pop(a))
```
When sizing arrays dynamically using a field in the script’s
Settings/Inputs tab, protect the boundaries of that value using
input.int()‘s
minval and maxval parameters:
```pinescript
//@version=6
indicator("Protected array size")
sizeInput = input.int(10, "Array size", minval = 1, maxval = 100000)
a = array.new<float>(sizeInput)
for i = 0 to sizeInput - 1
    array.set(a, i, i)
plot(array.size(a))
```
See the Looping through array elements
section of this page for more information.
Cannot call array methods when ID of array is ‘na’
If an array variable is initialized with na, using array.*() functions on that variable is not allowed, because the variable does not store the ID of an existing array. Note that an empty array containing no elements still has a valid ID. A variable that references an empty array still holds a valid ID, whereas a variable that stores na does not. The code below demonstrates this error:
```pinescript
//@version=6
indicator("Array methods on `na` array")
```
array<int> a = na
array.push(a, 111)
label.new(bar_index, 0, "a: " + str.tostring(a))
To avoid the error, create an empty array and assign its reference to the variable instead. For example:
array<int> a = array.new<int>(0)
Note that the array<int> type identifier in the above declaration is optional. We can define the variable without it. For example:
a = array.new<int>(0)
Array is too large. Maximum size is 100000
This error appears if your code attempts to declare an array with a
size greater than 100,000. It will also occur if, while dynamically
appending elements to an array, a new element would increase the
array’s size past the maximum.
Cannot create an array with a negative size
We haven’t found any use for arrays of negative size yet, but if you
ever do, we may allow them :)
Cannot use shift() if array is empty.
This error occurs if
array.shift()
is called to remove the first element of an empty array.
Cannot use pop() if array is empty.
This error occurs if
array.pop()
is called to remove the last element of an empty array.
Index ‘from’ should be less than index ‘to’
When two indices are used in functions such as
array.slice(),
the first index must always be smaller than the second one.
Slice is out of bounds of the parent array
This message occurs whenever the parent array’s size is modified in
such a way that it makes the shallow copy created by a slice point
outside the boundaries of the parent array. This code will reproduce it
because after creating a slice from index 3 to 4 (the last two elements
of our five-element parent array), we remove the parent’s first
element, making its size four and its last index 3. From that moment on,
the shallow copy which is still pointing to the “window” at the parent
array’s indices 3 to 4, is pointing out of the parent array’s
boundaries:
```pinescript
//@version=6
indicator("Slice out of bounds")
a = array.new<float>(5, 0)
b = array.slice(a, 3, 5)
array.remove(a, 0)
c = array.indexof(b, 2)
plot(c)         Previous       Methods      Next   Matrices              On this pageOverviewIntroductionDeclaring arraysUsing var and varip keywordsReading and writing array elementsLooping through array elementsScopeHistory referencingInserting and removing array elementsInsertingRemovingUsing an array as a stackUsing an array as a queueNegative indexingCalculations on arraysManipulating arraysConcatenationCopyingJoiningSortingReversingSlicingSearching arraysError handlingIndex xx is out of bounds. Array size is yyCannot call array methods when ID of array is ‘na’Array is too large. Maximum size is 100000Cannot create an array with a negative sizeCannot use shift() if array is empty.Cannot use pop() if array is empty.Index ‘from’ should be less than index ‘to’Slice is out of bounds of the parent array
```