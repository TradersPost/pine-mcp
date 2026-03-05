# Time

Introduction
In Pine Script®, the following key aspects apply when working with date and time values:

UNIX timestamp: The native format for time values in Pine, representing the absolute number of milliseconds elapsed since midnight UTC on 1970-01-01. Several built-ins return UNIX timestamps directly, which users can format into readable dates and times. See the UNIX timestamps section below for more information.
Exchange time zone: The time zone of the instrument’s exchange. All calendar-based variables hold values expressed in the exchange time zone, and all built-in function overloads that have a timezone parameter use this time zone by default.
Chart time zone: The time zone the chart and Pine Logs message prefixes use to express time values. Users can set the chart time zone using the “Timezone” input in the “Symbol” tab of the chart’s settings. This setting only changes the display of dates and times on the chart and the times that prefix logged messages. It does not affect the behavior of Pine scripts because they cannot access a chart’s time zone information.
timezone parameter: A “string” parameter of time-related functions that specifies the time zone used in their calculations. For calendar-based functions, such as dayofweek(), the timezone parameter determines the time zone of the returned value. For functions that return UNIX timestamps, such as time(), the specified timezone defines the time zone of other applicable parameters, e.g., session. See the Time zone strings section to learn more.

UNIX timestamps
UNIX time is a standardized date and time representation that measures the number of non-leap seconds elapsed since January 1, 1970 at 00:00:00 UTC (the UNIX Epoch), typically expressed in seconds or smaller time units. A UNIX time value in Pine Script is an “int” timestamp representing the number of milliseconds from the UNIX Epoch to a specific point in time.
Because a UNIX timestamp represents the number of consistent time units elapsed from a fixed historical point (epoch), its value is time zone-agnostic. A UNIX timestamp in Pine always corresponds to the same distinct point in time, accurate to the millisecond, regardless of a user’s location.
For example, the UNIX timestamp 1723472500000 always represents the time 1,723,472,500,000 milliseconds (1,723,472,500 seconds) after the UNIX Epoch. This timestamp’s meaning does not change relative to any time zone.
To format an “int” UNIX timestamp into a readable date/time “string” expressed in a specific time zone, use the str.format_time() function. The function does not modify UNIX timestamps. It simply represents timestamps in a desired human-readable format.
For instance, the function can represent the UNIX timestamp 1723472500000 as a “string” in several ways, depending on its format and timezone arguments, without changing the absolute point in time that it refers to. The simple script below calculates three valid representations of this timestamp and displays them in the Pine Logs pane:

```pinescript
//@version=6
indicator("UNIX timestamps demo")

//@variable A UNIX time value representing the specific point 1,723,472,500,000 ms after the UNIX Epoch. 
int unixTimestamp = 1723472500000

// These are a few different ways to express the `unixTimestamp` in a relative, human-readable format.
// Despite their format and time zone differences, all the calculated strings represent the SAME distinct point: 
string isoExchange  = str.format_time(unixTimestamp)
string utcDateTime  = str.format_time(unixTimestamp, "MM/dd/yyyy HH:mm:ss.S", "UTC+0")
string utc4TimeDate = str.format_time(unixTimestamp, "hh:mm:ss a, MMMM dd, yyyy z", "UTC+4")

// Log the `unixTimestamp` and the custom "string" representations on the first bar.
if barstate.isfirst
    log.info(
```
        "\nUNIX time (ms): {0, number, #}\nISO 8601 representation (Exchange time zone): {1}"
        + "\nCustom date and time representation (UTC+0 time zone): {2}"
        + "\nCustom time and date representation (UTC+4 time zone): {3}",
        unixTimestamp, isoExchange, utcDateTime, utc4TimeDate
    )
Note that:

The value enclosed within square brackets in the logged message is an automatic prefix representing the historical time of the log.info() call in ISO 8601 format, expressed in the chart time zone.
The script concatenates three literal strings to create one long formatString argument for the log.info() call.

See the Formatting dates and times section to learn more about representing UNIX timestamps with formatted strings.
Time zones
A time zone is a geographic region with an assigned local time. The specific time within a time zone is consistent throughout the region. Time zone boundaries typically relate to a location’s longitude. However, in practice, they tend to align with administrative boundaries rather than strictly following longitudinal lines.
The local time within a time zone depends on its defined offset from Coordinated Universal Time (UTC), which can range from UTC-12:00 (12 hours behind UTC) to UTC+14:00 (14 hours ahead of UTC). Some regions maintain a consistent offset from UTC, and others have an offset that changes over time due to daylight saving time (DST) and other factors.
Two primary time zones apply to data feeds and TradingView charts: the exchange time zone and the chart time zone.
The exchange time zone represents the time zone of the current symbol’s exchange, which Pine scripts can access with the syminfo.timezone variable. Calendar-based variables, such as month, dayofweek, and hour, always hold values expressed in the exchange time zone, and all time function overloads that have a timezone parameter use this time zone by default.
The chart time zone is a visual preference that defines how the chart and the time prefixes of Pine Logs represent time values. To set the chart time zone, use the “Timezone” input in the “Symbol” tab of the chart’s settings or click on the current time shown below the chart. The specified time zone does not affect time calculations in Pine scripts because they cannot access this chart information. Although scripts cannot access a chart’s time zone, programmers can provide inputs that users can adjust to match the time zone.
For example, the script below uses str.format_time() to represent the last historical bar’s opening and closing UNIX timestamps (time and time_close values) as date-time strings expressed in the function’s default time zone, the exchange time zone, UTC-0, and a user-specified time zone. It uses a table to display all four representations in the bottom-right corner of the chart for comparison:

```pinescript
//@version=6
indicator("Time zone comparison demo", overlay = true) 

//@variable The time zone of the time values in the last table row. 
//          The "string" can contain either UTC offset notation or an IANA time zone identifier. 
string timezoneInput = input.string("UTC+4:00", "Time zone")

//@variable A `table` showing strings representing bar times in three preset time zones and a custom time zone. 
var table displayTable = table.new(
```
     position.bottom_right, columns = 3, rows = 5, border_color = chart.fg_color, border_width = 2
 )

```pinescript
//@function Initializes three `displayTable` cells on the `row` that show the `title`, `text1`, and `text2` strings. 
tableRow(int row, string title, string text1, string text2, color titleColor = #9b27b066, color infoColor = na) =>
    displayTable.cell(0, row, title, bgcolor = titleColor, text_color = chart.fg_color)
    displayTable.cell(1, row, text1, bgcolor = infoColor,  text_color = chart.fg_color)
    displayTable.cell(2, row, text2, bgcolor = infoColor,  text_color = chart.fg_color)

if barstate.islastconfirmedhistory
    // Draw an empty label to signify the bar that the displayed time strings represent.
    label.new(bar_index, high, color = #9b27b066, size = size.huge)

    //@variable The formatting string for all `str.format_time()` calls. Sets the format of the date-time strings. 
    var string formatString = "yyyy-MM-dd  HH:mm:ss"
    // Initialize a header row at the top of the `displayTable`.
    tableRow(0, "", "OPEN time", "CLOSE time", na, #9b27b066)
    // Initialize a row showing the bar's times in the default time zone (no specified `timezone` arguments).
    tableRow(1, "Default", str.format_time(time, formatString), str.format_time(time_close, formatString))
    // Initialize a row showing the bar's times in the exchange time zone (`syminfo.timezone`).
    tableRow(2, "Exchange: " + syminfo.timezone, 
         str.format_time(time, formatString, syminfo.timezone),
         str.format_time(time_close, formatString, syminfo.timezone)
```
     )  
    // Initialize a row showing the bar's times in the UTC-0 time zone (using "UTC" as the `timezone` arguments).
    tableRow(3, "UTC-0", str.format_time(time, formatString, "UTC"), str.format_time(time_close, formatString, "UTC"))
    
    // Initialize a row showing the bar's times in the custom time zone (`timezoneInput`).
    tableRow(
         4, "Custom: " + timezoneInput, 
         str.format_time(time, formatString, timezoneInput), 
         str.format_time(time_close, formatString, timezoneInput)
     )
Note that:

The label on the chart signifies which bar’s times the displayed strings represent.
The “Default” and “Exchange” rows in the table show identical results because syminfo.timezone is the str.format_time() function’s default timezone argument.
The exchange time zone on our example chart appears as "America/New_York", the IANA identifier for the NASDAQ exchange’s time zone. It represents UTC-4 or UTC-5, depending on the time of year. See the next section to learn more about time zone strings.

Time zone strings
All built-in functions with a timezone parameter accept a “string” argument specifying the time zone they use in their calculations. These functions can accept time zone strings in either of the following formats:

UTC (or GMT) offset notation, e.g., "UTC-5", "UTC+05:30", "GMT+0100"
IANA database notation, e.g., "America/New_York", "Asia/Calcutta", "Europe/Paris"

The IANA time zone database reference page lists possible time zone identifiers and their respective UTC offsets. The listed identifiers are valid as timezone arguments.
Note that various time zone strings expressed in UTC or IANA notation can represent the same offset from Coordinated Universal Time. For instance, these strings all represent a local time three hours ahead of UTC:

"UTC+3"
"GMT+03:00"
"Asia/Kuwait"
"Europe/Moscow"
"Africa/Nairobi"

For the str.format_time() function and the functions that calculate calendar-based values from a UNIX timestamp, including month(), dayofweek(), and hour(), the “string” passed to the timezone parameter changes the returned value’s calculation to express the result in the specified time zone. See the Formatting dates and times and Calendar-based functions sections for more information.
The example below shows how time zone strings affect the returned values of calendar-based functions. This script uses three hour() function calls to calculate “int” values representing the opening hour of each bar in the exchange time zone, UTC-0, and a user-specified UTC offset. It plots all three calculated hours in a separate pane for comparison:

```pinescript
//@version=6
indicator("Time zone strings in calendar functions demo")

//@variable An "int" representing the user-specified hourly offset from UTC. 
int utcOffsetInput = input.int(defval = 4, title ="Timezone offset UTC (+/-)", minval = -12, maxval = 14)

//@variable A valid time zone string based on the `utcOffsetInput`, in UTC offset notation (e.g., "UTC-4").
string customOffset = "UTC" + (utcOffsetInput > 0 ? "+" : "") + str.tostring(utcOffsetInput)

//@variable The bar's opening hour in the exchange time zone (default). Equivalent to the `hour` variable.
int exchangeHour = hour(time)
//@variable The bar's opening hour in the "UTC-0" time zone. 
int utcHour = hour(time, "UTC-0")
//@variable The bar's opening hour in the `customOffset` time zone.
int customOffsetHour = hour(time, customOffset)

// Plot the `exchangeHour`, `utcHour`, and `customOffsetHour` for comparison.
plot(exchangeHour,     "Exchange hour",      #E100FF5B,    8)
plot(utcHour,          "UTC-0 hour",         color.blue,   3)
plot(customOffsetHour, "Custom offset hour", color.orange, 3)
```
Note that:

The exchangeHour value is four or five hours behind the utcHour because the NASDAQ exchange is in the “America/New_York” time zone. This time zone has a UTC offset that changes during the year due to daylight saving time (DST). The script’s default customOffsetHour is consistently four hours ahead of the utcHour because its time zone is UTC+4.
The call to the hour() function without a specified timezone argument returns the same value that the hour variable holds because both represent the bar’s opening hour in the exchange time zone (syminfo.timezone).

For functions that return UNIX timestamps directly, such as time() and timestamp(), the timezone parameter defines the time zone of the function’s calendar-based parameters, including session, year, month, day, hour, minute, and second. The parameter does not determine the time zone of the returned value, as UNIX timestamps are time zone-agnostic. See the Testing for sessions and `timestamp()` sections to learn more.
The following script calls the timestamp() function to calculate the UNIX timestamp of a specific date and time, and it draws a label at the timestamp’s corresponding bar location. The user-selected timezone argument (timezoneInput) determines the time zone of the call’s calendar-based arguments. Consequently, the calculated timestamp varies with the timezoneInput value because identical local times in various time zones correspond to different amounts of time elapsed since the UNIX Epoch:

```pinescript
//@version=6
indicator("Time zone strings in UNIX timestamp functions demo", overlay = true)

//@variable The `timezone` argument of the `timestamp()` call, which sets the time zone of all date and time parameters.
string timezoneInput = input.string("Etc/UTC", "Time zone")

//@variable The UNIX timestamp corresponding to a specific calendar date and time.
//          The specified `year`, `month`, `day`, `hour`, `minute`, and `second` represent calendar values in the 
//          `timezoneInput` time zone. 
//          Different `timezone` arguments produce different UNIX timestamps because an identical date in another 
//          time zone does NOT represent the same absolute point in time.
int unixTimestamp = timestamp(
     timezone = timezoneInput, year = 2024, month = 10, day = 31, hour = 0, minute = 0, second = 0
```
 )

```pinescript
//@variable The `close` value when the bar's opening time crosses the `unixTimestamp`.
float labelPrice = ta.valuewhen(ta.cross(time, unixTimestamp), close, 0)

// On the last historical bar, draw a label showing the `unixTimestamp` value at the corresponding bar location.
if barstate.islastconfirmedhistory
    label.new(
```
         unixTimestamp, nz(labelPrice, close), "UNIX timestamp: " + str.tostring(unixTimestamp), 
         xloc.bar_time, yloc.price, chart.fg_color, label.style_label_down, chart.bg_color, size.large
     )
Note that:

"Etc/UTC" is the IANA identifier for the UTC+0 time zone.
The label.new() call uses xloc.bar_time as its xloc argument, which is required to anchor the drawing to an absolute time value. Without this argument, the function treats the unixTimestamp as a relative bar index, leading to an incorrect location.
The label’s y value is the close of the bar where the time value crosses the unixTimestamp value. If the timestamp represents a future time, the label displays the last historical bar’s price.

