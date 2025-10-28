import { useState } from 'react';
import { useGymRequests, useApproveGymRequest, useRejectGymRequest, useDeleteGymRequest } from '../hooks';
import { Card, Loading, Button } from './index';
import { GymRequest } from '@/domain';
import Modal from './ui/Modal';

export const GymRequestsList = () => {
  const { data: requests, isLoading } = useGymRequests('pending');
  const approveMutation = useApproveGymRequest();
  const rejectMutation = useRejectGymRequest();
  const deleteMutation = useDeleteGymRequest();

  const [selectedRequest, setSelectedRequest] = useState<GymRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (id: number, name: string) => {
    if (window.confirm(`¿Aprobar solicitud de "${name}"? Se creará el gimnasio automáticamente.`)) {
      try {
        await approveMutation.mutateAsync(id);
        alert('Solicitud aprobada y gimnasio creado exitosamente');
      } catch (error) {
        console.error('Error al aprobar solicitud:', error);
        alert('Error al aprobar la solicitud');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Debe proporcionar una razón para el rechazo');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedRequest.id_gym_request,
        reason: rejectionReason
      });
      alert('Solicitud rechazada exitosamente');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      alert('Error al rechazar la solicitud');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Eliminar solicitud de "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Solicitud eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        alert('Error al eliminar la solicitud');
      }
    }
  };

  const openRejectModal = (request: GymRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  if (isLoading) return <Loading fullPage />;

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-lg text-text-muted">No hay solicitudes pendientes</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-6">
        Solicitudes Pendientes ({requests.length})
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <Card key={request.id_gym_request}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-text dark:text-text-dark">
                    {request.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    Recibida: {new Date(request.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request.id_gym_request, request.name)}
                    variant="primary"
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✓ Aprobar
                  </Button>
                  <Button
                    onClick={() => openRejectModal(request)}
                    variant="secondary"
                    disabled={rejectMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    ✗ Rechazar
                  </Button>
                  <Button
                    onClick={() => handleDelete(request.id_gym_request, request.name)}
                    variant="secondary"
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-text dark:text-text-dark mb-2">Ubicación</h4>
                  <p className="text-text-muted">
                    <strong>Ciudad:</strong> {request.city}
                  </p>
                  <p className="text-text-muted">
                    <strong>Dirección:</strong> {request.address}
                  </p>
                  {request.latitude && request.longitude && (
                    <p className="text-text-muted">
                      <strong>Coordenadas:</strong> {request.latitude}, {request.longitude}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-text dark:text-text-dark mb-2">Contacto</h4>
                  {request.email && (
                    <p className="text-text-muted">
                      <strong>Email:</strong> {request.email}
                    </p>
                  )}
                  {request.phone && (
                    <p className="text-text-muted">
                      <strong>Teléfono:</strong> {request.phone}
                    </p>
                  )}
                  {request.website && (
                    <p className="text-text-muted">
                      <strong>Web:</strong>{' '}
                      <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {request.website}
                      </a>
                    </p>
                  )}
                </div>

                {request.description && (
                  <div className="col-span-full">
                    <h4 className="font-semibold text-text dark:text-text-dark mb-2">Descripción</h4>
                    <p className="text-text-muted">{request.description}</p>
                  </div>
                )}

                {request.equipment && request.equipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-text dark:text-text-dark mb-2">Equipment / Tipos de Entrenamiento</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.equipment.map((type, idx) => (
                        <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(request.monthly_price || request.weekly_price || request.daily_price) && (
                  <div>
                    <h4 className="font-semibold text-text dark:text-text-dark mb-2">Precios</h4>
                    {request.monthly_price && (
                      <p className="text-text-muted">
                        <strong>Mensual:</strong> ${request.monthly_price}
                      </p>
                    )}
                    {request.weekly_price && (
                      <p className="text-text-muted">
                        <strong>Semanal:</strong> ${request.weekly_price}
                      </p>
                    )}
                    {request.daily_price && (
                      <p className="text-text-muted">
                        <strong>Diario:</strong> ${request.daily_price}
                      </p>
                    )}
                  </div>
                )}

                {request.amenities && request.amenities.length > 0 && (
                  <div className="col-span-full">
                    <h4 className="font-semibold text-text dark:text-text-dark mb-2">Amenidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.instagram || request.facebook ? (
                  <div>
                    <h4 className="font-semibold text-text dark:text-text-dark mb-2">Redes Sociales</h4>
                    {request.instagram && (
                      <p className="text-text-muted">
                        <strong>Instagram:</strong> @{request.instagram}
                      </p>
                    )}
                    {request.facebook && (
                      <p className="text-text-muted">
                        <strong>Facebook:</strong> {request.facebook}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && selectedRequest && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
          }}
          title={`Rechazar solicitud de "${selectedRequest.name}"`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                Razón del rechazo (obligatorio)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-text dark:text-text-dark"
                rows={4}
                placeholder="Explique por qué se rechaza esta solicitud..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
