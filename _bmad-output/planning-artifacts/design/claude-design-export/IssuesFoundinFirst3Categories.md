1. All Ghost Editor (Koening) Cards should have a standalone design page. It should add a menu link in left sidebar \- Editor Cards. Once clicked on this, they should be redirected to a standalone canvas to design each of the Editor cards. They should be able to select the cards from a dropdown at top \- just like we have Page.  
2. For text editing inline \- add popup controls like Bold/Italic/underline/Add Link/Remove Link \- for link add additional checkbox to open in new tab and also controls for noreferre, nofollow, etc. I think we already have this design somewhere \- reuse that and ensure that the overall design stays minimal and easy to use. This comes up if any text is selected which is editable inline.  
3. Integrate an open source Icon library like Tabler icons so anywhere a user want to add icons, they can select the icons by clickin on the icon slot and then selecting it. They cannot add icons anywhere but only in an icon slot. Icon slot will give popover control to change icon size and color. Also they can add icon for any button \- before or after label. This control to appear when any button is selected.  
   

IMP: If a specific design is not mentioned for any category \- then the comments are meant for all designs within that category.

A1 \- Header and Navigation

1. If search in header is enabled \- add a search icon/button  
2. If Dark mode is enabled \- add a dark/light mode toggle in the header.  
3. For dropdown navigation \- a JS script should be shipped which converts the Ghost’s Navigation to simple and dropdown navigation too.  
   1. Each navigation label should be considered a normal menu link  
   2. Any navigation with a ‘+’ prefix should be the dropdown parent. It’s URL should be added as \# in Ghost Navigation. But if a URL is present that should be ignored.  
   3. Any navigation items immediately after the dropdown parent in Ghost Navigation must start with a prefix ‘-’ to be considered as the dropdown child items. They will have the usual URLs from Ghost navigation.  
   4. After the last child item, the user can have a new parent or a normal link.  
   5. A dropdown can appear as the first, middle or last menu link.  
4. Add toggle controls to show/hide \- search, sign in button, subscribe button, CTA button. They should be able to add a custom CTA button (e.g. Hire Me) and add a URL to it.  
   1. They should be able to control the visibility of signin, subscribe button based on member status (Logged in, Free member, paying member)  
   2. They should be able to control the label and URL of signin, subscribe button based on member status (Logged in, Free member, paying member)  
5. For “Split Rail” design \- they should be able to add a Ghost Navigation menu with an identifier to show from where the spilt should be. Menu items before the identifier will be on the left side and items after that should be on right of the logo. The identifier can be ‘|’ and url for that can be \# (if URL present, ignore it) in Ghost Navigation settings.  
6. For “Stacked Masthead” \- allow controls:  
   1. Show/hide the date  
   2. If enabled, which date should be visible \- visitor’s browser or a specific timezone.  
7. In “Drawer First” \- add controls:  
   1. Search Icon/Button in header along with Subscribe/Menu button.  
   2. Allow Navigation to be built completely from Ghost’s Navigation  
      1. The labels with \+ prefix becomes the headline (e.g. Sections,More)  
      2. There can be upto 5 such columns \- if more than 3, then hide the latest post column)  
      3. If user adds more than 5 columns \- move all child items under the last column.  
      4.  If label not prefix with \+ or \-, then show them as normal link like Newsletter, Membership, Privacy.  
      5. Allow control to choose the specific post for the right column under Latest Post. They can filter the post based on author/date/latest/featured/specific tag/etc. Allow them to edit the headline \- Latest \- inline  
8. In “Mega Bar” \- add controls:  
   1. Allow Navigation to be built completely from Ghost’s Navigation  
      1. The labels with \+ prefix becomes the headline (e.g. Writing)  
      2. There can be upto 2 such columns \- if more than 2 in Ghost Nav, then list the rest under the second column)  
      3. Remove the SERIES column and replace with a column like Writing as explained in points above.  
      4. BY TOPIC lists the tags based on number of posts \- Allow to edit the BY TOPIC inline  
      5. Below BY TOPIC \- add BY AUTHORS and add similar author section based on number of posts per author. Allow to edit the BY AUTHOR inline  
      6. Allow control to choose the specific post for the right column under Latest Post. They can filter the post based on author/date/latest/featured/specific tag/etc. Allow them to edit the headline \- Latest \- inline  
      7. Keep In the Series column as it is now \- give them option to either populate it from Ghost Nav or from a series of tags like it is now. If they populate the column with posts, then show posts meta \- date \- in smaller font. Keep the last link All 12 in Series as it is now.  
      8. Allow them to hide/show the second line below each menu link. The second line if enabled should be editable inline.  
      9. Change All 14 Tags link and All Authors link like we have at the bottom of the Series Column.  
