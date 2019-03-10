const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../../proto/service.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const ChatService = protoDescriptor.chat.ChatService;
const client = new ChatService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

const printResponse = (error, response) => {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log(response);
  }
};

const listRooms = () => {
  client.listRooms({}, printResponse);
};

const insertRoom = (id, title, createdBy) => {
  client.insertRoom(
    { id: parseInt(id), title: title, createdBy: createdBy },
    printResponse
  );
};

const listMessages = room => {
  client.listMessages({ id: parseInt(room) }, printResponse);
};

const insertMessage = (room, text, createdBy) => {
  const message = { room: parseInt(room), text: text, createdBy: createdBy };
  client.insertMessage(message, printResponse);
};

const watchRoom = id => {
  const call = client.watchRoom({ id: parseInt(id) });
  call
    .on("data", message => {
      console.log("Data:", message);
    })
    .on("end", () => {
      console.log("End:");
    })
    .on("status", status => {
      console.log("Status:", status);
    });
};

const processName = process.argv.shift();
const scriptName = process.argv.shift();
const command = process.argv.shift();

switch (command) {
  case "listRooms":
    listRooms();
    break;
  case "insertRoom":
    insertRoom(process.argv[0], process.argv[1], process.argv[2]);
    break;
  case "listMessages":
    listMessages(process.argv[0]);
    break;
  case "insertMessage":
    insertMessage(process.argv[0], process.argv[1], process.argv[2]);
    break;
  case "watchRoom":
    watchRoom(process.argv[0]);
    break;
  default:
    console.log("Illegal argument.");
    break;
}
