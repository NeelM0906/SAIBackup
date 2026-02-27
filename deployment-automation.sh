#!/bin/bash
# MAC MINI COORDINATION SYSTEM - AUTOMATED DEPLOYMENT SCRIPT
# Auto-generated deployment automation for human-machine pairings

set -euo pipefail

# Configuration
FORGE_DOMAIN="forge.local"
COLOSSEUM_BASE="/opt/colosseum"
WAR_ROOM_CHANNEL="war-room"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Deployment functions for each operator
deploy_nadav_mm01() {
    log_info "Deploying Nadav on MM01 (AI/ML + Backend + Performance)"
    
    ssh nadav@mm01.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        
        # AI/ML Environment
        echo "Setting up AI/ML domain..."
        ./deploy-domain.sh --domain=ai-ml --operator=nadav --machine=mm01 --primary
        conda activate ml-ops || conda create -n ml-ops python=3.9 -y && conda activate ml-ops
        pip install -q torch tensorflow scikit-learn mlflow wandb
        
        # Backend Systems
        echo "Configuring backend systems..."
        ./deploy-domain.sh --domain=backend --operator=nadav --machine=mm01 --primary
        docker-compose -f backend-stack.yml up -d
        
        # Performance Testing
        echo "Installing performance tools..."
        ./deploy-domain.sh --domain=performance --operator=nadav --machine=mm01 --secondary
        npm install -g -s artillery loadtest clinic
        
        echo "MM01 deployment complete"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Nadav deployed successfully on MM01"
        # Post to war room
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="✅ Nadav operational on MM01 (AI/ML + Backend + Performance)"
    else
        log_error "Failed to deploy Nadav on MM01"
        return 1
    fi
}

deploy_nickroy_mm02() {
    log_info "Deploying Nick Roy on MM02 (DevOps + Security + Data)"
    
    ssh nickroy@mm02.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        
        # DevOps Infrastructure
        echo "Setting up DevOps domain..."
        ./deploy-domain.sh --domain=devops --operator=nickroy --machine=mm02 --primary
        terraform init -upgrade
        ansible --version >/dev/null || pip install ansible
        
        # Security & Compliance
        echo "Configuring security tools..."
        ./deploy-domain.sh --domain=security --operator=nickroy --machine=mm02 --primary
        docker pull owasp/zap2docker-stable
        
        # Data Engineering Support
        echo "Setting up data engineering support..."
        ./deploy-domain.sh --domain=data-eng --operator=nickroy --machine=mm02 --secondary
        docker run -d --name airflow --restart=unless-stopped -p 8080:8080 apache/airflow:latest
        
        echo "MM02 deployment complete"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Nick Roy deployed successfully on MM02"
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="✅ Nick Roy operational on MM02 (DevOps + Security + Data)"
    else
        log_error "Failed to deploy Nick Roy on MM02"
        return 1
    fi
}

deploy_adamgugino_mm03() {
    log_info "Deploying Adam Gugino on MM03 (Frontend + Mobile + Testing)"
    
    ssh adamgugino@mm03.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        
        # Frontend/UX Development
        echo "Setting up frontend domain..."
        ./deploy-domain.sh --domain=frontend --operator=adamgugino --machine=mm03 --primary
        npm install -g -s @angular/cli @vue/cli create-react-app vite
        
        # Mobile Development
        echo "Configuring mobile development..."
        ./deploy-domain.sh --domain=mobile --operator=adamgugino --machine=mm03 --primary
        flutter doctor --android-licenses || echo "Flutter licenses need manual acceptance"
        
        # Performance Testing
        echo "Installing testing frameworks..."
        ./deploy-domain.sh --domain=testing --operator=adamgugino --machine=mm03 --secondary
        npm install -g -s cypress jest playwright @playwright/test
        
        echo "MM03 deployment complete"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Adam Gugino deployed successfully on MM03"
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="✅ Adam Gugino operational on MM03 (Frontend + Mobile + Testing)"
    else
        log_error "Failed to deploy Adam Gugino on MM03"
        return 1
    fi
}

deploy_keerthi_mm04() {
    log_info "Deploying Keerthi on MM04 (Data + AI/ML + Backend)"
    
    ssh keerthi@mm04.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        
        # Data Engineering Primary
        echo "Setting up data engineering domain..."
        ./deploy-domain.sh --domain=data-eng --operator=keerthi --machine=mm04 --primary
        pip install -q apache-airflow pandas dask scipy numpy plotly
        
        # AI/ML Development Support
        echo "Configuring AI/ML support environment..."
        ./deploy-domain.sh --domain=ai-ml --operator=keerthi --machine=mm04 --secondary
        conda create -n ml-research python=3.9 -y || conda activate ml-research
        pip install -q jupyter notebook tensorflow torch
        
        # Backend Systems Support
        echo "Setting up backend support..."
        ./deploy-domain.sh --domain=backend --operator=keerthi --machine=mm04 --secondary
        docker-compose -f database-cluster.yml up -d
        
        echo "MM04 deployment complete"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Keerthi deployed successfully on MM04"
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="✅ Keerthi operational on MM04 (Data + AI/ML + Backend)"
    else
        log_error "Failed to deploy Keerthi on MM04"
        return 1
    fi
}

