import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;
  //check token
  const user = checkToken(req);
  //if token is invalid it will return null and null act as 0 ,id not it will return else that act like true state in if-else
  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Yon don't permission to access this api",
    });
  }

  //check if roomId exist
  const rooms = readChatRoomsDB();
  const roomIdx = rooms.findIndex((x) => x.roomId === roomId);
  if (roomIdx === -1)
    return res.status(404).json({ ok: false, message: "Invalid room id" });
  //check if messageId exist
  const messages = rooms[roomIdx].messages;
  const messageIdx = messages.findIndex((x) => x.messageId === messageId);
  if (messageIdx === -1)
    return res.status(404).json({ ok: false, message: "Invalid message id" });
  //check if token owner is admin, they can delete any message
  if (user.isAdmin === true) {
    messages.splice(messageIdx, 1);
    writeChatRoomsDB(rooms);
    return res.json({ ok: true });
  }
  //or if token owner is normal user, they can only delete their own message!
  else {
    if (user.username === messages[messageIdx].username) {
      messages.splice(messageIdx, 1);
      writeChatRoomsDB(rooms);
      return res.json({ ok: true });
    } else {
      res.status(403).json({
        ok: false,
        message: "You don't have permisssion to access this data",
      });
    }
  }
}
