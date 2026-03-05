# First steps

Introduction
Welcome to the Pine Script® v6 User
Manual,
which will accompany you in your journey to learn to program your own
trading tools in Pine Script. Welcome also to the very active community
of Pine Script programmers on TradingView.
On this page, we present a step-by-step approach that you can follow to gradually become more familiar with indicators and strategies (also called scripts) written in the Pine Script programming language on TradingView. We will get you started on your journey to:

Use some of the tens of thousands of existing scripts on the
platform.
Read the Pine Script code of existing scripts.
Write Pine scripts.

If you are already familiar with the use of Pine scripts on TradingView and are now ready to learn how to write your own, then jump to the Writing scripts section of this page.
If you are new to our platform, then please read on!
Using scripts
If you are interested in using technical indicators or strategies on
TradingView, you can first start exploring the thousands of indicators
already available on our platform. You can access existing indicators on
the platform in two different ways:

By using the chart’s “Indicators, metrics, and strategies” button.
By browsing TradingView’s Community scripts, the largest repository of trading scripts in the world, with more than 150,000 scripts, half of which are free and open-source, which means you can see their Pine Script code.

If you can find the tools you need already written for you, it can be a
good way to get started and gradually become proficient as a script
user, until you are ready to start your programming journey in Pine
Script.
Loading scripts from the chart
To explore and load scripts from your chart, click the “Indicators, metrics, and strategies” button, or use the forward slash / keyboard shortcut:

The dialog box that appears presents different categories of scripts in its left pane:

“Favorites” lists the scripts you have “favorited” by clicking on the star that appears to the left of the script name when you hover over it.
“Personal” displays the scripts you have written and saved in the Pine Editor. They are saved on TradingView’s servers.
“Technicals” groups most TradingView built-in scripts, organized in four categories: “Indicators”, “Strategies”, “Profiles”, and “Patterns”. Most are written in Pine Script and available for free.
“Financials” contains all built-in indicators that display financial metrics. The contents of that tab and the subcategories they are grouped into depend on the symbol currently open on the chart.
“Community” is where you can search from the more than 150,000 published scripts written by TradingView users. The scripts can be sorted by one of the three different filters — “Editors’ picks” only shows open-source scripts hand-picked by our script moderators, “Top” shows the most popular scripts of all time, and “Trending” displays the most popular scripts that were published recently.
“Invite-only” contains the list of the invite-only scripts you have been granted access to by their authors.

Here, we selected the “Technicals” tab to see the TradingView built-in indicators:

Clicking on one of the listed indicators or strategies loads the script on your chart. Strategy scripts are distinguished from indicators by a special symbol that appears to the right of the script name.
Browsing community scripts
To access the Community scripts feed from TradingView’s homepage, select “Indicators and strategies” from the “Community” menu:

You can also search for scripts using the homepage’s “Search” field, and filter scripts using different criteria. See this Help Center page explaining the different types of scripts that are available.
The scripts feed generates script widgets, which show the title and author of each publication with a preview of the published chart and description. Clicking on a widget opens the script page, which shows the publication’s complete description, an enlarged chart, and any additional release notes. Users can boost, favorite, share, and comment on publications. If it is an open-source script, the source code is also available on the script page.

When you find an interesting script in the Community scripts, follow the instructions in the Help Center to load it on your chart.
Changing script settings
Once a script is loaded on the chart, you can double-click on its name or hover over the name and press the “Settings” button to bring up its “Settings/Inputs” tab:

The “Inputs” tab allows you to change the settings which the script’s
author has decided to make editable. You can configure some of the
script’s visuals using the “Style” tab of the same dialog box, and
which timeframes the script should appear on using the “Visibility”
tab.
Other settings are available to all scripts from the buttons that appear
to the right of its name when you mouse over it, and from the “More”
menu (the three dots):

Reading scripts
Reading code written by good programmers is the best way to develop
your understanding of the language. This is as true for Pine Script as
it is for all other programming languages. Finding good open-source Pine
Script code is relatively easy. These are reliable sources of code
written by good programmers on TradingView:

The TradingView built-in indicators
Scripts selected as Editors’ Picks
Scripts by the authors the PineCoders account follows
Many scripts by authors with high reputations and open-source publications

Reading code from Community scripts is easy; if there is no grey or red “lock” icon in the upper-right corner of the script widget, then the script is open-source. By opening the script page, you can read its full source code.
To see the code of a TradingView built-in indicator, load the indicator on your chart, then hover over its name and select the “Source code” curly braces icon (if you don’t see it, it’s because the indicator’s source is unavailable). When you click on the {} icon, the Pine Editor opens below the chart and displays the script’s code. If you want to edit the script, you must first select the “Create a working copy” button. You will then be able to modify and save the code. Because the working copy is a different version of the script, you need to use the Editor’s “Add to chart” button to add that new copy to the chart.
For example, this image shows the Pine Editor, where we selected to view the source code from the “Bollinger Bands” indicator on our chart. Initially, the script is read-only, as indicated by the orange warning text:

You can also open editable versions of the TradingView built-in scripts from the Pine Editor by using the “Create new” > “Built-in…” menu selection:

Writing scripts
We have built Pine Script to empower both new and experienced traders to create their own trading tools. Although learning a first programming language, like trading, is rarely very easy for anyone, we have designed Pine Script so it is relatively easy to learn for first-time programmers, yet powerful enough for knowledgeable programmers to build tools of moderate complexity.
Pine Script allows you to write three types of scripts:

Indicators, like RSI, MACD, etc.
Strategies, which include logic to issue trading orders and can be backtested and forward-tested.
Libraries, which are used by more advanced programmers to package often-used functions that can be reused by other scripts.

The next step we recommend is to write your first indicator.          Next   First indicator              On this pageIntroductionUsing scriptsLoading scripts from the chartBrowsing community scriptsChanging script settingsReading scriptsWriting scripts