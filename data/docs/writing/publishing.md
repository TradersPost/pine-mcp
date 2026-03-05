# Publishing scripts

Introduction
TradingView hosts a large global community of Pine Script® programmers, and millions of traders. Script authors can publish their custom indicator scripts, strategies, and libraries publicly in the Community scripts repository, allowing others in our community to use and learn from them. They can also publish private scripts to create drafts for public releases, test features, or collaborate with friends.
This page explains the script publishing process and provides recommendations to help authors publish their Pine scripts effectively.
NoticeBefore you publish a script, ensure you read and understand our House Rules, Script Publishing Rules, and Vendor Requirements.
Script publications
When an editable script is on the chart and opened in the Pine Editor, users can select the “Publish indicator/strategy/library” button in the top-right corner to open the “Publish script” window and create a script publication:

After the author follows all the necessary steps to prepare the publication and selects the “Publish private/public script” button on the last page of the “Publish script” window, TradingView generates a dedicated script widget and script page, which feature options for users to boost, share, report, and comment on the publication.
The script widget is a preview of the publication that appears in all relevant locations on TradingView, depending on the specified privacy and visibility settings. It shows the script’s title, a compressed view of the published chart, and a brief preview of the script’s description. An icon in the top-right corner of the widget indicates whether the published script is an indicator, strategy, or library:

Clicking on the widget opens the script page. The top of the page shows information about the script’s visibility, its title, and an enlarged view of the published chart:

For published strategies, the script page also includes the option for users to view the Strategy Tester report below the title.
Below the chart or strategy report are the publication’s complete description, release notes from script updates, additional information, and user comments.
Privacy types
Script publications have one of two privacy types, which determine how users can discover them: public or private. Public scripts are discoverable to all members of the TradingView community, whereas private scripts are accessible only via their URLs. Authors set a script publication’s privacy type using the “Privacy settings” field on the second page of the “Publish script” window:

NoticeEnsure you select the correct option in this field when you prepare a publication, as you cannot change a script’s privacy type after you publish it. 
Public
A script published with the “Public” setting is available in the Community scripts feed and discoverable to all TradingView users worldwide. Unlike public ideas, everyone accesses the same global repository for public scripts, regardless of which localized TradingView version they use.
Users can discover public scripts by navigating the Community scripts feed directly, viewing the Scripts tab of an author’s profile, searching the “Community” tab of the “Indicators, Metrics & Strategies” menu, or specifying script keywords in the search bar at the top of many TradingView pages. We also feature exceptional public scripts in our Editors’ picks.
Because public scripts are available to our global community and are not for private use, they must meet the criteria defined in our House Rules, Script Publishing Rules, and Vendor Requirements. Our script moderators analyze public scripts using these criteria. Script publications that do not follow these rules become hidden from the community.
NoticeWhen you publish a public script, you have only 15 minutes to edit or delete it. After that period expires, the publication is finalized and cannot be changed or removed. Therefore, before you publish a public script, validate that everything appears as intended and complies with our rules. The recommended approach is to start with a private script, which you can always edit or delete. 
Private
A script published with the “Private” setting is not available in the Community scripts feed, and users cannot find the publication using TradingView’s search features. The script widget is visible only to the author, from their profile’s Scripts tab. Other users cannot see the script widget, and they cannot view the script page without having access to its URL.
Authors can always edit or delete private script publications, unlike public scripts, using the available options in the top-right corner of the script page. This capability makes private scripts ideal for testing features, collaborating with friends, and creating draft publications before committing to public releases. To learn more about how private publications differ from public ones, see this article in our Help Center.
NoticePrivate scripts are strictly for private use. Our script moderators do not analyze privately published scripts as long as they remain private. As per our Script Publishing Rules and Vendor Requirements, you cannot reference or link to private publications in any public TradingView content. Additionally, if you share links to private scripts in social networks or other public content, those scripts are not considered private.
Visibility types
A script publication’s visibility type determines whether other users can see the source code, and whether anyone or only authorized individuals can use the script. The possible types are open-source, protected, and invite-only. The “Visibility” options on the second page of the “Publish script” window specify a script’s visibility type:

