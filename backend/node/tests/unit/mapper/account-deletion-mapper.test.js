const { toAccountDeletionResponse } = require('../../../services/mappers/user.mappers');

describe('account-deletion-mapper', () => {
  describe('toAccountDeletionResponse', () => {
    it('transforma una solicitud de eliminación completa', () => {
      const deletionRequest = {
        id_request: 1,
        id_account: 100,
        reason: 'Ya no uso la aplicación',
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: null,
        completed_at: null,
        metadata: {
          grace_period_days: 30,
          requested_via: 'SELF_SERVICE',
        },
        can_cancel: true,
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result).toEqual({
        id_request: 1,
        id_account: 100,
        reason: 'Ya no uso la aplicación',
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: null,
        completed_at: null,
        metadata: {
          grace_period_days: 30,
          requested_via: 'SELF_SERVICE',
        },
        can_cancel: true,
      });
    });

    it('transforma una solicitud cancelada', () => {
      const deletionRequest = {
        id_request: 2,
        id_account: 200,
        reason: 'Cambié de opinión',
        status: 'CANCELLED',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: '2025-11-02T12:00:00.000Z',
        completed_at: null,
        metadata: {
          grace_period_days: 30,
          cancelled_at: '2025-11-02T12:00:00.000Z',
        },
        can_cancel: false,
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result).toEqual({
        id_request: 2,
        id_account: 200,
        reason: 'Cambié de opinión',
        status: 'CANCELLED',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: '2025-11-02T12:00:00.000Z',
        completed_at: null,
        metadata: {
          grace_period_days: 30,
          cancelled_at: '2025-11-02T12:00:00.000Z',
        },
        can_cancel: false,
      });
    });

    it('transforma una solicitud completada', () => {
      const deletionRequest = {
        id_request: 3,
        id_account: 300,
        reason: null,
        status: 'COMPLETED',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: null,
        completed_at: '2025-12-02T00:00:00.000Z',
        metadata: {
          grace_period_days: 30,
        },
        can_cancel: false,
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result).toEqual({
        id_request: 3,
        id_account: 300,
        reason: null,
        status: 'COMPLETED',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: null,
        completed_at: '2025-12-02T00:00:00.000Z',
        metadata: {
          grace_period_days: 30,
        },
        can_cancel: false,
      });
    });

    it('maneja solicitud sin metadata', () => {
      const deletionRequest = {
        id_request: 4,
        id_account: 400,
        reason: 'Test',
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        cancelled_at: null,
        completed_at: null,
        metadata: null,
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.metadata).toBeNull();
    });

    it('maneja solicitud sin reason', () => {
      const deletionRequest = {
        id_request: 5,
        id_account: 500,
        reason: null,
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.reason).toBeNull();
    });

    it('calcula can_cancel como true cuando status es PENDING', () => {
      const deletionRequest = {
        id_request: 6,
        id_account: 600,
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.can_cancel).toBe(true);
    });

    it('calcula can_cancel como false cuando status no es PENDING', () => {
      const deletionRequest = {
        id_request: 7,
        id_account: 700,
        status: 'COMPLETED',
        scheduled_deletion_date: '2025-12-02',
        requested_at: '2025-11-02T10:00:00.000Z',
        completed_at: '2025-12-02T00:00:00.000Z',
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.can_cancel).toBe(false);
    });

    it('maneja campos con nombres alternativos (camelCase)', () => {
      const deletionRequest = {
        idRequest: 8,
        idAccount: 800,
        status: 'PENDING',
        scheduledDeletionDate: '2025-12-02',
        requestedAt: '2025-11-02T10:00:00.000Z',
        cancelledAt: null,
        completedAt: null,
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.id_request).toBe(8);
      expect(result.id_account).toBe(800);
      expect(result.scheduled_deletion_date).toBe('2025-12-02');
    });

    it('normaliza fechas ISO a formato correcto', () => {
      const deletionRequest = {
        id_request: 9,
        id_account: 900,
        status: 'PENDING',
        scheduled_deletion_date: new Date('2025-12-02'),
        requested_at: new Date('2025-11-02T10:00:00.000Z'),
      };

      const result = toAccountDeletionResponse(deletionRequest);

      expect(result.scheduled_deletion_date).toBe('2025-12-02');
      expect(result.requested_at).toBe('2025-11-02T10:00:00.000Z');
    });

    it('retorna null cuando la entrada es null', () => {
      const result = toAccountDeletionResponse(null);
      expect(result).toBeNull();
    });

    it('retorna null cuando la entrada es undefined', () => {
      const result = toAccountDeletionResponse(undefined);
      expect(result).toBeNull();
    });

    it('maneja todos los estados posibles', () => {
      const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

      statuses.forEach((status) => {
        const deletionRequest = {
          id_request: 1,
          id_account: 100,
          status,
          scheduled_deletion_date: '2025-12-02',
          requested_at: '2025-11-02T10:00:00.000Z',
        };

        const result = toAccountDeletionResponse(deletionRequest);

        expect(result.status).toBe(status);
        expect(result.can_cancel).toBe(status === 'PENDING');
      });
    });
  });
});
