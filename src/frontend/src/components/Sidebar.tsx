import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DoorOpen, Home, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Room } from "../backend.d";
import {
  useCreateRoom,
  useDeleteRoom,
  useGetAllRooms,
} from "../hooks/useQueries";

interface SidebarProps {
  selectedRoomId: bigint | null;
  onSelectRoom: (id: bigint | null) => void;
}

export function Sidebar({ selectedRoomId, onSelectRoom }: SidebarProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomWidth, setNewRoomWidth] = useState("");
  const [newRoomLength, setNewRoomLength] = useState("");

  const { data: rooms, isLoading } = useGetAllRooms();
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();

  async function handleCreateRoom() {
    const name = newRoomName.trim();
    const w = Number.parseFloat(newRoomWidth);
    const l = Number.parseFloat(newRoomLength);

    if (!name) {
      toast.error("Please enter a room name");
      return;
    }
    if (Number.isNaN(w) || w <= 0 || Number.isNaN(l) || l <= 0) {
      toast.error("Please enter valid dimensions");
      return;
    }

    try {
      const id = await createRoom.mutateAsync({
        name,
        dimensions: { width: w, length: l },
      });
      toast.success(`"${name}" created`);
      setAddDialogOpen(false);
      setNewRoomName("");
      setNewRoomWidth("");
      setNewRoomLength("");
      onSelectRoom(id);
    } catch {
      toast.error("Failed to create room");
    }
  }

  async function handleDeleteRoom(room: Room) {
    try {
      await deleteRoom.mutateAsync(room.id);
      toast.success(`"${room.name}" deleted`);
      if (selectedRoomId === room.id) {
        onSelectRoom(null);
      }
    } catch {
      toast.error("Failed to delete room");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Home className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-base leading-tight tracking-tight">
                Home Design
              </h1>
              <p className="text-xs text-sidebar-foreground/50 font-ui">
                Studio
              </p>
            </div>
          </div>

          <Button
            onClick={() => setAddDialogOpen(true)}
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-ui text-sm font-medium"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>

        {/* Room list */}
        <ScrollArea className="flex-1 sidebar-scroll">
          <div className="p-3 space-y-1">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-14 w-full rounded-lg bg-sidebar-accent/40"
                  />
                ))}
              </div>
            ) : !rooms || rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DoorOpen className="w-8 h-8 text-sidebar-foreground/20 mb-3" />
                <p className="text-sm text-sidebar-foreground/40 font-ui leading-snug">
                  No rooms yet
                </p>
                <p className="text-xs text-sidebar-foreground/25 font-ui mt-1">
                  Add your first room above
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {rooms.map((room, i) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <motion.div
                      key={room.id.toString()}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRoom(room.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150 group ${
                          isSelected
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-sidebar-primary"
                                : "bg-sidebar-foreground/20"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-ui font-semibold text-sm truncate leading-snug">
                              {room.name}
                            </p>
                            <p className="text-xs opacity-50 font-ui mt-0.5">
                              {room.dimensions.width}′ ×{" "}
                              {room.dimensions.length}′
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(room);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-sidebar-foreground/40 hover:text-red-400 transition-all flex-shrink-0"
                          aria-label={`Delete ${room.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-sidebar-border/50">
          <p className="text-xs text-sidebar-foreground/30 font-ui text-center">
            {rooms?.length ?? 0} room{rooms?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </aside>

      {/* Add Room Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl tracking-tight">
              New Room
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="room-name"
                className="font-ui font-medium text-sm"
              >
                Room Name
              </Label>
              <Input
                id="room-name"
                placeholder="e.g. Living Room"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                className="font-ui"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="room-width"
                  className="font-ui font-medium text-sm"
                >
                  Width (ft)
                </Label>
                <Input
                  id="room-width"
                  type="number"
                  placeholder="e.g. 14"
                  min="4"
                  max="60"
                  value={newRoomWidth}
                  onChange={(e) => setNewRoomWidth(e.target.value)}
                  className="font-ui"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="room-length"
                  className="font-ui font-medium text-sm"
                >
                  Length (ft)
                </Label>
                <Input
                  id="room-length"
                  type="number"
                  placeholder="e.g. 18"
                  min="4"
                  max="60"
                  value={newRoomLength}
                  onChange={(e) => setNewRoomLength(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  className="font-ui"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="font-ui"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={createRoom.isPending}
              className="font-ui bg-primary text-primary-foreground"
            >
              {createRoom.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Room"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirm */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold tracking-tight">
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-ui">
              This will permanently remove the room along with all furniture and
              mood board notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-ui">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteRoom(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-ui"
            >
              {deleteRoom.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