NoticeAs with the privacy type, you cannot change a script’s visibility type after you publish it. Make sure you select the appropriate option while preparing your publication. 
Open
A script published with the “Open” setting is open-source, meaning anyone who views the publication or uses the script can access its Pine Script code. Most script publications on TradingView use this setting because it allows programmers to demonstrate their Pine knowledge and provide code for others to verify, learn from, modify, and build upon.
An open-source script’s page displays the source code in an expandable window above the comments. The window also includes the option to view the source code directly inside the Pine Editor in a separate tab:

When a user adds the script to their chart, they can also view the source code in the Pine Editor at any time by selecting the “Source code” option in the script’s status line:

Note that:

When a published script’s code is open inside the Pine Editor, it is read-only. Users cannot edit the code without creating a working copy, and any changes to that copied code do not affect the original published script.
All open-source scripts on TradingView use the Mozilla Public License 2.0 by default. Authors wanting to use alternative licenses can specify them in the source code.
All script publications that reuse code from another open-source script must meet the “Open-source reuse” criteria outlined in our Script Publishing Rules. These rules take precedence over any provisions from an open-source license.

TipOpen-source scripts are eligible for inclusion in our Editors’ picks section, which showcases exceptional publications from our growing community of script authors. The Editors’ picks are selected from public, open-source scripts that are original, provide potential value to users, include a helpful description, and comply with our House Rules.
Protected
A script published with the “Protected” setting has closed-source code, meaning the code is protected and not viewable to any user except the author. Although users cannot access the source code, they can add the script to their charts and use it freely. This visibility option is available only to script authors with paid plans. 
Closed-source script publications are ideal for authors wanting to share their unique Pine Script creations with the community without exposing their distinct calculations and logic. They are not for sharing closed-source scripts that reproduce the behaviors of open-source ones. As such, when an author publishes a closed-source script, the publication’s description should include information that helps users understand the script’s unique characteristics that require protecting the code. See our Script Publishing Rules to learn more.
Invite-only
A script published with the “Invite-only” setting has closed-source code. No user except the author can view the code. Additionally, unlike a protected script, only users invited by the author can add the script to their charts and use it. This visibility option is available only to script authors with Premium and higher-tier plans.
Below the description on the invite-only script page, the author can see a “Manage access” button. This button opens a dialog box where the author specifies which users have access to the script:

Script authors typically use invite-only publications to provide interested users with unique scripts, often in exchange for payment. As such, invite-only script authors are considered vendors. In addition to the House Rules and Script Publishing Rules, which apply to all script authors, vendors must understand and follow our Vendor Requirements.
NoticePublic invite-only scripts are the only published scripts for which authors can require payment to access. Selling access to private scripts is prohibited, and authors cannot charge users for access to open-source or protected scripts because they are, by definition, free to use.TradingView does not benefit from script sales. Transactions concerning invite-only scripts are strictly between users and vendors; they do not involve TradingView.
Preparing a publication
At the start of the script publishing process, authors verify and refine their source code to ensure correct functionality. Then, they prepare their chart visuals and, for strategies, the strategy report, to showcase their script’s behaviors. After finalizing these details, authors select the “Publish…” button to open the “Publish script” window, where they set the title, write a helpful description, and then define the publication’s settings.
The sections below provide a step-by-step overview of this preparation process and list practical recommendations for creating helpful, user-friendly publications based on our Script Publishing Rules and best practices.
Source code
When an author publishes a script, the publication creates an independent copy of the source code, which becomes part of the publication’s version history. If the published code contains incorrect or misleading calculations, produces unexpected behaviors, or uses excessive runtime resources, those issues are only fixable through script updates.
Therefore, regardless of a publication’s intended visibility type, we recommend validating the source code before publishing it to confirm that the script is readable, usable, programmed correctly, and compliant.
When preparing source code to publish:

