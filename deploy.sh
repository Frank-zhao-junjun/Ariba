#!/bin/bash
# 部署脚本 - 一键部署Ariba实施助手

set -e

# 配置
APP_NAME="ariba-assistant"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查环境
check_env() {
    log_info "检查部署环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装"
        exit 1
    fi
    
    log_info "环境检查通过"
}

# 备份
backup() {
    log_info "创建备份..."
    mkdir -p $BACKUP_DIR
    
    # 备份数据
    if [ -d "./data" ]; then
        tar -czf "$BACKUP_DIR/data_$TIMESTAMP.tar.gz" ./data
        log_info "数据已备份: $BACKUP_DIR/data_$TIMESTAMP.tar.gz"
    fi
}

# 构建
build() {
    log_info "构建Docker镜像..."
    
    # 构建后端
    docker build -t ${APP_NAME}-backend:latest -f Dockerfile.backend .
    
    # 构建前端
    docker build -t ${APP_NAME}-frontend:latest -f Dockerfile.frontend ./web/frontend
    
    log_info "镜像构建完成"
}

# 部署
deploy() {
    log_info "部署服务..."
    
    docker-compose -f $COMPOSE_FILE up -d
    
    log_info "等待服务启动..."
    sleep 10
    
    # 健康检查
    for i in {1..30}; do
        if curl -sf http://localhost/health > /dev/null 2>&1; then
            log_info "服务启动成功"
            return 0
        fi
        sleep 2
    done
    
    log_error "服务启动超时"
    return 1
}

# 回滚
rollback() {
    log_info "执行回滚..."
    
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/data_*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        tar -xzf $LATEST_BACKUP
        log_info "已恢复备份: $LATEST_BACKUP"
    else
        log_warn "没有找到备份"
    fi
}

# 清理
cleanup() {
    log_info "清理旧镜像..."
    docker image prune -f
    log_info "清理完成"
}

# 查看状态
status() {
    log_info "服务状态:"
    docker-compose -f $COMPOSE_FILE ps
}

# 查看日志
logs() {
    SERVICE=${1:-backend}
    docker-compose -f $COMPOSE_FILE logs -f $SERVICE
}

# 停止服务
stop() {
    log_info "停止服务..."
    docker-compose -f $COMPOSE_FILE down
}

# 显示帮助
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy    部署服务"
    echo "  build     构建镜像"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  status    查看状态"
    echo "  logs      查看日志"
    echo "  backup    创建备份"
    echo "  rollback  回滚"
    echo "  cleanup   清理"
    echo ""
}

# 主逻辑
case "${1:-deploy}" in
    deploy)
        check_env
        backup
        build
        deploy
        ;;
    build)
        check_env
        build
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        deploy
        ;;
    status)
        status
        ;;
    logs)
        logs $2
        ;;
    backup)
        backup
        ;;
    rollback)
        rollback
        ;;
    cleanup)
        cleanup
        ;;
    *)
        show_help
        ;;
esac
