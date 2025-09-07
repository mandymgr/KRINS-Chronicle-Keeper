# Repository Pattern

## Description
Java repository pattern with JPA integration, specification pattern, and clean separation of concerns.

## Usage
Use this pattern for all data access operations to ensure consistent database interaction and testability.

## Code

```java
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
    
    // Custom query methods
    List<T> findBySpecification(Specification<T> spec);
    
    Page<T> findBySpecification(Specification<T> spec, Pageable pageable);
    
    Optional<T> findOneBySpecification(Specification<T> spec);
}

@Repository
@Transactional(readOnly = true)
public abstract class AbstractRepository<T, ID> implements BaseRepository<T, ID> {
    
    @PersistenceContext
    protected EntityManager entityManager;
    
    protected final Class<T> entityClass;
    
    protected AbstractRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
    }
    
    @Override
    public List<T> findBySpecification(Specification<T> spec) {
        TypedQuery<T> query = getQuery(spec, Sort.unsorted());
        return query.getResultList();
    }
    
    @Override
    public Page<T> findBySpecification(Specification<T> spec, Pageable pageable) {
        TypedQuery<T> query = getQuery(spec, pageable.getSort());
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        
        List<T> content = query.getResultList();
        long total = executeCountQuery(getCountQuery(spec));
        
        return PageableExecutionUtils.getPage(content, pageable, () -> total);
    }
    
    @Override
    public Optional<T> findOneBySpecification(Specification<T> spec) {
        TypedQuery<T> query = getQuery(spec, Sort.unsorted());
        query.setMaxResults(2);
        
        List<T> results = query.getResultList();
        
        if (results.isEmpty()) {
            return Optional.empty();
        } else if (results.size() == 1) {
            return Optional.of(results.get(0));
        } else {
            throw new IncorrectResultSizeDataAccessException(1, results.size());
        }
    }
    
    protected TypedQuery<T> getQuery(Specification<T> spec, Sort sort) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> query = builder.createQuery(entityClass);
        Root<T> root = applySpecificationToCriteria(spec, query, builder);
        
        if (sort.isSorted()) {
            query.orderBy(toOrders(sort, root, builder));
        }
        
        return entityManager.createQuery(query);
    }
    
    protected TypedQuery<Long> getCountQuery(Specification<T> spec) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<T> root = applySpecificationToCriteria(spec, query, builder);
        query.select(builder.count(root));
        
        return entityManager.createQuery(query);
    }
    
    private Root<T> applySpecificationToCriteria(
            Specification<T> spec, 
            CriteriaQuery<?> query, 
            CriteriaBuilder builder) {
        
        Root<T> root = query.from(entityClass);
        if (spec != null) {
            Predicate predicate = spec.toPredicate(root, query, builder);
            if (predicate != null) {
                query.where(predicate);
            }
        }
        return root;
    }
    
    private List<Order> toOrders(Sort sort, Root<T> root, CriteriaBuilder cb) {
        return sort.stream()
                .map(order -> {
                    Expression<?> expression = root.get(order.getProperty());
                    return order.isAscending() 
                        ? cb.asc(expression) 
                        : cb.desc(expression);
                })
                .collect(Collectors.toList());
    }
    
    private Long executeCountQuery(TypedQuery<Long> query) {
        List<Long> totals = query.getResultList();
        Long total = 0L;
        for (Long element : totals) {
            total += element == null ? 0 : element;
        }
        return total;
    }
}
```

## Related ADRs
- ADR-0006: JPA and database access patterns