📘 Manual de Ejecución – Transacciones y Promociones (Ledger Bank)

Guía práctica para iniciar, monitorear y validar los servicios del sistema.

⭐ 1. Requisitos

Docker Desktop ejecutándose.

PowerShell abierto en:

c:\Users\Valery\SISTEMAS DISTRIBUIDOS\ENTREGAFINAL\ledger-bank

🚀 2. Transacciones
2.1. Arrancar servicios principales
docker compose -f "infra/docker-compose.yml" up -d --build zookeeper kafka rabbitmq transaction_api transaction_processor dashboard_aggregator dashboard_client

2.2. Verificar que la API de transacciones funciona
docker compose -f "infra/docker-compose.yml" logs -n 20 transaction_api

2.3. Abrir el tablero en vivo

Dashboard Web:
http://localhost:8080/

La tabla se actualiza por WebSocket en el puerto 8081.

✉️ 3. Promociones
3.1. Opción rápida (MailHog para pruebas)
docker compose -f "infra/docker-compose.yml" up -d --build smtp rabbitmq email_worker ad_generator

UI de MailHog

http://localhost:8025/

3.2. Opción con Gmail
Editar archivo:
infra/env/email_worker.env


Con:

SMTP_PROVIDER=gmail
SMTP_USER=tu_usuario@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM=tu_usuario@gmail.com

Ejecutar:
docker compose -f "infra/docker-compose.yml" up -d --build email_worker ad_generator

📡 4. Monitoreo
Transacciones
docker compose -f "infra/docker-compose.yml" logs -f transaction_api
docker compose -f "infra/docker-compose.yml" logs -f transaction_processor
docker compose -f "infra/docker-compose.yml" logs -f dashboard_aggregator

Promociones
docker compose -f "infra/docker-compose.yml" logs -f ad_generator
docker compose -f "infra/docker-compose.yml" logs -f email_worker

⚙️ 5. Pruebas Rápidas
5.1. Enviar 12 transacciones aleatorias (PowerShell)
$uri = 'http://localhost:3000/transfer'

$users = @(
  @{ from_user='alice'; to_user='bob' },
  @{ from_user='carol'; to_user='dave' },
  @{ from_user='erin';  to_user='frank' }
)

$emails = @('vale.roserom23@gmail.com','nickyrosero159@gmail.com','nickolrosero5@gmail.com')
$rnd = [Random]::new()

for ($i=1; $i -le 12; $i++) {

  $u = $users[ $rnd.Next(0, $users.Count) ]
  $e = $emails[ $rnd.Next(0, $emails.Count) ]

  $amount = [Math]::Round(10 + ($rnd.NextDouble()*490), 2)

  $payload = @{
    from_user=$u.from_user;
    to_user=$u.to_user;
    amount=$amount;
    email=$e
  } | ConvertTo-Json -Compress

  try {
    $resp = Invoke-RestMethod -Method Post -Uri $uri -ContentType 'application/json' -Body $payload
    Write-Host ("accepted=$($resp.accepted) tx_id=$($resp.tx_id) amount=$amount from=$($u.from_user) to=$($u.to_user) email=$e")
  } catch {
    Write-Host ("ERROR: $($_.Exception.Message)")
  }

  Start-Sleep -Milliseconds 800
}

🔔 6. Validación de promociones

El ad_generator envía anuncios cada 30 segundos.

El email_worker debe registrar cada correo enviado:

docker compose -f "infra/docker-compose.yml" logs -f email_worker


Revisar bandeja de entrada y Spam de los tres correos configurados.

⛔ 7. Detener servicios
Todo el stack
docker compose -f "infra/docker-compose.yml" down

Solo servicios específicos
docker compose -f "infra/docker-compose.yml" stop <servicio1> <servicio2>

📝 8. Notas útiles

Si hay errores de Kafka, inicia primero:

docker compose -f "infra/docker-compose.yml" up -d zookeeper kafka


Si Gmail bloquea 587/STARTTLS, usar:

SMTP_PORT=465
SMTP_SECURE=true


Para reconstruir cualquier servicio:

docker compose -f "infra/docker-compose.yml" up -d --build <servicio>
