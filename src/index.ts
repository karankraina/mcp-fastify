import { server } from './server.js';

const port = Number(process.env.PORT) || 3001;

server.listen({ port, host: "0.0.0.0" }, function (err) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening on port ${port}`);
});
