const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf definition
const packageDef = protoLoader.loadSync('todo.proto', {});
const grpcObj = grpc.loadPackageDefinition(packageDef);

// Extract the package
const todoPackage = grpcObj.todoPackage;

// Create a gRPC server instance
const server = new grpc.Server();

// Define in-memory storage for todos
const todos = [];

// Implement the gRPC service methods
function createTodo(call, callback) {
  const todoItem = {
    id: todos.length + 1, // Generate a new ID based on the length of the array
    text: call.request.text,
  };
  todos.push(todoItem); // Store the newly created todo item
  callback(null, todoItem); // Send the response back to the client
}

function readTodos(call, callback) {
  // Return the list of todos
  callback(null, { items: todos });
}

function readTodosStream(call, callback) {
  todos.forEach((t) => call.write(t));
  call.end();
}

// Add the service to the server
server.addService(todoPackage.Todo.service, {
  createTodo,
  readTodos,
  readTodosStream,
});

// Bind the server to a port and start it
server.bindAsync(
  '0.0.0.0:40000',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Error binding server:', err);
      return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
    server.start();
  }
);
