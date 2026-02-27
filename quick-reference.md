# MAC MINI COORDINATION SYSTEM - QUICK REFERENCE

## 🚀 INSTANT DEPLOYMENT

```bash
# Deploy all operators across all machines
./deployment-automation.sh all

# Deploy specific operator
./deployment-automation.sh nadav      # MM01: AI/ML + Backend + Performance
./deployment-automation.sh nickroy    # MM02: DevOps + Security + Data
./deployment-automation.sh adamgugino # MM03: Frontend + Mobile + Testing  
./deployment-automation.sh keerthi    # MM04: Data + AI/ML + Backend
./deployment-automation.sh sabeen     # MM05: Security + Blockchain + Backend
./deployment-automation.sh aiko       # Floating: Research + Innovation

# Health check
./deployment-automation.sh health
```

## 📊 MONITORING

```bash
# Live dashboard (auto-refreshing)
python3 coordination-dashboard.py

# One-time status check
python3 coordination-dashboard.py once

# Export status to JSON
python3 coordination-dashboard.py export
```

## 🎯 OPERATOR-DOMAIN ASSIGNMENTS

| Operator | Machine | Primary Domains | Secondary Backup |
|----------|---------|-----------------|------------------|
| **Nadav** | MM01 | AI/ML, Backend, Performance | Keerthi |
| **Nick Roy** | MM02 | DevOps, Security, Data Engineering | Sabeen |
| **Adam Gugino** | MM03 | Frontend, Mobile, Testing | Aiko |
| **Keerthi** | MM04 | Data Engineering, AI/ML, Backend | Nadav |
| **Sabeen** | MM05 | Security, Blockchain, Backend | Nick Roy |
| **Aiko** | Floating | Research, Innovation, Mobile | All machines |

## 🌐 DOMAIN COLOSSEUM MAP

1. **AI/ML Development** → Nadav (MM01), Keerthi (MM04)
2. **Backend Systems** → Nadav (MM01), Keerthi (MM04), Sabeen (MM05) 
3. **Frontend/UX** → Adam Gugino (MM03)
4. **DevOps/Infrastructure** → Nick Roy (MM02)
5. **Data Engineering** → Keerthi (MM04), Nick Roy (MM02)
6. **Security & Compliance** → Nick Roy (MM02), Sabeen (MM05)
7. **Mobile Development** → Adam Gugino (MM03), Aiko (Floating)
8. **Blockchain/Web3** → Sabeen (MM05)
9. **Research & Innovation** → Aiko (Floating)
10. **Performance & Testing** → Nadav (MM01), Adam Gugino (MM03)

## 🔧 EMERGENCY COMMANDS

```bash
# Quick machine access
ssh nadav@mm01.forge.local
ssh nickroy@mm02.forge.local  
ssh adamgugino@mm03.forge.local
ssh keerthi@mm04.forge.local
ssh sabeen@mm05.forge.local
ssh aiko@{mm01,mm02,mm03,mm04,mm05}.forge.local

# Domain failover
./load-balancer.sh --failover --from=mm01 --to=mm04 --domain=ai-ml

# Emergency stop all
for machine in mm01 mm02 mm03 mm04 mm05; do
  ssh operator@$machine.forge.local "sudo systemctl stop colosseum"
done

# Emergency restart specific domain
ssh operator@machine.forge.local "./restart-domain.sh --domain=security --force"
```

## 📱 WAR ROOM NOTIFICATIONS

```bash
# Send status to war room
openclaw message send --target="war-room" --message="🔍 Manual system check complete"

# Send alert
openclaw message send --target="war-room" --message="⚠️ MM03 requires attention - Adam Gugino"

# Send deployment complete
openclaw message send --target="war-room" --message="✅ Full deployment successful - All operators online"
```

## 🧪 AIKO'S FLOATING ACCESS

Aiko has research access across all machines:

```bash
# Check Aiko's research environments
for machine in mm01 mm02 mm03 mm04 mm05; do
  ssh aiko@$machine.forge.local "echo 'Research env on' $(hostname) && ls /opt/colosseum/research/"
done

# Deploy experimental tech on specific machine
ssh aiko@mm03.forge.local "./deploy-experimental.sh --tech=ar-vr --target=mobile-integration"
```

## 📈 LOAD BALANCING

```bash
# Check current load across all machines
./check-load.sh --all-machines --json

# Auto-balance if any machine >80% load
./auto-balance.sh --threshold=80 --redistribute

# Manual domain migration
./migrate-domain.sh --domain=ai-ml --from=mm01 --to=mm04 --reason="maintenance"
```

## 🔍 DEBUGGING

```bash
# Check specific domain logs
ssh operator@machine.forge.local "tail -f /var/log/colosseum/domain-ai-ml.log"

# Domain health check
./domain-health.sh --domain=security --machine=mm05 --verbose

# Network connectivity test
./network-test.sh --all-machines --connectivity-matrix
```

## 💾 BACKUP & RECOVERY

```bash
# Backup current assignments
cp mac_mini_coordination_matrix.md assignments_backup_$(date +%Y%m%d).md

# Export current state
python3 coordination-dashboard.py export

# Restore from backup
./restore-assignments.sh --from=assignments_backup_20260225.md --confirm
```

## 🎮 COLOSSEUM TOURNAMENT COMMANDS

```bash
# Start cross-domain tournament
./tournament.sh --domains="ai-ml,backend,frontend" --operators="nadav,keerthi,adamgugino"

# Monitor tournament progress  
./tournament-status.sh --live --war-room-updates

# End tournament and collect results
./tournament-end.sh --export-results --post-to-war-room
```

## ⚡ OPTIMIZATION METRICS

- **Domain Coverage**: 100% (10/10 domains assigned)
- **Redundancy Factor**: 1.2x (critical domains have backup operators)
- **Skill Utilization**: 95%+ (primary skills → primary assignments)
- **Response Time**: <5min domain switching
- **Innovation Allocation**: 20% time for research (Aiko + others)

## 🚨 ALERTS & THRESHOLDS

- **CPU Load** >80% → Auto-failover triggered
- **Memory Usage** >85% → Warning to war room  
- **Disk Space** <10GB → Critical alert
- **Network Latency** >100ms → Connection warning
- **Domain Downtime** >5min → Emergency protocol activated