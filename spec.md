# Home Design Studio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Room manager: create, edit, and delete rooms with name and dimensions (width x height in feet)
- 2D floor plan canvas: drag-and-drop furniture placement within room bounds
- Furniture library: a set of common furniture items (sofa, chair, bed, table, desk, bookshelf, dresser, TV stand, dining table, coffee table)
- Each furniture piece has a label, configurable size, and position on the canvas
- Mood board: upload or select inspiration images and notes per room
- Rooms list sidebar for navigation between rooms

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend canister:
   - Data types: Room (id, name, widthFt, heightFt), FurnitureItem (id, roomId, type, label, x, y, widthFt, heightFt, rotation), MoodBoardNote (id, roomId, text)
   - CRUD for rooms
   - CRUD for furniture items (scoped to a room)
   - CRUD for mood board notes (scoped to a room)

2. Frontend:
   - Sidebar listing all rooms with add/delete controls
   - Main panel with two tabs per room: "Floor Plan" and "Mood Board"
   - Floor Plan tab: scaled 2D canvas showing room outline, draggable furniture items from a palette, ability to resize and rotate furniture
   - Mood Board tab: text note cards with add/delete
   - Furniture palette panel with furniture type buttons to add to the room