Ensure the code is original to you and provides a potentially helpful script for the community.
Use debugging techniques such as Pine Logs to verify that the script works as intended, and to find and fix any issues in its calculations or logic.
Fix any higher-timeframe request.security() calls that use a non-offset expression argument and barmerge.lookahead_on as the lookahead argument on historical bars. These calls are not suitable for script publications because they cause lookahead bias. See the `lookahead` section of the Other timeframes and data page for more information.
Use the Pine Profiler to analyze the script’s runtime performance. If the script contains unnecessary loops or other inefficient calculations, consider optimizing them to help ensure efficiency and usability.
Include minval, maxval, and options arguments in applicable input.*() calls to prevent users from supplying unintended input values. It is also helpful to include runtime.error() calls for other unintended use cases.
Organize the source code, add helpful titles to inputs and plots, use readable names for identifiers, and include informative comments to make the code simpler to maintain and easier to understand. See the Style guide page for more information.
Document exported functions and types of libraries with compiler annotations. Annotation text is visible when hovering over an imported library’s identifiers or by using parameter hints. Additionally, the description field of the “Publish script” window automatically adds the text to exported code signatures.
Use a meaningful, searchable title relating to the script’s purpose as the title argument of the indicator(), strategy(), or library() declaration statement. The title field of the “Publish script” window uses this text by default.

Chart
When an author publishes a script, the publication copies their current chart to showcase the visual outputs. If the author has drawings, images, or other scripts on their chart, the published chart also includes them. Therefore, before opening the “Publish script” window, confirm that the chart is clean and ready for publishing.
When preparing a chart for a script publication:

The script must be active on the chart. If the script is not running on the current chart, open its source code in the Pine Editor and select “Add to chart” in the top-right corner.
Ensure the chart contains only necessary visuals and is easy for users to understand. Remove any other scripts, drawings, or images unless using or demonstrating the script requires them. If the publication requires extra scripts or other visuals on the chart, explain their use in the description.
The chart’s status line should show the current symbol and timeframe, and the script’s status line should show its name. These details help users understand what the displayed data represents. Enable the “Title/Titles” checkboxes in the “Status line” tab of the chart’s settings. If the text in the status lines is the same color as the chart’s background, change its color in the “Canvas” tab.
The symbol’s price series and the script’s visual outputs should be visible on the chart. If the script is on the chart but hidden, select the “Show” icon in its status line to make it visible. If the symbol’s price series is invisible, select the “Show” option in the “More” menu of the chart’s status line.
Show the script’s default behavior so that users know what to expect when they add it to their charts. If an instance of the script on the chart does not use the default settings, select “Reset settings” from the “Defaults” dropdown tab at the bottom of the script’s “Settings” menu.
Do not use a non-standard chart (Heikin Ashi, Renko, Line Break, Kagi, Point & Figure, or Range) if the script is a strategy, issues alerts, or displays trade signals of any kind in its outputs. The OHLC series on non-standard charts represent synthetic (calculated) prices, not real-world prices. Scripts that create alert conditions or simulate trades on these charts can mislead users and produce unrealistic results.

Strategy report
Strategies simulate trades based on programmed rules, displaying their hypothetical performance results and properties inside the Strategy Tester. When an author publishes a strategy script, the script page uses the Strategy Tester’s information to populate its “Strategy report” display.
Because traders often use a strategy script’s performance information to determine the potential viability of a trading system, programmers must verify that their scripts have realistic properties and results. Before publishing a strategy script, check its information in the “Strategy Tester” tab to validate that everything appears as intended.
To maintain realism when publishing strategies, follow these guidelines based on our Script Publishing Rules:

In the strategy() declaration statement, choose an initial_capital argument representing realistic starting capital for the average trader in the market. Do not use an excessive value to exaggerate hypothetical returns.
Specify commission_* and slippage arguments that approximate real-world commission and slippage amounts. We also recommend using margin_* arguments that reflect realistic margin/leverage levels for the chart symbol’s exchange.
Set the strategy’s order placement logic to risk sustainable capital in the simulated trades. In most real-world settings, risking more than 10% of equity on a single trade is not typically considered sustainable.
Choose a dataset and default strategy configuration that produces a reasonable number of simulated trades, ideally 100 or more. A strategy report with significantly fewer trades, especially over a short duration, does not typically provide enough information to help traders gauge a strategy’s hypothetical performance.
Ensure the strategy uses the default properties set in the strategy() declaration statement, and explain these defaults in the description.
Resolve any warnings shown in the Strategy Tester before publishing the script.

