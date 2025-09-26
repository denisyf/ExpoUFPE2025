#!/bin/bash

# Script para iniciar a aplicação ExpoUFPE com Docker Compose
# Autor: Sistema automatizado
# Data: $(date)

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando aplicação ExpoUFPE..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se docker-compose está instalado
if ! command -v docker-compose > /dev/null 2>&1; then
    log_error "docker-compose não está instalado ou não está no PATH"
    exit 1
fi

# Parar containers existentes
log_info "Parando containers existentes..."
docker-compose down --remove-orphans

# Criar diretórios necessários se não existirem
log_info "Verificando diretórios necessários..."
mkdir -p node-red-data

# Construir e iniciar os serviços
log_info "Construindo e iniciando os serviços..."
docker-compose up --build -d

# Aguardar os serviços ficarem prontos
log_info "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
log_info "Verificando status dos containers..."
docker-compose ps

# Mostrar logs dos serviços
log_info "Últimos logs dos serviços:"
docker-compose logs --tail=50

echo ""
log_info "✅ Aplicação iniciada com sucesso!"
echo ""
echo "📋 Informações dos serviços:"
echo "   🔴 Node-RED: http://localhost:1880"
echo "   🔌 MQTT: localhost:1883"
echo "   🌐 WebSocket: localhost:1884"
echo ""
echo "📝 Comandos úteis:"
echo "   • Ver logs: docker-compose logs -f"
echo "   • Parar: docker-compose down"
echo "   • Reiniciar: docker-compose restart"
echo "   • Status: docker-compose ps"
echo ""
log_warn "Pressione Ctrl+C para parar os logs ou use 'docker-compose down' para parar os serviços"

# Seguir logs em tempo real
docker-compose logs -f