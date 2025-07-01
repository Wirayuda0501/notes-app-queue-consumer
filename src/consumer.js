require('dotenv').config();
const amqp = require('amqplib');
const NotesService = require('./NotesService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

console.log('RABBITMQ_SERVER', process.env.RABBITMQ_SERVER);

const init = async () => {
  const noteService = new NotesService();
  const mailSender = new MailSender();
  const listener = new Listener(noteService, mailSender);

  // const connection = await amqp.connect(process.env.RABBITMQ_SERVER);

  const url = process.env.RABBITMQ_SERVER;
  const connection = await amqp.connect(url, { servername: new URL(url).hostname });
  const channel = await connection.createChannel();

  await channel.assertQueue('export:notes', {
    durable: true,
  });

  channel.consume('export:notes', listener.listen, { noAck: true });
};

init();