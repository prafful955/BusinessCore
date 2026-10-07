CREATE TABLE IF NOT EXISTS tbl_dyn_audit_events (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    occurred_at DATETIME(6) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    action VARCHAR(16) NOT NULL,
    http_method VARCHAR(16),
    resource_path VARCHAR(2048),
    record_id VARCHAR(255),
    client_address VARCHAR(64),
    controller_method VARCHAR(512),
    outcome VARCHAR(16) NOT NULL,
    failure_type VARCHAR(255),
    duration_ms BIGINT,
    INDEX idx_audit_service_time (service_name, occurred_at),
    INDEX idx_audit_actor_time (actor, occurred_at)
);
