// src/hooks/useTeamSocket.js
import { useEffect } from "react";
import { initSocket, getSocket } from "../utils/socket";

export function useTeamSocket(teamId, handlers = {}) {
  useEffect(() => {
    if (!teamId) return;
    const socket = initSocket();

    // join the team room (server expects projectId -> finds team)
    socket.emit("join_team_room", teamId);

    // register handlers
    const bound = [];
    Object.entries(handlers).forEach(([event, fn]) => {
      socket.on(event, fn);
      bound.push([event, fn]);
    });

    // cleanup
    return () => {
      bound.forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [teamId]);
}
