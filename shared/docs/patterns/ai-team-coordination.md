# AI Team Coordination Pattern

## When to Use
Use this pattern for coordinating multiple AI specialists working on complex development tasks. Essential for:
- Large feature implementations
- System-wide refactoring
- Multi-component integrations
- Quality assurance processes
- Performance optimization efforts

## Implementation
1. **Define Specialists**: Backend, Frontend, Security, Testing, Performance
2. **Task Distribution**: Assign work based on specialist expertise
3. **Communication Protocol**: Use GitHub webhooks and MCP for coordination
4. **Progress Tracking**: Implement TodoWrite for task management
5. **Quality Gates**: Each specialist validates their domain

## Quality Gates
- All specialists have clear task assignments
- Communication channels are established
- Progress is tracked and visible
- Quality standards are enforced
- Integration testing passes

## Anti-patterns
- Single developer handling all aspects
- Poor communication between specialists
- Overlapping or conflicting work
- No quality gates or validation
- Lack of progress visibility