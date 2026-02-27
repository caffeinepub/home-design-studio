import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type RoomId = Nat;
  type FurnitureId = Nat;
  type MoodBoardId = Nat;

  type Dimensions = {
    width : Float;
    length : Float;
  };

  type Position = {
    x : Float;
    y : Float;
  };

  type Size = {
    width : Float;
    height : Float;
  };

  type FurnitureItem = {
    id : FurnitureId;
    type_ : Text;
    furnitureLabel : Text;
    position : Position;
    size : Size;
    rotation : Float;
  };

  module FurnitureItem {
    public func compare(f1 : FurnitureItem, f2 : FurnitureItem) : Order.Order {
      Nat.compare(f1.id, f2.id);
    };
  };

  type MoodBoardNote = {
    id : MoodBoardId;
    content : Text;
  };

  module MoodBoardNote {
    public func compare(n1 : MoodBoardNote, n2 : MoodBoardNote) : Order.Order {
      Nat.compare(n1.id, n2.id);
    };
  };

  type Room = {
    id : RoomId;
    name : Text;
    dimensions : Dimensions;
    furniture : [FurnitureItem];
    moodBoard : [MoodBoardNote];
  };

  module Room {
    public func compare(r1 : Room, r2 : Room) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  var nextRoomId : RoomId = 0;
  var nextFurnitureId : FurnitureId = 0;
  var nextMoodBoardId : MoodBoardId = 0;

  let rooms = Map.empty<RoomId, Room>();
  let userRooms = Map.empty<Principal, List.List<RoomId>>();

  // Room CRUD
  public shared ({ caller }) func createRoom(name : Text, dimensions : Dimensions) : async RoomId {
    let roomId = nextRoomId;
    nextRoomId += 1;

    let room : Room = {
      id = roomId;
      name;
      dimensions;
      furniture = [];
      moodBoard = [];
    };

    rooms.add(roomId, room);

    let currentRooms = switch (userRooms.get(caller)) {
      case (null) { List.empty<RoomId>() };
      case (?list) { list };
    };
    currentRooms.add(roomId);
    userRooms.add(caller, currentRooms);

    roomId;
  };

  public query ({ caller }) func getRoom(id : RoomId) : async Room {
    switch (rooms.get(id)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };
  };

  public query ({ caller }) func getAllRooms() : async [Room] {
    rooms.values().toArray().sort();
  };

  public shared ({ caller }) func updateRoom(id : RoomId, name : Text, dimensions : Dimensions) : async () {
    switch (rooms.get(id)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom : Room = {
          id = room.id;
          name;
          dimensions;
          furniture = room.furniture;
          moodBoard = room.moodBoard;
        };
        rooms.add(id, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func deleteRoom(id : RoomId) : async () {
    if (not rooms.containsKey(id)) { Runtime.trap("Room does not exist") };
    rooms.remove(id);
  };

  // Furniture CRUD
  public shared ({ caller }) func addFurniture(roomId : RoomId, type_ : Text, furnitureLabel : Text, position : Position, size : Size, rotation : Float) : async FurnitureId {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let furnitureId = nextFurnitureId;
        nextFurnitureId += 1;

        let furniture : FurnitureItem = {
          id = furnitureId;
          type_;
          furnitureLabel;
          position;
          size;
          rotation;
        };

        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = room.furniture.concat([furniture]);
          moodBoard = room.moodBoard;
        };

        rooms.add(roomId, updatedRoom);
        furnitureId;
      };
    };
  };

  public query ({ caller }) func getFurniture(roomId : RoomId, furnitureId : FurnitureId) : async FurnitureItem {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        switch (room.furniture.find(func(f) { f.id == furnitureId })) {
          case (null) { Runtime.trap("Furniture not found") };
          case (?item) { item };
        };
      };
    };
  };

  public query ({ caller }) func getAllFurniture(roomId : RoomId) : async [FurnitureItem] {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room.furniture.sort() };
    };
  };

  public shared ({ caller }) func updateFurniture(roomId : RoomId, furnitureId : FurnitureId, type_ : Text, furnitureLabel : Text, position : Position, size : Size, rotation : Float) : async () {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        if (not room.furniture.any(func(f) { f.id == furnitureId })) {
          Runtime.trap("Furniture does not exist");
        };

        func updateFurnitureItem(f : FurnitureItem) : FurnitureItem {
          if (f.id == furnitureId) {
            {
              id = furnitureId;
              type_;
              furnitureLabel;
              position;
              size;
              rotation;
            };
          } else {
            f;
          };
        };

        let updatedFurniture = room.furniture.map(updateFurnitureItem);

        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = updatedFurniture;
          moodBoard = room.moodBoard;
        };

        rooms.add(roomId, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func deleteFurniture(roomId : RoomId, furnitureId : FurnitureId) : async () {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let filteredFurniture = room.furniture.filter(
          func(f) { f.id != furnitureId }
        );
        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = filteredFurniture;
          moodBoard = room.moodBoard;
        };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  // Mood Board CRUD
  public shared ({ caller }) func addMoodBoardNote(roomId : RoomId, content : Text) : async MoodBoardId {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let noteId = nextMoodBoardId;
        nextMoodBoardId += 1;

        let note : MoodBoardNote = {
          id = noteId;
          content;
        };

        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = room.furniture;
          moodBoard = room.moodBoard.concat([note]);
        };

        rooms.add(roomId, updatedRoom);
        noteId;
      };
    };
  };

  public query ({ caller }) func getMoodBoardNote(roomId : RoomId, noteId : MoodBoardId) : async MoodBoardNote {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        switch (room.moodBoard.find(func(n) { n.id == noteId })) {
          case (null) { Runtime.trap("Note not found") };
          case (?note) { note };
        };
      };
    };
  };

  public query ({ caller }) func getAllMoodBoardNotes(roomId : RoomId) : async [MoodBoardNote] {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room.moodBoard.sort() };
    };
  };

  public shared ({ caller }) func updateMoodBoardNote(roomId : RoomId, noteId : MoodBoardId, content : Text) : async () {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        if (not room.moodBoard.any(func(n) { n.id == noteId })) {
          Runtime.trap("Note does not exist");
        };

        func updateMoodNote(n : MoodBoardNote) : MoodBoardNote {
          if (n.id == noteId) {
            {
              id = noteId;
              content;
            };
          } else {
            n;
          };
        };

        let updatedMoodBoard = room.moodBoard.map(updateMoodNote);

        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = room.furniture;
          moodBoard = updatedMoodBoard;
        };

        rooms.add(roomId, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func deleteMoodBoardNote(roomId : RoomId, noteId : MoodBoardId) : async () {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let filteredNotes = room.moodBoard.filter(
          func(n) { n.id != noteId }
        );
        let updatedRoom : Room = {
          id = room.id;
          name = room.name;
          dimensions = room.dimensions;
          furniture = room.furniture;
          moodBoard = filteredNotes;
        };
        rooms.add(roomId, updatedRoom);
      };
    };
  };
};
