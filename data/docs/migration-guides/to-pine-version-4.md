# To Pine Script® version 4

This is a guide to converting Pine Script code from @version=3 to
@version=4.
Converter
The Pine Editor can automatically convert v3 indicators and strategies to v4. The Pine converter is described in the Overview page.
Not all scripts can be automatically converted from v3 to v4. If you
want to convert the script manually or if your indicator returns a
compilation error after conversion, consult the guide below for more
information.
Renaming of built-in constants, variables, and functions
In Pine Script v4 the following built-in constants, variables, and
functions were renamed:

Color constants (e.g red) are moved to the color.* namespace
(e.g. color.red).
The color function has been renamed to color.new.
Constants for input() types (e.g. integer) are moved to the
input.* namespace (e.g. input.integer).
The plot style constants (e.g. histogram style) are moved to the
plot.style_* namespace (e.g. plot.style_histogram).
Style constants for the hline function (e.g. the dotted style)
are moved to the hline.style_* namespace (e.g.
hline.style_dotted).
Constants of days of the week (e.g. sunday) are moved to the
dayofweek.* namespace (e.g. dayofweek.sunday).
The variables of the current chart timeframe (e.g. period,
isintraday) are moved to the timeframe.* namespace (e.g.
timeframe.period, timeframe.isintraday).
The interval variable was renamed to timeframe.multiplier.
The ticker and tickerid variables are renamed to
syminfo.ticker and syminfo.tickerid respectively.
The n variable that contains the bar index value has been renamed
to bar_index.

The reason behind renaming all of the above was to structure the
standard language tools and make working with code easier. New names are
grouped according to assignments under common prefixes. For example, you
will see a list with all available color constants if you type ‘color’
in the editor and press Ctrl + Space.
Explicit variable type declaration
In Pine Script v4 it’s no longer possible to create variables with an
unknown data type at the time of their declaration. This was done to
avoid a number of issues that arise when the variable type changes after
its initialization with the na value. From now on, you need to
explicitly specify their type using keywords or type functions (for
example, float) when declaring variables with the na value:
```pinescript
//@version=4
study("Green Candle Close")
// We expect `src` to hold float values, so we declare in with the `float` keyword
float src = na
if close > open
    src := close
plot(src)         Previous       To Pine Script® version 5      Next   To Pine Script® version 3              On this pageOverviewConverterRenaming of built-in constants, variables, and functionsExplicit variable type declaration
```