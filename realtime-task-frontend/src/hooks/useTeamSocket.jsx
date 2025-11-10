import { useEffect } from "react";
import { getSocket } from "../utils/socket"; // your socket helper that returns connected socket

export function useTeamSocket(teamId, handlers = {}) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !teamId) return;
    socket.emit("joinTeamRoom", teamId);

    const wrap = (name, fn) => {
      if (!fn) return;
      socket.on(name, fn);
    };

    for (const k in handlers) wrap(k, handlers[k]);

    return () => {
      for (const k in handlers) socket.off(k, handlers[k]);
      socket.emit("leaveTeamRoom", teamId);
    };
  }, [teamId, JSON.stringify(handlers)]);
}
