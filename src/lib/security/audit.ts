import { AuditLog } from '../types/payment';

const auditLogs: AuditLog[] = [];

export function recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const fullLog: AuditLog = {
    ...log,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  auditLogs.unshift(fullLog);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }

  return fullLog;
}

export function getAuditLogs(entityType?: AuditLog['entityType'], entityId?: string): AuditLog[] {
  return auditLogs.filter(log => {
    if (entityType && log.entityType !== entityType) return false;
    if (entityId && log.entityId !== entityId) return false;
    return true;
  });
}