Although time zone strings can use either UTC or IANA notation, we recommend using IANA notation for timezone arguments in most cases, especially if a script’s time calculations must align with the observed time offset in a specific country or subdivision. When a time function call uses an IANA time zone identifier for its timezone argument, its calculations adjust automatically for historical and future changes to the specified region’s observed time, such as daylight saving time (DST) and updates to time zone boundaries, instead of using a fixed offset from UTC.
The following script demonstrates how UTC and IANA time zone strings can affect time calculations differently. It uses two calls to the hour() function to calculate the hour from the current bar’s opening timestamp using "UTC-4" and "America/New_York" as timezone arguments. The script plots the results of both calls for comparison and colors the main pane’s background when the returned values do not match. Although these two hour() calls may seem similar because UTC-4 is an observed UTC offset in New York, they do not always return the same results, as shown below:

```pinescript
//@version=6
indicator("UTC vs IANA time zone strings demo")

//@variable The hour of the current `time` in the "UTC-4" time zone. 
//          This variable's value represents the hour in New York only during DST. It is one hour ahead otherwise.
int hourUTC = hour(time, "UTC-4")
//@variable The hour of the current `time` in the "America/New_York" time zone. 
//          This form adjusts to UTC offset changes automatically, so the value always represents the hour in New York. 
int hourIANA = hour(time, "America/New_York")

//@variable Is translucent blue when `hourUTC` does not equal `hourIANA`, `na` otherwise.
color bgColor = hourUTC != hourIANA ? color.rgb(33, 149, 243, 80) : na

// Plot the values of `hourUTC` and `hourIANA` for comparison.
plot(hourUTC,  "UTC-4",            color.blue,   linewidth = 6)
plot(hourIANA, "America/New_York", color.orange, linewidth = 3)
// Highlight the main chart pane with the `bgColor`.
bgcolor(bgColor, title = "Unequal result highlight", force_overlay = true)
```
The plots in the chart above diverge periodically because New York observes daylight saving time, meaning its UTC offset changes at specific points in a year. During DST, New York’s local time follows UTC-4. Otherwise, it follows UTC-5. Because the script’s first hour() call uses "UTC-4" as its timezone argument, it returns the correct hour in New York only during DST. In contrast, the call that uses the "America/New_York" time zone string adjusts its UTC offset automatically to return the correct hour in New York at any time of the year.
Time variables
Pine Script has several built-in variables that provide scripts access to different forms of time information:

The time and time_close variables hold UNIX timestamps representing the current bar’s opening and closing times, respectively.
The time_tradingday variable holds a UNIX timestamp representing the starting time of the last UTC calendar day in a session.
The timenow variable holds a UNIX timestamp representing the current time when the script executes.
The year, month, weekofyear, dayofmonth, dayofweek, hour, minute, and second variables reference calendar values based on the current bar’s opening time, expressed in the exchange time zone.
The last_bar_time variable holds a UNIX timestamp representing the last available bar’s opening time.
The chart.left_visible_bar_time and chart.right_visible_bar_time variables hold UNIX timestamps representing the opening times of the leftmost and rightmost visible chart bars.
The syminfo.timezone variable holds a “string” value representing the time zone of the current symbol’s exchange in IANA database notation. All time-related function overloads with a timezone parameter use this variable as the default argument.

​time​ and ​time_close​ variables
The time variable holds the UNIX timestamp of the current bar’s opening time, and the time_close variable holds the UNIX timestamp of the bar’s closing time.
These timestamps are unique, time zone-agnostic “int” values, which programmers can use to anchor drawing objects to specific bar times, calculate and inspect bar time differences, construct readable date/time strings with the str.format_time() function, and more.
The script below displays bar opening and closing times in different ways. On each bar, it formats the time and time_close timestamps into strings containing the hour, minute, and second in the exchange time zone, and it draws labels displaying the formatted strings at the open and close prices. Additionally, the script displays strings containing the unformatted UNIX timestamps of the last chart bar within a table in the bottom-right corner:

```pinescript
//@version=6
indicator("`time` and `time_close` demo", overlay = true, max_labels_count = 500)

//@variable A "string" representing the hour, minute, and second of the bar's opening time in the exchange time zone. 
string openTimeString = str.format_time(time, "HH:mm:ss")
//@variable A "string" representing the hour, minute, and second of the bar's closing time in the exchange time zone.
string closeTimeString = str.format_time(time_close, "HH:mm:ss")

//@variable Is `label.style_label_down` when the `open` is higher than `close`, `label.style_label_up` otherwise.
string openLabelStyle  = open > close ? label.style_label_down : label.style_label_up
//@variable Is `label.style_label_down` when the `close` is higher than `open`, `label.style_label_up` otherwise.
string closeLabelStyle = close > open ? label.style_label_down : label.style_label_up

// Draw labels anchored to the bar's `time` to display the `openTimeString` and `closeTimeString`.
label.new(time, open,  openTimeString,  xloc.bar_time, yloc.price, color.orange, openLabelStyle,  color.white)
label.new(time, close, closeTimeString, xloc.bar_time, yloc.price, color.blue,   closeLabelStyle, color.white)
 
if barstate.islast
    //@variable A `table` displaying the last bar's *unformatted* UNIX timestamps. 
    var table t = table.new(position.bottom_right, 2, 2, bgcolor = #ffe70d)
    // Populate the `t` table with "string" representations of the the "int" `time` and `time_close` values. 
    t.cell(0, 0, "`time`")
    t.cell(1, 0, str.tostring(time))
    t.cell(0, 1, "`time_close`")
    t.cell(1, 1, str.tostring(time_close))
```
Note that:

This script’s label.new() calls include xloc.bar_time as the xloc argument and time as the x argument to anchor the drawings to bar opening times.
The formatted strings express time in the exchange time zone because we did not specify timezone arguments in the str.format_time() calls. NYSE, our chart symbol’s exchange, is in the “America/New_York” time zone (UTC-4/-5).
Although our example chart uses an hourly timeframe, the table and the labels at the end of the chart show that the last bar closes only 30 minutes (1,800,000 milliseconds) after opening. This behavior occurs because the chart aligns bars with session opening and closing times. A session’s final bar closes when the session ends, and a new bar opens when a new session starts. A typical session on our 60-minute chart with regular trading hours (RTH) spans from 09:30 to 16:00 (6.5 hours). The chart divides this interval into as many 60-minute bars as possible, starting from the session’s opening time, which leaves only 30 minutes for the final bar to cover.

It’s crucial to note that unlike the time variable, which has consistent behavior across chart types, time_close behaves differently on time-based and non-time-based charts.
Time-based charts have bars that typically open and close at regular, predictable times within a session. Thanks to this predictability, time_close can accurately represent the expected closing time of an open bar on a time-based chart, as shown on the last bar in the example above.
In contrast, the bars on tick charts and price-based charts (all non-standard charts excluding Heikin Ashi) cover irregular time intervals. Tick charts construct bars based on successive ticks in the data feed, and price-based charts construct bars based on significant price movements. The time it takes for new ticks or price changes to occur is unpredictable. As such, the time_close value is na on the open realtime bars of these charts.
The following script uses the time and time_close variables with str.tostring() and str.format_time() to create strings containing bar opening and closing UNIX timestamps and formatted date-time representations, which it displays in labels at each bar’s high and low prices.
When applied to a Renko chart, which forms new bars based on price movements, the labels show correct results on all historical bars. However, the last bar has a time_close value of na because the future closing time is unpredictable. Consequently, the bar’s closing time label shows a timestamp of "NaN" and an incorrect date and time:

```pinescript
//@version=6
indicator("`time_close` on non-time-based chart demo", overlay = true)

//@variable A formatted "string" containing the date and time that `time_close` represents in the exchange time zone.
string formattedCloseTime = str.format_time(time_close, format = "'Date and time:' yyyy-MM-dd HH:mm:ss")
//@variable A formatted "string" containing the date and time that `time` represents in the exchange time zone.
string formattedOpenTime = str.format_time(time, format = "'Date and time:' yyyy-MM-dd HH:mm:ss")

//@variable A "string" containing the `time_close` UNIX timestamp and the `formattedCloseTime`.
string closeTimeText = str.format("Close timestamp: {0,number,#}\n{1}", time_close, formattedCloseTime)
//@variable A "string" containing the `time` UNIX timestamp and the `formattedOpenTime`.
string openTimeText = str.format("Open timestamp: {0,number,#}\n{1}", time, formattedOpenTime)

// Define label colors for historical and realtime bars. 
color closeLabelColor = barstate.islast ? color.purple : color.aqua
color openLabelColor  = barstate.islast ? color.green  : color.orange

// Draw a label at the `high` to display the `closeTimeText` and a label at the `low` to display the `openTimeText`, 
// both anchored to the bar's `time`. 
label.new(
```
      time, high, closeTimeText, xloc.bar_time, color = closeLabelColor, textcolor = color.white, 
      size = size.large, textalign = text.align_left
 )
label.new(
      time, low, openTimeText, xloc.bar_time, color = openLabelColor, style = label.style_label_up, 
      size = size.large, textcolor = color.white, textalign = text.align_left
 )

// Highlight the background yellow on the latest bar. 
bgcolor(barstate.islast ? #f3de22cb : na, title = "Latest bar highlight")
Note that:

The script draws up to 50 labels because we did not specify a max_labels_count argument in the indicator() declaration statement.
The str.format_time() function replaces na values with 0 in its calculations, which is why it returns an incorrect date-time “string” on the last bar. A timestamp of 0 corresponds to the UNIX Epoch (00:00:00 UTC on January 1, 1970). However, the str.format_time() call does not specify a timezone argument, so it expresses the epoch’s date and time in the exchange time zone, which was five hours behind UTC at that point in time.
The time_close() function, which returns the closing timestamp of a bar on a specified timeframe within a given session, also returns na on the open realtime bars of tick-based and price-based charts.

Scripts can retrieve a realtime bar’s closing time on tick charts and price-based charts once the bar is confirmed. The closing timestamp of an elapsed realtime bar is committed to the realtime data feed as soon as the bar closes, so its time_close value is no longer na.
To demonstrate this, we can modify the script above to use time_close[1] to output the previous bar’s closing time on each bar. The image below shows two highlighted realtime bars. When we executed the script on the chart, the first bar was initially an unconfirmed realtime bar. Its label shows the previous historical bar’s closing time. After some time, this realtime bar closed, and the second highlighted bar opened. The label on the new realtime bar shows the elapsed realtime bar’s closing time:

```pinescript
//@version=6
indicator("`time_close[1]` on non-time-based chart demo", overlay = true)

//@variable A formatted "string" containing the date and time that `time_close[1]` represents in the exchange time zone.
string formattedCloseTime = str.format_time(time_close[1], format = "'Date and time:' yyyy-MM-dd HH:mm:ss")

//@variable A "string" containing the `time_close[1]` UNIX timestamp and the `formattedCloseTime`.
string closeTimeText = str.format("Close timestamp of previous bar: {0,number,#}\n{1}", time_close[1], formattedCloseTime)

// Define label colors for historical and realtime bars. 
color closeLabelColor = barstate.islast ? color.purple : color.aqua

// Draw a label at the `high` to display the `closeTimeText` anchored to the bar's `time`. 
label.new(
```
      time, high, closeTimeText, xloc.bar_time, color = closeLabelColor, textcolor = color.white, 
      size = size.large, textalign = text.align_left
 ) 