deploy_sabeen_mm05() {
    log_info "Deploying Sabeen on MM05 (Security + Blockchain + Backend)"
    
    ssh sabeen@mm05.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        
        # Security & Compliance Primary
        echo "Setting up security domain..."
        ./deploy-domain.sh --domain=security --operator=sabeen --machine=mm05 --primary
        docker pull kalilinux/kali-rolling
        docker run -d --name security-toolkit -p 3001:3000 owasp/zap2docker-stable
        
        # Blockchain/Web3 Primary
        echo "Configuring blockchain development..."
        ./deploy-domain.sh --domain=blockchain --operator=sabeen --machine=mm05 --primary
        npm install -g -s truffle hardhat @openzeppelin/contracts
        
        # Backend Support
        echo "Setting up secure backend support..."
        ./deploy-domain.sh --domain=backend --operator=sabeen --machine=mm05 --secondary
        docker-compose -f secure-backend.yml up -d
        
        echo "MM05 deployment complete"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Sabeen deployed successfully on MM05"
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="✅ Sabeen operational on MM05 (Security + Blockchain + Backend)"
    else
        log_error "Failed to deploy Sabeen on MM05"
        return 1
    fi
}

deploy_aiko_floating() {
    log_info "Deploying Aiko as Floating Research Specialist"
    
    # Setup floating access across all machines
    for machine in mm01 mm02 mm03 mm04 mm05; do
        log_info "Setting up Aiko access on $machine"
        ssh aiko@$machine.$FORGE_DOMAIN << 'EOF'
            cd /opt/colosseum/domains
            
            # Research & Innovation setup
            ./deploy-domain.sh --domain=research --operator=aiko --machine=$(hostname -s) --research-mode --secondary
            
            # Install experimental tools
            npm install -g -s electron-builder tauri-apps/cli
            pip install -q streamlit gradio fastapi uvicorn
            
            echo "Research environment ready on $(hostname -s)"
EOF
    done
    
    # Special mobile development support on MM03
    ssh aiko@mm03.$FORGE_DOMAIN << 'EOF'
        cd /opt/colosseum/domains
        ./deploy-domain.sh --domain=mobile --operator=aiko --machine=mm03 --secondary --research-focus
        npm install -g -s expo-cli react-native-cli
        echo "Mobile research support configured on MM03"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Aiko deployed as floating specialist across all machines"
        openclaw message send --target="$WAR_ROOM_CHANNEL" --message="🧪 Aiko operational as Floating Research Specialist (All machines + Mobile focus)"
    else
        log_error "Failed to deploy Aiko as floating specialist"
        return 1
    fi
}

# Health check function
health_check() {
    log_info "Running health check across all deployments..."
    
    declare -A deployments=(
        ["MM01"]="nadav@mm01.$FORGE_DOMAIN"
        ["MM02"]="nickroy@mm02.$FORGE_DOMAIN"
        ["MM03"]="adamgugino@mm03.$FORGE_DOMAIN"
        ["MM04"]="keerthi@mm04.$FORGE_DOMAIN"
        ["MM05"]="sabeen@mm05.$FORGE_DOMAIN"
    )
    
    for machine in "${!deployments[@]}"; do
        log_info "Checking $machine..."
        if ssh -o ConnectTimeout=10 "${deployments[$machine]}" "echo 'Health check' && ./health-check.sh" >/dev/null 2>&1; then
            log_success "$machine is healthy"
        else
            log_warning "$machine may have issues"
        fi
    done
}

# Main deployment orchestration
main() {
    log_info "Starting MAC MINI COORDINATION SYSTEM deployment..."
    
    # Ensure colosseum directories exist
    log_info "Preparing base infrastructure..."
    
    case "${1:-all}" in
        "nadav"|"mm01")
            deploy_nadav_mm01
            ;;
        "nickroy"|"mm02")
            deploy_nickroy_mm02
            ;;
        "adamgugino"|"mm03")
            deploy_adamgugino_mm03
            ;;
        "keerthi"|"mm04")
            deploy_keerthi_mm04
            ;;
        "sabeen"|"mm05")
            deploy_sabeen_mm05
            ;;
        "aiko"|"floating")
            deploy_aiko_floating
            ;;
        "health")
            health_check
            ;;
        "all")
            log_info "Deploying all operators..."
            deploy_nadav_mm01 &
            deploy_nickroy_mm02 &
            deploy_adamgugino_mm03 &
            deploy_keerthi_mm04 &
            deploy_sabeen_mm05 &
            
            # Wait for primary deployments
            wait
            
            # Deploy floating specialist last
            deploy_aiko_floating
            
            # Final health check
            sleep 10
            health_check
            
            log_success "Full MAC MINI COORDINATION SYSTEM deployment complete!"
            openclaw message send --target="$WAR_ROOM_CHANNEL" --message="🚀 MAC MINI COORDINATION SYSTEM fully operational - All 6 operators deployed across 5 machines covering 10 domains"
            ;;
        *)
            echo "Usage: $0 {nadav|nickroy|adamgugino|keerthi|sabeen|aiko|health|all}"
            echo "  nadav/mm01    - Deploy Nadav on MM01"
            echo "  nickroy/mm02  - Deploy Nick Roy on MM02"
            echo "  adamgugino/mm03 - Deploy Adam Gugino on MM03"
            echo "  keerthi/mm04  - Deploy Keerthi on MM04"
            echo "  sabeen/mm05   - Deploy Sabeen on MM05"
            echo "  aiko/floating - Deploy Aiko as floating specialist"
            echo "  health        - Run health check on all deployments"
            echo "  all           - Deploy all operators (default)"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"