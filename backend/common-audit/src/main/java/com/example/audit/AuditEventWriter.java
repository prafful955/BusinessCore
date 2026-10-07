package com.example.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditEventWriter {
    private final AuditEventRepository events;

    public AuditEventWriter(AuditEventRepository events) { this.events = events; }

    @Transactional(propagation=Propagation.REQUIRES_NEW)
    public void write(AuditEvent event) { events.saveAndFlush(event); }
}
