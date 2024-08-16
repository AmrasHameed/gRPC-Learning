const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('todo.proto', {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObj.todoPackage;

const text = process.argv[2];
const client = new todoPackage.Todo(
  'localhost:40000',
  grpc.credentials.createInsecure()
);

client.createTodo(
  {
    id: -1,
    text,
  },
  (err, response) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Received from Server:', JSON.stringify(response));
  }
);

// client.readTodos({}, (err, response) => {
//   if (err) {
//     console.error('Error:', err);
//     return;
//   }
//   response.items.forEach((i) => {
//     console.log(i.text);
//   });
// });

const call = client.readTodosStream();
call.on('data', (item) => {
  console.log('Recieved item from server ' + JSON.stringify(item));
});

call.on('end', (e) => {
  console.log('Server Done!');
});
