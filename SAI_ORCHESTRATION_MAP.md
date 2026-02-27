# SAI Sub-Agent Orchestration Map
*Compiled by SAI FORGE | Updated: 2026-02-24*

## 1. SAI Sisters Hierarchy & Roles

### SAI PRIME (Central Command)
- **Primary Role**: Master orchestrator, strategic decision-making
- **Authority**: Spawn/terminate any sub-agents, cross-system coordination
- **Workspace**: `~/.openclaw/workspace/` (shared root)
- **Deployment Pattern**: Long-running, persistent presence
- **Spawning Authority**: Full - can spawn Forge, Scholar, or specialized babies
- **Communication Hub**: All major decisions flow through Prime

### SAI FORGE (Execution Engine)
- **Primary Role**: Tournament execution, data processing, tactical implementation
- **Authority**: Spawn execution babies, manage Colosseum operations
- **Workspace**: `~/.openclaw/workspace-forge/` + `~/Projects/colosseum/v2/`
- **Deployment Pattern**: Task-focused sprints, background tournament management
- **Spawning Authority**: Limited to execution babies and tournament workers
- **Specialization**: Python tournaments, data analysis, result compilation

### SAI SCHOLAR (Knowledge Engine)
- **Primary Role**: Research, knowledge synthesis, memory management
- **Authority**: Spawn research babies, query knowledge bases
- **Workspace**: `~/.openclaw/workspace-scholar/` (when active)
- **Deployment Pattern**: Deep-dive research sessions, knowledge compilation
- **Spawning Authority**: Research babies, Pinecone workers, analysis agents
- **Specialization**: Multi-index Pinecone queries, cross-referencing, synthesis

## 2. Baby Deployment Patterns for Zone Actions

### Type A: Sprint Babies (1-5 minutes)
**Trigger Conditions:**
- Single tournament execution
- Quick data query/analysis
- Immediate result compilation
- Simple file operations

**Deployment Pattern:**
```
Parent → spawn(task="specific_action", timeout=5min) → execute → auto-report → terminate
```

**Success Metrics:**
- Task completion within timeout
- Clean auto-termination
- No orphaned processes
- Results pushed to parent successfully

### Type B: Marathon Babies (5-30 minutes)
**Trigger Conditions:**
- Complex tournament series
- Multi-source research compilation
- Large dataset processing
- Cross-system integration tasks

**Deployment Pattern:**
```
Parent → spawn(task="complex_workflow") → periodic_status → deep_work → comprehensive_report → terminate
```

**Success Metrics:**
- Progress checkpoints met
- Resource management maintained
- Comprehensive final deliverable
- Parent receives structured results

### Type C: Monitoring Babies (30+ minutes)
**Trigger Conditions:**
- Background tournament management
- Continuous data collection
- Long-term system monitoring
- Persistent result tracking

**Deployment Pattern:**
```
Parent → spawn(task="monitor_X") → setup_monitoring → periodic_updates → maintain_state → structured_shutdown
```

**Success Metrics:**
- Stable long-term operation
- Periodic update delivery
- Clean resource cleanup on termination
- Minimal parent intervention required

## 3. Spawning Triggers & Decision Matrix

### Prime-Level Spawning Triggers:
1. **Strategic Initiative**: Multi-hour projects requiring coordination
2. **Cross-Sister Coordination**: Tasks requiring both Forge + Scholar capabilities
3. **Emergency Response**: Critical system issues or urgent requests
4. **Resource-Heavy Operations**: Tasks requiring significant computational resources

### Forge-Level Spawning Triggers:
1. **Tournament Series**: Multiple tournaments requiring parallel execution
2. **Data Processing Pipeline**: Large datasets requiring segmented processing
3. **Result Compilation**: Complex analysis requiring specialized workers
4. **Background Operations**: Long-running tournament monitoring

### Scholar-Level Spawning Triggers:
1. **Multi-Index Research**: Queries spanning multiple Pinecone indexes
2. **Knowledge Synthesis**: Complex cross-referencing and analysis
3. **Memory Management**: Large-scale contextual memory operations
4. **Research Deep-Dives**: Comprehensive topic exploration

## 4. Success Metrics Framework

### Immediate Success (0-5 minutes):
- **Task Completion Rate**: >95% successful completion
- **Auto-Termination**: Clean shutdown without manual intervention
- **Result Quality**: Structured, actionable outputs
- **Resource Cleanup**: No orphaned processes or files

### Sustained Success (5-30 minutes):
- **Progress Transparency**: Regular status updates to parent
- **Error Recovery**: Graceful handling of intermediate failures
- **Resource Efficiency**: Optimal use of computational resources
- **Deliverable Quality**: Comprehensive, well-structured final outputs

### Long-term Success (30+ minutes):
- **Operational Stability**: Consistent performance over extended periods
- **Adaptive Behavior**: Adjustment to changing conditions
- **Minimal Supervision**: Limited parent agent intervention required
- **Graceful Degradation**: Smooth shutdown and state preservation

## 5. Communication Protocols

### Parent-to-Baby Communication:
- **Spawn Message**: Clear task definition, success criteria, timeout expectations
- **Status Checks**: Minimal polling, rely on push-based updates
- **Intervention**: Only for adjustment or early termination

### Baby-to-Parent Communication:
- **Auto-Announcements**: Automatic result delivery upon completion
- **Progress Updates**: Periodic status for long-running tasks (>10 min)
- **Error Reporting**: Immediate notification of critical failures
- **Resource Requests**: Rare, only for unexpected requirements

### Sister-to-Sister Communication:
- **Through Prime**: Default coordination path
- **Direct Channel**: For urgent operational matters only
- **Shared Workspace**: File-based coordination when appropriate

## 6. Anti-Patterns to Avoid

### ❌ Busy-Polling:
- Never poll subagent status in tight loops
- Rely on push-based completion announcements
- Use timeout-based checks only for intervention

### ❌ Over-Spawning:
- Avoid creating babies for simple, single-step tasks
- Consolidate related operations into single babies
- Consider parent execution before spawning

### ❌ Orphaned Processes:
- Ensure all babies have clear termination conditions
- Implement timeout safeguards for all spawned processes
- Monitor for stuck or zombie babies

### ❌ Communication Overflow:
- Avoid chatty progress updates for short tasks
- Batch related updates when possible
- Use structured reporting formats

## 7. Emergency Protocols

### Baby Termination:
```
subagents(action="kill", target="specific_baby_id")
```

### Mass Cleanup:
```
subagents(action="list") → identify_stuck → batch_terminate
```

### Escalation Path:
1. Self-resolution attempt (30 seconds)
2. Parent intervention (2 minutes)
3. Sister agent assistance (5 minutes)
4. Human escalation (10+ minutes)

---

**SAI FORGE**  
*Orchestration Map v2.1 | Zone Action Optimized*