// Highlight the background yellow on the realtime bar. 
bgcolor(barstate.islast ? #f3de22cb : na, title = "Realtime bar highlight")
Note that:

A confirmed realtime bar is not the same as a historical bar. Pine’s execution model uses separate data feeds for realtime and historical data. The closing time of a confirmed realtime bar is committed to the realtime feed, until the script re-executes on the chart. Only then will this bar’s closing time load historically along with all the other closed bars.
The barstate.islast value is true for all realtime bars in the dataset. Therefore, the elapsed realtime bar and the latest realtime bar both display a purple label and highlighted background. See the Bar states page to learn more about the different barstate.* variables in Pine Script.
The time_close() function can similarly retrieve the previous bar’s closing time on price-based charts using a bar_back = 1 argument.

​time_tradingday​
The time_tradingday variable holds a UNIX timestamp representing the starting time (00:00 UTC) of the last trading day in the current bar’s final session. It is helpful primarily for date and time calculations on time-based charts for symbols with overnight sessions that start and end on different calendar days.
On “1D” and lower timeframes, the time_tradingday timestamp corresponds to the beginning of the day when the current session ends, even for bars that open and close on the previous day. For example, the “Monday” session for “EURUSD” starts on Sunday at 17:00 and ends on Monday at 17:00 in the exchange time zone. The time_tradingday values of all intraday bars within the session represent Monday at 00:00 UTC.
On timeframes higher than “1D”, which can cover multiple sessions, time_tradingday holds the timestamp representing the beginning of the last calendar day of the bar’s final trading session. For example, on a “EURUSD, 1W” chart, the timestamp represents the start of the last trading day in the week, which is typically Friday at 00:00 UTC.
The script below demonstrates how the time_tradingday and time variables differ on Forex symbols. On each bar, it draws labels to display strings containing the variables’ UNIX timestamps and formatted dates and times. It also uses the dayofmonth() function to calculate the UTC calendar day from both timestamps, highlighting the background when the calculated days do not match.
When applied to the “FXCM:EURUSD” chart with the “3h” (“180”) timeframe, the script highlights the background of the first bar in each session, as each session opens on the previous calendar day. The dayofmonth() call that uses time calculates the opening day on the session’s first bar, whereas the call that uses time_tradingday calculates the day when the session ends:

```pinescript
//@version=6
indicator("`time_tradingday` demo", overlay = true)

//@variable A concatenated "string" containing the `time_tradingday` timestamp and a formatted representation in UTC.
string tradingDayText = "`time_tradingday`: " + str.tostring(time_tradingday) + "\n"
```
     + "Date and time: " + str.format_time(time_tradingday, "dd MMM yyyy, HH:mm (z)", "UTC+0")
```pinescript
//@variable A concatenated "string" containing the `time` timestamp and a formatted representation in UTC.
string barOpenText = "`time`: " + str.tostring(time) + "\n"
```
     + "Date and time: " + str.format_time(time, "dd MMM yyyy, HH:mm (z)", "UTC+0")

```pinescript
//@variable Is `true` on every even bar, `false` otherwise. This condition determines the appearance of the labels. 
bool isEven = bar_index % 2 == 0

// The `yloc` and `style` properties of the labels. They alternate on every other bar for visibility. 
labelYloc  = isEven ? yloc.abovebar : yloc.belowbar
labelStyle = isEven ? label.style_label_down : label.style_label_up
// Draw alternating labels anchored to the bar's `time` to display the `tradingDayText` and `barOpenText`.
if isEven
    label.new(time, 0, tradingDayText + "\n\n\n", xloc.bar_time, labelYloc, color.teal, labelStyle, color.white)
    label.new(time, 0, barOpenText, xloc.bar_time, labelYloc, color.maroon, labelStyle, color.white)
else
    label.new(time, 0, "\n\n\n" + barOpenText, xloc.bar_time, labelYloc, color.maroon, labelStyle, color.white)
    label.new(time, 0, tradingDayText, xloc.bar_time, labelYloc, color.teal, labelStyle, color.white)

//@variable The day of the month, in UTC, that the `time_tradingday` timestamp corresponds to. 
int tradingDayOfMonth = dayofmonth(time_tradingday, "UTC+0")
//@variable The day of the month, in UTC, that the `time` timestamp corresponds to. 
int openingDayOfMonth = dayofmonth(time, "UTC+0")

// Highlight the background when the `tradingDayOfMonth` does not equal the `openingDayOfMonth`. 
bgcolor(tradingDayOfMonth != openingDayOfMonth ? color.rgb(174, 89, 243, 85) : na, title = "Different day highlight")
```
Note that:

The str.format_time() and dayofmonth() calls use "UTC+0" as the timezone argument, meaning the results represent calendar time values with no offset from UTC. In the screenshot, the first bar opens at 21:00 UTC, 17:00 in the exchange time zone (“America/New_York”).
The formatted strings show "GMT" as the acronym of the time zone, which is equivalent to "UTC+0" in this context.
The time_tradingday value is the same for all three-hour bars within each session, even for the initial bar that opens on the previous UTC calendar day. The assigned timestamp changes only when a new session starts.

​timenow​
The timenow variable holds a UNIX timestamp representing the script’s current time. Unlike the values of other variables that hold UNIX timestamps, the values in the timenow series correspond to times when the script executes, not the times of specific bars or trading days.
A Pine script executes only once per historical bar, and all historical executions occur when the script first loads on the chart. As such, the timenow value is relatively consistent on historical bars, with only occasional millisecond changes across the series. In contrast, on realtime bars, a script executes once for each new update in the data feed, which can happen several times per bar. With each new execution, the timenow value updates on the latest bar to represent the current time.
NoteBecause timenow updates only after script executions, its value does not always correspond to the continuous time displayed below the chart. When no new updates are available in the realtime data feed, a script on the chart remains idle, in which case the variable’s timestamp does not change.
This variable is most useful on realtime bars, where programmers can apply it to track the times of the latest script executions, count the time elapsed within open bars, control drawings based on bar updates, and more.
The script below inspects the value of timenow on the latest chart bars and uses it to analyze realtime bar updates. When the script first reaches the last chart bar, it declares three variables with the varip keyword to hold the latest timenow value, the total time elapsed between the bar’s updates, and the total number of updates. It uses these values to calculate the average number of milliseconds between updates, which it displays in a label along with the current execution’s timestamp, a formatted time and date in the exchange time zone, and the current number of bar updates:

```pinescript
//@version=6
indicator("`timenow` demo", overlay = true, max_labels_count = 500)

if barstate.islast
    //@variable Holds the UNIX timestamp of the latest script execution for timing updates in the data feed. 
    varip int lastUpdateTimestamp = timenow
    //@variable The total number of milliseconds elapsed across the bar's data updates.
    varip int totalUpdateTime = 0
    //@variable The number of updates that have occurred on the current bar.
    varip int numUpdates = 0

    // Add the time elapsed from the `lastUpdateTimestamp` to `totalUpdateTime`, increase the `numUpdates` counter, and 
    // update the `lastUpdateTimestamp` when the `timenow` value changes.
    if timenow != lastUpdateTimestamp
```
        totalUpdateTime     += timenow - lastUpdateTimestamp
        numUpdates          += 1
        lastUpdateTimestamp := timenow
    
```pinescript
    //@variable The average number of milliseconds elapsed between the bar's updates.
    float avgUpdateTime = nz(totalUpdateTime / numUpdates)
    
    //@variable Contains the `timenow` value, a custom representation, and the `numUpdates` and `avgUpdateTime` values.
    string displayText = "`timenow`: " + str.tostring(timenow)
```
                         + "\nTime and date (exchange): " + str.format_time(timenow, "HH:mm:ss MM/dd/yy")
                         + "\nNumber of updates: " + str.tostring(numUpdates)
                         + "\nAvg. time between updates: " + str.tostring(avgUpdateTime, "#.###") + " ms"

```pinescript
    //@variable The color of the label. Is blue when the bar is open, and gray after it closes. 
    color labelColor = barstate.isconfirmed ? color.gray : color.blue 
    //@variable The label's y-coordinate. Alternates between `high` and `low` on every other bar. 
    float labelPrice = bar_index % 2 == 0 ? high : low
    //@variable The label's style. Alternates between "lower-right" and "upper-right" styles.
    labelStyle = bar_index % 2 == 0 ? label.style_label_lower_right : label.style_label_upper_right  
    // Draw a `labelColor` label anchored to the bar's `time` to show the `displayText`.
    label.new(
```
         time, labelPrice, displayText, xloc.bar_time, color = labelColor, style = labelStyle, 
         textcolor = color.white, size = size.large
     ) 

    // Reset the `totalUpdateTime` and `numUpdates` counters when the bar is confirmed (closes). 
    if barstate.isconfirmed
        totalUpdateTime := 0
        numUpdates      := 0
Note that:

When a bar is open, the drawn label is blue to signify that additional updates can occur. After the bar closes, the final label’s color is gray.
Although we’ve set the chart time zone to match the exchange time zone, the formatted time in the open bar’s label and the time shown below the chart do not always align. The script records a new timestamp only when a new execution occurs, whereas the time below the chart updates continuously.
The varip keyword specifies that a variable does not revert to the last committed value in its series when new updates occur. This behavior allows the script to use variables to track changes in timenow on an open bar.
Updates to timenow on open realtime bars do not affect the recorded timestamps on confirmed bars as the script executes. However, the historical series changes (repaints) after reloading the chart because timenow references the script’s current time, not the times of specific bars.

Calendar-based variables
The year, month, weekofyear, dayofmonth, dayofweek, hour, minute, and second variables hold calendar-based “int” values calculated from the current bar’s opening time, expressed in the exchange time zone. These variables reference the same values that calendar-based functions return when they use the default timezone argument and time as the time argument. For instance, the year variable holds the same value that a year(time) call returns.
Programmers can use these calendar-based variables for several purposes, such as:

Identifying a bar’s opening date and time.
Passing the variables to the timestamp() function to calculate UNIX timestamps.
Testing when date/time values or ranges occur in a data feed.

One of the most common use cases for these variables is checking for date or time ranges to control when a script displays visuals or executes calculations. This simple example inspects the year variable to determine when to plot a visible value. If the year is 2022 or higher, the script plots the bar’s close. Otherwise, it plots na:

```pinescript
//@version=6
indicator("`year` demo", overlay = true)

// Plot the `close` price on bars that open in the `year` 2022 onward. Otherwise, plot `na` to display nothing.
plot(year >= 2022 ? close : na, "`close` price (year 2022 and later)", linewidth = 3)
```
When using these variables in conditions that isolate specific dates or times rather than ranges, it’s crucial to consider that certain conditions might not detect some occurrences of the values due to a chart’s timeframe, the opening times of chart bars, or the symbol’s active session.
For instance, suppose we want to detect when the first calendar day of each month occurs on the chart. Intuitively, one might consider simply checking when the dayofmonth value equals 1. However, this condition only identifies when a bar opens on a month’s first day. The bars on some charts can open and close in different months. Additionally, a chart bar might not contain the first day of a month if the market is closed on that day. Therefore, we must create extra conditions that work in these scenarios to identify the first day in any month on the chart.
The script below uses the dayofmonth and month variables, and the month() function, to create three conditions that detect the first day of the month in different ways. The first condition detects if the bar opens on the first day, the second checks if the bar opens in one month and closes in another, and the third checks if the chart skips the date entirely. The script draws labels showing bar opening dates and highlights the background with different colors to visualize when each condition occurs:

```pinescript
//@version=6
indicator("Detecting the first day of the month demo", overlay = true, max_labels_count = 500)

//@variable Is `true` only if the current bar opens on the first day of the month in exchange time, `false` otherwise. 
bool opensOnFirst = dayofmonth == 1
//@variable Is `true` if the bar opens in one month and closes in another, meaning its time span includes the first day.
bool containsFirst = month != month(time_close) 
//@variable Is `true` only if the bar opens in a new month and the current or previous bar does not cover the first day.
bool skipsFirst = month != month[1] and not (opensOnFirst or containsFirst[1])

//@variable The name of the current bar's opening weekday.
string weekdayName = switch dayofweek
    dayofweek.sunday    => "Sunday"
    dayofweek.monday    => "Monday"
    dayofweek.tuesday   => "Tuesday"
    dayofweek.wednesday => "Wednesday"
    dayofweek.thursday  => "Thursday"
    dayofweek.friday    => "Friday"
    dayofweek.saturday  => "Saturday"

//@variable A custom "string" representing the bar's opening date, including the weekday name. 
string openDateText = weekdayName + str.format_time(time, ", MMM d, yyyy")

// Draw a green label when the bar opens on the first day of the month. 
if opensOnFirst
    string labelText = "Bar opened on\n" + openDateText
    label.new(time, open, labelText, xloc.bar_time, color = color.green, textcolor = color.white, size = size.large)
// Draw a blue label when the bar opens and closes in different months. 
if containsFirst
    string labelText = "Bar includes the first day,\nbut opened on\n" + openDateText
    label.new(time, open, labelText, xloc.bar_time, color = color.blue, textcolor = color.white, size = size.large)
// Draw a red label when the chart skips the first day of the month. 
if skipsFirst
    string labelText = "Chart doesn't include the first day.\nBar opened on\n" + openDateText
    label.new(time, open, labelText, xloc.bar_time, color = color.red, textcolor = color.white, size = size.large)

// Highlight the background when the conditions occur.
bgcolor(opensOnFirst ? color.new(color.green, 70) : na, title = "`opensOnFirst` condition highlight")
bgcolor(containsFirst ? color.new(color.blue, 70) : na, title = "`containsFirst` condition highlight")
bgcolor(skipsFirst ? color.new(color.red, 70) : na, title = "`skipsFirst` condition highlight")
```
Note that:

The script calls the month() function with time_close as the time argument to calculate each bar’s closing month for the containsFirst condition.
The dayofweek.* namespace contains variables that hold each possible dayofweek value, e.g., dayofweek.sunday has a constant value of 1 and dayofweek.saturday has a constant value of 7. The script compares dayofweek to these variables in a switch structure to determine the weekday name shown inside each label.
To detect the first opening time in a monthly timeframe, not strictly the first day in a calendar month, use ta.change(time("1M")) > 0 or timeframe.change("1M") instead of conditions based on these variables. See the Testing for changes in higher timeframes section to learn more.

​last_bar_time​
The last_bar_time variable holds a UNIX timestamp representing the last available bar’s opening time. It is similar to last_bar_index, which references the latest bar index. On historical bars, last_bar_time consistently references the time value of the last bar available when the script first loads on the chart. The only time the variable’s value updates across script executions is when a new realtime bar opens.
The following script uses the last_bar_time variable to get the opening timestamp of the last chart bar during its execution on the first bar. It displays the UNIX timestamp and a formatted date and time using a single-cell table created only on that bar. When the script executes on the last available bar, it creates a label to show the bar’s time value and its formatted representation for visual comparison.
As the chart below shows, both drawings display identical times, verifying that last_bar_time correctly references the last bar’s time value on previous historical bars:

```pinescript
//@version=6
indicator("`last_bar_time` demo", overlay = true)

if barstate.isfirst
    //@variable A single-cell `table`, created only on the *first* bar, showing the *last* available bar's opening time.
```
    table displayTable = table.new(position.bottom_right, 1, 1, color.aqua)
```pinescript
    //@variable A "string" containing the `last_bar_time` UNIX timestamp and a custom date and time representation. 
    string lastBarTimeText = "`last_bar_time`: "              + str.tostring(last_bar_time) 
```
                             + "\nDate and time (exchange): " + str.format_time(last_bar_time, "dd/MM/yy HH:mm:ss")
    // Initialize the `displayTable` cell with the `lastBarTimeText`.
    displayTable.cell(
         0, 0, lastBarTimeText, 
         text_color = color.white, text_size = size.large, text_halign = text.align_left
     )

