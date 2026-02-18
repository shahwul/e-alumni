import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'] 
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log(`User terhubung: ${socket.id}`);

    socket.on("update-data", (data) => {
      console.log("Mendapat trigger update-data:", data);
      io.emit("refresh-data", data);
    });

    socket.on("disconnect", () => {
      console.log(`User keluar: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server siap di http://${hostname}:${port}`);
    console.log(`> Mode: ${dev ? "Development" : "Production"}`);
  });
});