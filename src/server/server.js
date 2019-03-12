const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../../proto/chatservice.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const ChatService = protoDescriptor.chat.ChatService;

const rooms = [
  {
    id: 1,
    title: "room1",
    createdBy: "default",
    createdAt: new Date().getTime()
  },
  {
    id: 2,
    title: "room2",
    createdBy: "default",
    createdAt: new Date().getTime()
  }
];

/** 部屋ごとの投稿 */
const messages = { "1": [], "2": [] };

/** pushすべきクライアントの接続 */
const watchers = [];

const findRoom = room => {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].id === room) {
      return rooms[i];
    }
  }
  return null;
};

const roomNotFound = room => {
  return {
    code: grpc.status.NOT_FOUND,
    details: "Room not found:" + room
  };
};

// これより下がRPCの実装
const listRooms = (call, callback) => {
  callback(null, {
    rooms: rooms
  });
};

const insertRoom = (call, callback) => {
  const newRoom = call.request;
  newRoom.createdAt = new Date().getTime();
  rooms.push(newRoom);
  messages[newRoom.id] = [];
  callback(null, newRoom);
};

const listMessages = (call, callback) => {
  const id = call.request.id;
  if (!findRoom(id)) {
    callback(roomNotFound(id));
    return;
  }
  callback(null, {
    messages: messages[id]
  });
};

const insertMessage = (call, callback) => {
  const newMessage = call.request;
  if (!findRoom(newMessage.room)) {
    callback(roomNotFound(newMessage.room));
    return;
  }
  newMessage.createdAt = new Date().getTime();
  messages[newMessage.room].push(newMessage);
  for (let i = 0; i < watchers.length; i++) {
    if (watchers[i].request.id === newMessage.room) {
      watchers[i].write(newMessage);
    }
  }
  callback(null, newMessage);
};

const watchRoom = (call, callback) => {
  watchers.push(call);
  console.log("added new watcher", call);
};

const main = () => {
  const server = new grpc.Server();
  server.addService(ChatService.service, {
    listRooms: listRooms,
    insertRoom: insertRoom,
    listMessages: listMessages,
    insertMessage: insertMessage,
    watchRoom: watchRoom
  });
  server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
  server.start();
};

main();
