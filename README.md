# gRPC chat example

require node >= 4.0.0

### install dependencies
```
$ npm install
```

### run server
```
$ npm run server
```

### run client
watch chat room
```
$ npm run client watchRoom <room ID>
```

get room list
```
$ npm run client listRooms
```

insert new chat room
```
$ npm run client insertRoom <room ID> <room name> <created user name>
```

get message list
```
$ npm run client listMessages <room ID>
```

insert new chat message
```
$ npm run client insertMessage <room ID> <message text> <created user name>
```
