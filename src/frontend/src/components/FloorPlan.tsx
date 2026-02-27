import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RotateCw, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { FurnitureItem, Room } from "../backend.d";
import {
  useAddFurniture,
  useDeleteFurniture,
  useUpdateFurniture,
} from "../hooks/useQueries";
import {
  FURNITURE_TEMPLATES,
  getFurnitureColor,
  getFurnitureTemplate,
} from "../utils/furniture";

const PIXELS_PER_FOOT = 40;
const CANVAS_PADDING = 48;

interface FloorPlanProps {
  room: Room;
}

interface DragState {
  itemId: bigint;
  startMouseX: number;
  startMouseY: number;
  startItemX: number;
  startItemY: number;
}

interface LocalFurnitureOverride {
  [key: string]: { x: number; y: number };
}

export function FloorPlan({ room }: FloorPlanProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [localPositions, setLocalPositions] = useState<LocalFurnitureOverride>(
    {},
  );
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState("");
  const [editWidth, setEditWidth] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editRotation, setEditRotation] = useState("");

  const addFurniture = useAddFurniture(room.id);
  const updateFurniture = useUpdateFurniture(room.id);
  const deleteFurniture = useDeleteFurniture(room.id);

  // Calculate canvas scale so it fits the viewport
  const roomWidthPx = room.dimensions.width * PIXELS_PER_FOOT;
  const roomLengthPx = room.dimensions.length * PIXELS_PER_FOOT;

  const canvasWidth = roomWidthPx + CANVAS_PADDING * 2;
  const canvasHeight = roomLengthPx + CANVAS_PADDING * 2;

  // ── Add furniture from palette ──────────────────────────────────────────
  async function handleAddFurniture(type: string) {
    const template = getFurnitureTemplate(type);
    // Center the furniture in the room
    const centerX = room.dimensions.width / 2 - template.defaultSize.width / 2;
    const centerY =
      room.dimensions.length / 2 - template.defaultSize.height / 2;

    try {
      await addFurniture.mutateAsync({
        type,
        furnitureLabel: template.label,
        position: { x: Math.max(0, centerX), y: Math.max(0, centerY) },
        size: template.defaultSize,
        rotation: 0,
      });
    } catch {
      toast.error("Failed to add furniture");
    }
  }

  // ── Drag handling (pointer events for touch + mouse) ───────────────────
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, item: FurnitureItem) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      const currentPos = localPositions[item.id.toString()] ?? item.position;

      setDragging({
        itemId: item.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startItemX: currentPos.x,
        startItemY: currentPos.y,
      });
    },
    [localPositions],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const item = room.furniture.find((f) => f.id === dragging.itemId);
      if (!item) return;

      const dx = (e.clientX - dragging.startMouseX) / PIXELS_PER_FOOT;
      const dy = (e.clientY - dragging.startMouseY) / PIXELS_PER_FOOT;

      // Clamp within room bounds
      const maxX = room.dimensions.width - item.size.width;
      const maxY = room.dimensions.length - item.size.height;

      const newX = Math.max(0, Math.min(maxX, dragging.startItemX + dx));
      const newY = Math.max(0, Math.min(maxY, dragging.startItemY + dy));

      setLocalPositions((prev) => ({
        ...prev,
        [dragging.itemId.toString()]: { x: newX, y: newY },
      }));
    },
    [dragging, room],
  );

  const handlePointerUp = useCallback(
    async (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const item = room.furniture.find((f) => f.id === dragging.itemId);
      if (!item) return;

      const pos = localPositions[dragging.itemId.toString()] ?? item.position;

      setDragging(null);
      e.currentTarget.releasePointerCapture(e.pointerId);

      try {
        await updateFurniture.mutateAsync({
          furnitureId: item.id,
          type: item.type,
          furnitureLabel: item.furnitureLabel,
          position: pos,
          size: item.size,
          rotation: item.rotation,
        });
        // Clear local override after server confirms
        setLocalPositions((prev) => {
          const copy = { ...prev };
          delete copy[dragging.itemId.toString()];
          return copy;
        });
      } catch {
        // Rollback
        setLocalPositions((prev) => {
          const copy = { ...prev };
          delete copy[dragging.itemId.toString()];
          return copy;
        });
        toast.error("Failed to save position");
      }
    },
    [dragging, localPositions, room, updateFurniture],
  );

  // ── Edit popover ────────────────────────────────────────────────────────
  function openEdit(item: FurnitureItem) {
    setEditingId(item.id);
    setEditLabel(item.furnitureLabel);
    setEditType(item.type);
    setEditWidth(String(item.size.width));
    setEditHeight(String(item.size.height));
    setEditRotation(String(item.rotation));
  }

  async function handleSaveEdit(item: FurnitureItem) {
    try {
      const pos = localPositions[item.id.toString()] ?? item.position;
      await updateFurniture.mutateAsync({
        furnitureId: item.id,
        type: editType || item.type,
        furnitureLabel: editLabel || item.furnitureLabel,
        position: pos,
        size: {
          width: Number.parseFloat(editWidth) || item.size.width,
          height: Number.parseFloat(editHeight) || item.size.height,
        },
        rotation: Number.parseFloat(editRotation) || 0,
      });
      setEditingId(null);
      toast.success("Furniture updated");
    } catch {
      toast.error("Failed to update furniture");
    }
  }

  async function handleDelete(item: FurnitureItem) {
    try {
      await deleteFurniture.mutateAsync(item.id);
      toast.success(`${item.furnitureLabel} removed`);
    } catch {
      toast.error("Failed to remove furniture");
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas area */}
      <div className="flex-1 overflow-auto drafting-grid relative">
        <div
          className="relative select-none"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            minWidth: "100%",
            minHeight: "100%",
          }}
        >
          {/* Room rectangle */}
          <div
            className="absolute border-2 border-foreground/80 bg-card/60 shadow-md"
            style={{
              left: CANVAS_PADDING,
              top: CANVAS_PADDING,
              width: roomWidthPx,
              height: roomLengthPx,
            }}
          >
            {/* Dimension labels */}
            <div className="absolute -top-6 left-0 right-0 flex justify-center">
              <span className="text-xs font-ui font-semibold text-foreground/60 bg-background/80 px-1.5 py-0.5 rounded">
                {room.dimensions.width} ft
              </span>
            </div>
            <div
              className="absolute top-0 bottom-0 flex items-center"
              style={{ left: -32 }}
            >
              <span
                className="text-xs font-ui font-semibold text-foreground/60 bg-background/80 px-1.5 py-0.5 rounded"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {room.dimensions.length} ft
              </span>
            </div>

            {/* Empty state */}
            {room.furniture.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground/60 font-ui text-center px-4">
                  No furniture yet
                  <br />
                  <span className="text-xs">Pick from the palette below</span>
                </p>
              </div>
            )}

            {/* Furniture items — dragging events on the room div */}
            <div
              className="absolute inset-0 no-select"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              ref={canvasRef}
            >
              <AnimatePresence>
                {room.furniture.map((item) => {
                  const pos =
                    localPositions[item.id.toString()] ?? item.position;
                  const isDraggingThis = dragging?.itemId === item.id;
                  const color = getFurnitureColor(item.type);

                  const widthPx = item.size.width * PIXELS_PER_FOOT;
                  const heightPx = item.size.height * PIXELS_PER_FOOT;
                  const leftPx = pos.x * PIXELS_PER_FOOT;
                  const topPx = pos.y * PIXELS_PER_FOOT;

                  return (
                    <motion.div
                      key={item.id.toString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute group ${isDraggingThis ? "z-50 cursor-grabbing" : "cursor-grab"}`}
                      style={{
                        left: leftPx,
                        top: topPx,
                        width: widthPx,
                        height: heightPx,
                        transform: `rotate(${item.rotation}deg)`,
                        touchAction: "none",
                        zIndex: isDraggingThis ? 50 : 10,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, item)}
                    >
                      {/* Furniture body */}
                      <div
                        className="absolute inset-0 rounded flex items-center justify-center overflow-hidden shadow-sm"
                        style={{
                          backgroundColor: `${color}CC`,
                          borderColor: color,
                          borderWidth: "1.5px",
                          borderStyle: "solid",
                        }}
                      >
                        <span
                          className="text-white text-center font-ui font-semibold leading-tight px-1"
                          style={{
                            fontSize: Math.min(
                              11,
                              Math.max(8, Math.min(widthPx, heightPx) / 5),
                            ),
                            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                          }}
                        >
                          {item.furnitureLabel}
                        </span>
                      </div>

                      {/* Controls overlay (on hover) */}
                      <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pointer-events-none group-hover:pointer-events-auto">
                        <Popover
                          open={editingId === item.id}
                          onOpenChange={(open) => {
                            if (open) openEdit(item);
                            else setEditingId(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-6 h-6 bg-background border border-border rounded flex items-center justify-center hover:bg-secondary transition-colors shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              title="Edit"
                            >
                              <RotateCw className="w-3 h-3 text-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 p-4"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-3">
                              <p className="font-ui font-semibold text-sm text-foreground">
                                Edit Furniture
                              </p>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-ui font-medium">
                                  Label
                                </Label>
                                <Input
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="h-8 text-sm font-ui"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-ui font-medium">
                                    W (ft)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={editWidth}
                                    onChange={(e) =>
                                      setEditWidth(e.target.value)
                                    }
                                    className="h-8 text-sm font-ui"
                                    min="0.5"
                                    step="0.5"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-ui font-medium">
                                    H (ft)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={editHeight}
                                    onChange={(e) =>
                                      setEditHeight(e.target.value)
                                    }
                                    className="h-8 text-sm font-ui"
                                    min="0.5"
                                    step="0.5"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-ui font-medium">
                                  Rotation (°)
                                </Label>
                                <Input
                                  type="number"
                                  value={editRotation}
                                  onChange={(e) =>
                                    setEditRotation(e.target.value)
                                  }
                                  className="h-8 text-sm font-ui"
                                  min="0"
                                  max="360"
                                  step="45"
                                />
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(item)}
                                disabled={updateFurniture.isPending}
                                className="w-full font-ui text-xs h-8"
                              >
                                {updateFurniture.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <button
                          type="button"
                          className="w-6 h-6 bg-background border border-border rounded flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Furniture Palette */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="px-4 py-3">
          <p className="text-xs font-ui font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
            Furniture Palette
          </p>
          <ScrollArea>
            <div className="flex flex-wrap gap-2 pb-1">
              {FURNITURE_TEMPLATES.map((template) => (
                <motion.button
                  key={template.type}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAddFurniture(template.type)}
                  disabled={addFurniture.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-foreground text-xs font-ui font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: template.color }}
                  />
                  {template.label}
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
