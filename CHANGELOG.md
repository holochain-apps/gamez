# UI 0.8.1
 - Improved initial clients loading
 - Implemented more direct asset selection for "search", "creatables" and "pocket"
 - Overhauling of the lock system; now named instead on the positive: "can system". The locks apply only on game mode, and on edit mode everything is allowed and locks can be changed. The ConfigMenu only shows the things that are allowed if any. By default you can attach assets and move on newly created elements. On piece source elements you can additionally delete them.

# UI 0.8.0

- Improved people bar on game space to show session and players on a seamless element (removed the view-session-participants button) ⏱ 1:30hs
- Made element configuration a library-mode only feature ⏱ 45min
- Added instructions on game space ⏱ 30min
- Removed lock from library items; hide the preset if there is another edited with the same name. Added create and edit buttons next to each other on library items.  ⏱ 30min
- Show something on player pieces when empty  ⏱ 15min
- Bugfix: Pieces cannot be moved back to piece source; while we're at it, change the piece source to look like the player pieces source ⏱ 2:45hs
- Create mini-preview component to use on home screen instead of icons ⏱ 2:45
- Added WAL asset selection from element instead of having to use the config menu ⏱ 30min
- Updated home screen with bigger mini views and tweaked layout ⏱ 1:30hs
- Make presets behaviour more consistent; they are now indistinguishable from library items on the DHT; you can archive them and remove them ⏱ 1:30hs
- Updated Holochain libraries (and others while I was at it) and ensure the .webhapp file can be loaded into the Holochain launcher ⏱ 30min
- Release UI 0.8 ⏱ 30min