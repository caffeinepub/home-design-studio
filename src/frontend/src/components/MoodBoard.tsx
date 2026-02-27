import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, StickyNote, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MoodBoardNote, Room } from "../backend.d";
import {
  useAddMoodBoardNote,
  useDeleteMoodBoardNote,
  useUpdateMoodBoardNote,
} from "../hooks/useQueries";

interface MoodBoardProps {
  room: Room;
}

const NOTE_COLORS = [
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-sky-50 border-sky-200 text-sky-900",
  "bg-rose-50 border-rose-200 text-rose-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-violet-50 border-violet-200 text-violet-900",
  "bg-orange-50 border-orange-200 text-orange-900",
];

function getNoteColor(id: bigint): string {
  const index = Number(id) % NOTE_COLORS.length;
  return NOTE_COLORS[index];
}

interface NoteCardProps {
  note: MoodBoardNote;
  roomId: bigint;
}

function NoteCard({ note, roomId }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const updateNote = useUpdateMoodBoardNote(roomId);
  const deleteNote = useDeleteMoodBoardNote(roomId);
  const colorClass = getNoteColor(note.id);

  async function handleBlur() {
    if (draft.trim() === note.content) {
      setIsEditing(false);
      return;
    }
    if (!draft.trim()) {
      setDraft(note.content);
      setIsEditing(false);
      return;
    }
    try {
      await updateNote.mutateAsync({ noteId: note.id, content: draft.trim() });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update note");
      setDraft(note.content);
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteNote.mutateAsync(note.id);
    } catch {
      toast.error("Failed to delete note");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-xl border p-4 min-h-24 ${colorClass} shadow-xs hover:shadow-sm transition-shadow`}
    >
      {isEditing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          className="min-h-20 resize-none border-0 bg-transparent p-0 text-sm font-ui focus-visible:ring-0 text-inherit"
          autoFocus
        />
      ) : (
        <button
          type="button"
          className="text-sm font-ui leading-relaxed cursor-text whitespace-pre-wrap break-words text-left w-full bg-transparent border-0 p-0"
          onClick={() => setIsEditing(true)}
        >
          {note.content}
        </button>
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteNote.isPending}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
        aria-label="Delete note"
      >
        {deleteNote.isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Trash2 className="w-3 h-3" />
        )}
      </button>

      {updateNote.isPending && (
        <div className="absolute bottom-2 right-2">
          <Loader2 className="w-3 h-3 animate-spin opacity-40" />
        </div>
      )}
    </motion.div>
  );
}

export function MoodBoard({ room }: MoodBoardProps) {
  const [newContent, setNewContent] = useState("");
  const addNote = useAddMoodBoardNote(room.id);

  async function handleAddNote() {
    const content = newContent.trim();
    if (!content) {
      toast.error("Note content cannot be empty");
      return;
    }
    try {
      await addNote.mutateAsync(content);
      setNewContent("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Add note area */}
      <div className="flex-shrink-0 p-6 border-b border-border/50 bg-card/30">
        <div className="max-w-2xl">
          <Textarea
            placeholder="Write a style note, color idea, inspiration, or anything for this room…"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="min-h-20 resize-none font-ui text-sm mb-3 bg-background/80"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleAddNote();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-ui">
              Ctrl+Enter to add
            </p>
            <Button
              onClick={handleAddNote}
              disabled={addNote.isPending || !newContent.trim()}
              size="sm"
              className="font-ui gap-2"
            >
              {addNote.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Add Note
            </Button>
          </div>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-auto p-6">
        {room.moodBoard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StickyNote className="w-10 h-10 text-muted-foreground/25 mb-3 mx-auto" />
              <p className="font-ui font-semibold text-muted-foreground/60 text-sm">
                No notes yet
              </p>
              <p className="text-xs text-muted-foreground/40 font-ui mt-1">
                Add your first style note above
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {room.moodBoard.map((note) => (
                <NoteCard
                  key={note.id.toString()}
                  note={note}
                  roomId={room.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border/30 px-6 py-3 bg-card/20">
        <p className="text-xs text-muted-foreground/50 font-ui text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