Title and description
After preparing the source code, chart visuals, and strategy report for a script publication, open the “Publish Script” window and draft a meaningful title and description to help users understand the script. First, confirm that the correct code is open in the Pine Editor, then select the “Publish…” button in the top-right corner.
The first page of the “Publish Script” window contains two text fields that cannot be empty:

The first field determines the publication’s title, which appears at the top of the script widget and page. TradingView also uses the specified title to determine the publication’s URL. By default, this field proposes the text from the title argument of the script’s declaration statement. It is typically best to use that title. However, some authors prefer to use different or modified titles.
When defining the title of a script publication:

Use text that hints at the script’s purpose or functionality. A meaningful title helps users understand and search for the publication.
Use English text only. If the script is public, it is available to the global TradingView community. To help ensure the script is understandable, English is required by our Script Publishing Rules because it is the most common language used for international communication.
Include only standard 7-bit ASCII characters to ensure readability and searchability. Do not include emoji or other special characters in this text.
Avoid using all capital letters in the text, except for abbreviations such as “RSI”, “EMA”, etc. Text with whole words written in ALL CAPS is distracting for users.
Do not include misleading or unsubstantiated statements about the script (e.g., “90% win rate”).
Do not include website references, social media handles, or other forms of advertisement.

The second text field determines the publication’s description. The toolbar at the top contains several options that insert markup tags into the field for adding text formats, Pine code blocks, lists, and more. The script page displays the complete, parsed text from this field below the published chart or strategy report:

Most of the markup for publication descriptions requires surrounding raw text with an opening tag (e.g., [b]) and a matching closing tag with a forward slash (e.g., [/b]). Some tags also require additional syntax. Here, we list the available tags and explain how they work:

