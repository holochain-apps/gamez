# UI 0.8.3
- 🎈 Fix: Issue with dragging of player piece source
- 🧹 Clean: Internal refactoring and code clean up, specially around screen->container->space viewport calculations

# UI 0.8.2
- 🎈 Fix: Mini view now renders correctly on the first render
- 🎈 Fix: Piece Source dragged now are rendered with the correct zooming
- 🎈 Fix: Modal prompt for naming spaces now auto-focus on input and is dismissed with ESC
- 🧹 Clean: Remove icon selection from space configurator since the Mini View is now used on the home screen
- 🧹 Clean: A lot of internal code clean up
- 🎛 Tweak: The activity log is not filled now on Library items, and when exporing a space the activity log is purged
- 🎛 Tweak: On Play or View mode all elements are fit on the screen (with some padding) and then panning and zooming is locked
- 🎛 Tweak: When there aren't any active games on the home screen, show a message instead
- 🎛 Tweak: Config Menu
  - Now instead of showing disabled elements it hides them
  - The locking system has a different non-editable view for Play mode
  - If there aren't any Config Menu items available on Play Mode, it won't show up
- 🎉 New: The Selection System
  - Big overhaul on how dragging and events are handled on the Surface component
  - You can now select elements as you would expect (drag a square, or click, shift+click to toggle, shift+drag to add to selection)
  - Dragging selected elements will move all elements selected
  - Moving a single element does not select it
- 🧨 Overhaul: The Resizing System
  - Resizing was redone; now you can resize from any edge or corner
  - You can Shift+Resize to keep aspect ratio
  - You can Alt+Resize to resize symetrically
  - The resizing overlay shows for selected elements only
- 🎉 New: Clear Space Modes
  - A space is in either edit mode, view mode or play mode
  - Library items are on edit mode
  - Active games are on view mode if you haven't joined the game, and play mode if you have
  - Archived spaces are on view mode
  - On active games you can switch temporarily to Edit Mode
  - On Edit Mode you can modify the elements locks and actions ignore the locking mechanisms
  - On Play Mode the actions available to elements are determined by the elements Can Configuration, which can only be modified from Edit Mode.
  - Lock System -> Can Configuration
    - The Can Configuration is part of elements and controls:
      - Moving
      - Resizing
      - Rotating
      - Adding/removing attachments
      - Modifying the element configuration
      - Removing and duplicating
    - The Can Configuration applies to Play Mode only; on edit mode you can modify it, but you are not bound by it
    - The Can Configuration can be accessed from the context menu of elements
- ❌ Disabled: The rotation system is temporarily non-functional until next release

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