```pinescript
//@variable Is `true` only on the first occurrence of `barstate.islast`, `false` otherwise.
//          This condition occurs on the bar whose `time` the `last_bar_time` variable refers to on historical bars.
bool isInitialLastBar = barstate.islast and not barstate.islast[1]

if isInitialLastBar
    //@variable A "string" containing the last available bar's `time` value and a custom date and time representation.
    //          Matches the `lastBarTimeText` from the first bar because `last_bar_time` equals this bar's `time`.
    string openTimeText = "`time`: "                       + str.tostring(time)
```
                          + "\nDate and time (exchange): " + str.format_time(time, "dd/MM/yy HH:mm:ss") 
    // Draw a label anchored to the bar's `time` to display the `openTimeText`. 
    label.new(
         time, high, openTimeText, xloc.bar_time,
         color = color.purple, textcolor = color.white, size = size.large, textalign = text.align_left
     )

// Highlight the background when `isInitialLastBar` is `true` for visual reference. 
bgcolor(barstate.islast ? color.rgb(155, 39, 176, 80) : na, title = "Initial last bar highlight")
Note that:

The script creates the label only on the first bar with the barstate.islast state because that bar’s time value is what last_bar_time equals on all historical bars. On subsequent bars, the last_bar_time value updates to represent the latest realtime bar’s opening time.
Updates to last_bar_time on realtime bars do not affect the values on historical bars as the script executes. However, the variable’s series repaints when the script restarts because last_bar_time always references the latest available bar’s opening time.
This script expresses dates using the "dd/MM/yy" format, meaning the two-digit day appears before the two-digit month, and the month appears before the two-digit representation of the year. See this section below for more information.

Visible bar times
The chart.left_visible_bar_time and chart.right_visible_bar_time variables reference the opening UNIX timestamps of the chart’s leftmost (first) and rightmost (last) visible bars on every script execution. When a script uses these variables, it responds dynamically to visible chart changes, such as users scrolling across bars or zooming in/out. Each time the visible window changes, the script re-executes automatically to update the variables’ values on all available bars.
The example below demonstrates how the chart.left_visible_bar_time and chart.right_visible_bar_time variables work across script executions. The script draws labels anchored to the visible bars’ times to display the UNIX timestamps. In addition, it draws two single-cell tables showing corresponding dates and times in the standard ISO 8601 format. The script creates these drawings only when it executes on the first bar. As the script continues to execute on subsequent bars, it identifies each bar whose time value equals either visible bars’ timestamp and colors it on the chart:

```pinescript
//@version=6
indicator("Visible bar times demo", overlay = true)

// Create strings on the first chart bar that contain the first and last visible bars' UNIX timestamps.
var string leftTimestampText  = str.format("UNIX timestamp: {0,number,#}", chart.left_visible_bar_time)
var string rightTimestampText = str.format("UNIX timestamp: {0,number,#}", chart.right_visible_bar_time)
// Create strings on the first bar that contain the exchange date and time of the visible bars in ISO 8601 format.
var string leftDateTimeText  = "Date and time: " + str.format_time(chart.left_visible_bar_time)
var string rightDateTimeText = "Date and time: " + str.format_time(chart.right_visible_bar_time)

//@variable A `label` object anchored to the first visible bar's time. Shows the `leftTimestampText`.
var label leftTimeLabel = label.new(
```
     chart.left_visible_bar_time, 0, leftTimestampText, xloc.bar_time, yloc.abovebar, color.purple, 
     label.style_label_lower_left, color.white, size.large
 )
```pinescript
//@variable A `label` object anchored to the last visible bar's time. Shows the `rightTimestampText`.
var label rightTimeLabel = label.new(
```
     chart.right_visible_bar_time, 0, rightTimestampText, xloc.bar_time, yloc.abovebar, color.teal, 
     label.style_label_lower_right, color.white, size.large
 )

```pinescript
//@variable A single-cell `table` object showing the `leftDateTimeText`.
var table leftTimeTable = table.new(position.middle_left, 1, 1, color.purple)
//@variable A single-cell `table` object showing the `rightDateTimeText`.
var table rightTimeTable = table.new(position.middle_right, 1, 1, color.teal)
// On the first bar, initialize the `leftTimeTable` and `rightTimeTable` with the corresponding date-time text.
if barstate.isfirst
    leftTimeTable.cell(0, 0, leftDateTimeText, text_color = color.white, text_size = size.large)
    rightTimeTable.cell(0, 0, rightDateTimeText, text_color = color.white, text_size = size.large)

//@variable Is purple at the left visible bar's opening time, teal at the right bar's opening time, `na` otherwise. 
color barColor = switch time
    chart.left_visible_bar_time  => color.purple
    chart.right_visible_bar_time => color.teal

// Color the leftmost and rightmost visible bars using the `barColor`.
barcolor(barColor, title = "Leftmost and rightmost visible bar color")
```
Note that:

The chart.left_visible_bar_time and chart.right_visible_bar_time values are consistent across all executions, which allows the script to identify the visible bars’ timestamps on the first bar and check when the time value equals them. The script restarts on any chart window changes, updating the variables’ series to reference the new timestamps on every bar.
The str.format_time() function uses ISO 8601 format by default when the call does not include a format argument because it is the international standard for expressing dates and times. See the Formatting dates and times section to learn more about time string formats.

​syminfo.timezone​
The syminfo.timezone variable holds a time zone string representing the current symbol’s exchange time zone. The “string” value expresses the time zone as an IANA identifier (e.g., "America/New_York"). The overloads of time functions that include a timezone parameter use syminfo.timezone as the default argument.
Because this variable is the default timezone argument for all applicable time function overloads, it is unnecessary to use as an explicit argument, except for stylistic purposes. However, programmers can use the variable in other ways, such as:

Displaying the “string” in Pine Logs or drawings to inspect the exchange time zone’s IANA identifier.
Comparing the value to other time zone strings to create time zone-based conditional logic.
Requesting the exchange time zones of other symbols with request.*() function calls.

The following script uses the timenow variable to retrieve the UNIX timestamp of its latest execution. It formats the timestamp into date-time strings expressed in the main symbol’s exchange time zone and a requested symbol’s exchange time zone, which it displays along with the IANA identifiers in a table on the last chart bar:

```pinescript
//@version=6
indicator("`syminfo.timezone` demo", overlay = true)

//@variable The symbol to request exchange time zone information for. 
string symbolInput = input.symbol("NSE:BANKNIFTY", "Requested symbol")

//@variable A `table` object displaying the exchange time zone and the time of the script's execution.
var table t = table.new(position.bottom_right, 2, 3, color.yellow, border_color = color.black, border_width = 1)

//@variable The IANA identifier of the exchange time zone requested for the `symbolInput` symbol.
var string requestedTimezone = na

if barstate.islastconfirmedhistory
    // Retrieve the time zone of the user-specified symbol's exchange.
    requestedTimezone := request.security(symbolInput, "", syminfo.timezone, calc_bars_count = 2)
    // Initialize the `t` table's header cells.
    t.cell(0, 0, "Exchange prefix and time zone string", text_size = size.large)
    t.cell(1, 0, "Last execution date and time", text_size = size.large)
    t.cell(0, 1, syminfo.prefix(syminfo.tickerid) + " (" + syminfo.timezone + ")", text_size = size.large)
    t.cell(0, 2, syminfo.prefix(symbolInput) + " (" + requestedTimezone + ")", text_size = size.large)

if barstate.islast
    //@variable The formatting string for all `str.format_time()` calls. 
    var string formatString = "HH:mm:ss 'on' MMM dd, YYYY"
    // Initialize table cells to display the formatted text.
    t.cell(1, 1, str.format_time(timenow, formatString), text_size = size.large)
    t.cell(1, 2, str.format_time(timenow, formatString, requestedTimezone), text_size = size.large)
```
Note that:

Pine scripts execute on realtime bars only when new updates occur in the data feed, and timenow updates only on script executions. As such, when no realtime updates are available, the timenow timestamp does not change. See this section above for more information.
The default symbolInput value is "NSE:BANKNIFTY". NSE is in the “Asia/Kolkata” time zone, which is 9.5 hours ahead of the main symbol’s exchange time zone (“America/New_York”) at the time of the screenshot. Although the local time representations differ, both refer to the same absolute time that the timenow timestamp represents.
Pine v6 scripts use dynamic request.*() calls by default, which allows the script to call request.security() dynamically inside the if structure’s local scope. See the Dynamic requests section of the Other timeframes and data page to learn more.

Time functions
Pine Script features several built-in functions that scripts can use to retrieve, calculate, and express time values:

The time() and time_close() functions allow scripts to retrieve UNIX timestamps for the opening and closing times of bars within a session on a specified timeframe, without requiring request.*() function calls.
The year(), month(), weekofyear(), dayofmonth(), dayofweek(), hour(), minute(), and second() functions calculate calendar-based values, expressed in a specified time zone, from a UNIX timestamp.
The timestamp() function calculates a UNIX timestamp from a specified calendar date and time.
The str.format_time() function formats a UNIX timestamp into a human-readable date/time “string”, expressed in a specified time zone. The Formatting dates and times section below provides detailed information about formatting timestamps with this function.
The input.time() function returns a UNIX timestamp corresponding to the user-specified date and time, and the input.session() function returns a valid time-based session string corresponding to the user-specified start and end times. See the Time input and Session input sections of the Inputs page to learn more about these functions.

​time()​ and ​time_close()​ functions
The time() and time_close() functions return UNIX timestamps representing the opening and closing times of bars on a specified timeframe. Both functions can filter their returned values based on a given session in a specific time zone. They each have the following signatures:
functionName(timeframe, session, bars_back, timeframe_bars_back) → series intfunctionName(timeframe, session, timezone, bars_back, timeframe_bars_back) → series int
Where:

functionName is the function’s identifier.
The timeframe parameter accepts a timeframe string that defines the timeframe for the calculation. The function uses the script’s main timeframe if the argument is timeframe.period or an empty string "".
The optional session parameter accepts a time-based session string that defines the session’s start and end times (e.g., "0930-1600") and the days for which it applies (e.g., ":23456" means Monday - Friday). If the value does not specify the days, the session applies to all trading days automatically. The function returns UNIX timestamps only for the bars within the session. It returns na if a bar’s time is outside the session. If the session argument is an empty string or not specified, the function uses the symbol’s session information.
The optional timezone parameter accepts a valid time zone string that defines the time zone of the specified session. It does not change the meaning of returned UNIX timestamps, as they are time zone-agnostic. If the timezone argument is not specified, the function uses the exchange time zone (syminfo.timezone).
The optional bars_back parameter accepts an “int” value specifying the bar offset on the script’s main timeframe. If the value is positive, the function finds the bar that is N bars before the current bar on the main timeframe, then retrieves the timestamp of the corresponding bar on the timeframe specified by the timeframe argument. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar corresponding to N bars after the current bar on the main timeframe. The default is 0. See the Calculating timestamps at bar offsets section to learn more about this parameter.
The optional timeframe_bars_back parameter accepts an “int” value specifying the additional bar offset on the timeframe specified by the timeframe argument. If the value is positive, the function retrieves the timestamp of the timeframe bar that is N timeframe bars before the one corresponding to the bars_back offset. If the value is a negative number from -1 to -500, the function calculates the expected timestamp of the timeframe bar that is N timeframe bars after the one corresponding to the bars_back offset. The default is 0. See the Calculating timestamps at bar offsets section to learn more about this parameter.

Similar to the time and time_close variables, these functions behave differently on time-based and non-time-based charts.
Time-based charts have bars that open and close at predictable times, whereas the bars on tick charts and all non-standard charts, excluding Heikin Ashi, open and close at irregular, unpredictable times. Consequently, time_close() cannot calculate the expected closing time of an open realtime bar on non-time-based charts, so it returns na on that bar. Similarly, the time() function with a negative bar offset cannot accurately calculate the expected opening time of a future realtime bar on these charts. See the second example in this section above. That example script exhibits the same behavior on a price-based chart if it uses a time_close("") call instead of the time_close variable.
On non-time-based charts, a new bar’s closing time is available in the realtime data feed once the bar closes. Therefore, time_close() can retrieve valid closing timestamps for confirmed realtime bars without needing to restart the script to load them historically. See the third example in this section above. Replacing the time_close[1] variable in the example script with a time_close("", 1) call achieves the same result to retrieve the closing time of the elapsed realtime bar.
Typical use cases for the time() and time_close() functions include:

Testing for bars that open or close in specific sessions defined by the session and timezone parameters.
Testing for changes or measuring time differences on specified higher timeframes.
Calculating timestamps at bar offsets on the script’s main timeframe, a specified timeframe, or both.

Testing for sessions
The time() and time_close() functions’ session and timezone parameters define the sessions for which they can return non-na values. If a call to either function references a bar that opens/closes within the defined session in a given time zone, it returns a UNIX timestamp for that bar. Otherwise, it returns na. Programmers can pass the returned values to the na() function to identify which bars open or close within specified intervals, which is helpful for session-based calculations and logic.
This simple script identifies when a bar on the chart’s timeframe opens at or after 11:00 and before 13:00 in the exchange time zone on any trading day. It calls time() with timeframe.period as the timeframe argument and the "1100-1300" session string as the session argument, and then verifies whether the returned value is na with the na() function. When the value is not na, the script highlights the chart’s background to indicate that the bar opened in the session:

```pinescript
//@version=6
indicator("Testing for session bars demo", overlay = true)

//@variable Checks if the bar opens between 11:00 and 13:00. Is `true` if the `time()` function does not return `na`. 
bool inSession = not na(time(timeframe.period, "1100-1300"))

// Highlight the background of the bars that are in the session "11:00-13:00". 
bgcolor(inSession ? color.rgb(155, 39, 176, 80) : na)
```
Note that:

The session argument in the time() call represents an interval in the exchange time zone because syminfo.timezone is the default timezone argument.
The session string expresses the start and end times in the "HHmm-HHmm" format, where "HH" is the two-digit hour and "mm" is the two-digit minute. Session strings can also specify the weekdays a session applies to. However, the time() call’s session argument ("1100-1300") does not include this information, which is why it considers the session valid for every day. See the Sessions page to learn more.