The [b][/b], [i][/i], and [s][/s] tag pairs respectively apply bold, italic, and strikethrough formatting to the enclosed text.
The [pine][/pine] tags format the enclosed multi-line text as a Pine code block with syntax highlighting on a new line.
The [list][/list] tags create a bulleted list. Each line between these tags that starts with the special [*] tag defines a separate bullet. To create a numbered list, use [list=1] as the opening tag.
The [quote][/quote] tags format the enclosed multi-line text as a block quotation.
The [url=][/url] tags create a hyperlink to a specified URL. For example, [url=https://www.tradingview.com/]myLink[/url] formats the text “myLink” as a link to TradingView’s home page. Use these tags to create links to relevant TradingView pages and standard reference materials. Avoid linking to social media or other websites, as our House Rules forbid advertising in publications.
The [image][/image] tags render a chart image from an enclosed URL for either a snapshot or an idea publication. These tags are optional, as publications can render images from snapshot and idea URLs automatically. Before taking a snapshot, prepare the chart for readability, as you would for a publication’s chart.
The $ character adds a hyperlink to a specific symbol’s overview page when it precedes a valid symbol or ticker identifier. For example, $AMEX:SPY creates a link to the SPY symbol overview.

Writing a helpful description is a critical step in the script publishing process, as users rely on the provided information to understand a published script. Below, we list a few helpful recommendations for preparing descriptions based on some of the key criteria outlined in our Script Publishing Rules:

Include relevant, self-contained details that help users understand the script’s purpose, how it works, how to use it, and why it is original, regardless of the intended visibility type. Even if the publication is open-source, the description should cover this information because not all users understand a script by reading its Pine Script code. Furthermore, an informative description helps users verify that the script works as intended.
If the publication is closed-source (protected or invite-only), include accurate details about the script’s unique qualities that require hiding the source code. Closed-source scripts that match the behaviors of open-source scripts do not benefit our community.
Do not make unsubstantiated statements about the script’s capabilities or performance. If the text contains claims about the script, it should include details substantiating them to avoid misleading traders.
If the text contains emoji or other non-ASCII characters, ensure it uses them sparingly to maintain readability. Likewise, avoid using all capital letters throughout the text because it reduces readability.
The description can include languages other than English. However, the text should begin with an English explanation to help users in different regions understand the publication. Additionally, if the source code does not use English for input titles or other user interface text, the description should contain English translations of those elements.

Publication settings
The second page of the “Publish script” window is where authors specify a script publication’s settings and search tags. This page is accessible only after adding a title and description for the script on the previous page and selecting the “Continue” button:

The two fields at the top of the page specify the script’s privacy and visibility types. Ensure both fields use the correct options, as these settings cannot change after the script is published.
TipEven if you intend to share your script publicly, we recommend publishing a private version first. You can use the private publication as a draft of the release to ensure the content is correct, then create a new public version with the verified description. See the section on private drafts below to learn more.
Note that setting the publication’s visibility type to invite-only reveals an additional “Author’s instructions” field, which cannot remain empty. This field is where vendors provide necessary information for users to request access to their script, such as direct contact details and links to instructional pages. The contents of this field will appear below the description on the invite-only script page:

The remaining input fields on this page provide options to assign tags (keywords) to the publication for discoverability. The “Category” field contains a menu where the author can select up to three preset category tags for the publication. If the script is public, users can search the specified categories to discover it:

The publication can also include custom, non-preset search tags for additional discoverability. To add custom tags to the publication, select the “Show more” option, then enter a list of searchable keywords in the “Tags” field:

Publishing and editing
After following all necessary steps to prepare a script publication, including fine-tuning the source code, cleaning the chart, and adding a helpful title and description, select the “Publish…” button at the bottom of the last page of the “Publish script” window to publish the script.
If the publication’s privacy type is set to public, there is a checkbox above the “Publish…” button, which the author must select before they can create the publication. This checkbox confirms awareness of the House Rules and the consequence of the script becoming hidden from the community if it does not follow them:

When the script is published, the “Publish script” window closes automatically, and TradingView opens the new publication’s script page. The page includes “Edit” and “Delete” buttons in the top-right corner. If the script is public, these buttons are available for only 15 minutes. If private, they are always available.
Selecting the “Edit” button opens the “Edit script” window, where the author can change the title, description, and search tags:

Note that:

The “Privacy settings” and “Visibility” fields on the second page of this window are not editable.
The “Edit script” window does not provide options to edit the published source code, chart, or strategy report. To change these details, publish a script update.

Script updates
Authors can update their public or private scripts over time to add new features, fix bugs, optimize performance, etc. To publish an update to an existing script, confirm that the new source code differs from the code in the last published version. Then, add the updated script to the chart and select the “Publish…” option in the top-right of the Pine Editor to open the “Publish script” window.
After opening the window, select the “Update existing script” option at the top of the first page:

In this publishing mode, the first text field specifies the existing script to update, not the title of a new publication. Enter the existing publication’s title in the field or select the title from the available options in the dropdown menu:

Below the title field is a checkbox specifying whether the update will affect the publication’s chart. If unchecked (default), the script page will copy the author’s current chart to showcase the changes. If checked, the publication will continue using its existing chart display:

NoticeIf you plan to update the publication’s chart, prepare the chart before opening the “Publish script” window, just as you would with a new publication.
The text field below the checkbox is where the author explains the changes made to the script. The publication will display the parsed text from this field beneath the description as dated release notes on the script page. The contents of this field do not modify the publication’s original description and are displayed in addition to it:

When publishing release notes, prepare them similarly to the description. Provide self-contained information allowing users to understand the changes included in the update, how they impact the script’s functionality, and what benefits the changes provide over the previous version.
NoticeAfter you publish a script update, the release notes are finalized immediately and cannot be changed. Therefore, we recommend using private drafts to validate script updates before committing to public releases.
The bottom of the page contains an expandable difference checker, which displays a side-by-side or inline comparison between the new source code and the last published version. We recommend inspecting and confirming the code differences before publishing an update, because all updates are preserved in the script’s version history:

After confirming the details on the first page of the “Publish script” window, select “Continue” to move to the final page, then select the “Publish new version” button at the bottom to finalize the script update.
Note that:

The “Privacy settings” and “Visibility” fields appear grayed out on the last page of the window for script updates because authors cannot change these settings for existing script publications.

Tips
Use the following tips and our recommendations in the Preparing a publication section above to create helpful, compliant script publications.
Private drafts
New script authors occasionally overlook the importance of reviewing their content before sharing it publicly, leading to unintentional errors in their published script descriptions, such as typos, incorrect statements, or House Rule violations.
The title and description of a public script are editable for only 15 minutes. After that time, the content becomes final. If the published text contains mistakes, the author cannot edit or update the publication to fix them.
In contrast, private scripts are always editable, making them valuable tools for drafting public script releases. Private drafts help authors avoid uncaught mistakes in their public versions and ensure quality for script users. Therefore, we strongly recommend starting every script publication with a private draft.
When using private publications as drafts for public releases, follow this simple process:

Prepare the draft publication’s content as you would for a public script, but set the “Privacy settings” field to “Private” on the last page of the “Publish script” window.
Check the private draft’s script widget and script page to verify whether the publication’s content appears as intended. If there are mistakes in the draft’s source code, chart, or strategy report, fix them by publishing an update. To fix errors in the draft’s title or description, select the “Edit” option on the script page and add the corrected text to the appropriate field.
After validating the draft, open the “Edit script” window and copy the raw text from the description field.
Prepare a new, public script publication using the updated source code and verified description text.
After publishing the public version, you can delete the private draft using the “Delete” option at the top-right of its script page.

House Rules
Many traders use public scripts in their analysis to reinforce trade decisions. Likewise, many programmers learn from public scripts and use published libraries in their Pine projects. New and experienced users alike should be able to rely on the script publications from our community for helpful content and original, potentially beneficial tools.
Our Script Publishing Rules establish the core criteria for publishing scripts on TradingView, and our Vendor Requirements define additional criteria for vendors. The script moderators curate the Community scripts based on these rules and our House Rules. If a publication does not meet these criteria, it becomes hidden, and our moderators send the author a message explaining the issues that need correction. The author can then prepare a new publication with the necessary corrections if they want to share their script publicly.
We recommend all authors review and understand our rules and verify a script publication’s compliance before publishing it. Below, we list a few simple tips:
Publish original content
Publish a script publicly if you believe it is original and might benefit the community. Avoid rehashing, mimicking, or copying existing scripts or other public domain code. Likewise, avoid publishing scripts that combine available indicators or other code without a clear purpose. In other words, aim to provide a helpful tool for the community based on your unique interests and expertise.
Reuse code responsibly
Authors can publish scripts that reuse open-source code from other publications. However, they must meet the “Open-source reuse” criteria in our Script Publishing Rules, which take precedence over all open-source licenses. These criteria include crediting the original author, making meaningful improvements to the code, and sharing the code open-source unless the original author grants explicit permission to publish it closed-source.
Use a clear chart
A script publication’s chart showcases the script’s visual outputs to help users understand how it works. This display is not for demonstrating complex charting setups with multiple scripts or drawing tools. If the chart of a published script contains unnecessary scripts or drawings, it will not add clarity for users, and it can potentially mislead them.
Therefore, when publishing a public script, ensure the chart only includes what is necessary to demonstrate its outputs and behaviors. See the “Chart” section of our Script Publishing Rules to understand our chart criteria, and this portion of the Preparing a publication section above for detailed recommendations.
Provide helpful documentation
Similar to how users rely on our documentation to understand Pine, users rely on the documentation in an author’s publications to understand their scripts. When a script publication does not include a helpful description that explains the script’s workings and how to use it, users often struggle to understand and use it effectively. Therefore, when sharing a script publicly, include a clear description explaining everything users need to know about it and its use.
See the “Description” and “Language” sections of our Script Publishing Rules to understand the criteria for helpful script descriptions. The Title and description section above provides detailed recommendations based on these criteria.
For examples of compliant script descriptions, refer to the publications featured in our Editors’ picks. To see examples of our recommended description format, refer to the publications from the TradingView and PineCoders accounts.         Previous       Profiling and optimization      Next   Limitations              On this pageIntroductionScript publicationsPrivacy typesPublicPrivateVisibility typesOpenProtectedInvite-onlyPreparing a publicationSource codeChartStrategy reportTitle and descriptionPublication settingsPublishing and editingScript updatesTipsPrivate draftsHouse Rules