9. In “Utility \+ Nav” \- add controls:  
   1. The top strip content will be fully editable inline. They should have control to add menu items (on either side). They should be able to edit the link for top strip menu item too \- inline.  
   2. Do not add dark mode toggle there.  
10. In “Search-Forward” \- a full custom JS needs to be implemented which search in the user’s Ghost CMS content. Use a pre-made library for implementing search. Add a control for managing number of search results at a time. Allow control to whether search withing the content.  
    1. IMP: The library you choose for implementing this search needs to be very fast and should not affect user experience.  
    2. Show additional controls based on the library options \- like highlighting search terms, showing meta under post title in search results, etc.  
11. In “Side Rail” \- add controls  
    1. Choose icons for each menu item  
    2. Remove the highlighted left border from the active item \- it looks like AI slop  
    3. Add control to show dropdown items in a separate panel like it is now or show them below the parent and in this the menu expands below.  
    4. Enable a control to show icons \- if enabled, then add icon slots before each menu item and allow them to select icons.  
12. In “Icon Utilities” \-   
    1. Do not add user avatar/pill \- that functionality needs not be added. Instead show them subscribe/sign in/search like we have for others.

A2 \- Announcement Bars  
All text/badge in these announcement bars to be editable inline with popover controls.  
All buttons should be editable inline with label and link change. Allow link options \- noreffere, nofollow, etc and open in new tab.  
Remove Preview as control as that can be handled by the top control we have in the Editor besides page selection dropdopwn.  
Allow content to be populated from filtered posts wherever possible and you think a user might want to show a post there.

1. In “Dateline” allow them to select date based on latest posts date, current browser date or any custom date.  
2. In “Ticker” allow them to add more ticker messages. These messages can also be inline editable and along with that add a control like we have now. For Separator allow them to choose an icon. Also allow them to populate this ticker with filtered posts titles.  
3. In “Rotator” allow them to add more messages. These messages can also be inline editable and along with that add a control like we have now. Also allow them to populate this with filtered posts titles.  
4. In “Takeover” \- allow controls to choose image, show the content based on the filtered post. All text/buttons/titles editable inline.  
5. In “Consent” \- we do not manage choice and we cannot control the user’s cookies. So what can be done for this?

A3 \- Footers  
IMP: Instead of Published with Ghost \- it is important to show Built with Inflozo (with link to [inflozo.com](http://inflozo.com)). This should not be editable/removable unless on a Pro plan..  
Social media icons should be selectable from the icon library and linked to either Ghost’s Social media account settings or inline controls. Allow icon controls to hve border, color, etc. Users can also control if they want to show full name of social media ,of shortform like (Fb, Li, Tw, In, Yt, etc)  
Other links in footer, not part of main footer nav, canbe edited inline and have controls to add more link \- like Privacy, Terms, Disclaimer etc.

1. In “Minimal Line”, “Two-Tier” move the social icons near the logo on left/center. Allow a control to choose position of social media icons. Allow them to select the icons using icon picker you design previously. Copyright and Published with Ghost should be below the footer nav.  
2. In Columns \- support multiple columns like we have in Header (Primary Nav). In Footer they use (Secondary Nav) \- use \+ and \- prefixes.  
3. In “Newsletter Band”, “Contrast Band” move Privacy and Terms on the right side.   
4. In “Centred Stack” add copyright and Build with Inflozo under the Privacy and Terms links.  
5. In “Big Type” \- add control to change opacity and offset and size of the big type. Add Privacy and Terms link on right.  
6. In “Latest Posts” \- controls should be added to choose the filtered posts to show instead of just Latest posts. Move Privacy and Terms in right.  
7. In “Colophon” \- following content can be linked with Ghsot Secondary Nav \- EssaysInterviewsField NotesArchiveOur storyContact I  
   The content under Mast Head should be fully editable inline. Move Privacy/Terms link on right. Allow control to add additional column in Masthead  
8. In “Wrap” add divider between links. Divider should be selectable from control  
   

