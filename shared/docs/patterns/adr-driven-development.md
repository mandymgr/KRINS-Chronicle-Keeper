# ADR-Driven Development Pattern

## When to Use
Use this pattern when making architectural decisions that need to be documented, tracked, and communicated across the team. Essential for:
- Major technology choices
- System design decisions
- API design patterns
- Database architecture decisions
- Security policy implementations

## Implementation
1. **Create ADR**: Use `SHARED/tools/adr_new.sh` to create new ADRs
2. **Document Context**: Clearly explain the problem and constraints
3. **List Options**: Present considered alternatives with pros/cons
4. **Make Decision**: Choose the best option with rationale
5. **Track Consequences**: Monitor outcomes and update if needed

## Quality Gates
- ADR follows the established template
- Decision is technically sound
- Alternatives were properly evaluated
- Consequences are clearly documented
- Stakeholders have reviewed and approved

## Anti-patterns
- Making architectural decisions without documentation
- Creating ADRs after implementation is complete
- Not considering alternatives
- Ignoring stakeholder input
- Failing to update outdated decisions