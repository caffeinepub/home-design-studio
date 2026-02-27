import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { RoomWorkspace } from "./components/RoomWorkspace";
import { Sidebar } from "./components/Sidebar";
import { WelcomeScreen } from "./components/WelcomeScreen";

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<bigint | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Left sidebar */}
      <Sidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedRoomId !== null ? (
          <RoomWorkspace roomId={selectedRoomId} />
        ) : (
          <WelcomeScreen />
        )}
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