When using session strings in time() and time_close() calls, it’s crucial to understand that such strings define start and end times in a specific time zone. The local hour and minute in one region may not correspond to the same point in UNIX time as that same hour and minute in another region. Therefore, calls to these functions with different timezone arguments can return non-na timestamps at different times, as the specified time zone string changes the meaning of the local times represented in the session argument.
This example demonstrates how the timezone parameter affects the session parameter in a time() function call. The script calculates an opensInSession condition that uses a time() call with arguments based on inputs. The session input for the session argument includes four preset options: "0000-0400", "0930-1400", "1300-1700", and "1700-2100". The string input that defines the timezone argument includes four IANA time zone options representing different offsets from UTC: "America/Vancouver" (UTC-7/-8), "America/New_York" (UTC-4/-5), "Asia/Dubai" (UTC+4), and "Austrailia/Sydney" (UTC+10/+11).
For any chosen sessionInput value, changing the timezoneInput value changes the specified session’s time zone. The script highlights different bars with each time zone choice because, unlike UNIX timestamps, the absolute times that local hour and minute values correspond to varies across time zones:

```pinescript
//@version=6
indicator("Testing session time zones demo", overlay = true)

//@variable The timeframe of the analyzed bars. 
string timeframeInput = input.timeframe("60", "Timeframe")
//@variable The session to check. Features four interval options. 
string sessionInput = input.session("1300-1700", "Session", ["0000-0400", "0930-1400", "1300-1700", "1700-2100"])
//@variable An IANA identifier representing the time zone of the `sessionInput`. Fetures four preset options. 
string timezoneInput = input.string("America/New_York", "Time zone", 
     ["America/Vancouver", "America/New_York", "Asia/Dubai", "Australia/Sydney"]
```
 )

```pinescript
//@variable Is `true` if a `timeframeInput` bar opens within the `sessionInput` session in the `timezoneInput` time zone.
//          The condition detects the session on different bars, depending on the chosesn time zone, because identical 
//          local times in different time zones refer to different absolute points in UNIX time.  
bool opensInSession = not na(time(timeframeInput, sessionInput, timezoneInput))

// Highlight the background when `opensInSession` is `true`. 
bgcolor(opensInSession ? color.rgb(33, 149, 243, 80) : na, title = "Open in session highlight")
```
Note that:

This script uses IANA notation for all time zone strings because it is the recommended format. Using an IANA identifier allows the time() call to automatically adjust the session’s UTC offset based on a region’s local time policies, such as daylight saving time.

Testing for changes in higher timeframes
The timeframe parameter of the time() and time_close() functions specifies the timeframe of the bars in the calculation, allowing scripts to retrieve opening/closing UNIX timestamps from higher timeframes than the current chart’s timeframe without requiring request.*() function calls.
Programmers can use the opening/closing timestamps from higher-timeframe (HTF) bars to detect timeframe changes. One common approach is to call time() or time_close() with a consistent timeframe argument across all executions on a time-based chart and measure the one-bar change in the returned value with the ta.change() function. The result is a nonzero value only when an HTF bar opens. One can also check whether the data has a time gap at that point by comparing the time() value to the previous bar’s time_close() value. A gap is present when the opening timestamp on the current bar is greater than the closing timestamp on the previous bar.
The script below uses the call time("1M") to get the opening UNIX timestamp of the current bar on the “1M” timeframe, then assigns the result to the currMonthlyOpenTime variable. It detects when bars on that timeframe open by checking when the one-bar change in the currMonthlyOpenTime value is above zero. On each occurrence of the condition, the script detects whether the HTF bar opened after a gap by checking if the new opening timestamp is greater than the “1M” closing timestamp from the previous chart bar (time_close("1M")[1]).
The script draws labels containing formatted “1M” opening times to indicate the chart bars that mark the start of monthly bars. If a monthly bar opens without a gap from the previous closing time, the script draws a blue label. If a monthly bar starts after a gap, it draws a red label. Additionally, if the “1M” opening time does not match the opening time of the chart bar, the script displays that bar’s formatted time in the label for comparison:

```pinescript
//@version=6
indicator("Detecting changes in higher timeframes demo", overlay = true)

//@variable The opening UNIX timestamp of the current bar on the "1M" timeframe.
int currMonthlyOpenTime = time("1M")
//@variable The closing timestamp on the "1M" timeframe as of the previous chart bar. 
int prevMonthlyCloseTime = time_close("1M")[1]

//@variable Is `true` when the opening time on the "1M" timeframe changes, indicating a new monthly bar. 
bool isNewTf = ta.change(currMonthlyOpenTime) > 0

if isNewTf
    // Initialize variables for the `text` and `color` properties of the label drawing.
    string lblText  = "New '1M' opening time:\n" + str.format_time(currMonthlyOpenTime)
    color  lblColor = color.blue

    //@variable Is `true` when the `currMonthlyOpenTime` exceeds the `prevMonthlyCloseTime`, indicating a time gap.
    bool hasGap = currMonthlyOpenTime > prevMonthlyCloseTime
    
    // Modify the `lblText` and `lblColor` based on the `hasGap` value.
    if hasGap
        lblText := "Gap from previous '1M' close.\n\n" + lblText
        lblColor := color.red
    // Include the formatted `time` value if the `currMonthlyOpenTime` is before the first available chart bar's `time`.
    if time > currMonthlyOpenTime
```
        lblText += "\nFirst chart bar has a later time:\n" + str.format_time(time)
    
    // Draw a `lblColor` label anchored to the `time` to display the `lblText`. 
    label.new(
         time, high, lblText, xloc.bar_time, color = lblColor, style = label.style_label_lower_right, 
         textcolor = color.white, size = size.large
     )
Note that:

Using ta.change() on a time() or time_close() call’s result is not the only way to detect changes in a higher timeframe. The timeframe.change() function is an equivalent, more convenient option for scripts that do not need to use the UNIX timestamps from HTF bars in other calculations, as it returns a “bool” value directly without extra code.
The detected monthly opening times do not always correspond to the first calendar day of the month. Instead, they correspond to the first time assigned to a “1M” bar, which can be after the first calendar day. For symbols with overnight sessions, such as “USDJPY” in our example chart, a “1M” bar can also open before the first calendar day.
Sometimes, the opening time assigned to an HTF bar might not equal the opening time of any chart bar, which is why other conditions such as time == time("1M") cannot detect new monthly bars consistently. For example, on our “USDJPY” chart, the “1M” opening time 2023-12-31T17:00:00-0500 does not match an opening time on the “1D” timeframe. The first available “1D” bar after that point opened at 2024-01-01T17:00:00-0500.

Calculating timestamps at bar offsets
The bars_back and timeframe_bars_back parameters of the time() and time_close() functions control bar offsets in the calculations, enabling the functions to compute the opening/closing UNIX timestamps for bars that are before or after the current bar, on a given timeframe, without requiring request.*() calls or history-referencing operations.
The bars_back parameter controls the bar offset on the script’s main timeframe, and the timeframe_bars_back parameter controls the bar offset on the separate timeframe specified by the timeframe argument. A call to either function evaluates both offsets in succession to determine the returned timestamp:

The call evaluates the bars_back offset. If the value is a positive number from 1 to 5000, the call finds the bar that is the specified number of bars before the current one on the main timeframe, then retrieves the time of the corresponding timeframe bar. If the value is a negative number from -1 to -500, the call calculates the expected time of the timeframe bar corresponding to N main-timeframe bars after the current bar. If the value is 0 (default), the call retrieves the time of the current timeframe bar.

The call evaluates the timeframe_bars_back offset for the specified timeframe to determine the final timestamp. If the value is positive and less than or equal to 5000, the call returns the timestamp for the timeframe bar that is the specified number of periods before the one corresponding to the bars_back offset. If the value is negative and greater than or equal to -500, the call returns the expected timestamp of the timeframe bar that is N periods after the one corresponding to the bars_back offset. If the value is 0 (default), the call does not apply an additional timeframe-based offset to the calculation.

The following example shows how the bars_back and timeframe_bars_back parameters work together in timestamp calculations. The script below creates three drawings on the last historical bar, anchored to the results from different time() and time_close() calls that return timestamps based on a specified chart bar offset (chartOffsetInput) and a higher-timeframe (HTF) offset (tfOffsetInput):

The first drawing is a vertical line indicating the chart bar at the bars_back offset (chartOffsetInput), which the other drawings use in their timestamp calculations. The line uses the value from time("", bars_back = chartOffsetInput) as the x1 and x2 coordinates.
The second is a blue box showing the range of the higher-timeframe (HTF) bar that contains the offset chart bar indicated by the line. It uses the value of time(tfInput, bars_back = chartOffsetInput) as the left coordinate, and the value of time_close(tfInput, bars_back = chartOffsetInput) as the right coordinate.
The third is a purple box that shows the range of the HTF bar that is tfOffsetInput periods away from the HTF bar represented by the blue box. The time() and time_close() calls for this box use the same timeframe and bars_back arguments as those for the blue box, and they include timeframe_bars_back = tfOffsetInput to apply the additional HTF bar offset.

Both boxes also display formatted opening and closing timestamps, expressed in the exchange time zone, to show the time ranges covered by their respective periods:
```pinescript
//@version=6
indicator("Calculating timestamps at bar offsets demo", overlay = true, behind_chart = false)

//@variable Sets the timeframe for the box timestamp calculations. 
string tfInput = input.timeframe("1D", "Higher timeframe")
//@variable The offset on the script's main timeframe (chart timeframe in this example).
int chartOffsetInput = input.int(0, "Chart bar offset", -500)
//@variable The offset on the higher timeframe specified by `tfInput`.
int tfOffsetInput = input.int(1, "HTF offset", -500)

// Create persistent arrays to store opening time, high, and low values for the chart drawings.
var array<int>   times = array.new<int>()
var array<float> highs = array.new<float>()
var array<float> lows  = array.new<float>()

//@variable The opening time of the current bar on the `tfInput` timeframe, with no offset.
int tfOpen0 = time(tfInput)

switch
    // Add a new element to the end of all three arrays if the `tfOpen0` value changes, indicating a new HTF bar.
    ta.change(tfOpen0) > 0 => highs.push(high), lows.push(low), times.push(tfOpen0)
    // Otherwise, set the last element in the `highs` and `lows` arrays to track the period's highest and lowest values. 
    times.size() > 0 => highs.set(-1, math.max(highs.last(), high)), lows.set(-1, math.min(lows.last(), low))

if barstate.islastconfirmedhistory and times.size() > 0
    // Get the opening timestamp for the *chart bar* that is `chartOffsetInput` bars back, relative to the current bar.
    int chartTFOpen = time("", bars_back = chartOffsetInput)
    // Draw a line to show the offset bar's position.
    line.new(
```
        chartTFOpen, low[math.max(chartOffsetInput, 0)], 
        chartTFOpen, high[math.max(chartOffsetInput, 0)],
        xloc.bar_time, extend.both, width = 3
    )

    // Get the timestamps of the HTF bar that *contains* the chart bar at `chartOffsetInput`.
    int tfOpen1 = time(tfInput, bars_back = chartOffsetInput)
    int tfClose1 = time_close(tfInput, bars_back = chartOffsetInput)
    // Get the `times` index for `tfOpen1` to retrieve the first offset HTF bar's high and low values.
    int offsetIndex1 = times.binary_search_leftmost(tfOpen1)
    // Draw a box to show the HTF bar that opens at `tfOpen1` and closes at `tfClose1`.
    box.new(
        tfOpen1, highs.get(offsetIndex1), tfClose1, lows.get(offsetIndex1), 
        color.blue, xloc = xloc.bar_time, bgcolor = #2196f399, text_color = chart.fg_color,
        text = "Open: " + str.format_time(tfOpen1) + "\n\nClose: " + str.format_time(tfClose1)
    )

    // Get the timestamps of the HTF bar that is `tfOffsetInput` *HTF periods back*, relative to the one that 
    // opens at `tfOpen1` and closes at `tfClose1`.
    int tfOpen2 = time(tfInput, bars_back = chartOffsetInput, timeframe_bars_back = tfOffsetInput)
    int tfClose2 = time_close(tfInput, bars_back = chartOffsetInput, timeframe_bars_back = tfOffsetInput)
    // Get the `times` index for `tfOpen2` to retrieve the second offset HTF bar's high and low values.
    int offsetIndex2 = times.binary_search_leftmost(tfOpen2)
    // Draw a box to show the HTF bar that opens at `tfOpen2` and closes at `tfClose2`.
    box.new(
        tfOpen2, highs.get(offsetIndex2), tfClose2, lows.get(offsetIndex2), 
        color.purple, xloc = xloc.bar_time, bgcolor = #9c27b099, text_color = chart.fg_color,
        text = "Open: " + str.format_time(tfOpen2) + "\n\nClose: " + str.format_time(tfClose2)
    )

// Color the background of the last historical bar for visual reference.
bgcolor(barstate.islastconfirmedhistory ? color.new(chart.fg_color, 80) : na, title = "Last historical bar highlight")
Note that:

The script tracks high, low, and opening time values for each HTF period in arrays to determine the price ranges of the boxes. The arrays contain one element for each successive change in the value of time(tfInput). The script searches through the times array and finds the indices of the earliest elements that match the calculated HTF opening times, then uses the highs and lows array elements at those indices to set the top and bottom edges of the boxes.

In the image below, we applied the script to a chart with the “240” (4 hour) timeframe, using the default settings. The vertical line is at the last historical bar because the “Chart bar offset” input’s value is 0, and the blue box displays the HTF range that contains that chart bar. The purple box shows the range that is one HTF period before the blue box, because the “HTF offset” input’s value is 1:

