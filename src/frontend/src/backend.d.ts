import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Position {
    x: number;
    y: number;
}
export interface Size {
    height: number;
    width: number;
}
export type FurnitureId = bigint;
export type MoodBoardId = bigint;
export type RoomId = bigint;
export interface Room {
    id: RoomId;
    name: string;
    furniture: Array<FurnitureItem>;
    dimensions: Dimensions;
    moodBoard: Array<MoodBoardNote>;
}
export interface Dimensions {
    length: number;
    width: number;
}
export interface FurnitureItem {
    id: FurnitureId;
    rotation: number;
    size: Size;
    type: string;
    furnitureLabel: string;
    position: Position;
}
export interface MoodBoardNote {
    id: MoodBoardId;
    content: string;
}
export interface backendInterface {
    addFurniture(roomId: RoomId, type: string, furnitureLabel: string, position: Position, size: Size, rotation: number): Promise<FurnitureId>;
    addMoodBoardNote(roomId: RoomId, content: string): Promise<MoodBoardId>;
    createRoom(name: string, dimensions: Dimensions): Promise<RoomId>;
    deleteFurniture(roomId: RoomId, furnitureId: FurnitureId): Promise<void>;
    deleteMoodBoardNote(roomId: RoomId, noteId: MoodBoardId): Promise<void>;
    deleteRoom(id: RoomId): Promise<void>;
    getAllFurniture(roomId: RoomId): Promise<Array<FurnitureItem>>;
    getAllMoodBoardNotes(roomId: RoomId): Promise<Array<MoodBoardNote>>;
    getAllRooms(): Promise<Array<Room>>;
    getFurniture(roomId: RoomId, furnitureId: FurnitureId): Promise<FurnitureItem>;
    getMoodBoardNote(roomId: RoomId, noteId: MoodBoardId): Promise<MoodBoardNote>;
    getRoom(id: RoomId): Promise<Room>;
    updateFurniture(roomId: RoomId, furnitureId: FurnitureId, type: string, furnitureLabel: string, position: Position, size: Size, rotation: number): Promise<void>;
    updateMoodBoardNote(roomId: RoomId, noteId: MoodBoardId, content: string): Promise<void>;
    updateRoom(id: RoomId, name: string, dimensions: Dimensions): Promise<void>;
}
