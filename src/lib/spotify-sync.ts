import { supabase } from "./supabase";

export const subscribeToRoom = (roomId: string, onEvent: (payload: any) => void) => {
  const channel = supabase.channel(`lounge-${roomId}`);

  channel
    .on("broadcast", { event: "player_state" }, (payload: any) => {
      onEvent(payload.payload);
    })
    .subscribe();

  return channel;
};

export const broadcastState = (channel: any, state: any) => {
  if (!channel) return;
  channel.send({
    type: "broadcast",
    event: "player_state",
    payload: state,
  });
};
