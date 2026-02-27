import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dimensions, Position, Size } from "../backend.d";
import { useActor } from "./useActor";

// ── Rooms ──────────────────────────────────────────────────────────────────

export function useGetAllRooms() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRooms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRoom(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["room", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getRoom(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      dimensions,
    }: {
      name: string;
      dimensions: Dimensions;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createRoom(name, dimensions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useUpdateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      dimensions,
    }: {
      id: bigint;
      name: string;
      dimensions: Dimensions;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateRoom(id, name, dimensions);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({
        queryKey: ["room", variables.id.toString()],
      });
    },
  });
}

export function useDeleteRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteRoom(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

// ── Furniture ─────────────────────────────────────────────────────────────

export function useAddFurniture(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      type,
      furnitureLabel,
      position,
      size,
      rotation,
    }: {
      type: string;
      furnitureLabel: string;
      position: Position;
      size: Size;
      rotation: number;
    }) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.addFurniture(
        roomId,
        type,
        furnitureLabel,
        position,
        size,
        rotation,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}

export function useUpdateFurniture(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      furnitureId,
      type,
      furnitureLabel,
      position,
      size,
      rotation,
    }: {
      furnitureId: bigint;
      type: string;
      furnitureLabel: string;
      position: Position;
      size: Size;
      rotation: number;
    }) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.updateFurniture(
        roomId,
        furnitureId,
        type,
        furnitureLabel,
        position,
        size,
        rotation,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}

export function useDeleteFurniture(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (furnitureId: bigint) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.deleteFurniture(roomId, furnitureId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}

// ── Mood Board ─────────────────────────────────────────────────────────────

export function useAddMoodBoardNote(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.addMoodBoardNote(roomId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}

export function useUpdateMoodBoardNote(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      noteId,
      content,
    }: {
      noteId: bigint;
      content: string;
    }) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.updateMoodBoardNote(roomId, noteId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}

export function useDeleteMoodBoardNote(roomId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor || roomId === null) throw new Error("No actor or room");
      return actor.deleteMoodBoardNote(roomId, noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId?.toString()],
      });
    },
  });
}