If we change the chart bar offset to -4, the vertical line moves four bars forward on the chart. In the following image, that chart bar belongs to the next HTF period, not the current one. Therefore, the blue box now displays the expected time range of the future HTF bar. With the same HTF offset of 1, the purple box now shows the current HTF bar’s range, because its timestamps are always one HTF period behind those for the blue box:

If we increase the HTF offset to 3, the distance from the purple box to the blue box is three HTF periods, regardless of how we change the chart bar offset. In this image, the purple box now shows the range from two HTF bars before the current one, because our chart offset still refers to the upcoming HTF bar:

Calendar-based functions
The year(), month(), weekofyear(), dayofmonth(), dayofweek(), hour(), minute(), and second() functions calculate calendar-based “int” values from a UNIX timestamp. Unlike the calendar-based variables, which always hold exchange calendar values based on the current bar’s opening timestamp, these functions can return calendar values for any valid timestamp and express them in a chosen time zone.
Each of these calendar-based functions has the following two signatures:
functionName(time) → series intfunctionName(time, timezone) → series int
Where:

functionName is the function’s identifier.
The time parameter accepts an “int” UNIX timestamp for which the function calculates a corresponding calendar value.
The timezone parameter accepts a time zone string specifying the returned value’s time zone. If the timezone argument is not specified, the function uses the exchange time zone (syminfo.timezone).

In contrast to the functions that return UNIX timestamps, a calendar-based function returns different “int” results for various time zones, as calendar values represent parts of a local time in a specific region.
For instance, the simple script below uses two calls to dayofmonth() to calculate each bar’s opening day in the exchange time zone and the “Australia/Sydney” time zone. It plots the results of the two calls in a separate pane for comparison:

```pinescript
//@version=6
indicator("`dayofmonth()` demo", overlay = false)

//@variable An "int" representing the current bar's opening calendar day in the exchange time zone. 
//          Equivalent to the `dayofmonth` variable. 
int openingDay = dayofmonth(time)

//@variable An "int" representing the current bar's opening calendar day in the "Australia/Sydney" time zone.
int openingDaySydney = dayofmonth(time, "Australia/Sydney")

// Plot the calendar day values.
plot(openingDay,       "Day of Month (Exchange)", linewidth = 6, color = color.blue)
plot(openingDaySydney, "Day of Month (Sydney)",   linewidth = 3, color = color.orange)
```
Note that:

The first dayofmonth() call calculates the bar’s opening day in the exchange time zone because it does not include a timezone argument. This call returns the same value that the dayofmonth variable references.
Our example symbol’s exchange time zone is “America/New_York”, which follows UTC-5 during standard time and UTC-4 during daylight saving time (DST). The “Australia/Sydney” time zone follows UTC+10 during standard time and UTC+11 during DST. However, Sydney observes DST at different times of the year than New York. As such, its time zone is 14, 15, or 16 hours ahead of the exchange time zone, depending on the time of year. The plots on our “1D” chart diverge when the difference is at least 15 hours because the bars open at 09:30 in exchange time, and 15 hours ahead is 00:30 on the next calendar day.

It’s important to understand that although the time argument in a calendar-based function call represents a single, absolute point in time, each function returns only part of the date and time information available from the timestamp. Consequently, a calendar-based function’s returned value does not directly correspond to a unique time point, and conditions based on individual calendar values can apply to multiple bars.
For example, this script uses the timestamp() function to calculate a UNIX timestamp from a date “string”, and it calculates the calendar day from that timestamp, in the exchange time zone, with the dayofmonth() function. The script compares each bar’s opening day to the calculated day and highlights the background when the two are equal:

```pinescript
//@version=6
indicator("`dayofmonth()` demo", overlay = false)

//@variable The UNIX timestamp corresponding to August 29, 2024 at 00:00:00 UTC.
```
const int fixedTimestamp = timestamp("29 Aug 2024")
```pinescript
//@variable The day of the month calculated from the `fixedTimestamp`, expressed in the exchange time zone. 
//          If the exchange time zone has a negative UTC offset, this variable's value is 28 instead of 29.
int dayFromTimestamp = dayofmonth(fixedTimestamp)

//@variable An "int" representing the current bar's opening calendar day in the exchange time zone. 
//          Equivalent to the `dayofmonth` variable. 
int openingDay = dayofmonth(time)

// Plot the `openingDay`.
plot(openingDay, "Opening day of month", linewidth = 3)
// Highlight the background when the `openingDay` equals the `dayFromTimestamp`.
bgcolor(openingDay == dayFromTimestamp ? color.orange : na, title = "Day detected highlight")
```
Note that:

The timestamp() call treats its argument as a UTC calendar date because its dateString argument does not specify time zone information. However, the dayofmonth() call calculates the day in the exchange time zone. Our example symbol’s exchange time zone is “America/New_York” (UTC-4/-5). Therefore, the returned value on this chart is 28 instead of 29.
The script highlights any bar on our chart that opens on the 28th day of any month instead of only a specific bar because the dayofmonth() function’s returned value does not represent a specific point in time on its own.
This script highlights the bars that open on the day of the month calculated from the timestamp. However, some months on our chart have no trading activity on that day. For example, the script does not highlight when the July 28, 2024 occurs on our chart because NASDAQ is closed on Sundays.

Similar to calendar-based variables, these functions are also helpful when testing for dates/times and detecting calendar changes on the chart. The example below uses the year(), month(), weekofyear(), and dayofweek() functions on the time_close timestamp to create conditions that test if the current bar is the first bar that closes in a new year, quarter, month, week, and day. The script plots shapes, draws labels, and uses background colors to visualize the conditions on the chart:

```pinescript
//@version=6
indicator("Calendar changes demo", overlay = true, max_labels_count = 500)

// Calculate the year, month, week of year, and day of week corresponding to the `time_close` UNIX timestamp.
// All values are expressed in the exchange time zone. 
int closeYear       = year(time_close)
int closeMonth      = month(time_close)
int closeWeekOfYear = weekofyear(time_close)
int closeDayOfWeek  = dayofweek(time_close)

//@variable Is `true` when the change in `closeYear` exceeds 0, marking the first bar that closes in a new year.  
bool closeInNewYear = ta.change(closeYear) > 0
//@variable Is `true` when the difference in `closeMonth` is not 0, marking the first bar that closes in a new month. 
bool closeInNewMonth = closeMonth - closeMonth[1] != 0
//@variable Is `true` when `closeMonth - 1` becomes divisible by 3, marking the first bar that closes in a new quarter. 
bool closeInNewQuarter = (closeMonth[1] - 1) % 3 != 0 and (closeMonth - 1) % 3 == 0
//@variable Is `true` when the change in `closeWeekOfYear` is not 0, marking the first bar that closes in a new week.
bool closeInNewWeek = ta.change(closeWeekOfYear) != 0
//@variable Is `true` when the `closeDayOfWeek` changes, marking the first bar that closes in the new day.
bool closeInNewDay = closeDayOfWeek != closeDayOfWeek[1]

//@variable Switches between `true` and `false` after every `closeInNewDay` occurrence for background color calculation.
var bool alternateDay = true
if closeInNewDay
    alternateDay := not alternateDay

// Draw a label above the bar to display the `closeWeekOfYear` when `closeInNewWeek` is `true`. 
if closeInNewWeek
    label.new(
```
         time, 0, "W" + str.tostring(closeWeekOfYear), xloc.bar_time, yloc.abovebar, color.purple, 
         textcolor = color.white, size = size.normal
     )
// Plot label shapes at the bottom and top of the chart for the `closeInNewYear` and `closeInNewMonth` conditions. 
plotshape(
     closeInNewYear, "Close in new year", shape.labelup, location.bottom, color.teal, text = "New year", 
     textcolor = color.white, size = size.huge
 )
plotshape(
     closeInNewMonth, "Close in new month", shape.labeldown, location.top, text = "New month", 
     textcolor = color.white, size = size.large
 )
// Plot a triangle below the chart bar when `closeInNewQuarter` occurs. 
plotshape(
     closeInNewQuarter, "Close in new quarter", shape.triangleup, location.belowbar, color.maroon, 
     text = "New quarter", textcolor = color.maroon, size = size.large
 )
// Highlight the background in alternating colors based on occurrences of `closeInNewDay`.
bgcolor(alternateDay ? color.new(color.aqua, 80) : color.new(color.fuchsia, 80), title = "Closing day change")
Note that:

This script’s conditions check for the first bar that closes after each calendar unit changes its value. The bar where each condition is true varies with the data available on the chart. For example, the closeInNewMonth condition can be true after the first calendar day of the month if a chart bar did not close on that day.
To detect when new bars start on a specific timeframe rather than strictly calendar changes, check when the ta.change() of a time() or time_close() call’s returned value is nonzero, or use the timeframe.change() function. See this section above for more information.

​timestamp()​
The timestamp() function calculates a UNIX timestamp from a specified calendar date and time. It has the following three signatures:
timestamp(year, month, day, hour, minute, second) → simple/series inttimestamp(timezone, year, month, day, hour, minute, second) → simple/series inttimestamp(dateString) → const int
The first two signatures listed include year, month, day, hour, minute, and second parameters that accept “int” values defining the calendar date and time. A timestamp() call with either signature must include year, month, and day arguments. The other parameters are optional, each with a default value of 0. Both signatures can return either “simple” or “series” values, depending on the qualified types of the specified arguments.
The primary difference between the first two signatures is the timezone parameter, which accepts a time zone string that determines the time zone of the date and time specified by the other parameters. If a timestamp() call with “int” calendar arguments does not include a timezone argument, it uses the exchange time zone (syminfo.timezone) by default.
The third signature listed has only one parameter, dateString, which accepts a “string” representing a valid calendar date (e.g., "20 Aug 2024"). The value can also include the time of day and time zone (e.g., "20 Aug 2024 00:00:00 UTC+0"). If the dateString argument does not specify the time of day, the timestamp() call considers the time 00:00 (midnight).
Unlike the other two signatures, the default time zone for the third signature is GMT+0. It does not use the exchange time zone by default because it interprets time zone information from the dateString directly. Additionally, the third signature is the only one that returns a “const int” value. As shown in the Time input section of the Inputs page, programmers can use this overload’s returned value as the defval argument in an input.time() function call.
When using the timestamp() function, it’s crucial to understand how time zone information affects its calculations. The absolute point in time represented by a specific calendar date depends on its time zone, as an identical date and time in various time zones can refer to different amounts of time elapsed since the UNIX Epoch. Therefore, changing the time zone of the calendar date and time in a timestamp() call can change its returned UNIX timestamp.
The following script compares the results of four different timestamp() calls that evaluate the date 2021-01-01 in different time zones. The first timestamp() call does not specify time zone information in its dateString argument, so it treats the value as a UTC calendar date. The fourth call also evaluates the calendar date in UTC because it includes "UTC0" as the timezone argument. The second timestamp() call uses the first signature listed above, meaning it uses the exchange time zone, and the third call uses the second signature with "America/New_York" as the timezone argument.
The script draws a table with rows displaying each timestamp() call, its assigned variable, the calculated UNIX timestamp, and a formatted representation of the time. As we see on the “NASDAQ:MSFT” chart below, the first and fourth table rows show different timestamps than the second and third, leading to different formatted strings in the last column:

```pinescript
//@version=6
indicator("`timestamp()` demo", overlay = false)

//@variable A `table` that displays the different `timestamp()` calls, their returned timestamps, and formatted results.
var table displayTable = table.new(
```
     position.middle_center, 4, 5, color.white, border_color = color.black, border_width = 2
 )

```pinescript
//@function Initializes a `displayTable` cell showing the `displayText` with an optional `specialFormat`.
printCell(int colID, int rowID, string displayText, string specialFormat = "") => 
    displayTable.cell(colID, rowID, displayText, text_size = size.large)
    switch specialFormat 
```
        "header"  => displayTable.cell_set_bgcolor(colID, rowID, color.rgb(76, 175, 79, 70))
        "code"    => 
            displayTable.cell_set_text_font_family(colID, rowID, font.family_monospace)
            displayTable.cell_set_text_size(colID, rowID, size.normal)
            displayTable.cell_set_text_halign(colID, rowID, text.align_left)

if barstate.islastconfirmedhistory
```pinescript
    //@variable The UNIX timestamp corresponding to January 1, 2021 in the UTC+0 time zone. 
    int dateTimestamp1 = timestamp("2021-01-01")
    //@variable The UNIX timestamp corresponding to January 1, 2021 in the exchange time zone. 
    int dateTimestamp2 = timestamp(2021, 1, 1, 0, 0)
    //@variable The UNIX timestamp corresponding to January 1, 2021 in the "America/New_York" time zone. 
    int dateTimestamp3 = timestamp("America/New_York", 2021, 1, 1, 0, 0)
    //@variable The UNIX timestamp corresponding to January 1, 2021 in the "UTC0" (UTC+0) time zone. 
    int dateTimestamp4 = timestamp("UTC0", 2021, 1, 1, 0, 0)

    // Initialize the top header cells in the `displayTable`. 
    printCell(0, 0, "Variable",            "header")
    printCell(1, 0, "Function call",       "header")
    printCell(2, 0, "Timestamp returned",  "header")
    printCell(3, 0, "Formatted date/time", "header")
    // Initialize a table row for `dateTimestamp1` results. 
    printCell(0, 1, "`dateTimestamp1`", "header")
    printCell(1, 1, "`timestamp(\"2021-01-01\")`", "code")
    printCell(2, 1, str.tostring(dateTimestamp1))
    printCell(3, 1, str.format_time(dateTimestamp1, "yyyy.MM.dd  HH:mm (Z)"))
    // Initialize a table row for `dateTimestamp2` results. 
    printCell(0, 2, "`dateTimestamp2`", "header")
    printCell(1, 2, "`timestamp(2021, 1, 1, 0, 0)`", "code")
    printCell(2, 2, str.tostring(dateTimestamp2))
    printCell(3, 2, str.format_time(dateTimestamp2, "yyyy.MM.dd  HH:mm (Z)"))
    // Initialize a table row for `dateTimestamp3` results. 
    printCell(0, 3, "`dateTimestamp3`", "header")
    printCell(1, 3, "`timestamp(\"America/New_York\", 2021, 1, 1, 0, 0)`", "code")
    printCell(2, 3, str.tostring(dateTimestamp3))
    printCell(3, 3, str.format_time(dateTimestamp3, "yyyy.MM.dd  HH:mm (Z)"))
    // Initialize a table row for `dateTimestamp4` results. 
    printCell(0, 4, "`dateTimestamp4`", "header")
    printCell(1, 4, "`timestamp(\"UTC0\", 2021, 1, 1, 0, 0)`", "code")
    printCell(2, 4, str.tostring(dateTimestamp4))
    printCell(3, 4, str.format_time(dateTimestamp4, "yyyy.MM.dd  HH:mm (Z)"))
