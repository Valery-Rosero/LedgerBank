# 🏦 Ledger Bank

### Sistema Distribuido de Transacciones y Promociones

Proyecto académico desarrollado para la asignatura de **Sistemas Distribuidos**, que simula un **ecosistema bancario** basado en microservicios, mensajería asíncrona y procesamiento de eventos en tiempo real.

El sistema permite procesar transacciones, detectar posibles fraudes, enviar notificaciones por correo y mostrar información en vivo mediante un dashboard web.

---

## 📌 Descripción general

Ledger Bank está compuesto por múltiples **servicios independientes** que se comunican entre sí usando **RabbitMQ y Kafka**, ejecutados en contenedores Docker.

El proyecto busca demostrar el uso práctico de:

* Comunicación asíncrona
* Event-driven architecture
* Escalabilidad
* Desacoplamiento entre servicios

---

## 🧠 Tecnologías utilizadas

* 🐳 **Docker & Docker Compose**
* 📨 **RabbitMQ**
* 📊 **Apache Kafka + Zookeeper**
* 🌐 **WebSockets**
* ⚙️ **Node.js**
* 📧 **SMTP (MailHog / Gmail)**
* 🧪 PowerShell / curl para pruebas

---

## 🏗️ Arquitectura general

El sistema está organizado en **servicios desacoplados**, cada uno con una responsabilidad específica:

### 🔹 Servicios principales

* **transaction_api**
  Recibe solicitudes HTTP de transferencias.

* **transaction_processor**
  Procesa transacciones y publica eventos en Kafka.

* **fraud_detector**
  Analiza transacciones de alto valor y genera alertas.

* **dashboard_aggregator**
  Consolida eventos y transmite datos en tiempo real vía WebSocket.

* **dashboard_client**
  Interfaz web que muestra las transacciones en vivo.

---

### 🔹 Notificaciones y promociones

* **notification_router**
  Decide cuándo enviar correos según el estado de la transacción.

* **ad_generator**
  Genera promociones periódicas.

* **email_worker**
  Envía correos electrónicos usando SMTP.

---

## 🔄 Flujo de transacciones

1. El cliente envía una transferencia vía HTTP.
2. `transaction_api` publica el comando en RabbitMQ.
3. `transaction_processor` consume y procesa la transacción.
4. El resultado se publica en Kafka.
5. Servicios suscritos reaccionan:

   * Dashboard en tiempo real
   * Detección de fraude
   * Envío de notificaciones

---

## 🚀 Ejecución del proyecto

### 📋 Requisitos

* Docker Desktop en ejecución
* PowerShell o terminal
* Puerto localhost disponible

---

### ▶️ Arrancar servicios principales

```bash
docker compose -f "infra/docker-compose.yml" up -d --build \
zookeeper kafka rabbitmq \
transaction_api transaction_processor \
dashboard_aggregator dashboard_client
```

---

### 🌐 Acceso al dashboard

* Dashboard web:
  👉 [http://localhost:8080/](http://localhost:8080/)

* WebSocket en tiempo real:
  👉 ws://localhost:8081

---

## ✉️ Promociones y correos

El sistema permite enviar correos usando:

* 🧪 **MailHog** (entorno local)
* 📧 **Gmail** (SMTP con App Password)

Configuración en:

```
infra/env/email_worker.env
```

---

## 🧪 Pruebas rápidas

Ejemplo de envío de transacción:

```powershell
Invoke-RestMethod -Method Post `
-Uri 'http://localhost:3000/transfer' `
-ContentType 'application/json' `
-Body '{"from_user":"alice","to_user":"bob","amount":123.45,"email":"correo@ejemplo.com"}'
```

---

## 📡 Monitoreo de servicios

```bash
docker compose -f "infra/docker-compose.yml" logs -f transaction_api
docker compose -f "infra/docker-compose.yml" logs -f transaction_processor
docker compose -f "infra/docker-compose.yml" logs -f dashboard_aggregator
```

---

## 🩺 Endpoints de salud

* `GET /health` → estado del servicio
* `GET /metrics` → métricas y estadísticas

---

## 🧯 Detener el sistema

```bash
docker compose -f "infra/docker-compose.yml" down
```

---

## 🎯 Objetivo académico

* Aplicar conceptos de **sistemas distribuidos**
* Comprender flujos de eventos y mensajería
* Simular un sistema bancario realista
* Trabajo evaluativo universitario

---

## 🚦 Estado del proyecto

✔️ Funcional
📚 Uso académico
🧪 Entorno de pruebas


