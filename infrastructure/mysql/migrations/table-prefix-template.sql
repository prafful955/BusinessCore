-- Stop services and back up the selected database before executing.
-- Run once for EACH service database containing legacy tables.
-- Existing rows are preserved. If both old and new table names exist, stop and reconcile them first.
-- This script is NOT automatically executed by Docker or application startup.
DELIMITER //
CREATE PROCEDURE businesscore_rename_table(IN old_name VARCHAR(128), IN new_name VARCHAR(128))
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=old_name) THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=new_name) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Both legacy and prefixed tables exist; reconcile before migration';
        END IF;
        SET @migration_sql=CONCAT('RENAME TABLE `',old_name,'` TO `',new_name,'`');
        PREPARE migration_statement FROM @migration_sql;
        EXECUTE migration_statement;
        DEALLOCATE PREPARE migration_statement;
    END IF;
END//
CREATE PROCEDURE businesscore_audit_column(IN table_name_p VARCHAR(128), IN column_name_p VARCHAR(128), IN definition_p VARCHAR(128))
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=table_name_p)
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=table_name_p AND column_name=column_name_p) THEN
        SET @migration_sql=CONCAT('ALTER TABLE `',table_name_p,'` ADD COLUMN `',column_name_p,'` ',definition_p);
        PREPARE migration_statement FROM @migration_sql;
        EXECUTE migration_statement;
        DEALLOCATE PREPARE migration_statement;
    END IF;
END//
DELIMITER ;
CALL businesscore_rename_table('auth_sessions', 'tbl_dyn_auth_sessions');
CALL businesscore_rename_table('business_document_lines', 'tbl_dyn_business_document_lines');
CALL businesscore_rename_table('business_documents', 'tbl_dyn_business_documents');
CALL businesscore_rename_table('customers', 'tbl_dyn_customers');
CALL businesscore_rename_table('dashboard_entries', 'tbl_dyn_dashboard_entries');
CALL businesscore_rename_table('employee_roles', 'tbl_dyn_employee_roles');
CALL businesscore_rename_table('employees', 'tbl_dyn_employees');
CALL businesscore_rename_table('inventory_document_lines', 'tbl_dyn_inventory_document_lines');
CALL businesscore_rename_table('inventory_documents', 'tbl_dyn_inventory_documents');
CALL businesscore_rename_table('lookup_values', 'tbl_dyn_lookup_values');
CALL businesscore_rename_table('orders', 'tbl_dyn_orders');
CALL businesscore_rename_table('organization_units', 'tbl_dyn_organization_units');
CALL businesscore_rename_table('product_categories', 'tbl_dyn_product_categories');
CALL businesscore_rename_table('products', 'tbl_dyn_products');
CALL businesscore_rename_table('role_permissions', 'tbl_dyn_role_permissions');
CALL businesscore_rename_table('stock_balances', 'tbl_dyn_stock_balances');
CALL businesscore_rename_table('stock_movements', 'tbl_dyn_stock_movements');
CALL businesscore_rename_table('users', 'tbl_dyn_users');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_auth_sessions', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_business_documents', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_customers', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_customers', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_customers', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_customers', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_customers', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_customers', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_customers', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_customers', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_dashboard_entries', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_employee_roles', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_employees', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_employees', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_employees', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_employees', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_employees', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_employees', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_employees', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_employees', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_lookup_values', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_orders', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_orders', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_orders', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_orders', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_orders', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_orders', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_orders', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_orders', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_organization_units', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_product_categories', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_products', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_products', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_products', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_products', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_products', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_products', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_products', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_products', 'last_modified_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_users', 'audit_created_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_users', 'audit_modified_at', 'DATETIME(6)');
CALL businesscore_audit_column('tbl_dyn_users', 'created_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_users', 'created_service', 'VARCHAR(128)');
CALL businesscore_audit_column('tbl_dyn_users', 'last_action', 'VARCHAR(16)');
CALL businesscore_audit_column('tbl_dyn_users', 'last_client_address', 'VARCHAR(64)');
CALL businesscore_audit_column('tbl_dyn_users', 'last_modified_by', 'VARCHAR(255)');
CALL businesscore_audit_column('tbl_dyn_users', 'last_modified_service', 'VARCHAR(128)');

DROP PROCEDURE businesscore_audit_column;
DROP PROCEDURE businesscore_rename_table;
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