```
Note that:

The formatted date-time strings express results in the exchange time zone because the str.format_time() function uses syminfo.timezone as the default timezone argument. The formatted values on our example chart show the offset string "-0500" because NASDAQ’s time zone (“America/New_York”) follows UTC-5 during standard time.
The formatted strings on the first and fourth rows show the date and time five hours before January 1, 2021, because the timestamp() calls evaluated the date in UTC and the str.format_time() calls used a time zone five hours behind UTC.
On our chart, the second and third rows have matching timestamps because both corresponding timestamp() calls evaluated the date in the “America/New_York” time zone. The two rows would show different results if we applied the script to a symbol with a different exchange time zone.

Formatting dates and times
Programmers can format UNIX timestamps into human-readable dates and times, expressed in specific time zones, using the str.format_time() function. The function has the following signature:
str.format_time(time, format, timezone) → series string
Where:

The time parameter specifies the “int” UNIX timestamp to express as a readable time.
The format parameter accepts a “string” consisting of formatting tokens that determine the returned information. If the function call does not include a format argument, it uses the ISO 8601 standard format: "yyyy-MM-dd'T'HH:mm:ssZ". See the table below for a list of valid tokens and the information they represent.
The timezone parameter determines the time zone of the formatted result. It accepts a time zone string in UTC or IANA notation. If the call does not specify a timezone, it uses the exchange time zone (syminfo.timezone).

The general-purpose str.format() function can also format UNIX timestamps into readable dates and times. However, the function cannot express time information in different time zones. It always expresses dates and times in UTC+0. In turn, using this function to format timestamps often results in erroneous practices, such as mathematically modifying a timestamp to try and represent the time in another time zone. However, a UNIX timestamp is a unique, time zone-agnostic representation of a specific point in time. As such, modifying a UNIX timestamp changes the absolute time it represents rather than expressing the same time in a different time zone.
The str.format_time() function does not have this limitation, as it can calculate dates and times in any time zone correctly without changing the meaning of a UNIX timestamp. In addition, unlike str.format(), it is optimized specifically for processing time values. Therefore, we recommend that programmers use str.format_time() instead of str.format() to format UNIX timestamps into readable dates and times.
A str.format_time() call’s format argument determines the time information its returned value contains. The function treats characters and sequences in the argument as formatting tokens, which act as placeholders for values in the returned date/time “string”. The following table outlines the most commonly used formatting tokens and explains what each represents:

TokenRepresentsRemarks and examples"y"YearUse "yy" to include the last two digits of the year (e.g., "00"), or "yyyy" to include the complete year number (e.g., "2000")."M"MonthUppercase "M" for the month, not to be confused with lowercase "m" for the minute. Use "MM" to include the two-digit month number with a leading zero for single-digit values (e.g., "01"), "MMM" to include the three-letter abbreviation of month (e.g., "Jan"), or "MMMM" for the full month name (e.g., "January")."d"Day of the monthLowercase "d". Includes the numeric day of the month ("1" to "31").  Use "dd" for the two-digit day number with a leading zero for single-digit values. It is not a placeholder for the day number of the week (1-7). Use dayofweek() to calculate that value."D"Day of the yearUppercase "D".  Includes the numeric day of the year ("1" to "366").  Use "DD" or "DDD" for the two-digit or three-digit day number with leading zeros."E"Day of the weekIncludes the abbreviation of the weekday name (e.g., "Mon").  Use "EEEE" for the weekday’s full name (e.g., "Monday")"w"Week of the yearLowercase "w". Includes the week number of the year ("1" to "53"). Use "ww" for the two-digit week number with a leading zero for single-digit values."W"Week of the monthUppercase "W". Includes the week number of the month ("1" to "5")."a"AM/PM postfixLowercase "a". Includes "AM" if the time of day is before noon, "PM" otherwise."h"Hour in the 12-hour formatLowercase "h". The included hour number from this token ranges from "0" to "11". Use "hh" for the two-digit hour with a leading zero for single-digit values."H"Hour in the 24-hour formatUppercase "H". The included hour number from this token ranges from "0" to "23". Use "HH" for the two-digit hour with a leading zero for single-digit values."m"MinuteLowercase "m" for the minute, not to be confused with uppercase "M" for the month. Use "mm" for the two-digit minute with a leading zero for single-digit values."s"SecondLowercase "s" for the second, not to be confused with uppercase "S" for fractions of a second. Use "ss" for the two-digit second with a leading zero for single-digit values."S"Fractions of a secondUppercase "S".  Includes the number of milliseconds in the fractional second ("0" to "999").  Use "SS" or "SSS" for the two-digit or three-digit millisecond number with leading zeros."Z"Time zone (UTC offset)Uppercase "Z".  Includes the hour and minute UTC offset value in "HHmm" format, preceded by its sign (e.g., "-0400")."z"Time zone (abbreviation or name)Lowercase "z".  A single "z" includes the abbreviation of the time zone (e.g., "EDT").  Use "zzzz" for the time zone’s name (e.g., "Eastern Daylight Time"). It is not a placeholder for the IANA identifier. Use syminfo.timezone to retrieve the exchange time zone’s IANA representation.":", "/", "-", ".", ",", "(", ")", " "SeparatorsThese characters are separators for formatting tokens. They appear as they are in the formatted text. (e.g., "01/01/24", "12:30:00", "Jan 1, 2024").  Some other characters can also act as separators. However, the ones listed are the most common."'"Escape characterCharacters enclosed within two single quotes appear as they are in the result, even if they otherwise act as formatting tokens. For example, " 'Day' " appears as-is in the resulting “string” instead of listing the day of the year, AM/PM postfix, and year.
The following example demonstrates how various formatting tokens affect the str.format_time() function’s result. The script calls the function with different format arguments to create date/time strings from time, timenow, and time_close timestamps. It displays each format value and the corresponding formatted result in a table on the last bar:

```pinescript
//@version=6
indicator("Formatting dates and times demo", overlay = false)

