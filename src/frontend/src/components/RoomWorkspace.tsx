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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Loader2, Pencil, StickyNote } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetRoom, useUpdateRoom } from "../hooks/useQueries";
import { FloorPlan } from "./FloorPlan";
import { MoodBoard } from "./MoodBoard";

interface RoomWorkspaceProps {
  roomId: bigint;
}

export function RoomWorkspace({ roomId }: RoomWorkspaceProps) {
  const { data: room, isLoading } = useGetRoom(roomId);
  const updateRoom = useUpdateRoom();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWidth, setEditWidth] = useState("");
  const [editLength, setEditLength] = useState("");

  function openEdit() {
    if (!room) return;
    setEditName(room.name);
    setEditWidth(String(room.dimensions.width));
    setEditLength(String(room.dimensions.length));
    setEditDialogOpen(true);
  }

  async function handleSaveEdit() {
    if (!room) return;
    const name = editName.trim();
    const w = Number.parseFloat(editWidth);
    const l = Number.parseFloat(editLength);
    if (!name || Number.isNaN(w) || w <= 0 || Number.isNaN(l) || l <= 0) {
      toast.error("Please fill in all fields with valid values");
      return;
    }
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        name,
        dimensions: { width: w, length: l },
      });
      toast.success("Room updated");
      setEditDialogOpen(false);
    } catch {
      toast.error("Failed to update room");
    }
  }

  if (isLoading || !room) {
    return (
      <div className="flex-1 flex flex-col p-6 gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      key={roomId.toString()}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Room header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground tracking-tight leading-none">
            {room.name}
          </h2>
          <p className="text-sm text-muted-foreground font-ui mt-1">
            {room.dimensions.width}′ × {room.dimensions.length}′ &nbsp;·&nbsp;{" "}
            {room.furniture.length} item{room.furniture.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openEdit}
          className="font-ui text-sm gap-2"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Room
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="floorplan"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-3 pb-0 flex-shrink-0 border-b border-border/50">
          <TabsList className="bg-transparent p-0 h-auto gap-1">
            <TabsTrigger
              value="floorplan"
              className="font-ui text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-2" />
              Floor Plan
            </TabsTrigger>
            <TabsTrigger
              value="moodboard"
              className="font-ui text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground transition-all"
            >
              <StickyNote className="w-3.5 h-3.5 mr-2" />
              Mood Board
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="floorplan"
          className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <FloorPlan room={room} />
        </TabsContent>

        <TabsContent value="moodboard" className="flex-1 overflow-auto m-0">
          <MoodBoard room={room} />
        </TabsContent>
      </Tabs>

      {/* Edit Room Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl tracking-tight">
              Edit Room
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-ui font-medium text-sm">Room Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-ui"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-ui font-medium text-sm">
                  Width (ft)
                </Label>
                <Input
                  type="number"
                  value={editWidth}
                  onChange={(e) => setEditWidth(e.target.value)}
                  min="4"
                  max="60"
                  className="font-ui"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-ui font-medium text-sm">
                  Length (ft)
                </Label>
                <Input
                  type="number"
                  value={editLength}
                  onChange={(e) => setEditLength(e.target.value)}
                  min="4"
                  max="60"
                  className="font-ui"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="font-ui"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateRoom.isPending}
              className="font-ui"
            >
              {updateRoom.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
