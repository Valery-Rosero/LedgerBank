const amqplib = require('amqplib');
const { Kafka } = require('kafkajs');

const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';

const COMMAND_QUEUE = 'transfer_commands';
const TOPIC_TRANSACTIONS = 'transactions_log';

async function ensureKafkaTopic(admin, topic) {
  const topics = await admin.listTopics();
  if (!topics.includes(topic)) {
    await admin.createTopics({ topics: [{ topic, numPartitions: 1, replicationFactor: 1 }] });
    console.log('[transaction_processor] Topic creado:', topic);
  }
}

async function main() {
  console.log('[transaction_processor] iniciando...');
  // Kafka
  const kafka = new Kafka({ brokers: [kafkaBroker] });
  const admin = kafka.admin();
  await admin.connect();
  await ensureKafkaTopic(admin, TOPIC_TRANSACTIONS);
  await admin.disconnect();
  const producer = kafka.producer();
  await producer.connect();

  // RabbitMQ
  const conn = await amqplib.connect(amqpUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue(COMMAND_QUEUE, { durable: true });
  console.log('[transaction_processor] Conectado a RabbitMQ y Kafka');

  await ch.consume(COMMAND_QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const command = JSON.parse(msg.content.toString());
      // Validación simulada
      const success = Math.random() > 0.3; // 70% éxito
      const status = success ? 'COMPLETED' : 'FAILED';
      const event = {
        tx_id: command.tx_id,
        from_user: command.from_user,
        to_user: command.to_user,
        amount: command.amount,
        email: command.email || null,
        status,
        processed_at: new Date().toISOString()
      };
      await producer.send({
        topic: TOPIC_TRANSACTIONS,
        messages: [{ key: String(event.tx_id), value: JSON.stringify(event) }]
      });
      console.log('[transaction_processor] Evento publicado en Kafka:', event);
      ch.ack(msg);
    } catch (err) {
      console.error('[transaction_processor] Error procesando comando:', err);
      ch.nack(msg, false, true);
    }
  }, { noAck: false });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});