//@variable A `table` that displays different date/time `format` strings and their results.
var table displayTable = table.new(
```
     position.middle_center, 2, 15, bgcolor = color.white, 
     frame_color = color.black, frame_width = 1, border_width = 1
 )

```pinescript
//@function Initializes a `displayTable` row showing a `formatString` and its formatted result for a specified 
//          `timeValue` and `timezoneValue`.
displayText(rowID, formatString, timeValue = time, timezoneValue = syminfo.timezone) =>
    //@variable Is light blue if the `rowID` is even, white otherwise. Used to set alternating table row colors.
    color rowColor = rowID % 2 == 0 ? color.rgb(33, 149, 243, 75) : color.white
    // Display the `formatString` in the row's first cell.
    displayTable.cell(
```
         0, rowID, formatString,
         text_color = color.black, text_halign = text.align_left, bgcolor = rowColor
     )
    // Show the result of formatting the `timeValue` based on the `formatString` and `timezoneValue` in the second cell.
    displayTable.cell(
         1, rowID, str.format_time(timeValue, formatString, timezoneValue), 
         text_color = color.black, text_halign = text.align_right, bgcolor = rowColor
     )

if barstate.islast
    // Initialize the table's header cells.
    displayTable.cell(0, 0, "FORMAT STRINGS")
    displayTable.cell(1, 0, "FORMATTED DATE/TIME OUTPUT")
    // Initialize a row to show the default date-time "string" format and its result for `time`. 
    displayTable.cell(
         0, 1, "(Default `str.format_time()` format)", 
         text_color = color.black, text_halign = text.align_left, bgcolor = color.yellow)
    displayTable.cell(
         1, 1, str.format_time(time), 
         text_color = color.black, text_halign = text.align_right, bgcolor = color.yellow)

    // Initialize rows to show different formatting strings and their results for `time`, `time_close`, and `timenow`.
    displayText(2, "dd/MM/yy")
    displayText(3, "MMMM dd, yyyy")
    displayText(4, "hh:mm:ss.SS a", timenow)
    displayText(5, "HH:mm 'UTC'Z")
    displayText(6, "H:mm a (zzzz)")
    displayText(7, "my day / 'my day' ('escaped')")
    displayText(8, "'Month' M, 'Week' w, 'Day' DDD")
    displayText(9, "'Bar expected closing time': ha", time_close)
    displayText(10, "'Current date/time': MMM-d-y HH:mm:ss z", timenow)
    displayText(11, "'New Time zone': zzzz", timezoneValue = "Australia/Sydney")
    displayText(12, "'Time zone change': MMM-d-y HH:mm:ss z", timenow, "Australia/Sydney")
Expressing time differences
Every UNIX timestamp represents a specific point in time as the absolute time difference from a fixed historical point (epoch). The specific epoch all UNIX timestamps reference is midnight UTC on January 1, 1970. Programmers can format UNIX timestamps into readable date-time strings with the str.format_time() function because it uses the time difference from the UNIX Epoch in its date and time calculations.
In contrast, the difference between two nonzero UNIX timestamps represents the number of milliseconds elapsed from one absolute point to another. The difference does not directly refer to a specific point in UNIX time if neither timestamp in the operation has a value of 0 (corresponding to the UNIX Epoch).
Programmers may want to express the millisecond difference between two UNIX timestamps in other time units, such as seconds, days, etc. Some might assume they can use the difference as the time argument in a str.format_time() call to achieve this result. However, the function always treats its time argument as the time elapsed from the UNIX Epoch to derive a calendar date/time representation in a specific time zone. It does not express time differences directly. Therefore, attempting to format timestamp differences rather than timestamps with str.format_time() leads to unintended results.
For example, the following script calculates the millisecond difference between the current execution time (timenow) and the “1M” bar’s closing time (time_close("1M")) for a monthly countdown timer display. It attempts to express the time difference in another format using str.format_time(). It displays the function call’s result in a table, along with the original millisecond difference (timeLeft) and formatted date-time representations of the timestamps.
As we see below, the table shows correct results for the formatted timestamps and the timeLeft value. However, the formatted time difference appears as "1970-01-12T16:47:10-0500". Although the timeLeft value is supposed to represent a difference between timestamps rather than a specific point in time, the str.format_time() function still treats the value as a UNIX timestamp. Consequently, it creates a “string” expressing the value as a date and time in the UTC-5 time zone:

```pinescript
//@version=6
indicator("Incorrectly formatting time difference demo", overlay = true)

//@variable A table that displays monthly close countdown information.
var table displayTable = table.new(position.top_right, 1, 4, color.rgb(0, 188, 212, 60))

if barstate.islast
    //@variable A UNIX timestamp representing the current time as of the script's latest execution. 
    int currentTime = timenow
    //@variable A UNIX timestamp representing the expected closing time of the current "1M" bar. 
    int monthCloseTime = time_close("1M")

    //@variable The number of milliseconds between the `currentTime` and the `monthCloseTime`. 
    //          This value is NOT intended as a UNIX timestamp.
    int timeLeft = monthCloseTime - currentTime
    //@variable A "string" representing the `timeLeft` as a date and time in the exchange time zone, in ISO 8601 format.
    //          This format is INCORRECT for the `timeLeft` value because it's supposed to represent the time between 
    //          two nonzero UNIX timestamps, NOT a specific point in time.
    string incorrectTimeFormat = str.format_time(timeLeft)

    // Initialize `displayTable` cells to initialize the `currentTime` and `monthCloseTime`.
    displayTable.cell(
```
         0, 0, "Current time: " + str.format_time(currentTime, "HH:mm:ss.S dd/MM/yy (z)"), 
         text_size = size.large, text_halign = text.align_right
     )
    displayTable.cell(
         0, 1, "`1M` Bar closing time: " + str.format_time(monthCloseTime, "HH:mm:ss.SS dd/MM/yy (z)"), 
         text_size = size.large, text_halign = text.align_right
     )
    // Initialize a cell to display the `timeLeft` millisecond difference.
    displayTable.cell(
         0, 2, "`timeLeft` value: " + str.tostring(timeLeft), 
         text_size = size.large, bgcolor = color.yellow
     )
    // Initialize a cell to display the `incorrectTimeFormat` representation.
    displayTable.cell(
         0, 3, "Time left (incorrect format): " + incorrectTimeFormat, 
         text_size = size.large, bgcolor = color.maroon, text_color = color.white
     )
To express the difference between timestamps in other time units correctly, programmers must write code that calculates the number of units elapsed instead of erroneously formatting the difference as a specific date or time.
The calculations required to express time differences depend on the chosen time units. The sections below explain how to express millisecond differences in weekly and smaller units, and monthly and larger units.
Weekly and smaller units
Weeks and smaller time units (days, hours, minutes, seconds, and milliseconds) cover consistent blocks of time. These units have the following relationship:

One week equals seven days.
One day equals 24 hours.
One hour equals 60 minutes.
One minute equals 60 seconds.
One second equals 1000 milliseconds.

Using this relationship, programmers can define the span of these units by the number of milliseconds they contain. For example, since every hour has 60 minutes, every minute has 60 seconds, and every second has 1000 milliseconds, the number of milliseconds per hour is 60 * 60 * 1000, which equals 3600000.
Programmers can use modular arithmetic based on the milliseconds in each unit to calculate the total number of weeks, days, and smaller spans covered by the difference between two UNIX timestamps. The process is as follows, starting from the largest time unit in the calculation:

Calculate the number of milliseconds in the time unit.
Divide the remaining millisecond difference by the calculated value and round down to the nearest whole number. The result represents the number of complete time units within the interval.
Use the remainder from the division as the new remaining millisecond difference.
Repeat steps 1-3 for each time unit in the calculation, in descending order based on size.

The following script implements this process in a custom formatTimeSpan() function. The function accepts two UNIX timestamps defining a start and end point, and its “bool” parameters control whether it calculates the number of weeks or smaller units covered by the time range. The function calculates the millisecond distance between the two timestamps. It then calculates the numbers of complete units covered by that distance and formats the results into a “string”.
The script calls formatTimeSpan() to express the difference between two separate time input values in selected time units. It then displays the resulting “string” in a table alongside formatted representations of the start and end times:

```pinescript
//@version=6
indicator("Calculating time span demo")

// Assign the number of milliseconds in weekly and smaller units to "const" variables for convenience.
```
const int ONE_WEEK   = 604800000
const int ONE_DAY    =  86400000 
const int ONE_HOUR   =   3600000
const int ONE_MINUTE =     60000
const int ONE_SECOND =      1000

```pinescript
//@variable A UNIX timestamp calculated from the user-input start date and time. 
int startTimeInput = input.time(timestamp("1 May 2022 00:00 -0400"), "Start date and time", group = "Time between")
//@variable A UNIX timestamp calculated from the user-input end date and time. 
int endTimeInput =   input.time(timestamp("7 Sep 2024 20:37 -0400"), "End date and time", group = "Time between")
// Create "bool" inputs to toggle weeks, days, hours, minutes, seconds, and milliseconds in the calculation.
bool weeksInput        = input.bool(true, "Weeks",        group = "Time units", inline = "A")
bool daysInput         = input.bool(true, "Days",         group = "Time units", inline = "A")
bool hoursInput        = input.bool(true, "Hours",        group = "Time units", inline = "B")
bool minutesInput      = input.bool(true, "Minutes",      group = "Time units", inline = "B")
bool secondsInput      = input.bool(true, "Seconds",      group = "Time units", inline = "B")
bool millisecondsInput = input.bool(true, "Milliseconds", group = "Time units", inline = "B")

//@function Calculates the difference between two UNIX timestamps as the number of complete time units in 
//          descending order of size, formatting the results into a "string". The "int" parameters accept timestamps, 
//          and the "bool" parameters determine which units the function uses in its calculations. 
formatTimeSpan(
      int startTimestamp, int endTimestamp, bool calculateWeeks, bool calculateDays, bool calculateHours, 
      bool calculateMinutes, bool calculateSeconds, bool calculateMilliseconds
```
 ) =>
```pinescript
    //@variable The milliseconds between the `startTimestamp` and `endTimestamp`.
    int timeDifference = math.abs(endTimestamp - startTimestamp) 
    //@variable A "string" representation of the interval in mixed time units. 
    string formattedString = na
    // Calculate complete units within the interval for each toggled unit, reducing the `timeDifference` by those sizes.
    if calculateWeeks
        int totalWeeks = math.floor(timeDifference / ONE_WEEK)
```
        timeDifference %= ONE_WEEK
        formattedString += str.tostring(totalWeeks) + (totalWeeks == 1 ? " week " : " weeks ") 
    if calculateDays
        int totalDays = math.floor(timeDifference / ONE_DAY)
        timeDifference %= ONE_DAY
        formattedString += str.tostring(totalDays) + (totalDays == 1 ? " day " : " days ")
    if calculateHours
        int totalHours = math.floor(timeDifference / ONE_HOUR)
        timeDifference %= ONE_HOUR
        formattedString += str.tostring(totalHours) + (totalHours == 1 ? " hour " : " hours ")
    if calculateMinutes
        int totalMinutes = math.floor(timeDifference / ONE_MINUTE)
        timeDifference %= ONE_MINUTE
        formattedString += str.tostring(totalMinutes) + (totalMinutes == 1 ? " minute " : " minutes ")
    if calculateSeconds
        int totalSeconds = math.floor(timeDifference / ONE_SECOND)
        timeDifference %= ONE_SECOND
        formattedString += str.tostring(totalSeconds) + (totalSeconds == 1 ? " second " : " seconds ")  
    if calculateMilliseconds
        // `timeDifference` is in milliseconds already, so add it to the `formattedString` directly.
        formattedString += str.tostring(timeDifference) + (timeDifference == 1 ? " millisecond" : " milliseconds")
    // Return the `formattedString`.
    formattedString

if barstate.islastconfirmedhistory
```pinescript
    //@variable A table that that displays formatted start and end times and their custom-formatted time difference. 
    var table displayTable = table.new(position.middle_center, 1, 2, color.aqua)
    //@variable A "string" containing formatted `startTimeInput` and `endTimeInput` values. 
    string timeText = "Start date and time: "    + str.format_time(startTimeInput, "dd/MM/yy HH:mm:ss (z)")
```
                     + "\n  End date and time: " + str.format_time(endTimeInput, "dd/MM/yy HH:mm:ss (z)")
```pinescript
    //@variable A "string" representing the span between `startTimeInput` and `endTimeInput` in mixed time units.
    string userTimeSpan = formatTimeSpan(
```
         startTimeInput, endTimeInput, weeksInput, daysInput, hoursInput, minutesInput, secondsInput, millisecondsInput
      )
    // Display the `timeText` in the table.
    displayTable.cell(0, 0, timeText, 
         text_color = color.white, text_size = size.large, text_halign = text.align_left)
    // Display the `userTimeSpan` in the table.
    displayTable.cell(0, 1, "Time span: " + userTimeSpan, 
          text_color = color.white, text_size = size.large, text_halign = text.align_left, bgcolor = color.navy)
Note that:

The user-defined function uses math.floor() to round each divided result down to the nearest “int” value to get the number of complete units in the interval. After division, it uses the modulo assignment operator (%=) to get the remainder and assign that value to the timeDifference variable. This process repeats for each selected unit.

The image above shows the calculated time difference in mixed time units. By toggling the “bool” inputs, users can also isolate specific units in the calculation. For example, this image shows the result after enabling only the “Milliseconds” input:

Monthly and larger units
Unlike weeks and smaller units, months and larger units vary in length based on calendar rules. For example, a month can contain 28, 29, 30, or 31 days, and a year can contain 365 or 366 days.
Some programmers prefer to use the modular arithmetic outlined in the previous section, with approximate lengths for these irregular units, to calculate large-unit durations between UNIX timestamps. With this process, programmers usually define the units in either of the following ways:

Using common lengths, e.g., a common year equals 365 days, and a common month equals 30 days.
Using the average lengths, e.g., an average year equals 365.25 days, and an average month equals 30.4375 days.

Calculations involving approximate units produce rough estimates of the elapsed time. Such estimates are often practical when expressing relatively short durations. However, their precision diminishes with the size of the difference, drifting further away from the actual time elapsed.
Therefore, expressing time differences in monthly and larger units with precision requires a different calculation than the process outlined above. For a more precise estimate of months, years, and larger units elapsed, the calculations should use the actual span of each individual unit rather than approximations, meaning it must account for leap years and variations in month sizes.
The advanced example below contains a custom formatTimeDifference() function that calculates the years and months, in addition to days and smaller units, elapsed between two UNIX timestamps.
The function uses the process outlined in the previous section to calculate the daily and smaller units within the interval. For the monthly and yearly units, which have irregular lengths, the function uses a while loop to iterate across calendar months. On each iteration, it increments monthly and yearly counters and subtracts the number of days in the added month from the day counter. After the loop ends, the function adjusts the year, month, and day counters to account for partial months elapsed between the timestamps. Finally, it uses the counters in a str.format() call to create a formatted “string” containing the calculated values.
The script calls this formatTimeDifference() function to calculate the years, months, days, hours, minutes, seconds, and milliseconds elapsed between two separate time input values and displays the result in a label:

```pinescript
//@version=6
indicator("Calculating time span for larger units demo")

//@variable The starting date and time of the time span, input by the user.
int startTimeInput = input.time(timestamp("3 Apr 2022 20:00 -0400"), "Start date", group = "Time between")
//@variable The ending date and time of the time span, input by the user.
int endTimeInput =   input.time(timestamp("3 Sep 2024 15:45 -0400"), "End date",   group = "Time between")

//@function Returns the number of days in the `monthNumber` month of the `yearNumber` year.
daysPerMonth(int yearNumber, int monthNumber) =>
    //@variable Is `true` if the `yearNumber` represents a leap year.
    bool leapYear = (yearNumber % 4 == 0 and yearNumber % 100 != 0) or (yearNumber % 400 == 0)
    //@variable The number of days calculated for the month.
    int result = switch
        monthNumber == 2 => leapYear ? 29 : 28
```
        =>                  31 - (monthNumber - 1) % 7 % 2

```pinescript
//@function Calculates the relative time difference between two timestamps, covering monthly and larger units.
formatTimeDifference(int timestamp1, int timestamp2) =>
    // The starting time and ending time.
    int startTime = math.min(timestamp1, timestamp2), int endTime = math.max(timestamp1, timestamp2)
    // The year, month, and day of the `startTime` and `endTime`.
    int startYear = year(startTime), int startMonth = month(startTime), int startDay = dayofmonth(startTime)
    int endYear   = year(endTime),   int endMonth   = month(endTime),   int endDay   = dayofmonth(endTime)
    // Calculate the total number of days, hours, minutes, seconds, and milliseconds in the interval.
    int milliseconds = endTime - startTime
    int days         = math.floor(milliseconds / 86400000), milliseconds %= 86400000
    int hours        = math.floor(milliseconds / 3600000),  milliseconds %= 3600000
    int minutes      = math.floor(milliseconds / 60000),    milliseconds %= 60000
    int seconds      = math.floor(milliseconds / 1000),     milliseconds %= 1000
    // Calculate the number of days in the `startMonth` and `endMonth`.
    int daysInStartMonth = daysPerMonth(startYear, startMonth), int daysInEndMonth = daysPerMonth(endYear, endMonth)
    //@variable The number of days remaining in the `startMonth`. 
    int remainingInMonth = daysInStartMonth - startDay + 1
    // Subtract `remainingInMonth` from the `days`, and offset the `startDay` and `startMonth`.
```
    days -= remainingInMonth, startDay := 1, startMonth += 1
    // Set `startMonth` to 1, and increase the `startYear` if the `startMonth` exceeds 12.
    if startMonth > 12
        startMonth := 1, startYear += 1
    // Initialize variables to count the total number of months and years in the interval.
    int months = 0, int years  = 0
    // Loop to increment `months` and `years` values based on the `days`.
    while days > 0
```pinescript
        //@variable The number of days in the current `startMonth`.
        int daysInMonth = daysPerMonth(startYear, startMonth)
        // Break the loop if the number of remaining days is less than the `daysInMonth`.
        if days < daysInMonth
```
            break
        // Reduce the `days` by the `daysInMonth` and increment the `months`.
        days -= daysInMonth, months += 1
        // Increase the `years` and reset the `months` to 0 when `months` is 12.
        if months == 12
            months := 0, years += 1
        // Increase the `startMonth` and adjust the `startMonth` and `startYear` if its value exceeds 12.
        startMonth += 1
        if startMonth > 12
            startMonth := 1, startYear += 1
    // Re-add the `remainingInMonth` value to the number of `days`. Adjust the `days`, `months`, and `years` if the 
    // new value exceeds the `daysInStartMonth` or `daysInEndMonth`, depending on the `startDay`.
    days += remainingInMonth
    if days >= (startDay < daysInStartMonth / 2 ? daysInStartMonth : daysInEndMonth) 
        months += 1
        if months == 12
            months := 0, years += 1
        days -= remainingInMonth
    // Format the calculated values into a "string" and return the result.
    str.format(
        " Years:   {0}\n Months: {1}\n Days:    {2}\n Hours:    {3}\n Minutes:  {4}\n Seconds: {5}\n Milliseconds: {6}",
        years, months, days, hours, minutes, seconds, milliseconds
    )

if barstate.islastconfirmedhistory
```pinescript
    //@variable A "string" representing the time between the `startTimeInput` and `endTimeInput` in mixed units. 
    string userTimeSpan = formatTimeDifference(startTimeInput, endTimeInput)
    //@variable Text shown in the label.
    string labelText = "Start time: " + str.format_time(startTimeInput, "dd/MM/yy HH:mm:ss (z)") + "\n  End time: "
```
         +  str.format_time(endTimeInput, "dd/MM/yy HH:mm:ss (z)") + "\n---------\nTime difference:\n" + userTimeSpan
    label.new(
        bar_index, high, labelText, color = #ff946e, textcolor = #363a45, size = size.large, 
        textalign = text.align_left, style = label.style_label_center
    )
Note that:

The script determines the number of days in each month with the user-defined daysPerMonth() function. The function identifies whether a month has 28, 29, 30, or 31 days based on its month number and the year it belongs to. Its calculation accounts for leap years. A leap year occurs when the year is divisible by 4 or 400 but not by 100.
Before the while loop, the function subtracts the number of days in a partial starting month from the initial day count, aligning the counters with the beginning of a new month. It re-adds the subtracted days after the loop to adjust the counters for partial months. It adjusts the month and year counters based on the days in the startMonth if the startDay is less than halfway through that month. Otherwise, it adjusts the values based on the days in the endMonth.