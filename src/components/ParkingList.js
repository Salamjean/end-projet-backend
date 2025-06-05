import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ParkingList = () => {
  const [parkings, setParkings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parkings');
      setParkings(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des parkings:', error);
    }
  };

  const handleReserve = (parking) => {
    setSelectedParking(parking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedParking(null);
  };

  const handleConfirmReservation = async () => {
    // Logique de réservation à implémenter
    handleCloseModal();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Liste des Parkings</h2>
      <Row>
        {parkings.map((parking) => (
          <Col key={parking._id} md={4} className="mb-4">
            <Card>
              {parking.image && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000/uploads/${parking.image}`}
                  alt={parking.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <Card.Title>{parking.name}</Card.Title>
                <Card.Text>
                  <strong>Adresse:</strong> {parking.address}<br />
                  <strong>Places disponibles:</strong> {parking.availableSpots}/{parking.totalSpots}<br />
                  <strong>Prix/heure:</strong> {parking.pricePerHour}€<br />
                  {parking.description && (
                    <>
                      <strong>Description:</strong> {parking.description}
                    </>
                  )}
                </Card.Text>
                {user && (
                  <Button
                    variant="primary"
                    onClick={() => handleReserve(parking)}
                    disabled={parking.availableSpots === 0}
                  >
                    {parking.availableSpots === 0 ? 'Complet' : 'Réserver'}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de réservation */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Réserver une place</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParking && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Parking</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedParking.name}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedParking.address}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prix par heure</Form.Label>
                <Form.Control
                  type="text"
                  value={`${selectedParking.pricePerHour}€`}
                  disabled
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirmReservation}>
            Confirmer la réservation
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ParkingList; 