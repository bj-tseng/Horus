const PROTO_PATH = '../protos/books.proto';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const controller = require('./booksController.js');
const app = express();
app.use(express.json());

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
})

const booksProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require("uuid");

const server = new grpc.Server();

server.addService(booksProto.BooksService.service, {
  CreateBook: (call, callback) => {
    console.log('call to CreateBook')

    //sample will take the call information from the client(stub)
    const sampleAdd= {
      title: call.request.title, 
      author: call.request.author,
      numberOfPages: call.request.numberOfPages,
      publisher: call.request.publisher,
      id: call.request.id
    }

    controller.createBook(sampleAdd);


    let meta = new grpc.Metadata();
    meta.add('response', 'none')
    call.sendMetadata(meta);

    console.log("logging call ", call)


//this actually sends data to booksController.
  

//Whatever gets passed in as the second argument will be sent back to the client.
    callback(
      null,
      //bookmodel.create
      {
        title: `completed for: ${call.request.title}`, 
        author: `completed for: ${call.request.author}`,
        numberOfPages:`completed for: ${call.request.numberOfPages}` ,
        publisher: `completed for: ${call.request.publisher}`,
        id: `completed for: ${call.request.id}`
      }
    );
  },
  GetBooks: (call, callback) => {
    console.log('call to GetBooks');
    // read from database
    let meta = new grpc.Metadata();

    meta.add('response', call.meta);
    call.sendMetadata(meta);

    controller.getBooks(callback);

  },
  GetBookByID: (call, callback) => {
    console.log('call to GetBookByID')
    console.log('CALLBACK IN BOOKSSERVER: ', call.request)
    sampleID = {id: call.request.id};
    //maybe?
    let meta = new grpc.Metadata();
    meta.add('response', 'none')
    call.sendMetadata(meta);
    controller.getBookByID(sampleID, callback)
  },
  DeleteBook: (call, callback) => {
    //sample will take the call information from the client(stub)
    const sampleDelete= {      
      id: call.request.id
    }

  //this actually sends data to booksController.
    controller.deleteBook(sampleDelete);

    // delete from database
    callback(
      null,{ message: 'DELETED'}
    )
  }
});

server.bind("127.0.0.1:30043", grpc.ServerCredentials.createInsecure());
console.log("booksServer.js running at http://127.0.0.1:30043");

console.log('call from books server')

server.start();