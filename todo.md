- [ ] Create sections for history entries
  - by date
- today, yesterday, 1 week ago, etc...

- [ ] Show "diffs" from current state when viewing history
  - use git diff somehow?

- [ ] Add due date notifications

- [X] Add filters

- [ ] Add a list view of history/changes (maybe even track a log of changes?)
  - make it possible to revert to any point in history.
- use detail markdown view to inspect the state of the history

- [X] Show "empty" items in empty sections to make sure they are visible

- [X] Add support for undo and redo by caching entire list

- [X] Cache TODO lists using raycast cache. Disallow change actions until cache is verified.

- [X] Allow default todo that is completely managed by the raycast cache

- [X] Conflict resolution: check when the file is cached and when it was last changed

- [X] Parse headlines as sections

- [ ] Preserve additional metadata, tags, description, priority, etc

- [X] Do not add frontmatter if not already present? (check for undefined)

- [ ] Allow crossing out todos, i.e marking them as invalid

- [X] Listen to file changes, update raycast live if file changes from other source.

- [ ] Show toolbar notification or sticky/popups for urgent todos
  - use background process

- [ ] Fix undo redo focused item
  It seems to focus the item BEFORE the last change?

